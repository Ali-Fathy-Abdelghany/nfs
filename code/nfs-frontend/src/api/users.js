import axiosInstance from './axiosInstance';

export const fetchUserProfile = () => axiosInstance.get('/users/profile');
export const updateUserProfile = (data) => axiosInstance.put('/users/profile', data);
export const fetchUserAvatars = (userIds) =>
  axiosInstance.post('/users/avatars', Array.isArray(userIds) ? userIds : []);

