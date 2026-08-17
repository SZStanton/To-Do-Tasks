import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fontsource-variable/plus-jakarta-sans';
import './index.css';
import './theme.css';
import './App.css';
import App from './App.jsx';
import { getTheme, applyTheme } from './themeMode.js';

// Before the first paint, or a dark machine gets a white flash
applyTheme(getTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
