use super::notes::Note;

pub enum UserEvent {
    Init,
    UpsertNote(Note),
    DeleteNote(String),
}
