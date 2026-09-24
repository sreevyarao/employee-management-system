import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Badge, Spinner, Button, ProgressBar, Alert, Accordion } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Building, Briefcase, Calendar,
  Key, CheckCircle2, CheckCheck, Circle, AlertCircle
} from 'lucide-react';
import * as assignmentApi from '../../api/assignmentApi';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const statusColor = (s) => {
  if (s === 'completed') return 'badge-soft-success';
  if (s === 'in-progress') return 'badge-soft-primary';
  return 'badge-soft-secondary';
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingTask, setCompletingTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchMyAssignment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assignmentApi.getMyAssignment();
      setAssignment(res.success ? res.data : null);
    } catch (err) {
      setError(err.message || 'Failed to load your assignment');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyAssignment(); }, [fetchMyAssignment]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCompleteTask = async (projectId, moduleId, taskId) => {
    setCompletingTask(taskId);
    setError('');
    try {
      const res = await assignmentApi.completeTask(projectId, moduleId, taskId);
      if (res.success) {
        // Update local state from response (computed progress)
        setAssignment((prev) => ({
          ...prev,
          project: res.data
        }));
        flash('Task marked as completed! 🎉');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete task');
    } finally {
      setCompletingTask(null);
    }
  };

  const project = assignment?.project;

  // My modules: only the modules assigned to me
  const myModules = (project?.modules || []).filter(
    (m) =>
      m.assignedEmployee &&
      (m.assignedEmployee._id?.toString() === user?._id?.toString() ||
        m.assignedEmployee?.toString() === user?._id?.toString())
  );

  // Compute overall progress across my modules
  const computeMyProgress = () => {
    if (!myModules.length) return { total: 0, done: 0, pct: 0 };
    const total = myModules.reduce((acc, m) => acc + (m.tasks?.length || 0), 0);
    const done = myModules.reduce(
      (acc, m) => acc + (m.tasks || []).filter((t) => t.status === 'completed').length,
      0
    );
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const myProgress = computeMyProgress();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-slate-900 mb-1">My Dashboard</h3>
          <p className="text-muted fs-7 mb-0">
            Welcome back, <strong>{user?.name}</strong>! Here is your active project and tasks.
          </p>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          className="d-flex align-items-center gap-1 rounded-pill px-3 shadow-sm"
          onClick={() => setShowPasswordModal(true)}
        >
          <Key size={14} /> Change Password
        </Button>
      </div>

      {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="g-4">
        {/* Profile Card */}
        <Col lg={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-4 text-center">
              <div
                className="avatar-circle mx-auto mb-3 shadow"
                style={{ width: '72px', height: '72px', fontSize: '1.75rem' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold text-slate-900 mb-0">{user?.name}</h5>
              <p className="text-primary fw-semibold fs-7 mb-2">{user?.designation || 'Team Member'}</p>
              <Badge className="badge-soft-success px-3 py-1 mb-4">Active Employee</Badge>

              <div className="text-start border-top pt-3 d-flex flex-column gap-2 fs-8">
                <div className="d-flex align-items-center gap-2 text-slate-700">
                  <Mail size={15} className="text-muted" /> {user?.email}
                </div>
                <div className="d-flex align-items-center gap-2 text-slate-700">
                  <Building size={15} className="text-muted" />
                  <span>Dept: <strong>{user?.department || 'General'}</strong></span>
                </div>
                <div className="d-flex align-items-center gap-2 text-slate-700">
                  <Phone size={15} className="text-muted" />
                  <span>{user?.phone || 'N/A'}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Main content */}
        <Col lg={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading your assignment...</p>
            </div>
          ) : !assignment || !project ? (
            <Card className="border-0 shadow-sm rounded-3 text-center py-5">
              <Card.Body>
                <AlertCircle size={48} className="text-muted mb-3" />
                <h5 className="fw-bold text-slate-700">No Active Assignment</h5>
                <p className="text-muted fs-7">
                  You currently have no active project assignment. Contact your administrator to be assigned to a project.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <>
              {/* Project overview card */}
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                    <div>
                      <div className="text-muted fs-8 fw-bold text-uppercase mb-1">
                        <Briefcase size={14} className="me-1" />
                        Active Project Assignment
                      </div>
                      <h4 className="fw-bold text-slate-900 mb-1">{project.title}</h4>
                      <p className="text-muted fs-8 mb-0">{project.description || 'No description'}</p>
                    </div>
                    <div className="d-flex flex-column gap-1 align-items-end">
                      <Badge className={statusColor(project.status)}>{project.status}</Badge>
                      <Badge className={statusColor(project.priority)}>{project.priority}</Badge>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-4 fs-8 text-muted mb-3 p-2 bg-light rounded-2">
                    <div><Calendar size={13} className="me-1 text-primary" />
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} –
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>Role: <strong>{assignment.role || 'Team Member'}</strong></div>
                    <div>Assigned since: <strong>{new Date(assignment.startDate || assignment.createdAt).toLocaleDateString()}</strong></div>
                  </div>

                  {/* My overall progress */}
                  {myModules.length > 0 && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fs-8 fw-semibold text-slate-700">My Overall Progress</span>
                        <span className="fs-8 fw-bold text-primary">{myProgress.done}/{myProgress.total} tasks · {myProgress.pct}%</span>
                      </div>
                      <ProgressBar
                        now={myProgress.pct}
                        variant={myProgress.pct === 100 ? 'success' : 'primary'}
                        style={{ height: '8px' }}
                        className="rounded-pill"
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Modules and Tasks */}
              {myModules.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-3 text-center py-4">
                  <Card.Body>
                    <p className="text-muted mb-0">
                      No modules have been assigned to you in this project yet.
                      Ask your admin to assign you to a module.
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <div>
                  <h6 className="fw-bold text-slate-700 mb-3">
                    My Modules & Tasks ({myModules.length} module{myModules.length !== 1 ? 's' : ''})
                  </h6>
                  <Accordion defaultActiveKey="0">
                    {myModules.map((mod, idx) => {
                      const modTotal = mod.tasks?.length || 0;
                      const modDone = (mod.tasks || []).filter((t) => t.status === 'completed').length;
                      const modPct = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0;

                      return (
                        <Accordion.Item
                          key={mod._id}
                          eventKey={String(idx)}
                          className="border-0 shadow-sm rounded-3 mb-3 overflow-hidden"
                        >
                          <Accordion.Header>
                            <div className="d-flex align-items-center gap-3 w-100 pe-3">
                              <div className="flex-grow-1">
                                <div className="fw-bold text-slate-900">{mod.title}</div>
                                {mod.description && (
                                  <div className="fs-9 text-muted">{mod.description}</div>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                <span className="fs-8 fw-semibold text-muted">
                                  {modDone}/{modTotal} tasks
                                </span>
                                <Badge className={modPct === 100 ? 'badge-soft-success' : 'badge-soft-primary'}>
                                  {modPct}%
                                </Badge>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="p-0">
                            {/* Module progress bar */}
                            <div className="px-3 py-2 bg-light border-bottom">
                              <ProgressBar
                                now={modPct}
                                variant={modPct === 100 ? 'success' : 'primary'}
                                style={{ height: '5px' }}
                                className="rounded-pill"
                              />
                            </div>

                            {(mod.tasks || []).length === 0 ? (
                              <div className="p-4 text-center text-muted fs-8">
                                No tasks in this module yet.
                              </div>
                            ) : (
                              <div className="p-2">
                                {mod.tasks.map((task) => {
                                  const isDone = task.status === 'completed';
                                  const isWorking = completingTask === task._id;

                                  return (
                                    <div
                                      key={task._id}
                                      className={`d-flex align-items-center justify-content-between p-3 rounded-2 mb-1 transition ${
                                        isDone ? 'bg-success bg-opacity-10' : 'bg-white border'
                                      }`}
                                    >
                                      <div className="d-flex align-items-center gap-3">
                                        {isDone ? (
                                          <CheckCheck size={20} className="text-success flex-shrink-0" />
                                        ) : (
                                          <Circle size={20} className="text-muted flex-shrink-0" />
                                        )}
                                        <div>
                                          <div className={`fw-semibold fs-8 ${isDone ? 'text-success text-decoration-line-through' : 'text-dark'}`}>
                                            {task.title}
                                          </div>
                                          {task.description && (
                                            <div className="fs-9 text-muted">{task.description}</div>
                                          )}
                                          {isDone && task.completedAt && (
                                            <div className="fs-9 text-success">
                                              Completed {new Date(task.completedAt).toLocaleDateString()}
                                              {task.completedBy?.name && ` by ${task.completedBy.name}`}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {!isDone && (
                                        <Button
                                          size="sm"
                                          variant="outline-success"
                                          className="d-flex align-items-center gap-1 px-3 fw-semibold"
                                          disabled={isWorking}
                                          onClick={() => handleCompleteTask(project._id, mod._id, task._id)}
                                        >
                                          {isWorking ? (
                                            <Spinner animation="border" size="sm" />
                                          ) : (
                                            <>
                                              <CheckCircle2 size={14} />
                                              Mark Done
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {showPasswordModal && (
        <ChangePasswordModal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default EmployeeDashboard;
