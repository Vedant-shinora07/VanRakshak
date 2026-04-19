import axiosInstance from './axiosInstance';

export const getProvenance = (batchId) => axiosInstance.get(`/public/batch/${batchId}/provenance`);
export const resolveQR = (qrHash) => axiosInstance.get(`/public/qr/${qrHash}`);
export const getPermitAudit = (permitNumber) => axiosInstance.get(`/public/permit/${permitNumber}/audit`);
