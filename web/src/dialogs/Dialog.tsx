import { JSX } from 'preact/jsx-runtime';
import './Dialog.css'

interface Props {
  children: JSX.Element | JSX.Element[] | string;
  onClose?: () => void;
}

export function Dialog(props: Props) {
  const onClose = () => {
    window.dispatchEvent(new CustomEvent('close-dialog'))
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