import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CHECK_URL = import.meta.env.VITE_CHECK_URL;

const HealthCheck = () => {
  const [statusData, setStatusData] = useState([]);
  const [hoverDetails, setHoverDetails] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchHealthHistory = async () => {
      try {
        const response = await axios.get(`${CHECK_URL}/api/v2/health-history`);
        const statusHistory = response.data.history.map((dayData) => {
          let statusColor = 'green';
          if (
            dayData.status === 'Server is experiencing an outage right now.'
          ) {
            statusColor = 'red';
          } else if (
            dayData.status === 'Server responded with an unexpected result.'
          ) {
            statusColor = 'yellow';
          }
          return {
            ...dayData,
            color: statusColor,
          };
        });
        setStatusData(statusHistory.reverse());
      } catch (error) {
        console.error('Error fetching health history:', error);
      }
    };

    fetchHealthHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'green':
        return 'bg-success';
      case 'yellow':
        return 'bg-warning';
      case 'red':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const handleClick = (dayData) => {
    setSelectedDay(dayData);
  };

  return (
    <div className='container text-center mt-5'>
      <h1>Server Health Check (Past 7 Days)</h1>
      <div
        className='d-flex justify-content-center mt-4'
        style={{ position: 'relative' }}
      >
        {statusData.length > 0 ? (
          statusData.map((dayData, index) => (
            <div
              key={index}
              className={`bar ${getStatusColor(dayData.color)} mx-1`}
              style={{
                height: '30px',
                width: '40px',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => handleClick(dayData)}
            >
              {selectedDay === dayData && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '5px 10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '5px',
                    fontSize: '12px',
                    opacity: 1,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none',
                  }}
                >
                  {dayData.details}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
      {selectedDay && (
        <div className='mt-4'>
          <h3>Status for {7 - selectedDay.day} Day(s) Ago:</h3>
          <p>{selectedDay.details}</p>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;