import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import FormField from '../components/FormField';
import { loginRules, firstError } from '../validation/authRules';

const EMPTY = { identifier: '', password: '' };
const ALL_TOUCHED = { identifier: true, password: true };

//=== LOGIN PAGE ===
// Handles user login using AuthContext
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // No live checks needed, both fields only ever have to not be empty
  const errorFor = field =>
    touched[field] ? loginRules[field](values[field]) : '';

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = e =>
    setTouched(prev => ({ ...prev, [e.target.name]: true }));

  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');
    setTouched(ALL_TOUCHED);

    if (firstError(loginRules, values)) return;

    setSubmitting(true);
    const result = await login(values);
    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }
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
          Sign in to pick up where you left off
        </p>

        {serverError && (
          <div className="alert alert-danger" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Username or email"
            name="identifier"
            value={values.identifier}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorFor('identifier')}
            placeholder="jordan_blake or you@example.com"
            autoComplete="username"
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorFor('password')}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <button className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
