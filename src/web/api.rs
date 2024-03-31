use tide::Server;
use serde::{Deserialize, Serialize};

use crate::{log, util::docker};

use super::server::State;

#[derive(Deserialize)]
pub struct DeploymentConfig {
  pub name: String,
  pub port: u16,
  pub kind: String,
  pub version: String,
  pub modpack_id: Option<String>,
  pub additional_options: Option<Vec<String>>,
  pub rcon_on_start: Option<Vec<String>>,
  pub rcon_on_connect: Option<Vec<String>>,
  pub rcon_on_disconnect: Option<Vec<String>>,
  pub rcon_on_first_connect: Option<Vec<String>>,
  pub rcon_on_last_disconnect: Option<Vec<String>>,
}

#[derive(Serialize)]
struct DockerResult {
  success: bool,
  message: String,
}

pub fn register_routes(app: &mut Server<State>) {
  app.at("/api/running_containers").get(|_| async {
    let containers = match docker::get_minecraft_containers().await {
      Ok(containers) => containers,
      Err(e) => {
        log!("Failed to get containers: {}", e);
        vec![]
      },
    };

    let mut response = tide::Response::new(200);
    response.set_body(serde_json::to_string(&containers).unwrap_or_default());

    Ok(response)
  });

  app.at("/api/deploy").post(|mut req: tide::Request<State>| async move {
    let opts: DeploymentConfig = req.body_json().await.expect("Failed to parse JSON");

    let result = match docker::deploy_minecraft_container(&opts).await {
      Ok(_) => DockerResult {
        success: true,
        message: format!("Deployed container {}", opts.name),
      },
      Err(e) => {
        log!("Failed to deploy container {}: {}", opts.name, e);
        DockerResult {
          success: false,
          message: format!("Failed to deploy container {}: {}", opts.name, e),
        }
      },
    };

    let mut response = tide::Response::new(
      if result.success {
        200
      } else {
        500
      }
    );

    response.set_body(serde_json::to_string(&result).unwrap_or_default());

    Ok(response)
  });

  app.at("/api/stop/:name").post(|req: tide::Request<State>| async move {
    let name = req.param("name").expect("Failed to get name");

    let result = match docker::stop_minecraft_container(name).await {
      Ok(_) => DockerResult {
        success: true,
        message: format!("Stopped container {}", name),
      },
      Err(e) => {
        log!("Failed to stop container {}: {}", name, e);
        DockerResult {
          success: false,
          message: format!("Failed to stop container {}: {}", name, e),
        }
      },
    };

    let mut response = tide::Response::new(
      if result.success {
        200
      } else {
        500
      }
    );

    response.set_body(serde_json::to_string(&result).unwrap_or_default());

    Ok(response)
  });
}