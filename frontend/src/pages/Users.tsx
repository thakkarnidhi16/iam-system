import { useEffect, useState } from 'react';

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

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Stores the roles that each user currently has
  const [userRoles, setUserRoles] = useState<
    Record<number, Role[]>
  >({});

  const [loading, setLoading] = useState(true);

  // Create user form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Stores the role selected in the dropdown for each user
  const [selectedRoles, setSelectedRoles] = useState<
    Record<number, number>
  >({});

  const [message, setMessage] = useState('');

  // --------------------------------------------------
  // Get roles for one specific user
  // --------------------------------------------------

  const getUserRoles = async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${userId}/roles`,
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

      setUserRoles((previous) => ({
        ...previous,
        [userId]: data.roles
      }));

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
        'http://localhost:3000/users',
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || 'Failed to retrieve users'
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
  // Get all available roles
  // --------------------------------------------------

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
        'Unable to retrieve roles'
      );
    }
  };

  // --------------------------------------------------
  // Load users and roles when page loads
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
        'http://localhost:3000/users',
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
          data.message || 'Failed to create user'
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

      // Reload users
      await getUsers();

    } catch (error) {
      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );
    }
  };

  // --------------------------------------------------
  // Assign role to user
  // --------------------------------------------------

  const handleAssignRole = async (
    userId: number
  ) => {

    const roleId = selectedRoles[userId];

    if (!roleId) {
      setMessage('Please select a role');

      return;
    }

    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:3000/users/${userId}/roles`,
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

      // Refresh this user's roles
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
    return <p>Loading users...</p>;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div>

      <h1>Users</h1>

      {message && (
        <p>{message}</p>
      )}

      {/* --------------------------------------------- */}
      {/* Create User */}
      {/* --------------------------------------------- */}

      <h2>Create User</h2>

      <form onSubmit={handleCreateUser}>

        <div>
          <label>First Name</label>
          <br />

          <input
            type="text"
            value={firstName}
            onChange={(event) =>
              setFirstName(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Last Name</label>
          <br />

          <input
            type="text"
            value={lastName}
            onChange={(event) =>
              setLastName(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
          Create User
        </button>

      </form>

      <br />

      {/* --------------------------------------------- */}
      {/* Users */}
      {/* --------------------------------------------- */}

      <h2>All Users</h2>

      {users.length === 0 ? (

        <p>No users found.</p>

      ) : (

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Current Roles</th>
              <th>Assign Role</th>
            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr key={user.id}>

                <td>
                  {user.id}
                </td>

                <td>
                  {user.first_name}
                </td>

                <td>
                  {user.last_name}
                </td>

                <td>
                  {user.email}
                </td>

                {/* ----------------------------------- */}
                {/* Current Roles */}
                {/* ----------------------------------- */}

                <td>

                  {userRoles[user.id]?.length ? (

                    userRoles[user.id].map((role) => (

                      <div key={role.id}>
                        {role.name}
                      </div>

                    ))

                  ) : (

                    <span>No roles</span>

                  )}

                </td>

                {/* ----------------------------------- */}
                {/* Assign Role */}
                {/* ----------------------------------- */}

                <td>

                  <select
                    value={
                      selectedRoles[user.id] || ''
                    }
                    onChange={(event) =>
                      setSelectedRoles({
                        ...selectedRoles,
                        [user.id]:
                          Number(event.target.value)
                      })
                    }
                  >

                    <option value="">
                      Select role
                    </option>

                {roles
                .filter((role) => {
                  const currentRoles =
                    userRoles[user.id] || [];

                  return !currentRoles.some(
                    (currentRole) =>
                      currentRole.id === role.id
                  );
                })
                .map((role) => (

                  <option
                    key={role.id}
                    value={role.id}
                  >
                    {role.name}
                  </option>

                ))}
                  </select>

                  {' '}

                  <button
                    onClick={() =>
                      handleAssignRole(user.id)
                    }
                  >
                    Assign Role
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
}

export default Users;