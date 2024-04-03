import { useEffect, useState } from 'preact/hooks'
import { getContainers, Container, Status, getStatus, stopContainer, startContainer } from '../../util/docker'
import './ManageList.css'
import { Icon } from '../../util/icon'
import { route } from 'preact-router'

interface Props {
  path: string;
}

interface CardProps extends Container {
  onClick: () => void;
}

export function ManageList(props: Props) {
  const [containers, setContainers]  = useState([])

  useEffect(() => {
    (async () => {
      setContainers(await getContainers())
    })()
  }, [])

  return (
    <div class="manage-list">
      <h1>Servers</h1>

      <div class="server-list">
        {
          containers.length > 0 ? containers.map(c => (
            <ServerCard {...c} onClick={() => console.log('clicked')} />
          )) : (
            <span class="no-servers">You haven't deployed any servers yet. Why don't you give it a try?</span>
          )
        }
      </div>
    </div>
  )
}

function ServerCard(props: CardProps) {
  const [details, setDetails] = useState({
    icon: '/server_default.png',
    online: false,
    players: 0,
    max_players: 0,
  } as Status)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    (async () => {
      setDetails(await getStatus(props.id))

      // Every 3 seconds, update the status
      const updateIntv = setInterval(async () => {
        setDetails(await getStatus(props.id))
      }, 3000)

      // Cleanup interval
      return () => clearInterval(updateIntv)
    })()
  }, [])

  return (
    <div
      class="server-card"
      onClick={props.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={`background-image: url(${details.icon})`}
    >
      <div class={`${details.online ? 'online' : 'offline'}-indicator`} />
      <div class="card-content">
        {
          hovered ? (
            <div class="card-controls">
              {
                details.online ? (
                  <Icon
                    icon="pause"
                    onClick={() => {
                      stopContainer(props.id)
                    }}
                  />
                ) : (
                  <Icon
                    icon="play"
                    onClick={() => {
                      startContainer(props.id)
                    }}
                  />
                )
              }

              <Icon
                icon="wrench"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-dialog', {
                    detail: {
                      kind: 'config',
                      data: {
                        id: props.id
                      }
                    }
                  }))
                }}
              />

              <Icon
                icon="terminal"
                onClick={() => {
                  route(`/monitor/${props.id}`)
                }}
              />
            </div>
          ) : (
            <div class="card-details">
              <div class="card-title">
                <span>{props.name.replace(/^\//, '')}</span>
              </div>

              <div class="card-players">
                <span>{details.players} / {details.max_players} players online</span>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}