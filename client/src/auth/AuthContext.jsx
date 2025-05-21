import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import axios from 'axios';
import { isUserDeactivated } from './authUtils';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_URL}auth/logout`, null, {
        withCredentials: true,
      });
    } catch (e) {
      console.error('Logout failed', e);
    }
    setIsAuthenticated(false);
    setIsDeactivated(false);
    setUserId(null);
    setUsername(null);
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
        const response = await axios.get(`${API_URL}auth/me`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
          localStorage.setItem('lastAuthCheck', Date.now());

          if (response.data) {
            if (response.data.userId) {
              setUserId(response.data.userId);
            }

            if (response.data.username) {
              setUsername(response.data.username);

              try {
                const deactivated = await isUserDeactivated(
                  response.data.username
                );
                setIsDeactivated(deactivated);

                if (deactivated) {
                  const currentPath = window.location.pathname;
                  if (currentPath !== '/account-deactivated') {
                    window.location.href = '/account-deactivated';
                  }
                } else {
                  console.log('User account is active');
                }
              } catch (profileError) {
                console.error(
                  'Error checking deactivation status:',
                  profileError
                );
                setIsDeactivated(false);
              }
            } else {
              console.error('No username found in response');
              setIsDeactivated(false);
            }
          }
        } else {
          setIsAuthenticated(false);
          setIsDeactivated(false);
          setUsername(null);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('User not logged in yet.');
        } else {
          console.error('Session check failed:', error);
        }
        setIsAuthenticated(false);
        setIsDeactivated(false);
        setUsername(null);
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
      isDeactivated,
      userId,
      username,
      login,
      logout,
    }),
    [isAuthenticated, isLoading, isDeactivated, userId, username, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};