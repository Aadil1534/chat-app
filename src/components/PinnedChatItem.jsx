import { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePinnedChatHistory } from '../hooks/usePinnedChatHistory';

export default function PinnedChatItem({ chat, isActive, onSelect, onTogglePin, currentUserId }) {
  const { recentMessages } = usePinnedChatHistory(chat.id);
  const [selectedImage, setSelectedImage] = useState(null);

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
    <div
      onClick={onSelect}
      className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-200/80 dark:hover:bg-slate-600/50 ${
        isActive ? 'bg-gray-200 dark:bg-slate-600' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-600 overflow-hidden">
            {chat.otherUser?.photoURL ? (
              <img
                src={chat.otherUser.photoURL}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-slate-300">
                {(chat.otherUser?.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {chat.unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#6C3EF4] rounded-full text-[8px] text-white flex items-center justify-center font-medium">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-1">
            <span className="text-xs font-medium text-gray-800 dark:text-white truncate">
              {chat.otherUser?.name || 'Unknown'}
            </span>
            <button
              onClick={onTogglePin}
              className="p-0.5 rounded hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex-shrink-0"
              title="Unpin"
            >
              <svg className="w-2.5 h-2.5 text-gray-500 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
          </div>
          <div className="mt-1 space-y-0.5">
            {recentMessages.length > 0 ? (
              recentMessages.map((msg, idx) => (
                <div key={msg.id || idx} className="text-[10px] text-gray-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <span className="font-medium">
                    {msg.senderId === currentUserId ? 'You' : chat.otherUser?.name?.split(' ')[0] || 'User'}:
                  </span>
                  {msg.deleted ? (
                    <span className="italic">Message deleted</span>
                  ) : msg.imageUrl ? (
                    <img
                      src={msg.imageUrl}
                      alt="thumb"
                      className="w-10 h-6 object-cover rounded cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(msg.imageUrl); }}
                    />
                  ) : (
                    <span className="truncate">{msg.text || ''}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[10px] text-gray-400 dark:text-slate-500">No messages yet</p>
            )}
          </div>
        </div>
      </div>
    {selectedImage && createPortal(
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
        <div className="relative max-w-4xl max-h-screen flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <img src={selectedImage} alt="Full size" className="max-w-full max-h-screen object-contain rounded-lg" />
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>, document.body
    )}
    </div>
  );
}
