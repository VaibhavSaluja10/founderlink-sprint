import { useState } from 'react';
import Button from './Button';
import { userAPI } from '../services/api';
import { ui } from '../styles/tailwind';

export default function ProfileSection({ user, profile, setProfile, reloadProfile }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profile?.id) {
        await userAPI.updateProfile(profile.id, profile);
      } else {
        await userAPI.createProfile({ name: user.name, ...profile });
      }
      setIsEditing(false);
      reloadProfile();
    } catch (err) {
      alert(err.message || 'Failed to save profile.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your user-service profile here.</p>
      <div className={`mt-6 ${ui.panel}`}>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input className={ui.input} placeholder="Skills" value={profile?.skills || ''} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} />
            <input className={ui.input} placeholder="Experience" value={profile?.experience || ''} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} />
            <textarea className={ui.textarea} placeholder="Bio" value={profile?.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            <input className={ui.input} placeholder="Portfolio Links" value={profile?.portfolioLinks || ''} onChange={(e) => setProfile({ ...profile, portfolioLinks: e.target.value })} />
            <div className="flex gap-3">
              <Button type="submit" className={ui.primaryBtn}>Save Profile</Button>
              <Button className={ui.textBtn} onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <p><strong>Email:</strong> {profile?.email || user.email}</p>
            <p><strong>Name:</strong> {profile?.name || user.name}</p>
            <p><strong>Skills:</strong> {profile?.skills || '-'}</p>
            <p><strong>Experience:</strong> {profile?.experience || '-'}</p>
            <p><strong>Bio:</strong> {profile?.bio || '-'}</p>
            <Button className={ui.outlineBtn} onClick={() => setIsEditing(true)}>
              {profile ? 'Edit Profile' : 'Create Profile'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
