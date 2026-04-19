import axiosInstance from './axiosInstance';

export const getUsers = () => axiosInstance.get('/admin/users');
export const createUser = (data) => axiosInstance.post('/auth/register', data);
export const createPermit = (data) => axiosInstance.post('/admin/permits', data);
export const getFlags = () => axiosInstance.get('/admin/flags');
export const getAudit = (permitNumber) => axiosInstance.get(permitNumber ? `/admin/audit?permitNumber=${permitNumber}` : '/admin/audit');
