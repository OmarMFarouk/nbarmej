<?php
// واجهة الإدارة: محتوى الموقع + الدخول + رفع الصور. التخزين في ملفات JSON خارج public_html.
declare(strict_types=1);

$root = rtrim(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
define('DATA', getenv('NBR_DATA') ?: dirname($root) . '/data');
define('UPLOADS', $root . '/uploads');
define('SITE', getenv('NBR_SITE') ?: 'https://nbarmej.com');
const ADMIN_EMAIL = 'info@nbarmej.com';
const SEED_PASSWORD = '12345678';

@mkdir(DATA, 0750, true);
@mkdir(UPLOADS, 0755, true);
if (!is_file(UPLOADS . '/.htaccess')) {
    file_put_contents(UPLOADS . '/.htaccess', "<FilesMatch \"\\.(php|phtml|phar|pl|cgi)$\">\n  Require all denied\n</FilesMatch>\n");
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function out($d, int $code = 200): never { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): never { out(['error' => $msg], $code); }
function jread(string $f, $def = null) {
    $p = DATA . "/$f";
    return is_file($p) ? (json_decode((string)file_get_contents($p), true) ?? $def) : $def;
}
function jwrite(string $f, $v): void {
    $p = DATA . "/$f";
    file_put_contents($p . '.tmp', json_encode($v, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    rename($p . '.tmp', $p);
}
function input(): array {
    $j = json_decode((string)file_get_contents('php://input'), true);
    return is_array($j) ? $j : [];
}
function session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('nbadm');
    session_set_cookie_params(['path' => '/', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}
function user(): array {
    $u = jread('users.json');
    if (!$u) {
        $u = ['email' => ADMIN_EMAIL, 'hash' => password_hash(SEED_PASSWORD, PASSWORD_DEFAULT), 'default' => true];
        jwrite('users.json', $u);
    }
    return $u;
}
function auth(bool $mutating = true): array {
    session();
    if (empty($_SESSION['in'])) fail('unauthorized', 401);
    if ($mutating && !hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF'] ?? '')) fail('csrf', 403);
    return user();
}
function sessionInfo(array $u): array {
    return ['email' => $u['email'], 'csrf' => $_SESSION['csrf'], 'default' => !empty($u['default'])];
}
function checkNewPassword(string $p): void {
    if (strlen($p) < 8) fail('weak_password');
}
// 5 محاولات فاشلة = قفل 15 دقيقة لكل عنوان IP
function throttle(bool $failed = false, bool $reset = false, string $k = 'login'): void {
    $ip = ($_SERVER['REMOTE_ADDR'] ?? '?') . ':' . $k;
    $a = jread('attempts.json', []);
    $r = $a[$ip] ?? ['n' => 0, 'until' => 0];
    if ($reset) { unset($a[$ip]); jwrite('attempts.json', $a); return; }
    if ($r['until'] > time()) fail('locked', 429);
    if ($failed) {
        $r['n']++;
        if ($r['n'] >= 5) { $r = ['n' => 0, 'until' => time() + 900]; }
        $a[$ip] = $r;
        jwrite('attempts.json', $a);
    }
}

$a = $_GET['a'] ?? '';
$post = $_SERVER['REQUEST_METHOD'] === 'POST';

switch ($a) {
    case 'content': // عام: يقرأه الموقع
        header('Cache-Control: no-cache');
        $p = DATA . '/content.json';
        echo is_file($p) ? file_get_contents($p) : '{}';
        exit;

    case 'login':
        if (!$post) fail('method', 405);
        throttle();
        $b = input();
        $u = user();
        $ok = hash_equals(strtolower($u['email']), strtolower(trim((string)($b['email'] ?? ''))))
            && password_verify((string)($b['password'] ?? ''), $u['hash']);
        if (!$ok) { throttle(true); fail('bad_login', 401); }
        throttle(false, true);
        session();
        session_regenerate_id(true);
        $_SESSION['in'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
        out(sessionInfo($u));

    case 'me':
        session();
        if (empty($_SESSION['in'])) fail('unauthorized', 401);
        out(sessionInfo(user()));

    case 'logout':
        session();
        $_SESSION = [];
        session_destroy();
        out(['ok' => true]);

    case 'save':
        auth();
        $raw = (string)file_get_contents('php://input');
        if (strlen($raw) > 1_000_000) fail('too_big', 413);
        $c = json_decode($raw, true);
        if (!is_array($c)) fail('bad_json');
        $p = DATA . '/content.json';
        if (is_file($p)) copy($p, DATA . '/content.prev.json');
        jwrite('content.json', $c);
        out(['ok' => true]);

    case 'media':
        auth(false);
        $list = [];
        foreach (glob(UPLOADS . '/*.{jpg,png,webp,gif}', GLOB_BRACE) ?: [] as $f) {
            $list[] = ['name' => basename($f), 'url' => '/uploads/' . basename($f), 'size' => filesize($f), 'time' => filemtime($f)];
        }
        usort($list, fn($x, $y) => $y['time'] <=> $x['time']);
        out($list);

    case 'upload':
        auth();
        $f = $_FILES['file'] ?? null;
        if (!$f || $f['error'] !== UPLOAD_ERR_OK) fail('upload_failed');
        if ($f['size'] > 5 * 1024 * 1024) fail('too_big', 413);
        $info = @getimagesize($f['tmp_name']);
        $ext = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'][$info[2] ?? 0] ?? null;
        if (!$ext) fail('bad_type', 415);
        $name = date('ymd') . '-' . bin2hex(random_bytes(5)) . ".$ext";
        if (!move_uploaded_file($f['tmp_name'], UPLOADS . "/$name")) fail('upload_failed', 500);
        out(['name' => $name, 'url' => "/uploads/$name"]);

    case 'delmedia':
        auth();
        $n = basename((string)(input()['name'] ?? ''));
        $p = UPLOADS . "/$n";
        if ($n === '' || $n[0] === '.' || !is_file($p)) fail('not_found', 404);
        unlink($p);
        out(['ok' => true]);

    case 'password':
        $u = auth();
        $b = input();
        if (!password_verify((string)($b['current'] ?? ''), $u['hash'])) fail('bad_current', 403);
        checkNewPassword((string)($b['new'] ?? ''));
        $u['hash'] = password_hash($b['new'], PASSWORD_DEFAULT);
        unset($u['default'], $u['reset']);
        jwrite('users.json', $u);
        out(['ok' => true]);

    case 'forgot': // يرد دائمًا بنجاح حتى لا نكشف وجود البريد
        if (!$post) fail('method', 405);
        throttle(false, false, 'forgot');
        $u = user();
        $email = strtolower(trim((string)(input()['email'] ?? '')));
        if ($email === strtolower($u['email'])) {
            $t = bin2hex(random_bytes(24));
            $u['reset'] = ['hash' => hash('sha256', $t), 'exp' => time() + 3600];
            jwrite('users.json', $u);
            $link = SITE . '/admin/#/reset?token=' . $t;
            $sent = @mail($u['email'], '=?UTF-8?B?' . base64_encode('إعادة تعيين كلمة مرور لوحة التحكم') . '?=',
                "لإعادة تعيين كلمة المرور افتح الرابط التالي (صالح لمدة ساعة):\n$link\n\nإن لم تطلب ذلك فتجاهل هذه الرسالة.",
                "From: " . ADMIN_EMAIL . "\r\nContent-Type: text/plain; charset=UTF-8");
            if (!$sent || in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)) {
                file_put_contents(DATA . '/reset.log', date('c') . " $link\n", FILE_APPEND); // للاختبار المحلي وعند تعطل البريد
            }
        }
        throttle(true, false, 'forgot'); // كل طلب يُحتسب لتقليل الإساءة
        out(['ok' => true]);

    case 'reset':
        if (!$post) fail('method', 405);
        $b = input();
        $u = user();
        $r = $u['reset'] ?? null;
        if (!$r || $r['exp'] < time() || !hash_equals($r['hash'], hash('sha256', (string)($b['token'] ?? '')))) fail('bad_token', 400);
        checkNewPassword((string)($b['new'] ?? ''));
        $u['hash'] = password_hash($b['new'], PASSWORD_DEFAULT);
        unset($u['default'], $u['reset']);
        jwrite('users.json', $u);
        out(['ok' => true]);
}
fail('not_found', 404);
