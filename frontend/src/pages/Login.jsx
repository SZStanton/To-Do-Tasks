import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../context/useAuth';

//=== LOGIN PAGE ===
// Handles user login using AuthContext
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ identifier, password });
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    // Redirect to dashboard on success
    navigate('/');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center auth-wrapper">
      <div className="card p-4 w-100 auth-card">
        <h3 className="mb-1 text-center">Welcome back</h3>
        <p
          className="text-muted text-center mb-4"
          style={{ fontSize: '0.9rem' }}
        >
          Sign in to your to-do list
        </p>

        {/* Error message */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input
              className="form-control"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="Enter username or email"
              autoComplete="username"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
