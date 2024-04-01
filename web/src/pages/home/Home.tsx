import './Home.css'

interface Props {
  path: string;
}

export function Home(props: Props) {
  return (
    <div class="home">
      <h1>Home</h1>
      <p>Homepage :D</p>
    </div>
  )
}