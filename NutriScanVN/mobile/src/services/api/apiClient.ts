import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 10000
});

api.interceptors.request.use(async (config) => {
  // TODO: plug in storage token retrieval
  const token = globalThis.__ACCESS_TOKEN__ as string | undefined;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && globalThis.__REFRESH_TOKEN__) {
      original._retry = true;
      try {
        const refreshRes = await api.post('/auth/refresh', {
          refreshToken: globalThis.__REFRESH_TOKEN__
        });
        globalThis.__ACCESS_TOKEN__ = refreshRes.data.accessToken;
        globalThis.__REFRESH_TOKEN__ = refreshRes.data.refreshToken;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${globalThis.__ACCESS_TOKEN__}`;
        return api.request(original);
      } catch (e) {
        // fallthrough
      }
    }
    return Promise.reject(error);
  }
);

export default api;
