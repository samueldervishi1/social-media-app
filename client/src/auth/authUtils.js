import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export const getUserInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}me`, {
      withCredentials: true,
      headers: {
        'X-App-Version': import.meta.env.VITE_APP_VERSION,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
};

export const getUserIdFromServer = async () => {
  const userInfo = await getUserInfo();
  return userInfo?.userId ?? null;
};

export const getUsernameFromServer = async () => {
  const userInfo = await getUserInfo();
  return userInfo?.username ?? null;
};