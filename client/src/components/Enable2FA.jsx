import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { getUserIdFromToken } from '../auth/authUtils';
const API_URL = import.meta.env.VITE_API_URL;
const CHECK_URL = import.meta.env.VITE_CHECK_API_URL;

function Enable2FA() {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [userTwoFAStatus, setUserTwoFAStatus] = useState(null);
  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  useEffect(() => {
    const checkTwoFAStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/v2/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update userTwoFAStatus based on the boolean value
        setUserTwoFAStatus(response.data.twoFa);
        console.log(response.data.twoFa);
      } catch (error) {
        console.error('Error fetching 2FA status', error);
      }
    };

    checkTwoFAStatus();
  }, [userId]);

  const handleEnable2FA = async () => {
    try {
      const response = await axios.get(`${CHECK_URL}/totp/generate/${userId}`);
      setQrCode(response.data.qr_code_base64);
      setSecret(response.data.secret);
    } catch (error) {
      console.error('Error enabling 2FA', error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post(`${CHECK_URL}/totp/verify/${userId}`, {
        code,
      });
      if (response.data.valid) {
        const token = localStorage.getItem('token');

        await axios.put(
          `${API_URL}/api/v2/users/update/${userId}`,
          { twoFa: true }, // Update twoFa to boolean true
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert('2FA is now enabled');
        setIsVerified(true);
        navigate('/home');
      } else {
        alert('Invalid code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying code', error);
    }
  };

  return (
    <div className='container mt-4'>
      {userTwoFAStatus === false && (
        <h2>Enable Two-Factor Authentication (2FA)</h2>
      )}

      {userTwoFAStatus === true ? (
        <div
          className='alert alert-success mt-4'
          style={{ textAlign: 'center' }}
        >
          <strong>Success!</strong> 2FA is already enabled on your account.
        </div>
      ) : userTwoFAStatus === false ? (
        <div className='alert alert-warning mt-4'>
          <strong>Info:</strong> 2FA is not yet enabled. Please follow the steps
          below to enable it.
        </div>
      ) : (
        <div>Loading 2FA status...</div>
      )}

      {!isVerified && userTwoFAStatus === false && !qrCode ? (
        <button className='btn btn-primary' onClick={handleEnable2FA}>
          Enable 2FA
        </button>
      ) : (
        userTwoFAStatus === false && (
          <div>
            <h4>Scan the QR code or enter the secret manually</h4>
            <div className='mb-4'>
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt='QR Code'
                className='img-fluid'
              />
            </div>
            <p>
              Secret: <strong>{secret}</strong>
            </p>

            <div className='form-group'>
              <input
                type='text'
                className='form-control'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder='Enter TOTP code'
              />
            </div>

            <div className='mt-3'>
              <button className='btn btn-primary' onClick={handleVerifyCode}>
                Verify Code
              </button>
            </div>
          </div>
        )
      )}

      {isVerified && (
        <div className='alert alert-success mt-4'>
          <strong>Success!</strong> 2FA is now enabled on your account.
        </div>
      )}
    </div>
  );
}

export default Enable2FA;