import { useEffect, useState } from 'react';
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
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

function Users() {

  const {
    hasPermission
  } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Roles belonging to each user
  const [userRoles, setUserRoles] = useState<
    Record<number, Role[]>
  >({});

  // Permissions belonging to each role
  const [rolePermissions, setRolePermissions] = useState<
    Record<number, Permission[]>
  >({});

  const [loading, setLoading] = useState(true);

  // Create user form
  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Selected role for each user
  const [selectedRoles, setSelectedRoles] = useState<
    Record<number, number>
  >({});

  const [message, setMessage] = useState('');

  // --------------------------------------------------
  // Get permissions for a role
  // --------------------------------------------------

  const getRolePermissions = async (
    roleId: number
  ) => {

    try {

      const response = await fetch(
        `${API_URL}/roles/${roleId}/permissions`,
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

  // --------------------------------------------------
  // Get roles for one user
  // --------------------------------------------------

  const getUserRoles = async (
    userId: number
  ) => {

    try {

      const response = await fetch(
        `${API_URL}/users/${userId}/roles`,
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

      const rolesForUser: Role[] =
        data.roles;

      // Store user's roles
      setUserRoles((previous) => ({
        ...previous,
        [userId]: rolesForUser
      }));

      // Get permissions for each role
      await Promise.all(
        rolesForUser.map((role) =>
          getRolePermissions(role.id)
        )
      );

    } catch (error) {

      console.error(error);

    }
  };

  // --------------------------------------------------
  // Get all users
  // --------------------------------------------------

  const getUsers = async () => {

    try {

      const response = await fetch(
        `${API_URL}/users`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setMessage(
          data.message ||
          'Failed to retrieve users'
        );

        return;
      }

      setUsers(data.users);

      // Get roles for every user
      await Promise.all(
        data.users.map((user: User) =>
          getUserRoles(user.id)
        )
      );

    } catch (error) {

      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );
    }
  };

  // --------------------------------------------------
  // Get all roles
  // --------------------------------------------------

  const getRoles = async () => {

    try {

      const response = await fetch(
        `${API_URL}/roles`,
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

    } catch (error) {

      console.error(error);

      setMessage(
        'Unable to retrieve roles'
      );
    }
  };

  // --------------------------------------------------
  // Initial page load
  // --------------------------------------------------

  useEffect(() => {

    const loadData = async () => {

      await Promise.all([
        getUsers(),
        getRoles()
      ]);

      setLoading(false);

    };

    loadData();

  }, []);

  // --------------------------------------------------
  // Create user
  // --------------------------------------------------

  const handleCreateUser = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    setMessage('');

    try {

      const response = await fetch(
        `${API_URL}/users`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          credentials: 'include',

          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setMessage(
          data.message ||
          'Failed to create user'
        );

        return;
      }

      setMessage(
        'User created successfully'
      );

      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');

      // Hide form
      setShowCreateForm(false);

      // Refresh users
      await getUsers();

    } catch (error) {

      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );
    }
  };

  // --------------------------------------------------
  // Assign role
  // --------------------------------------------------

  const handleAssignRole = async (
    userId: number
  ) => {

    const roleId =
      selectedRoles[userId];

    if (!roleId) {

      setMessage(
        'Please select a role'
      );

      return;
    }

    setMessage('');

    try {

      const response = await fetch(
       `${API_URL}/users/${userId}/roles`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          credentials: 'include',

          body: JSON.stringify({
            roleId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setMessage(
          data.message ||
          'Failed to assign role'
        );

        return;
      }

      setMessage(
        data.message ||
        'Role assigned successfully'
      );

      // Refresh user's roles
      await getUserRoles(userId);

      // Clear dropdown
      setSelectedRoles((previous) => ({
        ...previous,
        [userId]: 0
      }));

    } catch (error) {

      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {

    return (
      <p>
        Loading users...
      </p>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div>

      <h1>Users</h1>

      {message && (
        <p>
          {message}
        </p>
      )}

      {/* ================================================= */}
      {/* CREATE USER */}
      {/* ================================================= */}

      {hasPermission('create_users') && (

        <div>

          {!showCreateForm ? (

            <button
              onClick={() =>
                setShowCreateForm(true)
              }
            >
              + Create User
            </button>

          ) : (

            <div>

              <h2>
                Create User
              </h2>

              <form
                onSubmit={
                  handleCreateUser
                }
              >

                <div>

                  <label>
                    First Name
                  </label>

                  <br />

                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(
                        event.target.value
                      )
                    }
                  />

                </div>

                <br />

                <div>

                  <label>
                    Last Name
                  </label>

                  <br />

                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(
                        event.target.value
                      )
                    }
                  />

                </div>

                <br />

                <div>

                  <label>
                    Email
                  </label>

                  <br />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                  />

                </div>

                <br />

                <div>

                  <label>
                    Password
                  </label>

                  <br />

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                  />

                </div>

                <br />

                <button type="submit">
                  Create User
                </button>

                {' '}

                <button
                  type="button"
                  onClick={() => {

                    setShowCreateForm(false);

                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPassword('');

                  }}
                >
                  Cancel
                </button>

              </form>

            </div>

          )}

        </div>

      )}

      <br />

      {/* ================================================= */}
      {/* USERS */}
      {/* ================================================= */}

      <h2>
        All Users
      </h2>

      {users.length === 0 ? (

        <p>
          No users found.
        </p>

      ) : (

        <table>

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                First Name
              </th>

              <th>
                Last Name
              </th>

              <th>
                Email
              </th>

              <th>
                Current Roles
              </th>

              <th>
                Permissions
              </th>

              {hasPermission(
                'assign_roles'
              ) && (

                <th>
                  Assign Role
                </th>

              )}

            </tr>

          </thead>

          <tbody>

            {users.map((user) => {

              const currentRoles =
                userRoles[user.id] || [];

              /*
               * Combine permissions from
               * all of the user's roles.
               */

              const permissions =
                currentRoles.flatMap(
                  (role) =>
                    rolePermissions[
                      role.id
                    ] || []
                );

              /*
               * Remove duplicate permissions.
               */

              const uniquePermissions =
                permissions.filter(
                  (
                    permission,
                    index,
                    array
                  ) =>
                    index ===
                    array.findIndex(
                      (item) =>
                        item.id ===
                        permission.id
                    )
                );

              return (

                <tr
                  key={user.id}
                >

                  {/* ID */}

                  <td>
                    {user.id}
                  </td>

                  {/* First Name */}

                  <td>
                    {user.first_name}
                  </td>

                  {/* Last Name */}

                  <td>
                    {user.last_name}
                  </td>

                  {/* Email */}

                  <td>
                    {user.email}
                  </td>

                  {/* ================================= */}
                  {/* CURRENT ROLES */}
                  {/* ================================= */}

                  <td>

                    {currentRoles.length >
                    0 ? (

                      currentRoles.map(
                        (role) => (

                          <div
                            key={role.id}
                          >
                            {role.name}
                          </div>

                        )
                      )

                    ) : (

                      <span>
                        No roles
                      </span>

                    )}

                  </td>

                  {/* ================================= */}
                  {/* PERMISSIONS */}
                  {/* ================================= */}

                  <td>

                    {uniquePermissions.length >
                    0 ? (

                      uniquePermissions.map(
                        (permission) => (

                          <div
                            key={
                              permission.id
                            }
                          >

                            ✓{' '}

                            {permission.name}

                          </div>

                        )
                      )

                    ) : (

                      <span>
                        No permissions
                      </span>

                    )}

                  </td>

                  {/* ================================= */}
                  {/* ASSIGN ROLE */}
                  {/* ================================= */}

                  {hasPermission(
                    'assign_roles'
                  ) && (

                    <td>

                      <select
                        value={
                          selectedRoles[
                            user.id
                          ] || ''
                        }
                        onChange={(event) =>
                          setSelectedRoles({
                            ...selectedRoles,

                            [user.id]:
                              Number(
                                event.target
                                  .value
                              )
                          })
                        }
                      >

                        <option value="">
                          Select role
                        </option>

                        {roles
                          .filter(
                            (role) => {

                              return !currentRoles.some(
                                (currentRole) =>
                                  currentRole.id ===
                                  role.id
                              );

                            }
                          )
                          .map(
                            (role) => (

                              <option
                                key={
                                  role.id
                                }
                                value={
                                  role.id
                                }
                              >
                                {role.name}
                              </option>

                            )
                          )}

                      </select>

                      {' '}

                      <button
                        onClick={() =>
                          handleAssignRole(
                            user.id
                          )
                        }
                      >
                        Assign Role
                      </button>

                    </td>

                  )}

                </tr>

              );

            })}

          </tbody>

        </table>

      )}

    </div>
  );
}

export default Users;