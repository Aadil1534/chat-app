import { useState, useEffect, useRef } from 'react';
import {
  createPeerConnection,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
  createCallDoc,
  updateCallAnswer,
  addIceToCall,
  endCall,
  subscribeToCall,
} from '../lib/webrtcUtils';

export default function CallModal({
  callId: initialCallId,
  chatId,
  callerId,
  calleeId,
  type,
  initiator,
  currentUserId,
  otherUser,
  onEnd,
}) {
  const [callId, setCallId] = useState(initialCallId);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const isVideo = type === 'video';

  useEffect(() => {
    let unsubscribe;
    let resolvedCallId = callId;

    const run = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideo,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = createPeerConnection((remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setStatus('connected');
        });

        pc.onicecandidate = (e) => {
          if (e.candidate && resolvedCallId) {
            addIceToCall(resolvedCallId, e.candidate.toJSON(), currentUserId).catch(() => {});
          }
        };

        pcRef.current = pc;

        if (initiator && !resolvedCallId) {
          const offer = await createOffer(pc, stream);
          resolvedCallId = await createCallDoc(chatId, callerId, calleeId, type, offer);
          setCallId(resolvedCallId);
        }

        if (!resolvedCallId) return;

        unsubscribe = subscribeToCall(resolvedCallId, async (data) => {
          if (data.status === 'ended') {
            onEnd();
            return;
          }
          if (data.answer && initiator) {
            await setRemoteAnswer(pc, JSON.parse(data.answer));
          }
          if (data.offer && !initiator) {
            const answer = await createAnswer(pc, JSON.parse(data.offer), stream);
            await updateCallAnswer(resolvedCallId, answer);
          }
          const cands = data.iceCandidates || [];
          for (const c of cands) {
            const { candidate, userId } = typeof c === 'string' ? JSON.parse(c) : c;
            if (userId !== currentUserId && candidate) {
              await addIceCandidate(pc, candidate);
            }
          }
        });
      } catch (err) {
        setError(err.message || 'Could not access media');
        setStatus('error');
      }
    };

    run();
    return () => {
      unsubscribe?.();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [initialCallId, chatId, callerId, calleeId, initiator, type, currentUserId]);

  const handleEnd = async () => {
    if (callId) await endCall(callId).catch(() => {});
    onEnd();
  };

  const name = otherUser?.name || 'Unknown';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex flex-col items-center gap-4">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <>
              {isVideo && (
                <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute bottom-2 right-2 w-32 h-24 object-cover rounded-lg border-2 border-slate-600"
                  />
                </div>
              )}
              {!isVideo && (
                <div className="w-20 h-20 rounded-full bg-[#6C3EF4]/30 flex items-center justify-center">
                  <span className="text-4xl">📞</span>
                </div>
              )}
              <h3 className="text-white font-semibold text-lg">{name}</h3>
              <p className="text-slate-400 text-sm">{status}</p>
              <div className="flex gap-4">
                <button
                  onClick={handleEnd}
                  className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  End Call
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
