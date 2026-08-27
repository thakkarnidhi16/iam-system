import { useEffect, useState } from 'react';

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
  const [roles, setRoles] = useState<Role[]>([]);

  const [rolePermissions, setRolePermissions] = useState<
    Record<number, Permission[]>
  >({});

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');

  // ---------------------------------------------
  // Get permissions for a role
  // ---------------------------------------------

  const getRolePermissions = async (
    roleId: number
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/roles/${roleId}/permissions`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setRolePermissions((previous) => ({
        ...previous,
        [roleId]: data.permissions
      }));

    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------------------------
  // Get all roles
  // ---------------------------------------------

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
          data.message ||
          'Failed to retrieve roles'
        );

        return;
      }

      setRoles(data.roles);

      // Get permissions for every role
      await Promise.all(
        data.roles.map((role: Role) =>
          getRolePermissions(role.id)
        )
      );

    } catch (error) {
      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );
    }
  };

  // ---------------------------------------------
  // Load page
  // ---------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      await getRoles();
      setLoading(false);
    };

    loadData();
  }, []);

  // ---------------------------------------------
  // Loading
  // ---------------------------------------------

  if (loading) {
    return <p>Loading roles...</p>;
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------

  return (
    <div>

      <h1>Roles</h1>

      {message && (
        <p>{message}</p>
      )}

      {roles.length === 0 ? (

        <p>No roles found.</p>

      ) : (

        roles.map((role) => {

          const permissions =
            rolePermissions[role.id] || [];

          return (
            <div key={role.id}>

              <hr />

              <h2>
                {role.name}
              </h2>

              <p>
                {role.description}
              </p>

              <h3>
                Permissions
              </h3>

              {permissions.length === 0 ? (

                <p>
                  No permissions assigned
                </p>

              ) : (

                <ul>

                  {permissions.map(
                    (permission) => (

                      <li
                        key={permission.id}
                      >
                        <strong>
                          {permission.name}
                        </strong>

                        {' — '}

                        {permission.description}

                      </li>

                    )
                  )}

                </ul>

              )}

            </div>
          );

        })

      )}

    </div>
  );
}

export default Roles;