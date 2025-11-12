import React from "react";

/**
 * Generate a consistent pastel color based on a string (username)
 */
function generateColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 75%)`; // pastel tone
}

/**
 * MessageBubble Component
 * Displays chat bubbles with colored avatars, message type indicators, and timestamps.
 */
export default function MessageBubble({ message, selfUsername }) {
  const isSelf = message.sender === selfUsername;
  const isSystem = message.system;
  const isPrivate = message.isPrivate;

  // --- Format timestamp ---
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // --- System message (centered gray text) ---
  if (isSystem) {
    return (
      <div className="text-center italic text-gray-400 text-sm my-2">
        {message.message}
      </div>
    );
  }

  // --- Get initials for avatar ---
  const initials = message.sender
    ? message.sender
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // --- Get background color for avatar ---
  const avatarColor = generateColor(message.sender || "Anonymous");

  return (
    <div
      className={`flex w-full mb-2 ${
        isSelf ? "justify-end" : "justify-start"
      }`}
    >
      {/* Left-side avatar (for others) */}
      {!isSelf && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2"
          style={{ backgroundColor: avatarColor, color: "white" }}
        >
          {initials}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative ${
          isSelf
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
        }`}
      >
        {/* Sender name (for others only) */}
        {!isSelf && (
          <div className="text-xs text-gray-500 font-medium mb-1">
            {message.sender}
            {isPrivate && (
              <span className="ml-1 text-pink-500 font-semibold">(Private)</span>
            )}
          </div>
        )}

        {/* Message text */}
        <div className="whitespace-pre-wrap break-words">{message.message}</div>

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-1 ${
            isSelf ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {time}
        </div>

        {/* Private badge (for self) */}
        {isPrivate && isSelf && (
          <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] px-2 py-[1px] rounded-full shadow">
            Private
          </div>
        )}
      </div>

      {/* Right-side avatar (for self) */}
      {isSelf && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ml-2"
          style={{ backgroundColor: avatarColor, color: "white" }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}