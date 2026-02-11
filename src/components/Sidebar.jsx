import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useChats } from '../hooks/useChats';
import { usePinnedChatHistory } from '../hooks/usePinnedChatHistory';
import { getOrCreateChat, createGroupChat, togglePinChat } from '../lib/chatUtils';
import { selectDarkMode, toggleTheme } from '../store/slices/themeSlice';
import ProfileEdit from './ProfileEdit';
import PinnedChatItem from './PinnedChatItem';

export default function Sidebar({
  currentUser,
  selectedChatId,
  onSelectChat,
  onSignOut,
  onOpenSettings,
  showNewChat,
  onShowNewChat,
  showNewGroup,
  onShowNewGroup,
}) {
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const showNewChatActual = showNewChat ?? false;
  const showNewGroupActual = showNewGroup ?? false;
  const setShowNewChatActual = onShowNewChat ?? (() => {});
  const setShowNewGroupActual = onShowNewGroup ?? (() => {});
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { chats, pinnedChatIds, loading } = useChats(currentUser?.uid);

  const filteredChats = chats.filter((chat) => {
    const name = chat.otherUser?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const pinnedChats = chats.filter((chat) => pinnedChatIds.includes(chat.id));
  const unpinnedChats = chats.filter((chat) => !pinnedChatIds.includes(chat.id));

  const handleTogglePin = async (e, chatId) => {
    e.stopPropagation();
    if (currentUser?.uid) {
      await togglePinChat(chatId, currentUser.uid);
    }
  };

  useEffect(() => {
    if ((showNewChatActual || showNewGroupActual) && currentUser) {
      getDocs(collection(db, 'users')).then((snap) => {
        const users = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.uid !== currentUser.uid);
        setAllUsers(users);
      });
    }
  }, [showNewChatActual, showNewGroupActual, currentUser]);

  const handleNewChat = async (otherUserId) => {
    const chatId = await getOrCreateChat(currentUser.uid, otherUserId);
    const otherUserData = allUsers.find((u) => u.uid === otherUserId);
    onSelectChat({ id: chatId, otherUser: otherUserData || { uid: otherUserId } });
    setShowNewChatActual(false);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;
    const chatId = await createGroupChat(currentUser.uid, groupName.trim(), null, selectedMembers);
    onSelectChat({
      id: chatId,
      otherUser: { name: groupName, isGroup: true, participants: [currentUser.uid, ...selectedMembers] },
      isGroup: true,
    });
    setShowNewGroupActual(false);
    setGroupName('');
    setSelectedMembers([]);
  };

  const toggleMember = (uid) => {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
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
    <div className="w-[280px] bg-[#f4f5f7] dark:bg-slate-800 flex flex-col h-full border-r border-gray-200 dark:border-slate-700 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Chats</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <span className="text-base">☀️</span> : <span className="text-base">🌙</span>}
            </button>
            <button
              onClick={() => setShowNewGroupActual(true)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="New group"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowNewChatActual(true)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="New chat"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search chats"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF4]/30 focus:border-[#6C3EF4]"
        />
        <a href="#" className="inline-block mt-3 text-sm text-[#6C3EF4] hover:underline">
          Archive
        </a>
      </div>

      {pinnedChats.length > 0 && (
        <div className="px-4 py-2 flex-shrink-0 border-b dark:border-slate-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Pinned</h3>
          <div className="space-y-2">
            {pinnedChats.map((chat) => (
              <PinnedChatItem
                key={chat.id}
                chat={chat}
                isActive={selectedChatId === chat.id}
                onSelect={() => onSelectChat(chat)}
                onTogglePin={(e) => handleTogglePin(e, chat.id)}
                currentUserId={currentUser?.uid}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">Loading chats...</div>
        ) : (
          <div className="py-2">
            {filteredChats.filter((chat) => !pinnedChatIds.includes(chat.id)).map((chat) => {
              const isActive = selectedChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-200/80 dark:hover:bg-slate-600/50 ${
                    isActive ? 'bg-gray-200 dark:bg-slate-600' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-slate-600 overflow-hidden">
                      {chat.otherUser?.photoURL ? (
                        <img
                          src={chat.otherUser.photoURL}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-500 dark:text-slate-300">
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
                      <span className="font-medium text-gray-800 dark:text-white truncate">
                        {chat.otherUser?.name || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => handleTogglePin(e, chat.id)}
                          className="p-1 rounded hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                          title="Pin chat"
                        >
                          <svg className="w-3 h-3 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate mt-0.5">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onOpenSettings ? onOpenSettings() : setShowProfileEdit(true))}
            className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-600 overflow-hidden flex-shrink-0 flex-shrink-0 hover:ring-2 hover:ring-[#6C3EF4] transition-all"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-slate-300">
                {currentUser?.displayName?.charAt(0) || '?'}
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 dark:text-white truncate">
              {currentUser?.displayName || 'You'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 transition-colors"
            title="Sign out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowProfileEdit(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <ProfileEdit
              user={{ ...currentUser, uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL }}
              onClose={() => setShowProfileEdit(false)}
            />
          </div>
        </div>
      )}

      {showNewGroupActual && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNewGroupActual(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateGroup}>
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">New Group</h3>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name"
                  className="w-full mt-2 px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div className="overflow-y-auto max-h-64 p-2">
                {allUsers.map((user) => (
                  <button
                    key={user.uid}
                    type="button"
                    onClick={() => toggleMember(user.uid)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedMembers.includes(user.uid) ? 'bg-[#6C3EF4]/20' : 'hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-slate-300 font-medium">
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">{user.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    {selectedMembers.includes(user.uid) && (
                      <span className="text-[#6C3EF4]">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t dark:border-slate-700 flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-[#6C3EF4] text-white rounded-lg hover:bg-[#5b2ed9]">
                  Create Group
                </button>
                <button type="button" onClick={() => setShowNewGroupActual(false)} className="flex-1 py-2 border dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewChatActual && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNewChatActual(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">New Chat</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Select a contact to start chatting</p>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {allUsers.length === 0 ? (
                <p className="p-4 text-gray-500 dark:text-slate-400 text-center">No other users found. Ask someone to sign up!</p>
              ) : (
                allUsers.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => handleNewChat(user.uid)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-slate-300 font-medium">
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{user.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
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
