import { useEffect, useState } from 'react';
import { ShieldCheck, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { API_URL } from '../config/api';

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

function Roles() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('assign_permissions');

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<number, Permission[]>>({});
  const [loading, setLoading] = useState(true);

  // Which checkbox is saving right now, e.g. "2-5" (role 2, permission 5)
  const [savingCell, setSavingCell] = useState<string | null>(null);

  // Get permissions for a role
  const getRolePermissions = async (roleId: number) => {
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setRolePermissions((previous) => ({
        ...previous,
        [roleId]: data.permissions || [],
      }));
    } catch (error) {
      console.error(error);
    }
  };

  // Get all roles, then the permissions for each
  const getRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to retrieve roles');
        return;
      }

      setRoles(data.roles);

      await Promise.all(data.roles.map((role: Role) => getRolePermissions(role.id)));
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to the server');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await getRoles();
      setLoading(false);
    };

    loadData();
  }, []);

  // Every permission used by at least one role (no duplicates), sorted by name
  const allPermissions = Array.from(
    new Map(
      Object.values(rolePermissions)
        .flat()
        .map((permission) => [permission.id, permission])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const roleHasPermission = (roleId: number, permissionId: number) =>
    (rolePermissions[roleId] || []).some((p) => p.id === permissionId);

  // Click a checkbox: add the permission if missing, remove it if present
  const togglePermission = async (role: Role, permission: Permission) => {
    const cellKey = `${role.id}-${permission.id}`;
    const hasIt = roleHasPermission(role.id, permission.id);

    setSavingCell(cellKey);

    try {
      const response = hasIt
        ? await fetch(`${API_URL}/roles/${role.id}/permissions/${permission.id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        : await fetch(`${API_URL}/roles/${role.id}/permissions`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissionId: permission.id }),
          });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to update permission');
        return;
      }

      // Update the screen without reloading everything
      setRolePermissions((previous) => ({
        ...previous,
        [role.id]: hasIt
          ? previous[role.id].filter((p) => p.id !== permission.id)
          : [...(previous[role.id] || []), permission],
      }));

      toast.success(
        hasIt
          ? `Removed "${permission.name}" from ${role.name}`
          : `Gave "${permission.name}" to ${role.name}`
      );
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to the server');
    } finally {
      setSavingCell(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="mt-8 h-72 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-900">Roles</h1>
      <p className="mt-1 text-slate-500">Manage what each role is allowed to do</p>

      {roles.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200">
          <ShieldCheck className="h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No roles found</p>
        </div>
      ) : (
        <>
          {/* Role summary cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const count = (rolePermissions[role.id] || []).length;

              return (
                <div
                  key={role.id}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold capitalize text-slate-900">{role.name}</h2>
                  </div>
                  <p className="mt-3 min-h-10 text-sm text-slate-500">
                    {role.description || 'No description'}
                  </p>
                  <p className="mt-4 text-sm font-medium text-indigo-600">
                    {count} {count === 1 ? 'permission' : 'permissions'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Permission matrix */}
          <div className="mt-8 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-1 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Permission matrix</h2>
                <p className="text-sm text-slate-500">
                  {canEdit
                    ? 'Click a box to give or take away a permission.'
                    : 'See which roles have which permissions.'}
                </p>
              </div>
              {!canEdit && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Lock className="h-3.5 w-3.5" />
                  Read only
                </span>
              )}
            </div>

            {/* overflow-x-auto: on small screens the table scrolls sideways instead of breaking the page */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Permission</th>
                    {roles.map((role) => (
                      <th key={role.id} className="px-6 py-3 text-center font-medium">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {allPermissions.map((permission) => (
                    <tr key={permission.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                        {permission.description && (
                          <p className="text-xs text-slate-500">{permission.description}</p>
                        )}
                      </td>

                      {roles.map((role) => {
                        const checked = roleHasPermission(role.id, permission.id);
                        const saving = savingCell === `${role.id}-${permission.id}`;

                        return (
                          <td key={role.id} className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(role, permission)}
                              disabled={!canEdit || saving}
                              aria-label={`${checked ? 'Remove' : 'Give'} ${permission.name} ${checked ? 'from' : 'to'} ${role.name}`}
                              className={`inline-grid h-6 w-6 place-items-center rounded-md transition
                                ${checked ? 'bg-indigo-600 text-white' : 'bg-white ring-1 ring-slate-300'}
                                ${canEdit ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                                ${saving ? 'animate-pulse opacity-60' : ''}`}
                            >
                              {checked && <Check className="h-4 w-4" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Roles;
