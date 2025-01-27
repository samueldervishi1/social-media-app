import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/healthcheck.module.css';

const CHECK_URL = import.meta.env.VITE_CHECK_URL;

const HealthCheck = () => {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      const response = await axios.get(`${CHECK_URL}/api/v2/health`);
      if (response.data.status) {
        let statusColor = 'green';
        if (
          response.data.status === 'Server is experiencing an outage right now.'
        ) {
          statusColor = 'red';
        } else if (
          response.data.status === 'Server responded with an unexpected result.'
        ) {
          statusColor = 'yellow';
        }

        setStatusData({
          status: response.data.status,
          color: statusColor,
          date: new Date().toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
      setStatusData({
        status: 'Health checker is unavailable. Please try again later.',
        color: 'yellow',
        date: new Date().toLocaleDateString(),
      });
    }
  };

  useEffect(() => {
    const fetchWithDelay = async () => {
      setIsLoading(true);
      const fetchPromise = fetchHealthStatus();
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.all([fetchPromise, delayPromise]);
      setIsLoading(false);
    };

    fetchWithDelay();

    const interval = setInterval(() => {
      fetchWithDelay();
    }, 1800000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Server Status</h1>

      {isLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p style={{color: 'white'}}>Loading server status...</p>
        </div>
      ) : (
        <div className={styles.statusMessage}>
          <div
            className={`${styles.statusBanner} ${
              statusData.color === 'green'
                ? styles.green
                : statusData.color === 'yellow'
                ? styles.yellow
                : styles.red
            }`}
          >
            <p style={{fontSize: 30, color: "black"}}>{statusData.status}</p>
          </div>

          <div className={styles.statusDetails}>
            <p>Date: {new Date().toLocaleString()}</p>
            {statusData.color === 'red' && (
              <p>We are currently checking on it. Please be patient.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;