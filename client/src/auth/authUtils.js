const getToken = () => localStorage.getItem('token');

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
};

export const getUserIdFromToken = () => {
  const token = getToken();
  const decodedToken = token ? decodeToken(token) : null;
  return decodedToken ? decodedToken.userId : null;
};

export const getUsernameFromToken = () => {
  const token = getToken();
  const decodedToken = token ? decodeToken(token) : null;
  return decodedToken ? decodedToken.sub : null;
};