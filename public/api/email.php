<?php
// قوالب البريد بهوية نبرمج: جداول + ستايل داخلي (متوافقة مع Gmail/Outlook/Apple Mail) ومتجاوبة على الجوال.
declare(strict_types=1);
if (!defined('DATA')) { http_response_code(404); exit; } // لا يُفتح مباشرة

const EM_ORANGE = '#ff5a1f';
const EM_INK = '#151515';
const EM_DARK = '#0e0e0c';
const EM_CREAM = '#f3f0e8';
const EM_MUTED = '#6c6a63';
const EM_LINE = '#e8e4da';

function h(mixed $s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

/** بيانات الشركة من محتوى لوحة التحكم (مع قيم افتراضية) */
function brand_info(): array {
    $c = jread('content.json', []) ?: [];
    $co = $c['contact'] ?? [];
    $hours = $c['hours'] ?? ['days' => [0, 1, 2, 3, 4], 'from' => '09:00', 'to' => '18:00'];
    return [
        'name' => $c['brand']['name'] ?? 'نُبرمِج',
        'tagline' => $c['brand']['tagline'] ?? '',
        'phone' => $co['phone'] ?? '',
        'email' => $co['email'] ?? 'info@nbarmej.com',
        'address' => $co['address'] ?? '',
        'registration' => $co['registration'] ?? '',
        'hours' => em_hours($hours),
    ];
}

function em_digits(string $s): string { return strtr($s, ['0' => '٠', '1' => '١', '2' => '٢', '3' => '٣', '4' => '٤', '5' => '٥', '6' => '٦', '7' => '٧', '8' => '٨', '9' => '٩']); }

function em_hours(array $h): string {
    $names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    $days = array_values(array_unique(array_filter(array_map('intval', $h['days'] ?? []), fn($d) => $d >= 0 && $d <= 6)));
    sort($days);
    if (!$days) return '';
    $runs = [];
    foreach ($days as $d) {
        $last = count($runs) - 1;
        if ($last >= 0 && $d === $runs[$last][1] + 1) $runs[$last][1] = $d; else $runs[] = [$d, $d];
    }
    $txt = implode('، ', array_map(fn($r) => $r[0] === $r[1] ? $names[$r[0]] : ($r[1] - $r[0] === 1 ? $names[$r[0]] . ' و' . $names[$r[1]] : $names[$r[0]] . ' – ' . $names[$r[1]]), $runs));
    $t12 = function (string $hm): string {
        [$hh, $mm] = array_map('intval', explode(':', $hm . ':0'));
        $x = $hh % 12 ?: 12;
        return em_digits($mm ? sprintf('%d:%02d', $x, $mm) : (string)$x) . ($hh < 12 ? ' ص' : ' م');
    };
    return !empty($h['from']) && !empty($h['to']) ? "$txt " . $t12($h['from']) . ' – ' . $t12($h['to']) : $txt;
}

/** زر «مضمّن» يعمل في Outlook أيضًا */
function em_button(string $label, string $href, string $bg = EM_ORANGE, string $fg = EM_INK): string {
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn-wrap" style="display:inline-table;margin:4px"><tr><td align="center" bgcolor="' . $bg . '" style="border-radius:12px;background:' . $bg . '">'
        . '<a href="' . h($href) . '" target="_blank" style="display:inline-block;padding:14px 26px;font:700 15px/1.2 \'Segoe UI\',Tahoma,Arial,sans-serif;color:' . $fg . ';text-decoration:none;border-radius:12px">' . h($label) . '</a></td></tr></table>';
}

function em_row(string $label, string $valueHtml): string {
    return '<tr><td class="stack lbl" valign="top" width="130" style="padding:10px 0;border-bottom:1px solid ' . EM_LINE . ';color:' . EM_MUTED . ';font-size:13px;line-height:1.6">' . h($label) . '</td>'
        . '<td class="stack" valign="top" style="padding:10px 0;border-bottom:1px solid ' . EM_LINE . ';color:' . EM_INK . ';font-size:16px;font-weight:600;line-height:1.7">' . $valueHtml . '</td></tr>';
}

/** الهيكل العام: شريط علوي بالشعار، بطاقة المحتوى، تذييل بمعلومات الشركة */
function em_layout(string $title, string $preheader, string $bodyHtml): string {
    $b = brand_info();
    $logo = SITE . '/images/logo/logo-orange.png';
    $contact = [];
    if ($b['phone']) $contact[] = '<a href="tel:' . h($b['phone']) . '" style="color:' . EM_INK . ';text-decoration:none" dir="ltr">' . h($b['phone']) . '</a>';
    if ($b['email']) $contact[] = '<a href="mailto:' . h($b['email']) . '" style="color:' . EM_INK . ';text-decoration:none" dir="ltr">' . h($b['email']) . '</a>';
    $contact[] = '<a href="' . h(SITE) . '" style="color:' . EM_INK . ';text-decoration:none" dir="ltr">' . h(preg_replace('#^https?://#', '', SITE)) . '</a>';
    $lines = [];
    if ($b['address']) $lines[] = h($b['address']);
    if ($b['hours']) $lines[] = 'أوقات العمل: ' . h($b['hours']);
    if ($b['registration']) $lines[] = 'السجل التجاري: <span dir="ltr">' . h($b['registration']) . '</span>';
    return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>' . h($title) . '</title>'
        . '<style>@media only screen and (max-width:620px){.wrap{width:100%!important}.px{padding-left:20px!important;padding-right:20px!important}.stack{display:block!important;width:100%!important}.lbl{padding-bottom:0!important;border-bottom:0!important}.btn-wrap{display:block!important;width:100%!important;margin:8px 0!important}.btn-wrap a{display:block!important}}</style></head>'
        . '<body style="margin:0;padding:0;background:' . EM_CREAM . ';-webkit-text-size-adjust:100%">'
        . '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' . h($preheader) . str_repeat('&nbsp;&zwnj;', 30) . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' . EM_CREAM . '" style="background:' . EM_CREAM . '"><tr><td align="center" style="padding:24px 12px">'
        . '<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;font-family:\'Segoe UI\',Tahoma,Arial,sans-serif">'
        // الشريط العلوي
        . '<tr><td height="6" bgcolor="' . EM_ORANGE . '" style="background:' . EM_ORANGE . ';height:6px;line-height:6px;font-size:0;border-radius:16px 16px 0 0">&nbsp;</td></tr>'
        . '<tr><td align="center" bgcolor="' . EM_DARK . '" style="background:' . EM_DARK . ';padding:26px 24px"><a href="' . h(SITE) . '" target="_blank"><img src="' . h($logo) . '" width="190" alt="' . h($b['name']) . '" style="display:block;border:0;outline:none;width:190px;max-width:100%;height:auto"></a></td></tr>'
        // البطاقة
        . '<tr><td class="px" bgcolor="#ffffff" style="background:#ffffff;padding:34px 36px 30px;color:' . EM_INK . ';text-align:right">' . $bodyHtml . '</td></tr>'
        // التذييل
        . '<tr><td class="px" bgcolor="#faf8f3" style="background:#faf8f3;padding:22px 36px;border-top:1px solid ' . EM_LINE . ';border-radius:0 0 16px 16px;text-align:center;color:' . EM_MUTED . ';font-size:13px;line-height:1.9">'
        . '<strong style="color:' . EM_INK . ';font-size:15px">' . h($b['name']) . '</strong>'
        . ($b['tagline'] ? '<br>' . h($b['tagline']) : '')
        . '<br>' . implode('', array_map(fn($c) => '<span style="display:inline-block;margin:0 10px">' . $c . '</span>', $contact))
        . ($lines ? '<br>' . implode('<br>', $lines) : '')
        . '</td></tr>'
        . '<tr><td align="center" style="padding:14px 8px;color:#9b988f;font-size:12px;line-height:1.7">هذه رسالة آلية من نظام ' . h($b['name']) . ' — لا حاجة للرد عليها.</td></tr>'
        . '</table></td></tr></table></body></html>';
}

function em_heading(string $text, string $sub = ''): string {
    return '<h1 style="margin:0 0 6px;font:800 24px/1.5 \'Segoe UI\',Tahoma,Arial,sans-serif;color:' . EM_INK . '">' . h($text) . '</h1>'
        . ($sub !== '' ? '<p style="margin:0 0 20px;color:' . EM_MUTED . ';font-size:15px;line-height:1.8">' . h($sub) . '</p>' : '');
}

/** بريد «طلب جديد» لفريق نبرمج */
function email_new_request(array $r): array {
    $st = ['new' => 'جديد', 'qualified' => 'مؤهل', 'unqualified' => 'غير مؤهل', 'signed' => 'تم التعاقد'];
    $phone = (string)$r['phone'];
    $chips = '';
    foreach (preg_split('/\s*،\s*/u', (string)$r['service']) ?: [] as $s) {
        if ($s !== '') $chips .= '<span style="display:inline-block;margin:2px 0 2px 6px;padding:4px 12px;background:' . EM_CREAM . ';border:1px solid ' . EM_LINE . ';border-radius:999px;font-size:14px;font-weight:600">' . h($s) . '</span>';
    }
    $badge = '<span style="display:inline-block;padding:5px 14px;background:#fff1e9;color:#ac4c1b;border-radius:999px;font-size:13px;font-weight:800" dir="ltr">' . h($r['order_no'] ?? '') . '</span>'
        . ' <span style="display:inline-block;padding:5px 14px;background:#e7f6ec;color:#1f7a45;border-radius:999px;font-size:13px;font-weight:800">' . h($st[$r['status'] ?? 'new'] ?? 'جديد') . '</span>';
    $rows = em_row('الاسم', h($r['name']))
        . em_row('الجوال', '<a href="tel:' . h($phone) . '" style="color:' . EM_INK . ';text-decoration:none" dir="ltr">' . h($phone) . '</a>')
        . em_row('الخدمات', $chips)
        . em_row('الميزانية', h(($r['budget'] ?? '') ?: '—'))
        . em_row('المدة المطلوبة', h(($r['timeline'] ?? '') ?: '—'))
        . em_row('تفاصيل إضافية', nl2br(h(($r['details'] ?? '') ?: '—')))
        . em_row('وقت الطلب', '<span dir="ltr">' . h($r['created_at'] ?? '') . '</span>');
    $utm = trim(($r['utm_source'] ?? '') . ' / ' . ($r['utm_medium'] ?? '') . ' / ' . ($r['utm_campaign'] ?? ''), ' /');
    $src = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;background:#faf8f3;border:1px solid ' . EM_LINE . ';border-radius:12px"><tr><td style="padding:14px 18px;font-size:13px;line-height:1.9;color:' . EM_MUTED . '">'
        . '<strong style="color:' . EM_INK . '">مصدر الزيارة</strong><br>'
        . 'المصدر: <span dir="ltr">' . h(($r['source'] ?? '') ?: 'direct') . '</span>'
        . ($utm !== '' ? '<br>الحملة: <span dir="ltr">' . h($utm) . (($r['utm_term'] ?? '') ? ' | ' . h($r['utm_term']) : '') . '</span>' : '')
        . (($r['gclid'] ?? '') ? '<br>GCLID: <span dir="ltr" style="word-break:break-all">' . h($r['gclid']) . '</span>' : '')
        . (($r['landing_url'] ?? '') ? '<br>الصفحة: <span dir="ltr" style="word-break:break-all">' . h($r['landing_url']) . '</span>' : '')
        . '</td></tr></table>';
    $wa = 'https://wa.me/' . ltrim($phone, '+') . '?text=' . rawurlencode('السلام عليكم ' . $r['name'] . '، معك فريق نبرمج بخصوص طلبك رقم ' . ($r['order_no'] ?? '') . '.');
    $body = em_heading('طلب جديد وصل من الموقع', 'عميل جديد يطلب عرض سعر — تواصل معه بأسرع وقت.')
        . '<p style="margin:0 0 18px">' . $badge . '</p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $rows . '</table>'
        . '<div style="text-align:center;margin:28px 0 4px">' . em_button('تواصل مع العميل على واتساب', $wa, '#25d366', '#ffffff') . em_button('افتح الطلب في لوحة التحكم', SITE . '/admin/#/requests') . '</div>'
        . $src;
    return [
        'subject' => 'طلب جديد ' . ($r['order_no'] ?? '') . ' — ' . $r['name'],
        'html' => em_layout('طلب جديد ' . ($r['order_no'] ?? ''), $r['name'] . ' · ' . $phone . ' · ' . $r['service'], $body),
    ];
}

/** بريد إعادة تعيين كلمة مرور لوحة التحكم */
function email_password_reset(string $link): array {
    $body = em_heading('إعادة تعيين كلمة المرور', 'وصلنا طلب لإعادة تعيين كلمة مرور لوحة تحكم الموقع.')
        . '<p style="margin:0 0 22px;font-size:16px;line-height:1.9">اضغط الزر التالي لاختيار كلمة مرور جديدة. الرابط صالح لمدة <strong>ساعة واحدة</strong> ويعمل مرة واحدة فقط.</p>'
        . '<div style="text-align:center;margin:8px 0 26px">' . em_button('تعيين كلمة مرور جديدة', $link) . '</div>'
        . '<p style="margin:0 0 6px;color:' . EM_MUTED . ';font-size:13px;line-height:1.8">إن لم يعمل الزر، انسخ هذا الرابط وافتحه في المتصفح:</p>'
        . '<p style="margin:0 0 22px;padding:12px 14px;background:' . EM_CREAM . ';border-radius:10px;font-size:12px;line-height:1.7;word-break:break-all;direction:ltr;text-align:left;color:' . EM_INK . '">' . h($link) . '</p>'
        . '<p style="margin:0;padding:12px 14px;background:#fff6f0;border:1px solid #f6d5c0;border-radius:10px;color:#8a4a22;font-size:13px;line-height:1.8">لم تطلب ذلك؟ تجاهل هذه الرسالة وستبقى كلمة مرورك كما هي.</p>';
    return [
        'subject' => 'إعادة تعيين كلمة مرور لوحة التحكم',
        'html' => em_layout('إعادة تعيين كلمة المرور', 'رابط صالح لمدة ساعة لتعيين كلمة مرور جديدة.', $body),
    ];
}

/** بريد اختبار الإرسال */
function email_test(): array {
    $body = em_heading('اختبار البريد يعمل ✓', 'هذه رسالة تجريبية للتأكد من إعدادات الإرسال وشكل القالب.')
        . '<p style="margin:0 0 22px;font-size:16px;line-height:1.9">إن وصلتك هذه الرسالة بشكل سليم فإشعارات الطلبات وإعادة تعيين كلمة المرور ستصلك بنفس الهوية.</p>'
        . '<div style="text-align:center">' . em_button('افتح لوحة التحكم', SITE . '/admin/') . '</div>';
    return ['subject' => 'اختبار البريد — نبرمج', 'html' => em_layout('اختبار البريد', 'رسالة تجريبية من نظام نبرمج.', $body)];
}
