import axiosInstance from './axiosInstance';

export const createPayment = (data) => axiosInstance.post('/api/payments/create', data);
export const confirmPayment = (id, data = {}) => axiosInstance.post(`/api/payments/${id}/confirm`, data);
export const fetchPaymentById = (id) => axiosInstance.get(`/api/payments/${id}`);
export const fetchPatientPayments = (patientId) => axiosInstance.get(`/api/payments/patient/${patientId}`);
