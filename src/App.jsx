import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePresence } from './hooks/usePresence';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ContactInfo from './components/ContactInfo';

function LoginPage() {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/" replace />;
  return <Login />;
}

function ChatLayout() {
  const { currentUser, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  usePresence(currentUser?.uid);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const otherUser = selectedChat?.otherUser;

  return (
    <div className="h-screen flex overflow-hidden bg-[#f4f5f7]">
      <Sidebar
        currentUser={currentUser}
        selectedChatId={selectedChat?.id}
        onSelectChat={(chat) => {
          setSelectedChat(chat);
        }}
        onSignOut={signOut}
      />
      <ChatWindow
        chatId={selectedChat?.id}
        selectedChat={selectedChat}
        currentUser={currentUser}
        otherUser={otherUser}
      />
      <ContactInfo
        selectedChat={selectedChat}
        currentUser={currentUser}
        otherUser={otherUser}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ChatLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
