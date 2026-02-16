import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadGroupPhoto } from '../lib/profileUtils';
import {
  getAdminGroups,
  getUsers,
  createAdminGroup,
  updateAdminGroup,
  deleteAdminGroup,
  addMemberToAdminGroup,
  removeMemberFromAdminGroup,
  deleteUser,
  assignAdmin,
  revokeAdmin,
  updateUserByAdmin,
} from '../lib/adminUtils';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const groupIconInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentGroupPage, setCurrentGroupPage] = useState(0);
  const [currentUserPage, setCurrentUserPage] = useState(0);
  const itemsPerPage = 5;
  const [form, setForm] = useState({
    groupName: '',
    projectName: '',
    memberIds: [],
    groupImageURL: null,
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    about: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [g, u] = await Promise.all([getAdminGroups(), getUsers()]);
      setGroups(g);
      setUsers(u);
      setCurrentGroupPage(0);
      setCurrentUserPage(0);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({ groupName: '', projectName: '', memberIds: [], groupImageURL: null });
    setShowAddGroup(false);
    setEditingGroup(null);
    setSelectedGroup(null);
  };

  const resetUserForm = () => {
    setUserForm({ name: '', email: '', mobileNumber: '', about: '' });
    setEditingUser(null);
  };

  const handleGroupIconChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadGroupPhoto(editingGroup?.id || '', file);
      setForm((prev) => ({ ...prev, groupImageURL: url }));
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateAdminGroup(editingGroup.id, {
          groupName: form.groupName,
          projectName: form.projectName,
          groupImageURL: form.groupImageURL,
        });
      } else {
        await createAdminGroup(currentUser.uid, {
          groupName: form.groupName,
          projectName: form.projectName,
          memberIds: form.memberIds,
          groupImageURL: form.groupImageURL,
        });
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await deleteAdminGroup(id);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm('Delete this user? Their Firestore data will be removed.')) return;
    try {
      await deleteUser(uid);
      resetUserForm();
      loadData();
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const handleToggleAdmin = async (uid, currentlyAdmin) => {
    try {
      if (currentlyAdmin) {
        await revokeAdmin(uid);
      } else {
        await assignAdmin(uid);
      }
      loadData();
    } catch (err) {
      console.error('Toggle admin error:', err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUserByAdmin(editingUser.uid, userForm);
      resetUserForm();
      loadData();
    } catch (err) {
      console.error('Update user error:', err);
    }
  };

  const openEdit = (g) => {
    setEditingGroup(g);
    setForm({
      groupName: g.groupName || '',
      projectName: g.projectName || '',
      memberIds: g.participants || [],
      groupImageURL: g.groupImageURL || null,
    });
    setSelectedGroup(null);
  };

  const openGroupDetail = (g) => {
    setSelectedGroup(g);
    setEditingGroup(null);
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      mobileNumber: u.mobileNumber || '',
      about: u.about || '',
    });
  };

  const handleAddMember = async (userId) => {
    if (!selectedGroup?.id) return;
    try {
      await addMemberToAdminGroup(selectedGroup.id, userId);
      loadData();
      setSelectedGroup((prev) => ({
        ...prev,
        participants: [...(prev?.participants || []), userId],
      }));
    } catch (err) {
      console.error('Add member error:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedGroup?.id) return;
    try {
      await removeMemberFromAdminGroup(selectedGroup.id, userId);
      loadData();
      setSelectedGroup((prev) => ({
        ...prev,
        participants: (prev?.participants || []).filter((id) => id !== userId),
      }));
    } catch (err) {
      console.error('Remove member error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      <header className="h-14 px-6 flex items-center justify-between bg-white dark:bg-slate-800 border-b dark:border-slate-700 shrink-0">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddGroup(true)}
            className="px-4 py-2 bg-[#6C3EF4] text-white rounded-lg hover:bg-[#5b2ed9] transition-all font-medium text-sm"
          >
            + Add Group
          </button>
          <button
            onClick={() => { signOut(); navigate('/login'); }}
            className="text-gray-500 dark:text-slate-400 hover:text-red-500 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 p-4 border-r dark:border-slate-700 bg-white dark:bg-slate-800">
          <nav className="space-y-2">
            {['groups', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedGroup(null); setEditingUser(null); setCurrentGroupPage(0); setCurrentUserPage(0); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl capitalize font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#6C3EF4]/10 text-[#6C3EF4]'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'groups' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Sr. No</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Group Name</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Project</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Members</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {loading ? (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">Fetching data...</td></tr>
                  ) : (
                    (() => {
                      const paginatedGroups = groups.slice(currentGroupPage * itemsPerPage, (currentGroupPage + 1) * itemsPerPage);
                      const startIndex = currentGroupPage * itemsPerPage;
                      return paginatedGroups.length === 0 && currentGroupPage > 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">No groups on this page</td></tr>
                      ) : (
                        paginatedGroups.map((g, i) => (
                          <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="p-4 text-gray-700 dark:text-slate-300 font-medium">{startIndex + i + 1}</td>
                            <td className="p-4">
                              <button
                                onClick={() => openGroupDetail(g)}
                                className="text-[#6C3EF4] hover:underline font-semibold text-left"
                              >
                                {g.groupName || '-'}
                              </button>
                            </td>
                            <td className="p-4 text-gray-600 dark:text-slate-400">{g.projectName || '-'}</td>
                            <td className="p-4 text-gray-600 dark:text-slate-400">{(g.participants || []).length}</td>
                            <td className="p-4">
                              <div className="flex justify-center gap-3">
                                <button onClick={() => openEdit(g)} className="text-blue-500 hover:underline text-sm font-bold">Edit</button>
                                <button onClick={() => handleDeleteGroup(g.id)} className="text-red-500 hover:underline text-sm font-bold">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      );
                    })()
                  )}
                </tbody>
              </table>
              {!loading && groups.length > itemsPerPage && (
                <div className="p-4 border-t dark:border-slate-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Showing {currentGroupPage * itemsPerPage + 1} to {Math.min((currentGroupPage + 1) * itemsPerPage, groups.length)} of {groups.length} groups
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentGroupPage(prev => Math.max(0, prev - 1))}
                      disabled={currentGroupPage === 0}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(groups.length / itemsPerPage) }).map((_, pageIdx) => (
                        <button
                          key={pageIdx}
                          onClick={() => setCurrentGroupPage(pageIdx)}
                          className={`w-8 h-8 rounded-lg font-medium text-sm transition-colors ${
                            currentGroupPage === pageIdx
                              ? 'bg-[#6C3EF4] text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {pageIdx + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentGroupPage(prev => prev + 1)}
                      disabled={currentGroupPage >= Math.ceil(groups.length / itemsPerPage) - 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Sr. No</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Username</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Email</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Admin</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {loading ? (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">Fetching data...</td></tr>
                  ) : (
                    (() => {
                      const paginatedUsers = users.slice(currentUserPage * itemsPerPage, (currentUserPage + 1) * itemsPerPage);
                      const startIndex = currentUserPage * itemsPerPage;
                      return paginatedUsers.length === 0 && currentUserPage > 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">No users on this page</td></tr>
                      ) : (
                        paginatedUsers.map((u, i) => (
                          <tr key={u.uid || i} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="p-4 text-gray-700 dark:text-slate-300 font-medium">{startIndex + i + 1}</td>
                            <td className="p-4 text-gray-800 dark:text-white font-semibold">{u.name || 'Unknown User'}</td>
                            <td className="p-4 text-gray-600 dark:text-slate-400">{u.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-xs ${u.isAdmin ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                                {u.isAdmin ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-3">
                                <button onClick={() => openEditUser(u)} className="text-blue-500 hover:underline text-sm font-bold">Edit</button>
                                <button onClick={() => handleToggleAdmin(u.uid, u.isAdmin)} className="text-purple-500 hover:underline text-sm font-bold">
                                  {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                </button>
                                <button onClick={() => handleDeleteUser(u.uid)} className="text-red-500 hover:underline text-sm font-bold">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      );
                    })()
                  )}
                </tbody>
              </table>
              {!loading && users.length > itemsPerPage && (
                <div className="p-4 border-t dark:border-slate-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Showing {currentUserPage * itemsPerPage + 1} to {Math.min((currentUserPage + 1) * itemsPerPage, users.length)} of {users.length} members
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentUserPage(prev => Math.max(0, prev - 1))}
                      disabled={currentUserPage === 0}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(users.length / itemsPerPage) }).map((_, pageIdx) => (
                        <button
                          key={pageIdx}
                          onClick={() => setCurrentUserPage(pageIdx)}
                          className={`w-8 h-8 rounded-lg font-medium text-sm transition-colors ${
                            currentUserPage === pageIdx
                              ? 'bg-[#6C3EF4] text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {pageIdx + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentUserPage(prev => prev + 1)}
                      disabled={currentUserPage >= Math.ceil(users.length / itemsPerPage) - 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGroup.groupName || 'Group'}</h2>
              <button onClick={() => setSelectedGroup(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-2">Current Members</h3>
              <ul className="space-y-2 mb-6">
                {(selectedGroup.participants || []).map((pid) => {
                  const usr = users.find((x) => x.uid === pid);
                  return (
                    <li key={pid} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-gray-800 dark:text-white">{usr?.name || usr?.email || pid}</span>
                      <button onClick={() => handleRemoveMember(pid)} className="text-red-500 hover:underline text-sm">Remove</button>
                    </li>
                  );
                })}
              </ul>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-2">Add User</h3>
              <ul className="space-y-1">
                {users
                  .filter((u) => !(selectedGroup.participants || []).includes(u.uid))
                  .map((u) => (
                    <li key={u.uid} className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 rounded-lg">
                      <span className="text-gray-700 dark:text-slate-300">{u.name || u.email}</span>
                      <button onClick={() => handleAddMember(u.uid)} className="text-[#6C3EF4] hover:underline text-sm font-medium">Add</button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Group Modal */}
      {(showAddGroup || editingGroup) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center mb-4">
                <input
                  ref={groupIconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGroupIconChange}
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => groupIconInputRef.current?.click()}
                  disabled={uploading}
                  className="relative group"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden flex items-center justify-center text-white">
                    {form.groupImageURL ? (
                      <img src={form.groupImageURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold">📁</span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-medium">Upload Icon</span>
                  </div>
                </button>
                {uploading && <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Uploading...</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Group Name</label>
                <input
                  required
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-[#6C3EF4] outline-none transition-all"
                  value={form.groupName}
                  onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  placeholder="Marketing Team"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Project Name</label>
                <input
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-[#6C3EF4] outline-none transition-all"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  placeholder="Q1 Strategy"
                />
              </div>
              {!editingGroup && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                    Select Members ({form.memberIds.length})
                  </label>
                  <div className="border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 p-3 max-h-48 overflow-y-auto space-y-2">
                    {users.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No users available</p>
                    ) : (
                      users.map((user) => (
                        <label key={user.uid} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.memberIds.includes(user.uid)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, memberIds: [...form.memberIds, user.uid] });
                              } else {
                                setForm({ ...form, memberIds: form.memberIds.filter((id) => id !== user.uid) });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[#6C3EF4] focus:ring-2 focus:ring-[#6C3EF4]"
                          />
                          <span className="text-sm text-gray-700 dark:text-slate-300">{user.name || user.email}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#6C3EF4] text-white font-bold rounded-xl hover:bg-[#5b2ed9] shadow-lg shadow-purple-500/30 transition-all">
                  {editingGroup ? 'Save Changes' : 'Confirm Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit User</h2>
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Mobile</label>
                <input
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white"
                  value={userForm.mobileNumber}
                  onChange={(e) => setUserForm({ ...userForm, mobileNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">About</label>
                <input
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white"
                  value={userForm.about}
                  onChange={(e) => setUserForm({ ...userForm, about: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={resetUserForm} className="flex-1 px-4 py-3 text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#6C3EF4] text-white font-bold rounded-xl hover:bg-[#5b2ed9]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
