import { useEffect, useRef, useState } from 'preact/hooks';
import { getLogs } from '../../util/docker';

import './LogWindow.css'

interface Props {
  id: string;
}

export function LogWindow(props: Props) {
  const [logs, setLogs] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    // TODO maybe do with websockets?
    const intv = setInterval(async () => {
      const req = await getLogs(props.id)

      setLogs(req.message)

      // Autoscroll
      ref.current.scrollTo(0, ref.current.scrollHeight)
    }, 1000)

    return () => clearInterval(intv)
  }, [])

  return (
    <div class="log-window" ref={ref}>
      <pre>{logs}</pre>
    </div>
  )
}