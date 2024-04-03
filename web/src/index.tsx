import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import Router, { CustomHistory } from 'preact-router'
import { createHashHistory } from 'history'

import { Deploy } from './pages/deploy/Deploy'
import { ManageList } from './pages/manage/ManageList'
import { Sidebar } from './components/Sidebar'
import { Monitor } from './pages/monitor/Monitor'
import { Home } from './pages/home/Home'

import './style.css'
import { ConfigDialog } from './dialogs/ConfigDialog'
import { Dialog } from './dialogs/Dialog'

interface Dialog {
  kind: 'deploy' | 'config' | 'general'
  data: unknown
}

export function App() {
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    const dialogFn = (e: CustomEvent<Dialog>) => {
      setDialog(e.detail)
    }
    const dialogCloseFn = () => {
      setDialog(null)
    }

    window.addEventListener('open-dialog', dialogFn)
    window.addEventListener('close-dialog', dialogCloseFn)

    return () => {
      window.removeEventListener('open-dialog', dialogFn)
      window.removeEventListener('close-dialog', dialogCloseFn)
    }
  }, [])

  return (
    <>
      <Sidebar />

      <div id="content">
        <Router history={createHashHistory() as unknown as CustomHistory}>
          <Home path="/" />
          <Deploy path="/deploy" />
          <Monitor path="/monitor/:id" />
          <ManageList path="/manage" />
        </Router>
      </div>

      {
        dialog && (() => {
          switch (dialog.kind) {
          case 'config':
            return <ConfigDialog id={dialog.data.id} />
          case 'general':
            return <Dialog>{dialog.data as string}</Dialog>
          }
        })()
      }
    </>
  )
}

render(<App />, document.getElementById('app'))
