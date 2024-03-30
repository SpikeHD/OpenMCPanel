import './Manage.css'

interface Props {
  path: string;
  id?: string;
}

export function Manage(props: Props) {
  return (
    <div class="manage">
      <h1>Manage</h1>
      <p>Manage server</p>
    </div>
  )
}