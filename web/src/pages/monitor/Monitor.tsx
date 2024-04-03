import { useState } from 'preact/hooks'
import './Monitor.css'
import { LogWindow } from './LogWindow'

interface Props {
  path: string;
  id?: string;
}

export function Monitor(props: Props) {
  const [logs, setLogs] = useState('')
  const [stats, setStats] = useState({})

  return (
    <div class="monitor">
      <h1>Monitor</h1>

      <div class="monitor-content">
        { /* TODO stats (cpu/ram/etc) */ }
        <LogWindow id={props.id} />
      </div>
    </div>
  )
}