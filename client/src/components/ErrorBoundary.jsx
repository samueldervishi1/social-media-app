import React, { Component } from 'react';
import '../styles/errorBoundary.css';

const MAX_RELOAD_ATTEMPTS = 3;
const SUPPORT_EMAIL = 'support@ch.com';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    reloadAttempts: parseInt(localStorage.getItem('reloadAttempts') || '0', 2),
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error captured:', error, errorInfo);
  }

  handleReload = () => {
    const newAttempts = this.state.reloadAttempts + 1;
    localStorage.setItem('reloadAttempts', newAttempts);

    if (newAttempts >= MAX_RELOAD_ATTEMPTS) {
      this.setState({ reloadAttempts: 0 });
      localStorage.removeItem('reloadAttempts');
    } else {
      window.location.reload();
    }
  };

  render() {
    const { hasError, reloadAttempts } = this.state;
    const { children } = this.props;

    if (!hasError) return children;

    return (
      <div className='error-boundary-container'>
        <h1 className='error-heading'>Oops! Something went wrong.</h1>
        <p className='error-message'>
          We're sorry for the inconvenience. Please try reloading the page. If
          reloading still doesn't work, please contact the admin at
          <a href={`mailto:${SUPPORT_EMAIL}`}> {SUPPORT_EMAIL}</a>.
        </p>
        <button className='reload-button' onClick={this.handleReload}>
          Reload Page.
        </button>
        {reloadAttempts >= MAX_RELOAD_ATTEMPTS && (
          <div className='contact-admin'>
            <p>
              If reloading still doesn't work, please contact the admin at
              <a href={`mailto:${SUPPORT_EMAIL}`}> {SUPPORT_EMAIL}</a>.
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;