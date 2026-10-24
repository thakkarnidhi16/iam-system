import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { API_URL } from '../config/api';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
}

// Full class names must be written out, so Tailwind can find them
const colorStyles = {
  indigo: 'bg-indigo-100 text-indigo-600',
  amber: 'bg-amber-100 text-amber-600',
};

// A reusable card: one number with a label and an icon
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: keyof typeof colorStyles;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${colorStyles[color]}`}>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

// "Good morning" / "Good afternoon" / "Good evening"
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Dashboard() {
  const { user, hasPermission } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const canViewUsers = hasPermission('view_users');
  const canViewRoles = hasPermission('view_roles');

  // Load users and roles, but only if this user is allowed to see them
  useEffect(() => {
    const loadData = async () => {
      try {
        if (canViewUsers) {
          const response = await fetch(`${API_URL}/users`, { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setUsers(data.users || []);
          }
        }

        if (canViewRoles) {
          const response = await fetch(`${API_URL}/roles`, { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setRoles(data.roles || []);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [canViewUsers, canViewRoles]);

  // ProtectedRoute already makes sure we're logged in
  if (!user) {
    return null;
  }

  // The 5 newest users
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Greeting */}
      <h1 className="text-3xl font-bold text-slate-900">
        {getGreeting()}, {user.first_name} 👋
      </h1>
      <p className="mt-1 text-slate-500">Here's what's happening in your IAM system today.</p>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {canViewUsers && (
          <StatCard label="Total users" value={users.length} icon={<Users className="h-6 w-6" />} color="indigo" />
        )}
        {canViewRoles && (
          <StatCard label="Roles" value={roles.length} icon={<ShieldCheck className="h-6 w-6" />} color="amber" />
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent users */}
        {canViewUsers && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent users</h2>
              <Link to="/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No users yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <li key={u.id}>
                    <Link
                      to={`/users/${u.id}`}
                      className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-slate-50"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {u.first_name[0]}
                        {u.last_name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="truncate text-sm text-slate-500">{u.email}</p>
                      </div>
                      <span className="hidden text-xs text-slate-400 sm:block">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Your profile */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
              {user.first_name[0]}
              {user.last_name[0]}
            </div>
            <p className="mt-3 font-semibold text-slate-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="mt-1 text-xs text-slate-400">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
