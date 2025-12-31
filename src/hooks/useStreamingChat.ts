import { useState, useCallback, useRef } from "react";
import { SSEParser, type StreamState } from "./SSEParser";
import { SERVER_URL } from "../utils/constants";

export interface MessageProps {
  id: string;
  from: "user" | "ai";
  content: string;
}

export function useStreamingChat() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const MAX_MESSAGE_LENGTH = 2000;

  const sendMessage = async (userMessage: string) => {
    const trimmed = userMessage.trim();

    if (!trimmed) {
      setStreamState({ isStreaming: false, error: "Message cannot be empty" });
      return;
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setStreamState({
        isStreaming: false,
        error: `Message too long. Limit ${MAX_MESSAGE_LENGTH} chars.`,
      });
      return;
    }

    // Streaming safety
    if (streamState.isStreaming) {
      abortControllerRef.current?.abort();
    }
    abortControllerRef.current = new AbortController();

    const userId = crypto.randomUUID();
    const aiId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: userId, from: "user", content: userMessage },
      { id: aiId, from: "ai", content: "" }, // placeholder bot message
    ]);

    setStreamState({ isStreaming: true, error: null });
    let fullAIReply = "";
    const parser = new SSEParser();
    try {
      const response = await fetch(
        `${SERVER_URL}/chat/stream?message=${encodeURIComponent(
          userMessage
        )}&sessionId=${sessionId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
        }
      );
      if (!response.ok) throw new Error("Failed to connect to stream");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body stream");
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = parser.parseChunk(chunk);

        for (const { event, data } of events) {
          console.log("SSE EVENT", event, "Data:", data);

          switch (event) {
            case "open":
              console.log("SSE Connection Openend");
              break;
            case "close":
              console.log("SSE Connection Closed");
              break;
            case "message":
              const token = typeof data == "string" ? data : data?.data || "";
              fullAIReply += token;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId ? { ...m, content: fullAIReply } : m
                )
              );
              break;
            case "done":
              const sid =
                typeof data === "object"
                  ? data.sessionId ?? data?.data?.sessionId
                  : null;

              if (sid) setSessionId(sid);

              setStreamState((prev) => ({ ...prev, isStreaming: false }));
              break;

            case "error":
              const errorMsg =
                typeof data === "string"
                  ? data
                  : data?.message ?? "Stream error occurred";
              throw new Error(errorMsg);

            default:
              console.warn("Unknown SSE event type:", event);
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;

      const readableError =
        err?.message === "Failed to fetch"
          ? "Network error. Check internet."
          : err?.message || "Something went wrong";

      setStreamState({
        isStreaming: false,
        error: readableError,
      });
      setMessages((prev) => prev.filter((m) => m.id !== aiId));
    } finally {
      setStreamState((prev) => ({ ...prev, isStreaming: false }));
    }

    return fullAIReply;
  };

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreamState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const clearStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setSessionId(null);
    setStreamState({ isStreaming: false, error: null });
  }, []);

  return {
    messages,
    sessionId,
    streamState,
    sendMessage,
    cancelStream,
    clearStream,
  };
}
