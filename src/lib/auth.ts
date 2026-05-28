const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/v2/auth';

const call = async (path: string, method: string, body?: any) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'auth_error');
  return data;
};

const auth = {
  signUp: async (email: string, password: string, name?: string) => (await call('/signup', 'POST', { email, password, name })).user,
  signIn: async (email: string, password: string) => (await call('/signin', 'POST', { email, password })).user,
  signOut: async () => call('/signout', 'POST', {}),
  getUser: async () => {
    try {
      return (await call('/user', 'GET')).user;
    } catch {
      return null;
    }
  },
};

export default auth;
