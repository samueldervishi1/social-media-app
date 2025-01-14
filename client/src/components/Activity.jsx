import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserIdFromToken } from '../auth/authUtils';
import '../styles/activity.css';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const userId = getUserIdFromToken();
        const token = localStorage.getItem('token');

        if (!userId || !token) {
          throw new Error('User ID or token missing');
        }

        const response = await axios.get(
          `http://localhost:8080/api/v2/activities/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          setActivities(response.data);
        } else {
          throw new Error('Invalid response data');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className='activity-container'>
      <div>
        <h1 className='user-ac'>Your Activity</h1>
        <div className='roadmap-container'>
          <div className='roadmap'>
            {activities.map((activity, index) =>
              activity.actionType.allActivity.map((action, idx) => (
                <div key={idx} className='roadmap-item'>
                  <div className='roadmap-step'>
                    <span className='roadmap-action'>You {action}</span>
                    <span className='roadmap-timestamp'>
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <div className='roadmap-connector'></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;