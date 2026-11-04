<?php
// طلبات العملاء: حفظ في MySQL، رقم طلب تلقائي، إشعار بريدي (وواتساب عند تفعيله)، وإعادة محاولة عند الفشل.
declare(strict_types=1);
if (!defined('DATA')) { http_response_code(404); exit; } // لا يُفتح مباشرة

date_default_timezone_set('Asia/Riyadh'); // نفس توقيت قاعدة البيانات (+03:00)

const REQ_STATUSES = ['new', 'qualified', 'unqualified', 'signed'];
const REQ_MAX_ATTEMPTS = 10;

function cfg(): array {
    static $c = null;
    if ($c === null) {
        $f = DATA . '/config.php';
        $c = is_file($f) ? (require $f) : [];
        if (!is_array($c)) $c = [];
    }
    return $c;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $d = cfg()['db'] ?? [];
    if (empty($d['name'])) throw new RuntimeException('db_not_configured');
    $pdo = new PDO(
        'mysql:host=' . ($d['host'] ?? 'localhost') . ';port=' . ($d['port'] ?? 3306) . ';dbname=' . $d['name'] . ';charset=utf8mb4',
        (string)($d['user'] ?? ''), (string)($d['pass'] ?? ''),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false],
    );
    $pdo->exec("SET time_zone = '+03:00'"); // توقيت السعودية
    if (!is_file(DATA . '/.schema_v1')) {
        $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(24) NULL UNIQUE,
  idem_key CHAR(36) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  service TEXT NOT NULL,
  budget VARCHAR(120) NOT NULL DEFAULT '',
  timeline VARCHAR(120) NOT NULL DEFAULT '',
  details TEXT NOT NULL,
  status ENUM('new','qualified','unqualified','signed') NOT NULL DEFAULT 'new',
  note TEXT NOT NULL,
  source VARCHAR(255) NOT NULL DEFAULT '',
  utm_source VARCHAR(255) NOT NULL DEFAULT '',
  utm_medium VARCHAR(255) NOT NULL DEFAULT '',
  utm_campaign VARCHAR(255) NOT NULL DEFAULT '',
  utm_term VARCHAR(255) NOT NULL DEFAULT '',
  utm_content VARCHAR(255) NOT NULL DEFAULT '',
  gclid VARCHAR(255) NOT NULL DEFAULT '',
  referrer VARCHAR(500) NOT NULL DEFAULT '',
  landing_url VARCHAR(500) NOT NULL DEFAULT '',
  user_agent VARCHAR(300) NOT NULL DEFAULT '',
  ip_hash CHAR(64) NOT NULL DEFAULT '',
  notified_email TINYINT(1) NOT NULL DEFAULT 0,
  notified_wa TINYINT(1) NOT NULL DEFAULT 0,
  notify_attempts INT NOT NULL DEFAULT 0,
  notify_error VARCHAR(500) NOT NULL DEFAULT '',
  next_retry_at DATETIME NULL,
  KEY idx_status (status), KEY idx_created (created_at), KEY idx_ip (ip_hash, created_at), KEY idx_phone (phone, created_at), KEY idx_retry (next_retry_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
        @file_put_contents(DATA . '/.schema_v1', date('c'));
    }
    if (!is_file(DATA . '/.schema_v2')) { // بريد العميل (اختياري) + حالة إرسال التأكيد له
        $pdo->exec("ALTER TABLE requests ADD COLUMN IF NOT EXISTS email VARCHAR(190) NOT NULL DEFAULT '' AFTER phone, ADD COLUMN IF NOT EXISTS notified_customer TINYINT(1) NOT NULL DEFAULT 0 AFTER notified_wa");
        @file_put_contents(DATA . '/.schema_v2', date('c'));
    }
    return $pdo;
}

/** رقم سعودي (05xxxxxxxx / 5xxxxxxxx / +9665… / 009665…) أو رقم دولي بصيغة +… ؛ يعيد +9665xxxxxxxx أو null */
function normalize_phone(string $raw): ?string {
    $s = strtr($raw, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9']);
    $plus = str_starts_with(trim($s), '+');
    $d = preg_replace('/\D+/', '', $s) ?? '';
    if (str_starts_with($d, '00')) { $d = substr($d, 2); $plus = true; }
    if (preg_match('/^05\d{8}$/', $d)) return '+966' . substr($d, 1);
    if (preg_match('/^5\d{8}$/', $d) && !$plus) return '+966' . $d;
    if (preg_match('/^9665\d{8}$/', $d)) return '+' . $d;
    if ($plus && preg_match('/^[1-9]\d{7,14}$/', $d) && !str_starts_with($d, '966')) return '+' . $d;
    return null;
}

function clip(mixed $v, int $max): string {
    $s = is_string($v) || is_numeric($v) ? trim((string)$v) : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $s) ?? '';
    return mb_substr($s, 0, $max);
}

function client_ip_hash(): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '?';
    return hash('sha256', $ip . '|' . (cfg()['salt'] ?? 'nbr'));
}

/** الاستقبال العام: POST ?a=request */
function handle_request(array $b): never {
    // مصيدة للروبوتات: حقل مخفي يجب أن يبقى فارغًا → نردّ بنجاح وهمي دون حفظ
    if (clip($b['company_site'] ?? '', 50) !== '') out(['ok' => true, 'order_no' => 'NB-' . date('ymd') . '-0000']);
    // الإرسال أسرع من ثانيتين من ظهور النموذج = غالبًا آلي
    if ((float)($b['elapsed'] ?? 99) < 2.0) fail('too_fast', 400);

    $name = clip($b['name'] ?? '', 120);
    $phone = normalize_phone((string)($b['phone'] ?? ''));
    $services = array_values(array_filter(array_map(fn($x) => clip($x, 80), is_array($b['service'] ?? null) ? array_slice($b['service'], 0, 12) : [])));
    $key = clip($b['key'] ?? '', 36);
    $email = strtolower(clip($b['email'] ?? '', 190));
    $errors = [];
    if (mb_strlen($name) < 2) $errors['name'] = 'required';
    if (!$phone) $errors['phone'] = 'bad_phone';
    if (!$services) $errors['service'] = 'required';
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'bad_email';
    if (!preg_match('/^[0-9a-f-]{16,36}$/i', $key)) $errors['key'] = 'bad_key';
    if ($errors) out(['error' => 'invalid', 'fields' => $errors], 422);

    $a = is_array($b['attr'] ?? null) ? $b['attr'] : [];
    $row = [
        'name' => $name, 'phone' => $phone, 'email' => $email, 'service' => implode('، ', $services),
        'budget' => clip($b['budget'] ?? '', 120), 'timeline' => clip($b['timeline'] ?? '', 120), 'details' => clip($b['details'] ?? '', 1500),
        'source' => clip($a['source'] ?? '', 255), 'utm_source' => clip($a['utm_source'] ?? '', 255), 'utm_medium' => clip($a['utm_medium'] ?? '', 255),
        'utm_campaign' => clip($a['utm_campaign'] ?? '', 255), 'utm_term' => clip($a['utm_term'] ?? '', 255), 'utm_content' => clip($a['utm_content'] ?? '', 255),
        'gclid' => clip($a['gclid'] ?? '', 255), 'referrer' => clip($a['referrer'] ?? '', 500), 'landing_url' => clip($a['landing_url'] ?? '', 500),
        'user_agent' => clip($_SERVER['HTTP_USER_AGENT'] ?? '', 300), 'ip_hash' => client_ip_hash(),
    ];

    try {
        $pdo = db();
        // نفس مفتاح الإرسال (ضغط متكرر/إعادة محاولة) أو نفس الجوال خلال 10 دقائق: نعيد الطلب السابق دون تكرار
        $q = $pdo->prepare("SELECT order_no FROM requests WHERE idem_key = ? OR (phone = ? AND created_at > NOW() - INTERVAL 10 MINUTE) ORDER BY id LIMIT 1");
        $q->execute([$key, $phone]);
        if ($old = $q->fetchColumn()) out(['ok' => true, 'order_no' => $old, 'dup' => true]);
        // حد الإرسال لكل عنوان: 5 طلبات في الساعة
        $q = $pdo->prepare("SELECT COUNT(*) FROM requests WHERE ip_hash = ? AND created_at > NOW() - INTERVAL 1 HOUR");
        $q->execute([$row['ip_hash']]);
        if ((int)$q->fetchColumn() >= 5) fail('locked', 429);

        $cols = array_keys($row);
        $pdo->beginTransaction();
        $ins = $pdo->prepare('INSERT INTO requests (idem_key, created_at, note, ' . implode(',', $cols) . ') VALUES (?, NOW(), \'\', ' . implode(',', array_fill(0, count($cols), '?')) . ')');
        $ins->execute([$key, ...array_values($row)]);
        $id = (int)$pdo->lastInsertId();
        $order = 'NB-' . date('ymd') . '-' . str_pad((string)$id, 4, '0', STR_PAD_LEFT);
        $pdo->prepare('UPDATE requests SET order_no = ? WHERE id = ?')->execute([$order, $id]);
        $pdo->commit();
    } catch (Throwable $e) {
        if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
        // قاعدة البيانات غير متاحة: لا نضيّع الطلب — نحفظه في ملف ونرسل بريدًا بالتفاصيل
        $order = 'NB-' . date('ymd') . '-F' . substr(bin2hex(random_bytes(3)), 0, 4);
        @file_put_contents(DATA . '/requests-fallback.jsonl', json_encode(['order_no' => $order, 'at' => date('c'), 'row' => $row, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
        $row['order_no'] = $order; $row['created_at'] = date('Y-m-d H:i:s');
        $em = email_new_request($row);
        [$ok] = smtp_send(notify_to(), $em['subject'] . ' (قاعدة البيانات غير متاحة)', request_email_body($row), null, '', $em['html']);
        if (!$ok) fail('server', 500);
        out(['ok' => true, 'order_no' => $order]);
    }

    // نرد على العميل فورًا ثم نرسل الإشعار (حتى لا ينتظر SMTP)
    $payload = json_encode(['ok' => true, 'order_no' => $order], JSON_UNESCAPED_UNICODE);
    http_response_code(200);
    header('Content-Length: ' . strlen($payload));
    header('Connection: close');
    echo $payload;
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    elseif (function_exists('litespeed_finish_request')) litespeed_finish_request();
    else { @ob_end_flush(); @flush(); }
    ignore_user_abort(true);
    try { notify_request($id); } catch (Throwable $e) { /* يُعاد عبر cron */ }
    exit;
}

function notify_to(): string { return (string)(cfg()['notify_to'] ?? 'info@nbarmej.com'); }

function request_email_body(array $r): string {
    $st = ['new' => 'جديد', 'qualified' => 'مؤهل', 'unqualified' => 'غير مؤهل', 'signed' => 'تم التعاقد'];
    $lines = [
        'طلب جديد من موقع نبرمج',
        '',
        'رقم الطلب: ' . ($r['order_no'] ?? ''),
        'التاريخ: ' . ($r['created_at'] ?? ''),
        'الحالة: ' . ($st[$r['status'] ?? 'new'] ?? 'جديد'),
        '',
        'الاسم: ' . $r['name'],
        'الجوال: ' . $r['phone'],
        'الخدمات: ' . $r['service'],
        'الميزانية: ' . ($r['budget'] ?: '—'),
        'المدة: ' . ($r['timeline'] ?: '—'),
        'تفاصيل: ' . ($r['details'] ?: '—'),
        '',
        'واتساب العميل: https://wa.me/' . ltrim((string)$r['phone'], '+'),
        '',
        'إدارة الطلبات: ' . SITE . '/admin/#/requests',
    ];
    return implode("\n", $lines);
}

function wa_enabled(): bool { $w = cfg()['whatsapp'] ?? []; return !empty($w['enabled']) && !empty($w['token']) && !empty($w['phone_id']) && !empty($w['to']); }

/** إشعار واتساب عبر WhatsApp Cloud API (قالب معتمد). معطّل افتراضيًا حتى تُضاف بيانات الحساب في config.php */
function wa_send(array $r): array {
    $w = cfg()['whatsapp'];
    $params = array_map(fn($t) => ['type' => 'text', 'text' => mb_substr(str_replace(["\n", "\t"], ' ', (string)$t) ?: '—', 0, 200)],
        [$r['order_no'], $r['name'], $r['phone'], $r['service'], $r['budget'] ?: '—', $r['timeline'] ?: '—']);
    $payload = ['messaging_product' => 'whatsapp', 'to' => ltrim((string)$w['to'], '+'), 'type' => 'template',
        'template' => ['name' => $w['template'] ?? 'new_request', 'language' => ['code' => $w['lang'] ?? 'ar'], 'components' => [['type' => 'body', 'parameters' => $params]]]];
    $ch = curl_init('https://graph.facebook.com/' . ($w['version'] ?? 'v21.0') . '/' . $w['phone_id'] . '/messages');
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $w['token'], 'Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE)]);
    $res = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
    return $code >= 200 && $code < 300 ? [true, ''] : [false, 'wa ' . $code . ' ' . ($err ?: mb_substr((string)$res, 0, 200))];
}

/** يحاول إشعار الطلب (بريد + واتساب إن فُعّل) ويسجّل النتيجة؛ عند الفشل يجدول إعادة المحاولة */
function notify_request(int $id): void {
    $pdo = db();
    $s = $pdo->prepare('SELECT * FROM requests WHERE id = ?');
    $s->execute([$id]);
    $r = $s->fetch();
    if (!$r) return;
    $errs = [];
    $email = (int)$r['notified_email']; $wa = (int)$r['notified_wa']; $cust = (int)$r['notified_customer'];
    $hasCust = filter_var($r['email'] ?? '', FILTER_VALIDATE_EMAIL) !== false;
    if (!$email) {
        $em = email_new_request($r);
        [$ok, $e] = smtp_send(notify_to(), $em['subject'], request_email_body($r), null, $hasCust ? (string)$r['email'] : '', $em['html']);
        if ($ok) $email = 1; else $errs[] = "email: $e";
    }
    if ($hasCust && !$cust) { // تأكيد للعميل على بريده
        $ce = email_customer_confirmation($r);
        [$ok, $e] = smtp_send((string)$r['email'], $ce['subject'], $ce['text'], null, notify_to(), $ce['html']);
        if ($ok) $cust = 1; else $errs[] = "customer: $e";
    }
    if (wa_enabled() && !$wa) {
        [$ok, $e] = wa_send($r);
        if ($ok) $wa = 1; else $errs[] = "wa: $e";
    }
    $done = $email && (!wa_enabled() || $wa) && (!$hasCust || $cust);
    $attempts = (int)$r['notify_attempts'] + 1;
    $next = ($done || $attempts >= REQ_MAX_ATTEMPTS) ? null : date('Y-m-d H:i:s', time() + min(21600, 300 * 2 ** ($attempts - 1)));
    $pdo->prepare('UPDATE requests SET notified_email = ?, notified_wa = ?, notified_customer = ?, notify_attempts = ?, notify_error = ?, next_retry_at = ? WHERE id = ?')
        ->execute([$email, $wa, $cust, $attempts, mb_substr(implode(' | ', $errs), 0, 500), $next, $id]);
}

/** يُستدعى من cron: يعيد محاولة الإشعارات المعلّقة */
function retry_pending(): int {
    $pdo = db();
    $ids = $pdo->query('SELECT id FROM requests WHERE next_retry_at IS NOT NULL AND next_retry_at <= NOW() ORDER BY id LIMIT 20')->fetchAll(PDO::FETCH_COLUMN);
    foreach ($ids as $id) { try { notify_request((int)$id); } catch (Throwable $e) {} }
    return count($ids);
}

// ---------- لوحة الإدارة ----------
function list_requests(): never {
    $pdo = db();
    $status = clip($_GET['status'] ?? '', 20);
    $q = clip($_GET['q'] ?? '', 80);
    $page = max(1, (int)($_GET['page'] ?? 1)); $per = 30;
    $where = []; $args = [];
    if (in_array($status, REQ_STATUSES, true)) { $where[] = 'status = ?'; $args[] = $status; }
    if ($q !== '') { $where[] = '(name LIKE ? OR phone LIKE ? OR order_no LIKE ? OR service LIKE ?)'; $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $q) . '%'; array_push($args, $like, $like, $like, $like); }
    $w = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $c = $pdo->prepare("SELECT COUNT(*) FROM requests $w"); $c->execute($args);
    $s = $pdo->prepare("SELECT * FROM requests $w ORDER BY id DESC LIMIT $per OFFSET " . (($page - 1) * $per)); $s->execute($args);
    $counts = $pdo->query('SELECT status, COUNT(*) n FROM requests GROUP BY status')->fetchAll(PDO::FETCH_KEY_PAIR);
    $items = array_map(function ($r) { unset($r['ip_hash'], $r['idem_key']); return $r; }, $s->fetchAll());
    out(['items' => $items, 'total' => (int)$c->fetchColumn(), 'per' => $per, 'counts' => $counts, 'wa' => wa_enabled()]);
}

function update_request(array $b): never {
    $pdo = db();
    $id = (int)($b['id'] ?? 0);
    $set = []; $args = [];
    if (isset($b['status'])) { if (!in_array($b['status'], REQ_STATUSES, true)) fail('bad_status'); $set[] = 'status = ?'; $args[] = $b['status']; }
    if (isset($b['note'])) { $set[] = 'note = ?'; $args[] = clip($b['note'], 2000); }
    if (!$set || !$id) fail('bad_request');
    $args[] = $id;
    $pdo->prepare('UPDATE requests SET ' . implode(', ', $set) . ' WHERE id = ?')->execute($args);
    out(['ok' => true]);
}

function retry_request(array $b): never {
    $id = (int)($b['id'] ?? 0);
    if (!$id) fail('bad_request');
    db()->prepare('UPDATE requests SET notify_attempts = 0 WHERE id = ?')->execute([$id]);
    notify_request($id);
    $s = db()->prepare('SELECT notified_email, notified_wa, notify_error FROM requests WHERE id = ?'); $s->execute([$id]);
    out(['ok' => true, 'result' => $s->fetch()]);
}

function export_requests(): never {
    $rows = db()->query('SELECT order_no, created_at, name, phone, email, service, budget, timeline, details, status, note, utm_source, utm_medium, utm_campaign, utm_term, gclid, landing_url FROM requests ORDER BY id DESC')->fetchAll();
    header_remove('Content-Type');
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="requests-' . date('Ymd') . '.csv"');
    $o = fopen('php://output', 'w');
    fwrite($o, "\xEF\xBB\xBF");
    fputcsv($o, ['order_no', 'created_at', 'name', 'phone', 'email', 'service', 'budget', 'timeline', 'details', 'status', 'note', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid', 'landing_url']);
    foreach ($rows as $r) { // يمنع تنفيذ الصيغ عند فتح الملف في Excel
        fputcsv($o, array_map(fn($v) => is_string($v) && preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v, $r));
    }
    exit;
}
