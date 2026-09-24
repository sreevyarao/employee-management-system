import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import * as employeeApi from '../api/employeeApi';
import * as projectApi from '../api/projectApi';
import * as assignmentApi from '../api/assignmentApi';

const AssignmentModal = ({ show, onHide, preselectedEmployee, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: preselectedEmployee?._id || '',
    projectId: '',
    role: 'Team Member',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [empRes, projRes] = await Promise.all([
          employeeApi.getEmployees({ status: 'active' }),
          projectApi.getProjects({ status: 'in-progress' })
        ]);
        if (empRes.success) setEmployees(empRes.data || []);
        if (projRes.success) setProjects(projRes.data || []);
      } catch (err) {
        console.error('Error loading assignment form data:', err);
      }
    };

    if (show) loadData();
  }, [show]);

  useEffect(() => {
    if (preselectedEmployee) {
      setFormData((prev) => ({ ...prev, employeeId: preselectedEmployee._id }));
    }
  }, [preselectedEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId || !formData.projectId) {
      setError('Both employee and project are required.');
      return;
    }

    setSubmitting(true);
    try {
      await assignmentApi.createAssignment(formData);
      onSuccess();
      onHide();
    } catch (err) {
      setError(err.message || 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-5">Assign Employee to Project</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant={error.includes('already') ? 'warning' : 'danger'} dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold fs-7">Employee *</Form.Label>
            <Form.Select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              disabled={Boolean(preselectedEmployee)}
              required
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold fs-7">Project *</Form.Label>
            <Form.Select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Project --</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.title} ({proj.status})
                </option>
              ))}
            </Form.Select>
            {projects.length === 0 && (
              <Form.Text className="text-muted">
                Only "in-progress" projects are shown. Change project status to assign.
              </Form.Text>
            )}
          </Form.Group>

          <Row className="g-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold fs-7">Role on Project</Form.Label>
                <Form.Control
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Lead Developer"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold fs-7">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label className="fw-semibold fs-7">Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional assignment notes..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={submitting}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Assigning...' : 'Create Assignment'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AssignmentModal;
