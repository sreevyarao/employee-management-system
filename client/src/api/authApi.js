import axiosInstance from './axiosInstance';

export const login = (email, password) => {
  return axiosInstance.post('/auth/login', { email, password });
};

export const logout = () => {
  return axiosInstance.post('/auth/logout');
};

export const getProfile = () => {
  return axiosInstance.get('/auth/profile');
};

export const changePassword = (currentPassword, newPassword) => {
  return axiosInstance.put('/auth/change-password', { currentPassword, newPassword });
};
