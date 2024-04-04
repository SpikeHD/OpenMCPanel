import './ConfigDialog.css'
import { Dialog } from './Dialog'

interface Props {
  id: string;
  name: string;
}

export function ConfigDialog(props: Props) {
  return (
    <Dialog>
      <h2>Configuring {props.name}</h2>
    </Dialog>
  )
}