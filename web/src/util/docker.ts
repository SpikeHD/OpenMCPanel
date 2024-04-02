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
  const json: Status = await result.json()

  // If icon is empty, set to default
  if (!json.icon) json.icon = '/server_default.png'

  return json
}

export async function startContainer(id: string) {
  await fetch(`/api/start/${id}`, { method: 'POST' })
}

export async function stopContainer(id: string) {
  await fetch(`/api/stop/${id}`, { method: 'POST' })
}

export async function deployContainer(name: string, port: number, kind: string, version: string, options: any) {
  return await fetch(`/api/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      port,
      kind,
      version,
      additional_options: options
    })
  })
}

export async function getLogs(id: string) {
  const result = await fetch(`/api/logs/${id}`)
  return result.json()
}