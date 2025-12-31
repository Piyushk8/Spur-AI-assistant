
import ChatListItem from "./ChatListItem";

const mockChats = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Hey! Are we still meeting today?",
    time: "12:45 PM",
    unread: 3
  },
  {
    id: 2,
    name: "Sarah Smith",
    lastMessage: "Got it, thanks!",
    time: "11:10 AM",
    unread: 0
  },
  {
    id: 3,
    name: "Design Team",
    lastMessage: "Uploaded the new UI revisions.",
    time: "Yesterday",
    unread: 1
  },
];

const ChatList = () => {
  return (
    <div className="h-full w-full overflow-y-auto bg-white border-r border-gray-200">
      <div className="flex flex-col">
        {mockChats.map(chat => (
          <ChatListItem key={chat.id} chat={chat} />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
