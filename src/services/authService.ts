import { User } from '../../types';

const API_URL = '/api/auth';

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('eco_token', data.token);
  localStorage.setItem('eco_user', JSON.stringify(data.user));
  return data;
};

export const register = async (email: string, password: string, name: string): Promise<any> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

export const logout = () => {
  localStorage.removeItem('eco_token');
  localStorage.removeItem('eco_user');
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('eco_user');
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  const token = localStorage.getItem('eco_token');
  if (token === 'null' || token === 'undefined') return null;
  return token;
};
