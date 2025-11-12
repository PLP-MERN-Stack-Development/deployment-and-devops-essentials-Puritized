import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

export default function App() {
  const { isConnected, messages, users, typingUsers, connect, sendMessage, setTyping } = useSocket();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (username.trim()) {
      connect(username);
      setJoined(true);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
    setTyping(false);
  };

  useEffect(() => {
    if (!joined) return;
    setTyping(message.length > 0);
  }, [message]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">💬 Realtime Chat</h1>
        <p>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      </header>

      {!joined ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-96 text-center">
            <h2 className="mb-3 font-semibold">Enter Username</h2>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="border p-2 rounded w-full mb-3"
            />
            <button onClick={handleJoin} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Join</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 bg-white border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-2">👥 Online Users</h3>
            {users.map((u) => <div key={u.id} className="p-1 bg-gray-100 rounded mb-1">{u.username}</div>)}
          </aside>

          <main className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-2 rounded ${msg.sender===username ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200'}`}>
                  {msg.sender !== username && <div className="text-xs opacity-70">{msg.sender}</div>}
                  <div>{msg.message}</div>
                  <div className="text-[10px] opacity-60">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>

            {typingUsers.length > 0 && <div className="px-4 text-sm italic">{typingUsers.join(', ')} {typingUsers.length>1 ? 'are':'is'} typing...</div>}

            <form onSubmit={handleSend} className="flex p-3 border-t bg-white">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded px-3 py-2 mr-2"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
            </form>
          </main>
        </div>
      )}
    </div>
  );
}