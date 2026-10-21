// زر عائم لتبديل اللون الأساسي للموقع (لوحة الألوان) — يحفظ الاختيار في localStorage.palette
(function () {
  var P = [['orange', 'برتقالي', '#ff5a1f'], ['coral', 'مرجاني', '#e8475f'], ['gold', 'ذهبي', '#d4a13a'], ['green', 'أخضر', '#00843d'], ['teal', 'تيل', '#0b8f8a'], ['indigo', 'نيلي', '#3b5bdb'], ['maroon', 'عنابي', '#8c1c33'], ['lime', 'ليموني', '#a3d91a'], ['mono', 'أحادي', '#111111']]
  var root = document.documentElement
  function get() { try { return localStorage.palette } catch (e) {} }
  function apply(k) { root.dataset.palette = k; try { localStorage.palette = k } catch (e) {} mark(k) }
  var css = document.createElement('style')
  css.textContent = '.pfab{position:fixed;right:20px;bottom:20px;z-index:60;font-family:inherit;direction:rtl}' +
    '.pfab-btn{width:60px;height:60px;border-radius:50%;border:1px solid var(--line,#ddd);background:var(--accent,#ff5a1f);color:var(--accent-ink,#fff);display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.28);transition:transform .15s}' +
    '.pfab-btn:hover{transform:scale(1.07)}.pfab-btn:focus-visible,.pfab-sw:focus-visible{outline:3px solid var(--fg,#000);outline-offset:2px}' +
    '.pfab-menu{position:absolute;right:0;bottom:64px;background:var(--bg-2,#fff);color:var(--fg,#111);border:1px solid var(--line,#ddd);border-radius:16px;padding:12px;box-shadow:0 12px 34px rgba(0,0,0,.3);width:196px}' +
    '.pfab-menu[hidden]{display:none}.pfab-t{font-size:13px;font-weight:700;margin:0 0 10px}' +
    '.pfab-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}' +
    '.pfab-sw{height:44px;border-radius:12px;border:2px solid transparent;cursor:pointer;padding:0;outline-offset:2px}.pfab-sw[aria-pressed=true]{border-color:var(--fg,#111);box-shadow:inset 0 0 0 3px var(--bg-2,#fff)}'
  document.head.appendChild(css)
  var w = document.createElement('div'); w.className = 'pfab'
  w.innerHTML = '<div class="pfab-menu" id="pfab-menu" hidden><p class="pfab-t">اللون الأساسي</p><div class="pfab-grid"></div></div>' +
    '<button type="button" class="pfab-btn" aria-label="تغيير اللون الأساسي" aria-expanded="false" aria-controls="pfab-menu">' +
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4.1-4-7.2-9-7.2z"/>' +
    '<circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="10.5" cy="7" r="1.1" fill="currentColor"/><circle cx="15.5" cy="7.5" r="1.1" fill="currentColor"/></svg></button>'
  var g = w.querySelector('.pfab-grid'), btn = w.querySelector('.pfab-btn'), menu = w.querySelector('.pfab-menu')
  P.forEach(function (p) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pfab-sw'; b.dataset.k = p[0]
    b.style.background = p[2]; b.title = p[1]; b.setAttribute('aria-label', p[1]); b.setAttribute('aria-pressed', 'false')
    b.onclick = function () { apply(p[0]) }; g.appendChild(b)
  })
  function mark(k) { g.querySelectorAll('.pfab-sw').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)) }) }
  function toggle(open) { menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)) }
  btn.onclick = function () { toggle(menu.hidden) }
  document.addEventListener('click', function (e) { if (!w.contains(e.target)) toggle(false) })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false) })
  var s = get(); if (s && P.some(function (p) { return p[0] === s })) root.dataset.palette = s
  mark(root.dataset.palette || 'orange')
  document.body.appendChild(w)
  // فوق أزرار الـdock الموجودة (واتساب/عرض السعر) مع بقائه على اليمين في الجوال والكمبيوتر
  function place() {
    var d = document.querySelector('.dock'), r = d && d.getBoundingClientRect()
    w.style.bottom = r && r.width > innerWidth * 0.6 ? Math.round(innerHeight - r.top + 12) + 'px' : '20px'
  }
  place(); addEventListener('resize', place); addEventListener('load', place); setTimeout(place, 800); setTimeout(place, 2500)
})()
