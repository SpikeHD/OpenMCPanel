use async_std::stream::StreamExt;
use bollard::{
  container::{
    CreateContainerOptions, StartContainerOptions
  },
  exec::{
    CreateExecOptions,
    StartExecOptions, StartExecResults
  },
  image::CreateImageOptions
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

static IMAGE: &str = "itzg/minecraft-server";

pub async fn init() {
  // Pull the image so we can use it
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let stream = docker
    .create_image(
      Some(CreateImageOptions {
        from_image: IMAGE,
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

pub async fn get_minecraft_containers() -> Result<Vec<Container>, Box<dyn std::error::Error + Send + Sync>>{
  let docker = bollard::Docker::connect_with_local_defaults()?;
  let containers = docker.list_containers::<String>(None).await?;
  let mut container_result = vec![];

  for container in containers {
    let default_name = "".to_string();
    let image = container.image.unwrap_or_default();
    let name = container.names.unwrap_or_default();
    let name = name.first().unwrap_or(&default_name);
    let status = container.status.unwrap_or_default();
    let id = container.id.unwrap_or_default();

    container_result.push(Container {
      id,
      image,
      name: name.to_string(),
      status,
    });
  }

  Ok(container_result)
}

pub async fn deploy_minecraft_container(opts: &DeploymentConfig) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
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
    create_opts.env.as_mut().unwrap().push(format!("MODPACK_ID={}", modpack_id));
  }

  if let Some(additional_options) = &opts.additional_options {
    create_opts.env.as_mut().unwrap().extend(additional_options.clone());
  }

  let container = docker.create_container(
    Some(CreateContainerOptions { name: opts.name.clone(), platform: Some("linux".to_string())}),
    create_opts
  ).await?;

  docker.start_container(&container.id, None::<StartContainerOptions<String>>).await?;

  Ok(())
}

pub async fn start_minecraft_container(id: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let containers = docker.list_containers::<String>(None).await.unwrap();

  for container in containers {
    if container.id.unwrap_or_default() == id {
      docker.start_container(id, None::<StartContainerOptions<String>>).await?;
      return Ok(());
    }
  }

  Err("Container not found".into())
}

pub async fn stop_minecraft_container(id: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let containers = docker.list_containers::<String>(None).await.unwrap();

  for container in containers {
    if container.id.unwrap_or_default() == id {
      docker.stop_container(id, None).await?;
      return Ok(());
    }
  }

  Err("Container not found".into())
}

pub async fn run_in_container(id: &str, command: &Vec<String>) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  // rcon-cli <command>
  // TODO allow disabling RCON, and account for it here using the mc-send-to-console script
  let exec = docker.create_exec(
    &id,
    CreateExecOptions {
      cmd: Some(vec![
        "rcon-cli".to_string(),
        command.join(" "),
      ]),
      attach_stdout: Some(true),
      attach_stderr: Some(true),
      ..Default::default()
    },
  ).await?;

  let results = docker.start_exec(
    &exec.id,
    Some(StartExecOptions {
      detach: false,
      ..Default::default()
    })
  ).await?;

  match results {
    StartExecResults::Attached { output, .. } => {
      let mut output = output;
      let mut result = String::new();

      while let Some(data) = output.next().await {
        result.push_str(data?.to_string().as_str());
      }

      Ok(result)
    },
    StartExecResults::Detached => Ok("Detached".to_string()),
  }
}