import './ConfigDialog.css'
import { Dialog } from './Dialog';

interface Props {
  id: string;
}

export function ConfigDialog(props: Props) {
  return (
    <Dialog>
      <h2>Configuring {props.id}</h2>
    </Dialog>
  )
}