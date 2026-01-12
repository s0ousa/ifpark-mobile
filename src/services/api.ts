import axios from 'axios';
import { API_URL } from '@env';
import { useAuthStore } from '../store/useAuthStore';

console.log("ENV CHECK - URL DA API:", API_URL);
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { signOut } = useAuthStore.getState();
      await signOut();
    }
    return Promise.reject(error);
  }
);

export default api;