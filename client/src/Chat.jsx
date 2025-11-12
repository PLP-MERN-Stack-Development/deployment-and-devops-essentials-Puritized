// Chat.jsx — Main Chat Component
import React, { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import { useSocket } from "../socket";

/**
 * Chat.jsx
 * Controls user connection, message sending, and displays the chat interface.
 * Updated: Adds private messaging support with clean UI flow.
 */
export default function Chat() {
  const {
    connect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    messages,
    privateMessages,
    users,
    typingUsers,
    isConnected,
  } = useSocket();

  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [typingLabel, setTypingLabel] = useState("");
  const [activeChat, setActiveChat] = useState("public"); // 'public' or userId

  // --- Handle join ---
  const handleJoin = () => {
    if (!username.trim()) return;
    connect(username.trim());
    setIsJoined(true);
  };

  // --- Handle send message ---
  const handleSendMessage = (messageText) => {
    if (activeChat === "public") sendMessage(messageText);
    else sendPrivateMessage(activeChat, messageText);
  };

  // --- Handle typing status ---
  const handleTyping = (isTyping) => {
    setTyping(isTyping);
  };

  // --- Typing users label ---
  useEffect(() => {
    if (typingUsers.length === 0) {
      setTypingLabel("");
    } else if (typingUsers.length === 1) {
      setTypingLabel(`${typingUsers[0]} is typing...`);
    } else {
      setTypingLabel("Several people are typing...");
    }
  }, [typingUsers]);

  // --- UI for joining ---
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 w-80 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            👋 Welcome to ChatApp
          </h1>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={handleJoin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 transition-colors"
          >
            Join Chat
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Server: {isConnected ? "🟢 Online" : "🔴 Offline"}
          </p>
        </div>
      </div>
    );
  }

  // --- Determine active chat content ---
  const currentChatMessages =
    activeChat === "public"
      ? messages
      : privateMessages[activeChat] || [];

  const activeUser =
    activeChat !== "public"
      ? users.find((u) => u.id === activeChat)
      : null;

  // --- Main chat interface ---
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Online Users */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Users Online</h2>
          <p className="text-xs text-gray-500">
            {users.length} {users.length === 1 ? "user" : "users"}
          </p>
        </div>

        {/* Public Chat button */}
        <div
          onClick={() => setActiveChat("public")}
          className={`px-3 py-2 m-2 rounded-md text-sm cursor-pointer transition-colors ${
            activeChat === "public"
              ? "bg-blue-100 text-blue-700 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          🌐 Public Chat
        </div>

        {/* List of users */}
        <div className="flex-1 overflow-y-auto p-3">
          {users.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-6">
              No users online
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() =>
                  user.username !== username && setActiveChat(user.id)
                }
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  user.username === username
                    ? "bg-blue-50 text-blue-700 cursor-default"
                    : activeChat === user.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{user.username}</span>
                {user.username === username && (
                  <span className="text-xs text-gray-500">(You)</span>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat window */}
      <main className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {activeChat === "public"
              ? "🌐 Public Chat"
              : `💬 Chat with ${activeUser?.username || "Unknown"}`}
          </h2>
          {activeChat === "public" && typingLabel && (
            <p className="text-xs text-gray-500 mt-1">{typingLabel}</p>
          )}
        </div>

        <ChatWindow
          username={username}
          messages={currentChatMessages}
          onSend={handleSendMessage}
          onTyping={handleTyping}
          typingLabel={activeChat === "public" ? typingLabel : ""}
        />
      </main>
    </div>
  );
}