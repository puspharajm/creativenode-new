import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Using a standard class component with explicit type parameters
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // eslint-disable-next-line react/state-in-constructor
    (this as any).state = { hasError: false } as State;
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render(): ReactNode {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      return props.fallback ?? (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#fff', padding: '2rem' }}>
          <div style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ marginBottom: '1rem', color: '#a1a1aa' }}>An unexpected rendering error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.5rem 1.5rem', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer' }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return props.children;
  }
}
