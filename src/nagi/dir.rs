use dirs::data_local_dir;
use std::fs::create_dir_all;

pub struct Dir {}

impl Dir {
    pub fn root() -> std::path::PathBuf {
        data_local_dir().unwrap().join("com.tnantoka.nagi")
    }

    pub fn init() {
        let root = Dir::root();
        create_dir_all(root).unwrap();
    }
}
