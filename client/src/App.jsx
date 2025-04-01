import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './index.css';
import { useAuth } from './auth/AuthContext';

// Lazy-loaded components
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Home = lazy(() => import('./components/Home'));
const UserCommunities = lazy(() => import('./components/UserCommunities'));
const Navbar = lazy(() => import('./components/Navbar'));
const ChatAI = lazy(() => import('./components/ChatAI'));
const CommunitiesList = lazy(() => import('./components/CommunitiesList'));
const CommunityDetails = lazy(() => import('./components/CommunityDetails'));
const TermsAndServices = lazy(() => import('./components/Terms'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotFound = lazy(() => import('./components/NotFound'));
const HealthCheck = lazy(() => import('./components/HealthCheck'));
const FAQ = lazy(() => import('./components/FAQ'));

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
            <Route path='/health' element={<HealthCheck />} />
            <Route path='/faq' element={<FAQ />} />

            {/* Protected Routes */}
            <Route path='/home' element={<ProtectedRoute element={<Home />} />}/>
            <Route path='/chat' element={<ProtectedRoute element={<ChatAI />} />}/>
            <Route path='/c/communities' element={<ProtectedRoute element={<CommunitiesList />} />}/>
            <Route path='/c/community/:name' element={<ProtectedRoute element={<CommunityDetails />} />}/>
            <Route path='/c/user/communities' element={<ProtectedRoute element={<UserCommunities />} />} />

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