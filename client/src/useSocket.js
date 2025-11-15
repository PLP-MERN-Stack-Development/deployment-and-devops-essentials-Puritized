import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// ✅ Use backend URL from environment variable (Render or local)
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim() ||
  "https://deployment-and-devops-essentials-z5ys.onrender.com"; // replace with your server URL

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]); // public messages
  const [privateMessages, setPrivateMessages] = useState({}); // { userId: [msgs] }
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);

  // --- Connect user ---
  const connect = (username) => {
    if (socketRef.current) return; // Prevent duplicate connections

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current.emit("user_join", username);
      console.log(`✅ Connected to server as ${username}`);
    });

    socketRef.current.on("disconnect", (reason) => {
      setIsConnected(false);
      console.warn(`⚠️ Disconnected: ${reason}`);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    // --- Listen to server events ---
    socketRef.current.on("user_list", (userList) => setUsers(userList));

    socketRef.current.on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    socketRef.current.on("typing_users", (typingList) =>
      setTypingUsers(typingList)
    );

    // --- Handle private messages ---
    socketRef.current.on("private_message", (msg) => {
      setPrivateMessages((prev) => {
        const senderId = msg.senderId;
        const updated = { ...prev };
        if (!updated[senderId]) updated[senderId] = [];
        updated[senderId].push(msg);
        return updated;
      });
    });

    // --- Load message history ---
    fetch(`${SOCKET_URL}/api/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Failed to fetch messages:", err));
  };

  // --- Send public message ---
  const sendMessage = (message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit("send_message", { message });
    }
  };

  // --- Send private message ---
  const sendPrivateMessage = (toUserId, message) => {
    if (socketRef.current && toUserId && message.trim()) {
      socketRef.current.emit("private_message", { to: toUserId, message });
      // Immediately add to local state for sender view
      const msgObj = {
        id: Date.now(),
        sender: "You",
        senderId: socketRef.current.id,
        message,
        timestamp: new Date().toISOString(),
        isPrivate: true,
      };
      setPrivateMessages((prev) => {
        const updated = { ...prev };
        if (!updated[toUserId]) updated[toUserId] = [];
        updated[toUserId].push(msgObj);
        return updated;
      });
    }
  };

  // --- Typing indicator ---
  const setTyping = (isTyping) => {
    if (socketRef.current) socketRef.current.emit("typing", isTyping);
  };

  // --- Clean up on unmount ---
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    messages,
    privateMessages,
    users,
    typingUsers,
    connect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
  };
};