import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Users from './pages/Users';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Roles from './pages/Roles';

function App() {
  return (
    <BrowserRouter>
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
          element={<Dashboard />}
        />

        <Route
          path="/users"
          element={<Users />}
        />

        <Route
          path="/roles"
          element={<Roles />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;