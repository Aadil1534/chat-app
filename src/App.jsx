import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePresence } from './hooks/usePresence';
import ThemeSync from './components/ThemeSync';
import Login from './components/Login';
import Registration from './components/Registration';
import ForgotPassword from './components/ForgotPassword';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ContactInfo from './components/ContactInfo';
import CallModal from './components/CallModal';
import SettingsSidebar from './components/SettingsSidebar';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useCall } from './hooks/useCall';
import { useIncomingCall } from './hooks/useIncomingCall';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AuthGuard({ children }) {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

async function checkAdmin(uid) {
  const { isAdmin } = await import('./lib/adminUtils');
  return isAdmin(uid);
}

function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setAllowed(false);
      return;
    }
    checkAdmin(currentUser.uid).then(setAllowed);
  }, [currentUser?.uid]);

  if (allowed === null) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">Loading...</div>;
  if (!currentUser) return <Navigate to="/admin/login" replace />;
  if (!allowed) return <Navigate to="/admin/login" replace />;
  return children;
}

function ChatLayout() {
  const { currentUser, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showArchiveView, setShowArchiveView] = useState(false);
  usePresence(currentUser?.uid);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  useKeyboardShortcuts({
    onNewChat: () => setShowNewChat(true),
    onShortcuts: () => setShowKeyboardShortcuts(true),
  });
  const { activeCall, startCall, acceptCall, endCall } = useCall();
  const incomingCall = useIncomingCall(currentUser?.uid);

  const otherUser = selectedChat?.otherUser;

  const handleStartVoiceCall = () => {
    if (selectedChat?.id && otherUser?.uid && !selectedChat?.isGroup) {
      startCall(selectedChat.id, currentUser.uid, otherUser.uid, 'voice', otherUser);
    }
  };

  const handleStartVideoCall = () => {
    if (selectedChat?.id && otherUser?.uid && !selectedChat?.isGroup) {
      startCall(selectedChat.id, currentUser.uid, otherUser.uid, 'video', otherUser);
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      const { callerId, calleeId, chatId, type } = incomingCall;
      acceptCall(
        { callId: incomingCall.id, chatId, callerId, calleeId, type },
        null
      );
    }
  };

  const handleDeclineCall = async () => {
    if (incomingCall?.id) {
      const { endCall: endCallFn } = await import('./lib/webrtcUtils');
      await endCallFn(incomingCall.id).catch(() => {});
    }
  };

  const handleChatArchived = () => {
    setSelectedChat(null);
    setShowArchiveView(true);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#f4f5f7] dark:bg-slate-900 transition-colors">
      <Sidebar
        currentUser={currentUser}
        selectedChatId={selectedChat?.id}
        onSelectChat={(chat) => setSelectedChat(chat)}
        onSignOut={signOut}
        onOpenSettings={() => setShowSettings(true)}
        showNewChat={showNewChat}
        onShowNewChat={setShowNewChat}
        showArchiveView={showArchiveView}
        onShowArchiveView={setShowArchiveView}
      />
      <ChatWindow
        chatId={selectedChat?.id}
        selectedChat={selectedChat}
        currentUser={currentUser}
        otherUser={otherUser}
        onStartVoiceCall={handleStartVoiceCall}
        onStartVideoCall={handleStartVideoCall}
        onArchived={handleChatArchived}
      />
      <ContactInfo
        selectedChat={selectedChat}
        currentUser={currentUser}
        otherUser={otherUser}
        onOpenSettings={() => setShowSettings(true)}
      />

      {showSettings && (
        <SettingsSidebar
          currentUser={currentUser}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showKeyboardShortcuts && (
        <div className="fixed inset-0 z-[60]">
          <KeyboardShortcutsModal
            onClose={() => setShowKeyboardShortcuts(false)}
            isMac={isMac}
          />
        </div>
      )}

      {activeCall && (
        <CallModal
          callId={activeCall.callId}
          chatId={activeCall.chatId}
          callerId={activeCall.callerId}
          calleeId={activeCall.calleeId}
          type={activeCall.type}
          initiator={activeCall.initiator}
          currentUserId={currentUser?.uid}
          otherUser={activeCall.otherUser || otherUser}
          onEnd={endCall}
        />
      )}

      {incomingCall && !activeCall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99]">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4">
            <p className="text-white font-semibold text-center mb-4">
              Incoming {incomingCall.type === 'video' ? 'video' : 'voice'} call
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAcceptCall}
                className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={handleDeclineCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <AuthGuard>
                  <Login />
                </AuthGuard>
              }
            />
            <Route
              path="/register"
              element={
                <AuthGuard>
                  <Registration />
                </AuthGuard>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AuthGuard>
                  <ForgotPassword />
                </AuthGuard>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatLayout />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
