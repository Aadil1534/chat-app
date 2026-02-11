import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getGroups,
  getUsers,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../lib/adminUtils';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState({
    groupName: '',
    projectName: '',
    employeeCount: 0,
    memberIds: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [g, u] = await Promise.all([getGroups(), getUsers()]);
      setGroups(g);
      setUsers(u);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await createGroup(form);
      setShowAddGroup(false);
      setForm({ groupName: '', projectName: '', employeeCount: 0, memberIds: [] });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroup) return;
    try {
      await updateGroup(editingGroup.id, form);
      setEditingGroup(null);
      setForm({ groupName: '', projectName: '', employeeCount: 0, memberIds: [] });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Delete this group?')) return;
    try {
      await deleteGroup(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (g) => {
    setEditingGroup(g);
    setForm({
      groupName: g.groupName || '',
      projectName: g.projectName || '',
      employeeCount: g.employeeCount ?? 0,
      memberIds: g.memberIds || [],
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="h-14 px-6 flex items-center justify-between bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddGroup(true)}
            className="px-4 py-2 bg-[#6C3EF4] text-white rounded-lg hover:bg-[#5b2ed9] transition-colors"
          >
            Add Group
          </button>
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="text-gray-600 dark:text-slate-300 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-48 p-4 border-r dark:border-slate-700 bg-white dark:bg-slate-800">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === 'groups'
                  ? 'bg-[#6C3EF4]/20 text-[#6C3EF4]'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === 'users'
                  ? 'bg-[#6C3EF4]/20 text-[#6C3EF4]'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              Users
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'groups' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow border dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Sr. No</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Group Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Project Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">No. of Employees</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td>
                    </tr>
                  ) : (
                    groups.map((g, i) => (
                      <tr key={g.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="p-4 text-gray-800 dark:text-slate-200">{i + 1}</td>
                        <td className="p-4 text-gray-800 dark:text-slate-200">{g.groupName || '-'}</td>
                        <td className="p-4 text-gray-800 dark:text-slate-200">{g.projectName || '-'}</td>
                        <td className="p-4 text-gray-800 dark:text-slate-200">{g.employeeCount ?? 0}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(g)}
                              className="px-2 py-1 text-xs font-medium text-[#6C3EF4] hover:underline"
                              title="View/Edit"
                            >
                              E
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(g.id)}
                              className="px-2 py-1 text-xs font-medium text-red-500 hover:underline"
                              title="Delete"
                            >
                              D
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow border dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Sr. No</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Email</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td>
                    </tr>
                  ) : (
                    users.map((u, i) => (
                      <tr key={u.uid} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="p-4 text-gray-800 dark:text-slate-200">{i + 1}</td>
                        <td className="p-4 text-gray-800 dark:text-slate-200">{u.name || u.email || '-'}</td>
                        <td className="p-4 text-gray-800 dark:text-slate-200">{u.email || '-'}</td>
                        <td className="p-4 text-gray-800 dark:text-slate-200">{u.mobileNumber || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddGroup(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add Group</h3>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Group Name</label>
                <input
                  value={form.groupName}
                  onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
                  className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Project Name</label>
                <input
                  value={form.projectName}
                  onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
                  className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">No. of Employees</label>
                <input
                  type="number"
                  min="0"
                  value={form.employeeCount}
                  onChange={(e) => setForm((f) => ({ ...f, employeeCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-[#6C3EF4] text-white rounded-lg hover:bg-[#5b2ed9]">
                  Create
                </button>
                <button type="button" onClick={() => setShowAddGroup(false)} className="flex-1 py-2 border dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingGroup(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Edit Group</h3>
            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Group Name</label>
                <input
                  value={form.groupName}
                  onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
                  className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Project Name</label>
                <input
                  value={form.projectName}
                  onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
                  className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">No. of Employees</label>
                <input
                  type="number"
                  min="0"
                  value={form.employeeCount}
                  onChange={(e) => setForm((f) => ({ ...f, employeeCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-[#6C3EF4] text-white rounded-lg hover:bg-[#5b2ed9]">
                  Update
                </button>
                <button type="button" onClick={() => setEditingGroup(null)} className="flex-1 py-2 border dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
