import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../lib/firebase';

export default function ContactInfo({ selectedChat, currentUser, otherUser, onOpenSettings }) {
  const [userData, setUserData] = useState(null);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [starredMessages, setStarredMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (otherUser?.uid && !otherUser?.isGroup) {
      getDoc(doc(db, 'users', otherUser.uid)).then((snap) => {
        if (snap.exists()) setUserData(snap.data());
      });
    } else {
      setUserData(otherUser?.isGroup ? { name: otherUser.name, photoURL: otherUser.photoURL } : null);
    }
  }, [otherUser?.uid, otherUser?.isGroup]);

  useEffect(() => {
    if (selectedChat?.isGroup && selectedChat?.participants) {
      Promise.all(
        selectedChat.participants.map((uid) =>
          getDoc(doc(db, 'users', uid)).then((snap) => ({
            uid,
            ...snap.data(),
          }))
        )
      ).then(setGroupMembers);
    } else {
      setGroupMembers([]);
    }
  }, [selectedChat?.isGroup, selectedChat?.participants]);

  useEffect(() => {
    if (!selectedChat?.id) {
      setMediaUrls([]);
      return;
    }
    const q = query(
      collection(db, 'chats', selectedChat.id, 'messages'),
      orderBy('createdAt', 'desc')
    );
    getDocs(q).then((snap) => {
      const urls = snap.docs
        .map((d) => d.data().imageUrl)
        .filter(Boolean);
      setMediaUrls(urls);
    });
    return () => {};
  }, [selectedChat?.id]);

  const handleShowStarredMessages = async () => {
    if (!selectedChat?.id || !currentUser?.uid) return;

    const q = query(
      collection(db, 'chats', selectedChat.id, 'messages'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const starred = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((msg) => (msg.starredBy || []).includes(currentUser.uid));
    setStarredMessages(starred);
    setShowStarredMessages(true);
  };

  const closeImageViewer = () => setSelectedImage(null);

  if (!selectedChat) {
    return (
      <div className="w-[300px] bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 transition-colors">
        <p className="text-sm">Select a chat to view contact info</p>
      </div>
    );
  }

  const displayName = userData?.name || otherUser?.name || 'Unknown';
  const photoURL = userData?.photoURL || otherUser?.photoURL;
  const isOnline = userData?.online ?? false;

  return (
    <div className="w-[300px] bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col overflow-y-auto transition-colors">
      <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-slate-700">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden mb-4">
          {photoURL ? (
            <img src={photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-500 dark:text-slate-300">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{displayName}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">{userData?.mobileNumber || 'No phone'}</p>
        <div className="flex gap-2 mt-4">
          <button className="p-2 rounded-full bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-4v4m0-11V3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 01-1 1H9z"
              />
            </svg>
          </button>
          <button className="p-2 rounded-full bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 dark:border-slate-700">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          About
        </h4>
        <p className="text-sm text-gray-700 dark:text-slate-300">{userData?.about || 'Hey there! I am using ChatApp.'}</p>
      </div>

      {selectedChat?.isGroup && groupMembers.length > 0 && (
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Members ({groupMembers.length})
          </h4>
          <div className="space-y-2">
            {groupMembers.map((member) => (
              <div key={member.uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-600 overflow-hidden flex-shrink-0">
                  {member.photoURL ? (
                    <img src={member.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-slate-300">
                      {(member.name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{member.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{member.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-100 dark:border-slate-700">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Media, Links & Docs
        </h4>
          <div className="flex gap-2 flex-wrap">
          {mediaUrls.length > 0 ? (
            mediaUrls.slice(0, 6).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                onClick={() => setSelectedImage(url)}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500">No media yet</p>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 dark:border-slate-700">
        <button onClick={handleShowStarredMessages} className="flex items-center gap-3 w-full text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg p-2 -m-2 transition-colors">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <span className="text-sm text-gray-700 dark:text-slate-300">Starred Messages</span>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-slate-300">Mute Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6C3EF4]"></div>
          </label>
        </div>
      </div>
      {onOpenSettings && (
        <div className="p-4 border-t dark:border-slate-700">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg p-3 transition-colors"
          >
            <span className="text-xl">⚙️</span>
            <span className="text-sm text-gray-700 dark:text-slate-300">Settings</span>
          </button>
        </div>
      )}

      {showStarredMessages && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Starred Messages</h2>
              <button
                onClick={() => setShowStarredMessages(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {starredMessages.length > 0 ? (
                starredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
                  >
                    {msg.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={msg.imageUrl}
                          alt="Shared"
                          className="max-w-full max-h-32 rounded-lg object-cover cursor-pointer"
                          onClick={() => setSelectedImage(msg.imageUrl)}
                        />
                      </div>
                    )}
                    {msg.text && (
                      <p className="text-sm text-gray-800 dark:text-slate-200 break-words">{msg.text}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                      {msg.createdAt?.toDate?.()
                        ? msg.createdAt.toDate().toLocaleString()
                        : new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-slate-400">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <p className="text-sm">No starred messages yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        {selectedImage && createPortal(
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeImageViewer}>
            <div className="relative max-w-4xl max-h-screen flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage} alt="Full size" className="max-w-full max-h-screen object-contain rounded-lg" />
              <button onClick={closeImageViewer} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>, document.body
        )}
    </div>
  );
}
