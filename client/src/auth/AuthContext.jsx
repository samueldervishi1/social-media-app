import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL;
const APP_VERSION = import.meta.env.VITE_APP_VERSION;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${API_URL}me`, {
          withCredentials: true,
          headers: {
            'X-App-Version': APP_VERSION,
          },
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('User not logged in yet.');
        } else {
          console.error('Session check failed:', error);
        }
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_URL}logout`, null, {
        withCredentials: true,
        headers: {
          'X-App-Version': APP_VERSION,
        },
      });
    } catch (e) {
      console.error('Logout failed', e);
    }

    setIsAuthenticated(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};