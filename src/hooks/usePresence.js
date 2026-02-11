import { useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function usePresence(uid) {
  useEffect(() => {
    if (!uid) return;

    const userRef = doc(db, 'users', uid);
    updateDoc(userRef, { online: true, lastSeen: null }).catch(() => {});

    const handleBeforeUnload = () => {
      updateDoc(userRef, { online: false, lastSeen: serverTimestamp() }).catch(
        () => {}
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updateDoc(userRef, { online: false, lastSeen: serverTimestamp() }).catch(
        () => {}
      );
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [uid]);
}
