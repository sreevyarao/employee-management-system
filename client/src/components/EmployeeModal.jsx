import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import * as employeeApi from '../api/employeeApi';

const EmployeeModal = ({ show, onHide, employee, onSuccess }) => {
  const isEdit = Boolean(employee);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Developer',
    phone: '',
    status: 'active'
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        password: '', // Blank when editing unless user enters new password
        role: employee.role || 'employee',
        department: employee.department || 'Engineering',
        designation: employee.designation || 'Software Developer',
        phone: employee.phone || '',
        status: employee.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: 'Engineering',
        designation: 'Software Developer',
        phone: '',
        status: 'active'
      });
    }
    setError('');
  }, [employee, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email) {
      setError('Name and Email are required.');
      return;
    }

    if (!isEdit && !formData.password) {
      setError('Password is required when creating a new employee.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        // Exclude password if empty during edit
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await employeeApi.updateEmployee(employee._id, payload);
      } else {
        await employeeApi.createEmployee(formData);
      }

      onSuccess();
      onHide();
    } catch (err) {
      setError(err.message || 'Failed to save employee.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-5">
          {isEdit ? 'Edit Employee Profile' : 'Add New Employee'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="employeeName">
                <Form.Label className="fw-semibold fs-7">Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="employeeEmail">
                <Form.Label className="fw-semibold fs-7">Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane.doe@company.com"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="employeePassword">
                <Form.Label className="fw-semibold fs-7">
                  {isEdit ? 'New Password (leave blank to keep current)' : 'Account Password *'}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEdit ? '••••••••' : 'Min. 6 characters'}
                  required={!isEdit}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="employeePhone">
                <Form.Label className="fw-semibold fs-7">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="employeeDepartment">
                <Form.Label className="fw-semibold fs-7">Department</Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Management">Management</option>
                  <option value="General">General</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="employeeDesignation">
                <Form.Label className="fw-semibold fs-7">Designation / Role Title</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="employeeRole">
                <Form.Label className="fw-semibold fs-7">Access System Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="employee">Employee (Standard Access)</option>
                  <option value="admin">Admin (Full System Privileges)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="employeeStatus">
                <Form.Label className="fw-semibold fs-7">Account Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Employee'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
