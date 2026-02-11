import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useIncomingCall(currentUserId) {
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, 'calls'),
      where('calleeId', '==', currentUserId),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc) {
        setIncomingCall({ id: doc.id, ...doc.data() });
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return incomingCall;
}
