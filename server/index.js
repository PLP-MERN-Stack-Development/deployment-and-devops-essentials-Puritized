const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env if present
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// ======================
// CORS Configuration
// ======================
const allowedOrigins = [
  'https://yourusername.github.io', // GitHub Pages frontend
  'http://localhost:5173'           // local frontend dev (Vite)
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

// ======================
// MongoDB Connection
// ======================
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('Error: MONGODB_URI not set!');
} else {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// ======================
// Socket.io setup
// ======================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join event
  socket.on('join', ({ username }) => {
    socket.username = username || 'Anonymous';
    console.log(`${socket.username} joined with id ${socket.id}`);
    socket.broadcast.emit('user-joined', { id: socket.id, username: socket.username });
  });

  // Chat messages
  socket.on('chat-message', (msg) => {
    const payload = {
      id: socket.id,
      username: socket.username || 'Anonymous',
      message: msg,
      timestamp: new Date().toISOString()
    };
    io.emit('chat-message', payload);
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', { id: socket.id, username: socket.username, isTyping });
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
    socket.broadcast.emit('user-left', { id: socket.id, username: socket.username });
  });
});

// ======================
// Routes
// ======================
app.get('/', (req, res) => res.send('Realtime Chat Server is running'));

// ======================
// Start server
// ======================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));