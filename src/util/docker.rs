use async_std::stream::StreamExt;
use bollard::{
  container::{CreateContainerOptions, ListContainersOptions, StartContainerOptions},
  exec::{CreateExecOptions, StartExecOptions, StartExecResults},
  image::CreateImageOptions,
};
use serde::Serialize;

use crate::{log, web::api::DeploymentConfig};

#[derive(Serialize)]
pub struct Container {
  pub id: String,
  pub image: String,
  pub name: String,
  pub status: String,
}

#[derive(Serialize, Default)]
pub struct Status {
  pub icon: String,
  pub online: bool,
  pub players: i64,
  pub max_players: i64,
  pub motd: String,
  pub container_id: String,
  pub container_name: String,
  pub container_status: String,
}

static IMAGE: &str = "itzg/minecraft-server";

pub async fn init() {
  // Pull the image so we can use it
  let docker = bollard::Docker::connect_with_local_defaults().expect("Failed to connect to Docker");
  let stream = docker.create_image(
    Some(CreateImageOptions {
      from_image: IMAGE,
      tag: "latest",
      ..Default::default()
    }),
    None,
    None,
  );

  let stream = stream.for_each(|output| {
    log!("{}", output.unwrap().status.unwrap());
  });

  stream.await;
}

pub async fn get_minecraft_containers(
  all: bool,
) -> Result<Vec<Container>, Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults()?;
  let containers = docker
    .list_containers::<String>(Some(ListContainersOptions {
      all,
      ..Default::default()
    }))
    .await?;
  let mut container_result = vec![];

  for container in containers {
    let default_name = "".to_string();
    let image = container.image.unwrap_or_default();
    let name = container.names.unwrap_or_default();
    let name = name.first().unwrap_or(&default_name);
    let status = container.status.unwrap_or_default();
    let id = container.id.unwrap_or_default();

    // If the image is not the minecraft image, skip it
    // TODO allow custom images
    if !image.contains(IMAGE) {
      continue;
    }

    container_result.push(Container {
      id,
      image,
      name: name.to_string(),
      status,
    });
  }

  Ok(container_result)
}

pub async fn get_status(id: &str) -> Result<Status, Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let containers = docker
    .list_containers::<String>(Some(ListContainersOptions {
      all: true,
      ..Default::default()
    }))
    .await
    .unwrap();
  let mut server_status = Status {
    icon: "".to_string(),
    online: false,
    players: 0,
    max_players: 0,
    motd: "".to_string(),
    container_id: id.to_string(),
    container_name: "".to_string(),
    container_status: "".to_string(),
  };

  for container in containers {
    if container.id.unwrap_or_default() != id {
      continue;
    }

    server_status.container_id = id.to_string();
    server_status.container_name = container
      .names
      .unwrap_or_default()
      .first()
      .unwrap_or(&"".to_string())
      .to_string();
    server_status.container_status = container.state.unwrap_or_default();

    if server_status.container_status != "running" {
      return Ok(server_status);
    }

    // If state is running, use mcping to get other info
    // Get the network info (ie. port) from the container
    let ports = container.ports.unwrap_or_default();
    let port = ports.first();

    if let Some(port) = port {
      let port = port.public_port.unwrap_or_default();
      let address = format!("127.0.0.1:{}", port);
      let address = address.as_str();
      let result = mcping::get_status(address, None);

      match result {
        Ok(status) => {
          let status = status.1;
          server_status.icon = status.favicon.clone().unwrap_or_default();
          server_status.online = true;
          server_status.players = status.players.online;
          server_status.max_players = status.players.max;
          server_status.motd = status.description.text().to_string();
        }
        Err(e) => {
          log!("Failed to get status: {}", e);
        }
      };

      return Ok(server_status);
    } else {
      // Not network-accessible??
      server_status.container_status = "not accessible".to_string();

      return Ok(server_status);
    }
  }

  Err("Container not found".into())
}

pub async fn deploy_minecraft_container(
  opts: &DeploymentConfig,
) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults()?;
  let mut create_opts = bollard::container::Config {
    image: Some(IMAGE.to_string()),
    env: Some(vec![
      "EULA=true".to_string(),
      format!("VERSION={}", opts.version),
      format!("TYPE={}", opts.kind),
      format!("PORT={}", opts.port.to_string()),
    ]),
    host_config: Some(bollard::models::HostConfig {
      port_bindings: Some(
        vec![(
          "25565/tcp".to_string(),
          Some(vec![bollard::models::PortBinding {
            host_ip: None,
            host_port: Some(opts.port.to_string()),
          }]),
        )]
        .into_iter()
        .collect(),
      ),
      ..Default::default()
    }),
    ..Default::default()
  };

  if let Some(modpack_id) = &opts.modpack_id {
    create_opts
      .env
      .as_mut()
      .unwrap()
      .push(format!("MODPACK_ID={}", modpack_id));
  }

  if let Some(additional_options) = &opts.additional_options {
    for (key, value) in additional_options {
      create_opts
        .env
        .as_mut()
        .unwrap()
        .push(format!("{}={}", key, value));
    }
  }

  let container = docker
    .create_container(
      Some(CreateContainerOptions {
        name: opts.name.clone(),
        platform: Some("linux".to_string()),
      }),
      create_opts,
    )
    .await?;

  docker
    .start_container(&container.id, None::<StartContainerOptions<String>>)
    .await?;

  Ok(container.id)
}

pub async fn start_minecraft_container(
  id: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let containers = docker
    .list_containers::<String>(Some(ListContainersOptions {
      all: true,
      ..Default::default()
    }))
    .await
    .unwrap();

  for container in containers {
    if container.id.unwrap_or_default() == id {
      docker
        .start_container(id, None::<StartContainerOptions<String>>)
        .await?;
      return Ok(());
    }
  }

  Err("Container not found".into())
}

pub async fn stop_minecraft_container(
  id: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let containers = docker
    .list_containers::<String>(Some(ListContainersOptions {
      all: true,
      ..Default::default()
    }))
    .await
    .unwrap();

  for container in containers {
    if container.id.unwrap_or_default() == id {
      docker.stop_container(id, None).await?;
      return Ok(());
    }
  }

  Err("Container not found".into())
}

pub async fn destroy_minecraft_container(
  id: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let containers = docker
    .list_containers::<String>(Some(ListContainersOptions {
      all: true,
      ..Default::default()
    }))
    .await
    .unwrap();

  for container in containers {
    if container.id.unwrap_or_default() == id {
      docker.stop_container(id, None).await?;
      docker.remove_container(id, None).await?;
      return Ok(());
    }
  }

  Err("Container not found".into())
}

pub async fn run_in_container(
  id: &str,
  command: &[String],
) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  // rcon-cli <command>
  // TODO allow disabling RCON, and account for it here using the mc-send-to-console script
  let exec = docker
    .create_exec(
      id,
      CreateExecOptions {
        cmd: Some(vec!["rcon-cli".to_string(), command.join(" ")]),
        attach_stdout: Some(true),
        attach_stderr: Some(true),
        ..Default::default()
      },
    )
    .await?;

  let results = docker
    .start_exec(
      &exec.id,
      Some(StartExecOptions {
        detach: false,
        ..Default::default()
      }),
    )
    .await?;

  match results {
    StartExecResults::Attached { output, .. } => {
      let mut output = output;
      let mut result = String::new();

      while let Some(data) = output.next().await {
        result.push_str(data?.to_string().as_str());
      }

      Ok(result)
    }
    StartExecResults::Detached => Ok("Detached".to_string()),
  }
}
