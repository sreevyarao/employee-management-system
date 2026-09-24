import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ show, onHide, title, message, onConfirm, loading }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-5 text-danger d-flex align-items-center gap-2">
          <AlertTriangle size={20} />
          {title || 'Confirm Action'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <p className="text-slate-700 mb-0">
          {message || 'Are you sure you want to perform this action? This action cannot be undone.'}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : 'Confirm Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
