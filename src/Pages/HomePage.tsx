import React from "react";

const HomePage = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome to Chat
        </h2>
        <p className="text-gray-500 mt-2">
          Select a conversation from the sidebar to start messaging.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
