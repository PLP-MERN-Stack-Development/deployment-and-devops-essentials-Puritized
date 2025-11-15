import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim() ||
  "https://deployment-and-devops-essentials-z5ys.onrender.com";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]); // public chat
  const [privateTypingUsers, setPrivateTypingUsers] = useState({}); // { userId: boolean }
  const socketRef = useRef(null);

  const connect = (username) => {
    if (socketRef.current) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current.emit("join", { username });
      console.log(`✅ Connected as ${username}`);
    });

    socketRef.current.on("disconnect", (reason) => {
      setIsConnected(false);
      console.warn(`⚠️ Disconnected: ${reason}`);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    // --- Public messages ---
    socketRef.current.on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    // --- Private messages ---
    socketRef.current.on("private_message", (msg) => {
      const otherId = msg.senderId === socketRef.current.id ? msg.to : msg.senderId;

      setPrivateMessages((prev) => {
        const updated = { ...prev };
        if (!updated[otherId]) updated[otherId] = [];
        updated[otherId].push(msg);
        return updated;
      });
    });

    // --- Public typing ---
    socketRef.current.on("typing_users", (typingList) => setTypingUsers(typingList));

    // --- Private typing ---
    socketRef.current.on("private_typing", ({ userId, isTyping }) => {
      setPrivateTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    });

    // --- Fetch history ---
    fetch(`${SOCKET_URL}/api/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Failed to fetch messages:", err));
  };

  const sendMessage = (message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit("chat-message", message);
    }
  };

  const sendPrivateMessage = (toUserId, message) => {
    if (socketRef.current && toUserId && message.trim()) {
      socketRef.current.emit("private_message", { to: toUserId, message });
      const msgObj = {
        sender: "You",
        senderId: socketRef.current.id,
        message,
        timestamp: new Date().toISOString(),
        isPrivate: true,
        to: toUserId,
      };
      setPrivateMessages((prev) => {
        const updated = { ...prev };
        if (!updated[toUserId]) updated[toUserId] = [];
        updated[toUserId].push(msgObj);
        return updated;
      });
    }
  };

  // --- Public typing ---
  const setTyping = (isTyping) => {
    if (socketRef.current) socketRef.current.emit("typing", isTyping);
  };

  // --- Private typing ---
  const setPrivateTyping = (userId, isTyping) => {
    if (socketRef.current && userId) {
      socketRef.current.emit("private_typing", { to: userId, isTyping });
      setPrivateTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    }
  };

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
    privateTypingUsers,
    connect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    setPrivateTyping,
  };
};