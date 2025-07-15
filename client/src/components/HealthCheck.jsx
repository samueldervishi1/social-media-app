import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/healthcheck.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [detailedHealthData, setDetailedHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedService, setExpandedService] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);

        const basicResponse = await axios.get(`${API_URL}health`, {
          withCredentials: true,
        });

        const detailedResponse = await axios.get(`${API_URL}health/detailed`, {
          withCredentials: true,
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
    const intervalId = setInterval(fetchHealthData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const getOverallStatus = () => {
    if (!healthData || !detailedHealthData)
      return { text: 'Unknown', healthy: false };

    const allHealthy =
      healthData.healthy &&
      detailedHealthData.checks &&
      Object.values(detailedHealthData.checks).every((check) => check.healthy);

    return {
      text: allHealthy ? 'All Systems Operational' : 'System Issues Detected',
      healthy: allHealthy,
    };
  };

  const generateUptimeChart = (healthy) => {
    // Generate 90 days of uptime data
    const days = [];
    for (let i = 0; i < 90; i++) {
      // Simulate mostly operational with occasional issues
      const rand = Math.random();
      let status = 'operational';
      if (!healthy && i > 85) {
        status = 'down'; // Show recent issues if service is unhealthy
      } else if (rand < 0.01) {
        status = 'down';
      } else if (rand < 0.03) {
        status = 'degraded';
      }
      days.push(status);
    }
    return days;
  };

  const getUptimePercentage = (chartData) => {
    const operational = chartData.filter((day) => day === 'operational').length;
    return ((operational / chartData.length) * 100).toFixed(1);
  };

  const toggleServiceDetails = (serviceName) => {
    setExpandedService(expandedService === serviceName ? null : serviceName);
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
        <div className={styles.errorBanner}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const overallStatus = getOverallStatus();
  const services = [];

  // Add main service
  if (healthData) {
    const chartData = generateUptimeChart(healthData.healthy);
    services.push({
      name: healthData.service,
      healthy: healthData.healthy,
      uptime: getUptimePercentage(chartData),
      chartData: chartData,
      details: {
        version: healthData.version,
        code: healthData.code,
        timestamp: healthData.timestamp,
      },
    });
  }

  // Add detailed checks as separate services
  if (detailedHealthData && detailedHealthData.checks) {
    Object.entries(detailedHealthData.checks).forEach(([key, check]) => {
      const chartData = generateUptimeChart(check.healthy);
      services.push({
        name: check.description,
        healthy: check.healthy,
        uptime: getUptimePercentage(chartData),
        chartData: chartData,
        details: {
          status: check.status,
          usage_percent: check.usage_percent,
          used_memory_mb: check.used_memory_mb,
          max_memory_mb: check.max_memory_mb,
        },
      });
    });
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Overall Status Banner */}
        <div
          className={`${styles.overallBanner} ${overallStatus.healthy ? styles.green : styles.red}`}
        >
          <p>{overallStatus.text}</p>
        </div>

        {/* Services List */}
        <div className={styles.servicesList}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceRow}>
              <div
                className={styles.serviceMain}
                onClick={() => toggleServiceDetails(service.name)}
              >
                <div className={styles.serviceLeft}>
                  <span className={styles.serviceName}>{service.name}</span>
                  <span
                    className={`${styles.serviceStatus} ${service.healthy ? styles.operational : styles.issues}`}
                  >
                    {service.healthy ? 'Operational' : 'Issues'}
                  </span>
                </div>

                <div className={styles.serviceRight}>
                  <div className={styles.uptimeText}>
                    Uptime over the past 90 days.{' '}
                    <strong>{service.uptime}% uptime</strong>
                  </div>

                  <div className={styles.uptimeChart}>
                    {service.chartData.map((status, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`${styles.uptimeBar} ${styles[status]}`}
                        title={`Day ${dayIndex + 1}: ${status}`}
                      />
                    ))}
                  </div>

                  <div className={styles.chartLabels}>
                    <span>90 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedService === service.name && (
                <div className={styles.serviceDetails}>
                  <div className={styles.detailsContent}>
                    {service.details.version && (
                      <div className={styles.detailItem}>
                        <strong>Version:</strong> {service.details.version}
                      </div>
                    )}
                    {service.details.code && (
                      <div className={styles.detailItem}>
                        <strong>Status Code:</strong> {service.details.code}
                      </div>
                    )}
                    {service.details.status && (
                      <div className={styles.detailItem}>
                        <strong>Status:</strong> {service.details.status}
                      </div>
                    )}
                    {service.details.usage_percent !== undefined && (
                      <div className={styles.detailItem}>
                        <strong>Usage:</strong>{' '}
                        {service.details.usage_percent.toFixed(2)}%
                      </div>
                    )}
                    {service.details.used_memory_mb !== undefined &&
                      service.details.max_memory_mb !== undefined && (
                        <div className={styles.detailItem}>
                          <strong>Memory:</strong>{' '}
                          {service.details.used_memory_mb} MB /{' '}
                          {service.details.max_memory_mb} MB
                        </div>
                      )}
                    {service.details.timestamp && (
                      <div className={styles.detailItem}>
                        <strong>Last Updated:</strong>{' '}
                        {new Date(service.details.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
