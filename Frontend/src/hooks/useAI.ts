import { useState, useCallback, useRef } from "react";
import { streamAI } from "../services/ai.service";
import type { AIStreamRequest } from "../services/ai.service";

interface UseAIReturn {
  response: string;
  conversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  generate: (params: AIStreamRequest) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useAI(): UseAIReturn {
  const [response, setResponse] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const stop = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    setResponse("");
    setConversationId(null);
    setIsLoading(false);
    setIsStreaming(false);
    setError(null);
    abortRef.current = false;
  }, []);

  const generate = useCallback(async (params: AIStreamRequest) => {
    setResponse("");
    setConversationId(null);
    setError(null);
    setIsLoading(true);
    setIsStreaming(false);
    abortRef.current = false;

    try {
      const stream = streamAI(params);
      let firstChunk = true;

      for await (const chunk of stream) {
        if (abortRef.current) break;

        if (firstChunk) {
          setIsLoading(false);
          setIsStreaming(true);
          firstChunk = false;
        }

        if (chunk.conversationId) {
          setConversationId(chunk.conversationId);
        }
        if (chunk.content) {
          setResponse((prev) => prev + chunk.content);
        }
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  return {
    response,
    conversationId,
    isLoading,
    isStreaming,
    error,
    generate,
    stop,
    reset,
  };
}