import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form, Badge, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Search, Plus, Edit2, Trash2, Briefcase, Calendar, DollarSign, Users, Layers } from 'lucide-react';
import * as projectApi from '../../api/projectApi';
import ProjectModal from '../../components/ProjectModal';
import ModuleTaskModal from '../../components/ModuleTaskModal';
import ConfirmModal from '../../components/ConfirmModal';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleProject, setModuleProject] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getProjects({
        search: searchTerm,
        status: selectedStatus,
        priority: selectedPriority
      });
      if (res.success) setProjects(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [selectedStatus, selectedPriority]);

  const flash = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchProjects(); };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await projectApi.deleteProject(deletingId);
      flash('Project deleted successfully.');
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleModuleSuccess = (updatedProject) => {
    if (updatedProject) {
      setModuleProject(updatedProject);
      setProjects((prev) => prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)));
    } else {
      fetchProjects();
    }
  };

  const getStatusBadge = (s) => {
    if (s === 'completed') return <Badge className="badge-soft-success">Completed</Badge>;
    if (s === 'in-progress') return <Badge className="badge-soft-primary">In Progress</Badge>;
    if (s === 'on-hold') return <Badge className="badge-soft-danger">On Hold</Badge>;
    return <Badge className="badge-soft-warning">Planning</Badge>;
  };

  const getPriorityBadge = (p) => {
    if (p === 'urgent') return <Badge className="badge-soft-danger">Urgent</Badge>;
    if (p === 'high') return <Badge className="badge-soft-warning">High</Badge>;
    if (p === 'medium') return <Badge className="badge-soft-primary">Medium</Badge>;
    return <Badge className="badge-soft-secondary">Low</Badge>;
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-extrabold text-slate-900 mb-1">Project Portfolio</h3>
          <p className="text-muted fs-7 mb-0">Track project milestones, modules, tasks, and team allocations</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 shadow-sm px-3 py-2 fw-semibold"
          onClick={() => { setSelectedProject(null); setShowProjectModal(true); }}
        >
          <Plus size={18} /> Create New Project
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
                    placeholder="Search title, description, or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                  <Button type="submit" variant="secondary" size="sm">Search</Button>
                </InputGroup>
              </Col>
              <Col md={3} sm={6}>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-light border">
                  <option value="all">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Col>
              <Col md={3} sm={6}>
                <Form.Select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="bg-light border">
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <Briefcase size={40} className="text-muted mb-2" />
            <h5 className="fw-bold text-slate-700">No Projects Found</h5>
            <p className="text-muted fs-8">Try clearing search filters or create a new project.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {projects.map((proj) => (
            <Col lg={6} key={proj._id}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="text-muted fs-8 fw-bold text-uppercase d-block mb-1">
                          {proj.clientName || 'Internal Project'}
                        </span>
                        <h5 className="fw-bold text-slate-900 mb-0">{proj.title}</h5>
                      </div>
                      <div className="d-flex gap-1 flex-wrap justify-content-end">
                        {getStatusBadge(proj.status)}
                        {getPriorityBadge(proj.priority)}
                      </div>
                    </div>

                    <p className="text-muted fs-8 mb-2" style={{ minHeight: '38px' }}>
                      {proj.description || 'No description provided.'}
                    </p>

                    {/* Overall progress bar */}
                    {(proj.modules?.length || 0) > 0 && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fs-8 fw-semibold text-slate-600">Overall Progress</span>
                          <span className="fs-8 fw-bold text-primary">{proj.progress || 0}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${proj.progress || 0}%`, transition: 'width 0.5s ease' }}
                          />
                        </div>
                        <div className="fs-9 text-muted mt-1">
                          {proj.modules.length} module{proj.modules.length !== 1 ? 's' : ''}
                          {' · '}
                          {proj.modules.reduce((acc, m) => acc + (m.tasks?.length || 0), 0)} tasks total
                        </div>
                      </div>
                    )}

                    <div className="d-flex flex-wrap gap-3 fs-8 text-slate-600 mb-2 p-2 bg-light rounded-2">
                      <div className="d-flex align-items-center gap-1">
                        <Calendar size={14} className="text-primary" />
                        {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'N/A'}
                        {' – '}
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <DollarSign size={14} className="text-success" />
                        <span className="fw-semibold">${(proj.budget || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <hr className="my-3" style={{ borderColor: '#f1f5f9' }} />
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1">
                        <Users size={16} className="text-muted me-1" />
                        {proj.assignedEmployees?.slice(0, 3).map((emp) => (
                          <div
                            key={typeof emp === 'object' ? emp._id : emp}
                            className="avatar-circle"
                            style={{ width: '26px', height: '26px', fontSize: '0.65rem' }}
                            title={typeof emp === 'object' ? emp.name : 'Employee'}
                          >
                            {typeof emp === 'object' && emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                        ))}
                        {proj.assignedEmployees?.length === 0 && (
                          <span className="fs-9 text-muted ms-1">No team assigned</span>
                        )}
                      </div>

                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="px-2 py-1 d-flex align-items-center gap-1"
                          onClick={() => { setModuleProject(proj); setShowModuleModal(true); }}
                        >
                          <Layers size={14} /> Modules
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => { setSelectedProject(proj); setShowProjectModal(true); }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => { setDeletingId(proj._id); setShowDeleteModal(true); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {showProjectModal && (
        <ProjectModal
          show={showProjectModal}
          onHide={() => setShowProjectModal(false)}
          project={selectedProject}
          onSuccess={fetchProjects}
        />
      )}

      {showModuleModal && moduleProject && (
        <ModuleTaskModal
          show={showModuleModal}
          onHide={() => setShowModuleModal(false)}
          project={moduleProject}
          onSuccess={handleModuleSuccess}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          title="Delete Project"
          message="Delete this project? All modules and tasks will be removed."
          onConfirm={handleConfirmDelete}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
