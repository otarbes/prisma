//! Sqlite3 support for the `r2d2` connection pool.
//! 
//!
#![deny(warnings)]

use r2d2;
use sqlite;

use std::fmt::{self, Formatter, Debug};

/// An `r2d2::ManageConnection` for `sqlite::Connection`s.
pub struct SqliteConnectionManager {
    path: String,
}

impl SqliteConnectionManager {
    pub fn file(path: String) -> Self {
        Self { path }
    }

    pub fn memory() -> Self {
        Self { path: ":memory:".into() }
    }
}

impl Debug for SqliteConnectionManager {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "SqliteConnectionManager")
    }
}

impl r2d2::ManageConnection for SqliteConnectionManager {
    type Connection = sqlite::Connection;
    type Error = sqlite::Error;

    fn connect(&self) -> Result<sqlite::Connection, sqlite::Error> {
        sqlite::Connection::open(&self.path)
    }

    fn is_valid(&self, conn: &mut sqlite::Connection) -> Result<(), sqlite::Error> {
        conn.execute("")
    }

    fn has_broken(&self, _: &mut sqlite::Connection) -> bool {
        false
    }
}

