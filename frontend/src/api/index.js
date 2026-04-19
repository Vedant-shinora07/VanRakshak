import axiosInstance from './axiosInstance';

// Auth
export const login = async (phone, pin) => {
  const res = await axiosInstance.post('/auth/login', { phone, pin });
  return res.data;
};
export const register = async (data) => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data;
};
export const getMe = async () => {
  const res = await axiosInstance.get('/auth/me');
  return res.data;
};

// Harvest
export const createHarvestEntry = async (data) => {
  const res = await axiosInstance.post('/harvest/entry', data);
  return res.data;
};
export const getMyBatches = async () => {
  const res = await axiosInstance.get('/harvest/my-batches');
  return res.data;
};
export const syncOffline = async () => {
  const res = await axiosInstance.post('/harvest/sync');
  return res.data;
};

// Depot
export const receiveShipment = async (data) => {
  const res = await axiosInstance.post('/depot/receive', data);
  return res.data;
};
export const dispatchShipment = async (data) => {
  const res = await axiosInstance.post('/depot/dispatch', data);
  return res.data;
};
export const getDepotFlags = async () => {
  const res = await axiosInstance.get('/depot/flags');
  return res.data;
};

// Trader
export const addTransport = async (data) => {
  const res = await axiosInstance.post('/trader/transport', data);
  return res.data;
};
export const deliverBatch = async (data) => {
  const res = await axiosInstance.post('/trader/deliver', data);
  return res.data;
};
export const getTraderBatches = async () => {
  const res = await axiosInstance.get('/trader/batches');
  return res.data;
};

// Public
export const getProvenance = async (batchId) => {
  const res = await axiosInstance.get(`/public/batch/${batchId}/provenance`);
  return res.data;
};
export const resolveQR = async (qrHash) => {
  const res = await axiosInstance.get(`/public/qr/${qrHash}`);
  return res.data;
};
export const verifyChain = async (batchId) => {
  const res = await axiosInstance.get(`/public/verify/${batchId}`);
  return res.data;
};
export const getPermitAudit = async (permitNumber) => {
  const res = await axiosInstance.get(`/public/permit/${permitNumber}/audit`);
  return res.data;
};

// Admin
export const getUsers = async () => {
  const res = await axiosInstance.get('/admin/users');
  return res.data;
};
export const createUser = async (data) => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data;
};
export const createPermit = async (data) => {
  const res = await axiosInstance.post('/admin/permits', data);
  return res.data;
};
export const getAdminFlags = async () => {
  const res = await axiosInstance.get('/admin/flags');
  return res.data;
};
export const getAdminAudit = async (permitNumber) => {
  const res = await axiosInstance.get(`/admin/audit?permitNumber=${permitNumber}`);
  return res.data;
};
