import { Component } from 'react'

// Without a boundary, any exception while rendering (e.g. an unexpected API
// shape) unmounts the whole React tree and the visitor just sees a blank page.
export default class ErrorBoundary extends Component {
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

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div style={{ maxWidth: 480, margin: '15vh auto', padding: 24, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
          The page hit an unexpected error. Please reload; if it keeps happening, try again in a few minutes.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: '#1b596a', color: '#fff', border: 0, cursor: 'pointer' }}
        >
          Reload
        </button>
      </div>
    )
  }
}
