import { LogWindow } from './LogWindow'
import { StatRow } from './StatRow'

import './Monitor.css'
interface Props {
  path: string;
  id?: string;
}

export function Monitor(props: Props) {
  return (
    <div class="monitor">
      <h1>Monitor</h1>

      <div class="monitor-content">
        <StatRow id={props.id} />
        <LogWindow id={props.id} />
      </div>
    </div>
  )
}