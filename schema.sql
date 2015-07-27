DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS device;
DROP TABLE IF EXISTS device_email;
DROP TABLE IF EXISTS email;

CREATE TABLE account (
    account_id INTEGER PRIMARY KEY,
    email_id INTEGER,
    password TEXT
);

CREATE TABLE device (
    device_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    name TEXT,
    topic TEXT,
    alert INTEGER
);

CREATE TABLE device_email (
    device_id INTEGER,
    email_id INTEGER,
    enabled INTEGER
);

CREATE TABLE email (
    email_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    email TEXT,
    verified INTEGER
);

CREATE TABLE log (
    log_id INTEGER PRIMARY KEY,
    device_id INTEGER,
    time INTEGER,
    message TEXT
);
