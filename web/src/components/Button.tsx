import './Button.css'

interface Props {
  onClick: () => void;
  kind: 'primary' | 'secondary' | 'danger'
  children: string;
}

export function Button(props: Props) {
  return (
    <button class={`button ${props.kind}`} onClick={props.onClick}>
      {props.children}
    </button>
  )
}