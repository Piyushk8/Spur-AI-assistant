import { useState, useCallback, useRef } from "react";
import { SERVER_URL } from "../utils/constants";

export interface MessageProps {
  id: string;
  from: "user" | "ai";
  content: string;
}

export function useStreamingChat() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamState, setStreamState] = useState({
    isStreaming: false,
    error: null as string | null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
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

    // Close any existing stream
    eventSourceRef.current?.close();

    const userId = crypto.randomUUID();
    const aiId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: userId, from: "user", content: userMessage },
      { id: aiId, from: "ai", content: "" },
    ]);

    setStreamState({ isStreaming: true, error: null });

    let fullAIReply = "";

    const url =
      `${SERVER_URL}/chat/stream` +
      `?message=${encodeURIComponent(userMessage)}` +
      `&sessionId=${sessionId ?? ""}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("open", () => {
      console.log("SSE connected");
    });

    es.addEventListener("message", (e) => {
      fullAIReply += e.data;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId ? { ...m, content: fullAIReply } : m
        )
      );
    });

    es.addEventListener("done", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.sessionId) setSessionId(data.sessionId);
      } catch (_) {}

      setStreamState({ isStreaming: false, error: null });
      es.close();
    });

    es.addEventListener("error", () => {
      es.close();
      setStreamState({
        isStreaming: false,
        error: "Streaming connection lost",
      });
      setMessages((prev) => prev.filter((m) => m.id !== aiId));
    });
  };

  const cancelStream = useCallback(() => {
    eventSourceRef.current?.close();
    setStreamState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const clearStream = useCallback(() => {
    eventSourceRef.current?.close();
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
