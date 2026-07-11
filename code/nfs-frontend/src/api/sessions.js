import axiosInstance from './axiosInstance';

export const fetchUserSessions = (userId) => {
  return axiosInstance.get(`/api/sessions/user/${userId}`);
};
