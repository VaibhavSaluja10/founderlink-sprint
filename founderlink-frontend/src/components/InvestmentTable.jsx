import Button from './Button';
import { statusClass, ui } from '../styles/tailwind';

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString('en-IN');
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function InvestmentTable({
  investments,
  startups = [],
  showActions = false,
  onStatusUpdate,
  busyInvestmentId = null,
}) {
  const getStartupName = (startupId) => {
    const startup = startups.find((item) => Number(item.id) === Number(startupId));
    return startup?.startupName || '-';
  };

  if (investments.length === 0) {
    return (
      <div className={ui.empty}>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">No investments found</h2>
        <p>Investment data will appear here once requests are created.</p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b-2 border-slate-200 dark:border-white/10 text-left">
          {['ID', 'Amount', 'Comment', 'Investor Email', 'Startup ID', 'Startup Name', 'Created At', 'Status'].map((heading) => <th key={heading} className="px-2 py-3">{heading}</th>)}
          {showActions && <th className="px-2 py-3">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {investments.map((investment) => {
          const isApproved = investment.status === 'APPROVED';
          const isDisapproved = investment.status === 'DISAPPROVED';
          const isBusy = Number(busyInvestmentId) === Number(investment.id);

          return (
            <tr key={investment.id} className="border-b border-slate-200 dark:border-white/10">
              <td className="px-2 py-3">{investment.id}</td>
              <td className="px-2 py-3">Rs {formatAmount(investment.amount)}</td>
              <td className="px-2 py-3">{investment.comment || '-'}</td>
              <td className="px-2 py-3">{investment.investorEmail}</td>
              <td className="px-2 py-3">{investment.startupId}</td>
              <td className="px-2 py-3 font-semibold">{getStartupName(investment.startupId)}</td>
              <td className="px-2 py-3">{formatDate(investment.createdAt)}</td>
              <td className="px-2 py-3">
                <span className={statusClass(investment.status)}>
                  {investment.status}
                </span>
              </td>
              {showActions && (
                <td className="flex flex-wrap gap-2 px-2 py-3">
                  {isBusy ? (
                    <span className={statusClass('PENDING')}>Updating...</span>
                  ) : null}
                  {!isApproved && (
                    <Button className={ui.primaryBtn} disabled={isBusy} onClick={() => onStatusUpdate(investment.id, 'APPROVED')}>
                      Approve
                    </Button>
                  )}
                  {!isDisapproved && (
                    <Button className={ui.textBtn} disabled={isBusy} onClick={() => onStatusUpdate(investment.id, 'DISAPPROVED')}>
                      Disapprove
                    </Button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
