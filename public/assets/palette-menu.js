// زر لوحة الألوان بجانب زر الوضع الداكن في الهيدر: يبدّل اللون الأساسي ويحفظه في localStorage.palette
(function () {
  var P = [['orange', 'برتقالي', '#ff5a1f'], ['coral', 'مرجاني', '#e8475f'], ['gold', 'ذهبي', '#d4a13a'], ['green', 'أخضر', '#00843d'], ['teal', 'تيل', '#0b8f8a'], ['indigo', 'نيلي', '#3b5bdb'], ['maroon', 'عنابي', '#8c1c33'], ['lime', 'ليموني', '#a3d91a'], ['mono', 'أحادي', '#111111']]
  var root = document.documentElement
  try { var s = localStorage.palette; if (P.some(function (p) { return p[0] === s })) root.dataset.palette = s } catch (e) {}
  var css = document.createElement('style')
  css.textContent = '.pal-menu{position:fixed;z-index:80;background:var(--bg-2,#fff);color:var(--fg,#111);border:1px solid var(--line,#ddd);border-radius:16px;padding:12px;box-shadow:0 12px 34px rgba(0,0,0,.3);width:196px;direction:rtl}' +
    '.pal-menu[hidden]{display:none}.pal-t{font-size:13px;font-weight:700;margin:0 0 10px}.pal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}' +
    '.pal-sw{height:44px;border-radius:12px;border:2px solid transparent;cursor:pointer;padding:0}.pal-sw:focus-visible{outline:3px solid var(--fg,#000);outline-offset:2px}' +
    '.pal-sw[aria-pressed=true]{border-color:var(--fg,#111);box-shadow:inset 0 0 0 3px var(--bg-2,#fff)}'
  document.head.appendChild(css)
  var menu = document.createElement('div'); menu.className = 'pal-menu'; menu.id = 'pal-menu'; menu.hidden = true
  menu.innerHTML = '<p class="pal-t">اللون الأساسي</p><div class="pal-grid"></div>'
  var grid = menu.firstChild.nextSibling, btn
  P.forEach(function (p) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pal-sw'; b.dataset.k = p[0]
    b.style.background = p[2]; b.title = p[1]; b.setAttribute('aria-label', p[1])
    b.onclick = function () { root.dataset.palette = p[0]; try { localStorage.palette = p[0] } catch (e) {} mark() }; grid.appendChild(b)
  })
  function mark() { var k = root.dataset.palette || 'orange'; grid.querySelectorAll('.pal-sw').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)) }) }
  function place() {
    if (menu.hidden || !btn) return
    var r = btn.getBoundingClientRect(), w = menu.offsetWidth
    menu.style.top = Math.round(r.bottom + 8) + 'px'
    menu.style.left = Math.max(8, Math.min(innerWidth - w - 8, Math.round(r.left + r.width / 2 - w / 2))) + 'px'
  }
  function toggle(open) { menu.hidden = !open; if (btn) btn.setAttribute('aria-expanded', String(open)); place() }
  function mount() {
    var box = document.querySelector('.header-actions'); if (!box || box.querySelector('.pal-btn')) return
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'icon-btn pal-btn'
    btn.setAttribute('aria-label', 'تغيير اللون الأساسي'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'pal-menu')
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4.1-4-7.2-9-7.2z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="10.5" cy="7" r="1.1" fill="currentColor"/><circle cx="15.5" cy="7.5" r="1.1" fill="currentColor"/></svg>'
    btn.onclick = function (e) { e.stopPropagation(); toggle(menu.hidden) }
    var theme = box.querySelector('.icon-btn'); box.insertBefore(btn, theme ? theme.nextSibling : box.firstChild)
  }
  document.addEventListener('click', function (e) { if (!menu.contains(e.target)) toggle(false) })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false) })
  addEventListener('resize', place); addEventListener('scroll', function () { toggle(false) }, { passive: true })
  function start() {
    document.body.appendChild(menu); mark(); mount()
    // React قد يعيد رسم الهيدر عند التنقل؛ نعيد الإدراج إن اختفى الزر
    new MutationObserver(mount).observe(document.body, { childList: true, subtree: true })
  }
  // بعد اكتمال التحميل بقليل حتى لا يتعارض مع hydration
  addEventListener('load', function () { setTimeout(start, 700) })
})()
