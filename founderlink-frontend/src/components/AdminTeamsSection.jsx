import StatCard from './StatCard';
import { statusClass, ui } from '../styles/tailwind';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function AdminTeamsSection({ members, startups, loading, error, onRefresh }) {
  const getStartupName = (startupId) => {
    const startup = startups.find((item) => Number(item.id) === Number(startupId));
    return startup?.startupName || '-';
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Team Members</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monitor team invitations and accepted startup members across the platform.</p>
        </div>
        <button className={ui.primaryBtn} onClick={onRefresh}>Refresh Teams</button>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Records" value={members.length} sub="All team rows" />
        <StatCard label="Invited" value={members.filter((member) => member.status === 'INVITED').length} sub="Waiting response" />
        <StatCard label="Active" value={members.filter((member) => member.status === 'ACTIVE').length} sub="Joined members" />
        <StatCard label="Rejected" value={members.filter((member) => member.status === 'REJECTED').length} sub="Declined invites" />
      </div>

      <div className={`overflow-x-auto ${ui.panel}`}>
        {loading && <div className="flex h-52 items-center justify-center text-slate-500 dark:text-slate-400">Loading team members...</div>}
        {error && <div className="rounded-lg border border-rose-500 bg-rose-500 p-3 text-sm text-rose-500">{error}</div>}
        {!loading && members.length === 0 && !error && (
          <div className={ui.empty}>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">No team members found</h2>
            <p>Team invitations and joined members will appear here.</p>
          </div>
        )}
        {!loading && members.length > 0 && (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-white/10 text-left">
                {['Member ID', 'Startup ID', 'Startup Name', 'Invited User Email', 'Role', 'Status', 'Joined At'].map((heading) => <th key={heading} className="px-2 py-3">{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-slate-200 dark:border-white/10">
                  <td className="px-2 py-3">{member.id}</td>
                  <td className="px-2 py-3">{member.startupId}</td>
                  <td className="px-2 py-3 font-semibold">{getStartupName(member.startupId)}</td>
                  <td className="px-2 py-3">{member.invitedUserEmail}</td>
                  <td className="px-2 py-3">{member.role}</td>
                  <td className="px-2 py-3">
                    <span className={statusClass(member.status)}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-2 py-3">{formatDate(member.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
