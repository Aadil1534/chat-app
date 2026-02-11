import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.firstName !== undefined && { firstName: data.firstName }),
    ...(data.lastName !== undefined && { lastName: data.lastName }),
    ...(data.about !== undefined && { about: data.about }),
    ...(data.mobileNumber !== undefined && { mobileNumber: data.mobileNumber }),
    ...(data.photoURL !== undefined && { photoURL: data.photoURL }),
  });
}

export async function uploadProfilePhoto(uid, file) {
  const storageRef = ref(storage, `profile-photos/${uid}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
