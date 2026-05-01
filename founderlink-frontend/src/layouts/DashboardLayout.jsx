import DashboardNavbar from '../components/DashboardNavbar';
import DashboardSidebar from '../components/DashboardSidebar';

export default function DashboardLayout({
  user,
  notifications,
  showNotifications,
  activeSection,
  onToggleNotifications,
  onNotificationClick,
  onCloseNotifications,
  onChangeSection,
  onLogout,
  children,
}) {
  const handleSectionChange = (section) => {
    onCloseNotifications();
    onChangeSection(section);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0b14] text-slate-950 dark:text-white">
      <DashboardNavbar
        user={user}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={onToggleNotifications}
        onNotificationClick={onNotificationClick}
        onCloseNotifications={onCloseNotifications}
        onLogout={onLogout}
      />
      <DashboardSidebar user={user} activeSection={activeSection} onChangeSection={handleSectionChange} />
      <main className="mt-14 min-h-[calc(100vh-56px)] flex-1 p-4 md:ml-56 md:p-8" onClick={onCloseNotifications}>{children}</main>
    </div>
  );
}
