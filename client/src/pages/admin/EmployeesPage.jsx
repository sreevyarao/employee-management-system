import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form, Badge, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Search, Plus, Edit2, Trash2, UserPlus, Phone, Mail, Building, ClipboardList } from 'lucide-react';
import * as employeeApi from '../../api/employeeApi';
import * as assignmentApi from '../../api/assignmentApi';
import EmployeeModal from '../../components/EmployeeModal';
import AssignmentModal from '../../components/AssignmentModal';
import ConfirmModal from '../../components/ConfirmModal';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningEmployee, setAssigningEmployee] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const [empRes, statusRes] = await Promise.all([
        employeeApi.getEmployees({
          search: searchTerm,
          department: selectedDept,
          status: selectedStatus
        }),
        assignmentApi.getEmployeeAssignmentStatus()
      ]);
      if (empRes.success) setEmployees(empRes.data || []);
      if (statusRes.success) setAssignmentStatus(statusRes.data || {});
    } catch (err) {
      setError(err.message || 'Failed to fetch employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [selectedDept, selectedStatus]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchEmployees(); };

  const flash = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await employeeApi.deleteEmployee(deletingId);
      if (res.success) { flash('Employee deleted successfully.'); fetchEmployees(); }
    } catch (err) { setError(err.message || 'Failed to delete employee.'); }
    finally { setDeleting(false); setShowDeleteModal(false); setDeletingId(null); }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-extrabold text-slate-900 mb-1">Employee Directory</h3>
          <p className="text-muted fs-7 mb-0">Manage workforce accounts, roles, departments, and project assignments</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 shadow-sm px-3 py-2 fw-semibold"
          onClick={() => { setSelectedEmployee(null); setShowEmployeeModal(true); }}
        >
          <UserPlus size={18} /> Add New Employee
        </Button>
      </div>

      {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="border-0 shadow-sm mb-4 rounded-3">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-2">
              <Col md={5}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0 text-muted"><Search size={16} /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                  <Button type="submit" variant="secondary" size="sm">Search</Button>
                </InputGroup>
              </Col>
              <Col md={3} sm={6}>
                <Form.Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-light border">
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Management">Management</option>
                  <option value="General">General</option>
                </Form.Select>
              </Col>
              <Col md={3} sm={6}>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-light border">
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div className="custom-table-card">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Table responsive className="custom-table hover align-middle mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department & Title</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Current Assignment</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">No employees matching the current filters.</td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const activeAssignment = assignmentStatus[emp._id];
                  return (
                    <tr key={emp._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle">{emp.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="fw-bold text-dark fs-7">{emp.name}</div>
                            <div className="text-muted fs-8 d-flex align-items-center gap-1">
                              <Mail size={12} /> {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark fs-8">{emp.designation || 'Team Member'}</div>
                        <div className="text-muted fs-9 d-flex align-items-center gap-1 mt-1">
                          <Building size={12} /> {emp.department || 'General'}
                        </div>
                      </td>
                      <td className="fs-8 text-muted">
                        {emp.phone ? (
                          <span className="d-flex align-items-center gap-1"><Phone size={12} /> {emp.phone}</span>
                        ) : <span className="text-muted fs-9">N/A</span>}
                      </td>
                      <td>
                        <Badge bg={emp.role === 'admin' ? 'primary' : 'secondary'}
                          className={emp.role === 'admin' ? 'badge-soft-primary' : 'badge-soft-secondary'}>
                          {emp.role}
                        </Badge>
                      </td>
                      <td>
                        {activeAssignment ? (
                          <div>
                            <Badge className="badge-soft-primary d-block mb-1" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {activeAssignment.project?.title || 'Active project'}
                            </Badge>
                            <div className="text-muted fs-9">
                              {(() => {
                                const dateValue = activeAssignment.startDate || activeAssignment.createdAt;
                                const parsedDate = dateValue ? new Date(dateValue) : null;
                                return parsedDate && !Number.isNaN(parsedDate.getTime())
                                  ? `Since ${parsedDate.toLocaleDateString()}`
                                  : 'Since —';
                              })()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted fs-9 fst-italic">No active assignment</span>
                        )}
                      </td>
                      <td>
                        <Badge className={emp.status === 'active' ? 'badge-soft-success' : 'badge-soft-danger'}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-indigo"
                            size="sm"
                            className="px-2 py-1"
                            title="Assign to Project"
                            style={{ borderColor: '#6366f1', color: '#6366f1' }}
                            onClick={() => { setAssigningEmployee(emp); setShowAssignModal(true); }}
                          >
                            <ClipboardList size={14} />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="px-2 py-1"
                            title="Edit"
                            onClick={() => { setSelectedEmployee(emp); setShowEmployeeModal(true); }}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="px-2 py-1"
                            title="Delete"
                            onClick={() => { setDeletingId(emp._id); setShowDeleteModal(true); }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        )}
      </div>

      {showEmployeeModal && (
        <EmployeeModal
          show={showEmployeeModal}
          onHide={() => setShowEmployeeModal(false)}
          employee={selectedEmployee}
          onSuccess={fetchEmployees}
        />
      )}

      {showAssignModal && (
        <AssignmentModal
          show={showAssignModal}
          onHide={() => setShowAssignModal(false)}
          preselectedEmployee={assigningEmployee}
          onSuccess={() => { fetchEmployees(); flash('Assignment created successfully!'); }}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          title="Delete Employee Account"
          message="Are you sure you want to permanently delete this employee account?"
          onConfirm={handleConfirmDelete}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
