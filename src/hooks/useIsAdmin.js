import { useEffect, useState } from 'react';
import { isAdmin } from '../lib/adminUtils';

export function useIsAdmin(userId) {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (!userId) {
      setAdmin(false);
      return;
    }
    isAdmin(userId).then(setAdmin);
  }, [userId]);

  return admin;
}
