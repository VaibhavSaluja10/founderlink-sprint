export function getStoredUser() {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  return JSON.parse(storedUser);
}

export function saveAuth(userData) {
  localStorage.setItem('token', userData.token);
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
    })
  );
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
