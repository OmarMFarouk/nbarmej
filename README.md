# نُبرمِج — موقع الشركة + لوحة التحكم

موقع عربي (RTL) بـ React 19 + Vite، مع لوحة تحكم في `/admin/` وواجهة خلفية بملف PHP واحد (`public/api/index.php`) تخزّن المحتوى في ملفات JSON خارج مجلد الويب.

## التشغيل محليًا
```bash
npm install
php -S localhost:8000 -t public   # لـ /api و/uploads
npm run dev                        # الواجهة (البروكسي إلى :8000)
npm run build                      # الناتج في dist/
```

## النشر
يتم تلقائيًا عبر GitHub Actions (`.github/workflows/deploy.yml`) عند كل دفع إلى `main`: يجلب المحتوى الحالي من لوحة التحكم، يبني الموقع ويولّد الصفحات مسبقًا (الرئيسية، الخدمات، الباقات، الخصوصية)، ثم يرفع `dist/` إلى `public_html` عبر SSH. أسرار المستودع: `SSH_KEY` و`SSH_HOST` و`SSH_PORT` و`SSH_USER` (و`DEPLOY_PATH` اختياري).
`uploads/` و`data/` لا تُمس.

## الإدارة
- `/admin/` — تسجيل الدخول: البريد `info@nbarmej.com`. كلمة المرور الافتراضية الأولى في `SEED_PASSWORD` داخل `public/api/index.php`؛ **غيّرها** من الحساب ← كلمة المرور.
- المحتوى الافتراضي في `src/content.js`، وما يُحفظ من اللوحة يُدمج فوقه. صفحات اللوحة في `src/admin/pages.js`.
- `/admin/pages/` — محرّر الباقات وقسم الباقات وسياسة الخصوصية (الافتراضيات تُولَّد وقت البناء في `defaults.json`).
- `/admin/#/requests` — طلبات العملاء: الحالة (جديد/مؤهل/غير مؤهل/تم التعاقد)، ملاحظات، تصدير CSV، إعادة إرسال الإشعار.

## نموذج الطلب (MySQL + SMTP)
`POST /api/?a=request` يحفظ الطلب في MySQL (جدول `requests` يُنشأ تلقائيًا)، يولّد رقم طلب `NB-YYMMDD-NNNN`، ثم يرسل بريدًا بتفاصيل الطلب. التحقق من الحقول والجوال من جهة الخادم، منع التكرار (مفتاح إرسال + نفس الجوال خلال 10 دقائق)، حد 5 طلبات/ساعة لكل IP، وحقل مصيدة للروبوتات. فشل الإشعار لا يضيّع الطلب: يُسجَّل الخطأ ويُعاد الإرسال عبر cron.
- مصدر الزيارة (UTM وGCLID) يُلتقط في المتصفح (`src/tracking.js`) ويُحفظ مع الطلب. بعد نجاح الحفظ يُدفع حدث `quote_request_submitted` إلى `dataLayer` (GTM) مرة واحدة لكل رقم طلب — اربط به وسم تحويل Google Ads.
- الأسرار في `data/config.php` على الخادم (خارج `public_html` وخارج Git): اتصال قاعدة البيانات، SMTP، بريد الإشعار، وإعدادات واتساب (`whatsapp.enabled=false` افتراضيًا).
- إعادة المحاولة: أضف في hPanel ← Cron Jobs كل 10 دقائق: `php /home/<user>/domains/nbarmej.com/public_html/api/cron.php`

مثال `data/config.php`:
```php
<?php
return [
  'db' => ['host' => 'localhost', 'name' => '...', 'user' => '...', 'pass' => '...'],
  'smtp' => ['host' => 'smtp.hostinger.com', 'port' => 465, 'user' => 'info@nbarmej.com', 'pass' => '...', 'from' => 'info@nbarmej.com', 'from_name' => 'نبرمج'],
  'notify_to' => 'info@nbarmej.com',
  'salt' => 'نص عشوائي طويل',
  'whatsapp' => ['enabled' => false, 'token' => '', 'phone_id' => '', 'to' => '9665XXXXXXXX', 'template' => 'new_request', 'lang' => 'ar'],
];
```

## ملاحظات
- محتوى `/admin/pages/` (الباقات/الخصوصية) و`hero.cta2Href` (رابط الزر الثاني في الواجهة) يُحرَّران من اللوحة.
- نسخة المصدر القديمة قبل إعادة البناء: فرع `backup/github-main-before-sync`، ونسخة الملفات المبنية: `backup/static-snapshot-2026-11-04`.
