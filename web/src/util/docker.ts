export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
}

export interface Status {
  icon: string;
  online: boolean;
  players: number;
  max_players: number;
  motd: string;
  container_id: string;
  container_name: string;
  container_status: string;
}

export async function getContainers() {
  const result = await fetch('/api/containers/all')
  return result.json() as Promise<Container[]>
}

export async function getRunningContainers() {
  const result = await fetch('/api/containers/running')
  return result.json() as Promise<Container[]>
}

export async function getStatus(id: string) {
  const result = await fetch(`/api/container/${id}`)
  return result.json() as Promise<Status>
}