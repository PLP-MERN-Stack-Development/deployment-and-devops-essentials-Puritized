// server.js — Socket.IO Chat Server with MongoDB persistence (Mongoose)
// If MONGODB_URI not provided, will fallback to local messages.json (NOT persistent on PaaS).

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');

const Message = require('./models/message');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'https://plp-mern-stack-development.github.io/deployment-and-devops-essentials-Puritized/';

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(compression());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

// static files (if you want to serve something)
app.use(express.static(path.join(__dirname, 'public')));

// Persistence: prefer MongoDB. fallback to local JSON (for local dev only)
const DATA_FILE = path.join(__dirname, 'messages.json');
let inMemoryMessages = [];

// Connect to MongoDB if URI provided
async function setupDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set — falling back to messages.json (not persistent on Render).');
    // load JSON into memory
    if (fs.existsSync(DATA_FILE)) {
      try {
        inMemoryMessages = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      } catch (err) {
        console.error('Error reading messages.json:', err);
      }
    }
    return null;
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // crash so Render restarts or you fix connection
  }
}

function saveMessagesToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryMessages, null, 2));
  } catch (err) {
    console.error('Error saving messages.json:', err);
  }
}

// In-memory runtime state
const users = {}; // socket.id -> { username, id }
const typingUsers = {}; // socket.id -> username

// Setup DB and start server
(async () => {
  await setupDatabase();

  // --- SOCKET.IO EVENTS ---
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Send current users and last messages to the newly connected client
    socket.emit('user_list', Object.values(users));

    (async function sendInitialMessages() {
      try {
        if (mongoose.connection.readyState === 1) {
          // fetch last 100 messages from DB, sorted ascending
          const docs = await Message.find({})
            .sort({ timestamp: 1 })
            .limit(100)
            .lean();
          socket.emit('initial_messages', docs);
        } else {
          // fallback
          socket.emit('initial_messages', inMemoryMessages);
        }
      } catch (err) {
        console.error('Error fetching initial messages:', err);
        socket.emit('initial_messages', inMemoryMessages);
      }
    })();

    socket.on('user_join', (username) => {
      users[socket.id] = { username, id: socket.id };
      io.emit('user_list', Object.values(users));
      io.emit('user_joined', { username, id: socket.id });
      console.log(`👤 ${username} joined the chat`);
    });

    socket.on('send_message', async ({ message }) => {
      const user = users[socket.id];
      if (!user) return;

      const msgObj = {
        sender: user.username,
        senderId: socket.id,
        message,
        timestamp: new Date(),
        isPrivate: false
      };

      try {
        if (mongoose.connection.readyState === 1) {
          const saved = await Message.create(msgObj);
          io.emit('receive_message', saved);
        } else {
          // fallback to in-memory + file
          msgObj.id = Date.now();
          inMemoryMessages.push(msgObj);
          if (inMemoryMessages.length > 100) inMemoryMessages.shift();
          saveMessagesToFile();
          io.emit('receive_message', msgObj);
        }
      } catch (err) {
        console.error('Error saving message:', err);
      }

      console.log(`💬 ${user.username}: ${message}`);
    });

    socket.on('typing', (isTyping) => {
      const user = users[socket.id];
      if (!user) return;

      if (isTyping) typingUsers[socket.id] = user.username;
      else delete typingUsers[socket.id];

      io.emit('typing_users', Object.values(typingUsers));
    });

    socket.on('private_message', async ({ to, message }) => {
      const sender = users[socket.id];
      if (!sender) return;

      const msgObj = {
        sender: sender.username,
        senderId: socket.id,
        message,
        timestamp: new Date(),
        isPrivate: true,
        to
      };

      try {
        if (mongoose.connection.readyState === 1) {
          const saved = await Message.create(msgObj);
          socket.to(to).emit('private_message', saved);
          socket.emit('private_message', saved);
        } else {
          msgObj.id = Date.now();
          inMemoryMessages.push(msgObj);
          saveMessagesToFile();
          socket.to(to).emit('private_message', msgObj);
          socket.emit('private_message', msgObj);
        }
      } catch (err) {
        console.error('Error saving private message:', err);
      }

      console.log(`📩 Private message from ${sender.username} to ${to}`);
    });

    socket.on('disconnect', () => {
      const user = users[socket.id];
      if (user) {
        io.emit('user_left', { username: user.username, id: socket.id });
        console.log(`❌ ${user.username} disconnected`);
      }

      delete users[socket.id];
      delete typingUsers[socket.id];

      io.emit('user_list', Object.values(users));
      io.emit('typing_users', Object.values(typingUsers));
    });
  });

  // --- API ---
  app.get('/api/messages', async (req, res) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const docs = await Message.find({}).sort({ timestamp: 1 }).limit(100);
        return res.json(docs);
      } else {
        return res.json(inMemoryMessages);
      }
    } catch (err) {
      console.error('GET /api/messages error', err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.get('/api/users', (req, res) => res.json(Object.values(users)));

  app.get('/healthz', (req, res) => {
    const dbConnected = mongoose.connection && mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({ status: dbConnected ? 'ok' : 'db-disconnected' });
  });

  app.get('/', (req, res) => res.send('🚀 Socket.IO Chat Server running'));

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
})();
