import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import FormField from '../components/FormField';
import {
  registerRules,
  registerLiveRules,
  firstError,
} from '../validation/authRules';

const EMPTY = { name: '', email: '', username: '', password: '' };
const ALL_TOUCHED = { name: true, email: true, username: true, password: true };

// Long enough to read the confirmation, short enough not to feel stuck
const REDIRECT_DELAY_MS = 1400;

//=== REGISTER PAGE ===
// Handles user registration using AuthContext
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Before you leave a field, only flag what more typing cannot fix, like a
  // stray character. After that, everything, updating live as you correct it
  const errorFor = field =>
    touched[field]
      ? registerRules[field](values[field])
      : (registerLiveRules[field]?.(values[field]) ?? '');

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

    if (firstError(registerRules, values)) return;

    setSubmitting(true);
    const result = await register(values);
    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }
    setRegistered(true);
  };

  // Pause on the confirmation rather than throwing them straight at the dashboard
  useEffect(() => {
    if (!registered) return;
    const timer = setTimeout(() => navigate('/'), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [registered, navigate]);

  if (registered) {
    return (
      <div className="container d-flex justify-content-center align-items-center auth-wrapper">
        <div className="card p-4 w-100 auth-card text-center" role="status">
          <i
            className="bi bi-check-circle-fill text-success fs-1 mb-2"
            aria-hidden="true"
          />
          <h3 className="mb-1">You are all set</h3>
          <p className="text-muted mb-0">Taking you to your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center auth-wrapper">
      <div className="card p-4 w-100 auth-card">
        <h3 className="mb-1 text-center">Create your account</h3>
        <p
          className="text-muted text-center mb-4"
          style={{ fontSize: '0.9rem' }}
        >
          It only takes a minute
        </p>

        {serverError && (
          <div className="alert alert-danger" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorFor('name')}
            hint="Displayed in the app. Spaces and capitals are fine."
            placeholder="e.g. Jordan Blake"
            autoComplete="name"
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorFor('email')}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <FormField
            label="Username"
            name="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorFor('username')}
            hint="What you sign in with. 3 to 30 characters, no spaces."
            placeholder="e.g. jordan_blake"
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
            hint="At least 8 characters."
            placeholder="Choose a password"
            autoComplete="new-password"
          />

          <button className="btn btn-success w-100" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
