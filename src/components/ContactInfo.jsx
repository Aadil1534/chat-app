import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';

export default function ContactInfo({ selectedChat, currentUser, otherUser }) {
  const [userData, setUserData] = useState(null);
  const [mediaUrls, setMediaUrls] = useState([]);

  useEffect(() => {
    if (otherUser?.uid) {
      getDoc(doc(db, 'users', otherUser.uid)).then((snap) => {
        if (snap.exists()) setUserData(snap.data());
      });
    }
  }, [otherUser?.uid]);

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

  if (!selectedChat) {
    return (
      <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col items-center justify-center text-gray-500">
        <p className="text-sm">Select a chat to view contact info</p>
      </div>
    );
  }

  const displayName = userData?.name || otherUser?.name || 'Unknown';
  const photoURL = userData?.photoURL || otherUser?.photoURL;
  const isOnline = userData?.online ?? false;

  return (
    <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-6 flex flex-col items-center border-b border-gray-100">
        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
          {photoURL ? (
            <img src={photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-500">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 text-lg">{displayName}</h3>
        <p className="text-sm text-gray-500">+1 234 567 8900</p>
        <div className="flex gap-2 mt-4">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg
              className="w-5 h-5 text-gray-600"
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
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg
              className="w-5 h-5 text-gray-600"
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

      <div className="p-4 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          About
        </h4>
        <p className="text-sm text-gray-700">Hey there! I am using ChatApp.</p>
      </div>

      <div className="p-4 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Media, Links & Docs
        </h4>
        <div className="flex gap-2 flex-wrap">
          {mediaUrls.length > 0 ? (
            mediaUrls.slice(0, 6).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover"
              />
            ))
          ) : (
            <p className="text-sm text-gray-400">No media yet</p>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        <button className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
          <svg
            className="w-5 h-5 text-gray-500"
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
          <span className="text-sm text-gray-700">Starred Messages</span>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Mute Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6C3EF4]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
