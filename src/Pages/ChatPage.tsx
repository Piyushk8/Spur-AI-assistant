import { Outlet } from "react-router-dom";
import ChatList from "../component/chat/ChatList";

const ChatPageLayout = () => {
  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="h-[6%] bg-red w-full">
        <header>Header</header>
      </div>
      {/* main section */}
      <div className="flex h-[94%] bg-black w-full">
        <div className="w-1/4 bg-orange-50 border-2 ">
          <ChatList />
        </div>
        <div className="w-3/4 bg-pink-100 border">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ChatPageLayout;
