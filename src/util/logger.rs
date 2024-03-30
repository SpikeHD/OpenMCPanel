use chrono::Local;
use std::fmt::Display;
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

static LOG_FILE: Mutex<Option<File>> = Mutex::new(None);

pub fn init(with_file: Option<PathBuf>) {
  if let Some(path) = with_file {
    fs::create_dir_all(path.parent().unwrap_or(&path)).unwrap_or_default();

    let file = File::create(path).unwrap();

    *LOG_FILE.lock().unwrap() = Some(file);
  }
}

pub fn log(s: impl AsRef<str> + Display) {
  println!("[{}] {}", Local::now().format("%Y-%m-%d %H:%M:%S"), s);

  let mut file = LOG_FILE.lock().unwrap();

  if let Some(file) = &mut *file {
    writeln!(file, "[{}] {}", Local::now().format("%Y-%m-%d %H:%M:%S"), s).unwrap_or_default();
  }
}

#[macro_export]
macro_rules! log {
  ($($arg:tt)*) => {
    $crate::util::logger::log(format!($($arg)*))
  };
}
