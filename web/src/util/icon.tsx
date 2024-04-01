import { JSX } from 'preact'

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
  icon: string;
}

export function Icon(props: Props) {
  // Setup div with SVG mask, so background-color changes the icon color
  return (
    <div
      class="icon"
      style={`
        mask: url(/icons/${props.icon}.svg) no-repeat center / contain;
        -webkit-mask: url(/icons/${props.icon}.svg) no-repeat center / contain;
        background-color: var(--text);
      `}
      {...props}></div>
  )
}