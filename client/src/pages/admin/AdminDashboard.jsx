import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, CheckCircle2, Clock, Plus, ArrowRight, Layers } from 'lucide-react';
import * as projectApi from '../../api/projectApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    assignedEmployees: 0,
    activeAssignments: 0
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await projectApi.getDashboardSummary();
        const summary = res?.data || {};
        const employeeStatus = summary.employeeStatusCounts || {};
        const projectStatus = summary.projectStatusCounts || {};
        const assignmentStatus = summary.assignmentStatusCounts || {};

        setStats({
          totalEmployees: summary.totalEmployees || 0,
          activeEmployees: employeeStatus.active || 0,
          totalProjects: summary.totalProjects || 0,
          activeProjects: (projectStatus['in-progress'] || 0) + (projectStatus.planning || 0),
          completedProjects: projectStatus.completed || 0,
          assignedEmployees: summary.assignedEmployees || 0,
          activeAssignments: assignmentStatus.active || 0
        });

        setRecentProjects(summary.projects || []);
        setRecentEmployees(summary.recentEmployees || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-extrabold text-slate-900 mb-1">Executive Dashboard</h3>
          <p className="text-muted fs-7 mb-0">Overview of workforce, project delivery, and assignment health</p>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => navigate('/admin/employees')}
          >
            <Plus size={16} /> Manage Employees
          </Button>
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => navigate('/admin/projects')}
          >
            <Plus size={16} /> Manage Projects
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="icon-box icon-box-primary">
              <Users size={24} />
            </div>
            <div className="text-muted fs-8 fw-semibold text-uppercase">Total Employees</div>
            <h2 className="fw-extrabold text-slate-900 mb-0 mt-1">{stats.totalEmployees}</h2>
            <small className="text-success fw-medium fs-9 mt-1 d-block">
              {stats.activeEmployees} Active Members
            </small>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="icon-box icon-box-info">
              <Briefcase size={24} />
            </div>
            <div className="text-muted fs-8 fw-semibold text-uppercase">Total Projects</div>
            <h2 className="fw-extrabold text-slate-900 mb-0 mt-1">{stats.totalProjects}</h2>
            <small className="text-info fw-medium fs-9 mt-1 d-block">
              {stats.activeProjects} Active / In Progress
            </small>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="icon-box icon-box-success">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-muted fs-8 fw-semibold text-uppercase">Completed Projects</div>
            <h2 className="fw-extrabold text-slate-900 mb-0 mt-1">{stats.completedProjects}</h2>
            <small className="text-muted fw-medium fs-9 mt-1 d-block">
              Delivered Successfully
            </small>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="icon-box icon-box-warning">
              <Layers size={24} />
            </div>
            <div className="text-muted fs-8 fw-semibold text-uppercase">Assigned Members</div>
            <h2 className="fw-extrabold text-slate-900 mb-0 mt-1">{stats.assignedEmployees}</h2>
            <small className="text-muted fw-medium fs-9 mt-1 d-block">
              {stats.activeAssignments} Active Assignments
            </small>
          </div>
        </Col>
      </Row>

      <div className="custom-table-card mb-4">
        <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold text-slate-900 mb-0">Project Progress Overview</h6>
          <span className="text-muted fs-8">Average progress across all projects</span>
        </div>
        <Table responsive className="custom-table hover align-middle mb-0">
          <thead>
            <tr>
              <th>Project</th>
              <th>Overall Progress</th>
              <th>Module Progress</th>
            </tr>
          </thead>
          <tbody>
            {recentProjects.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">No project progress data available.</td>
              </tr>
            ) : (
              recentProjects.map((proj) => (
                <tr key={proj._id}>
                  <td>
                    <div className="fw-semibold text-dark">{proj.title}</div>
                    <small className="text-muted">{proj.status}</small>
                  </td>
                  <td style={{ minWidth: '180px' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="flex-grow-1">
                        <ProgressBar now={proj.progress || 0} variant={proj.progress >= 80 ? 'success' : 'primary'} />
                      </div>
                      <span className="fs-8 fw-semibold">{proj.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {(proj.moduleProgress || []).slice(0, 4).map((mod) => (
                        <Badge key={mod._id} className="badge-soft-secondary">
                          {mod.title}: {mod.progress}%
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <div className="custom-table-card">
            <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-slate-900 mb-0">Recent Projects</h6>
              <Button
                variant="link"
                className="text-decoration-none p-0 fs-8 fw-semibold d-flex align-items-center gap-1"
                onClick={() => navigate('/admin/projects')}
              >
                View All <ArrowRight size={14} />
              </Button>
            </div>

            <Table responsive className="custom-table hover align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">No projects found.</td>
                  </tr>
                ) : (
                  recentProjects.map((proj) => (
                    <tr key={proj._id}>
                      <td className="fw-semibold text-dark">{proj.title}</td>
                      <td className="text-muted fs-8">{proj.clientName || 'N/A'}</td>
                      <td>
                        <Badge
                          className={
                            proj.status === 'completed'
                              ? 'badge-soft-success'
                              : proj.status === 'in-progress'
                              ? 'badge-soft-primary'
                              : proj.status === 'on-hold'
                              ? 'badge-soft-danger'
                              : 'badge-soft-warning'
                          }
                        >
                          {proj.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          className={
                            proj.priority === 'urgent'
                              ? 'badge-soft-danger'
                              : proj.priority === 'high'
                              ? 'badge-soft-warning'
                              : 'badge-soft-secondary'
                          }
                        >
                          {proj.priority}
                        </Badge>
                      </td>
                      <td className="fs-8 text-muted">
                        {proj.assignedEmployees?.length || 0} members
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Col>

        <Col lg={5}>
          <div className="custom-table-card">
            <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-slate-900 mb-0">Recent Employees</h6>
              <Button
                variant="link"
                className="text-decoration-none p-0 fs-8 fw-semibold d-flex align-items-center gap-1"
                onClick={() => navigate('/admin/employees')}
              >
                View All <ArrowRight size={14} />
              </Button>
            </div>

            <Table responsive className="custom-table hover align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {recentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">No employees found.</td>
                  </tr>
                ) : (
                  recentEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                            {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark fs-8">{emp.name}</div>
                            <div className="text-muted fs-9">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fs-8 text-muted">{emp.department}</td>
                      <td>
                        <Badge bg={emp.role === 'admin' ? 'primary' : 'light'} className={emp.role === 'admin' ? '' : 'text-dark border'}>
                          {emp.role}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
