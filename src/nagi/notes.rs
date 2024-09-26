use serde::{Deserialize, Serialize};
use sqlx;

use crate::nagi::dir::Dir;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Note {
    pub id: String,
    pub content: String,
    pub trashed: bool,
    pub created_at: String,
}

impl Note {
    pub async fn init() {
        let pool = Note::pool().await;
        sqlx::migrate!().run(&pool).await.unwrap();
    }

    pub async fn select_all() -> Vec<Self> {
        let pool = Note::pool().await;
        match sqlx::query_as::<_, Self>("SELECT * FROM notes")
            .fetch_all(&pool)
            .await
        {
            Ok(notes) => notes,
            _ => Vec::new(),
        }
    }

    pub async fn upsert(id: &str, content: &str, trashed: bool) {
        let pool = Note::pool().await;
        let sql = r#"
            INSERT INTO notes (id, content, trashed)
            VALUES (?, ?, ?)
            ON CONFLICT(id)
            DO UPDATE SET content = excluded.content,
                          trashed = excluded.trashed,
                          created_at = notes.created_at;
        "#;
        let _ = sqlx::query(sql)
            .bind(id)
            .bind(content)
            .bind(trashed)
            .execute(&pool)
            .await;
    }

    pub async fn delete(id: &str) {
        let pool = Note::pool().await;
        let _ = sqlx::query("DELETE FROM notes WHERE id = ?")
            .bind(id)
            .execute(&pool)
            .await;
    }

    async fn pool() -> sqlx::sqlite::SqlitePool {
        let db_path = Dir::root().join("data.db");
        let db_url = format!("sqlite:{}?mode=rwc", db_path.to_str().unwrap());
        sqlx::sqlite::SqlitePool::connect(&db_url).await.unwrap()
    }
}
