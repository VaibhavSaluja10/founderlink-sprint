import { useNavigate } from 'react-router-dom';
import AdminTeamsSection from '../components/AdminTeamsSection';
import AdminUsersSection from '../components/AdminUsersSection';
import DashboardHome from '../components/dashboard/DashboardHome';
import InvestmentSection from '../components/dashboard/InvestmentSection';
import StartupList from '../components/dashboard/StartupList';
import TeamSection from '../components/dashboard/TeamSection';
import JoinedStartupDetailsSection from '../components/JoinedStartupDetailsSection';
import ProfileSection from '../components/ProfileSection';
import TeamInvitationsSection from '../components/TeamInvitationsSection';
import DashboardLayout from '../layouts/DashboardLayout';
import { useDashboardData } from '../hooks/useDashboardData';
import { ui } from '../styles/tailwind';

function getStartupListTitle(activeSection, permissions) {
  if (activeSection === 'browse-startups') return 'Browse Startups';
  if (permissions.isAdmin) return 'All Startups';
  return 'My Startups';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, setters, actions } = useDashboardData(navigate);

  return (
    <DashboardLayout
      user={state.user}
      notifications={state.notifications}
      showNotifications={state.showNotifications}
      activeSection={state.activeSection}
      onToggleNotifications={() => setters.setShowNotifications((current) => !current)}
      onNotificationClick={actions.handleNotificationClick}
      onCloseNotifications={() => setters.setShowNotifications(false)}
      onChangeSection={setters.setActiveSection}
      onLogout={actions.handleLogout}
    >
      {state.loading ? (
        <div className="flex h-52 items-center justify-center font-medium text-slate-500 dark:text-slate-400">Loading your workspace...</div>
      ) : (
        <DashboardSection
          actions={actions}
          navigate={navigate}
          setters={setters}
          state={state}
        />
      )}
    </DashboardLayout>
  );
}

function DashboardSection({ actions, navigate, setters, state }) {
  const { permissions } = state;

  if (state.activeSection === 'dashboard') {
    return (
      <DashboardHome
        myInvestments={state.myInvestments}
        onChangeSection={setters.setActiveSection}

        onStatusChange={actions.handleStatusChange}
        opportunities={state.opportunities}
        permissions={permissions}
        startups={state.startups}
        stats={state.stats}
        user={state.user}
      />
    );
  }

  if (['startups', 'browse-startups', 'followed-startups', 'opportunities'].includes(state.activeSection)) {
    const list = getStartupList(state);
    return (
      <StartupList
        editingStartup={state.editingStartup}
        followedStartups={state.followedStartups}
        isAddingStartup={state.isAddingStartup}
        list={list}
        newStartup={state.newStartup}
        onAddStart={() => setters.setIsAddingStartup(true)}
        onCancelAdd={() => setters.setIsAddingStartup(false)}
        onCancelEdit={() => setters.setEditingStartup(null)}
        onCreateStartup={actions.handleCreateStartup}
        onDelete={actions.handleDeleteStartup}
        onEdit={setters.setEditingStartup}
        onFollow={actions.handleFollow}
        onInvest={(startupId) => navigate(`/invest?id=${startupId}`)}

        onNewStartupChange={setters.setNewStartup}
        onStatusChange={actions.handleStatusChange}
        onUpdateStartup={actions.handleUpdateStartup}
        permissions={permissions}
        setEditingStartup={setters.setEditingStartup}
        title={getStartupListTitle(state.activeSection, permissions)}
        user={state.user}
      />
    );
  }

  if (state.activeSection === 'joined-startups') {
    return (
      <JoinedStartupDetailsSection
        startups={state.joinedStartups}

      />
    );
  }

  if (state.activeSection === 'my-invitations') {
    return <TeamInvitationsSection invitations={state.teamInvitations} onAction={actions.handleInvitationAction} />;
  }

  if (state.activeSection === 'team') {
    return (
      <TeamSection
        accessibleTeamStartups={state.accessibleTeamStartups}
        canManageTeam={permissions.isFounder || permissions.isAdmin}
        inviteForm={state.inviteForm}
        isCoFounder={permissions.isCoFounder}
        onInviteFormChange={setters.setInviteForm}
        onLoadTeamMembers={actions.loadTeamMembers}
        onRoleUpdate={actions.handleTeamRoleUpdate}
        onSelectedStartupChange={setters.setSelectedTeamStartupId}
        onSubmitInvite={actions.handleTeamInvite}
        selectedTeamStartupId={state.selectedTeamStartupId}
        teamMembers={state.teamMembers}
      />
    );
  }

  if (state.activeSection === 'profile') {
    return (
      <ProfileSection
        user={state.user}
        profile={state.profile}
        setProfile={setters.setProfile}
        reloadProfile={actions.loadProfile}
      />
    );
  }

  if (state.activeSection === 'my-investments') {
    return (
      <InvestmentSection
        investments={state.myInvestments}
        startups={state.startups}
        title="My Investments"
      />
    );
  }

  if (state.activeSection === 'startup-investments') {
    return (
      <InvestmentSection
        busyInvestmentId={state.investmentActionId}
        investments={state.startupInvestments}
        onStatusUpdate={actions.handleInvestmentStatusUpdate}
        showActions={permissions.isFounder || permissions.isCoFounder}
        startups={permissions.isCoFounder ? state.joinedStartups : state.startups}
        title={permissions.isCoFounder ? 'Joined Startup Investments' : 'Startup Investments'}
      />
    );
  }

  if (state.activeSection === 'all-investments') {
    return (
      <InvestmentSection
        investments={state.allInvestments}
        startups={state.startups}
        title="All Investments"
      />
    );
  }

  if (state.activeSection === 'admin-users') {
    return (
      <AdminUsersSection
        users={state.adminUsers}
        loading={state.adminUsersLoading}
        error={state.adminUsersError}
        onRefresh={actions.loadAdminUsers}
        onSaveProfile={actions.handleAdminProfileSave}
      />
    );
  }

  if (state.activeSection === 'admin-teams') {
    return (
      <AdminTeamsSection
        members={state.adminTeams}
        startups={state.startups}
        loading={state.adminTeamsLoading}
        error={state.adminTeamsError}
        onRefresh={actions.loadAdminTeams}
      />
    );
  }

  return <div className={ui.empty}>Section not found.</div>;
}

function getStartupList(state) {
  if (state.activeSection === 'browse-startups') return state.permissions.isInvestor ? state.opportunities : state.startups;
  if (state.activeSection === 'followed-startups') return state.followedStartups;
  if (state.activeSection === 'opportunities') return state.opportunities;
  return state.startups;
}
