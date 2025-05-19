/**
 * @fileoverview Error Boundary component for handling React component errors gracefully
 * Provides fallback UI and error recovery mechanisms
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import '../styles/errorBoundary.css';

// Constants
const MAX_RELOAD_ATTEMPTS = 3;
const SUPPORT_EMAIL = 'support@ch.com';
const STORAGE_KEY = 'reloadAttempts';

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - Child components to be rendered
 * @property {Function} [onError] - Optional callback for error handling
 */

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError - Indicates if an error has occurred
 * @property {number} reloadAttempts - Number of times page reload has been attempted
 * @property {string} [errorMessage] - Optional error message to display
 */

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI
 * @extends {Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
class ErrorBoundary extends Component {
  /**
   * @type {ErrorBoundaryState}
   */
  state = {
    hasError: false,
    reloadAttempts: this.getStoredAttempts(),
    errorMessage: null,
  };

  /**
   * Retrieves stored reload attempts from localStorage
   * @returns {number} Number of stored reload attempts
   * @private
   */
  getStoredAttempts() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return 0;
    }
  }

  /**
   * Updates error state when an error occurs
   * @param {Error} error - The error that was caught
   * @returns {ErrorBoundaryState} New state object
   * @static
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred',
    };
  }

  /**
   * Handles error logging and optional error callback
   * @param {Error} error - The error that was caught
   * @param {React.ErrorInfo} errorInfo - React error information
   */
  componentDidCatch(error, errorInfo) {
    console.error('Error captured in ErrorBoundary:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Call optional error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Handles page reload and tracks attempts
   * @returns {void}
   */
  handleReload = () => {
    try {
      const newAttempts = this.state.reloadAttempts + 1;
      localStorage.setItem(STORAGE_KEY, String(newAttempts));

      if (newAttempts >= MAX_RELOAD_ATTEMPTS) {
        this.setState({ reloadAttempts: 0 });
        localStorage.removeItem(STORAGE_KEY);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to handle reload:', error);
      // Fallback to basic reload if localStorage fails
      window.location.reload();
    }
  };

  /**
   * Renders the error UI or children components
   * @returns {JSX.Element} The rendered component
   */
  render() {
    const { hasError, reloadAttempts, errorMessage } = this.state;
    const { children } = this.props;

    if (!hasError) return children;

    return (
      <div className='error-boundary-container' role='alert'>
        <h1 className='error-heading'>Oops! Something went wrong.</h1>
        {errorMessage && <p className='error-details'>{errorMessage}</p>}
        <p className='error-message'>
          We're sorry for the inconvenience. Please try reloading the page.
        </p>
        <button
          className='reload-button'
          onClick={this.handleReload}
          disabled={reloadAttempts >= MAX_RELOAD_ATTEMPTS}
        >
          {reloadAttempts >= MAX_RELOAD_ATTEMPTS
            ? 'Too many reload attempts'
            : 'Reload Page'}
        </button>
        {reloadAttempts >= MAX_RELOAD_ATTEMPTS && (
          <div className='contact-admin'>
            <p>
              Please contact our support team for assistance at
              <a href={`mailto:${SUPPORT_EMAIL}`} className='support-link'>
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
};

export default ErrorBoundary;