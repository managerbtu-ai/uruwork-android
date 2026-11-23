<?php
declare(strict_types=1);

function pushDb(): PDO {
    $db = new PDO('sqlite:' . __DIR__ . '/push.sqlite3');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('PRAGMA busy_timeout = 5000');
    $db->exec('CREATE TABLE IF NOT EXISTS subscribers (token TEXT PRIMARY KEY)');
    $db->exec('CREATE TABLE IF NOT EXISTS observed (id TEXT PRIMARY KEY)');
    $db->exec('CREATE TABLE IF NOT EXISTS queue (
        id TEXT NOT NULL, token TEXT NOT NULL, title TEXT NOT NULL,
        location TEXT NOT NULL, queued_at INTEGER NOT NULL,
        PRIMARY KEY (id, token)
    )');
    $db->exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY)');
    return $db;
}
