use async_std::stream::StreamExt;
use bollard::{
  container::CreateContainerOptions,
  container::StartContainerOptions,
  image::CreateImageOptions
};
use serde::Serialize;

use crate::{log, web::api::DeploymentConfig};

#[derive(Serialize)]
pub struct Container {
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

    container_result.push(Container {
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

pub async fn stop_minecraft_container(name: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let docker = bollard::Docker::connect_with_local_defaults().unwrap();
  let containers = docker.list_containers::<String>(None).await.unwrap();

  // Names have a / in front of them
  let name = format!("/{}", name);

  for container in containers {
    if container.names.unwrap_or_default().contains(&name.to_string()) {
      if let Some(id) = container.id {
        docker.stop_container(&id, None).await?;
        return Ok(());
      }
    }
  }

  Err("Container not found".into())
}