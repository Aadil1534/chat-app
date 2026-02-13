import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { deleteMessage, toggleMessageStarred } from '../lib/chatUtils';

export default function MessageBubble({
  message,
  isOutgoing,
  chatId,
  currentUserId,
  otherUserId,
  isGroup,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [senderName, setSenderName] = useState('');

  const { text, imageUrl, createdAt, senderId, seenBy = [], starredBy = [], deleted } = message;

  const time = createdAt?.toDate?.()
    ? createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const seen = isOutgoing && otherUserId && (seenBy || []).includes(otherUserId);
  const isStarred = (starredBy || []).includes(currentUserId);

  const handleDelete = async () => {
    if (!chatId || !message.id) return;
    await deleteMessage(chatId, message.id, currentUserId);
    setMenuOpen(false);
  };

  const handleStar = async () => {
    if (!chatId || !message.id) return;
    await toggleMessageStarred(chatId, message.id, currentUserId);
    setMenuOpen(false);
  };

  useEffect(() => {
    let mounted = true;
    const loadSender = async () => {
      if (!isGroup) return;
      if (!senderId || senderId === currentUserId) return;
      try {
        const snap = await getDoc(doc(db, 'users', senderId));
        if (mounted && snap.exists()) {
          const d = snap.data();
          setSenderName(d.name || d.displayName || 'Unknown');
        }
      } catch (err) {
        // ignore
      }
    };
    loadSender();
    return () => { mounted = false; };
  }, [isGroup, senderId, currentUserId]);

  return (
    <div
      className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'} mb-2 group relative`}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div className={`max-w-[70%] flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}>
        {/* Sender tag for group (incoming) */}
        {!isOutgoing && isGroup && (senderName || senderId) && (
          <div className="text-[11px] text-gray-600 dark:text-slate-300 mb-1 font-medium truncate">{senderName || (senderId ? senderId.slice(0,6) : 'User')}</div>
        )}

        <div
          className={`px-4 py-2 rounded-2xl relative ${
            isOutgoing
              ? 'bg-[#6C3EF4] text-white rounded-br-md'
              : 'bg-[#e9ecef] dark:bg-slate-600 text-gray-800 dark:text-slate-100 rounded-bl-md'
          }`}
          style={{ borderRadius: '16px' }}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuOpen(true);
          }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {deleted ? (
            <p className="text-sm italic opacity-70">Message deleted</p>
          ) : (
            <>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Shared"
                  className="max-w-full max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ borderRadius: '12px' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(imageUrl); }}
                />
              )}
              {text && <p className="text-sm break-words">{text}</p>}
            </>
          )}

          {menuOpen && chatId && (
            <div
              className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              {isOutgoing && !deleted && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-slate-600"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleStar}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
              >
                {isStarred ? 'Unstar' : 'Star'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs text-gray-500 dark:text-slate-400 ${isOutgoing ? 'mr-1' : 'ml-1'}`}>
            {time}
          </span>
          {isOutgoing && (
            <span className="text-xs text-gray-600 dark:text-white">
              {seen ? (
                <span title="Read">✓✓</span>
              ) : (
                <span title="Delivered">✓</span>
              )}
            </span>
          )}
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
        </div>,
        document.body
      )}
    </div>
  );
}
