import axiosInstance from './axiosInstance';

export const createHarvestEntry = (data) => axiosInstance.post('/harvest/entry', data);
export const getMyBatches = () => axiosInstance.get('/harvest/my-batches');
export const syncOffline = () => axiosInstance.post('/harvest/sync');
