# برومبتات توليد الصور (Gemini)

احفظ كل صورة في `public/images/` بنفس اسم الملف المذكور. قبل توفير الصور يعرض الموقع بديلًا مخططًا تلقائيًا فلا ينكسر التصميم.

**هوية العلامة في كل البرومبتات:** برتقالي إشارة `#FF5A1F`، أسود حبري `#0E0E0C`، أبيض عظمي `#F3F0E8`، رمادي دافئ `#9A968C`. الأسلوب تحريري ملموس (Swiss / brutalist)، غير لامع، ولا يبدو مولّدًا بالذكاء الاصطناعي.

**السياق السعودي المطلوب في كل صور الأشخاص:** رجال بالثوب الأبيض والشماغ الأحمر أو الغترة البيضاء مع العقال، ونساء بالعباية السوداء الأنيقة والحجاب (بعضهن بعباية ملوّنة عصرية)، في بيئات مكاتب سعودية حديثة — واجهات زجاجية، نخيل خارج النافذة، ضوء صحراوي دافئ، أثاث خشبي فاتح، فناجين قهوة عربية ودلّة. مظهر مهني عصري يشبه بيئات العمل في الرياض وجدة، لا صور نمطية سياحية.

> **برومبت سلبي مشترك (أضفه لكل صورة فيها أشخاص):**
> no extra fingers, no deformed hands, no distorted faces, no crooked eyes, no warped text, no gibberish Arabic letters, no fake Arabic-looking scribbles, no mirrored or reversed Arabic, no camels, no desert dunes as a backdrop, no tourist clichés, no falcons, no gold palace interiors, no revealing clothing, no alcohol, no pork, no religious symbols, no crowds, no neon, no purple or blue gradients, no cyberpunk, no 3D CGI plastic look, no stock-photo fake smiling, no watermark, no logos of real brands, no oversaturation, no heavy vignette, no motion blur

---

## ١. شعار مختصر: `logo.png` (1024×1024، خلفية شفافة)
**Prompt:** Minimal geometric logo mark for a Saudi software house. A rounded square tile in flat signal orange #FF5A1F rotated -6 degrees, containing the glyphs "N/" in ink black #0E0E0C in a heavy monospaced typeface with precise kerning. Flat vector, crisp edges, centered, generous padding, transparent background, legible at 16px favicon size, Swiss design discipline.
**Negative:** no gradients, no 3D, no bevel, no glow, no shadow, no gloss, no mockup, no background scene, no extra letters, no misspelled text, no clip-art, no circuit boards, no brain icons, no robots, no lightbulbs, no neon, no noise, no blur, no watermark

## ٢. الشعار الكامل: `logo-wordmark.png` (2400×800، شفافة)
**Prompt:** Horizontal logo lockup: the orange rotated "N/" tile on the right side, and to its left the lowercase Latin wordmark "nameless" in an extra-bold grotesque sans-serif with tight letter-spacing in ink black #0E0E0C, sharing one baseline. Designed for a right-to-left Arabic layout. Flat vector, transparent background, professional brand-guidelines quality.
**Negative:** no gradients, no shadows, no 3D, no outline letters, no italic, no serif, no script, no taglines, no misspelling, no background, no texture, no mockup, no watermark

## ٣. صورة المشاركة الاجتماعية: `og-cover.jpg` (1200×630)
**Prompt:** Editorial social banner, ink black #0E0E0C background with a faint thin-line square grid in #2A2926. On the right side (RTL layout) a huge extra-bold Arabic headline in bone white reading exactly "برمجة تتكلم عن نفسها" with the word "نفسها" in signal orange #FF5A1F, set in a modern Arabic geometric typeface like Tajawal ExtraBold, perfectly formed and correctly connected Arabic letterforms. Top-right: a small orange rounded-square "N/" tile. Bottom-right: a small line of Arabic text "مواقع · تطبيقات · متاجر · أنظمة". Left side: a large orange circle cropped by the frame. Flat Swiss poster layout with generous negative space.
**Negative:** no broken or disconnected Arabic letters, no mirrored Arabic, no gibberish script, no Latin text, no people, no stock photos, no gradients, no purple, no blue, no neon glow, no bokeh, no 3D, no glassmorphism, no lens flare, no clutter, no watermark

## ٤. أيقونة الجوال: `apple-touch-icon.png` (180×180)
**Prompt:** Square app icon: solid signal orange #FF5A1F filling the canvas edge to edge, centered ink black #0E0E0C heavy monospace "N/", flat and crisp.
**Negative:** no rounded corners, no border, no gradient, no shadow, no gloss, no extra elements, no other text

---

## صور بطاقات الخدمات (1600×1000، نسبة 16:10)

أسلوب موحّد: تصوير واقعي لمكتب سعودي حديث بإضاءة نهارية دافئة من نافذة كبيرة، ألوان هادئة مع لمسة برتقالية #FF5A1F واحدة في المشهد، حبيبات فيلم خفيفة، عمق ميدان ضحل، بزاوية منخفضة أو جانبية توحي بالعمل الحقيقي لا بالتمثيل. يجب أن تبدو كصور حملة إعلانية لوكالة سعودية محترفة. (أضف البرومبت السلبي المشترك لكل صورة.)

### `service-1.jpg` — تصميم وتطوير المواقع
**Prompt:** A Saudi man in a crisp white thobe and red-and-white shemagh sits at a light-oak desk in a modern Riyadh office, reviewing a website layout on a large monitor; the screen shows a clean right-to-left Arabic website wireframe with orange accent buttons. Palm trees visible through a floor-to-ceiling window, an Arabic coffee cup and a printed wireframe sheet on the desk. Warm daylight, shallow depth of field, candid working moment. [+ shared negative]

### `service-2.jpg` — تطبيقات الجوال
**Prompt:** Close-up over-the-shoulder shot of a Saudi woman in an elegant black abaya and hijab holding a smartphone showing a clean Arabic mobile app interface with a bottom navigation bar and orange highlights; a second phone and a notebook rest on a marble café table beside a cup of Saudi qahwa. Soft window light, modern minimalist interior, natural candid posture. [+ shared negative]

### `service-3.jpg` — المتاجر الإلكترونية
**Prompt:** A Saudi woman entrepreneur in a stylish dark abaya packing a product order at a small warehouse desk, a laptop open beside her showing an Arabic e-commerce dashboard with an orange "طلب جديد" notification; neat parcel boxes, a shipping label printer and a roll of tape on the table. Bright practical daylight, real small-business atmosphere, documentary photography feel. [+ shared negative]

### `service-4.jpg` — الأنظمة وERP المخصصة
**Prompt:** Two Saudi professionals — a man in a white thobe and ghutra with an igal, and a woman in a black abaya and hijab — standing in a glass meeting room in front of a large wall screen displaying a dark Arabic business dashboard with KPI cards and one orange chart series; they are discussing and pointing at the data. Late afternoon light, corporate but relaxed, Riyadh skyline blurred outside. [+ shared negative]

### `service-5.jpg` — الهوية وتجربة المستخدم
**Prompt:** Top-down shot of a designer's desk in a Saudi studio: printed Arabic brand identity sheets, orange and black color swatches, a tablet with a stylus showing an Arabic UI screen, sticky notes with Arabic labels, and the hands of a woman wearing an abaya sleeve arranging the printed cards. Matte paper textures, warm daylight, tactile and crafted, no faces needed. [+ shared negative]

### `service-6.jpg` — السيو والنمو الرقمي
**Prompt:** A Saudi man in a white thobe and red shemagh seated at a standing-height desk analysing an analytics dashboard on a laptop; the screen shows a rising Arabic traffic graph in orange, with a printed keyword report and a marker beside it. Modern co-working space in Jeddah, soft morning light, focused analytical mood. [+ shared negative]

---

## صور الأعمال (1600×1200، نسبة 4:3)

أسلوب موحّد: نموذج جهاز واحد على سطح غير لامع، بزاوية علوية مائلة ٣٠°، ضوء نهار طبيعي من نافذة، خامات ورق وقماش حقيقية، حبيبات فيلم خفيفة، لمسة برتقالية واحدة في المشهد، بجودة دراسة حالة لوكالة حائزة على جوائز. الواجهات داخل الشاشات عربية من اليمين إلى اليسار. (أضف البرومبت السلبي المشترك.)

### `work-1.jpg` — قافلة (تطبيق لوجستي)
**Prompt:** Two smartphones on a warm concrete desk showing a clean Arabic delivery-tracking app: a minimal map with an orange route line and a right-to-left bottom sheet of order cards. Beside them a small cardboard parcel, a folded shipping label and an orange pen. Top-down 30° angle, soft window light, shallow depth of field. [+ shared negative]

### `work-2.jpg` — نورة بيوتي (متجر إلكتروني)
**Prompt:** A laptop and a phone on bone-white linen showing an elegant Arabic beauty e-commerce storefront with large skincare product photography, a minimal RTL layout and an orange "أضف إلى السلة" button. Real frosted-glass skincare bottles and a dried flower sprig around the devices. Soft morning light, calm luxury mood. [+ shared negative]

### `work-3.jpg` — ميزان (نظام إدارة)
**Prompt:** A large monitor on a dark oak desk displaying a dense but clean dark-themed Arabic business dashboard: right-side navigation, KPI cards, a bar chart with one orange series and a data table. A mechanical keyboard, an Arabic coffee dallah cup and a notebook with handwritten Arabic notes beside it. Late afternoon light, professional focused mood. [+ shared negative]

### `work-4.jpg` — عيادات روضة (منصة حجز)
**Prompt:** A tablet on a stand at a bright Saudi clinic reception counter of light wood, showing a friendly Arabic appointment-booking interface with a calendar grid, orange selected time-slot chips and a doctor profile card. A small potted plant and appointment cards nearby, softly blurred background. Clean, trustworthy, human. [+ shared negative]

---

## اختياري: صورة قسم "آلية العمل" أو خلفية الهيرو `hero-side.jpg` (1400×1400)
**Prompt:** A Saudi team of three — a man in a white thobe with a red shemagh and two women in black abayas and hijabs — gathered around a laptop in a modern Riyadh office, mid-conversation and genuinely engaged, an orange sticky-note wall behind them and palm trees beyond the glass. Documentary-style candid photograph, warm natural light, muted palette with one orange accent. [+ shared negative]
