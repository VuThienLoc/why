import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Create a dedicated axios instance for Chat service
// Chat service runs on port 8000 independently
const CHAT_SERVICE_URL = import.meta.env.VITE_API_AI_CHAT_SERVICE_URL || 'http://localhost:8000';
const chatApiClient: AxiosInstance = axios.create({
  baseURL: CHAT_SERVICE_URL,
  timeout: 10000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});


// Chat API response types
export interface ChatResponse {
  status: string;
  data: {
    threadId?: string;
    response: string;
  };
}

export interface ChatRequest {
  message: string;
}

// Chat API base path
const CHAT_API_BASE = '/api/chat';

/**
 * Send a new message to start a chat conversation
 * @param message - The user's message
 * @returns Promise with status and data containing threadId and response
 */
export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const response = await chatApiClient.post<ChatResponse>(
      CHAT_API_BASE,
      { message } as ChatRequest
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Continue a chat conversation using an existing threadId
 * @param threadId - The thread ID from previous conversation
 * @param message - The user's message
 * @returns Promise with status and data containing threadId and response
 */
export async function continueChat(
  threadId: string,
  message: string
): Promise<ChatResponse> {
  try {
    const response = await chatApiClient.post<ChatResponse>(
      `${CHAT_API_BASE}/${threadId}`,
      { message } as ChatRequest
    );
    return response.data;
  } catch (error) {
    console.error('Error continuing chat:', error);
    throw error;
  }
}

