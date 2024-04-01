import Router, { Link } from 'preact-router'

import './Sidebar.css'

export function Sidebar() {
  return (
    <div class="sidebar">
      <div class="sidebar-icon">

      </div>

      <Link href="/" class="sidebar-item">
        Home
      </Link>
      <Link href="/manage" class="sidebar-item">Servers</Link>
      <Link href="/monitor" class="sidebar-item">Monitor</Link>
      <Link href="/deploy" class="sidebar-item deploy">Deploy</Link>
    </div>
  )
}