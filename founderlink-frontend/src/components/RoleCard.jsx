import { FaChartLine, FaCircleCheck, FaRocket, FaUsersGear } from 'react-icons/fa6';
import { cx } from '../styles/tailwind';

const roleIcons = {
  founder: FaRocket,
  investor: FaChartLine,
  cofounder: FaUsersGear,
};

export default function RoleCard({ role, selectedRole, onSelect }) {
  const Icon = roleIcons[role.iconClass] || FaRocket;

  return (
    <button
      type="button"
      className={cx(
        'rounded-xl border-2 bg-slate-100 dark:bg-[#1e1e30] p-5 text-left:bg-[#252540]',
        selectedRole === role.id
          ? 'border-violet-600'
          : 'border-slate-200 dark:border-white/10',
      )}
      onClick={() => onSelect(role.id)}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500 text-lg text-violet-600"><Icon aria-hidden="true" /></div>
      <div className="font-bold text-slate-950 dark:text-white">{role.title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{role.desc}</div>
      {selectedRole === role.id && <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-600"><FaCircleCheck aria-hidden="true" /> Selected</div>}
    </button>
  );
}
