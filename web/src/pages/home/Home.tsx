import { route } from 'preact-router'
import { Icon } from '../../util/icon'
import './Home.css'

interface Props {
  path: string;
}

export function Home(props: Props) {
  return (
    <div class="home">
      <h1>Home</h1>
      
      <div class="home-content">
        <div class="home-item" onClick={() => {
          route('/deploy')
        }}>
          <Icon icon="plus" />
          <span>DEPLOY A SERVER</span>
        </div>

        <div class="home-item" onClick={() => {
          route('/manage')
        }}>
          <Icon icon="server-cog" />
          <span>MANAGE YOUR SERVERS</span>
        </div>
      </div>
    </div>
  )
}