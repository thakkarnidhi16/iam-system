import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Hash, Calendar, Check, Plus, UserX } from 'lucide-react';
import { toast } from 'sonner';
import RoleBadge from '../components/RoleBadge';
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
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

function UserDetails() {
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Load this user's roles, then the permissions those roles give them
  const loadRolesAndPermissions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/${id}/roles`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      const userRoles: Role[] = data.roles || [];
      setRoles(userRoles);

      const permissionResults = await Promise.all(
        userRoles.map(async (role) => {
          const response = await fetch(`${API_URL}/roles/${role.id}/permissions`, {
            method: 'GET',
            credentials: 'include',
          });

          const data = await response.json();

          if (!response.ok) {
            console.error(data.message);
            return [];
          }

          return data.permissions;
        })
      );

      // Two roles can share a permission, so remove duplicates
      const allPermissions: Permission[] = permissionResults.flat();
      const uniquePermissions = Array.from(
        new Map(allPermissions.map((permission) => [permission.id, permission])).values()
      );

      setPermissions(uniquePermissions);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(data.message);
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const getAvailableRoles = async () => {
      try {
        const response = await fetch(`${API_URL}/roles`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(data.message);
          return;
        }

        setAvailableRoles(data.roles);
      } catch (error) {
        console.error(error);
      }
    };

    getUser();
    getAvailableRoles();
    loadRolesAndPermissions();
  }, [id, loadRolesAndPermissions]);

  const assignRole = async () => {
    if (!selectedRoleId || !id) {
      return;
    }

    const roleName = availableRoles.find((role) => role.id === Number(selectedRoleId))?.name;

    try {
      const response = await fetch(`${API_URL}/users/${id}/roles`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: Number(selectedRoleId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to assign role');
        return;
      }

      toast.success(`Assigned role "${roleName}"`);
      setSelectedRoleId('');
      await loadRolesAndPermissions();
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to the server');
    }
  };

  const removeRole = async (role: Role) => {
    if (!id) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${id}/roles/${role.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to remove role');
        return;
      }

      toast.success(`Removed role "${role.name}"`);
      await loadRolesAndPermissions();
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to the server');
    }
  };

  // Roles the user doesn't already have
  const unassignedRoles = availableRoles.filter(
    (role) => !roles.some((userRole) => userRole.id === role.id)
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-6 h-48 rounded-2xl bg-slate-200" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="h-40 rounded-2xl bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100">
          <UserX className="h-7 w-7 text-slate-400" />
        </div>
        <p className="mt-4 text-lg font-medium text-slate-900">User not found</p>
        <Link to="/users" className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      {/* Profile header */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="px-6 pb-6">
          <div className="-mt-10 grid h-20 w-20 place-items-center rounded-full bg-white p-1 shadow-md">
            <div className="grid h-full w-full place-items-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
              {user.first_name[0]}
              {user.last_name[0]}
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {user.first_name} {user.last_name}
          </h1>

          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Hash className="h-4 w-4" />
              ID {user.id}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined{' '}
              {new Date(user.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Roles */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Roles</h2>
          <p className="mt-1 text-sm text-slate-500">Roles decide what this user can do.</p>

          <div className="mt-4 flex min-h-8 flex-wrap gap-2">
            {roles.length === 0 ? (
              <p className="text-sm text-slate-400">No roles assigned.</p>
            ) : (
              roles.map((role) => (
                <RoleBadge key={role.id} role={role} onRemove={() => removeRole(role)} />
              ))
            )}
          </div>

          <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
            <select
              value={selectedRoleId}
              onChange={(event) => setSelectedRoleId(event.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">
                {unassignedRoles.length === 0 ? 'All roles assigned' : 'Select a role'}
              </option>
              {unassignedRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <button
              onClick={assignRole}
              disabled={!selectedRoleId}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Assign
            </button>
          </div>
        </div>

        {/* Permissions */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Permissions</h2>
          <p className="mt-1 text-sm text-slate-500">Everything this user can do, from all their roles.</p>

          {permissions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No permissions yet. Assign a role first.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {permissions.map((permission) => (
                <li key={permission.id} className="flex gap-3">
                  <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                    {permission.description && (
                      <p className="text-xs text-slate-500">{permission.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
