import { useEffect, useMemo, useState } from 'react';
import { clearAuth, getStoredUser } from '../store/authStore';
import { emptyStartup } from '../store/initialValues';
import {
  getAdminUsersWithProfiles,
  getAllStartupsWithFounderNames,
  getDashboardStats,
  getInvestmentsByStartups,
  getJoinedStartupsFromInvitations,
  getProfile,
  getTeamMembersWithFounder,
  investmentAPI,
  notificationAPI,
  startupAPI,
  teamAPI,
  userAPI,
} from '../services/dashboardService';

function isUnreadNotification(item) {
  return item.status === 'UNREAD' || item.read === false;
}

export function useDashboardData(navigate) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState({ name: 'User', email: '', roles: [] });
  const [startups, setStartups] = useState([]);
  const [followedStartups, setFollowedStartups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({ active: 0, raised: 0, team: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [isAddingStartup, setIsAddingStartup] = useState(false);
  const [newStartup, setNewStartup] = useState(emptyStartup);
  const [editingStartup, setEditingStartup] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myInvestments, setMyInvestments] = useState([]);
  const [allInvestments, setAllInvestments] = useState([]);
  const [startupInvestments, setStartupInvestments] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState('');
  const [adminTeams, setAdminTeams] = useState([]);
  const [adminTeamsLoading, setAdminTeamsLoading] = useState(false);
  const [adminTeamsError, setAdminTeamsError] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [teamInvitations, setTeamInvitations] = useState([]);
  const [joinedStartups, setJoinedStartups] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeamStartupId, setSelectedTeamStartupId] = useState('');
  const [inviteForm, setInviteForm] = useState({ invitedUserId: '', role: 'CTO' });
  const [investmentActionId, setInvestmentActionId] = useState(null);

  const roles = user.roles || [];
  const permissions = useMemo(() => ({
    isFounder: roles.includes('ROLE_FOUNDER'),
    isInvestor: roles.includes('ROLE_INVESTOR'),
    isCoFounder: roles.includes('ROLE_COFOUNDER'),
    isAdmin: roles.includes('ROLE_ADMIN'),
    isBuilder: roles.includes('ROLE_FOUNDER') || roles.includes('ROLE_COFOUNDER'),
  }), [roles]);

  const accessibleTeamStartups = permissions.isCoFounder ? joinedStartups : startups;

  const loadProfile = async () => {
    try {
      setProfile(await getProfile());
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadMyInvestments = async () => {
    try {
      const response = await investmentAPI.getMy();
      setMyInvestments(response.data || []);
    } catch (err) {
      console.error('Error loading investments:', err);
    }
  };

  const loadAllInvestments = async () => {
    try {
      const response = await investmentAPI.getAll();
      setAllInvestments(response.data || []);
    } catch (err) {
      console.error('Error loading all investments:', err);
    }
  };

  const loadAdminUsers = async () => {
    setAdminUsersLoading(true);
    setAdminUsersError('');
    try {
      setAdminUsers(await getAdminUsersWithProfiles());
    } catch (err) {
      setAdminUsersError(err.message || 'Failed to load users.');
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const loadAdminTeams = async () => {
    setAdminTeamsLoading(true);
    setAdminTeamsError('');
    try {
      const response = await teamAPI.getAll();
      setAdminTeams(response.data || []);
    } catch (err) {
      setAdminTeamsError(err.message || 'Failed to load team members.');
    } finally {
      setAdminTeamsLoading(false);
    }
  };

  const loadOpportunities = async () => {
    try {
      const response = await startupAPI.getOpportunities();
      setOpportunities(response.data || []);
    } catch (err) {
      console.error('Error loading opportunities:', err);
    }
  };

  const loadStartupInvestments = async (sourceStartups = startups) => {
    setStartupInvestments(await getInvestmentsByStartups(sourceStartups));
  };

  const loadTeamInvitations = async (returnJoinedStartupsOnly = false) => {
    try {
      const response = await teamAPI.getMyInvitations();
      const invitations = response.data || [];
      setTeamInvitations(invitations);

      if (permissions.isCoFounder) {
        const activeStartups = await getJoinedStartupsFromInvitations(invitations);
        setJoinedStartups(activeStartups);
        if (returnJoinedStartupsOnly) return activeStartups;
      }

      return invitations;
    } catch (err) {
      console.error('Error loading invitations:', err);
      if (permissions.isCoFounder) setJoinedStartups([]);
      return [];
    }
  };

  const loadTeamMembers = async (startupId) => {
    if (!startupId) return;
    try {
      setTeamMembers(await getTeamMembersWithFounder(startupId));
    } catch (err) {
      alert(err.message || 'Failed to load team members.');
    }
  };

  const loadDashboard = async (currentUser = user) => {
    setLoading(true);
    try {
      const startupData = await getAllStartupsWithFounderNames(currentUser);
      setStartups(startupData);

      if (currentUser.roles?.includes('ROLE_INVESTOR')) {
        try {
          const followedResponse = await startupAPI.getFollowed();
          setFollowedStartups(followedResponse.data || []);
        } catch {}
        try {
          const opportunitiesResponse = await startupAPI.getOpportunities();
          setOpportunities(opportunitiesResponse.data || []);
        } catch {}
        loadMyInvestments();
      }

      let coFounderStartups = [];
      if (currentUser.roles?.includes('ROLE_COFOUNDER')) {
        loadOpportunities();
        coFounderStartups = await loadTeamInvitations(true);
        await loadStartupInvestments(coFounderStartups);
      }

      const notificationsResponse = await notificationAPI.getMy();
      const notificationData = notificationsResponse.data || [];
      setNotifications(notificationData);

      const statStartups = currentUser.roles?.includes('ROLE_COFOUNDER') ? coFounderStartups : startupData;
      setStats(await getDashboardStats(statStartups, notificationData));
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const storedUser = getStoredUser();
      if (!storedUser) {
        navigate('/auth');
        return;
      }
      setUser(storedUser);
      loadDashboard(storedUser);
    } catch {
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeSection === 'profile') loadProfile();
    if (activeSection === 'my-investments') loadMyInvestments();
    if (activeSection === 'all-investments') loadAllInvestments();
    if (activeSection === 'startup-investments') loadStartupInvestments(permissions.isCoFounder ? joinedStartups : startups);
    if (activeSection === 'admin-users') loadAdminUsers();
    if (activeSection === 'admin-teams') loadAdminTeams();
    if (activeSection === 'opportunities') loadOpportunities();
    if (activeSection === 'my-invitations') loadTeamInvitations();
    if (activeSection === 'joined-startups' && permissions.isCoFounder) loadTeamInvitations();
    if (activeSection === 'team' && permissions.isCoFounder) loadTeamInvitations();
    if (activeSection === 'messages') navigate('/messages');
  }, [activeSection, permissions.isCoFounder, joinedStartups, startups]);

  useEffect(() => {
    if (!permissions.isCoFounder || selectedTeamStartupId || accessibleTeamStartups.length === 0) return;

    const firstStartupId = String(accessibleTeamStartups[0].id);
    setSelectedTeamStartupId(firstStartupId);
    loadTeamMembers(firstStartupId);
  }, [accessibleTeamStartups, permissions.isCoFounder, selectedTeamStartupId]);

  const handleLogout = () => {
    clearAuth();
    navigate('/auth');
  };

  const handleCreateStartup = async (event) => {
    event.preventDefault();
    try {
      await startupAPI.create(newStartup);
      setNewStartup(emptyStartup);
      setIsAddingStartup(false);
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to create startup.');
    }
  };

  const handleUpdateStartup = async (event) => {
    event.preventDefault();
    try {
      await startupAPI.update(editingStartup.id, editingStartup);
      setEditingStartup(null);
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update startup.');
    }
  };

  const handleDeleteStartup = async (startupId) => {
    if (!window.confirm('Are you sure you want to delete this startup?')) return;
    await startupAPI.delete(startupId);
    loadDashboard();
  };

  const handleFollow = async (startup) => {
    const isFollowing = followedStartups.some((item) => item.id === startup.id);
    if (isFollowing) {
      await startupAPI.unfollow(startup.id);
    } else {
      await startupAPI.follow(startup.id);
    }
    loadDashboard();
  };

  const handleStatusChange = async (startupId, status) => {
    await startupAPI.updateStatus(startupId, status);
    loadDashboard();
  };

  const handleInvestmentStatusUpdate = async (investmentId, status) => {
    setInvestmentActionId(investmentId);
    try {
      await investmentAPI.updateStatus(investmentId, status);
      const sourceStartups = permissions.isCoFounder ? joinedStartups : startups;
      await loadStartupInvestments(sourceStartups);
      await loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update investment status.');
    } finally {
      setInvestmentActionId(null);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;
    if (!isUnreadNotification(notification)) {
      setShowNotifications(false);
      return;
    }

    try {
      await notificationAPI.markAsRead(notification.id);
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, status: 'READ', read: true } : item,
        ),
      );
      setStats((current) => ({ ...current, messages: Math.max(current.messages - 1, 0) }));
      setShowNotifications(false);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      alert(err.message || 'Failed to mark notification as read.');
    }
  };

  const handleTeamInvite = async (event) => {
    event.preventDefault();
    if (!selectedTeamStartupId || !inviteForm.invitedUserId) {
      alert('Please select startup and enter co-founder email.');
      return;
    }

    try {
      await teamAPI.invite({
        startupId: Number(selectedTeamStartupId),
        invitedUserId: inviteForm.invitedUserId,
        role: inviteForm.role,
      });
      setInviteForm({ invitedUserId: '', role: 'CTO' });
      loadTeamMembers(selectedTeamStartupId);
      alert('Invitation sent successfully.');
    } catch (err) {
      alert(err.message || 'Failed to send invitation.');
    }
  };

  const handleTeamRoleUpdate = async (memberId, role) => {
    try {
      await teamAPI.updateRole(memberId, role);
      loadTeamMembers(selectedTeamStartupId);
    } catch (err) {
      alert(err.message || 'Failed to update team member role.');
    }
  };

  const handleInvitationAction = async (teamId, action) => {
    try {
      await teamAPI.join({ teamId, action });
      const updatedInvitations = await loadTeamInvitations();
      if (action === 'ACCEPT') {
        const acceptedInvitation = updatedInvitations.find((invite) => Number(invite.id) === Number(teamId));
        if (acceptedInvitation?.startupId) {
          setSelectedTeamStartupId(String(acceptedInvitation.startupId));
          loadTeamMembers(acceptedInvitation.startupId);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update invitation.');
    }
  };

  const handleAdminProfileSave = async (registeredUser, formData) => {
    try {
      if (registeredUser.profile?.id) {
        await userAPI.updateProfile(registeredUser.profile.id, {
          name: registeredUser.name,
          ...formData,
        });
      } else {
        await userAPI.createProfile({
          email: registeredUser.email,
          name: registeredUser.name,
          ...formData,
        });
      }
      await loadAdminUsers();
      alert('User profile updated successfully.');
    } catch (err) {
      alert(err.message || 'Failed to update user profile.');
    }
  };


  return {
    state: {
      activeSection,
      adminTeams,
      adminTeamsError,
      adminTeamsLoading,
      adminUsers,
      adminUsersError,
      adminUsersLoading,
      allInvestments,
      accessibleTeamStartups,
      editingStartup,
      followedStartups,
      inviteForm,
      investmentActionId,
      isAddingStartup,
      joinedStartups,
      loading,
      myInvestments,
      newStartup,
      notifications,
      opportunities,
      permissions,
      profile,
      selectedTeamStartupId,
      showNotifications,
      startupInvestments,
      startups,
      stats,
      teamInvitations,
      teamMembers,
      user,
    },
    setters: {
      setActiveSection,
      setEditingStartup,
      setInviteForm,
      setIsAddingStartup,
      setNewStartup,
      setProfile,
      setSelectedTeamStartupId,
      setShowNotifications,
    },
    actions: {
      handleAdminProfileSave,
      handleCreateStartup,
      handleDeleteStartup,
      handleFollow,
      handleInvestmentStatusUpdate,
      handleInvitationAction,
      handleLogout,
      handleNotificationClick,
      handleStatusChange,
      handleTeamInvite,
      handleTeamRoleUpdate,
      handleUpdateStartup,
      loadAdminTeams,
      loadAdminUsers,
      loadProfile,
      loadTeamMembers,
    },
  };
}
