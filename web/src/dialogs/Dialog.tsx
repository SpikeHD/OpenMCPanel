import { JSX } from 'preact/jsx-runtime';
import './Dialog.css'

interface Props {
  children: JSX.Element | JSX.Element[];
  onClose: () => void;
}

export function Dialog(props: Props) {
  return (
    <>
      <div class="dialog">
        {props.children}
      </div>
      <div class="dialog-backdrop" onClick={props.onClose}></div>
    </>
  )
}