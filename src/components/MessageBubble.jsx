import { useState } from 'react';
import { deleteMessage, toggleMessageStarred } from '../lib/chatUtils';

export default function MessageBubble({
  message,
  isOutgoing,
  chatId,
  currentUserId,
  otherUserId,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <div
      className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'} mb-2 group relative`}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div
        className={`max-w-[70%] flex flex-col ${
          isOutgoing ? 'items-end' : 'items-start'
        }`}
      >
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
                <div className="mb-2">
                  <img
                    src={imageUrl}
                    alt="Shared"
                    className="max-w-full max-h-64 rounded-xl object-cover"
                    style={{ borderRadius: '12px' }}
                  />
                </div>
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
          <span
            className={`text-xs text-gray-500 dark:text-slate-400 ${
              isOutgoing ? 'mr-1' : 'ml-1'
            }`}
          >
            {time}
          </span>
          {isOutgoing && (
            <span className="text-xs">
              {seen ? (
                <span title="Read">✓✓</span>
              ) : (
                <span title="Delivered">✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
