import { useRef, useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import { sendMessage } from '../lib/chatUtils';
import MessageBubble from './MessageBubble';
import EmojiPicker from 'emoji-picker-react';

export default function ChatWindow({
  chatId,
  selectedChat,
  currentUser,
  otherUser,
  onStartVoiceCall,
  onStartVideoCall,
}) {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);

  const { messages, loading, messagesEndRef } = useMessages(chatId, currentUser?.uid);

  const otherUserId = selectedChat?.otherUser?.uid;
  const filteredMessages = messages.filter((m) => !m.deleted);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if ((!text && !uploadingImage) || sending || !chatId) return;

    setSending(true);
    try {
      await sendMessage(chatId, currentUser.uid, text);
      setInputText('');
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || !chatId || sending) return;

    setUploadingImage(true);
    try {
      await sendMessage(chatId, currentUser.uid, '', file);
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  let lastDate = '';

  if (!chatId || !selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-slate-900 text-gray-500 dark:text-slate-400 transition-colors">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  const displayName = otherUser?.name || 'Unknown';
  const photoURL = otherUser?.photoURL;
  const isOnline = otherUser?.online ?? false;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 min-w-0 transition-colors">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden flex-shrink-0">
            {photoURL ? (
              <img src={photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-slate-300 font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 dark:text-white truncate">{displayName}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">{isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={!selectedChat?.isGroup ? onStartVideoCall : undefined}
            disabled={selectedChat?.isGroup}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300"
            title={selectedChat?.isGroup ? 'Group video call (coming soon)' : 'Video call'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={!selectedChat?.isGroup ? onStartVoiceCall : undefined}
            disabled={selectedChat?.isGroup}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300"
            title={selectedChat?.isGroup ? 'Group voice call (coming soon)' : 'Voice call'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] dark:bg-slate-900">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-400 dark:text-slate-500">Loading messages...</div>
          </div>
        ) : (
          <>
            {filteredMessages.map((msg) => {
              const msgDate = formatDate(msg.createdAt);
              const showDate = msgDate !== lastDate;
              if (showDate) lastDate = msgDate;

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="px-4 py-1 bg-gray-200/80 dark:bg-slate-600/80 rounded-full text-xs text-gray-600 dark:text-slate-300">
                        {msgDate}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOutgoing={msg.senderId === currentUser?.uid}
                    chatId={chatId}
                    currentUserId={currentUser?.uid}
                    otherUserId={otherUserId}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploadingImage}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-400 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C3EF4]/30 focus:border-[#6C3EF4]"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-400 transition-colors"
              title="Emoji"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showEmoji && (
              <div className="absolute bottom-full right-0 mb-2 z-20">
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setInputText((prev) => prev + e.emoji);
                  }}
                  width={320}
                  height={400}
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={sending || uploadingImage || (!inputText.trim() && !uploadingImage)}
            className="p-2.5 bg-[#6C3EF4] text-white rounded-xl hover:bg-[#5b2ed9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
