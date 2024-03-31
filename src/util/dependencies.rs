use crate::{success, error, warn};

pub fn check_all() -> bool {
  // Set to true if a required dependency is not installed
  let mut required_not_installed = false;
  if !check_for_docker() {
    required_not_installed = true;
  }

  check_for_fail2ban();
  check_for_nginx();

  if required_not_installed {
    error!("Some required dependencies are not installed. Please install them before running this program.");
    return false;
  }

  true
}

pub fn check_for_docker() -> bool {
  // Check if docker is installed
  // TODO maybe allow remote Docker connections for remote management? 
  let docker = bollard::Docker::connect_with_local_defaults();
  match docker {
    Ok(_) => success!("Docker is installed!"),
    Err(e) => {
      error!("Docker is not installed: {}", e);
      return false;
    }
  }

  true
}

pub fn check_for_nginx() -> bool {
  // Check if nginx is installed
  let nginx = std::process::Command::new("nginx").arg("-v").output();
  match nginx {
    Ok(_) => success!("NGINX is installed"),
    Err(e) => {
      warn!("NGINX is not installed. It is reccommended to use it for reverse proxying. Learn more: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/");
      warn!("If you're using something else, or don't care, you are welcome to ignore this warning!");
      return false;
    }
  }

  true
}

pub fn check_for_fail2ban() -> bool {
  // Check if fail2ban is installed
  let fail2ban = std::process::Command::new("fail2ban-client").arg("-V").output();
  match fail2ban {
    Ok(_) => success!("Fail2ban is installed"),
    Err(e) => {
      warn!("Fail2ban is not installed. It is reccommended to use it for preventing brute-force attacks. Learn more: https://github.com/fail2ban/fail2ban");
      warn!("If you're using something else, or don't care, you are welcome to ignore this warning!");
      return false;
    }
  }

  true
}