import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setMessage('');

    try {
      const response = await fetch(
        'http://localhost:3000/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          credentials: 'include',

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Login failed');
        return;
      }

      window.location.href = '/dashboard';

    } catch (error) {
      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );
    }
  };

  return (
    <div>
      <h1>IAM System</h1>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

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
          Login
        </button>

      </form>

      {message && (
        <p>{message}</p>
      )}
    </div>
  );
}

export default Login;