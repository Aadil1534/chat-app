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
  const [pinnedChatIds, setPinnedChatIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setPinnedChatIds([]);
      setLoading(false);
      return;
    }

    // Fetch user's pinned chats
    const userRef = doc(db, 'users', currentUserId);
    const unsubscribeUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setPinnedChatIds(snap.data().pinnedChats || []);
      }
    });

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
          const isGroup = data.isGroup && data.participants?.length > 2;

          let otherUser = { name: 'Unknown' };
          if (isGroup) {
            otherUser = {
              name: data.groupName || 'Group',
              photoURL: data.groupImageURL,
              isGroup: true,
              participants: data.participants || [],
            };
          } else {
            const otherUserId = data.participants?.find((id) => id !== currentUserId);
            if (otherUserId) {
              const userSnap = await getDoc(doc(db, 'users', otherUserId));
              otherUser = userSnap.exists()
                ? { uid: otherUserId, ...userSnap.data() }
                : { uid: otherUserId, name: 'Unknown' };
            }
          }

          const unreadCount = data.unreadCounts?.[currentUserId] ?? 0;

          return {
            id: docSnap.id,
            ...data,
            otherUser,
            unreadCount,
            isGroup,
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

    return () => {
      unsubscribe();
      unsubscribeUser();
    };
  }, [currentUserId]);

  return { chats, pinnedChatIds, loading };
}
