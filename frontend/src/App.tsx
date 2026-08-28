import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import ProtectedRoute from './ProtectedRoute';

import { useAuth } from './auth/AuthContext';

function App() {

  const {
    user,
    hasPermission,
    logout
  } = useAuth();

  return (

    <BrowserRouter>

      {user && (

        <nav>

          <Link to="/dashboard">
            Dashboard
          </Link>

          {' | '}

          {hasPermission('view_users') && (
            <Link to="/users">
              Users
            </Link>
          )}

          {' | '}

          {hasPermission('view_roles') && (
            <Link to="/roles">
              Roles
            </Link>
          )}

          {' | '}

          <button onClick={logout}>
            Logout
          </button>

        </nav>

      )}

      {user && <hr />}

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <Roles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
      path="/reset-password"
      element={<ResetPassword />}
      />

      </Routes>

    </BrowserRouter>
  );
}

export default App;