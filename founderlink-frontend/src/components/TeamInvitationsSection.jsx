import Button from './Button';
import { ui } from '../styles/tailwind';

export default function TeamInvitationsSection({ invitations, onAction }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Team Invitations</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Accept or reject founder invitations to join startup teams.</p>
      <div className={`mt-6 ${ui.panel}`}>
        {invitations.length === 0 ? (
          <div className={ui.empty}>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">No invitations</h2>
            <p>Founder invitations will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {invitations.map((invite) => (
              <div key={invite.id} className="grid grid-cols-1 items-center gap-3 rounded-lg border border-slate-200 dark:border-white/10 p-4 md:grid-cols-3">
                <div>
                  <div className="font-semibold">Startup #{invite.startupId}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Role: {invite.role}</div>
                </div>
                <div className={invite.status === 'ACTIVE' ? 'text-sm font-semibold text-emerald-500' : 'text-sm font-semibold text-slate-500 dark:text-slate-400'}>{invite.status}</div>
                {invite.status === 'INVITED' && (
                  <div className="flex gap-2">
                    <Button className={ui.primaryBtn} onClick={() => onAction(invite.id, 'ACCEPT')}>Accept</Button>
                    <Button className={ui.textBtn} onClick={() => onAction(invite.id, 'REJECT')}>Reject</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
