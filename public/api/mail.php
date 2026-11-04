<?php
// إرسال بريد عبر SMTP (SSL مباشر على 465) بدون مكتبات. الإعدادات من data/config.php (خارج public_html).
declare(strict_types=1);
if (!defined('DATA')) { http_response_code(404); exit; } // لا يُفتح مباشرة

/** يبني الرسالة كاملة (رؤوس + نص + HTML اختياري) بنهايات أسطر CRLF كما يتطلب SMTP */
function mime_message(string $from, string $fromName, string $to, string $subject, string $text, string $html, string $replyTo, string $host): string {
    $nl = "\r\n";
    $enc = fn(string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
    $b64 = fn(string $t) => chunk_split(base64_encode($t), 76, $nl);
    $headers = [
        'Date: ' . date('r'),
        'From: ' . $enc($fromName) . " <$from>",
        "To: <$to>",
        'Subject: ' . $enc($subject),
        'Message-ID: <' . bin2hex(random_bytes(12)) . "@$host>",
        'MIME-Version: 1.0',
    ];
    if ($replyTo !== '') $headers[] = "Reply-To: <$replyTo>";
    $logo = ($html !== '' && str_contains($html, 'cid:' . EM_LOGO_CID) && is_file(EM_LOGO_FILE)) ? file_get_contents(EM_LOGO_FILE) : '';
    if ($html === '') {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: base64';
        $payload = $b64($text);
    } else { // نص عادي + HTML: العميل يعرض الأنسب (الأخير هو المفضّل)
        $bd = 'nbr_' . bin2hex(random_bytes(8));
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $bd . '"';
        $part = fn(string $type, string $content) => "--$bd{$nl}Content-Type: $type; charset=UTF-8{$nl}Content-Transfer-Encoding: base64{$nl}{$nl}" . $b64($content);
        $payload = $part('text/plain', $text) . $part('text/html', $html) . "--$bd--{$nl}";
        if ($logo !== '') { // الشعار مضمَّن: multipart/related يحوي (النص+HTML) ثم الصورة
            $rel = 'nbr_rel_' . bin2hex(random_bytes(8));
            $headers[count($headers) - 1] = 'Content-Type: multipart/related; type="multipart/alternative"; boundary="' . $rel . '"';
            $img = "--$rel{$nl}Content-Type: image/png; name=\"logo.png\"{$nl}Content-Transfer-Encoding: base64{$nl}Content-ID: <" . EM_LOGO_CID . ">{$nl}Content-Disposition: inline; filename=\"logo.png\"{$nl}{$nl}" . $b64($logo);
            $payload = "--$rel{$nl}Content-Type: multipart/alternative; boundary=\"$bd\"{$nl}{$nl}" . $payload . $img . "--$rel--{$nl}";
        }
    }
    return implode($nl, $headers) . $nl . $nl . $payload;
}

/** @return array{0:bool,1:string} [نجح؟, رسالة الخطأ] */
function smtp_send(string $to, string $subject, string $body, ?array $smtp = null, string $replyTo = '', string $html = ''): array {
    $c = $smtp ?? (cfg()['smtp'] ?? []);
    if (empty($c['host']) || empty($c['user']) || empty($c['pass'])) return [false, 'smtp_not_configured'];
    $port = (int)($c['port'] ?? 465);
    $from = (string)($c['from'] ?? $c['user']);
    $fromName = (string)($c['from_name'] ?? 'Nbarmej');
    $errno = 0; $errstr = '';
    $fp = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . $c['host'] . ':' . $port, $errno, $errstr, 12, STREAM_CLIENT_CONNECT);
    if (!$fp) return [false, "connect: $errstr ($errno)"];
    stream_set_timeout($fp, 12);

    $read = function () use ($fp): array { // يقرأ الرد كاملًا (أسطر 250- حتى 250 )
        $text = ''; $code = 0;
        while (($line = fgets($fp, 1024)) !== false) {
            $text .= $line;
            $code = (int)substr($line, 0, 3);
            if (strlen($line) < 4 || $line[3] !== '-') break;
        }
        return [$code, trim($text)];
    };
    $cmd = function (string $line, array $ok) use ($fp, $read): ?string {
        fwrite($fp, $line . "\r\n");
        [$code, $text] = $read();
        return in_array($code, $ok, true) ? null : "$code $text";
    };

    try {
        [$code, $text] = $read();
        if ($code !== 220) return [false, "greeting: $code $text"];
        $host = parse_url(SITE, PHP_URL_HOST) ?: 'localhost';
        if ($e = $cmd("EHLO $host", [250])) return [false, "ehlo: $e"];
        if ($port !== 465) { // STARTTLS للمنفذ 587
            if ($e = $cmd('STARTTLS', [220])) return [false, "starttls: $e"];
            if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) return [false, 'tls_failed'];
            if ($e = $cmd("EHLO $host", [250])) return [false, "ehlo2: $e"];
        }
        if ($e = $cmd('AUTH LOGIN', [334])) return [false, "auth: $e"];
        if ($e = $cmd(base64_encode((string)$c['user']), [334])) return [false, "auth-user: $e"];
        if ($e = $cmd(base64_encode((string)$c['pass']), [235])) return [false, "auth-pass: $e"];
        if ($e = $cmd("MAIL FROM:<$from>", [250])) return [false, "mail-from: $e"];
        if ($e = $cmd("RCPT TO:<$to>", [250, 251])) return [false, "rcpt: $e"];
        if ($e = $cmd('DATA', [354])) return [false, "data: $e"];

        $msg = mime_message($from, $fromName, $to, $subject, $body, $html, $replyTo, $host);
        fwrite($fp, $msg . "\r\n.\r\n");
        [$code, $text] = $read();
        if ($code !== 250) return [false, "send: $code $text"];
        $cmd('QUIT', [221]);
        return [true, ''];
    } finally {
        if (is_resource($fp)) fclose($fp);
    }
}
