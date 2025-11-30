import { InferenceClient } from "@huggingface/inference";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { Db } from "mongodb";
import { z } from "zod";

interface CallFAQAgentParams {
  db: Db;
  query: string;
  threadId: string;
}

interface FAQLookupResult {
  results: any[];
  searchType: "text" | "semantic";
  query: string;
  count: number;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function callFAQAgent({
  db,
  query,
  threadId,
}: CallFAQAgentParams) {
  try {
    const collection = db.collection("faq");

    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    });

    const faqLookupTool = tool(
      async ({ query, n = 5 }): Promise<string> => {
        try {
          console.log("FAQ lookup tool called with query:", query);

          // Simple text search on FAQ collection
          const textResults = await collection
            .find({
              $or: [
                { question: { $regex: query, $options: "i" } },
                { answer: { $regex: query, $options: "i" } },
                { tags: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
              ],
            })
            .limit(n)
            .toArray();

          console.log(`Text search returned ${textResults.length} FAQ results`);

          // Format results to be more readable
          const formattedResults = textResults.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            tags: faq.tags,
          }));

          const result: FAQLookupResult = {
            results: formattedResults,
            searchType: "text",
            query: query,
            count: formattedResults.length,
          };

          return formattedResults
            .map(
              (faq, i) => `FAQ ${i + 1}:\nQ: ${faq.question}\nA: ${faq.answer}`
            )
            .join("\n\n");
        } catch (error: any) {
          console.error("Error in FAQ lookup:", error);
          return JSON.stringify({
            error: "Failed to search FAQ",
            details: error.message,
            query: query,
          });
        }
      },
      {
        name: "faq_lookup",
        description:
          "Searches the FAQ database for answers to common questions about laboratory services, hours, booking, payments, and general information. Use this for any general inquiries.",
        schema: z.object({
          query: z.string().describe("The search query"),
          n: z
            .number()
            .optional()
            .default(5)
            .describe("Number of results to return"),
        }),
      }
    );

    const labResultLookupTool = tool(
      async ({
        query,
        patientName,
        testCode,
        limit = 5,
      }: {
        query: string;
        patientName?: string;
        testCode?: string;
        limit?: number;
      }): Promise<string> => {
        try {
          console.log("Lab result lookup tool called with query:", query);

          const client = (db as any).client as any;
          if (!client) {
            throw new Error("Mongo client not available from Db instance");
          }

          const testOrderDb = client.db("test_oder_service");
          const resultsCollection = testOrderDb.collection("testResults");

          const filter: Record<string, any> = {};

          if (patientName) {
            filter.patient_name = { $regex: patientName, $options: "i" };
          }

          if (testCode) {
            filter.code = { $regex: testCode, $options: "i" };
          }

          if (!patientName && !testCode && query) {
            filter.$or = [
              { code: { $regex: query, $options: "i" } },
              { name: { $regex: query, $options: "i" } },
              { patient_name: { $regex: query, $options: "i" } },
            ];
          }

          console.log("Lab result lookup filter:", JSON.stringify(filter));

          const docs = await resultsCollection
            .find(filter)
            .sort({ updatedAt: -1 })
            .limit(limit)
            .toArray();

          console.log(
            `Lab result search returned ${docs.length} results`,
            docs
          );

          const codes = Array.from(
            new Set(
              docs
                .map((doc: any) => doc.code)
                .filter(
                  (code: any) => typeof code === "string" && code.length > 0
                )
            )
          );

          let metaByCode: Record<string, any> = {};
          if (codes.length > 0) {
            const metaDocs = await collection
              .find({
                category: "test_info",
                tags: { $in: codes },
              })
              .toArray();

            metaByCode = {};
            for (const meta of metaDocs) {
              const tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];
              const matchingTag = tags.find((t) => codes.includes(t));
              if (matchingTag) {
                metaByCode[matchingTag] = {
                  question: meta.question,
                  answer: meta.answer,
                  category: meta.category,
                  tags: meta.tags,
                };
              }
            }
          }

          const formattedResults = docs.map((doc: any) => ({
            testName: doc.name,
            code: doc.code,
            unit: doc.unit,
            resultValue: doc.result_value,
            resultStatus: doc.result_status,
            patientName: doc.patient_name,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            metadata:
              doc.code && metaByCode[doc.code] ? metaByCode[doc.code] : null,
          }));

          const result = {
            results: formattedResults,
            searchType: "lab_results",
            query: {
              query,
              patientName,
              testCode,
            },
            count: formattedResults.length,
          };

          return JSON.stringify(result);
        } catch (error: any) {
          console.error("Error in lab result lookup:", error);
          return JSON.stringify({
            error: "Failed to search lab results",
            details: error.message,
            query: {
              query,
              patientName,
              testCode,
            },
          });
        }
      },
      {
        name: "lab_result_lookup",
        description:
          "Looks up patient laboratory test results from the test_order_service.testResults database. Use this when the user asks about their actual test values or whether a specific result is normal, high, or low.",
        schema: z.object({
          query: z
            .string()
            .describe(
              "The original user query, useful when no explicit patientName or testCode is provided"
            ),
          patientName: z
            .string()
            .optional()
            .describe("Patient full name, if known from the conversation"),
          testCode: z
            .string()
            .optional()
            .describe("Lab test code, such as PLT, WBC, or GLU"),
          limit: z
            .number()
            .optional()
            .default(5)
            .describe("Maximum number of lab results to return"),
        }),
      }
    );

    const tools = [faqLookupTool, labResultLookupTool];
    const toolNode = new ToolNode<typeof GraphState.State>(tools);

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      maxRetries: 0,
      apiKey: process.env.GOOGLE_API_KEY || "",
    }).bindTools(tools);

    function shouldContinue(state: typeof GraphState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      return "__end__";
    }

    async function callModel(state: typeof GraphState.State) {
      return retryWithBackoff(async () => {
        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system",
            `You are a helpful AI assistant for a healthcare laboratory system.

You have access to two tools:
- faq_lookup: for general FAQs about services, hours, booking, payments, the patient portal, and high-level explanations of tests (for example, what PLT, WBC, or GLU mean).
- lab_result_lookup: for retrieving specific lab test results for a patient from the test_order_service.testResults database.

Guidelines:
- For general questions (opening hours, how to book, what a test is in general, portal usage, etc.), call faq_lookup.
- For questions about a person's actual results, numeric values, or whether a result is normal/high/low, call lab_result_lookup. After you receive lab results, explain:
  - what the test measures,
  - the reported result_value and result_status,
  - a simple interpretation (for example, within the normal range or abnormal),
  - and that final medical advice must always come from a doctor.
- When helpful, you may also call faq_lookup to add general background information about a test (such as PLT, WBC, or GLU).
- Always base your answers on the data returned by the tools. Do NOT invent specific numeric reference ranges or diagnoses.
- Be friendly, clear, and concise in your explanations.

Current time: {time}`,
          ],
          new MessagesPlaceholder("messages"),
        ]);

        const formattedPrompt = await prompt.formatMessages({
          time: new Date().toISOString(),
          messages: state.messages,
        });
        try {
          const result = await model.invoke(formattedPrompt);
          return { messages: [result] };
        } catch (error: any) {
          console.error(
            "Primary model failed, attempting Hugging Face fallback:",
            error?.message || error
          );

          if (error?.status !== 503) {
            throw error;
          }

          const hfToken = process.env.HF_ACCESS_TOKEN;
          if (!hfToken) {
            throw new Error(
              "Primary model overloaded (503) and HF_ACCESS_TOKEN is not configured for fallback."
            );
          }

          const hf = new InferenceClient(hfToken);

          const fallbackInput = formattedPrompt
            .map((msg) => {
              const content: any = (msg as any).content;
              if (typeof content === "string") return content;
              if (Array.isArray(content)) {
                return content
                  .map((c) => (typeof c === "string" ? c : JSON.stringify(c)))
                  .join("\n");
              }
              return JSON.stringify(content);
            })
            .join("\n\n");

          const completion: any = await hf.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [{ role: "user", content: fallbackInput }],
            parameters: {
              max_new_tokens: 256,
              temperature: 0.5,
            },
          });

          const generated =
            typeof completion?.choices?.[0]?.message?.content === "string"
              ? completion.choices[0].message.content
              : JSON.stringify(completion);

          const aiMessage = new AIMessage(generated);
          return { messages: [aiMessage] };
        }
      });
    }

    const workflow = new StateGraph(GraphState)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent");

    const checkpointer = new MongoDBSaver({
      client: db.client as any,
      dbName: db.databaseName,
    });
    const app = workflow.compile({ checkpointer });

    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(query)],
      },
      {
        recursionLimit: 15,
        configurable: { thread_id: threadId },
      }
    );

    if (!finalState?.messages?.length) {
      throw new Error("No messages found in the conversation state");
    }

    const lastMessage = finalState.messages[finalState.messages.length - 1];
    const response = lastMessage?.content;

    if (!response) {
      throw new Error("No content in the last message");
    }

    console.log("FAQ Agent response:", response);
    return response;
  } catch (error: any) {
    console.error("Error in callFAQAgent:", error.message);

    if (error.status === 429) {
      throw new Error(
        "Service temporarily unavailable. Please try again in a minute."
      );
    } else if (error.status === 401) {
      throw new Error(
        "Authentication failed. Please check your API configuration."
      );
    } else {
      throw new Error(`FAQ Agent failed: ${error.message}`);
    }
  }
}
