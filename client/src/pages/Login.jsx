import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        const role = res.data?.user?.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="login-header-icon">
            <ShieldCheck size={30} />
          </div>
          <h3 className="fw-extrabold text-slate-900 mb-1">EMS WorkSpace</h3>
          <p className="text-muted fs-7">Enterprise Management & Operations Portal</p>
        </div>

        {error && <Alert variant="danger" className="py-2 fs-7 mb-3">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label className="fw-semibold fs-7 text-slate-700">Work Email</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <Mail size={16} />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-start-0 ps-0"
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label className="fw-semibold fs-7 text-slate-700">Password</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <Lock size={16} />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-start-0 border-end-0 ps-0"
                required
              />
              <InputGroup.Text
                className="bg-light border-start-0 cursor-pointer text-muted"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2.5 fw-bold shadow-sm mb-4"
            disabled={loading}
            style={{ borderRadius: '10px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </Button>
        </Form>

        {/* Demo Credentials Box */}
        <div className="p-3 bg-light rounded-3 border">
          <div className="fw-bold fs-8 text-uppercase text-slate-500 mb-2">
            Demo Test Accounts:
          </div>
          <div className="d-flex flex-column gap-1.5 fs-8">
            <div className="d-flex justify-content-between align-items-center">
              <span><strong>Admin:</strong> admin@ems.com</span>
              <Button
                variant="outline-primary"
                size="sm"
                className="py-0 px-2 fs-9"
                onClick={() => handleQuickLogin('admin@ems.com', 'AdminPass123!')}
              >
                Use Admin
              </Button>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span><strong>Employee:</strong> john@ems.com</span>
              <Button
                variant="outline-secondary"
                size="sm"
                className="py-0 px-2 fs-9"
                onClick={() => handleQuickLogin('john@ems.com', 'UserPass123!')}
              >
                Use Employee
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
