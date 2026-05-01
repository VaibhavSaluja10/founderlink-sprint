const API_BASE_URL = 'http://localhost:8060';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(data?.message || data || 'Something went wrong');
  }

  return { data };
}

const get = (path) => request(path);
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

export const authAPI = {
  login: (email, password) => post('/auth/login', { email, password }),
  register: (name, email, password, role) => post('/auth/register', { name, email, password, role }),
  getAllUsers: () => get('/auth/users'),
};

export const startupAPI = {
  getAll: () => get('/startups'),
  getOpportunities: () => get('/startups/opportunities'),
  getById: (id) => get(`/startups/${id}`),
  create: (data) => post('/startups', data),
  update: (id, data) => put(`/startups/${id}`, data),
  delete: (id) => del(`/startups/${id}`),
  follow: (id) => post(`/startups/${id}/follow`, {}),
  unfollow: (id) => del(`/startups/${id}/unfollow`),
  getFollowed: () => get('/startups/followed'),
  updateStatus: (id, status) => put(`/startups/${id}/status?status=${status}`, {}),
};

export const investmentAPI = {
  create: (data) => post('/investments', data),
  getAll: () => get('/investments'),
  getMy: () => get('/investments/my'),
  getByStartup: (startupId) => get(`/investments/startup/${startupId}`),
  updateStatus: (id, status) => put(`/investments/${id}/status`, { status }),
};

export const teamAPI = {
  getAll: () => get('/teams'),
  invite: (data) => post('/teams/invite', data),
  join: (data) => post('/teams/join', data),
  getByStartup: (startupId) => get(`/teams/startup/${startupId}`),
  getMyInvitations: () => get('/teams/my-invitations'),
  updateRole: (memberId, role) => put(`/teams/${memberId}/role`, { role }),
};


export const notificationAPI = {
  getMy: () => get('/notifications/my'),
  markAsRead: (id) => put(`/notifications/${id}/read`, {}),
  markAllRead: () => put('/notifications/my/read', {}),
};

export const userAPI = {
  createProfile: (data) => post('/users', data),
  getProfiles: () => get('/users'),
  getProfileById: (id) => get(`/users/${id}`),
  updateProfile: (id, data) => put(`/users/${id}`, data),
};
