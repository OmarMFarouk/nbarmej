// أيقونات وسائل التواصل: تُستخدم في الموقع واللوحة. القيمة إما مفتاح جاهز أو رابط صورة مرفوعة.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const SOCIAL_ICONS = {
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
  x: <path d="M4 4l16 16M20 4L4 20" />,
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z" />,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V16M8 7.6v.1M12 16v-5.5M12 13a2.5 2.5 0 0 1 5 0V16" /></>,
  telegram: <><path d="M21 4 3 11l6 2.5L11 20l3-4 4.5 3.5z" /><path d="M9 13.5 21 4" /></>,
  tiktok: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.3 2.6 2 4.4 5 4.6" />,
  snapchat: <path d="M12 3c3 0 5 2.2 5 5v2.5c0 .8.6 1.5 2 1.8-.5 1.2-1.5 1.5-2.5 1.7-.3.7-1 1.7-2.5 1.7-1 0-1.3.8-2 .8s-1-.8-2-.8c-1.5 0-2.2-1-2.5-1.7-1-.2-2-.5-2.5-1.7 1.4-.3 2-1 2-1.8V8c0-2.8 2-5 5-5Z" />,
  threads: <path d="M17.5 9.5C16.8 6.7 14.8 5.5 12 5.5c-3.3 0-5.5 2.4-5.5 6.5s2.2 6.5 5.5 6.5c2.6 0 4.5-1.3 4.5-3.3 0-2.1-2-3-4.3-3-1.6 0-2.7.7-2.7 1.8s1 1.7 2.2 1.7c2.2 0 3.3-1.6 3.3-4.2" />,
  whatsapp: <path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6c-3-1.3-5-4.4-5.1-4.6-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.3Z" />,
  phone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />,
  mail: <path d="M3 5h18v14H3zM3 6l9 7 9-7" />,
  website: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></>,
}

export const SOCIAL_NAMES = {
  instagram: 'إنستقرام|Instagram', x: 'تويتر / X|X (Twitter)', tiktok: 'تيك توك|TikTok', linkedin: 'لينكدإن|LinkedIn',
  snapchat: 'سناب شات|Snapchat', facebook: 'فيسبوك|Facebook', youtube: 'يوتيوب|YouTube', telegram: 'تيليجرام|Telegram',
  threads: 'ثريدز|Threads', whatsapp: 'واتساب|WhatsApp', website: 'موقع إلكتروني|Website',
}

export function SocialIcon({ icon, size = '1.25em' }) {
  if (/^(\/|https?:)/.test(icon || '')) return <img src={icon} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />
  const g = SOCIAL_ICONS[icon] || SOCIAL_ICONS.website
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...S}>{g}</svg>
}

// أيقونات بطاقات "وش تحتاج تبدأ؟" (مسارات stroke 24×24)
export const START_ICONS = {
  rocket: ['M12 2c3 2.5 5 6 5 10l-2 4H9l-2-4c0-4 2-7.500 5-10ZM12 9.500h.01M9 16l-2.500 5 5.500-2.500M15 16l2.500 5-5.500-2.500', 'صاروخ'],
  building: ['M4 21V4l8-2v19M12 8l8 2v11M3 21h18M8 8h.01M8 12h.01M8 16h.01M16 14h.01M16 18h.01', 'شركة'],
  cart: ['M3 4h2l2.4 11h10.2L20 7H6M9 20h.01M17 20h.01', 'متجر'],
  phone: ['M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1ZM11 18h2', 'جوال'],
  dashboard: ['M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z', 'لوحة'],
  wrench: ['M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4', 'تحسين'],
}

export const StartIcon = ({ name }) => {
  const d = START_ICONS[name]
  return d ? <svg className="start-ico" viewBox="0 0 24 24" aria-hidden="true"><path d={d[0]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null
}
