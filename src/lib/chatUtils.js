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
  const recipientId = participants.find((id) => id !== currentUserId);

  const batch = writeBatch(db);

  const newMsgRef = doc(messagesRef);
  batch.set(newMsgRef, {
    senderId: currentUserId,
    text: text || '',
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
    seen: false,
  });

  const updateData = {
    lastMessage: messageContent,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: currentUserId,
  };
  if (recipientId) {
    updateData[`unreadCounts.${recipientId}`] = increment(1);
  }
  batch.update(chatRef, updateData);

  await batch.commit();
}

