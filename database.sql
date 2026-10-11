CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50)  NOT NULL,
    username      VARCHAR(20)  NOT NULL,
    email         VARCHAR(254) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    bio           VARCHAR(300) NOT NULL DEFAULT '',
    created_at    DATE         NOT NULL DEFAULT CURRENT_DATE
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower ON users (LOWER(username));

CREATE TABLE IF NOT EXISTS sessions (
    token      CHAR(64)  PRIMARY KEY,
    user_id    INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL
);
