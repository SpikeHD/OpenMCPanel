import { useEffect, useState } from 'preact/hooks'
import { Resources, getResouces } from '../../util/docker'
import { StatCell } from './StatCell'
import './StatRow.css'

interface Props {
  id: string;
}

export function StatRow(props: Props) {
  const [stats, setStats] = useState({} as Resources)

  useEffect(() => {
    // Initial set
    getResouces(props.id).then(setStats)

    const intv = setInterval(async () => {
      const req = await getResouces(props.id)
      setStats(req)
    }, 3000)

    return () => {
      clearInterval(intv)
    }
  }, [stats])

  return (
    <div class="stat-row">
      <StatCell name="CPU" value={stats.cpu} />
      <StatCell name="Memory Usage" value={stats.memory_usage} />
      <StatCell name="Memory Limit" value={stats.memory_limit} />
      <StatCell name="Network RX" value={stats.network_rx} />
      <StatCell name="Network TX" value={stats.network_tx} />
    </div>
  )
}