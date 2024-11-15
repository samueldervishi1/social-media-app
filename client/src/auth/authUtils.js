export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      return decodedToken.userId;
    } catch (error) {
      console.error("Error decoding token for User ID:", error.message);
      return null;
    }
  }
  return null;
};

export const getUsernameFromToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      return decodedToken.sub;
    } catch (error) {
      console.error("Error decoding token for Username:", error.message);
      return null;
    }
  }
  return null;
};
