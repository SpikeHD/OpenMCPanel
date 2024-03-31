use colored::Colorize;
use chrono::Local;
use std::fmt::Display;
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

static LOG_FILE: Mutex<Option<File>> = Mutex::new(None);

pub enum LogKind {
  Info,
  Success,
  Warn,
  Error,
}

pub fn init(with_file: Option<PathBuf>) {
  if let Some(path) = with_file {
    fs::create_dir_all(path.parent().unwrap_or(&path)).unwrap_or_default();

    let file = File::create(path).unwrap();

    *LOG_FILE.lock().unwrap() = Some(file);
  }
}

pub fn log(s: impl AsRef<str> + Display, kind: Option<LogKind>) {
  let status = match kind {
    Some(LogKind::Info) => "INFO".blue(),
    Some(LogKind::Success) => "SUCCESS".green(),
    Some(LogKind::Warn) => "WARN".yellow(),
    Some(LogKind::Error) => "ERROR".red(),
    None => "INFO".blue(),
  };
  println!("[{}] [{}] {}", Local::now().format("%Y-%m-%d %H:%M:%S"), status, s);

  let mut file = LOG_FILE.lock().unwrap();

  if let Some(file) = &mut *file {
    writeln!(file, "[{}] {}", Local::now().format("%Y-%m-%d %H:%M:%S"), s).unwrap_or_default();
  }
}

#[macro_export]
macro_rules! log {
  ($($arg:tt)*) => {
    $crate::util::logger::log(format!($($arg)*), Some($crate::util::logger::LogKind::Info))
  };
}

#[macro_export]
macro_rules! success {
  ($($arg:tt)*) => {
    $crate::util::logger::log(format!($($arg)*), Some($crate::util::logger::LogKind::Success))
  };
}

#[macro_export]
macro_rules! warn {
  ($($arg:tt)*) => {
    $crate::util::logger::log(format!($($arg)*), Some($crate::util::logger::LogKind::Warn))
  };
}

#[macro_export]
macro_rules! error {
  ($($arg:tt)*) => {
    $crate::util::logger::log(format!($($arg)*), Some($crate::util::logger::LogKind::Error))
  };
}
