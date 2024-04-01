import './ConfigDialog.css'
import { Dialog } from './Dialog';

interface Props {
  id: string;
}

export function ConfigDialog(props: Props) {
  return (
    <Dialog onClose={() => {
      window.dispatchEvent(new CustomEvent('close-dialog'))
    }}>
      <h2>Configuring {props.id}</h2>
    </Dialog>
  )
}