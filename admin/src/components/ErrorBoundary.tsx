import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-alert">
          <div className="error-alert-icon">⚠️</div>
          <div className="error-alert-content">
            <h3>Noe gikk galt</h3>
            <p>En uventet feil oppstod. Prøv å oppdatere siden.</p>
            {import.meta.env.DEV && (
              <details className="error-details">
                <summary>Detaljer</summary>
                <pre>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
