import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useChats(currentUserId) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUserId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const chatPromises = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const otherUserId = data.participants.find((id) => id !== currentUserId);
          let otherUser = { uid: otherUserId, name: 'Unknown' };

          if (otherUserId) {
            const userSnap = await getDoc(doc(db, 'users', otherUserId));
            if (userSnap.exists()) {
              otherUser = { uid: otherUserId, ...userSnap.data() };
            }
          }

          const unreadCount = data.unreadCounts?.[currentUserId] ?? 0;

          return {
            id: docSnap.id,
            ...data,
            otherUser,
            unreadCount,
          };
        });

        const chatList = await Promise.all(chatPromises);
        setChats(chatList);
        setLoading(false);
      },
      (err) => {
        console.error('Chats listener error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  return { chats, loading };
}
