import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { Plus, Trash2 } from 'lucide-react';
import * as assignmentApi from '../api/assignmentApi';
import * as employeeApi from '../api/employeeApi';

const ModuleTaskModal = ({ show, onHide, project, onSuccess }) => {
  const [activeModuleIdx, setActiveModuleIdx] = useState(null);
  const [modules, setModules] = useState([]);
  const [employees, setEmployees] = useState([]);

  // New module form
  const [newModule, setNewModule] = useState({ title: '', description: '', assignedEmployee: '' });
  // New task form
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (show && project) {
      setModules(project.modules || []);
      setActiveModuleIdx(null);
      setNewModule({ title: '', description: '', assignedEmployee: '' });
      setNewTask({ title: '', description: '' });
      setError('');
      setMsg('');

      employeeApi.getEmployees({ status: 'active' }).then((res) => {
        if (res.success) setEmployees(res.data || []);
      });
    }
  }, [show, project]);

  const flash = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(''), 3000);
  };

  // ── Module actions ──────────────────────────────────────────────────────────
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModule.title.trim()) { setError('Module title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await assignmentApi.addModule(project._id, newModule);
      if (res.success) {
        setModules(res.data.modules || []);
        setNewModule({ title: '', description: '', assignedEmployee: '' });
        flash('Module added!');
        onSuccess(res.data);
      }
    } catch (err) { setError(err.message || 'Failed to add module'); }
    finally { setSaving(false); }
  };

  const handleDeleteModule = async (moduleId) => {
    setSaving(true);
    try {
      const res = await assignmentApi.deleteModule(project._id, moduleId);
      if (res.success) {
        setModules((prev) => prev.filter((m) => m._id !== moduleId));
        setActiveModuleIdx(null);
        flash('Module deleted');
        onSuccess();
      }
    } catch (err) { setError(err.message || 'Failed to delete module'); }
    finally { setSaving(false); }
  };

  // ── Task actions ────────────────────────────────────────────────────────────
  const handleAddTask = async (e) => {
    e.preventDefault();
    const mod = modules[activeModuleIdx];
    if (!mod || !newTask.title.trim()) { setError('Task title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await assignmentApi.addTask(project._id, mod._id, newTask);
      if (res.success) {
        setModules(res.data.modules || []);
        setNewTask({ title: '', description: '' });
        flash('Task added!');
        onSuccess(res.data);
      }
    } catch (err) { setError(err.message || 'Failed to add task'); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async (moduleId, taskId) => {
    setSaving(true);
    try {
      const res = await assignmentApi.deleteTask(project._id, moduleId, taskId);
      if (res.success) {
        setModules((prev) =>
          prev.map((m) =>
            m._id === moduleId ? { ...m, tasks: m.tasks.filter((t) => t._id !== taskId) } : m
          )
        );
        flash('Task deleted');
        onSuccess();
      }
    } catch (err) { setError(err.message || 'Failed to delete task'); }
    finally { setSaving(false); }
  };

  const activeModule = activeModuleIdx !== null ? modules[activeModuleIdx] : null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-5">
          Manage Modules & Tasks — <span className="text-primary">{project?.title}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {error && <Alert variant="danger" className="m-3 mb-0" dismissible onClose={() => setError('')}>{error}</Alert>}
        {msg && <Alert variant="success" className="m-3 mb-0">{msg}</Alert>}

        <Row className="g-0" style={{ minHeight: '420px' }}>
          {/* Left panel: Module list */}
          <Col md={4} className="border-end p-3 bg-light">
            <h6 className="fw-bold text-slate-700 mb-3">Modules ({modules.length})</h6>

            <div className="d-flex flex-column gap-2 mb-3">
              {modules.map((mod, idx) => (
                <div
                  key={mod._id}
                  className={`p-2 border rounded-2 cursor-pointer d-flex justify-content-between align-items-start ${
                    activeModuleIdx === idx ? 'border-primary bg-white shadow-sm' : 'bg-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveModuleIdx(idx)}
                >
                  <div>
                    <div className="fw-semibold fs-8 text-dark">{mod.title}</div>
                    <div className="fs-9 text-muted">
                      {mod.tasks?.length || 0} tasks · {mod.assignedEmployee?.name || 'Unassigned'}
                    </div>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0"
                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod._id); }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {modules.length === 0 && (
                <p className="text-muted fs-8 text-center py-3">No modules yet. Add one below.</p>
              )}
            </div>

            {/* Add Module Form */}
            <div className="border rounded-2 p-2 bg-white">
              <div className="fw-semibold fs-8 text-slate-700 mb-2">Add Module</div>
              <Form onSubmit={handleAddModule}>
                <Form.Control
                  size="sm"
                  className="mb-1"
                  placeholder="Module title *"
                  value={newModule.title}
                  onChange={(e) => setNewModule((p) => ({ ...p, title: e.target.value }))}
                />
                <Form.Control
                  size="sm"
                  className="mb-1"
                  placeholder="Description"
                  value={newModule.description}
                  onChange={(e) => setNewModule((p) => ({ ...p, description: e.target.value }))}
                />
                <Form.Select
                  size="sm"
                  className="mb-2"
                  value={newModule.assignedEmployee}
                  onChange={(e) => setNewModule((p) => ({ ...p, assignedEmployee: e.target.value }))}
                >
                  <option value="">Assign employee (optional)</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </Form.Select>
                <Button type="submit" size="sm" variant="primary" className="w-100" disabled={saving}>
                  <Plus size={14} className="me-1" /> Add Module
                </Button>
              </Form>
            </div>
          </Col>

          {/* Right panel: Task list */}
          <Col md={8} className="p-3">
            {!activeModule ? (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                <div className="text-center">
                  <div style={{ fontSize: '2.5rem' }}>📦</div>
                  <p className="mt-2 fw-semibold">Select a module to manage its tasks</p>
                </div>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-bold text-slate-900 mb-0">{activeModule.title}</h6>
                    <small className="text-muted">
                      Assigned to: {activeModule.assignedEmployee?.name || 'No one'}
                    </small>
                  </div>
                  <span className={`badge ${activeModule.progress === 100 ? 'badge-soft-success' : 'badge-soft-primary'}`}>
                    {activeModule.progress || 0}% done
                  </span>
                </div>

                {/* Task list */}
                <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {(activeModule.tasks || []).map((task) => (
                    <div key={task._id} className="d-flex justify-content-between align-items-center p-2 border rounded-2 bg-light">
                      <div>
                        <div className="fw-semibold fs-8">{task.title}</div>
                        <div className="fs-9 text-muted">
                          Status: <span className={
                            task.status === 'completed' ? 'text-success' :
                            task.status === 'in-progress' ? 'text-primary' : 'text-muted'
                          }>{task.status}</span>
                          {task.completedBy && ` · Completed by ${task.completedBy.name}`}
                        </div>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => handleDeleteTask(activeModule._id, task._id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                  {(activeModule.tasks || []).length === 0 && (
                    <p className="text-muted fs-8 text-center py-2">No tasks yet.</p>
                  )}
                </div>

                {/* Add Task Form */}
                <div className="border rounded-2 p-3 bg-light">
                  <div className="fw-semibold fs-8 text-slate-700 mb-2">Add Task to this Module</div>
                  <Form onSubmit={handleAddTask}>
                    <Row className="g-2">
                      <Col md={6}>
                        <Form.Control
                          size="sm"
                          placeholder="Task title *"
                          value={newTask.title}
                          onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          size="sm"
                          placeholder="Description (optional)"
                          value={newTask.description}
                          onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                        />
                      </Col>
                      <Col md={12}>
                        <Button type="submit" size="sm" variant="success" disabled={saving}>
                          <Plus size={14} className="me-1" /> Add Task
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModuleTaskModal;
