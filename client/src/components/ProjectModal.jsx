import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import * as projectApi from '../api/projectApi';
import * as employeeApi from '../api/employeeApi';

const ProjectModal = ({ show, onHide, project, onSuccess }) => {
  const isEdit = Boolean(project);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientName: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    priority: 'medium',
    budget: 0,
    assignedEmployees: []
  });

  const [employeesList, setEmployeesList] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch active employees for assignment
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeApi.getEmployees({ status: 'active' });
        if (res.success) {
          setEmployeesList(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching employees list:', err);
      }
    };

    if (show) {
      fetchEmployees();
    }
  }, [show]);

  useEffect(() => {
    if (project) {
      const formattedStartDate = project.startDate
        ? new Date(project.startDate).toISOString().split('T')[0]
        : '';
      const formattedEndDate = project.endDate
        ? new Date(project.endDate).toISOString().split('T')[0]
        : '';

      const assignedIds = (project.assignedEmployees || []).map((emp) =>
        typeof emp === 'object' ? emp._id : emp
      );

      setFormData({
        title: project.title || '',
        description: project.description || '',
        clientName: project.clientName || '',
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        budget: project.budget || 0,
        assignedEmployees: assignedIds
      });
    } else {
      setFormData({
        title: '',
        description: '',
        clientName: '',
        startDate: '',
        endDate: '',
        status: 'planning',
        priority: 'medium',
        budget: 0,
        assignedEmployees: []
      });
    }
    setError('');
  }, [project, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeToggle = (employeeId) => {
    setFormData((prev) => {
      const exists = prev.assignedEmployees.includes(employeeId);
      if (exists) {
        return {
          ...prev,
          assignedEmployees: prev.assignedEmployees.filter((id) => id !== employeeId)
        };
      } else {
        return {
          ...prev,
          assignedEmployees: [...prev.assignedEmployees, employeeId]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title) {
      setError('Project title is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await projectApi.updateProject(project._id, formData);
      } else {
        await projectApi.createProject(formData);
      }

      onSuccess();
      onHide();
    } catch (err) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-5">
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Row className="g-3">
            <Col md={8}>
              <Form.Group controlId="projectTitle">
                <Form.Label className="fw-semibold fs-7">Project Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Cloud Infrastructure Migration"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="projectClient">
                <Form.Label className="fw-semibold fs-7">Client Name</Form.Label>
                <Form.Control
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId="projectDescription">
                <Form.Label className="fw-semibold fs-7">Project Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Outline project objectives, scope, and deliverables..."
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="projectStatus">
                <Form.Label className="fw-semibold fs-7">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="projectPriority">
                <Form.Label className="fw-semibold fs-7">Priority Level</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="projectBudget">
                <Form.Label className="fw-semibold fs-7">Budget ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="projectStartDate">
                <Form.Label className="fw-semibold fs-7">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="projectEndDate">
                <Form.Label className="fw-semibold fs-7">End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Label className="fw-semibold fs-7 d-flex justify-content-between align-items-center">
                <span>Assign Team Members</span>
                <Badge bg="secondary" className="px-2 py-1 fs-9">
                  {formData.assignedEmployees.length} Selected
                </Badge>
              </Form.Label>

              <div
                className="p-3 border rounded-3 bg-light"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
              >
                {employeesList.length === 0 ? (
                  <p className="text-muted mb-0 small">No active employees found to assign.</p>
                ) : (
                  <Row className="g-2">
                    {employeesList.map((emp) => {
                      const isChecked = formData.assignedEmployees.includes(emp._id);
                      return (
                        <Col md={6} key={emp._id}>
                          <Form.Check
                            type="checkbox"
                            id={`emp-check-${emp._id}`}
                            label={
                              <span className="fs-8 fw-medium text-dark">
                                {emp.name} <span className="text-muted">({emp.department})</span>
                              </span>
                            }
                            checked={isChecked}
                            onChange={() => handleEmployeeToggle(emp._id)}
                          />
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProjectModal;
