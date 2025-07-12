import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/deactivated.module.css';
// import { Visibility, VisibilityOff } from '@mui/icons-material';
import customLoadingGif from '../assets/377.gif';
import { getUserIdFromServer, reactivateAccount } from '../auth/authUtils';
import { useAuth } from '../auth/AuthContext';

const DeactivatedAccount = () => {
  const [formState, setFormState] = useState({
    loading: false,
    error: null,
    password: '',
    confirmReactivation: false,
    showPassword: false,
  });

  const navigate = useNavigate();
  const { login, userId, markReactivated } = useAuth();

  const handleReactivateSubmit = async (e) => {
    e.preventDefault();

    if (formState.loading) return;

    setFormState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const userIdToUse = userId || (await getUserIdFromServer());

      if (!userIdToUse) {
        throw new Error('User ID not found');
      }

      const success = await reactivateAccount(
        userIdToUse,
        formState.password,
        formState.confirmReactivation
      );

      if (success) {
        markReactivated();
        login();
        navigate('/home');
      } else {
        throw new Error('Failed to reactivate account');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to reactivate account. Please try again.';

      setFormState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormState((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const togglePasswordVisibility = () => {
    setFormState((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  return (
    <div className={styles.deactivated_container}>
      <div className={styles.card}>
        <h2>Account Deactivated</h2>
        <p>
          Your account has been deactivated. To reactivate your account and
          continue using Chattr, please fill in the form below.
        </p>

        {formState.error && (
          <div className={styles.error_message}>{formState.error}</div>
        )}

        <form onSubmit={handleReactivateSubmit}>
          <div className={styles.password_input_container}>
            <input
              type={formState.showPassword ? 'text' : 'password'}
              name='password'
              placeholder='Enter your password'
              value={formState.password}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
            <span
              className={styles.password_toggle_icon}
              onClick={togglePasswordVisibility}
            >
              {/* {formState.showPassword ? <VisibilityOff /> : <Visibility />} */}
            </span>
          </div>

          <div className={styles.checkbox_container}>
            <input
              type='checkbox'
              name='confirmReactivation'
              id='confirmReactivation'
              checked={formState.confirmReactivation}
              onChange={handleInputChange}
              required
            />
            <label htmlFor='confirmReactivation'>
              I confirm that I want to reactivate my account
            </label>
          </div>

          <button
            type='submit'
            className={styles.reactivate_button}
            disabled={formState.loading}
          >
            {formState.loading ? (
              <img
                src={customLoadingGif}
                alt='Loading...'
                style={{ width: '20px', height: '20px' }}
              />
            ) : (
              'Reactivate Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeactivatedAccount;
