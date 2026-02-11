# WeChat-Style Chat App

A real-time chat application built with React, Redux, Firebase v9, and Tailwind CSS. WeChat-inspired UI with authentication, admin dashboard, voice/video calls, group chat, and more.

## Features

### Auth & Registration
- Login, Registration (First Name, Last Name, Mobile Number, Email, Password)
- Forgot Password
- Dark mode toggle on auth screens

### Main Chat
- Real-time one-to-one and group messaging (Firestore)
- Message timestamps, read/delivered status (✓ ✓)
- Emoji picker, image sharing (Firebase Storage)
- Message delete (for self), starred messages
- Typing area with emoji and attachment support

### Profile & Contact
- Profile picture upload
- Edit name, about, phone number
- Contact info panel (profile photo, name, phone, about, media, starred messages)

### Voice & Video Calls
- WebRTC one-to-one voice and video calls
- Firebase Firestore signaling
- Incoming call accept/decline

### Group Chat
- Create groups, add members
- Group name and messaging
- Group chat list display

### Admin Dashboard
- Admin login (`/admin/login`)
- Groups table: Sr. No, Group Name, Project Name, No. of Employees, Actions (Edit, Delete)
- Users table: view all users
- Add Group, Edit Group, Delete Group

### Settings
- Settings sidebar: Profile, Notifications, Privacy, Security, Theme, Chat Wallpaper, Request Account Info, Keyboard Shortcuts, Help
- Keyboard shortcuts modal (Cmd/Ctrl+P) with OS detection, ESC to close, focus trap

### Dark Mode
- Light & Dark themes with Redux
- Toggle on login, main app sidebar
- Theme persisted in localStorage
- Smooth transitions

## Setup

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Create **Firestore Database**
4. Create **Storage** bucket
5. Update `src/lib/firebase.js` with your config

### 2. Admin Setup

To grant admin access, add a document to the `admins` collection in Firestore:

- Collection: `admins`
- Document ID: the user's UID (from Firebase Auth)
- Fields: any (e.g. `{ role: "admin" }`)

### 3. Firestore Indexes

Create a composite index for chats:
- Collection: `chats`
- Fields: `participants` (Array-contains), `lastMessageTime` (Descending)

Create index for incoming calls:
- Collection: `calls`
- Fields: `calleeId` (==), `status` (==)

### 4. Deploy Rules

```bash
firebase deploy
```

### 5. Install & Run

```bash
npm install
npm run dev
```

## Tech Stack

- React 19 + Vite
- Redux Toolkit
- Firebase v9 Modular SDK (Auth, Firestore, Storage)
- WebRTC (voice/video)
- Tailwind CSS v4
- React Router v7
