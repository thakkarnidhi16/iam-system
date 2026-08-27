import { useEffect, useState } from 'react';

interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [selectedRole, setSelectedRole] =
    useState<Role | null>(null);

  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] =
    useState(false);

  const [message, setMessage] = useState('');

  // Get all roles
  useEffect(() => {
    const getRoles = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/roles',
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || 'Failed to retrieve roles'
          );
          return;
        }

        setRoles(data.roles);

      } catch (error) {
        console.error(error);

        setMessage(
          'Unable to connect to the server'
        );

      } finally {
        setLoading(false);
      }
    };

    getRoles();
  }, []);

  // Get permissions for selected role
  const handleRoleClick = async (role: Role) => {
    setSelectedRole(role);
    setPermissions([]);
    setPermissionsLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:3000/roles/${role.id}/permissions`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
          'Failed to retrieve permissions'
        );
        return;
      }

      setPermissions(data.permissions);

    } catch (error) {
      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );

    } finally {
      setPermissionsLoading(false);
    }
  };

  if (loading) {
    return <p>Loading roles...</p>;
  }

  return (
    <div>

      <h1>Roles</h1>

      {message && (
        <p>{message}</p>
      )}

      <h2>Available Roles</h2>

      {roles.length === 0 ? (
        <p>No roles found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                onClick={() =>
                  handleRoleClick(role)
                }
                style={{
                  cursor: 'pointer'
                }}
              >
                <td>{role.id}</td>

                <td>
                  {role.name}
                </td>

                <td>
                  {role.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />

      {selectedRole && (
        <div>

          <h2>
            {selectedRole.name} Permissions
          </h2>

          <p>
            {selectedRole.description}
          </p>

          {permissionsLoading ? (
            <p>
              Loading permissions...
            </p>
          ) : permissions.length === 0 ? (
            <p>
              This role has no permissions.
            </p>
          ) : (
            <ul>
              {permissions.map((permission) => (
                <li key={permission.id}>
                  <strong>
                    {permission.name}
                  </strong>

                  {' — '}

                  {permission.description}
                </li>
              ))}
            </ul>
          )}

        </div>
      )}

    </div>
  );
}

export default Roles;