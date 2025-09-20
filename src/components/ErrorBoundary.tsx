import React from 'react';
import { AlertTriangle, RefreshCw, Home, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Chemistry Lab Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (import.meta.env.PROD) {
      // You can integrate with services like Sentry here
      console.error('Production error:', { error, errorInfo, timestamp: new Date().toISOString() });
    }
    
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 bg-card/95 backdrop-blur-lg border-destructive/20 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <AlertTriangle className="w-16 h-16 text-destructive animate-pulse" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  🧪 Chemistry Lab Error
                </h1>
                <p className="text-muted-foreground">
                  Something went wrong in the chemistry lab simulation. Don't worry, this happens in real labs too!
                </p>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="text-left bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <summary className="cursor-pointer text-sm font-medium text-destructive mb-2">
                    🔍 Technical Details (Development)
                  </summary>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://github.com/Jes-win-hac-ker/browser-lab-experiments/issues', '_blank')}
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  Report Issue
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Try refreshing the page</p>
                <p>• Clear your browser cache</p>
                <p>• Check your internet connection</p>
                <p>• Report persistent issues on GitHub</p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component for better UX
export const LoadingFallback: React.FC<{ error?: string }> = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <Card className="p-8 bg-card/95 backdrop-blur-lg border border-primary/20 shadow-2xl">
      <div className="text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <h2 className="text-xl font-semibold text-foreground">
          🧪 Loading Chemistry Lab...
        </h2>
        <p className="text-muted-foreground">
          {error || "Preparing your virtual laboratory environment"}
        </p>
      </div>
    </Card>
  </div>
);

// Network error component
export const NetworkError: React.FC<{ retry: () => void }> = ({ retry }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
    <Card className="max-w-md w-full p-8 bg-card/95 backdrop-blur-lg border-orange-500/20 shadow-2xl">
      <div className="text-center space-y-6">
        <div className="text-6xl">🌐</div>
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Connection Problem
          </h1>
          <p className="text-muted-foreground text-sm">
            Unable to connect to the chemistry lab. Please check your internet connection.
          </p>
        </div>
        <Button onClick={retry} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </Card>
  </div>
);

export default ErrorBoundary;
