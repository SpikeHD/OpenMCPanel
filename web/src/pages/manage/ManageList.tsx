import { useEffect, useState } from 'preact/hooks';
import { getContainers, Container, Status } from '../../util/docker';
import './ManageList.css'

interface Props {
  path: string;
}

interface CardProps extends Container {
  onClick: () => void;
}

export function ManageList(props: Props) {
  const [containers, setContainers]  = useState([])

  useEffect(() => {
    ;(async () => {
      setContainers(await getContainers())
    })()
  }, [])

  return (
    <div class="manage-list">
      <h1>Servers</h1>

      <div class="server-list">
        {
          containers.map(c => (
            <ServerCard {...c} onClick={() => console.log('clicked')} />
          ))
        }
      </div>
    </div>
  )
}

function ServerCard(props: CardProps) {
  const [details, setDetails] = useState({} as Status)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    ;(async () => {
      // TODO get icon and stuff
    }) 
  }, [])

  return (
    <div
      class="server-card"
      onClick={props.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div class="card-img">
        <img src={details.icon} />
      </div>

      <div class="card-content">
        {
          hovered ? (
            <div class="card-controls">
              <div class="manage-button">Configure</div>
            </div>
          ) : (
            <div class="card-title">
              <span>{props.name}</span>
            </div>
          )
        }
      </div>
    </div>
  )
}