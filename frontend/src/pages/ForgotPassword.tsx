import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage('');

    try {
      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          credentials: 'include',

          body: JSON.stringify({
            email
          })
        }
      );

      const data = await response.json();

      setMessage(
        data.message ||
        'Unable to process request'
      );

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

      <h2>Forgot Password</h2>

      <p>
        Enter your email address and
        we will send you a password reset link.
      </p>

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
            required
          />
        </div>

        <br />

        <button type="submit">
          Send Reset Link
        </button>

      </form>

      <br />

      {message && (
        <p>{message}</p>
      )}

      <br />

      <Link to="/login">
        Back to Login
      </Link>

    </div>
  );
}

export default ForgotPassword;