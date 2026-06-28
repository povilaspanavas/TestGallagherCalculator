export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Probability Calculator home">
        <span className="brand-mark" aria-hidden="true">
          P
        </span>
        <span>Probability Calculator</span>
      </a>
      <span className="api-status">
        <span className="status-dot" aria-hidden="true" />
        Calculator ready
      </span>
    </header>
  )
}
