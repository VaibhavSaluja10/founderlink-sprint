import { statusClass, ui } from '../../styles/tailwind';

export default function StartupPreview({ startups }) {
  return (
    <div className="flex flex-col gap-3">
      {startups.slice(0, 3).map((startup) => (
        <div key={startup.id} className={`${ui.card} flex items-center gap-4`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-xs font-extrabold text-white">
            {startup.startupName?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold">{startup.startupName}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{startup.industry} - {startup.stage}</div>
          </div>
          <span className={statusClass(startup.status)}>{startup.status || 'PENDING'}</span>
        </div>
      ))}
    </div>
  );
}
