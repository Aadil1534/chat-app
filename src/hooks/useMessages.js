import { useEffect, useState, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { markMessageSeen } from '../lib/chatUtils';

export function useMessages(chatId, currentUserId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatId || !currentUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setMessages(msgs);
        setLoading(false);

        // Mark messages as seen
        const chatRef = doc(db, 'chats', chatId);
        updateDoc(chatRef, {
          [`unreadCounts.${currentUserId}`]: 0,
        }).catch(() => {});

        // Mark incoming messages as seen (add currentUser to seenBy)
        const toMark = snapshot.docs
          .filter((d) => d.data().senderId !== currentUserId)
          .filter((d) => !(d.data().seenBy || []).includes(currentUserId))
          .slice(-20);
        toMark.forEach((d) => {
          markMessageSeen(chatId, d.id, currentUserId).catch(() => {});
        });
      },
      (err) => {
        console.error('Messages listener error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, currentUserId]);

  return { messages, loading, messagesEndRef, scrollToBottom };
}
