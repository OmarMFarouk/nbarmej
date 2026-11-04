<?php
// يُشغَّل من cron في hPanel كل 10 دقائق:  */10 * * * * php /home/<user>/domains/nbarmej.com/public_html/api/cron.php
// يعيد محاولة إشعارات الطلبات التي فشلت. لا يعمل عبر المتصفح.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('NBR_LIB', 1);
$_SERVER['DOCUMENT_ROOT'] = dirname(__DIR__);
require __DIR__ . '/index.php';
echo retry_pending(), " retried\n";
