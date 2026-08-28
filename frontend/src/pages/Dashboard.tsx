import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        if (!response.ok) {
          window.location.href = '/login';
          return;
        }

        const data = await response.json();

        setUser(data.user);

      } catch (error) {
        console.error(error);

        window.location.href = '/login';

      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${API_URL}/auth/logout`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (response.ok) {
        window.location.href = '/login';
      }

    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>IAM Dashboard</h1>

      <h2>
        Welcome, {user.first_name}!
      </h2>

      <p>
        Email: {user.email}
      </p>

      <p>
        User ID: {user.id}
      </p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
