import React, { useEffect, useRef, useState } from 'react';

export default function PrivateChatModal({ target, onClose, onSend, messages = [], username, privateTypingUsers = {}, setPrivateTyping }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (target && inputRef.current) inputRef.current.focus();
  }, [target]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!target) return null;

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
    if (setPrivateTyping) setPrivateTyping(target.id, false);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (setPrivateTyping) setPrivateTyping(target.id, e.target.value.trim() !== '');
  };

  const isTyping = privateTypingUsers[target.id];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Private message to</div>
            <div className="font-semibold">{target.username}</div>
          </div>
          <button onClick={onClose} className="px-3 py-1 text-sm rounded-full border border-gray-300 hover:bg-gray-50">Close</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-2 max-h-80 border border-gray-100 rounded-xl p-3 bg-gray-50 flex flex-col">
          {messages.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-2">No messages yet</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-2 max-w-xs p-2 rounded-xl ${msg.sender === username ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}`}>
                <div className="text-xs font-semibold">{msg.sender}</div>
                <div className="text-sm">{msg.message}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {isTyping && <p className="text-xs text-gray-500 mb-2">{target.username} is typing...</p>}

        {/* Input */}
        <textarea
          ref={inputRef}
          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
          rows={4}
          placeholder={`Write a private message to ${target.username}`}
          value={text}
          onChange={handleChange}
        />

        {/* Buttons */}
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSend} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white">Send</button>
        </div>
      </div>
    </div>
  );
}