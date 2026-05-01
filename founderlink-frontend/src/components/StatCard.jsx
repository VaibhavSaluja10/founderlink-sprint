export default function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-4.5">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mb-1 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>
    </div>
  );
}
