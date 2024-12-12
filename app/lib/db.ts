import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// This ensures we only create one database connection
let db: any = null;

export async function getDb() {
    if (!db) {
        db = await open({
            filename: './todos.db',
            driver: sqlite3.Database
        });

        // Create todos table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                completed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
    return db;
} 