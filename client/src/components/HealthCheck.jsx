import React, { useState, useEffect } from 'react';
import axios from 'axios';
import loaderGif from '../assets/377.gif';
import styles from '../styles/healthcheck.module.css';

const CHECK_URL = import.meta.env.VITE_API_URL;

const HealthCheck = () => {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      const response = await axios.get(`${CHECK_URL}health`, {
        withCredentials: true,
        headers: {
          'X-App-Version': import.meta.env.VITE_APP_VERSION,
        },
      });
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
        status:
          'Server is experiencing an outage right now. Please be patient while we try to fix it.',
        color: 'red',
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
      <div className={styles.h1_container}>
        <h1 className={styles.title}>Server Status</h1>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <img src={loaderGif} alt='Loading...' className={styles.spinner} />
          <p>Loading server status...</p>
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
            <p>{statusData.status}</p>
          </div>

          <div className={styles.statusDetails}>
            <p>Last checked: {new Date().toLocaleString()}</p>
            {statusData.color === 'red' && (
              <p>
                We are currently working on resolving the issue. Please check
                back later.
              </p>
            )}
            {statusData.color === 'yellow' && (
              <p>
                The server is operational but may experience intermittent
                issues.
              </p>
            )}
            {statusData.color === 'green' && (
              <p>All systems are operational and running smoothly.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;