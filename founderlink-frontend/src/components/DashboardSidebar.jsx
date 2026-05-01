import {
  FaBriefcase,
  FaChartLine,

  FaEnvelopeOpenText,
  FaGaugeHigh,
  FaHandshake,
  FaLayerGroup,
  FaPeopleGroup,
  FaRocket,
  FaUser,
  FaUserGear,
  FaUsers,
} from 'react-icons/fa6';

const BASE_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaGaugeHigh },
  { id: 'startups', label: 'My Startups', icon: FaRocket },
  { id: 'team', label: 'Team', icon: FaPeopleGroup },
  { id: 'profile', label: 'My Profile', icon: FaUser },
];

const EXTRA_LINKS = {
  'browse-startups': { label: 'Browse Startups', icon: FaLayerGroup },
  'followed-startups': { label: 'Followed Startups', icon: FaHandshake },
  'my-investments': { label: 'My Investments', icon: FaChartLine },
  'joined-startups': { label: 'Joined Startups', icon: FaBriefcase },
  'startup-investments': { label: 'Startup Investments', icon: FaChartLine },
  opportunities: { label: 'Startup Opportunities', icon: FaRocket },
  'my-invitations': { label: 'Team Invitations', icon: FaEnvelopeOpenText },
  'admin-users': { label: 'Admin Users', icon: FaUserGear },
  'admin-teams': { label: 'All Teams', icon: FaUsers },
  'all-investments': { label: 'All Investments', icon: FaChartLine },
};

function SidebarButton({ link, activeSection, onChangeSection }) {
  const Icon = link.icon;

  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${activeSection === link.id ? 'bg-violet-500 text-violet-600' : 'text-slate-600 dark:text-slate-400'}`}
      onClick={() => onChangeSection(link.id)}
      type="button"
    >
      <span className="flex w-5 justify-center"><Icon aria-hidden="true" /></span>
      {link.label}
    </button>
  );
}

export default function DashboardSidebar({ user, activeSection, onChangeSection }) {
  const roles = user?.roles || [];
  const isInvestor = roles.includes('ROLE_INVESTOR');
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isFounder = roles.includes('ROLE_FOUNDER');
  const isCoFounder = roles.includes('ROLE_COFOUNDER');

  const visibleLinks = BASE_LINKS.filter((link) => {
    if ((isInvestor || isAdmin) && link.id === 'team') return false;
    if (isInvestor && link.id === 'startups') return false;
    if (isCoFounder && link.id === 'startups') return false;
    return true;
  });

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-56 flex-col gap-6 overflow-y-auto border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-3 md:flex">
      <div>
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspace</div>
        <div className="flex flex-col gap-1">
          {visibleLinks.map((link) => <SidebarButton key={link.id} link={link} activeSection={activeSection} onChangeSection={onChangeSection} />)}
          {isInvestor && (
            <>
              <SidebarButton link={{ id: 'browse-startups', ...EXTRA_LINKS['browse-startups'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
              <SidebarButton link={{ id: 'followed-startups', ...EXTRA_LINKS['followed-startups'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
              <SidebarButton link={{ id: 'my-investments', ...EXTRA_LINKS['my-investments'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
            </>
          )}
          {isCoFounder && (
            <>
              <SidebarButton link={{ id: 'joined-startups', ...EXTRA_LINKS['joined-startups'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
              <SidebarButton link={{ id: 'startup-investments', ...EXTRA_LINKS['startup-investments'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
              <SidebarButton link={{ id: 'opportunities', ...EXTRA_LINKS.opportunities }} activeSection={activeSection} onChangeSection={onChangeSection} />
              <SidebarButton link={{ id: 'my-invitations', ...EXTRA_LINKS['my-invitations'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
            </>
          )}
          {isFounder && (
            <SidebarButton link={{ id: 'startup-investments', ...EXTRA_LINKS['startup-investments'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
          )}
          {isAdmin && (
            <>
              <SidebarButton link={{ id: 'admin-users', ...EXTRA_LINKS['admin-users'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
              <SidebarButton link={{ id: 'admin-teams', ...EXTRA_LINKS['admin-teams'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
              <SidebarButton link={{ id: 'all-investments', ...EXTRA_LINKS['all-investments'] }} activeSection={activeSection} onChangeSection={onChangeSection} />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
