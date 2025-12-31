import React from "react";

type Sender = "user" | "ai";

export interface MessageProps {
  id?: string;
  from: Sender;
  content: string;
}

const MessageComponent: React.FC<MessageProps> = ({ id, from, content }) => {
  const isUser = from === "user";

  return (
    <div className={`flex w-full mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="relative max-w-[70%]">
        {!isUser && (
          <div className="absolute -top-3 -left-3 bg-blue-800 text-white 
                          rounded-full h-6 w-6 flex items-center justify-center text-[10px]">
            bot
          </div>
        )}

        <div
          className={`px-3 py-2 rounded-lg text-sm break-words ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
