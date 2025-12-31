
interface ChatListItemProps {
  chat: {
    id: number;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
  };
}

const ChatListItem = ({ chat }: ChatListItemProps) => {
  return (
    <button
      className="
        w-full h-20 flex items-center px-4 gap-4
        hover:bg-gray-100 active:bg-gray-200
        transition-colors duration-150
        focus:outline-none focus:bg-gray-100
      "
      aria-label={`Open chat with ${chat.name}`}
    >
      {/* Avatar */}
      <div className="h-12 w-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold">
        {chat.name.charAt(0)}
      </div>

      {/* Text Section */}
      <div className="flex-1 flex flex-col justify-center border-b border-gray-200">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-900 truncate">{chat.name}</p>
          <span className="text-xs text-gray-500">{chat.time}</span>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 truncate">
            {chat.lastMessage}
          </p>

          {chat.unread > 0 && (
            <span className="min-w-5 h-5 px-2 text-xs flex items-center justify-center rounded-full bg-blue-600 text-white">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatListItem;
