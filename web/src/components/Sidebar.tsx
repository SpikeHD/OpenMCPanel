import Router, { Link } from 'preact-router'

import './Sidebar.css'

export function Sidebar() {
  return (
    <div class="sidebar">
      <div class="sidebar-icon">

      </div>

      <Link href="/manage" class="sidebar-item">Servers</Link>
      <Link href="/deploy" class="sidebar-item deploy">Deploy</Link>
    </div>
  )
}