import StartupCard from '../StartupCard';
import { ui } from '../../styles/tailwind';

export function AdminStartupApprovalsPreview({ startups, onStatusChange }) {
  const pendingStartups = startups.filter((startup) => startup.status === 'PENDING');

  return (
    <div className={ui.gridCards}>
      {pendingStartups.slice(0, 4).map((startup) => (
        <StartupCard
          key={startup.id}
          startup={startup}
          isAdmin
          onStatusChange={(status) => onStatusChange(startup.id, status)}
        />
      ))}
      {pendingStartups.length === 0 && <div className={ui.empty}><p>No startup approvals pending.</p></div>}
    </div>
  );
}

export function OpportunityPreview({ opportunities }) {
  return (
    <div className={ui.gridCards}>
      {opportunities.slice(0, 3).map((startup) => (
        <StartupCard
          key={startup.id}
          startup={startup}

        />
      ))}
      {opportunities.length === 0 && <div className={ui.empty}><p>No approved opportunities available yet.</p></div>}
    </div>
  );
}
