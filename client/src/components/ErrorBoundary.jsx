import React, { Component } from 'react';
import '../styles/errorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    const storedAttempts = localStorage.getItem('reloadAttempts');
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      reloadAttempts: storedAttempts ? parseInt(storedAttempts, 10) : 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error captured:', error, errorInfo);
  }

  handleReload = () => {
    const { reloadAttempts } = this.state;
    const newAttempts = reloadAttempts + 1;

    localStorage.setItem('reloadAttempts', newAttempts);

    if (newAttempts >= 3) {
      this.setState({ reloadAttempts: 0 });
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary-container'>
          <h1 className='error-heading'>Oops! Something went wrong.</h1>
          <p className='error-message'>
            We're sorry for the inconvenience. Please try reloading the page.
          </p>
          <button className='reload-button' onClick={this.handleReload}>
            Reload Page
          </button>
          {this.state.reloadAttempts >= 3 && (
            <div className='contact-admin'>
              <p>
                If reloading still doesn't work, please contact the admin at
                <a href='mailto:support@chyra.com'> support@chyra.com</a>.
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;