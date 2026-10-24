import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X, ChevronRight, LoaderCircle, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { API_URL } from '../config/api';
import RoleBadge from '../components/RoleBadge';


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



// Shared input style, so all form fields look the same
const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';

function Users() {
  const { hasPermission } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<number, Role[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create user modal
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fetch the roles assigned to one user
  const getUserRoles = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/roles`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(`Failed to fetch roles for user ${userId}`);
        return;
      }

      const data = await response.json();

      setUserRoles((previousRoles) => ({
        ...previousRoles,
        [userId]: data.roles || [],
      }));
    } catch (error) {
      console.error(`Error fetching roles for user ${userId}:`, error);
    }
  };

  // Fetch all users and their assigned roles
  const getUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to retrieve users');
        return;
      }

      const fetchedUsers: User[] = data.users || [];
      setUsers(fetchedUsers);

      await Promise.all(fetchedUsers.map((user) => getUserRoles(user.id)));
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to the server');
    }
  };

  // Load users when the page opens
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await getUsers();
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Clear the form and close the modal
  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
  };

  // Create a user
  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to create user');
        return;
      }

      toast.success(`${firstName} ${lastName} was created`);
      closeCreateForm();

      // Refresh users and their roles
      await getUsers();
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to the server');
    } finally {
      setCreating(false);
    }
  };

  // Filter users by name, email or role name
  const searchText = search.toLowerCase();
  const filteredUsers = users.filter((user) => {
    const roles = userRoles[user.id] || [];
    return (
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText) ||
      roles.some((role) => role.name.toLowerCase().includes(searchText))
    );
  });

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-500">Manage who has access to your system</p>
        </div>

        {hasPermission('create_users') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus className="h-5 w-5" />
            Create user
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {/* Search */}
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {loading ? (
          // Skeleton: gray pulsing bars while loading
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex animate-pulse items-center gap-3 px-6 py-4">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-56 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100">
              <UsersIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-4 font-medium text-slate-900">
              {search ? 'No matching users' : 'No users yet'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {search ? 'Try a different search.' : 'Create your first user to get started.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Roles</th>
                <th className="hidden px-6 py-3 font-medium md:table-cell">Joined</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const roles = userRoles[user.id] || [];

                return (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/users/${user.id}`}
                            className="font-medium text-slate-900 hover:text-indigo-600"
                          >
                            {user.first_name} {user.last_name}
                          </Link>
                          <p className="truncate text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {roles.map((role) => (
                            <RoleBadge key={role.id} role={role} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No roles</span>
                      )}
                    </td>

                    <td className="hidden px-6 py-4 text-sm text-slate-500 md:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/users/${user.id}`}
                        aria-label={`View ${user.first_name}`}
                        className="inline-flex text-slate-400 hover:text-indigo-600"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user modal */}
      {showCreateForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={closeCreateForm}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Create user</h2>
              <button
                onClick={closeCreateForm}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-700">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="rounded-lg px-4 py-2.5 font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-70"
                >
                  {creating && <LoaderCircle className="h-5 w-5 animate-spin" />}
                  Create user
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
