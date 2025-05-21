import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './index.css';
import { useAuth } from './auth/AuthContext';

// Lazy-loaded components
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

const App = () => {
  const { isAuthenticated } = useAuth();

  // Helper function to create protected routes
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Login />;
  };

  return (
    <Router>
      <div className='App'>
        {isAuthenticated && <Navbar />}

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
            <Route path='/home' element={<ProtectedRoute element={<Home />} />}/>
            <Route path='/chat' element={<ProtectedRoute element={<ChatAI />} />}/>
            <Route path='/settings' element={<ProtectedRoute element={<Settings />} />} />
            <Route path='/profile' element={<ProtectedRoute element={<Profile />} />} />
            <Route 
              path='/user/:username/achievements' 
              element={<ProtectedRoute element={<UserAchievements />} />}
            />

            {/* Default and Not Found Routes */}
            <Route path='/' element={<Navigate to='/home' replace />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;