import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useTheme } from '../context/ThemeContext';
import { FaBell, FaMoon, FaRightFromBracket, FaSun, FaXmark } from 'react-icons/fa6';
import { roleBadgeClass, ui } from '../styles/tailwind';

function formatNotificationMessage(message) {
  if (!message) return '';

  return message.replace(/\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)/g, 'Rs $1');
}

export default function DashboardNavbar({
  user,
  notifications,
  showNotifications,
  onToggleNotifications,
  onNotificationClick,
  onCloseNotifications,
  onLogout,
}) {
  const { isDark, toggleTheme } = useTheme();
  const initials = (user?.name || 'User')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getRoleBadge = () => {
    const roles = user?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return { label: 'Admin', className: 'admin' };
    if (roles.includes('ROLE_FOUNDER')) return { label: 'Founder', className: 'founder' };
    if (roles.includes('ROLE_INVESTOR')) return { label: 'Investor', className: 'investor' };
    if (roles.includes('ROLE_COFOUNDER')) return { label: 'Co-founder', className: 'cofounder' };
    return { label: 'User', className: 'user' };
  };

  const roleBadge = getRoleBadge();

  useEffect(() => {
    const closeWithEscape = (event) => {
      if (event.key === 'Escape') {
        onCloseNotifications();
      }
    };

    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, [onCloseNotifications]);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] px-4 md:px-6">
      <div className="flex items-center gap-6">
        <BrandLogo className="[&>div]:h-8 [&>div]:w-8 [&>span]" />
        <div className="hidden md:flex">
          <Link to="/dashboard" className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-semibold text-white">Dashboard</Link>
        </div>
      </div>
      <div className="relative flex items-center gap-2 md:gap-4">
        <button
          className={ui.iconBtn}
          onClick={onToggleNotifications}
          type="button"
          title="Notifications"
          aria-expanded={showNotifications}
        >
          <FaBell aria-hidden="true" />
          {notifications.filter((item) => !item.read).length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />}
        </button>
        <button
          className={ui.iconBtn}
          onClick={toggleTheme}
          type="button"
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1e1e30] p-4 font-bold">
              <span>Notifications</span>
              <button className="text-violet-600" onClick={onCloseNotifications} type="button" aria-label="Close notifications"><FaXmark aria-hidden="true" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  className={`w-full border-b border-slate-100 p-4 text-left ${item.read ? 'opacity-60' : ''}`}
                  onClick={() => onNotificationClick(item)}
                  type="button"
                >
                  <div className="text-sm text-slate-900 dark:text-white">{formatNotificationMessage(item.message)}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Recent</div>
                </button>
              ))}
              {notifications.length === 0 && <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No new notifications</div>}
            </div>
          </div>
        )}
        <button className="group relative flex items-center gap-2 rounded-lg p-1" onClick={onLogout} title="Logout" type="button">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{initials}</div>
          <span className="hidden flex-col items-start md:flex">
            <span className="text-sm font-semibold text-slate-950 dark:text-white">{user?.name}</span>
            <span className={roleBadgeClass(roleBadge.className)}>{roleBadge.label}</span>
          </span>
          <span className="pointer-events-none absolute right-0 top-12 hidden items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] px-3 py-2 text-xs font-bold text-slate-900 dark:text-white group-hover:flex group-hover:opacity-100"><FaRightFromBracket aria-hidden="true" /> Logout</span>
        </button>
      </div>
    </nav>
  );
}
