import { Component } from 'react'
import { useLocation } from 'react-router-dom'

// Without a boundary, any exception while rendering (e.g. an unexpected API
// shape) unmounts the whole React tree and the visitor just sees a blank page.
class Boundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error('[knovix] render error:', error, info?.componentStack)
  }

  // Navigating to another page clears the error, so one broken page doesn't
  // leave the whole site stuck on "Something went wrong" until a hard reload.
  componentDidUpdate(prevProps) {
    if (this.state.failed && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ failed: false })
    }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" style={{ maxWidth: 480, margin: '15vh auto', padding: 24, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
          The page hit an unexpected error. Please reload, or go back to the home page.
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', borderRadius: 8, background: '#1b596a', color: '#fff', border: 0, cursor: 'pointer' }}
          >
            Reload
          </button>
          <a
            href="/"
            style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #1b596a', color: '#1b596a', textDecoration: 'none' }}
          >
            Home
          </a>
        </div>
      </div>
    )
  }
}

export default function ErrorBoundary({ children }) {
  const { pathname } = useLocation()
  return <Boundary resetKey={pathname}>{children}</Boundary>
}
