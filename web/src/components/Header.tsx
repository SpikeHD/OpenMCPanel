import Router, { Link } from 'preact-router'

import './Header.css'

export function Header() {
  return (
    <div class="header">
      <Link href="/" class="header-link">Home</Link>
      <Link href="/deploy" class="header-link">Deploy</Link>
      <Link href="/manage" class="header-link">Manage</Link>
    </div>
  )
}