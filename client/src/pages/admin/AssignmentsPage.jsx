import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Table, Button, Form, Badge,
  InputGroup, Spinner, Alert, Tabs, Tab
} from 'react-bootstrap';
import { Search, Plus, CheckCircle2, XCircle, Trash2, ClipboardList, UserCheck } from 'lucide-react';
import * as assignmentApi from '../../api/assignmentApi';
import AssignmentModal from '../../components/AssignmentModal';
import ConfirmModal from '../../components/ConfirmModal';

const statusBadge = (s) => {
  if (s === 'active') return <Badge className="badge-soft-primary">Active</Badge>;
  if (s === 'completed') return <Badge className="badge-soft-success">Completed</Badge>;
  return <Badge className="badge-soft-secondary">Released</Badge>;
};

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [completing, setCompleting] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assignmentApi.getAssignments(
        activeTab !== 'all' ? { status: activeTab } : {}
      );
      if (res.success) setAssignments(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleComplete = async (id, status) => {
    setCompleting(id);
    try {
      await assignmentApi.completeAssignment(id, status);
      flash(`Assignment marked as ${status}`);
      fetchAssignments();
    } catch (err) {
      setError(err.message || 'Failed to update assignment');
    } finally {
      setCompleting(null);
    }
  };

  const handleDelete = async () => {
    try {
      await assignmentApi.deleteAssignment(deletingId);
      flash('Assignment deleted successfully');
      fetchAssignments();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-extrabold text-slate-900 mb-1">Project Assignments</h3>
          <p className="text-muted fs-7 mb-0">
            Assign employees to active projects. One active assignment per employee is enforced.
          </p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 shadow-sm px-3 py-2 fw-semibold"
          onClick={() => setShowAssignModal(true)}
        >
          <Plus size={18} /> New Assignment
        </Button>
      </div>

      {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Info card */}
      <Card className="border-0 shadow-sm mb-4 rounded-3 bg-primary bg-opacity-10 border-primary">
        <Card.Body className="p-3 d-flex align-items-center gap-3">
          <UserCheck size={28} className="text-primary flex-shrink-0" />
          <div>
            <div className="fw-bold text-primary">One Active Assignment Per Employee</div>
            <div className="fs-8 text-slate-600">
              An employee can only have one <strong>active</strong> project assignment at a time.
              Attempting a second will return <strong>409 Conflict</strong>.
              Mark the current assignment as "Completed" or "Released" before reassigning.
            </div>
          </div>
        </Card.Body>
      </Card>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="active" title="Active" />
        <Tab eventKey="completed" title="Completed" />
        <Tab eventKey="released" title="Released" />
        <Tab eventKey="all" title="All" />
      </Tabs>

      <div className="custom-table-card">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Table responsive className="custom-table hover align-middle mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Role</th>
                <th>Started</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No {activeTab !== 'all' ? activeTab : ''} assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {a.employee?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold fs-8">{a.employee?.name}</div>
                          <div className="text-muted fs-9">{a.employee?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold fs-8">{a.project?.title}</div>
                      <div className="text-muted fs-9">{a.project?.status}</div>
                    </td>
                    <td className="fs-8 text-muted">{a.role}</td>
                    <td className="fs-8 text-muted">
                      {a.startDate ? new Date(a.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td>{statusBadge(a.status)}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {a.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="px-2 py-1 fs-9"
                              title="Mark Completed"
                              disabled={completing === a._id}
                              onClick={() => handleComplete(a._id, 'completed')}
                            >
                              <CheckCircle2 size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              className="px-2 py-1 fs-9"
                              title="Release"
                              disabled={completing === a._id}
                              onClick={() => handleComplete(a._id, 'released')}
                            >
                              <XCircle size={14} />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="px-2 py-1"
                          onClick={() => { setDeletingId(a._id); setShowDeleteModal(true); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {showAssignModal && (
        <AssignmentModal
          show={showAssignModal}
          onHide={() => setShowAssignModal(false)}
          onSuccess={() => { fetchAssignments(); flash('Employee assigned successfully!'); }}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          title="Delete Assignment"
          message="Delete this assignment record? The employee will be freed for reassignment."
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
