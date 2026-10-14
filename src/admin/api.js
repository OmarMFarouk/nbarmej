const BASE = import.meta.env.BASE_URL + 'api/'
let csrf = ''
export const setCsrf = (t) => { csrf = t }

export async function api(action, body) {
  const form = body instanceof FormData
  const r = await fetch(`${BASE}?a=${action}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRF': csrf, ...(body === undefined || form ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : form ? body : JSON.stringify(body),
  })
  const j = await r.json().catch(() => ({ error: 'server' }))
  if (!r.ok) throw Object.assign(new Error(j.error || 'server'), { status: r.status })
  return j
}

export const upload = (file) => {
  const f = new FormData()
  f.append('file', file)
  return api('upload', f)
}

// رسائل الأخطاء (عربي|English)
export const ERRORS = {
  bad_login: 'البريد أو كلمة المرور غير صحيحة|Wrong email or password',
  locked: 'محاولات كثيرة، حاول بعد ١٥ دقيقة|Too many attempts, try again in 15 minutes',
  weak_password: 'كلمة المرور يجب ألا تقل عن ٨ أحرف|Password must be at least 8 characters',
  bad_current: 'كلمة المرور الحالية غير صحيحة|Current password is wrong',
  bad_token: 'الرابط غير صالح أو منتهي|Reset link is invalid or expired',
  too_big: 'الملف كبير (الحد ٥ ميجابايت)|File too large (5 MB max)',
  bad_type: 'يُقبل JPG أو PNG أو WebP أو GIF فقط|Only JPG, PNG, WebP or GIF',
  unauthorized: 'انتهت الجلسة، سجّل الدخول مجددًا|Session expired, sign in again',
  server: 'تعذر الاتصال بالخادم|Could not reach the server',
}
