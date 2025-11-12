import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

/**
 * ChatWindow Component
 * Displays messages, handles sending and typing events.
 */
export default function ChatWindow({
  messages = [],
  username = "",
  onSend,
  onTyping,
  typingLabel = "",
  activeUser = null, // optional: user object when in private chat
}) {
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // --- Auto-scroll to bottom when new messages arrive ---
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // --- Handle typing events ---
  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (onTyping) onTyping(true);

    // debounce stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTyping) onTyping(false);
    }, 1000);
  };

  // --- Send message ---
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (onSend) onSend(trimmed);
    setText("");
    if (onTyping) onTyping(false);
  };

  // --- Handle Enter key send ---
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex flex-col h-full bg-gray-50 rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          {activeUser ? (
            <>
              <span>💬 Chat with</span>
              <span className="text-blue-600">{activeUser.username}</span>
            </>
          ) : (
            <span>🌐 Global Chat</span>
          )}
        </div>

        {typingLabel && !activeUser && (
          <div className="text-xs text-emerald-600 h-4">{typingLabel}</div>
        )}
      </div>

      {/* Message List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            No messages yet — start the conversation!
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id || `${m.timestamp}-${Math.random()}`}
              message={m}
              selfUsername={username}
            />
          ))
        )}
        {/* Scroll anchor */}
        <div ref={listRef} />
      </div>

      {/* Composer */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
            rows={1}
            placeholder={
              activeUser
                ? `Send a private message to ${activeUser.username}...`
                : "Type a message..."
            }
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleSend}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl px-5 py-3 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}