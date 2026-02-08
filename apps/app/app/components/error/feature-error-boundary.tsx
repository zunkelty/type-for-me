import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorFallback, type ErrorFallbackProps } from "./error-fallback";

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName?: string;
  fallback?: ReactNode;
  fallbackProps?: Partial<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { featureName, onError } = this.props;

    console.error(
      `[${featureName ?? "Feature"}] Error caught by boundary:`,
      error,
      errorInfo,
    );

    onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    const { onReset } = this.props;
    this.setState({ hasError: false, error: null });
    onReset?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, featureName, fallback, fallbackProps } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <ErrorFallback
        title={featureName ? `${featureName} error` : undefined}
        error={error ?? undefined}
        onRetry={this.handleRetry}
        {...fallbackProps}
      />
    );
  }
}
