import { JSX } from 'preact/jsx-runtime'
import './Dialog.css'
import { closeDialog } from '../util/dialog'

interface Props {
  children: JSX.Element | JSX.Element[] | string;
  onClose?: () => void;
}

export function Dialog(props: Props) {
  const onClose = () => {
    closeDialog()
    props?.onClose?.()
  }

  return (
    <>
      <div class="dialog">
        {props.children}
      </div>
      <div class="dialog-backdrop" onClick={onClose}></div>
    </>
  )
}