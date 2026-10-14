# نُبرمِج — موقع الشركة + لوحة التحكم

موقع عربي (RTL) بـ React 19 + Vite، مع لوحة تحكم في `/admin/` وواجهة خلفية بملف PHP واحد (`public/api/index.php`) تخزّن المحتوى في ملفات JSON خارج مجلد الويب.

## التشغيل محليًا
```bash
npm install
php -S localhost:8000 -t public   # لـ /api و/uploads
npm run dev                        # الواجهة (البروكسي إلى :8000)
npm run build                      # الناتج في dist/
```

## النشر (استضافة PHP مشتركة)
ارفع محتوى `dist/` إلى `public_html` مع استثناء `uploads/`. مجلد البيانات `data/` يُنشأ تلقائيًا بجوار `public_html`.

## الإدارة
- `/admin/` — تسجيل الدخول: البريد `info@nbarmej.com` وكلمة المرور الافتراضية في `SEED_PASSWORD` داخل `public/api/index.php`. **غيّرها فور أول دخول** من الحساب ← كلمة المرور.
- المحتوى الافتراضي في `src/content.js`، وما يُحفظ من اللوحة يُدمج فوقه.
- صفحات اللوحة معرّفة في `src/admin/pages.js`.
