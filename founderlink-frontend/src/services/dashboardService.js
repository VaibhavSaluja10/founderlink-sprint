import { authAPI, investmentAPI, notificationAPI, startupAPI, teamAPI, userAPI } from './api';

export async function getAllStartupsWithFounderNames(currentUser) {
  const startupResponse = await startupAPI.getAll();
  let startupData = startupResponse.data || [];

  if (currentUser.roles?.includes('ROLE_ADMIN')) {
    try {
      const profilesResponse = await userAPI.getProfiles();
      const profiles = profilesResponse.data || [];
      startupData = startupData.map((startup) => {
        const founderProfile = profiles.find((profile) => profile.email === startup.founderEmail);
        return {
          ...startup,
          founderName: founderProfile?.name || startup.founderEmail?.split('@')[0] || 'Founder',
        };
      });
    } catch {}
  }

  return startupData;
}

export async function getProfile() {
  const response = await userAPI.getProfiles();
  return (response.data || [])[0] || null;
}

export async function getAdminUsersWithProfiles() {
  const usersResponse = await authAPI.getAllUsers();
  const profilesResponse = await userAPI.getProfiles();
  const profiles = profilesResponse.data || [];

  return (usersResponse.data || []).map((registeredUser) => ({
    ...registeredUser,
    profile: profiles.find((profileItem) => profileItem.email === registeredUser.email) || null,
  }));
}

export async function getJoinedStartupsFromInvitations(invitations) {
  const activeInvitations = invitations.filter((invite) => invite.status === 'ACTIVE' && invite.startupId);
  const uniqueStartupIds = [...new Set(activeInvitations.map((invite) => Number(invite.startupId)).filter(Boolean))];

  const startupResponses = await Promise.all(
    uniqueStartupIds.map(async (startupId) => {
      try {
        const startupResponse = await startupAPI.getById(startupId);
        return startupResponse.data;
      } catch {
        return null;
      }
    }),
  );

  return startupResponses.filter(Boolean);
}

export async function getTeamMembersWithFounder(startupId) {
  const [teamResponse, startupResponse] = await Promise.all([
    teamAPI.getByStartup(startupId),
    startupAPI.getById(startupId),
  ]);

  const members = teamResponse.data || [];
  const startup = startupResponse.data;
  const founderEmail = startup?.founderEmail;
  const founderAlreadyPresent = members.some(
    (member) => member.invitedUserEmail?.toLowerCase() === founderEmail?.toLowerCase(),
  );

  const founderMember = founderEmail && !founderAlreadyPresent
    ? [{
        id: `founder-${startupId}`,
        startupId: Number(startupId),
        invitedUserEmail: founderEmail,
        role: 'FOUNDER',
        status: 'ACTIVE',
      }]
    : [];

  return [...founderMember, ...members];
}

export async function getInvestmentsByStartups(sourceStartups) {
  const investments = [];
  for (const startup of sourceStartups) {
    try {
      const response = await investmentAPI.getByStartup(startup.id);
      investments.push(...(response.data || []));
    } catch {}
  }
  return investments;
}

export async function getDashboardStats(statStartups, notifications) {
  let totalTeam = 0;
  let totalRaised = 0;

  for (const startup of statStartups) {
    try {
      const teamResponse = await teamAPI.getByStartup(startup.id);
      totalTeam += (teamResponse.data || []).length;
    } catch {}

    try {
      const investmentResponse = await investmentAPI.getByStartup(startup.id);
      totalRaised += (investmentResponse.data || [])
        .filter((investment) => investment.status === 'APPROVED')
        .reduce((sum, investment) => sum + Number(investment.amount), 0);
    } catch {}
  }

  let unreadMessages = notifications.filter((item) => item.status === 'UNREAD' || item.read === false).length;

  return {
    active: statStartups.filter((startup) => startup.status === 'APPROVED').length || statStartups.length,
    raised: totalRaised,
    team: totalTeam,

  };
}

export { investmentAPI, notificationAPI, startupAPI, teamAPI, userAPI };
