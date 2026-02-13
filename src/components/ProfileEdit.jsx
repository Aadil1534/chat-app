import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { updateUserProfile, uploadProfilePhoto } from '../lib/profileUtils';

export default function ProfileEdit({ user, onClose }) {
  const [form, setForm] = useState({ name: '', about: '', mobileNumber: '', photoURL: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setForm({
          name: d.name || user.displayName || '',
          about: d.about || '',
          mobileNumber: d.mobileNumber || '',
          photoURL: d.photoURL || user.photoURL || null,
        });
      } else {
        setForm({
          name: user.displayName || '',
          about: '',
          mobileNumber: '',
          photoURL: user.photoURL || null,
        });
      }
      setLoading(false);
    });
  }, [user?.uid, user?.displayName]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    try {
      const parts = form.name.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      await updateUserProfile(user.uid, {
        name: form.name.trim(),
        firstName,
        lastName,
        about: form.about.trim(),
        mobileNumber: form.mobileNumber.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      setForm((f) => ({ ...f, photoURL: url }));
      await updateUserProfile(user.uid, { photoURL: url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const photoURL = form.photoURL ?? user?.photoURL;

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Edit Profile</h3>

      <div className="flex flex-col items-center mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative group"
        >
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden">
            {photoURL ? (
              <img src={photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-500 dark:text-slate-300">
                {(form.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-sm">Change</span>
          </div>
        </button>
        {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">About</label>
          <input
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            placeholder="Hey there! I am using ChatApp."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone Number</label>
          <input
            value={form.mobileNumber}
            onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))}
            className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            placeholder="+1234567890"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2 bg-[#6C3EF4] text-white rounded-lg hover:bg-[#5b2ed9] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 py-2 border dark:border-slate-600 rounded-lg">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
