"""Builds the Beit Hend site: python build.py
Edit pages in src/pages/*.html and shared parts below; this writes the .html files in this folder."""
import re, glob, os

# Your live address, e.g. 'https://beithend.com' (used for link previews on WhatsApp/social). Leave '' until known.
SITE_URL = ''
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# key, English, Arabic, file, hero image, subtitle
PAGES = [
  ('house',  'The house',  'البيت',      'house.html',      'garden-gate.jpg',          'A home rooted in light, ritual and belonging', 'center 55%'),
  ('rooms',  'Rooms',      'الأوض',      'rooms.html',      'nubia-bedroom.jpg',        'Five rooms, five corners of Egypt', 'center'),
  ('garden', 'The garden', 'الجنينة',    'garden.html',     'pool-and-pergola.jpg',     'Pool, pergola, fire and shade', 'center'),
  ('gather', 'Gatherings', 'اللمّة',     'gatherings.html', 'fireplace-lounge.jpg',     'The rhythm of togetherness', 'center'),
  ('stay',   'Stay',       'خليك عندنا', 'stay.html',       'entrance-logo.jpg',        'Your room is ready', 'center 62%'),
]
META = {
  'index': ('Beit Hend — Boutique Hotel · A light left on for you', 'Beit Hend is an intimate boutique hotel rooted in the feeling of home. Five rooms inspired by five corners of Egypt, a garden, a pool, and a light left on for you.'),
  'house': ('The House — Beit Hend', 'A home that is lived in, never staged. Discover Beit Hend and the story of Hend.'),
  'rooms': ('Rooms — Beit Hend', 'Five rooms inspired by Siwa, Alexandria, Cairo, Nubia and the Delta.'),
  'garden': ('The Garden — Beit Hend', 'A garden made for slowing down: pool, pergola, fireplace terrace, hammocks and a garden gym.'),
  'gather': ('Gatherings — Beit Hend', 'The five acts of living and the moments we host at Beit Hend.'),
  'stay': ('Stay — Beit Hend', 'Book your stay at Beit Hend. Your room is ready, the light is on.'),
}
ARROW = '<svg class="i" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>'

def words(current, landing=False):
    out = []
    for i, (k, en, ar, href, *_ ) in enumerate(PAGES):
        cls = 'hero__word' + (' is-active' if (k == current or (landing and i == 0)) else '')
        d = .2 + i * .15
        out.append(f'<a class="{cls}" data-key="{k}" href="{href}" style="animation-delay:{d:.2f}s"><span class="ar">{ar}</span><span class="en">{en}</span></a>')
        if i < len(PAGES) - 1:
            out.append(f'<i class="hero__dot" style="animation-delay:{d+.08:.2f}s"></i>')
    return f'<nav class="hero__words{"" if landing else " hero__words--sm"}" id="heroWords">' + ''.join(out) + '</nav>'

def phero(key):
    """Slim page bar: the page starts with its content, with quick bilingual links to the other pages."""
    items = []
    for i, (k, en, ar, href, *_ ) in enumerate(PAGES):
        cur = ' aria-current="page" class="is-active"' if k == key else ''
        items.append(f'<a href="{href}"{cur}><span class="en">{en}</span><span class="ar">{ar}</span></a>')
    return '<nav class="pagebar" aria-label="Pages">' + '<i class="pagebar__dot"></i>'.join(items) + '</nav>'

def nxt(key):
    k, en, ar, href, img, sub, pos = next(p for p in PAGES if p[0] == key)
    return f'''<a class="next" href="{href}">
  <span class="next__img"><img src="assets/img/{img}" alt="" loading="lazy"></span>
  <span class="next__body"><span class="label">Next · التالي</span><span class="ar">{ar}</span><span class="title">{en}</span><span class="pill">{ARROW}</span></span>
</a>'''

FOOTER = f'''<footer class="foot">
  <div class="foot__top">
    <div class="foot__brand">
      <svg viewBox="{{{{VB:logo-beit-tagline}}}}"><use href="#logo-beit-tagline"/></svg><br>
      <svg class="ar" viewBox="{{{{VB:logo-ar}}}}"><use href="#logo-ar"/></svg>
      <p class="foot__ar">البيت بيتك</p>
    </div>
    <div><h4>Visit <span class="ar-inline">زورنا</span></h4><ul><li>[Street address]</li><li>Cairo, Egypt</li><li><a href="#" data-ph>Get directions</a></li></ul></div>
    <div><h4>Contact <span class="ar-inline">كلّمنا</span></h4><ul><li><a href="#" data-ph>[+20 phone]</a></li><li><a href="#" data-ph>[email@beithend.com]</a></li><li><a href="#" data-ph>WhatsApp</a></li></ul></div>
    <div><h4>Explore <span class="ar-inline">اتفرّج</span></h4><ul>{''.join(f'<li><a href="{p[3]}">{p[1]} · <span class="ar-inline">{p[2]}</span></a></li>' for p in PAGES)}</ul></div>
  </div>
  <div class="foot__big"><span>A light left on for you</span><span class="ar">في نور منوّر مستنّيك</span></div>
  <div class="foot__bottom"><span>© 2026 Beit Hend. All rights reserved.</span><span><a href="#" data-ph>Instagram</a> · <a href="#" data-ph>Facebook</a> · <a href="#" data-ph>TikTok</a></span><span>A BEIT house · بيت</span></div>
</footer>'''

DRAWER = '''<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer__veil" data-close></div>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
    <button class="drawer__close" data-close aria-label="Close"><span class="x"></span></button>
    <div class="drawer__gal">
      <div class="slider" id="drawerSlider"></div>
      <div class="slider__nav" data-for="drawerSlider">
        <button class="prev" aria-label="Previous"><svg class="i" viewBox="0 0 24 24"><path d="M20 12H5M11 6l-6 6 6 6"/></svg></button>
        <span class="slider__count">1 / 3</span>
        <button class="next" aria-label="Next">''' + ARROW + '''</button>
      </div>
    </div>
    <div class="drawer__body">
      <span class="label" id="drawerRegion"></span>
      <div class="drawer__names"><h2 class="title" id="drawerTitle"></h2><span class="ar" id="drawerAr"></span></div>
      <p class="lead" id="drawerText"></p>
      <ul class="drawer__feat" id="drawerFeat"></ul>
      <a class="btn btn--solid" href="stay.html" id="drawerBook">Book this room <span class="ar-inline">احجزها</span></a>
    </div>
  </div>
</div>'''

PERIOD_SEG = 'C{a} {y} {b} {u} {c} {u}S{d} {w} {e} {w}S{f} {y} {g} {y}'
def wpath(y0):
    segs = []
    for k in range(2):
        o = k * 1440
        segs.append(PERIOD_SEG.format(a=180+o, b=270+o, c=480+o, d=780+o, e=960+o, f=1260+o, g=1440+o, y=y0, u=y0-48, w=y0+22))
    return f'M0 {y0}' + ''.join(segs) + 'L2880 140L0 140Z'
WAVE = ('<svg viewBox="0 0 2880 140" preserveAspectRatio="none" aria-hidden="true"><path class="w2" fill="currentColor" d="%s"/></svg>'
        '<svg viewBox="0 0 2880 140" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="%s"/></svg>') % (wpath(60), wpath(96))

SYMS = {}
for f in sorted(glob.glob('assets/brand/*.svg')):
    n = os.path.basename(f)[:-4]; s = open(f, encoding='utf-8').read()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    SYMS[n] = (vb, s[s.find('>')+1:s.rfind('</svg>')])

layout = open('src/layout.html', encoding='utf-8').read()
files = {'index': 'index.html', **{p[0]: p[3] for p in PAGES}}
srcs = {'index': 'index.html', 'house': 'house.html', 'rooms': 'rooms.html', 'garden': 'garden.html', 'gather': 'gatherings.html', 'stay': 'stay.html'}
for key, out in files.items():
    body = open('src/pages/' + srcs[key], encoding='utf-8').read()
    body = body.replace('{{WORDS:landing}}', words(None, landing=True))
    body = re.sub(r'\{\{PHERO:(\w+)\}\}', lambda m: phero(m.group(1)), body)
    body = re.sub(r'\{\{NEXT:(\w+)\}\}', lambda m: nxt(m.group(1)), body)
    html = layout.replace('{{BODY}}', body)
    html = html.replace('{{FOOTER}}', '' if key == 'index' else FOOTER)
    html = html.replace('{{EXTRA}}', DRAWER if key == 'rooms' else '')
    html = html.replace('{{TRACK}}', {'index':'home','gather':'gatherings'}.get(key, key)).replace('{{TITLE}}', META[key][0]).replace('{{DESC}}', META[key][1]).replace('{{PAGE}}', key)
    html = html.replace('{{WAVE}}', WAVE).replace('{{OG_IMAGE}}', (SITE_URL.rstrip('/') + '/' if SITE_URL else '') + 'og-image.jpg')
    html = re.sub(r'class="deco"([^>]*><use href="#line-tray")', r'class="deco deco--spin"\1', html)
    need = sorted(set(re.findall(r'#((?:logo|art|line)-[\w-]+)', html)))
    sprite = ''.join(f'<symbol id="{n}" viewBox="{SYMS[n][0]}" fill="currentColor">{SYMS[n][1]}</symbol>' for n in need)
    html = html.replace('{{SPRITE}}', sprite)
    html = re.sub(r'\{\{VB:([\w-]+)\}\}', lambda m: SYMS[m.group(1)][0], html)
    assert '{{' not in html, (key, re.findall(r'\{\{[^}]+\}\}', html)[:3])
    open(out, 'w', encoding='utf-8').write(html)
    print(f'{out:18s} {len(html)//1024:4d} KB')
