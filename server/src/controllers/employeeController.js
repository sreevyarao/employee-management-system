import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import { sendResponse } from '../utils/apiResponse.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all employees with filters
// @route   GET /api/employees
// @access  Private
export const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department, status, role } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    let query = {};

    if (search && String(search).trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const [employees, totalResults] = await Promise.all([
      Employee.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Employee.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Employees fetched successfully',
      data: employees,
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

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res, next) => {
  try {
    if (!req.params.id || !isValidObjectId(req.params.id)) {
      return sendResponse(res, 400, false, 'Invalid employee id');
    }

    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }
    return sendResponse(res, 200, true, 'Employee retrieved successfully', employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, phone, status } = req.body;

    if (!name || !String(name).trim() || !email || !String(email).trim() || !password || !String(password).trim()) {
      return sendResponse(res, 400, false, 'Name, email, and password are required');
    }

    if (String(password).trim().length < 6) {
      return sendResponse(res, 400, false, 'Password must be at least 6 characters');
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: cleanEmail });
    if (existingEmployee) {
      return sendResponse(res, 400, false, 'An employee with this email already exists');
    }

    const employee = await Employee.create({
      name: String(name).trim(),
      email: cleanEmail,
      password: String(password).trim(),
      role: role || 'employee',
      department: department || 'General',
      designation: designation || 'Team Member',
      phone: phone || '',
      status: status || 'active'
    });

    const employeeObj = employee.toObject();
    delete employeeObj.password;

    return sendResponse(res, 201, true, 'Employee created successfully', employeeObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res, next) => {
  try {
    if (!req.params.id || !isValidObjectId(req.params.id)) {
      return sendResponse(res, 400, false, 'Invalid employee id');
    }

    const { name, email, password, role, department, designation, phone, status } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    if (email && String(email).trim()) {
      const newEmail = String(email).trim().toLowerCase();
      if (newEmail !== employee.email) {
        const emailExists = await Employee.findOne({ email: newEmail });
        if (emailExists) {
          return sendResponse(res, 400, false, 'Email is already in use by another employee');
        }
        employee.email = newEmail;
      }
    }

    if (name !== undefined && !String(name).trim()) {
      return sendResponse(res, 400, false, 'Employee name cannot be blank');
    }

    if (name) employee.name = String(name).trim();
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (phone !== undefined) employee.phone = phone;
    if (status) employee.status = status;

    if (password && String(password).trim() !== '') {
      if (String(password).trim().length < 6) {
        return sendResponse(res, 400, false, 'Password must be at least 6 characters');
      }
      employee.password = String(password).trim();
    }

    await employee.save();

    const updatedObj = employee.toObject();
    delete updatedObj.password;

    return sendResponse(res, 200, true, 'Employee updated successfully', updatedObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res, next) => {
  try {
    if (!req.params.id || !isValidObjectId(req.params.id)) {
      return sendResponse(res, 400, false, 'Invalid employee id');
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    // Prevent admin from deleting themselves
    if (employee._id.toString() === req.user._id.toString()) {
      return sendResponse(res, 400, false, 'You cannot delete your own admin account');
    }

    await Employee.findByIdAndDelete(req.params.id);

    return sendResponse(res, 200, true, 'Employee deleted successfully');
  } catch (error) {
    next(error);
  }
};
