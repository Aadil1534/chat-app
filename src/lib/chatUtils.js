import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export async function createGroupChat(creatorId, groupName, groupImageUrl, memberIds) {
  const participants = [creatorId, ...(memberIds || [])].filter(Boolean);
  const newChatRef = doc(collection(db, 'chats'));
  const unreadCounts = {};
  participants.forEach((id) => (unreadCounts[id] = 0));
  await setDoc(newChatRef, {
    participants,
    groupName: groupName || 'Group',
    groupImageURL: groupImageUrl || null,
    isGroup: true,
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: null,
    unreadCounts,
  });
  return newChatRef.id;
}

export async function addMemberToGroup(chatId, userId) {
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const participants = data.participants || [];
  if (participants.includes(userId)) return;
  await updateDoc(chatRef, {
    participants: [...participants, userId],
    [`unreadCounts.${userId}`]: 0,
  });
}

export async function removeMemberFromGroup(chatId, userId) {
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const participants = (data.participants || []).filter((id) => id !== userId);
  await updateDoc(chatRef, { participants });
}

export async function getOrCreateChat(currentUserId, otherUserId) {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', currentUserId)
  );
  const snapshot = await getDocs(q);

  const existingChat = snapshot.docs.find((docSnap) => {
    const data = docSnap.data();
    return (
      data.participants.includes(currentUserId) &&
      data.participants.includes(otherUserId) &&
      data.participants.length === 2
    );
  });

  if (existingChat) return existingChat.id;

  const newChatRef = doc(collection(db, 'chats'));
  await setDoc(newChatRef, {
    participants: [currentUserId, otherUserId],
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    unreadCounts: { [currentUserId]: 0, [otherUserId]: 0 },
  });
  return newChatRef.id;
}

export async function sendMessage(chatId, currentUserId, text, imageFile = null) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const chatRef = doc(db, 'chats', chatId);

  let imageUrl = null;
  if (imageFile) {
    const storageRef = ref(
      storage,
      `chat-images/${chatId}/${Date.now()}-${imageFile.name}`
    );
    await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }

  const messageContent = text || (imageUrl ? 'Photo' : '');

  const chatSnap = await getDoc(chatRef);
  const participants = chatSnap.data()?.participants || [];
  const recipientIds = participants.filter((id) => id !== currentUserId);

  const batch = writeBatch(db);

  const newMsgRef = doc(messagesRef);
  batch.set(newMsgRef, {
    senderId: currentUserId,
    text: text || '',
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
    seenBy: [],
    starredBy: [],
    deleted: false,
  });

  const updateData = {
    lastMessage: messageContent,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: currentUserId,
  };
  recipientIds.forEach((id) => {
    updateData[`unreadCounts.${id}`] = increment(1);
  });
  batch.update(chatRef, updateData);

  await batch.commit();
}

export async function markMessageSeen(chatId, messageId, userId) {
  const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const seenBy = data.seenBy || [];
  if (seenBy.includes(userId)) return;
  await updateDoc(msgRef, { seenBy: [...seenBy, userId] });
}

export async function deleteMessage(chatId, messageId, userId) {
  const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.senderId !== userId) return;
  await updateDoc(msgRef, { deleted: true, text: '', imageUrl: null });
}

export async function toggleMessageStarred(chatId, messageId, userId) {
  const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const starredBy = data.starredBy || [];
  const next = starredBy.includes(userId)
    ? starredBy.filter((id) => id !== userId)
    : [...starredBy, userId];
  await updateDoc(msgRef, { starredBy: next });
}

export async function togglePinChat(chatId, userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};
  const pinnedChats = userData.pinnedChats || [];
  
  if (pinnedChats.includes(chatId)) {
    await updateDoc(userRef, {
      pinnedChats: pinnedChats.filter((id) => id !== chatId),
    });
  } else {
    await updateDoc(userRef, {
      pinnedChats: [...pinnedChats, chatId],
    });
  }
}

