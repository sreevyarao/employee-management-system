import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Employee from '../models/Employee.js';
import Assignment from '../models/Assignment.js';
import { sendResponse } from '../utils/apiResponse.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── Helpers ──────────────────────────────────────────────────────────────────

// Compute progress percentages at all levels (NOT stored in DB)
const computeProgress = (project) => {
  const result = project.toObject ? project.toObject() : { ...project };
  let totalTasks = 0;
  let completedTasks = 0;

  result.modules = (result.modules || []).map((mod) => {
    const modTotal = mod.tasks?.length || 0;
    const modDone = (mod.tasks || []).filter((t) => t.status === 'completed').length;
    totalTasks += modTotal;
    completedTasks += modDone;

    return {
      ...mod,
      progress: modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0
    };
  });

  result.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return result;
};

const validateObjectId = (id, label, res) => {
  if (!id || !isValidObjectId(id)) {
    return sendResponse(res, 400, false, `Invalid ${label}`);
  }
  return null;
};

const validateProjectIds = (ids, label, res) => {
  if (!Array.isArray(ids)) return null;
  const invalid = ids.find((item) => !isValidObjectId(item));
  if (invalid) {
    return sendResponse(res, 400, false, `Invalid ${label}`);
  }
  return null;
};

// ── Project CRUD ─────────────────────────────────────────────────────────────

// @desc    Get all projects with filters
// @route   GET /api/projects
// @access  Private
export const getAllProjects = async (req, res, next) => {
  try {
    const { search, status, priority } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    let query = {};

    if (search && String(search).trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;

    if (req.user.role !== 'admin') {
      query.assignedEmployees = req.user._id;
    }

    const [projects, totalResults] = await Promise.all([
      Project.find(query)
        .populate('assignedEmployees', 'name email department designation status')
        .populate('createdBy', 'name email')
        .populate('modules.assignedEmployee', 'name email')
        .populate('modules.tasks.completedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query)
    ]);

    const enriched = projects.map(computeProgress);
    return res.status(200).json({
      success: true,
      message: 'Projects fetched successfully',
      data: enriched,
      pagination: {
        page,
        limit,
        totalResults,
        totalPages: Math.ceil(totalResults / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const invalidId = validateObjectId(req.params.id, 'project id', res);
    if (invalidId) return invalidId;

    const project = await Project.findById(req.params.id)
      .populate('assignedEmployees', 'name email department designation phone status')
      .populate('createdBy', 'name email')
      .populate('modules.assignedEmployee', 'name email department')
      .populate('modules.tasks.completedBy', 'name email');

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    if (
      req.user.role !== 'admin' &&
      !project.assignedEmployees.some((emp) => emp._id.toString() === req.user._id.toString())
    ) {
      return sendResponse(res, 403, false, 'Access denied. You are not assigned to this project');
    }

    return sendResponse(res, 200, true, 'Project retrieved successfully', computeProgress(project));
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res, next) => {
  try {
    const {
      title, description, clientName, startDate, endDate,
      status, priority, budget, assignedEmployees
    } = req.body;

    if (!title || !String(title).trim()) return sendResponse(res, 400, false, 'Project title is required');

    const invalidIds = validateProjectIds(assignedEmployees, 'assigned employee ids', res);
    if (invalidIds) return invalidIds;

    const project = await Project.create({
      title: String(title).trim(),
      description: description || '',
      clientName: clientName || '',
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || 'planning',
      priority: priority || 'medium',
      budget: budget ? Number(budget) : 0,
      assignedEmployees: assignedEmployees || [],
      createdBy: req.user._id,
      modules: []
    });

    const populated = await Project.findById(project._id)
      .populate('assignedEmployees', 'name email department designation status')
      .populate('createdBy', 'name email');

    return sendResponse(res, 201, true, 'Project created successfully', computeProgress(populated));
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res, next) => {
  try {
    const invalidId = validateObjectId(req.params.id, 'project id', res);
    if (invalidId) return invalidId;

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const {
      title, description, clientName, startDate, endDate,
      status, priority, budget, assignedEmployees
    } = req.body;

    if (title !== undefined && !String(title).trim()) {
      return sendResponse(res, 400, false, 'Project title cannot be blank');
    }

    const invalidIds = validateProjectIds(assignedEmployees, 'assigned employee ids', res);
    if (invalidIds) return invalidIds;

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (clientName !== undefined) project.clientName = clientName;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (budget !== undefined) project.budget = Number(budget);
    if (assignedEmployees) project.assignedEmployees = assignedEmployees;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('assignedEmployees', 'name email department designation status')
      .populate('createdBy', 'name email')
      .populate('modules.assignedEmployee', 'name email');

    return sendResponse(res, 200, true, 'Project updated successfully', computeProgress(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res, next) => {
  try {
    const invalidId = validateObjectId(req.params.id, 'project id', res);
    if (invalidId) return invalidId;

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');
    await Project.findByIdAndDelete(req.params.id);
    return sendResponse(res, 200, true, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardSummary = async (req, res, next) => {
  try {
    const [employees, projects, assignments, assignmentCounts, activeEmployeeIds] = await Promise.all([
      Employee.find({}).select('-password').sort({ createdAt: -1 }),
      Project.find({})
        .populate('assignedEmployees', 'name email department designation status')
        .populate('modules.assignedEmployee', 'name email department')
        .populate('modules.tasks.completedBy', 'name email')
        .sort({ createdAt: -1 }),
      Assignment.find({})
        .populate('employee', 'name email department')
        .populate('project', 'title status')
        .sort({ createdAt: -1 }),
      Assignment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Assignment.distinct('employee', { status: 'active' })
    ]);

    const employeeStatusCounts = { active: 0, inactive: 0 };
    employees.forEach((employee) => {
      if (employee.status === 'active') employeeStatusCounts.active += 1;
      else employeeStatusCounts.inactive += 1;
    });

    const projectStatusCounts = { planning: 0, 'in-progress': 0, completed: 0, 'on-hold': 0 };
    const enrichedProjects = projects.map((project) => {
      const computed = computeProgress(project);
      projectStatusCounts[computed.status] = (projectStatusCounts[computed.status] || 0) + 1;
      return {
        ...computed,
        moduleProgress: (computed.modules || []).map((module) => ({
          _id: module._id,
          title: module.title,
          status: module.status,
          progress: module.progress,
          tasks: module.tasks?.length || 0,
          completedTasks: (module.tasks || []).filter((task) => task.status === 'completed').length,
          assignedEmployee: module.assignedEmployee
            ? {
                _id: module.assignedEmployee._id,
                name: module.assignedEmployee.name,
                email: module.assignedEmployee.email
              }
            : null
        }))
      };
    });

    const assignmentStatusCounts = { active: activeEmployeeIds.length, completed: 0, released: 0 };
    assignmentCounts.forEach(({ _id, count }) => {
      if (assignmentStatusCounts[_id] !== undefined) {
        assignmentStatusCounts[_id] = count;
      }
    });
    assignmentStatusCounts.active = activeEmployeeIds.length;

    const assignedEmployees = enrichedProjects.reduce(
      (total, project) => total + (project.assignedEmployees?.length || 0),
      0
    );

    const averageProjectProgress = enrichedProjects.length
      ? Math.round(
          enrichedProjects.reduce((total, project) => total + (project.progress || 0), 0) /
            enrichedProjects.length
        )
      : 0;

    const summary = {
      totalEmployees: employees.length,
      employeeStatusCounts,
      totalProjects: enrichedProjects.length,
      projectStatusCounts,
      totalAssignments: assignments.length,
      assignmentStatusCounts,
      assignedEmployees,
      averageProjectProgress,
      projects: enrichedProjects.slice(0, 5),
      recentEmployees: employees.slice(0, 5)
    };

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard summary fetched successfully',
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// ── Module endpoints ─────────────────────────────────────────────────────────

// @desc    Add a module to a project
// @route   POST /api/projects/:id/modules
// @access  Private/Admin
export const addModule = async (req, res, next) => {
  try {
    const invalidId = validateObjectId(req.params.id, 'project id', res);
    if (invalidId) return invalidId;

    const { title, description, assignedEmployee } = req.body;
    if (!title || !String(title).trim()) return sendResponse(res, 400, false, 'Module title is required');

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    project.modules.push({
      title: String(title).trim(),
      description: description || '',
      assignedEmployee: assignedEmployee || null,
      tasks: []
    });

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('modules.assignedEmployee', 'name email department');

    return sendResponse(res, 201, true, 'Module added successfully', computeProgress(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Update a module
// @route   PUT /api/projects/:id/modules/:moduleId
// @access  Private/Admin
export const updateModule = async (req, res, next) => {
  try {
    const invalidProjectId = validateObjectId(req.params.id, 'project id', res);
    if (invalidProjectId) return invalidProjectId;
    const invalidModuleId = validateObjectId(req.params.moduleId, 'module id', res);
    if (invalidModuleId) return invalidModuleId;

    const { title, description, assignedEmployee, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const mod = project.modules.id(req.params.moduleId);
    if (!mod) return sendResponse(res, 404, false, 'Module not found');

    if (title !== undefined && !String(title).trim()) return sendResponse(res, 400, false, 'Module title cannot be blank');
    if (title) mod.title = title;
    if (description !== undefined) mod.description = description;
    if (assignedEmployee !== undefined) mod.assignedEmployee = assignedEmployee || null;
    if (status) mod.status = status;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('modules.assignedEmployee', 'name email department');

    return sendResponse(res, 200, true, 'Module updated successfully', computeProgress(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a module
// @route   DELETE /api/projects/:id/modules/:moduleId
// @access  Private/Admin
export const deleteModule = async (req, res, next) => {
  try {
    const invalidProjectId = validateObjectId(req.params.id, 'project id', res);
    if (invalidProjectId) return invalidProjectId;
    const invalidModuleId = validateObjectId(req.params.moduleId, 'module id', res);
    if (invalidModuleId) return invalidModuleId;

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const mod = project.modules.id(req.params.moduleId);
    if (!mod) return sendResponse(res, 404, false, 'Module not found');

    mod.deleteOne();
    await project.save();
    return sendResponse(res, 200, true, 'Module deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ── Task endpoints ───────────────────────────────────────────────────────────

// @desc    Add a task to a module
// @route   POST /api/projects/:id/modules/:moduleId/tasks
// @access  Private/Admin
export const addTask = async (req, res, next) => {
  try {
    const invalidProjectId = validateObjectId(req.params.id, 'project id', res);
    if (invalidProjectId) return invalidProjectId;
    const invalidModuleId = validateObjectId(req.params.moduleId, 'module id', res);
    if (invalidModuleId) return invalidModuleId;

    const { title, description } = req.body;
    if (!title || !String(title).trim()) return sendResponse(res, 400, false, 'Task title is required');

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const mod = project.modules.id(req.params.moduleId);
    if (!mod) return sendResponse(res, 404, false, 'Module not found');

    mod.tasks.push({ title: String(title).trim(), description: description || '' });
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('modules.assignedEmployee', 'name email');

    return sendResponse(res, 201, true, 'Task added successfully', computeProgress(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/projects/:id/modules/:moduleId/tasks/:taskId
// @access  Private/Admin
export const updateTask = async (req, res, next) => {
  try {
    const invalidProjectId = validateObjectId(req.params.id, 'project id', res);
    if (invalidProjectId) return invalidProjectId;
    const invalidModuleId = validateObjectId(req.params.moduleId, 'module id', res);
    if (invalidModuleId) return invalidModuleId;
    const invalidTaskId = validateObjectId(req.params.taskId, 'task id', res);
    if (invalidTaskId) return invalidTaskId;

    const { title, description, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const mod = project.modules.id(req.params.moduleId);
    if (!mod) return sendResponse(res, 404, false, 'Module not found');

    const task = mod.tasks.id(req.params.taskId);
    if (!task) return sendResponse(res, 404, false, 'Task not found');

    if (title !== undefined && !String(title).trim()) return sendResponse(res, 400, false, 'Task title cannot be blank');
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;

    await project.save();
    return sendResponse(res, 200, true, 'Task updated successfully', computeProgress(project));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/projects/:id/modules/:moduleId/tasks/:taskId
// @access  Private/Admin
export const deleteTask = async (req, res, next) => {
  try {
    const invalidProjectId = validateObjectId(req.params.id, 'project id', res);
    if (invalidProjectId) return invalidProjectId;
    const invalidModuleId = validateObjectId(req.params.moduleId, 'module id', res);
    if (invalidModuleId) return invalidModuleId;
    const invalidTaskId = validateObjectId(req.params.taskId, 'task id', res);
    if (invalidTaskId) return invalidTaskId;

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const mod = project.modules.id(req.params.moduleId);
    if (!mod) return sendResponse(res, 404, false, 'Module not found');

    const task = mod.tasks.id(req.params.taskId);
    if (!task) return sendResponse(res, 404, false, 'Task not found');

    task.deleteOne();
    await project.save();
    return sendResponse(res, 200, true, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Employee completes a task — checks requester owns the module
// @route   PUT /api/projects/:id/modules/:moduleId/tasks/:taskId/complete
// @access  Private
export const completeTask = async (req, res, next) => {
  try {
    const invalidProjectId = validateObjectId(req.params.id, 'project id', res);
    if (invalidProjectId) return invalidProjectId;
    const invalidModuleId = validateObjectId(req.params.moduleId, 'module id', res);
    if (invalidModuleId) return invalidModuleId;
    const invalidTaskId = validateObjectId(req.params.taskId, 'task id', res);
    if (invalidTaskId) return invalidTaskId;

    const project = await Project.findById(req.params.id);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const mod = project.modules.id(req.params.moduleId);
    if (!mod) return sendResponse(res, 404, false, 'Module not found');

    // ── OWNERSHIP CHECK ──────────────────────────────────────────────────────
    // Only the employee assigned to this module (or an admin) can complete tasks.
    if (req.user.role !== 'admin') {
      const assignedId = mod.assignedEmployee?.toString();
      if (!assignedId || assignedId !== req.user._id.toString()) {
        return sendResponse(
          res,
          403,
          false,
          'Access denied. You are not the assigned employee for this module.'
        );
      }
    }

    const task = mod.tasks.id(req.params.taskId);
    if (!task) return sendResponse(res, 404, false, 'Task not found');

    if (task.status === 'completed') {
      return sendResponse(res, 400, false, 'Task is already completed');
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.completedBy = req.user._id;

    // Auto-advance module status
    const allDone = mod.tasks.every((t) => t.status === 'completed');
    const anyInProgress = mod.tasks.some((t) => t.status !== 'pending');
    if (allDone) mod.status = 'completed';
    else if (anyInProgress) mod.status = 'in-progress';

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('modules.assignedEmployee', 'name email')
      .populate('modules.tasks.completedBy', 'name');

    return sendResponse(res, 200, true, 'Task marked as completed', computeProgress(updated));
  } catch (error) {
    next(error);
  }
};
