import { useEffect, useRef, useState } from 'preact/hooks'
import { getLogs } from '../../util/docker'

import './LogWindow.css'

interface Props {
  id: string;
}

export function LogWindow(props: Props) {
  const [logs, setLogs] = useState('')
  const [manuallyScrolled, setManuallyScrolled] = useState(false)
  const [lastLogPing, setLastLogPing] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    // TODO maybe do with websockets?
    const intv = setInterval(async () => {
      console.log('intv')
      const req = await getLogs(props.id, lastLogPing)

      setLastLogPing(Date.now())
      setLogs((l) => {
        if (req.message != '' && !l.includes(req.message)) {
          return l + req.message
        }

        return l
      })

      if (!manuallyScrolled) {
        // Autoscroll
        ref.current.scrollTo(0, ref.current.scrollHeight)
      }
    }, 1000)

    // Create scroll event listener
    const scrollListener = () => {
      if (ref.current.scrollTop + ref.current.clientHeight < ref.current.scrollHeight - 10) {
        setManuallyScrolled(true)
      } else {
        setManuallyScrolled(false)
      }
    }

    // apparently "scroll" doesn't work because of how I have the CSS set up, so I have to use "wheel"
    // what da hell
    document.addEventListener('wheel', scrollListener)

    return () => {
      clearInterval(intv)
      document.removeEventListener('wheel', scrollListener)
    }
  }, [manuallyScrolled])

  return (
    <div class="log-window" ref={ref}>
      <pre>
        {logs}
      </pre>
    </div>
  )
}
