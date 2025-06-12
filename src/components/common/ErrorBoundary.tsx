import { Component, type VNode, type ComponentChildren } from "preact";
import { useState } from "preact/hooks";

interface ErrorBoundaryProps {
  children: ComponentChildren;
  fallback?: VNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 class="text-lg font-semibold text-red-800 mb-2">
              Algo salió mal
            </h2>
            <p class="text-red-600 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Hook para manejar errores en componentes funcionales
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error) => {
    console.error("Error caught by useErrorHandler:", error);
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
}
