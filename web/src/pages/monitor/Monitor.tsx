import { useRef } from 'preact/hooks'
import { sendCommand } from '../../util/docker'
import { LogWindow } from './LogWindow'
import { StatRow } from './StatRow'

import './Monitor.css'
interface Props {
  path: string;
  id?: string;
}

export function Monitor(props: Props) {
  const ref = useRef(null)
  const submitCommand = async () => {
    // TODO error handle
    await sendCommand(props.id, ref.current.value)

    ref.current.value = ''
  }

  return (
    <div class="monitor">
      <h1>Monitor</h1>

      <div class="monitor-content">
        <StatRow id={props.id} />
        <LogWindow id={props.id} />

        <div class="command-input">
          <input
            ref={ref}
            type="text"
            placeholder="/command ..."
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                submitCommand()
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}