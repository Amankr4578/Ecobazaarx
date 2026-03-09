import { User } from '../../types';

const API_URL = '/api/users';

export const getUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getUserById = async (id: string): Promise<User> => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update user');
};

export const deleteUser = async (id: string): Promise<void> => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete user');
};

export const updateProfile = async (data: Partial<User>): Promise<any> => {
  console.log('userService: updateProfile started');
  const token = localStorage.getItem('eco_token');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  console.log('userService: updateProfile fetching...');
  const response = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  
  console.log('userService: updateProfile response received', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('userService: updateProfile failed', errorData);
    throw new Error(errorData.error || 'Failed to update profile');
  }
  
  const result = await response.json();
  console.log('userService: updateProfile success');
  return result;
};
