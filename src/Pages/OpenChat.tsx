import { useState } from "react";
import { useParams } from "react-router-dom";
import MessageComponent from "../component/chat/MessageComponent";
import { useStreamingChat } from "../hooks/useStreamingChat";

const ChatRoom = () => {
  const { id } = useParams();
  const [input, setInput] = useState("");

  const { messages, streamState, sendMessage } = useStreamingChat();

  // const handleSendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();

  //   setInput("");
  // };

  return (
    <div className="flex w-screen py-5 items-center justify-center  h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col h-full w-1/2 bg-red-200">
        <header className="h-16 border-b border-gray-200 px-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Chat Room #{id}</h2>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <MessageComponent
              id={msg.id}
              from={msg.from}
              content={msg.content}
            />
          ))}
        </div>
        {streamState.error && (
          <div className="px-4 py-2 bg-red-100 text-red-800 text-sm">
            {streamState.error}
          </div>
        )}

        {/* Input Bar */}
        <footer className="h-16 border-t border-gray-200 px-4 flex items-center gap-2 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streamState.isStreaming}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !streamState.isStreaming &&
                input.trim()
              ) {
                sendMessage(input.trim());
                setInput("");
              }
            }}
            placeholder={
              streamState.isStreaming
                ? "Agent is responding..."
                : "Type a message..."
            }
            className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-blue-200"
          />

          {streamState.isStreaming && <div>Agent typing...</div>}

          <button
            disabled={!input.trim() || streamState.isStreaming}
            className={`px-4 py-2 rounded-lg text-white ${
              !input.trim() || streamState.isStreaming
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={() => {
              if (!input.trim()) return;
              sendMessage(input.trim());
              setInput("");
            }}
          >
            Send
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ChatRoom;
