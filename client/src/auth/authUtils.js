import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export const getUserInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}auth/me`, {
      withCredentials: true,
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

export const getCompleteUserProfile = async (username) => {
  if (!username) {
    console.error('Username is required to fetch complete profile');
    return null;
  }

  try {
    const response = await axios.get(`${API_URL}users/lookup/${username}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get complete user profile:', error);
    return null;
  }
};

export const isUserDeactivated = async (username) => {
  const profile = await getCompleteUserProfile(username);
  if (!profile) return false;

  return profile.deactivated === true || profile.deactivated === 'true';
};

export const reactivateAccount = async (
  userId,
  password,
  confirmReactivation
) => {
  try {
    const response = await axios.put(
      `${API_URL}profile/${userId}/reactivate`,
      {
        password,
        confirmReactivation,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error('Failed to reactivate account:', error);
    throw error;
  }
};
