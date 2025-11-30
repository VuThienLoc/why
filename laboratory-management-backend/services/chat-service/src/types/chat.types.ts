export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  _id?: string;
  userId: string;
  threadId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIChatResponse {
  threadId: string;
  response: string;
  timestamp: Date;
}

export interface ChatError extends Error {
  statusCode?: number;
  code?: string;
}

export interface AIChatServiceInterface {
  processMessage(userId: string, message: string, threadId?: string): Promise<AIChatResponse>;
  getChatHistory(userId: string, threadId: string): Promise<ChatMessage[]>;
  getOrCreateSession(userId: string, threadId?: string): Promise<ChatSession>;
  updateSession(session: ChatSession): Promise<void>;
  getAIResponse(messages: ChatMessage[]): Promise<string>;
}
