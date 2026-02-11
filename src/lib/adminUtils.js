import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const ADMINS_COLLECTION = 'admins';
const GROUPS_COLLECTION = 'groups';

export async function isAdmin(uid) {
  const adminRef = doc(db, ADMINS_COLLECTION, uid);
  const snap = await getDoc(adminRef);
  return snap.exists();
}

export async function getGroups() {
  const snapshot = await getDocs(collection(db, GROUPS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createGroup(data) {
  const ref = doc(collection(db, GROUPS_COLLECTION));
  await setDoc(ref, {
    groupName: data.groupName || '',
    projectName: data.projectName || '',
    employeeCount: data.employeeCount ?? 0,
    memberIds: data.memberIds || [],
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateGroup(groupId, data) {
  const ref = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(ref, {
    ...(data.groupName !== undefined && { groupName: data.groupName }),
    ...(data.projectName !== undefined && { projectName: data.projectName }),
    ...(data.employeeCount !== undefined && { employeeCount: data.employeeCount }),
    ...(data.memberIds !== undefined && { memberIds: data.memberIds }),
  });
}

export async function deleteGroup(groupId) {
  await deleteDoc(doc(db, GROUPS_COLLECTION, groupId));
}

export async function getUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
}
