use gumdrop::Options;
use include_dir::{include_dir, Dir};
use rpassword::read_password;
use sha2::Digest;
use std::{io::Write, path::Path};

use crate::web::{api::register_routes, middleware, server::State};

mod util;
mod web;

static FRONTEND_DIR: Dir = include_dir!("./web/dist");

#[derive(Debug, Options)]
struct Opts {
  #[options(help = "Print help message")]
  help: bool,

  #[options(help = "Specify log file location", meta = "/path/to/logfile")]
  log: Option<String>,

  #[options(help = "Access address for the web panel", meta = "127.0.0.1")]
  address: Option<String>,

  #[options(help = "Access port for the web panel", meta = "8080")]
  port: Option<u16>,

  #[options(help = "Username to use while authenticating", meta = "admin")]
  username: Option<String>,

  #[options(help = "Auto-generate an NGINX config file")]
  nginx: bool,

  #[options(help = "Check for all required dependencies")]
  check: bool,

  #[options(help = "Disable authentication. For local development only, don't use this.")]
  no_auth: bool,
}

fn main() {
  let args = Opts::parse_args_default_or_exit();

  if args.help {
    println!("{}", Opts::usage());
    return;
  }

  let can_run = util::dependencies::check_all();

  if args.check || !can_run {
    return;
  }

  util::logger::init(args.log.map(|s| s.into()));

  let state;

  if !args.no_auth {
    let mut username = String::new();

    if args.username.is_none() {
      // Prompt for username
      print!("Username to use while authenticating: ");
      std::io::stdout().flush().unwrap();
      std::io::stdin().read_line(&mut username).unwrap();
    }
  
    // Prompt for password
    print!("Password to use while authenticating: ");
    std::io::stdout().flush().unwrap();
    let pwd = sha2::Sha256::digest(read_password().unwrap().as_bytes()).to_vec();

    state = web::server::State::new(username.trim().to_string(), pwd);  
  } else {
    warn!("Running in no-auth mode. This is insecure and should only be used when developing.");
    state = web::server::State::new("".to_string(), vec![]);
  }

  // Pull the docker image
  log!("Pulling minecraft-server Docker image");
  async_std::task::block_on(util::docker::init());
  log!("Done!");

  let mut app = tide::with_state(state);

  if !args.no_auth {
    app.with(tide_http_auth::Authentication::new(
      tide_http_auth::BasicAuthScheme {},
    ));

    app.with(middleware::AuthMiddleware {});
  }

  // Server index.html at the root
  app
    .at("/")
    .get(move |_req: tide::Request<State>| async move {
      let mut res = tide::Response::new(200);
      res.set_body(
        FRONTEND_DIR
          .get_file("index.html")
          .unwrap()
          .contents()
          .to_vec(),
      );
      res.set_content_type("text/html");

      Ok(res)
    });

  recursive_serve(&mut app, None);

  register_routes(&mut app);

  let addr = args.address.unwrap_or("127.0.0.1".to_string());
  let port = args.port.unwrap_or(8080);

  async_std::task::block_on(async {
    log!("Webserver running on http://{}:{}", addr, port);
    app.listen(format!("{}:{}", addr, port)).await.unwrap();
  });
}

pub fn recursive_serve(app: &mut tide::Server<State>, path: Option<&Path>) {
  // For all dirs in the frontend dir (including the root), serve the files within
  let path = path.unwrap_or(FRONTEND_DIR.path());
  let dir = FRONTEND_DIR.get_dir(path).unwrap_or(&FRONTEND_DIR);

  for file in dir.files() {
    let path = format!("{}", file.path().display());

    log!("Serving {}", path);

    app
      .at(&path)
      .get(move |_req: tide::Request<State>| async move {
        let mut res = tide::Response::new(200);
        res.set_body(file.contents().to_vec());
        res.set_content_type(
          mime_guess::from_path(file.path())
            .first()
            .unwrap()
            .essence_str(),
        );
        Ok(res)
      });
  }

  // For all dirs in dir, recursively serve the files within
  for dir in dir.dirs() {
    recursive_serve(app, Some(dir.path()));
  }
}
