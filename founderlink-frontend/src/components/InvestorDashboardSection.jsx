function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function getStartupName(startupId, startups) {
  const startup = startups.find((item) => Number(item.id) === Number(startupId));
  return startup?.startupName || `Startup #${startupId}`;
}

function buildAllocationData(investments, startups) {
  const grouped = investments.reduce((accumulator, investment) => {
    const startupName = getStartupName(investment.startupId, startups);
    accumulator[startupName] = (accumulator[startupName] || 0) + Number(investment.amount || 0);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function AllocationChart({ data, totalInvested }) {
  if (data.length === 0) {
    return <div className="flex min-h-64 items-center justify-center text-center text-slate-500 dark:text-slate-400">No startup allocation yet.</div>;
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex min-h-72 flex-col rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-5">
      <div>
        <div>
          <h3 className="text-lg font-bold">Portfolio Allocation</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Where your capital is currently concentrated.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        {data.map((item) => (
          <div key={item.label} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span>{item.label}</span>
              <strong>{Math.round((item.value / Math.max(totalInvested, 1)) * 100)}%</strong>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[#1e1e30]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{formatCurrency(item.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InvestorDashboardSection({ investments, startups }) {
  const totalInvested = investments.reduce((sum, investment) => sum + Number(investment.amount || 0), 0);
  const approvedCapital = investments
    .filter((investment) => investment.status === 'APPROVED')
    .reduce((sum, investment) => sum + Number(investment.amount || 0), 0);
  const pendingCapital = investments
    .filter((investment) => investment.status === 'PENDING')
    .reduce((sum, investment) => sum + Number(investment.amount || 0), 0);
  const approvedCount = investments.filter((investment) => investment.status === 'APPROVED').length;
  const allocationData = buildAllocationData(investments, startups);

  return (
    <div className="mb-7 grid gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Invested</span>
          <strong className="my-2 block text-3xl font-extrabold">{formatCurrency(totalInvested)}</strong>
          <p className="text-sm text-slate-500 dark:text-slate-400">Across all submitted investor tickets.</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Approved Capital</span>
          <strong className="my-2 block text-3xl font-extrabold">{formatCurrency(approvedCapital)}</strong>
          <p className="text-sm text-slate-500 dark:text-slate-400">{approvedCount} active positions in your portfolio.</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pending Capital</span>
          <strong className="my-2 block text-3xl font-extrabold">{formatCurrency(pendingCapital)}</strong>
          <p className="text-sm text-slate-500 dark:text-slate-400">Capital waiting on founder approval.</p>
        </div>
      </div>

      <div className="grid max-w-2xl grid-cols-1 gap-4">
        <AllocationChart data={allocationData} totalInvested={totalInvested} />
      </div>
    </div>
  );
}
