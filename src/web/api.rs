use tide::Server;

use crate::util::docker;

use super::server::State;

pub fn register_routes(app: &mut Server<State>) {
  app.at("/api").nest({
    let mut api = tide::new();

    api.at("/running_containers").get(|_| async {
      docker::get_minecraft_images().await.expect("Failed to get Minecraft images");

      Ok("")
    });

    api
  });
}