import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const decodeToken = useCallback((tokenToDecode) => {
    try {
      return JSON.parse(atob(tokenToDecode.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token: ', error.message);
      return null;
    }
  }, []);

  const validateToken = useCallback(
    (tokenToValidate) => {
      if (!tokenToValidate) return false;

      const decodedToken = decodeToken(tokenToValidate);
      if (!decodedToken || !decodedToken.exp) return false;

      const isValid = Date.now() < decodedToken.exp * 1000;
      if (!isValid) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setToken(null);
      }
      return isValid;
    },
    [decodeToken]
  );

  useEffect(() => {
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken && validateToken(token)) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [token, decodeToken, validateToken]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (token && !validateToken(token)) {
        logout();
      }
    }, 60000);
    return () => clearInterval(intervalId);
  }, [token, validateToken]);

  const login = useCallback(
    (newToken) => {
      localStorage.setItem('token', newToken);
      const decodedToken = decodeToken(newToken);

      setIsAuthenticated(!decodedToken?.twoFa);
      setToken(newToken);
    },
    [decodeToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setToken(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      validateToken: () => validateToken(token),
    }),
    [isAuthenticated, login, logout, validateToken, token]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};