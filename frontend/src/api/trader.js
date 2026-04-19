import axiosInstance from './axiosInstance';

export const addTransport = (data) => axiosInstance.post('/trader/transport', data);
export const deliverBatch = (data) => axiosInstance.post('/trader/deliver', data);
export const getMyBatches = () => axiosInstance.get('/trader/batches');
