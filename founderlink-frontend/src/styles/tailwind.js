export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ui = {
  page: 'min-h-screen bg-slate-50 dark:bg-[#0b0b14] text-slate-950 dark:text-white',
  card: 'border border-slate-300 dark:border-white/10 bg-white dark:bg-[#13131f] p-5',
  panel: 'border border-slate-300 dark:border-white/10 bg-white dark:bg-[#13131f] p-6',
  input: 'w-full border border-slate-400 dark:border-white/20 bg-white dark:bg-[#13131f] px-3 py-2 text-slate-900 dark:text-white',
  select: 'w-full border border-slate-400 dark:border-white/20 bg-white dark:bg-[#13131f] px-3 py-2 text-slate-900 dark:text-white',
  textarea: 'w-full min-h-24 border border-slate-400 dark:border-white/20 bg-white dark:bg-[#13131f] px-3 py-2 text-slate-900 dark:text-white',
  primaryBtn: 'bg-blue-600 text-white px-4 py-2 font-bold cursor-pointer disabled:opacity-50',
  outlineBtn: 'bg-transparent text-blue-600 border border-blue-600 px-4 py-2 font-bold cursor-pointer',
  textBtn: 'bg-transparent text-slate-600 dark:text-slate-400 px-4 py-2 font-bold cursor-pointer',
  iconBtn: 'bg-transparent text-slate-600 dark:text-slate-400 p-2 cursor-pointer',
  gridCards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  empty: 'border border-slate-400 dark:border-white/20 p-10 text-center text-slate-600 dark:text-slate-400',
  label: 'text-sm font-bold text-slate-700 dark:text-slate-300',
};

export function statusClass(status) {
  const normalized = status || 'PENDING';
  const base = 'inline-flex items-center border border-slate-400 dark:border-white/20 px-2 py-1 text-sm font-bold uppercase';
  if (normalized === 'APPROVED' || normalized === 'ACTIVE') {
    return cx(base, 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300');
  }
  if (normalized === 'REJECTED' || normalized === 'DISAPPROVED') {
    return cx(base, 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300');
  }
  return cx(base, 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300');
}

export function roleBadgeClass(role) {
  return cx(
    'px-2 py-1 text-xs font-bold uppercase border border-slate-400 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
  );
}
