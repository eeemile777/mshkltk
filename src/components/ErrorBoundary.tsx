import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// @ts-ignore - Class component type issues with strict TypeScript config
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // @ts-ignore
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // @ts-ignore
    this.setState({
      errorInfo
    });
  }

  handleReset = (): void => {
    // @ts-ignore
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render(): ReactNode {
    // @ts-ignore
    if (this.state.hasError) {
      // @ts-ignore
      if (this.props.fallback) {
        // @ts-ignore
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-teal via-sky to-navy flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-navy dark:text-text-primary-dark mb-4">
              عذراً، حدث خطأ
            </h1>
            <p className="text-center text-text-secondary dark:text-text-secondary-dark mb-6">
              Sorry, something went wrong
            </p>

            {/* @ts-ignore */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 bg-muted dark:bg-bg-dark p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-semibold text-navy dark:text-text-primary-dark mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto text-red-600 dark:text-red-400">
                  {/* @ts-ignore */}
                  {this.state.error.toString()}
                  {/* @ts-ignore */}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal-dark transition-colors"
              >
                إعادة تحميل التطبيق / Reload App
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-muted dark:bg-surface-dark text-navy dark:text-text-primary-dark rounded-xl font-semibold hover:bg-border-light dark:hover:bg-border-dark transition-colors"
              >
                العودة / Go Back
              </button>
            </div>

            <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark mt-6">
              إذا استمرت المشكلة، يُرجى الاتصال بالدعم الفني
              <br />
              If the problem persists, please contact support
            </p>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
