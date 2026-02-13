import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useChats(currentUserId) {
  const [chats, setChats] = useState([]);
  const [pinnedChatIds, setPinnedChatIds] = useState([]);
  const [archivedChatIds, setArchivedChatIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setPinnedChatIds([]);
      setArchivedChatIds([]);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUserId);
    const unsubscribeUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPinnedChatIds(d.pinnedChats || []);
        setArchivedChatIds(d.archivedChats || []);
      }
    });

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUserId),
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const chatPromises = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const isGroup = data.isGroup === true;

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

        let chatList = await Promise.all(chatPromises);

        // Sort chats by lastMessageTime (latest first) on the client
        chatList = chatList.sort((a, b) => {
          const toMillis = (ts) => {
            if (!ts) return 0;
            if (typeof ts.toMillis === 'function') return ts.toMillis();
            if (ts.seconds) return ts.seconds * 1000;
            return 0;
          };
          return toMillis(b.lastMessageTime) - toMillis(a.lastMessageTime);
        });

        setChats(chatList);
        setLoading(false);

        // subscribe to other user docs so profile/photo changes propagate
        const otherIds = Array.from(new Set(chatList.filter((c) => !c.isGroup && c.otherUser?.uid).map((c) => c.otherUser.uid)));
        const unsubUsers = otherIds.map((uid) => {
          const uRef = doc(db, 'users', uid);
          return onSnapshot(uRef, (snap) => {
            const data = snap.exists() ? snap.data() : null;
            if (!data) return;
            setChats((prev) => prev.map((c) => (
              !c.isGroup && c.otherUser?.uid === uid ? { ...c, otherUser: { uid, ...data } } : c
            )));
          });
        });

        // cleanup user listeners when chats change
        // store on effect scope so returned cleanup can access
        useChats._unsubs = (useChats._unsubs || []).concat(unsubUsers);
      },
      (err) => {
        console.error('Chats listener error:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeUser();
      // unsubscribe any user listeners we created in previous run
      if (useChats._unsubs) {
        useChats._unsubs.forEach((u) => u && typeof u === 'function' && u());
        useChats._unsubs = [];
      }
    };
  }, [currentUserId]);

  return { chats, pinnedChatIds, archivedChatIds, loading };
}
