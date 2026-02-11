# Chat App

A real-time chat application built with React, Firebase v9, and Tailwind CSS. WhatsApp/Telegram style layout with Firebase Authentication, Firestore, and Storage.

## Features

- **Firebase Authentication** - Email/password sign in and sign up
- **Real-time Firestore** - Live chat messages with `onSnapshot`
- **Text & Image messages** - Send text and images (Firebase Storage)
- **Online/Offline status** - User presence tracking
- **Unread message counter** - Badge on chat list items
- **Chat list** - Ordered by last message timestamp

## Setup

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Create **Firestore Database**
4. Create **Storage** bucket
5. Copy your config and update `src/lib/firebase.js`:

```js
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 2. Firestore Index

Create a composite index for the chats query. When you first run the app, Firebase will log an error with a link to auto-create the index. Or create manually:

- Collection: `chats`
- Fields: `participants` (Array-contains), `lastMessageTime` (Descending)

### 3. Deploy Rules

```bash
firebase deploy
```

Or copy `firestore.rules` and `storage.rules` to your Firebase project.

### 4. Install & Run

```bash
npm install
npm run dev
```

## Project Structure

```
chat-app/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   └── ContactInfo.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useChats.js
│   │   ├── useMessages.js
│   │   └── usePresence.js
│   ├── lib/
│   │   ├── firebase.js
│   │   └── chatUtils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── firestore.rules
├── storage.rules
└── package.json
```

## Tech Stack

- React 19 + Vite
- Firebase v9 Modular SDK
- Firestore (real-time)
- Firebase Auth
- Firebase Storage
- Tailwind CSS v4
- React Router v6
