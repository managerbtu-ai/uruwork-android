<?php
declare(strict_types=1);
require dirname(__DIR__) . '/uruwork-push/storage.php';

header('Content-Type: application/json');
header('Cache-Control: no-store');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    exit('{"ok":false}');
}
$raw = file_get_contents('php://input', false, null, 0, 1025);
$data = json_decode($raw === false ? '' : $raw, true);
$token = $data['token'] ?? null;
if (strlen($raw ?: '') > 1024 || !is_string($token) ||
    !preg_match('/^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]{10,100}\]$/D', $token)) {
    http_response_code(400);
    exit('{"ok":false}');
}
try {
    $insert = pushDb()->prepare('INSERT OR IGNORE INTO subscribers (token) VALUES (?)');
    $insert->execute([$token]);
    echo '{"ok":true}';
} catch (Throwable $error) {
    error_log('Uruwork push: registration unavailable');
    http_response_code(503);
    echo '{"ok":false}';
}
