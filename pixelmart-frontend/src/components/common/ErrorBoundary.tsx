import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: 480,
            margin: '4rem auto',
            padding: '1.5rem',
            border: '1px solid var(--border, #ddd)',
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          <h1>Something went wrong</h1>
          <p>Try refreshing the page. If the problem persists, sign out and sign back in.</p>
          <button type="button" onClick={() => window.location.assign('/')}>
            Back to home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
