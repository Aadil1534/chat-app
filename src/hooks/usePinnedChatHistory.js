import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function usePinnedChatHistory(chatId) {
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setRecentMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    getDocs(q).then((snapshot) => {
      const msgs = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .reverse();
      setRecentMessages(msgs);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [chatId]);

  return { recentMessages, loading };
}
