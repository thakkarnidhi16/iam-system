import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage('');
    setSuccess(false);

    // Make sure token exists
    if (!token) {
      setMessage(
        'Invalid password reset link.'
      );

      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      setMessage(
        'Passwords do not match.'
      );

      return;
    }

    // Basic password validation
    if (newPassword.length < 8) {
      setMessage(
        'Password must be at least 8 characters.'
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/reset-password`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          credentials: 'include',

          body: JSON.stringify({
            token,
            newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
          'Unable to reset password'
        );

        return;
      }

      setSuccess(true);

      setMessage(
        data.message ||
        'Password reset successfully'
      );

      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {

      console.error(error);

      setMessage(
        'Unable to connect to the server'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h1>IAM System</h1>

      <h2>Reset Password</h2>

      {!success ? (

        <form onSubmit={handleSubmit}>

          <div>
            <label>
              New Password
            </label>

            <br />

            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <br />

          <div>
            <label>
              Confirm Password
            </label>

            <br />

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Resetting...'
              : 'Reset Password'}
          </button>

        </form>

      ) : null}

      {message && (
        <p>{message}</p>
      )}

      {success && (
        <>
          <br />

          <Link to="/login">
            Back to Login
          </Link>
        </>
      )}

    </div>
  );
}

export default ResetPassword;