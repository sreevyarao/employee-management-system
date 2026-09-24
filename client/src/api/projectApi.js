import axiosInstance from './axiosInstance';

export const getProjects = (params = {}) => {
  return axiosInstance.get('/projects', { params });
};

export const getDashboardSummary = () => {
  return axiosInstance.get('/admin/dashboard');
};

export const getProjectById = (id) => {
  return axiosInstance.get(`/projects/${id}`);
};

export const createProject = (projectData) => {
  return axiosInstance.post('/projects', projectData);
};

export const updateProject = (id, projectData) => {
  return axiosInstance.put(`/projects/${id}`, projectData);
};

export const deleteProject = (id) => {
  return axiosInstance.delete(`/projects/${id}`);
};

export const addModule = (projectId, data) => {
  return axiosInstance.post(`/projects/${projectId}/modules`, data);
};

export const updateModule = (projectId, moduleId, data) => {
  return axiosInstance.put(`/projects/${projectId}/modules/${moduleId}`, data);
};

export const deleteModule = (projectId, moduleId) => {
  return axiosInstance.delete(`/projects/${projectId}/modules/${moduleId}`);
};

export const addTask = (projectId, moduleId, data) => {
  return axiosInstance.post(`/projects/${projectId}/modules/${moduleId}/tasks`, data);
};

export const updateTask = (projectId, moduleId, taskId, data) => {
  return axiosInstance.put(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}`, data);
};

export const deleteTask = (projectId, moduleId, taskId) => {
  return axiosInstance.delete(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}`);
};

export const completeTask = (projectId, moduleId, taskId) => {
  return axiosInstance.put(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}/complete`);
};
