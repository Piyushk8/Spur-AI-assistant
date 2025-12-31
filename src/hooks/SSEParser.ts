export interface StreamState {
  isStreaming: boolean;
  error: string | null;
}
export type SSEEvent = "done" | "open" | "ping" | "message" | "error" | "close";

export class SSEParser {
  private buffer: string = "";

  parseChunk(
    chunk: string
  ): Array<{ event: SSEEvent; data: any; id?: string }> {
    this.buffer += chunk;

    const events: Array<{ event: SSEEvent; data: any; id?: string }> = [];

    const messages = this.buffer.split("\n\n");

    this.buffer = messages.pop() || "";

    for (const message of messages) {
      if (!message.trim()) continue;

      let event = "message";
      let id: string | undefined;
      const dataLines: string[] = [];

      for (const line of message.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("event:")) {
          event = trimmed.substring(6).trim() as SSEEvent;
        } else if (trimmed.startsWith("data:")) {
          dataLines.push(trimmed.substring(5).trim());
        } else if (trimmed.startsWith("id:")) {
          id = trimmed.substring(3).trim();
        }
      }

      if (dataLines.length === 0) continue;

      const rawData = dataLines.join("\n");
      let parsedData: any = rawData;

      try {
        parsedData = JSON.parse(rawData);
      } catch (_) {}

      events.push({
        event: event as SSEEvent,
        data: parsedData,
        id,
      });
    }
    return events;
  }

  reset() {
    this.buffer = "";
  }
}
