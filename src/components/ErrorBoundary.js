// Enhanced Error boundary component for React
import React, { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0,
            isRetrying: false,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, errorId: Date.now() };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);

        // Report to error tracking service (if available)
        this.reportError(error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    reportError = (error, errorInfo) => {
        // In a real app, you'd send this to an error tracking service like Sentry
        const errorReport = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: 'anonymous', // In real app, get from auth context
            retryCount: this.state.retryCount
        };

        // For now, just log to console (replace with actual error service)
        console.group('🚨 Error Report');
        console.error('Error Details:', errorReport);
        console.groupEnd();

        // You could send to an API endpoint here
        // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
    }

    handleRetry = () => {
        this.setState({
            isRetrying: true,
            retryCount: this.state.retryCount + 1
        });

        // Simulate retry delay
        setTimeout(() => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                isRetrying: false
            });
        }, 1000);
    }

    handleReload = () => {
        window.location.reload();
    }

    handleGoHome = () => {
        window.location.href = '/';
    }

    getErrorMessage = () => {
        const { error } = this.state;
        const { fallbackMessage } = this.props;

        if (fallbackMessage) return fallbackMessage;

        // Provide user-friendly messages based on error type
        if (error?.message?.includes('ChunkLoadError')) {
            return "We've updated the app. Please refresh to get the latest version.";
        }
        if (error?.message?.includes('Network')) {
            return "There seems to be a connection issue. Please check your internet and try again.";
        }
        if (error?.message?.includes('Loading')) {
            return "We're having trouble loading this content. Please try again.";
        }

        return "Something unexpected happened. Don't worry, we're on it!";
    }

    render() {
        if (this.state.hasError) {
            const { retryCount, isRetrying, errorId } = this.state;
            const { showDetails = false, allowRetry = true, level = 'page' } = this.props;
            const errorMessage = this.getErrorMessage();
            const canRetry = allowRetry && retryCount < 3;

            return (
                <div className={`error-boundary error-boundary--${level}`} role="alert">
                    <div className="error-boundary__content">
                        <div className="error-boundary__icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>

                        <h2 className="error-boundary__title">
                            {level === 'component' ? 'Component Error' : 'Oops! Something went wrong'}
                        </h2>

                        <p className="error-boundary__message">
                            {errorMessage}
                        </p>

                        {retryCount > 0 && (
                            <p className="error-boundary__retry-info">
                                Retry attempt: {retryCount}/3
                            </p>
                        )}

                        <div className="error-boundary__actions">
                            {canRetry && (
                                <button
                                    onClick={this.handleRetry}
                                    disabled={isRetrying}
                                    className="error-boundary__button error-boundary__button--primary"
                                    aria-label="Try again"
                                >
                                    {isRetrying ? (
                                        <>
                                            <span className="error-boundary__spinner"></span>
                                            Retrying...
                                        </>
                                    ) : (
                                        'Try Again'
                                    )}
                                </button>
                            )}

                            <button
                                onClick={this.handleReload}
                                className="error-boundary__button error-boundary__button--secondary"
                                aria-label="Refresh the page"
                            >
                                Refresh Page
                            </button>

                            {level === 'page' && (
                                <button
                                    onClick={this.handleGoHome}
                                    className="error-boundary__button error-boundary__button--tertiary"
                                    aria-label="Go to home page"
                                >
                                    Go Home
                                </button>
                            )}
                        </div>

                        {showDetails && this.state.error && (
                            <details className="error-boundary__details">
                                <summary>Technical Details</summary>
                                <div className="error-boundary__error-info">
                                    <p><strong>Error ID:</strong> {errorId}</p>
                                    <p><strong>Error:</strong> {this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <div>
                                            <strong>Component Stack:</strong>
                                            <pre>{this.state.errorInfo.componentStack}</pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="error-boundary__help">
                            <p>If this problem persists, please <a href="/contact">contact support</a> with error ID: {errorId}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
