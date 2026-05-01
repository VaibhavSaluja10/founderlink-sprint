import Button from './Button';
import { FaCoins, FaPen, FaTrash, FaUserPlus, FaUserXmark } from 'react-icons/fa6';
import { statusClass, ui } from '../styles/tailwind';

export default function StartupCard({ startup, isFollowing, canInvest, canEdit, isAdmin, onFollow, onInvest, onEdit, onDelete, onStatusChange }) {
  return (
    <div className={ui.card + ' flex flex-col gap-4'}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{startup.startupName}</h3>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Startup ID: {startup.id}</div>
          {isAdmin && (
            <>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Founder: {startup.founderName || startup.founderEmail?.split('@')[0] || 'Founder'}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Email: {startup.founderEmail || '-'}
              </div>
            </>
          )}
        </div>
        <span className={statusClass(startup.status)}>
          {startup.status || 'PENDING'}
        </span>
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{startup.description || 'No description provided.'}</p>
      <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-white/10 pt-4">
        <div><span className={ui.label}>Goal</span><span className="block text-sm font-semibold">Rs {startup.fundingGoal}</span></div>
        <div><span className={ui.label}>Industry</span><span className="block text-sm font-semibold">{startup.industry}</span></div>
        <div><span className={ui.label}>Stage</span><span className="block text-sm font-semibold">{startup.stage}</span></div>
        <div><span className={ui.label}>Location</span><span className="block text-sm font-semibold">{startup.location || 'Remote'}</span></div>
      </div>
      <div className="mt-auto flex flex-wrap justify-end gap-3">
        {onFollow && <Button className={isFollowing ? 'inline-flex items-center justify-center gap-2 rounded-full border border-rose-500 px-3.5 py-1.5 text-sm font-semibold text-rose-500' : 'inline-flex items-center justify-center gap-2 rounded-full border border-violet-500 px-3.5 py-1.5 text-sm font-semibold text-violet-600'} onClick={onFollow}>{isFollowing ? <FaUserXmark aria-hidden="true" /> : <FaUserPlus aria-hidden="true" />} {isFollowing ? 'Unfollow' : 'Follow'}</Button>}
        {canInvest && <Button className={ui.primaryBtn} onClick={onInvest}><FaCoins aria-hidden="true" /> Invest</Button>}

        {canEdit && <Button className={ui.outlineBtn} onClick={onEdit}><FaPen aria-hidden="true" /> Edit</Button>}
        {canEdit && <Button className={ui.textBtn} onClick={onDelete}><FaTrash aria-hidden="true" /> Delete</Button>}
        {isAdmin && (
          <select className={ui.select + ' max-w-40'} value={startup.status || 'PENDING'} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        )}
      </div>
    </div>
  );
}
