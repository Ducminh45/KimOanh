import api from './apiClient';

export async function register(data: { email: string; password: string; fullName: string }) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data);
  return res.data as { accessToken: string; refreshToken: string };
}

export async function forgotPassword(data: { email: string }) {
  const res = await api.post('/auth/forgot-password', data);
  return res.data;
}

export async function resetPassword(data: { token: string; newPassword: string }) {
  const res = await api.post('/auth/reset-password', data);
  return res.data;
}
