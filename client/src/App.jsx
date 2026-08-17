import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import EditTask from './pages/EditTask';
import Bin from './pages/Bin';

// Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import WakeBanner from './components/WakeBanner';

// Main app structure + routing
function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        <BrowserRouter>
          {/* Always visible header */}
          <Header />

          {/* Only appears while the sleeping API is waking up */}
          <WakeBanner />

          {/* No container here on purpose. Each page owns its own layout, the
              auth pages need to fill the viewport rather than sit in a box */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/*Protected Routes*/}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddTask />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditTask />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bin"
              element={
                <ProtectedRoute>
                  <Bin />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </TasksProvider>
    </AuthProvider>
  );
}

export default App;
