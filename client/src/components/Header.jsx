import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import { getTheme, setTheme } from '../themeMode';

//=== APP HEADER ===
// Top navigation bar shown on all pages, uses Bootstrap
function Header() {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(getTheme);

  // Managed here rather than by bootstrap's data api. Its collapse plugin calls
  // preventDefault on anchor triggers, which stopped the links navigating
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Handles logout and redirects user to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setMode(next);
  };

  // Pill highlights whichever page you are on
  const navClass = ({ isActive }) =>
    `nav-link app-nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg app-navbar">
      <div className="container-fluid px-3">
        {/* Brand/App title */}
        <Link
          className="navbar-brand app-brand d-flex align-items-center gap-2"
          to="/"
        >
          <i
            className="bi bi-check2-square app-brand-icon"
            aria-hidden="true"
          />
          To-Do List
        </Link>

        {/* Kept out of the collapse so they stay reachable on a phone */}
        <div className="d-flex align-items-center gap-2 order-lg-3">
          {isLoggedIn ? (
            <>
              <span className="app-user-chip d-none d-md-inline-flex">
                <i className="bi bi-person-circle" aria-hidden="true" />
                {user?.name}
              </span>
              <button
                className="btn app-logout-btn d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <Link className="btn btn-primary app-header-cta" to="/register">
              Register
            </Link>
          )}

          {/* Sits furthest right, the icon shows the theme you are in */}
          <button
            type="button"
            className="btn app-icon-btn"
            onClick={toggleTheme}
            aria-label={
              mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            title={
              mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            <i
              className={
                mode === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun-fill'
              }
              aria-hidden="true"
            />
          </button>

          {/* Always rendered, the logged out menu needs it too */}
          <button
            className="navbar-toggler border-0 ms-1"
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            aria-expanded={menuOpen}
            aria-controls="navMenu"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* Collapsible navigation section */}
        <div
          className={`collapse navbar-collapse order-lg-2${menuOpen ? ' show' : ''}`}
          id="navMenu"
        >
          <ul className="navbar-nav app-nav me-auto ms-lg-4 gap-lg-2">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <NavLink className={navClass} to="/" end onClick={closeMenu}>
                    <i className="bi bi-list-task" aria-hidden="true" />
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navClass} to="/add" onClick={closeMenu}>
                    <i className="bi bi-plus-circle" aria-hidden="true" />
                    Add Task
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <NavLink className={navClass} to="/login" onClick={closeMenu}>
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                  Login
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
