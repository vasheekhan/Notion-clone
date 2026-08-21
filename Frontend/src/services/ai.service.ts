import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type AIAction =
  | "summarize"
  | "key-takeaways"
  | "action-items"
  | "explain"
  | "write-from-prompt"
  | "generate-outline"
  | "brainstorm"
  | "generate-quiz" 
  | "custom";

export interface AIStreamRequest {
  action: AIAction;
  pageId?: string;
  pageTitle: string;
  pageContent: string;
  selectedText?: string;
  customPrompt?: string;
  conversationId?: string;
}

export interface AIStreamChunk {
  content?: string;
  conversationId?: string;
  error?: string;
}

export async function* streamAI(
  params: AIStreamRequest
): AsyncGenerator<AIStreamChunk, void, unknown> {
  const response = await fetch(`${API_BASE}/ai/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: "AI request failed" }));
    throw new Error(err.message || "AI request failed");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed: AIStreamChunk = JSON.parse(data);
          if (parsed.error) throw new Error(parsed.error);
          yield parsed;
        } catch (e: any) {
          if (e.message && !e.message.includes("JSON")) throw e;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function listConversations(pageId?: string) {
  const res = await axios.get(`${API_BASE}/ai/conversations`, {
    params: pageId ? { pageId } : {},
    withCredentials: true,
  });
  return res.data.conversations;
}

export async function getConversation(id: string) {
  const res = await axios.get(`${API_BASE}/ai/conversations/${id}`, {
    withCredentials: true,
  });
  return res.data.conversation;
}

export async function deleteConversation(id: string) {
  const res = await axios.delete(`${API_BASE}/ai/conversations/${id}`, {
    withCredentials: true,
  });
  return res.data;
}


export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  topic: string;
  questions: QuizQuestion[];
}

export interface QuizRequest {
  pageId?: string;
  pageTitle: string;
  pageContent: string;
  selectedText?: string;
  questionCount?: number;
}


export async function generateQuiz(params: QuizRequest): Promise<Quiz> {
  const response = await fetch(`${API_BASE}/ai/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to generate quiz");
  }

  return data.quiz;
}