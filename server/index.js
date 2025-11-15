const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/message');

const app = express();
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'https://plp-mern-stack-development.github.io/deployment-and-devops-essentials-Puritized/',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) console.error('Error: MONGODB_URI not set!');
else {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins
  socket.on('join', ({ username }) => {
    socket.username = username || 'Anonymous';
    console.log(`${socket.username} joined with id ${socket.id}`);
    socket.broadcast.emit('user-joined', { id: socket.id, username: socket.username });
  });

  // Public chat message
  socket.on('chat-message', async (msg) => {
    const payload = {
      sender: socket.username || 'Anonymous',
      senderId: socket.id,
      message: msg,
      timestamp: new Date(),
      isPrivate: false,
      to: null
    };
    try {
      await new Message(payload).save();
    } catch (err) {
      console.error('Failed to save message:', err);
    }
    io.emit('receive_message', payload);
  });

  // Private message
  socket.on('private_message', async ({ to, message }) => {
    const payload = {
      sender: socket.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date(),
      isPrivate: true,
      to
    };
    try {
      await new Message(payload).save();
    } catch (err) {
      console.error('Failed to save private message:', err);
    }
    // Send to recipient and sender
    socket.to(to).emit('private_message', payload);
    socket.emit('private_message', payload);
  });

  // Typing indicator (public)
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing_users', isTyping ? [socket.username] : []);
  });

  // Typing indicator (private)
  socket.on('private_typing', ({ to, isTyping }) => {
    if (!to) return;
    socket.to(to).emit('private_typing', { from: socket.id, username: socket.username, isTyping });
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
    socket.broadcast.emit('user-left', { id: socket.id, username: socket.username });
  });
});

// API route to get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Health check
app.get('/', (req, res) => res.send('Realtime Chat Server is running'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));