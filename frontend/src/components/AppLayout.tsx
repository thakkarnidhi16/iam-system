import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// Styles for sidebar links; the active page gets highlighted
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

function AppLayout({ children }: { children: ReactNode }) {
  const { user, hasPermission, logout } = useAuth();

  // Logged-out pages (login, forgot password) get no sidebar
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-slate-900 p-4">
        <div className="mb-8 flex items-center gap-2 px-3 text-white">
          <KeyRound className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-semibold">IAM System</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>

          {hasPermission('view_users') && (
            <NavLink to="/users" className={linkClass}>
              <Users className="h-5 w-5" />
              Users
            </NavLink>
          )}

          {hasPermission('view_roles') && (
            <NavLink to="/roles" className={linkClass}>
              <ShieldCheck className="h-5 w-5" />
              Roles
            </NavLink>
          )}
        </nav>

        {/* Current user + logout */}
        <div className="border-t border-slate-800 pt-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500 font-semibold text-white">
              {user.first_name[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.first_name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

export default AppLayout;
