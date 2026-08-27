import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadCurrentUser = async () => {

    try {

      const response = await fetch(
        'http://localhost:3000/auth/me',
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      if (!response.ok) {

        setUser(null);
        setPermissions([]);

        return;
      }

      const data = await response.json();

      setUser(data.user);
      setPermissions(data.permissions || []);

    } catch (error) {

      console.error(error);

      setUser(null);
      setPermissions([]);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const hasPermission = (
    permission: string
  ): boolean => {

    return permissions.some(
      (item) => item.name === permission
    );
  };

  const logout = async () => {

    try {

      await fetch(
        'http://localhost:3000/auth/logout',
        {
          method: 'POST',
          credentials: 'include'
        }
      );

    } catch (error) {

      console.error(error);

    } finally {

      setUser(null);
      setPermissions([]);

      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        hasPermission,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error(
      'useAuth must be used inside AuthProvider'
    );

  }

  return context;
}