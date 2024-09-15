use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{BufReader, BufWriter};
use std::path::PathBuf;

use crate::nagi::dir::Dir;

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub window_position: (i32, i32),
    pub window_size: (u32, u32),
    pub font_size: u32,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            window_position: (0, 0),
            window_size: (1280, 800),
            font_size: 16,
        }
    }
}

impl Settings {
    pub fn load() -> Self {
        match Settings::restore() {
            Ok(settings) => settings,
            _ => Settings::default(),
        }
    }

    fn restore() -> Result<Self, std::io::Error> {
        let file = File::open(Settings::json_path())?;
        let reader = BufReader::new(file);
        let settings = serde_json::from_reader(reader)?;
        Ok(settings)
    }

    fn json_path() -> PathBuf {
        Dir::root().join("settings.json")
    }

    pub fn save(&self) -> Result<(), std::io::Error> {
        let file = File::create(Settings::json_path())?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, self)?;
        Ok(())
    }
}
