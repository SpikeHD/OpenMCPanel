use tide::utils::async_trait;

use crate::log;

use super::server::User;

pub struct AuthMiddleware {}

#[async_trait]
impl<State> tide::Middleware<State> for AuthMiddleware
where
  State: Clone + Send + Sync + 'static,
{
  async fn handle(&self, req: tide::Request<State>, next: tide::Next<'_, State>) -> tide::Result {
    if req.ext::<User>().is_none() {
      let mut res: tide::Response = tide::Response::new(401);
      res.insert_header("WWW-Authenticate", "Basic");

      log!(
        "Attempted access by {}",
        req.remote().unwrap_or("unknown")
      );

      return Ok(res);
    }

    Ok(next.run(req).await)
  }
}