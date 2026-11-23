<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit;
require __DIR__ . '/storage.php';

function requestJson(string $url, ?array $body = null, ?string $secret = null): array {
    $curl = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($secret !== null) $headers[] = 'Authorization: Bearer ' . $secret;
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_THROW_ON_ERROR));
    }
    curl_setopt_array($curl, [
        CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 6, CURLOPT_TIMEOUT => 12,
        CURLOPT_USERAGENT => 'UruworkNotificationWorker/1.0',
    ]);
    $raw = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
    if (!is_string($raw) || $status !== 200) throw new RuntimeException("HTTP request failed ($status)");
    return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
}

$lock = fopen(__DIR__ . '/dispatch.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit;
try {
    $db = pushDb();
    $feed = requestJson('https://uruwork.com/api.php?action=list_vacancies');
    if (($feed['ok'] ?? null) !== true || !is_array($feed['items'] ?? null)) {
        throw new RuntimeException('Invalid vacancy feed');
    }
    $db->beginTransaction();
    $initialized = $db->query("SELECT key FROM settings WHERE key = 'initialized'")->fetchColumn();
    $observe = $db->prepare('INSERT OR IGNORE INTO observed (id) VALUES (?)');
    $enqueue = $db->prepare(
        'INSERT OR IGNORE INTO queue (id, token, title, location, queued_at)
         SELECT ?, token, ?, ?, ? FROM subscribers'
    );
    foreach ($feed['items'] as $job) {
        $rawId = $job['id'] ?? null;
        if (!is_int($rawId) && !is_string($rawId)) continue;
        $id = (string) $rawId;
        if (!preg_match('/^\d{1,20}$/D', $id) || !is_string($job['title'] ?? null)) continue;
        $observe->execute([$id]);
        if ($initialized && $observe->rowCount() === 1) {
            $location = is_string($job['location'] ?? null) ? trim($job['location']) : '';
            $enqueue->execute([$id, trim($job['title']) ?: 'Nueva oferta', $location, time()]);
        }
    }
    $db->exec("INSERT OR IGNORE INTO settings (key) VALUES ('initialized')");
    $db->commit();

    $prune = $db->prepare('DELETE FROM queue WHERE queued_at < ?');
    $prune->execute([time() - 86400]);
    $rows = $db->query(
        'SELECT * FROM queue ORDER BY queued_at, id, token LIMIT 100'
    )->fetchAll(PDO::FETCH_ASSOC);
    if (!$rows) exit;

    $messages = array_map(static function (array $row): array {
        $location = $row['location'];
        return [
            'to' => $row['token'], 'channelId' => 'vacancies', 'sound' => 'default',
            'title' => 'Nueva vacante en Uruwork',
            'body' => $row['title'] . ($location !== '' && $location !== 'Ver imagen' ? ' · ' . $location : ''),
            'data' => ['vacancyId' => $row['id']],
            'ttl' => 3600,
        ];
    }, $rows);
    $secret = trim((string) getenv('URUWORK_EXPO_PUSH_ACCESS_TOKEN'));
    if ($secret === '') throw new RuntimeException('Expo push access token is not configured');
    $result = requestJson('https://exp.host/--/api/v2/push/send', $messages, $secret);
    if (count($result['data'] ?? []) !== count($rows)) {
        throw new RuntimeException('Unexpected Expo push response');
    }
    $delivered = $db->prepare('DELETE FROM queue WHERE id = ? AND token = ?');
    $dropToken = $db->prepare('DELETE FROM subscribers WHERE token = ?');
    $dropPending = $db->prepare('DELETE FROM queue WHERE token = ?');
    $db->beginTransaction();
    foreach ($result['data'] as $index => $ticket) {
        $row = $rows[$index];
        if (($ticket['status'] ?? null) === 'ok') {
            $delivered->execute([$row['id'], $row['token']]);
        } elseif (($ticket['details']['error'] ?? null) === 'DeviceNotRegistered') {
            $dropToken->execute([$row['token']]);
            $dropPending->execute([$row['token']]);
        } else {
            error_log('Uruwork push: Expo rejected an alert');
        }
    }
    $db->commit();
} catch (Throwable $error) {
    error_log('Uruwork push: ' . $error->getMessage());
    exit(1);
}
