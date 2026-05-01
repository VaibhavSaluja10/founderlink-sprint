import { FaPaperPlane } from 'react-icons/fa6';
import Button from '../Button';
import { TEAM_ROLES } from '../../constants/dashboard';
import { ui } from '../../styles/tailwind';

export default function TeamSection({
  accessibleTeamStartups,
  canManageTeam,
  inviteForm,
  isCoFounder,
  onInviteFormChange,
  onLoadTeamMembers,
  onRoleUpdate,
  onSelectedStartupChange,
  onSubmitInvite,
  selectedTeamStartupId,
  teamMembers,
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {canManageTeam ? 'Invite and manage roles for your co-founders and team members.' : 'View the teams you have joined as a co-founder.'}
      </p>
      <div className="mt-6">
        {accessibleTeamStartups.length > 0 ? (
          <div className={ui.panel}>
            <div className="mb-6 flex flex-col gap-2">
              <label className={ui.label}>Select Startup</label>
              <select
                className={`${ui.select} max-w-sm`}
                value={selectedTeamStartupId}
                onChange={(event) => {
                  onSelectedStartupChange(event.target.value);
                  onLoadTeamMembers(event.target.value);
                }}
              >
                <option value="">Choose startup</option>
                {accessibleTeamStartups.map((startup) => <option key={startup.id} value={startup.id}>{startup.startupName}</option>)}
              </select>
            </div>

            {canManageTeam && (
              <form className="mb-8 flex flex-col gap-3 md:flex-row" onSubmit={onSubmitInvite}>
                <input
                  type="email"
                  className={ui.input}
                  placeholder="Co-founder email"
                  value={inviteForm.invitedUserId}
                  onChange={(event) => onInviteFormChange({ ...inviteForm, invitedUserId: event.target.value })}
                />
                <select className={`${ui.select} md:max-w-52`} value={inviteForm.role} onChange={(event) => onInviteFormChange({ ...inviteForm, role: event.target.value })}>
                  {TEAM_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <Button type="submit" className={ui.primaryBtn}><FaPaperPlane aria-hidden="true" /> Send Invite</Button>
              </form>
            )}

            <div className="divide-y divide-slate-200">
              {teamMembers.map((member) => (
                <div key={member.id} className="grid grid-cols-1 items-center gap-4 py-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{member.invitedUserEmail?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="text-sm font-semibold">{member.invitedUserEmail}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Startup #{member.startupId}</div>
                    </div>
                  </div>

                  {canManageTeam ? (
                    <select
                      className={`${ui.select} max-w-48`}
                      value={member.role}
                      disabled={member.role === 'FOUNDER'}
                      onChange={(event) => onRoleUpdate(member.id, event.target.value)}
                    >
                      {member.role === 'FOUNDER' && <option value="FOUNDER">Founder</option>}
                      {TEAM_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm">{member.role === 'FOUNDER' ? 'Founder' : TEAM_ROLES.find((role) => role.value === member.role)?.label || member.role}</div>
                  )}

                  <div className={member.status === 'ACTIVE' ? 'text-sm font-semibold text-emerald-500' : 'text-sm font-semibold text-slate-500 dark:text-slate-400'}>{member.status}</div>
                </div>
              ))}
              {selectedTeamStartupId && teamMembers.length === 0 && <div className={ui.empty}><p>No team members yet.</p></div>}
            </div>
          </div>
        ) : (
          <div className={ui.empty}>
            <p>{isCoFounder ? 'Accept a founder invitation to view your startup team details.' : 'Create a startup first to manage your team.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
