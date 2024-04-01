import './Monitor.css'

interface Props {
  path: string;
  id?: string;
}

export function Monitor(props: Props) {
  return (
    <div class="monitor">
      <h1>Monitor</h1>
      <p>Monitor a server</p>
    </div>
  )
}