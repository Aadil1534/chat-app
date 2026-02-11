import { useState, useCallback } from 'react';

export function useCall() {
  const [activeCall, setActiveCall] = useState(null);

  const startCall = useCallback((chatId, callerId, calleeId, type, otherUser) => {
    setActiveCall({
      callId: null,
      chatId,
      callerId,
      calleeId,
      type,
      initiator: true,
      otherUser: otherUser || null,
    });
  }, []);

  const acceptCall = useCallback((call, otherUser) => {
    setActiveCall({
      ...call,
      initiator: false,
      otherUser: otherUser || call.otherUser,
    });
  }, []);

  const setOtherUser = useCallback((user) => {
    setActiveCall((c) => (c ? { ...c, otherUser: user } : null));
  }, []);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return { activeCall, startCall, acceptCall, setOtherUser, endCall };
}
