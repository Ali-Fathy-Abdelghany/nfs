import axiosInstance from './axiosInstance';

export const fetchPatients = (params) =>
  axiosInstance.get('/api/patients', { params });

export const fetchPatientsByDoctor = (doctorId) =>
  axiosInstance.get(`/api/patients/by-doctor/${doctorId}`);

export const fetchPatientById = (id) => axiosInstance.get(`/api/patients/${id}`);
export const fetchPatientMedicalHistory = (id) => axiosInstance.get(`/api/patients/${id}/medical-history`);
export const createPatient = (data) => axiosInstance.post('/api/patients', data);
