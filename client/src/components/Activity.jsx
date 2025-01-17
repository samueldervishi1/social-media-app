import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getUserIdFromToken } from '../auth/authUtils';
import '../styles/activity.css';

const API_URL = import.meta.env.VITE_API_URL;

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      const userId = getUserIdFromToken();
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        setError('User ID or token missing');
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${API_URL}/api/v2/activities/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!Array.isArray(data)) {
          throw new Error('Invalid response data');
        }

        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
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

  return (
    <div className='activity-container'>
      <div>
        <h1 className='user-ac'>Your Activity</h1>
        <div className='roadmap-container'>
          <div className='roadmap'>
            {activities.map((activity) =>
              activity.actionType.allActivity.map((action, idx) => (
                <div
                  key={`${activity.timestamp}-${idx}`}
                  className='roadmap-item'
                >
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