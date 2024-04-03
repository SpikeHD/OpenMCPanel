import './StatCell.css'

interface Props {
  name: string;
  value: string | number;
}

export function StatCell(props: Props) {
  const value = props.name === 'CPU' && typeof props.value === 'number' ? cpuToReadable(props.value as number) : byteToReadble(props.value as number)

  return (
    <div class="stat-cell">
      <div class="stat-cell-value">{value}</div>
      <div class="stat-cell-name">{props.name}</div>
    </div>
  )
}

function byteToReadble(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

  if (bytes == 0) return '0 B'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

function cpuToReadable(cpu: number): string {
  return cpu.toFixed(2) + '%'
}