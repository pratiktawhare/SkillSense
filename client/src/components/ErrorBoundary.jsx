import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                        style={{
                            background: 'color-mix(in srgb, var(--error) 15%, transparent)',
                            color: 'var(--error)'
                        }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Something went wrong
                    </h3>
                    <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
                        {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                    </p>
                    <button onClick={this.handleRetry} className="btn-primary">
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
