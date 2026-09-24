import axiosInstance from './axiosInstance';

export const getEmployees = (params = {}) => {
  return axiosInstance.get('/employees', { params });
};

export const getEmployeeById = (id) => {
  return axiosInstance.get(`/employees/${id}`);
};

export const createEmployee = (employeeData) => {
  return axiosInstance.post('/employees', employeeData);
};

export const updateEmployee = (id, employeeData) => {
  return axiosInstance.put(`/employees/${id}`, employeeData);
};

export const deleteEmployee = (id) => {
  return axiosInstance.delete(`/employees/${id}`);
};
