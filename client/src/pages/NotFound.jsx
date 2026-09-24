import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 text-center">
      <div>
        <FileQuestion size={64} className="text-warning mb-3" />
        <h1 className="fw-extrabold text-slate-900">404 - Page Not Found</h1>
        <p className="text-muted fs-6 mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;
