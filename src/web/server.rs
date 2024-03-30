use sha2::Digest;
use tide::utils::async_trait;
use tide_http_auth::{BasicAuthRequest, Storage};

#[derive(Clone, Debug)]
pub struct User {
  username: String,
  password: Vec<u8>
}

#[derive(Clone)]
pub struct State {
  user: User,
}

impl State {
  pub fn new(username: String, password: Vec<u8>) -> Self {
    Self {
      user: User {
        username,
        password
      }
    }
  }
}

#[async_trait]
impl Storage<User, BasicAuthRequest> for State {
  async fn get_user(&self, req: BasicAuthRequest) -> tide::Result<Option<User>> {
    let hashed_password: Vec<u8> = sha2::Sha256::digest(req.password.as_bytes()).to_vec();

    if req.username == self.user.username && hashed_password == self.user.password {
      Ok(Some(self.user.clone()))
    } else {
      Ok(None)
    }
  }
}