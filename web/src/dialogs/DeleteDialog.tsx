import { Dialog } from './Dialog'
import './DeleteDialog.css'
import { closeDialog } from '../util/dialog'

interface Props {
  name: string;
  onDelete: () => void;
}

export function DeleteDialog(props: Props) {
  return (
    <Dialog>
      <h2>Delete {props.name}</h2>
      <p>Are you sure you want to delete {props.name}?</p>
      <div class="dialog-buttons">
        <button class="danger"  onClick={props.onDelete}>Delete</button>
        <button onClick={() => {
          closeDialog()
        }}>Cancel</button>
      </div>
    </Dialog>
  )
}