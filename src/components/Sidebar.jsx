import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useChats } from '../hooks/useChats';
import { getOrCreateChat } from '../lib/chatUtils';

export default function Sidebar({
  currentUser,
  selectedChatId,
  onSelectChat,
  onSignOut,
}) {
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const { chats, loading } = useChats(currentUser?.uid);

  const filteredChats = chats.filter((chat) => {
    const name = chat.otherUser?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    if (showNewChat && currentUser) {
      getDocs(collection(db, 'users')).then((snap) => {
        const users = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.uid !== currentUser.uid);
        setAllUsers(users);
      });
    }
  }, [showNewChat, currentUser]);

  const handleNewChat = async (otherUserId) => {
    const chatId = await getOrCreateChat(currentUser.uid, otherUserId);
    const otherUserData = allUsers.find((u) => u.uid === otherUserId);
    onSelectChat({ id: chatId, otherUser: otherUserData || { uid: otherUserId } });
    setShowNewChat(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="w-[280px] bg-[#f4f5f7] flex flex-col h-full border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            title="New chat"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <input
          type="text"
          placeholder="Search chats"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF4]/30 focus:border-[#6C3EF4]"
        />
        <a href="#" className="inline-block mt-3 text-sm text-[#6C3EF4] hover:underline">
          Archive
        </a>
      </div>

      <div className="px-4 py-2 flex-shrink-0">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pinned</h3>
        <p className="text-sm text-gray-400 mt-1">No pinned chats</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading chats...</div>
        ) : (
          <div className="py-2">
            {filteredChats.map((chat) => {
              const isActive = selectedChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-200/80 ${
                    isActive ? 'bg-gray-200' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                      {chat.otherUser?.photoURL ? (
                        <img
                          src={chat.otherUser.photoURL}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-500">
                          {(chat.otherUser?.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#6C3EF4] rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-medium text-gray-800 truncate">
                        {chat.otherUser?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500">
                {currentUser?.displayName?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">
              {currentUser?.displayName || 'You'}
            </p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
            title="Sign out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNewChat(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">New Chat</h3>
              <p className="text-sm text-gray-500 mt-1">Select a contact to start chatting</p>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {allUsers.length === 0 ? (
                <p className="p-4 text-gray-500 text-center">No other users found. Ask someone to sign up!</p>
              ) : (
                allUsers.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => handleNewChat(user.uid)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
