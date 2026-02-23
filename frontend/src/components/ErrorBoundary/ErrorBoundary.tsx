import { Component, type ReactNode } from "react";
import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p>We're sorry, but something unexpected happened.</p>
            {this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
            <div className="error-actions">
              <button onClick={this.handleRetry} className="btn btn-primary">
                Try Again
              </button>
              <button onClick={() => window.location.href = "/"} className="btn btn-secondary">
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
