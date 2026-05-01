export default function InvestStartupPanel({ startup, amount, raisedAmount, formatCurrency }) {
  const targetRaise = startup.fundingGoal || 10000000;
  const remaining = Math.max(0, targetRaise - raisedAmount);
  const percentageOfAsk = targetRaise > 0 ? (amount / targetRaise) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1e1e30] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-xs font-extrabold text-white">{startup.startupName?.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="font-bold">{startup.startupName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{startup.stage} - {startup.industry}</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Funding ask</span><span className="font-bold">{formatCurrency(targetRaise)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Already raised</span><span className="font-bold text-violet-600">{formatCurrency(raisedAmount)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Remaining</span><span className="font-bold text-emerald-500">{formatCurrency(remaining)}</span></div>
        </div>
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-white dark:bg-[#13131f]">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500" style={{ width: `${(raisedAmount / targetRaise) * 100}%` }}></div>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-5">
        <div className="text-sm text-violet-600 dark:text-violet-300">Your investment</div>
        <div className="mt-1 text-2xl font-extrabold text-violet-600 dark:text-violet-300">{formatCurrency(amount)}</div>
        <div className="text-xs text-violet-600/70 dark:text-violet-300/70">About {percentageOfAsk.toFixed(1)}% of funding ask</div>
      </div>
    </div>
  );
}
