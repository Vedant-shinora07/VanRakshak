import axiosInstance from './axiosInstance';

export const receiveShipment = (data) => axiosInstance.post('/depot/receive', data);
export const dispatchShipment = (data) => axiosInstance.post('/depot/dispatch', data);
export const getFlags = () => axiosInstance.get('/depot/flags');
