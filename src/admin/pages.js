// تعريف صفحات اللوحة: كل صفحة = مفتاح في المحتوى + حقولها. النصوص 'عربي|English'.
// kind: form (كائن واحد) | list (قائمة مرتبة). k='*' يعني الكائن كله، وk='a.b' مسار متداخل.
const T = (label, k, extra = {}) => ({ type: 'text', label, k, ...extra })
const TA = (label, k, extra = {}) => ({ type: 'textarea', label, k, ...extra })

export const PAGES = {
  brand: {
    title: 'الهوية والشريط العلوي|Brand & top ribbon', icon: 'type', kind: 'form', key: 'brand',
    fields: [
      { type: 'show', label: 'إظهار الشريط العلوي|Show top ribbon', k: 'ribbonOff' },
      T('اسم الشركة|Company name', 'name'),
      T('الشعار (الاسم ممدودًا)|Logo wordmark (stretched name)', 'mark', { hint: 'يُعرض في الهيدر والفوتر|Shown in header and footer' }),
      T('الشعار النصي في الفوتر|Footer tagline', 'tagline', { wide: true }),
      T('نص الشريط العلوي|Top ribbon text', 'ribbon', { wide: true }),
      T('نص رابط الشريط|Ribbon link text', 'ribbonLink'),
    ],
  },
  hero: {
    title: 'الواجهة الرئيسية|Hero', icon: 'layout', kind: 'form', key: 'hero',
    fields: [
      { type: 'show', label: 'إظهار شريط التقنيات المتحرك|Show tech marquee', k: 'marqueeOff' },
      T('العنوان — السطر الأول|Title — line 1', 'title1'),
      T('العنوان — كلمة الربط|Title — connector', 'title2'),
      T('الكلمة المميزة بالّلون|Highlighted word', 'accent'),
      TA('النص التعريفي|Intro text', 'lead', { rows: 4, wide: true }),
      T('نص الزر الأول (واتساب)|Primary button (WhatsApp)', 'cta1'),
      T('نص الزر الثاني (نماذج الأعمال)|Second button (works)', 'cta2'),
      { type: 'tags', label: 'نقاط الثقة|Trust points', k: 'trust', wide: true },
      T('رقم الشارة|Badge number', 'badgeNum'),
      T('نص الشارة|Badge text', 'badgeText'),
      { type: 'image', label: 'صورة الواجهة|Hero image', k: 'image', wide: true },
    ],
  },
  stats: {
    title: 'الأرقام|Stats', icon: 'star', kind: 'list', key: 'stats', blank: { n: '', l: '' },
    itemTitle: (x) => [x.n, x.l].filter(Boolean).join(' — '),
    fields: [T('الرقم|Number', 'n'), T('الوصف|Label', 'l')],
  },
  stack: {
    title: 'التقنيات (الشريط المتحرك)|Tech stack (marquee)', icon: 'layers', kind: 'form', key: '',
    fields: [{ type: 'tags', label: 'التقنيات|Technologies', k: 'stack', wide: true, hint: 'اضغط Enter لإضافة عنصر|Press Enter to add' }],
  },
  start: {
    title: 'وش تحتاج تبدأ؟|What do you need to start?', icon: 'steps', kind: 'list', key: 'start', blank: { title: '', text: '', cta: 'أبغى هذا', icon: 'rocket' },
    itemTitle: (x) => x.title,
    fields: [{ type: 'select', label: 'الأيقونة|Icon', k: 'icon', options: ['rocket|صاروخ Rocket', 'building|شركة Company', 'cart|متجر Store', 'phone|جوال Mobile', 'dashboard|لوحة Dashboard', 'wrench|تحسين Improve'] }, T('العنوان|Title', 'title', { wide: true }), TA('الوصف|Description', 'text', { wide: true }), T('نص الزر|Button text', 'cta')],
  },
  points: {
    title: 'نقاط المشكلة|Problem points', icon: 'help', kind: 'list', key: 'points', blank: { t: '' },
    itemTitle: (x) => x.t,
    fields: [TA('النقطة|Point', 't', { wide: true, rows: 2 })],
  },
  pricing: {
    title: 'الأسعار|Pricing', icon: 'star', kind: 'list', key: 'pricing', blank: { name: '', price: '', text: '', cta: 'احسب تكلفة مشروعي' },
    itemTitle: (x) => [x.name, x.price].filter(Boolean).join(' — '),
    fields: [T('الاسم|Name', 'name', { wide: true }), T('السعر|Price', 'price', { hint: 'مثال: تبدأ من ٢٬٤٠٠ ريال|e.g. Starts from 2,400' }), T('نص الزر|Button text', 'cta'), TA('الوصف|Description', 'text', { wide: true })],
  },
  services: {
    title: 'الخدمات|Services', icon: 'layers', kind: 'list', key: 'services', blank: { img: '', title: '', text: '', tags: [], cta: '' },
    itemTitle: (x) => x.title, itemImg: 'img',
    fields: [
      { type: 'image', label: 'الصورة|Image', k: 'img', wide: true },
      T('اسم الخدمة|Service name', 'title', { wide: true }),
      TA('الوصف|Description', 'text', { wide: true }),
      { type: 'tags', label: 'الوسوم|Tags', k: 'tags', wide: true },
      T('نص الزر (فارغ = الافتراضي)|Button text (empty = default)', 'cta'),
    ],
  },
  projects: {
    title: 'المشاريع|Projects', icon: 'image', kind: 'list', key: 'projects', blank: { title: '', type: '', year: '', img: '', result: '', solution: '', cta: '' },
    itemTitle: (x) => x.title, itemImg: 'img',
    fields: [
      { type: 'image', label: 'صورة المشروع|Project image', k: 'img', wide: true },
      T('اسم المشروع|Project name', 'title'),
      T('نص الزر|Button text', 'cta'),
      TA('الوصف|Description', 'type', { wide: true, rows: 2 }),
      TA('الحل|Solution', 'solution', { wide: true, rows: 2 }),
      T('السنة (اختياري)|Year (optional)', 'year'),
      T('نتيجة (اختياري — لا تضع رقمًا غير مؤكد)|Result (optional — only verified numbers)', 'result'),
    ],
  },
  process: {
    title: 'آلية العمل|How we work', icon: 'steps', kind: 'list', key: 'process', blank: { t: '', d: '' },
    itemTitle: (x) => x.t,
    fields: [T('عنوان الخطوة|Step title', 't', { wide: true }), TA('الوصف|Description', 'd', { wide: true })],
  },
  faq: {
    title: 'الأسئلة الشائعة|FAQ', icon: 'help', kind: 'list', key: 'faq', blank: { q: '', a: '' },
    itemTitle: (x) => x.q,
    fields: [T('السؤال|Question', 'q', { wide: true }), TA('الإجابة|Answer', 'a', { rows: 4, wide: true })],
  },
  quote: {
    title: 'أداة عرض السعر|Quote tool', icon: 'quote', kind: 'form', key: 'quote',
    note: 'قائمة الخدمات في الأداة تؤخذ تلقائيًا من صفحة الخدمات.|The service list in the tool comes from the Services page automatically.',
    fields: [
      { type: 'tags', label: 'خيارات الميزانية|Budget options', k: 'budget', wide: true },
      { type: 'tags', label: 'خيارات المدة|Timeline options', k: 'timeline', wide: true },
    ],
  },
  sections: {
    title: 'عناوين الأقسام|Section headings', icon: 'type', kind: 'form', key: 'sections',
    fields: [
      { type: 'heading', label: 'وش تحتاج تبدأ؟|What do you need?' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'start.off' },
      T('الوسم|Tag', 'start.tag'), T('العنوان|Title', 'start.title'),
      { type: 'heading', label: 'المشكلة|Problem' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'problem.off' },
      T('الوسم|Tag', 'problem.tag'), T('العنوان|Title', 'problem.title'), TA('النص|Text', 'problem.text', { wide: true }),
      T('وسم النقاط|Points tag', 'problem.tag2'), T('نص الزر|Button text', 'problem.cta'),
      { type: 'heading', label: 'الخدمات|Services' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'services.off' },
      T('الوسم|Tag', 'services.tag'), T('العنوان|Title', 'services.title'),
      TA('النص|Text', 'services.text', { wide: true }), T('نص رابط الخدمة|Service link text', 'services.cta'),
      { type: 'heading', label: 'الأعمال|Projects' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'work.off' },
      T('الوسم|Tag', 'work.tag'), T('العنوان|Title', 'work.title'),
      { type: 'heading', label: 'آلية العمل|How we work' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'process.off' },
      T('الوسم|Tag', 'process.tag'), T('العنوان|Title', 'process.title'),
      { type: 'heading', label: 'الأسعار|Pricing' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'pricing.off' },
      T('الوسم|Tag', 'pricing.tag'), T('العنوان|Title', 'pricing.title'),
      { type: 'heading', label: 'أداة عرض السعر|Quote tool' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'quote.off' },
      T('الوسم|Tag', 'quote.tag'), T('العنوان|Title', 'quote.title'), TA('النص|Text', 'quote.text', { wide: true }),
      { type: 'heading', label: 'لماذا نبرمج؟|Why us' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'why.off' },
      T('الوسم|Tag', 'why.tag'), T('العنوان|Title', 'why.title'),
      { type: 'heading', label: 'الأسئلة الشائعة|FAQ' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'faq.off' },
      T('الوسم|Tag', 'faq.tag'), T('العنوان|Title', 'faq.title'),
      { type: 'heading', label: 'الدعوة الأخيرة|Final call to action' },
      { type: 'show', label: 'إظهار القسم في الموقع|Show section on site', k: 'final.off' },
      TA('العنوان (سطر جديد = سطر)|Title (new line = line break)', 'final.title', { wide: true }), TA('النص|Text', 'final.text', { wide: true }), T('نص الزر|Button text', 'final.cta'),
    ],
  },
  contact: {
    title: 'التواصل|Contact', icon: 'phone', kind: 'form', key: 'contact',
    fields: [
      TA('رسالة واتساب الجاهزة|Ready WhatsApp message', 'waMessage', { wide: true, rows: 3, hint: 'تُفتح عند الضغط على أزرار واتساب|Opened by WhatsApp buttons' }),
      T('رقم واتساب|WhatsApp number', 'whatsapp', { ltr: true, ph: '9665XXXXXXXX', hint: 'بصيغة دولية، أرقام فقط|International format, digits only' }),
      T('رقم الهاتف|Phone number', 'phone', { type: 'tel', ltr: true, ph: '+9665XXXXXXXX' }),
      T('البريد الإلكتروني|Email', 'email', { type: 'email', ltr: true }),
      TA('العنوان|Address', 'address', { wide: true, rows: 2 }),
    ],
  },
  hours: {
    title: 'أيام وساعات العمل|Working days & hours', icon: 'clock', kind: 'form', key: 'hours',
    fields: [{ type: 'hours', label: 'أيام العمل والوقت|Days and time', k: '*', wide: true }],
  },
  socials: {
    title: 'وسائل التواصل الاجتماعي|Social media', icon: 'share', kind: 'list', key: 'socials', blank: { name: '', url: '', icon: 'website' },
    note: 'الحساب الذي يُترك رابطه فارغًا لا يظهر في الموقع.|An account with an empty link is hidden on the site.',
    itemTitle: (x) => x.name, itemIcon: 'icon',
    fields: [
      T('الاسم|Name', 'name'),
      T('الرابط|Link', 'url', { type: 'url', ltr: true, ph: 'https://…' }),
      { type: 'icon', label: 'الأيقونة|Icon', k: 'icon', wide: true },
    ],
  },
}

// الشريط الجانبي: مجموعات متداخلة. id يطابق PAGES أو صفحات اللوحة الخاصة (dash, media, password)
export const NAV = [
  { id: 'dash', label: 'لوحة البداية|Dashboard', icon: 'home' },
  {
    key: 'site', label: 'الموقع|Website', icon: 'globe', children: [
      {
        key: 'home', label: 'الصفحة الرئيسية|Home page', icon: 'layout', children: [
          { id: 'hero' }, { id: 'start' }, { id: 'points' }, { id: 'services' }, { id: 'projects' }, { id: 'process' },
          { id: 'pricing' }, { id: 'quote' }, { id: 'stats' }, { id: 'faq' }, { id: 'stack' }, { id: 'sections' },
        ],
      },
      { id: 'brand' },
    ],
  },
  { key: 'company', label: 'معلومات الشركة|Company', icon: 'building', children: [{ id: 'contact' }, { id: 'hours' }, { id: 'socials' }] },
  { id: 'media', label: 'مكتبة الصور|Media library', icon: 'image' },
  { key: 'account', label: 'الحساب|Account', icon: 'user', children: [{ id: 'password', label: 'كلمة المرور|Password', icon: 'key' }] },
]

export const titleOf = (n) => n.label || PAGES[n.id]?.title
export const iconOf = (n) => n.icon || PAGES[n.id]?.icon
