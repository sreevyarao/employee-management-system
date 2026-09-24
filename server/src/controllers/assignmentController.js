import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Project from '../models/Project.js';
import Employee from '../models/Employee.js';
import { sendResponse } from '../utils/apiResponse.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateObjectId = (id, label, res) => {
  if (!id || !isValidObjectId(id)) {
    return sendResponse(res, 400, false, `Invalid ${label}`);
  }
  return null;
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private/Admin
export const getAllAssignments = async (req, res, next) => {
  try {
    const { status, employee, project } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (employee) query.employee = employee;
    if (project) query.project = project;

    const assignments = await Assignment.find(query)
      .populate('employee', 'name email department designation phone status')
      .populate('project', 'title status priority clientName startDate endDate')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Assignments fetched successfully', assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignment for the logged-in employee (their current project)
// @route   GET /api/assignments/my
// @access  Private
export const getMyAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({
      employee: req.user._id,
      status: 'active'
    })
      .populate({
        path: 'project',
        populate: [
          { path: 'assignedEmployees', select: 'name email department' },
          { path: 'modules.assignedEmployee', select: 'name email' },
          { path: 'modules.tasks.completedBy', select: 'name' }
        ]
      })
      .populate('assignedBy', 'name email');

    return sendResponse(res, 200, true, 'Assignment retrieved successfully', assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees with their current assignment status
// @route   GET /api/assignments/employee-status
// @access  Private/Admin
export const getEmployeeAssignmentStatus = async (req, res, next) => {
  try {
    const activeAssignments = await Assignment.find({ status: 'active' })
      .populate('project', 'title status priority')
      .select('employee project status startDate createdAt');

    const statusMap = {};
    activeAssignments.forEach((assignment) => {
      if (!assignment.employee) return;
      statusMap[assignment.employee.toString()] = assignment.toObject();
    });

    return sendResponse(res, 200, true, 'Employee assignment statuses fetched', statusMap);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign an employee to a project (blocks if already has active assignment)
// @route   POST /api/assignments
// @access  Private/Admin
export const createAssignment = async (req, res, next) => {
  try {
    const { employeeId, projectId, role, notes, startDate, endDate } = req.body;

    if (!employeeId || !String(employeeId).trim()) {
      return sendResponse(res, 400, false, 'Employee is required');
    }
    if (!projectId || !String(projectId).trim()) {
      return sendResponse(res, 400, false, 'Project is required');
    }

    const invalidEmployeeId = validateObjectId(employeeId, 'employee id', res);
    if (invalidEmployeeId) return invalidEmployeeId;
    const invalidProjectId = validateObjectId(projectId, 'project id', res);
    if (invalidProjectId) return invalidProjectId;

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    // Application-level check (fast path; the DB index is the real guard)
    const existing = await Assignment.findOne({
      employee: employeeId,
      status: 'active'
    }).populate('project', 'title');

    if (existing) {
      return sendResponse(
        res,
        409,
        false,
        `Employee is already actively assigned to "${existing.project?.title || 'a project'}". Complete or release that assignment first.`
      );
    }

    // Create assignment — if a concurrent request slips past the check above,
    // the partial unique index throws E11000 → errorMiddleware returns 409.
    const assignment = await Assignment.create({
      employee: employeeId,
      project: projectId,
      assignedBy: req.user._id,
      role: role || 'Team Member',
      notes: notes || '',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: 'active'
    });

    // Also add employee to project's assignedEmployees if not already there
    if (!project.assignedEmployees.map((e) => e.toString()).includes(employeeId)) {
      project.assignedEmployees.push(employeeId);
      await project.save();
    }

    const populated = await Assignment.findById(assignment._id)
      .populate('employee', 'name email department designation')
      .populate('project', 'title status priority clientName')
      .populate('assignedBy', 'name email');

    return sendResponse(res, 201, true, 'Assignment created successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Complete or release an assignment
// @route   PUT /api/assignments/:id/complete
// @access  Private/Admin
export const completeAssignment = async (req, res, next) => {
  try {
    const invalidId = validateObjectId(req.params.id, 'assignment id', res);
    if (invalidId) return invalidId;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return sendResponse(res, 404, false, 'Assignment not found');
    }

    const { status } = req.body; // 'completed' | 'released'
    if (!status || !['completed', 'released'].includes(status)) {
      return sendResponse(res, 400, false, 'Assignment status must be either completed or released');
    }
    assignment.status = status;
    assignment.endDate = new Date();
    await assignment.save();

    const populated = await Assignment.findById(assignment._id)
      .populate('employee', 'name email department')
      .populate('project', 'title status');

    return sendResponse(res, 200, true, `Assignment marked as ${assignment.status}`, populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Admin
export const deleteAssignment = async (req, res, next) => {
  try {
    const invalidId = validateObjectId(req.params.id, 'assignment id', res);
    if (invalidId) return invalidId;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return sendResponse(res, 404, false, 'Assignment not found');
    }

    await Assignment.findByIdAndDelete(req.params.id);
    return sendResponse(res, 200, true, 'Assignment deleted successfully');
  } catch (error) {
    next(error);
  }
};
