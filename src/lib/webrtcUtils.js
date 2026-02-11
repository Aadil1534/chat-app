import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';

const CALLS_COLLECTION = 'calls';

export function createPeerConnection(onTrack) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });
  if (onTrack) {
    pc.ontrack = (e) => onTrack(e.streams[0]);
  }
  return pc;
}

export async function createOffer(pc, localStream) {
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function createAnswer(pc, offer, localStream) {
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function setRemoteAnswer(pc, answer) {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

export async function addIceCandidate(pc, candidate) {
  if (candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

export async function createCallDoc(chatId, callerId, calleeId, type, offer) {
  const callId = `call-${chatId}-${Date.now()}`;
  const ref = doc(db, CALLS_COLLECTION, callId);
  await setDoc(ref, {
    chatId,
    callerId,
    calleeId,
    type,
    offer: offer ? JSON.stringify(offer) : null,
    answer: null,
    iceCandidates: [],
    status: 'ringing',
    createdAt: new Date().toISOString(),
  });
  return callId;
}

export async function updateCallAnswer(callId, answer) {
  const ref = doc(db, CALLS_COLLECTION, callId);
  await updateDoc(ref, {
    answer: JSON.stringify(answer),
    status: 'active',
  });
}

export async function addIceToCall(callId, candidate, userId) {
  const ref = doc(db, CALLS_COLLECTION, callId);
  await updateDoc(ref, {
    iceCandidates: arrayUnion(JSON.stringify({ candidate, userId })),
  });
}

export async function endCall(callId) {
  const ref = doc(db, CALLS_COLLECTION, callId);
  await updateDoc(ref, { status: 'ended' });
}

export function subscribeToCall(callId, callback) {
  return onSnapshot(doc(db, CALLS_COLLECTION, callId), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}
