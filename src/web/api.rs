use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tide::Server;

use crate::{log, util::docker};

use super::server::State;

#[derive(Deserialize)]
pub struct DeploymentConfig {
  pub name: String,
  pub port: u16,
  pub kind: String,
  pub version: String,
  pub modpack_id: Option<String>,
  pub additional_options: Option<HashMap<String, String>>,
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
  app.at("/api/containers/running").get(|_| async {
    let containers = match docker::get_minecraft_containers(false).await {
      Ok(containers) => containers,
      Err(e) => {
        log!("Failed to get containers: {}", e);
        vec![]
      }
    };

    let mut response = tide::Response::new(200);
    response.set_body(serde_json::to_string(&containers).unwrap_or_default());

    Ok(response)
  });

  app.at("/api/containers/all").get(|_| async {
    let containers = match docker::get_minecraft_containers(true).await {
      Ok(containers) => containers,
      Err(e) => {
        log!("Failed to get containers: {}", e);
        vec![]
      }
    };

    let mut response = tide::Response::new(200);
    response.set_body(serde_json::to_string(&containers).unwrap_or_default());

    Ok(response)
  });

  app
    .at("/api/container/:id")
    .get(|req: tide::Request<State>| async move {
      let id = req.param("id").expect("Failed to get id");

      let status = match docker::get_status(id).await {
        Ok(status) => status,
        Err(e) => {
          log!("Failed to get container {}: {}", id, e);
          docker::Status::default()
        }
      };

      let mut response = tide::Response::new(200);
      response.set_body(serde_json::to_string(&status).unwrap_or_default());

      Ok(response)
    });

  app
    .at("/api/logs/:id")
    .get(|req: tide::Request<State>| async move {
      let id = req.param("id").expect("Failed to get id");

      let logs = match docker::get_logs(id).await {
        Ok(logs) => {
          DockerResult {
            success: true,
            message: logs,
          }
        },
        Err(e) => {
          log!("Failed to get logs for container {}: {}", id, e);
          DockerResult {
            success: false,
            message: format!("Failed to get logs for container {}: {}", id, e),
          }
        }
      };

      let mut response = tide::Response::new(200);
      response.set_body(serde_json::to_string(&logs).unwrap_or_default());

      Ok(response)
    });

  app
    .at("/api/deploy")
    .post(|mut req: tide::Request<State>| async move {
      let opts: DeploymentConfig = req.body_json().await.expect("Failed to parse JSON");

      let result = match docker::deploy_minecraft_container(&opts).await {
        Ok(id) => DockerResult {
          success: true,
          message: id,
        },
        Err(e) => {
          log!("Failed to deploy container {}: {}", opts.name, e);
          DockerResult {
            success: false,
            message: format!("Failed to deploy container {}: {}", opts.name, e),
          }
        }
      };

      let mut response = tide::Response::new(if result.success { 200 } else { 500 });

      response.set_body(serde_json::to_string(&result).unwrap_or_default());

      Ok(response)
    });

  app
    .at("/api/stop/:id")
    .post(|req: tide::Request<State>| async move {
      let id = req.param("id").expect("Failed to get id");

      let result = match docker::stop_minecraft_container(id).await {
        Ok(_) => DockerResult {
          success: true,
          message: format!("Stopped container {}", id),
        },
        Err(e) => {
          log!("Failed to stop container {}: {}", id, e);
          DockerResult {
            success: false,
            message: format!("Failed to stop container {}: {}", id, e),
          }
        }
      };

      let mut response = tide::Response::new(if result.success { 200 } else { 500 });

      response.set_body(serde_json::to_string(&result).unwrap_or_default());

      Ok(response)
    });

  app
    .at("/api/destroy/:id")
    .post(|req: tide::Request<State>| async move {
      let id = req.param("id").expect("Failed to get id");

      let result = match docker::destroy_minecraft_container(id).await {
        Ok(_) => DockerResult {
          success: true,
          message: format!("Destroyed container {}", id),
        },
        Err(e) => {
          log!("Failed to destroy container {}: {}", id, e);
          DockerResult {
            success: false,
            message: format!("Failed to destroy container {}: {}", id, e),
          }
        }
      };

      let mut response = tide::Response::new(if result.success { 200 } else { 500 });

      response.set_body(serde_json::to_string(&result).unwrap_or_default());

      Ok(response)
    });

  app
    .at("/api/start/:id")
    .post(|req: tide::Request<State>| async move {
      let id = req.param("id").expect("Failed to get id");

      let result = match docker::start_minecraft_container(id).await {
        Ok(_) => DockerResult {
          success: true,
          message: format!("Started container {}", id),
        },
        Err(e) => {
          log!("Failed to start container {}: {}", id, e);
          DockerResult {
            success: false,
            message: format!("Failed to start container {}: {}", id, e),
          }
        }
      };

      let mut response = tide::Response::new(if result.success { 200 } else { 500 });

      response.set_body(serde_json::to_string(&result).unwrap_or_default());

      Ok(response)
    });

  app
    .at("/api/command/:id")
    .post(|mut req: tide::Request<State>| async move {
      let command: Vec<String> = req.body_json().await.expect("Failed to parse JSON");
      let id = req.param("id").expect("Failed to get id");

      let result = match docker::run_in_container(id, &command).await {
        Ok(result) => DockerResult {
          success: true,
          message: result,
        },
        Err(e) => {
          log!("Failed to run command in container {}: {}", id, e);
          DockerResult {
            success: false,
            message: format!("Failed to run command in container {}: {}", id, e),
          }
        }
      };

      let mut response = tide::Response::new(if result.success { 200 } else { 500 });

      response.set_body(serde_json::to_string(&result).unwrap_or_default());

      Ok(response)
    });
}
