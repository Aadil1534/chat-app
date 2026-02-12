import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayRemove,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const ADMINS_COLLECTION = 'admins';

export async function isAdmin(uid) {
  const adminRef = doc(db, ADMINS_COLLECTION, uid);
  const snap = await getDoc(adminRef);
  return snap.exists();
}

export async function assignAdmin(uid) {
  const adminRef = doc(db, ADMINS_COLLECTION, uid);
  await setDoc(adminRef, { role: 'admin', assignedAt: new Date().toISOString() });
}

export async function revokeAdmin(uid) {
  await deleteDoc(doc(db, ADMINS_COLLECTION, uid));
}

export async function getAdminGroups() {
  const q = query(
    collection(db, 'chats'),
    where('isGroup', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createAdminGroup(adminId, data) {
  const memberIds = data.memberIds || [];
  const participants = [adminId, ...memberIds].filter((id, i, arr) => arr.indexOf(id) === i);
  const newChatRef = doc(collection(db, 'chats'));
  const unreadCounts = {};
  participants.forEach((id) => (unreadCounts[id] = 0));
  await setDoc(newChatRef, {
    participants,
    groupName: data.groupName || 'Group',
    projectName: data.projectName || '',
    groupImageURL: data.groupImageURL || null,
    isGroup: true,
    createdByAdmin: true,
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: null,
    unreadCounts,
    createdAt: new Date().toISOString(),
  });
  return newChatRef.id;
}

export async function updateAdminGroup(chatId, data) {
  const ref = doc(db, 'chats', chatId);
  const updates = {};
  if (data.groupName !== undefined) updates.groupName = data.groupName;
  if (data.projectName !== undefined) updates.projectName = data.projectName;
  if (data.groupImageURL !== undefined) updates.groupImageURL = data.groupImageURL;
  if (data.participants !== undefined) {
    updates.participants = data.participants;
    const unreadCounts = {};
    data.participants.forEach((id) => (unreadCounts[id] = 0));
    updates.unreadCounts = unreadCounts;
  }
  if (Object.keys(updates).length) await updateDoc(ref, updates);
}

export async function deleteAdminGroup(chatId) {
  await deleteDoc(doc(db, 'chats', chatId));
}

export async function addMemberToAdminGroup(chatId, userId) {
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

export async function removeMemberFromAdminGroup(chatId, userId) {
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const participants = (data.participants || []).filter((id) => id !== userId);
  const unreadCounts = { ...data.unreadCounts };
  delete unreadCounts[userId];
  await updateDoc(chatRef, { participants, unreadCounts });
}

export async function getUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  const users = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
  const adminIds = new Set();
  const adminSnap = await getDocs(collection(db, ADMINS_COLLECTION));
  adminSnap.docs.forEach((d) => adminIds.add(d.id));
  return users.map((u) => ({ ...u, isAdmin: adminIds.has(u.uid) }));
}

export async function updateUserByAdmin(uid, data) {
  const userRef = doc(db, 'users', uid);
  const updates = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.firstName !== undefined) updates.firstName = data.firstName;
  if (data.lastName !== undefined) updates.lastName = data.lastName;
  if (data.email !== undefined) updates.email = data.email;
  if (data.mobileNumber !== undefined) updates.mobileNumber = data.mobileNumber;
  if (data.about !== undefined) updates.about = data.about;
  if (Object.keys(updates).length) await updateDoc(userRef, updates);
}

export async function deleteUser(uid) {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', uid));
  const chatsSnap = await getDocs(q);
  for (const chatDoc of chatsSnap.docs) {
    const data = chatDoc.data();
    const participants = (data.participants || []).filter((id) => id !== uid);
    if (participants.length === 0) {
      await deleteDoc(doc(db, 'chats', chatDoc.id));
    } else {
      const unreadCounts = { ...data.unreadCounts };
      delete unreadCounts[uid];
      await updateDoc(doc(db, 'chats', chatDoc.id), { participants, unreadCounts });
    }
  }
  await deleteDoc(doc(db, 'users', uid));
  await deleteDoc(doc(db, ADMINS_COLLECTION, uid));
}
