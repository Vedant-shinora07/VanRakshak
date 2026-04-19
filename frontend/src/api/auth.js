import axiosInstance from './axiosInstance';

export const login = (phone, pin) => axiosInstance.post('/auth/login', { phone, pin });
export const register = (data) => axiosInstance.post('/auth/register', data);
export const getMe = () => axiosInstance.get('/auth/me');
