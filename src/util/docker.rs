use bollard;

use crate::log;

pub async fn get_minecraft_images() -> Result<(), Box<dyn std::error::Error + Send + Sync>>{
  let docker = bollard::Docker::connect_with_local_defaults()?;
  let images = docker.list_images::<String>(None).await?;
  
  for image in images {
    log!("{}", image.id);
  }

  Ok(())
}