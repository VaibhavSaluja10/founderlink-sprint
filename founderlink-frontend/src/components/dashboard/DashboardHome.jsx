import { FaArrowRight, FaPlus } from 'react-icons/fa6';
import Button from '../Button';
import InvestorDashboardSection from '../InvestorDashboardSection';
import StatsCards from './StatsCards';
import StartupPreview from './StartupPreview';
import InvestmentPreview from './InvestmentPreview';
import { AdminStartupApprovalsPreview, OpportunityPreview } from './StartupCardsPreview';
import { ui } from '../../styles/tailwind';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardHome({
  myInvestments,
  onChangeSection,

  onStatusChange,
  opportunities,
  permissions,
  startups,
  stats,
  user,
}) {
  const { isAdmin, isBuilder, isCoFounder, isFounder, isInvestor } = permissions;
  const previewTitle = isAdmin
    ? 'Startup Approvals'
    : isInvestor
      ? 'Recent Investments'
      : isCoFounder
        ? 'Startup Opportunities'
        : 'Focus Projects';
  const viewAllSection = isAdmin
    ? 'startups'
    : isInvestor
      ? 'my-investments'
      : isCoFounder
        ? 'opportunities'
        : 'startups';

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, {user.name?.split(' ')[0] || 'User'}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here is your FounderLink workspace overview.</p>
        </div>
        {isFounder && (
          <Button className={ui.primaryBtn} onClick={() => onChangeSection('startups')}>
            <FaPlus aria-hidden="true" /> New Startup
          </Button>
        )}
      </div>

      {isInvestor && <InvestorDashboardSection investments={myInvestments} startups={startups} />}
      <StatsCards stats={stats} showBuilderStats={isBuilder} />

      <div className="mb-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold">{previewTitle}</h3>
          <Button className={ui.textBtn} onClick={() => onChangeSection(viewAllSection)}>
            View all <FaArrowRight aria-hidden="true" />
          </Button>
        </div>

        {isAdmin && <AdminStartupApprovalsPreview startups={startups} onStatusChange={onStatusChange} />}
        {isInvestor && <InvestmentPreview investments={myInvestments} />}
        {isCoFounder && <OpportunityPreview opportunities={opportunities} />}
        {!isAdmin && !isInvestor && !isCoFounder && <StartupPreview startups={startups} />}
      </div>
    </>
  );
}
