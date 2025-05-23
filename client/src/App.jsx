import { lazy, Suspense, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './index.css';
import { useAuth } from './auth/AuthContext';
import Navbar from './components/Navbar';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Home = lazy(() => import('./components/Home'));
const ChatAI = lazy(() => import('./components/ChatAI'));
const TermsAndServices = lazy(() => import('./components/Terms'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotFound = lazy(() => import('./components/NotFound'));
const FAQ = lazy(() => import('./components/FAQ'));
const Settings = lazy(() => import('./components/Settings'));
const DeactivatedAccount = lazy(() => import('./components/DeactivatedAccount'));
const Profile = lazy(() => import('./components/Profile'));
const UserAchievements = lazy(() => import('./components/UserAchievements'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const NotificationListener = lazy(() => import('./components/NotificationBell'));
const Notifications = lazy(() => import('./components/Notifications'));
const UserSettings = lazy(() => import('./components/SettingsProfile'));

const App = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Login />;
  };

  return (
    <Router>
      <div className='App'>
        {isAuthenticated && <Navbar notifications={notifications} />}

        {isAuthenticated && (
          <NotificationListener
            onNewNotification={(notif) =>
              setNotifications((prev) => [notif, ...prev])
            }
          />
        )}

        <Suspense
          fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}
        >
          <Routes>
            {/* Public Routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/terms' element={<TermsAndServices />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/faq' element={<FAQ />} />
            <Route path='/account-deactivated' element={<DeactivatedAccount />} />

            {/* Protected Routes */}
            <Route path='/home' element={<ProtectedRoute element={<Home />} />} />
            <Route path='/chat' element={<ProtectedRoute element={<ChatAI />} />} />
            <Route path='/settings' element={<ProtectedRoute element={<Settings />} />} />
            <Route path='/profile' element={<ProtectedRoute element={<Profile />} />} />
            <Route path='/notifications' element={<ProtectedRoute element={<Notifications />} />} />
            <Route path='/user/:username/achievements' element={<ProtectedRoute element={<UserAchievements />} />}/>
            <Route path='/user/:username' element={<UserProfile />} />
            <Route path='/settings/profile/:username' element={<ProtectedRoute element={<UserSettings />} />} />

            {/* Fallback Routes */}
            <Route path='/' element={<Navigate to='/home' replace />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;