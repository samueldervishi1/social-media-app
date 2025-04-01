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
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

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
    localStorage.removeItem('lastAuthCheck');
  }, []);

  useEffect(() => {
    if (!isInitialCheck) {
      const interceptorId = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (
            error.response &&
            error.response.status === 401 &&
            !isInitialCheck
          ) {
            console.log(
              '401 error caught by interceptor - redirecting to login'
            );
            logout();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
      return () => {
        axios.interceptors.response.eject(interceptorId);
      };
    }
  }, [isInitialCheck, logout]);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}me`, {
          withCredentials: true,
          headers: {
            'X-App-Version': APP_VERSION,
          },
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
          localStorage.setItem('lastAuthCheck', Date.now());
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
      } finally {
        setIsLoading(false);
        setIsInitialCheck(false);
      }
    };

    checkSession();
    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        checkSession();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('lastAuthCheck', Date.now());
  }, []);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [isAuthenticated, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};