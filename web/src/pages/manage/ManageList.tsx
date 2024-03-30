import './Manage.css'

interface Props {
  path: string;
}

export function ManageList(props: Props) {
  return (
    <div class="manage0list">
      <h1>Manage list</h1>
      <p>List of servers to manage</p>
    </div>
  )
}