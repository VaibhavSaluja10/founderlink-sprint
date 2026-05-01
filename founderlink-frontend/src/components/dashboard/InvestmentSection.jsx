import InvestmentTable from '../InvestmentTable';
import { ui } from '../../styles/tailwind';

export default function InvestmentSection({
  busyInvestmentId,
  investments,
  onStatusUpdate,
  showActions = false,
  startups,
  title,
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View investment requests and their current status.</p>
      <div className={`mt-6 overflow-x-auto ${ui.panel}`}>
        <InvestmentTable
          investments={investments}
          startups={startups}
          showActions={showActions}
          onStatusUpdate={onStatusUpdate}
          busyInvestmentId={busyInvestmentId}
        />
      </div>
    </div>
  );
}
