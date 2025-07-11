import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/healthcheck.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [detailedHealthData, setDetailedHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic health data
        const basicResponse = await axios.get(`${API_URL}health`, {
          withCredentials: true
        });
        
        // Fetch detailed health data
        const detailedResponse = await axios.get(`${API_URL}health/detailed`, {
          withCredentials: true
        });
        
        setHealthData(basicResponse.data);
        setDetailedHealthData(detailedResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to fetch server health information');
        setLoading(false);
      }
    };

    fetchHealthData();
    
    // Set up polling every 60 seconds
    const intervalId = setInterval(fetchHealthData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (healthy) => {
    return healthy ? 'green' : 'red';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Loading health information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.statusMessage}>
          <div className={`${styles.statusBanner} ${styles.red}`}>
            <p>Error</p>
          </div>
          <div className={styles.statusDetails}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.h1_container}>
        <h1 className={styles.title}>Server Health</h1>
      </div>
      
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'basic' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Health
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'detailed' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('detailed')}
        >
          Detailed Health
        </button>
      </div>
      
      {activeTab === 'basic' && healthData && (
        <div className={styles.statusMessage}>
          <div className={`${styles.statusBanner} ${styles[getStatusColor(healthData.healthy)]}`}>
            <p>{healthData.status}</p>
          </div>
          <div className={styles.statusDetails}>
            <p><strong>Service:</strong> {healthData.service}</p>
            <p><strong>Version:</strong> {healthData.version}</p>
            <p><strong>Status Code:</strong> {healthData.code}</p>
            <p><strong>Last Updated:</strong> {formatTimestamp(healthData.timestamp)}</p>
          </div>
        </div>
      )}
      
      {activeTab === 'detailed' && detailedHealthData && (
        <div>
          <div className={styles.statusMessage}>
            <div className={`${styles.statusBanner} ${styles[getStatusColor(detailedHealthData.healthy)]}`}>
              <p>{detailedHealthData.status}</p>
            </div>
            <div className={styles.statusDetails}>
              <p><strong>Service:</strong> {detailedHealthData.service}</p>
              <p><strong>Version:</strong> {detailedHealthData.version}</p>
              <p><strong>Status Code:</strong> {detailedHealthData.code}</p>
              <p><strong>Last Updated:</strong> {formatTimestamp(detailedHealthData.timestamp)}</p>
            </div>
          </div>
          
          <h2 className={styles.sectionTitle}>System Checks</h2>
          
          {detailedHealthData.checks && Object.entries(detailedHealthData.checks).map(([key, check]) => (
            <div key={key} className={styles.statusMessage} style={{ marginTop: '20px' }}>
              <div className={`${styles.statusBanner} ${styles[getStatusColor(check.healthy)]}`}>
                <p>{check.description}</p>
              </div>
              <div className={styles.statusDetails}>
                <p><strong>Status:</strong> {check.status}</p>
                {check.usage_percent !== undefined && (
                  <p><strong>Usage:</strong> {check.usage_percent.toFixed(2)}%</p>
                )}
                {check.used_memory_mb !== undefined && check.max_memory_mb !== undefined && (
                  <p><strong>Memory:</strong> {check.used_memory_mb} MB / {check.max_memory_mb} MB</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthCheck; 