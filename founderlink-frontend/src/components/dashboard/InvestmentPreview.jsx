import { statusClass, ui } from '../../styles/tailwind';

export default function InvestmentPreview({ investments }) {
  return (
    <div className={ui.gridCards}>
      {investments.slice(0, 3).map((investment) => (
        <div key={investment.id} className={`${ui.card} flex flex-col gap-4`}>
          <h3>Rs {Number(investment.amount).toLocaleString('en-IN')}</h3>
          <p>Startup ID: {investment.startupId}</p>
          <span className={statusClass(investment.status)}>{investment.status}</span>
        </div>
      ))}
      {investments.length === 0 && <div className={ui.empty}><p>No investments yet.</p></div>}
    </div>
  );
}
