// Fetch wrapper for admin-only API routes — attaches the JWT issued by
// /api/auth and forces a re-login if the server rejects it.
export function authFetch(url, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(url, { ...options, headers }).then(res => {
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.reload();
    }
    return res;
  });
}
