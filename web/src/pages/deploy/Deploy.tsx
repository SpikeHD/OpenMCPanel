import './Deploy.css'

interface Props {
  path: string;
}

export function Deploy(props: Props) {
  return (
    <div class="deploy">
      <h1>Deploy</h1>
      <p>Deploy a server</p>
    </div>
  )
}