import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 text-center">
      <div>
        <ShieldAlert size={64} className="text-danger mb-3" />
        <h1 className="fw-extrabold text-slate-900">403 - Access Denied</h1>
        <p className="text-muted fs-6 mb-4">
          You do not have administrative privileges to view this page.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    </Container>
  );
};

export default Unauthorized;
