import axiosInstance from './axiosInstance';

export const getAssignments = (params = {}) =>
  axiosInstance.get('/assignments', { params });

export const getMyAssignment = () =>
  axiosInstance.get('/assignments/my');

export const getEmployeeAssignmentStatus = () =>
  axiosInstance.get('/assignments/employee-status');

export const createAssignment = (data) =>
  axiosInstance.post('/assignments', data);

export const completeAssignment = (id, status = 'completed') =>
  axiosInstance.put(`/assignments/${id}/complete`, { status });

export const deleteAssignment = (id) =>
  axiosInstance.delete(`/assignments/${id}`);

// ── Module API ────────────────────────────────────────────────────────────────
export const addModule = (projectId, data) =>
  axiosInstance.post(`/projects/${projectId}/modules`, data);

export const updateModule = (projectId, moduleId, data) =>
  axiosInstance.put(`/projects/${projectId}/modules/${moduleId}`, data);

export const deleteModule = (projectId, moduleId) =>
  axiosInstance.delete(`/projects/${projectId}/modules/${moduleId}`);

// ── Task API ──────────────────────────────────────────────────────────────────
export const addTask = (projectId, moduleId, data) =>
  axiosInstance.post(`/projects/${projectId}/modules/${moduleId}/tasks`, data);

export const updateTask = (projectId, moduleId, taskId, data) =>
  axiosInstance.put(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}`, data);

export const deleteTask = (projectId, moduleId, taskId) =>
  axiosInstance.delete(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}`);

export const completeTask = (projectId, moduleId, taskId) =>
  axiosInstance.put(`/projects/${projectId}/modules/${moduleId}/tasks/${taskId}/complete`);
