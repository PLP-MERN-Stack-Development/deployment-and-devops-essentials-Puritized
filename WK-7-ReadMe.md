# Real-Time Chat Application

A real-time chat application built with **React**, **Node.js/Express**, **Socket.io**, and **MongoDB**.  
Supports **public chat**, **private messaging**, and **typing indicators**.

---

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Socket Events](#socket-events)
- [Screenshots](#screenshots)
- [License](#license)

---

## Demo

A live deployment link:  
[ChatApp Demo] (https://plp-mern-stack-development.github.io/deployment-and-devops-essentials-Puritized/)
[Backend Server] (https://deployment-and-devops-essentials-z5ys.onrender.com)

---

## Features

- 🌐 Public chat room
- 💬 Private one-on-one messaging
- ✍️ Typing indicators for public and private chats
- 📝 Message history persisted in MongoDB
- 🟢 User online/offline status
- Responsive UI using Tailwind CSS
- Simple and clean interface

---

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (via Mongoose)
- **Deployment**: Render / GitHub Pages / localhost for development

---

## Project Structure
chat-app/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ │ ├── Chat.jsx
│ │ │ ├── ChatWindow.jsx
│ │ │ └── PrivateChatModal.jsx
│ │ ├── socket/
│ │ │ └── useSocket.js
│ │ └── App.jsx
│ └── package.json
├── server/ # Express backend
│ ├── models/
│ │ └── message.js
│ ├── index.js
│ └── package.json
├── .env
└── README.md


---

## Setup and Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app

cd server
npm install

MONGODB_URI=your_mongodb_connection_string
PORT=5000

node index.js

cd ../client
npm install
npm run dev

## Usage

Open the app in the browser.

Enter your username to join the chat.

Select Public Chat or click a user to start a private chat.

Type messages and press Send.

Watch typing indicators for real-time typing feedback.

## Environment Variables**

MONGODB_URI — MongoDB connection string

PORT — Backend server port (default: 5000)

VITE_SOCKET_URL — URL of the backend server for frontend Socket.io

## Screenshots
<img width="1016" height="491" alt="image" src="https://github.com/user-attachments/assets/82d797ee-ec6e-474c-8cc5-c553758e84ce" />
<img width="1341" height="590" alt="image" src="https://github.com/user-attachments/assets/0e4f4c33-82d6-479f-9367-6fffb56c24ac" />

