import { useState } from 'react';
import Button from './Button';
import StatCard from './StatCard';
import { statusClass, ui } from '../styles/tailwind';

function formatRole(role) {
  return role.replace('ROLE_', '').replace('_', ' ');
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function AdminUsersSection({ users, loading, error, onRefresh, onSaveProfile }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    skills: '',
    experience: '',
    bio: '',
    portfolioLinks: '',
  });

  const totalUsers = users.length;
  const founders = users.filter((user) => user.roles?.includes('ROLE_FOUNDER')).length;
  const investors = users.filter((user) => user.roles?.includes('ROLE_INVESTOR')).length;
  const cofounders = users.filter((user) => user.roles?.includes('ROLE_COFOUNDER')).length;

  const handleSelectUser = (registeredUser) => {
    setSelectedUser(registeredUser);
    setFormData({
      skills: registeredUser.profile?.skills || '',
      experience: registeredUser.profile?.experience || '',
      bio: registeredUser.profile?.bio || '',
      portfolioLinks: registeredUser.profile?.portfolioLinks || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await onSaveProfile(selectedUser, formData);
    setSelectedUser(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Users</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View auth users with user-service profile details. Click a user to edit profile fields.</p>
        </div>
        <Button className={ui.primaryBtn} onClick={onRefresh}>Refresh Users</Button>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} sub="Registered accounts" />
        <StatCard label="Founders" value={founders} sub="Startup owners" />
        <StatCard label="Investors" value={investors} sub="Funding accounts" />
        <StatCard label="Co-founders" value={cofounders} sub="Team builder accounts" />
      </div>

      <div className={`overflow-x-auto ${ui.panel}`}>
        {loading && <div className="flex h-52 items-center justify-center text-slate-500 dark:text-slate-400">Loading registered users...</div>}
        {error && <div className="rounded-lg border border-rose-500 bg-rose-500 p-3 text-sm text-rose-500">{error}</div>}
        {!loading && users.length === 0 && !error && (
          <div className={ui.empty}>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">No users found</h2>
            <p>Registered users will appear here.</p>
          </div>
        )}
        {!loading && users.length > 0 && (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-white/10 text-left">
                {['ID', 'Name', 'Email', 'Role', 'Skills', 'Experience', 'Bio', 'Portfolio Link', 'Created At'].map((heading) => <th key={heading} className="px-2 py-3">{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map((registeredUser) => (
                <tr
                  key={registeredUser.id}
                  onClick={() => handleSelectUser(registeredUser)}
                  className={`cursor-pointer border-b border-slate-200 dark:border-white/10 ${selectedUser?.id === registeredUser.id ? 'bg-violet-500' : 'hover'}`}
                >
                  <td className="px-2 py-3">{registeredUser.id}</td>
                  <td className="px-2 py-3 font-semibold">{registeredUser.name}</td>
                  <td className="px-2 py-3">{registeredUser.email}</td>
                  <td className="px-2 py-3">
                    {(registeredUser.roles || []).map((role) => (
                      <span key={role} className={`${statusClass('APPROVED')} mr-1.5`}>
                        {formatRole(role)}
                      </span>
                    ))}
                  </td>
                  <td className="px-2 py-3">{registeredUser.profile?.skills || '-'}</td>
                  <td className="px-2 py-3">{registeredUser.profile?.experience || '-'}</td>
                  <td className="max-w-64 px-2 py-3">{registeredUser.profile?.bio || '-'}</td>
                  <td className="px-2 py-3">{registeredUser.profile?.portfolioLinks || '-'}</td>
                  <td className="px-2 py-3">{formatDate(registeredUser.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && (
        <div className={`mt-5 ${ui.panel}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3>Edit User Profile</h3>
              <p>{selectedUser.name} - {selectedUser.email}</p>
            </div>
            <Button className={ui.textBtn} onClick={() => setSelectedUser(null)}>Close</Button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                className={ui.input}
                placeholder="Skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
              <input
                className={ui.input}
                placeholder="Experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
            <textarea
              className={ui.textarea}
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
            />
            <input
              className={ui.input}
              placeholder="Portfolio Link"
              value={formData.portfolioLinks}
              onChange={(e) => setFormData({ ...formData, portfolioLinks: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button type="submit" className={ui.primaryBtn}>Save Profile Changes</Button>
              <Button className={ui.textBtn} onClick={() => setSelectedUser(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
