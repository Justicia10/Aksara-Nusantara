#!/usr/bin/env python3
"""Browser end-to-end tests (Playwright + Chromium) for NGM.

Starts the PRODUCTION server (needs `npm run build` first) on a throwaway SQLite DB and drives real flows.
Usage: python3 tests/e2e/run_e2e.py [--keep-shots]
"""
import json, os, re, shutil, signal, subprocess, sys, tempfile, time, urllib.request
from playwright.sync_api import sync_playwright, expect

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PORT = int(os.environ.get('E2E_PORT', '3107'))
BASE = f'http://127.0.0.1:{PORT}'
ADMIN = ('e2e-admin@test.local', 'e2e-password-123')
SHOTS = '/tmp/ngm-e2e'
os.makedirs(SHOTS, exist_ok=True)

results = []
def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('  PASS ' if cond else '  FAIL ') + name + (f'  [{detail}]' if detail and not cond else ''))
    return bool(cond)

def section(t): print(f'\n== {t}')

# ---------------- server ----------------
tmp = tempfile.mkdtemp(prefix='ngm-e2e-')
env = dict(os.environ, NODE_ENV='production', PORT=str(PORT), DATABASE_PATH=os.path.join(tmp, 'e2e.db'),
           SESSION_SECRET='e2e-secret-e2e-secret-e2e', ADMIN_EMAIL=ADMIN[0], ADMIN_PASSWORD=ADMIN[1], COOKIE_SECURE='false', GEMINI_API_KEY='')
srv = subprocess.Popen(['npx', 'tsx', 'server/index.ts'], cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, preexec_fn=os.setsid)
def stop():
    try: os.killpg(os.getpgid(srv.pid), signal.SIGTERM)
    except Exception: pass
    shutil.rmtree(tmp, ignore_errors=True)
for _ in range(60):
    try:
        urllib.request.urlopen(BASE + '/api/health', timeout=1); break
    except Exception: time.sleep(0.5)
else:
    print(srv.stdout.read() if srv.stdout else ''); stop(); sys.exit('server did not start')

# ---------------- helpers ----------------
def avatar_x(page): return float(page.get_by_test_id('avatar').get_attribute('data-x'))
def cam_x(page): return float(page.get_by_test_id('world').get_attribute('data-camera-x'))
def hold(page, key, ms):
    page.keyboard.down(key); page.wait_for_timeout(ms); page.keyboard.up(key)
def walk_to(page, target, tol=6):
    for _ in range(12):
        x = avatar_x(page); d = target - x
        if abs(d) <= tol: return x
        hold(page, 'ArrowRight' if d > 0 else 'ArrowLeft', int(max(40, (abs(d) / 70.0) * 1000 - 30)))
        page.wait_for_timeout(60)
    return avatar_x(page)
def goto_catalog_open(page, story_title='Roro Jonggrang'):
    page.goto(BASE + '/#/katalog'); page.wait_for_selector('text=Baca Cerita')
    card = page.locator('div.group', has_text=story_title).first
    card.get_by_role('button', name=re.compile('Baca Cerita')).click()
def press(page, testid, ms):
    b = page.get_by_test_id(testid).bounding_box()
    page.mouse.move(b['x'] + b['width']/2, b['y'] + b['height']/2); page.mouse.down(); page.wait_for_timeout(ms); page.mouse.up(); page.wait_for_timeout(40)
def lanjut(page): page.get_by_test_id('lanjut').click()

try:
  with sync_playwright() as p:
    browser = p.chromium.launch()

    # =============== 1-2. public pages, catalog, search, filters ===============
    section('Public: homepage, catalog, search, filters')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE); page.wait_for_selector('text=Nusantara Gemar Membaca')
    check('homepage renders', page.locator('header').count() >= 1 and page.locator('footer').count() == 1)
    page.screenshot(path=f'{SHOTS}/01-home.png')
    page.goto(BASE + '/#/katalog'); page.wait_for_selector('text=Baca Cerita')
    n_all = page.get_by_role('button', name=re.compile('Baca Cerita')).count()
    check('catalog lists the 10 published stories', n_all == 10, f'got {n_all}')
    check('no fake star ratings shown', page.locator('text=ulasan').count() == 0)
    search = page.get_by_placeholder(re.compile('Cari', re.I)).first
    search.fill('Malin'); page.wait_for_timeout(300)
    check('search "Malin" narrows results', page.get_by_role('button', name=re.compile('Baca Cerita')).count() == 1)
    search.fill('zzzzqqq'); page.wait_for_timeout(300)
    check('search with no hits shows empty state, no cards', page.get_by_role('button', name=re.compile('Baca Cerita')).count() == 0)
    search.fill('')
    page.get_by_role('button', name=re.compile('^Sumatera')).first.click(); page.wait_for_timeout(300)
    n_sum = page.get_by_role('button', name=re.compile('Baca Cerita')).count()
    check('region filter Sumatera shows only Sumatera stories (3)', n_sum == 3, f'got {n_sum}')
    search.fill('Malin'); page.wait_for_timeout(300)
    check('search + filter combine (Malin + Sumatera)', page.get_by_role('button', name=re.compile('Baca Cerita')).count() == 1)
    search.fill('zzzz'); page.wait_for_timeout(300)
    check('combined filter with 0 results shows no cards', page.get_by_role('button', name=re.compile('Baca Cerita')).count() == 0)
    page.screenshot(path=f'{SHOTS}/02-catalog-empty.png')
    ctx.close()

    # =============== 3. story with no scenes ===============
    section('Reader: published story without scenes (metadata only)')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.goto(BASE + '/#/baca/putri-hijau'); page.wait_for_selector('[data-testid=story-no-scenes]')
    check('scene-less story shows an honest message, not another story', 'Legenda Putri Hijau' in page.inner_text('[data-testid=story-no-scenes]') and 'Roro' not in page.inner_text('[data-testid=story-no-scenes]'))
    page.goto(BASE + '/#/baca/tidak-ada'); page.wait_for_selector('[data-testid=story-not-found]')
    check('unknown story id shows not-found', True)
    ctx.close()

    # =============== 4-10. interactive 2D, desktop ===============
    section('Interactive 2D (desktop): mode, movement, bounds, distance, dialogue, linear flow')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    goto_catalog_open(page)
    page.wait_for_selector('[data-testid=interactive-2d]'); page.wait_for_selector('[data-testid=scene-viewport]')
    check('AC-2D-01: ready story opens in 2D mode', True)
    check('scene progress shown "Adegan 1 dari 4"', 'Adegan 1 dari 4' in page.get_by_test_id('scene-progress').inner_text())
    x0 = avatar_x(page); cam0 = cam_x(page)
    check('avatar starts at configured position (48)', abs(x0 - 48) < 0.5, x0)
    page.screenshot(path=f'{SHOTS}/03-2d-desktop-start.png')

    hold(page, 'ArrowRight', 500); x1 = avatar_x(page)
    check('AC-2D-03: ArrowRight moves avatar right', x1 > x0 + 20, f'{x0}->{x1}')
    xr = avatar_x(page); page.wait_for_timeout(300)
    check('avatar stops when key released', abs(avatar_x(page) - xr) < 0.5)
    hold(page, 'd', 300); x2 = avatar_x(page)
    check('D key also moves right', x2 > x1 + 10)
    hold(page, 'a', 200); x3 = avatar_x(page)
    check('A key moves left', x3 < x2 - 5)
    hold(page, 'ArrowLeft', 200)
    check('AC-2D-14: arrow keys did not change scene', 'Adegan 1 dari 4' in page.get_by_test_id('scene-progress').inner_text())

    hold(page, 'ArrowLeft', 2500); xl = avatar_x(page)
    check('AC-2D-04: left bound stops avatar at 24 (no error)', abs(xl - 24) < 0.5, xl)
    check('camera at left edge', cam_x(page) == 0.0)
    hold(page, 'ArrowRight', 7500); xrb = avatar_x(page)
    check('AC-2D-04: right bound stops avatar at 456', abs(xrb - 456) < 0.5, xrb)
    vp_w = page.get_by_test_id('scene-viewport').evaluate('e => e.clientWidth')
    world_w = page.get_by_test_id('world').evaluate('e => e.clientWidth')
    check('AC-2D-05: camera followed and stops at world edge (never shows outside)', abs(cam_x(page) - (world_w - vp_w) / 3) < 1.5, f'cam={cam_x(page)} expected={(world_w - vp_w)/3}')
    page.screenshot(path=f'{SHOTS}/04-2d-right-edge.png')

    # typing in the search box must not move the avatar
    walk_to(page, 48); xs = avatar_x(page)
    page.get_by_placeholder(re.compile('Cari', re.I)).first.click(); page.keyboard.type('adadad', delay=40)
    check('AC-2D-14: typing in the search field does not move the avatar', abs(avatar_x(page) - xs) < 0.5)
    page.get_by_test_id('world').click(position={'x': 5, 'y': 5})   # focus back to the page

    section('Interactive 2D: target validation')
    walk_to(page, 48)
    page.get_by_test_id('target-t1-bandung').click()
    check('AC-2D-06: too far -> hint "Dekati…" shown', page.get_by_test_id('hint').is_visible() and 'Dekati' in page.get_by_test_id('hint').inner_text())
    check('AC-2D-06: too far -> no dialog opened', page.get_by_test_id('dialog-panel').count() == 0)
    check('hint is not colour-only (has text + icon)', len(page.get_by_test_id('hint').inner_text()) > 10)
    page.get_by_test_id('decor-d1-obor-a').click(force=True)
    check('AC-2D-07: clicking decoration does nothing', page.get_by_test_id('dialog-panel').count() == 0 and page.get_by_test_id('cultural-panel').count() == 0)
    page.get_by_test_id('world').click(position={'x': 600, 'y': 40}, force=True)
    check('clicking empty scene does nothing', page.get_by_test_id('dialog-panel').count() == 0)
    # out-of-order required event (Roro before Bandung)
    walk_to(page, 360)
    page.get_by_test_id('target-t1-roro').click()
    check('required events keep their order (Roro before Bandung is refused)', page.get_by_test_id('hint').get_attribute('data-kind') == 'order' and page.get_by_test_id('dialog-panel').count() == 0)

    section('Interactive 2D: dialogue pauses movement, "Lanjut", optional cultural info')
    walk_to(page, 140)
    check('target in range shows near-chip', page.get_by_test_id('near-chip').is_visible())
    page.get_by_test_id('target-t1-bandung').click()
    page.wait_for_selector('[data-testid=dialog-panel]')
    check('AC-2D-08: dialog panel appears with story text', 'Bandung Bondowoso' in page.get_by_test_id('dialog-text').inner_text())
    xd = avatar_x(page); hold(page, 'ArrowRight', 500)
    check('AC-2D-08: avatar does not move while dialogue is open', abs(avatar_x(page) - xd) < 0.5)
    page.get_by_test_id('target-t1-singgasana').click(force=True)
    check('AC-2D-10: other targets cannot start a second event during dialogue', page.get_by_test_id('cultural-panel').count() == 0)
    check('controls are hidden while dialogue is open (cannot cover the text)', page.get_by_test_id('controls').count() == 0)
    page.screenshot(path=f'{SHOTS}/05-2d-dialog.png')
    lanjut(page)
    page.wait_for_selector('[data-testid=controls]')
    check('AC-2D-09: "Lanjut" closes dialogue and returns control', page.get_by_test_id('dialog-panel').count() == 0)
    hold(page, 'ArrowRight', 300)
    check('movement works again after Lanjut', avatar_x(page) > xd)
    page.get_by_test_id('target-t1-bandung').click()
    page.wait_for_selector('[data-testid=dialog-panel]'); lanjut(page)
    check('re-activation replays without double counting progress', 'peristiwa utama' in page.get_by_test_id('objective').inner_text() and '(1/2' in page.get_by_test_id('objective').inner_text(), page.get_by_test_id('objective').inner_text())

    walk_to(page, 270)
    page.get_by_test_id('target-t1-singgasana').click()
    page.wait_for_selector('[data-testid=cultural-panel]')
    check('AC-2D-12: cultural panel shows title, description and source', 'Diplomasi Halus' in page.get_by_test_id('cultural-title').inner_text() and 'Babad Prambanan' in page.get_by_test_id('cultural-source').inner_text())
    page.screenshot(path=f'{SHOTS}/06-2d-cultural.png')
    lanjut(page)
    check('cultural interaction did not change scene', 'Adegan 1 dari 4' in page.get_by_test_id('scene-progress').inner_text())

    # glossary stays reachable (CULT-05) and does not break movement
    page.get_by_role('button', name=re.compile('Glosarium', re.I)).first.click()
    page.wait_for_selector('text=Gejog Lesung')
    xg = avatar_x(page); hold(page, 'ArrowRight', 300)
    check('keys do not move avatar while the glossary modal is open', abs(avatar_x(page) - xg) < 0.5)
    page.keyboard.press('Escape'); page.wait_for_timeout(200)
    check('glossary closes with Escape', page.get_by_text('Glosarium Istilah Adat Nusantara').count() == 0)

    section('Interactive 2D: complete the whole story (scenes 1 -> 4)')
    walk_to(page, 360); page.get_by_test_id('target-t1-roro').click(); page.wait_for_selector('[data-testid=dialog-panel]'); lanjut(page)
    page.wait_for_function("document.querySelector('[data-testid=scene-progress]')?.innerText.includes('Adegan 2')")
    check('AC-2D-11: finishing required events moves to scene 2', True)
    check('new scene starts avatar at its start position', abs(avatar_x(page) - 48) < 0.5)
    check('scene 2 is wider than the viewport (camera ready)', page.get_by_test_id('world').evaluate('e => e.clientWidth') > page.get_by_test_id('scene-viewport').evaluate('e => e.clientWidth'))
    walk_to(page, 470); page.get_by_test_id('target-t2-batu').click(); page.wait_for_selector('[data-testid=cultural-panel]'); lanjut(page)
    walk_to(page, 330); page.get_by_test_id('target-t2-bandung').click(); page.wait_for_selector('[data-testid=dialog-panel]')
    check('multi-part dialogue shows "Bagian 1 dari 2"', 'Bagian 1 dari 2' in page.get_by_test_id('dialog-part').inner_text())
    lanjut(page); check('second part shown', 'Bagian 2 dari 2' in page.get_by_test_id('dialog-part').inner_text()); lanjut(page)
    page.wait_for_function("document.querySelector('[data-testid=scene-progress]')?.innerText.includes('Adegan 3')")
    page.screenshot(path=f'{SHOTS}/07-2d-scene3.png')
    walk_to(page, 220); page.get_by_test_id('target-t3-roro').click(); page.wait_for_selector('[data-testid=dialog-panel]'); lanjut(page); lanjut(page)
    walk_to(page, 120); page.get_by_test_id('target-t3-lesung').click(); page.wait_for_selector('[data-testid=cultural-panel]')
    check('glossary shortcut appears for term "Gejog Lesung"', page.get_by_text('Lihat istilah “Gejog Lesung”').count() == 1)
    lanjut(page)
    walk_to(page, 400); page.get_by_test_id('target-t3-ayam').click(); page.wait_for_selector('[data-testid=dialog-panel]'); lanjut(page)
    page.wait_for_function("document.querySelector('[data-testid=scene-progress]')?.innerText.includes('Adegan 4')")
    walk_to(page, 150); page.get_by_test_id('target-t4-bandung').click(); page.wait_for_selector('[data-testid=dialog-panel]'); lanjut(page)
    walk_to(page, 235); page.get_by_test_id('target-t4-roro').click(); page.wait_for_selector('[data-testid=dialog-panel]'); lanjut(page)
    page.wait_for_selector('[data-testid=completion]')
    check('AC-2D-18: final scene completes the story and shows Explore Further', page.get_by_text('Jelajahi Peta').count() >= 1)
    page.screenshot(path=f'{SHOTS}/08-2d-complete.png')
    check('no uncaught page errors during desktop flow', not errors, errors[:2])
    ctx.close()

    # =============== 11. mobile ===============
    section('Interactive 2D (mobile): buttons, touch strip, tap targets')
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2); page = ctx.new_page()
    merr = []; page.on('pageerror', lambda e: merr.append(str(e)))
    page.goto(BASE + '/#/baca/roro-jonggrang'); page.wait_for_selector('[data-testid=scene-viewport]')
    page.screenshot(path=f'{SHOTS}/09-2d-mobile-start.png')
    sc_box = page.get_by_test_id('scene-viewport').bounding_box(); ctl_box = page.get_by_test_id('controls').bounding_box()
    check('mobile: controls sit below the scene (not overlapping it)', ctl_box['y'] >= sc_box['y'] + sc_box['height'] - 1, f"scene bottom={sc_box['y']+sc_box['height']} controls top={ctl_box['y']}")
    check('mobile: scene fits within the viewport width', sc_box['width'] <= 390 + 1 and page.evaluate('document.documentElement.scrollWidth') <= 391, page.evaluate('document.documentElement.scrollWidth'))
    rb = page.get_by_test_id('btn-right').bounding_box(); lb = page.get_by_test_id('btn-left').bounding_box()
    check('mobile: left/right buttons are thumb-sized (>=44px)', rb['width'] >= 44 and rb['height'] >= 44 and lb['width'] >= 44 and lb['height'] >= 44, (rb, lb))
    x0 = avatar_x(page)
    page.mouse.move(rb['x'] + rb['width']/2, rb['y'] + rb['height']/2); page.mouse.down(); page.wait_for_timeout(600); page.mouse.up()
    x1 = avatar_x(page); check('mobile: hold right button moves avatar', x1 > x0 + 15, f'{x0}->{x1}')
    page.mouse.move(lb['x'] + lb['width']/2, lb['y'] + lb['height']/2); page.mouse.down(); page.wait_for_timeout(300); page.mouse.up()
    check('mobile: left button moves avatar left', avatar_x(page) < x1 - 5)
    sb = page.get_by_test_id('drag-strip').bounding_box(); cx = sb['x'] + sb['width']/2; cy = sb['y'] + sb['height']/2
    xa = avatar_x(page)
    page.mouse.move(cx, cy); page.mouse.down(); page.mouse.move(cx + 60, cy); page.wait_for_timeout(600); page.mouse.up()
    check('mobile: dragging right on the touch strip moves avatar right', avatar_x(page) > xa + 15)
    xb = avatar_x(page); page.wait_for_timeout(300)
    check('mobile: releasing the strip stops the avatar', abs(avatar_x(page) - xb) < 0.5)
    # walk to Bandung with buttons, then TAP the target
    for _ in range(20):
        if abs(avatar_x(page) - 140) <= 30: break
        press(page, 'btn-right' if avatar_x(page) < 140 else 'btn-left', 180)
    page.get_by_test_id('target-t1-bandung').tap()
    page.wait_for_selector('[data-testid=dialog-panel]')
    check('mobile: tapping a target in range opens dialogue', True)
    dp = page.get_by_test_id('dialog-panel').bounding_box(); sc_box = page.get_by_test_id('scene-viewport').bounding_box()
    check('mobile: dialogue does not overlap the scene and is fully inside the viewport', dp['y'] >= sc_box['y'] + sc_box['height'] - 1 and dp['x'] >= 0 and dp['x'] + dp['width'] <= 391, dp)
    page.screenshot(path=f'{SHOTS}/10-2d-mobile-dialog.png')
    page.get_by_test_id('lanjut').tap()
    page.wait_for_selector('[data-testid=controls]')
    check('mobile: Lanjut returns controls', True)
    # too-far tap
    for _ in range(20):
        if avatar_x(page) <= 70: break
        press(page, 'btn-left', 200)
    page.get_by_test_id('target-t1-roro').tap()
    page.wait_for_selector('[data-testid=hint]')
    check('mobile: tapping a distant target shows the approach hint and opens nothing', page.get_by_test_id('hint').get_attribute('data-kind') in ('too-far', 'order') and page.get_by_test_id('dialog-panel').count() == 0)
    check('no page errors on mobile', not merr, merr[:2])
    ctx.close()

    # =============== 12. standard reader (regression) ===============
    section('Standard reader: regression + completion (via admin-created story without 2D)')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.goto(BASE + '/#/admin'); page.wait_for_selector('[data-testid=login-form]')
    page.fill('#email', ADMIN[0]); page.fill('#password', 'wrong-password'); page.get_by_role('button', name='Masuk').click()
    page.wait_for_selector('[data-testid=login-error]')
    check('admin: wrong password is rejected with a message', True)
    page.fill('#password', ADMIN[1]); page.get_by_role('button', name='Masuk').click()
    page.wait_for_selector('[data-testid=admin-dashboard]')
    check('admin: correct login opens the CMS', True)

    def apijson(method, path, body=None):
        return page.evaluate("""async ([m, p, b]) => { const r = await fetch(p, {method: m, headers: {'Content-Type':'application/json'}, body: b ? JSON.stringify(b) : undefined}); let j=null; try{ j = await r.json(); }catch(e){}; return {status: r.status, body: j}; }""", [method, path, body])

    r = apijson('POST', '/api/admin/stories', {'title': 'Cerita Uji Standar', 'regionKey': 'jawa', 'summary': 'Cerita uji tanpa mode 2D.'}); sid = r['body']['story']['id']
    apijson('POST', f'/api/admin/stories/{sid}/scenes', {'actTitle': 'Awal', 'paragraphs': ['Alkisah pada suatu masa.']})
    apijson('POST', f'/api/admin/stories/{sid}/scenes', {'actTitle': 'Tengah', 'paragraphs': ['Tokoh berjalan jauh.']})
    apijson('POST', f'/api/admin/stories/{sid}/scenes', {'actTitle': 'Akhir', 'paragraphs': ['Cerita pun selesai.']})
    src = apijson('POST', '/api/admin/sources', {'title': 'Sumber Uji E2E'})['body']['id']
    apijson('POST', f'/api/admin/stories/{sid}/sources', {'sourceId': src}); apijson('PATCH', f'/api/admin/sources/{src}', {'verificationStatus': 'verified', 'rightsStatus': 'public-domain'})
    for to in ['content-review', 'visual-review', 'approved', 'published']:
        rr = apijson('POST', f'/api/admin/stories/{sid}/status', {'to': to})
        if rr['status'] != 200: check(f'admin API workflow step {to}', False, rr); break
    else: check('admin: draft -> review -> approved -> published through the real workflow', True)

    pub = browser.new_context(viewport={'width': 1280, 'height': 900}); pg = pub.new_page()
    pg.goto(BASE + f'/#/baca/{sid}'); pg.wait_for_selector('text=Alkisah pada suatu masa')
    check('AC-2D-17: story without 2D opens in the standard reader (no 2D UI, no error)', pg.get_by_test_id('interactive-2d').count() == 0 and pg.get_by_test_id('switch-2d').count() == 0)
    check('FR-READ-01: starts at scene 1 of 3', 'Adegan 1 dari 3' in pg.inner_text('body'))
    check('story without images shows the fallback, text still readable (FR-READ-06)', pg.get_by_test_id('image-fallback').count() >= 1)
    check('no characters -> character section hidden', pg.get_by_text('Tokoh dalam adegan ini').count() == 0)
    pg.keyboard.press('ArrowRight'); pg.wait_for_selector('text=Tokoh berjalan jauh')
    check('standard reader: ArrowRight goes to next scene', 'Adegan 2 dari 3' in pg.inner_text('body'))
    pg.keyboard.press('ArrowLeft'); pg.wait_for_selector('text=Alkisah pada suatu masa')
    pg.get_by_role('button', name=re.compile('Lanjut ke Adegan 2')).click(); pg.get_by_role('button', name=re.compile('Lanjut ke Adegan 3')).click()
    pg.get_by_test_id('finish-reading').click(); pg.wait_for_selector('[data-testid=completion-standard]')
    check('standard story reaches the last scene and shows completion without login (FR-READ-07)', True)
    pg.goto(BASE + '/#/katalog'); pg.wait_for_selector('text=Baca Cerita')
    check('newly published story appears in catalog', pg.get_by_text('Cerita Uji Standar').count() >= 1)
    pub.close()

    section('Standard reader of the 2D story via "Baca versi teks"')
    pg = browser.new_context(viewport={'width': 1280, 'height': 900}).new_page()
    pg.goto(BASE + '/#/baca/roro-jonggrang'); pg.wait_for_selector('[data-testid=scene-viewport]')
    pg.get_by_test_id('switch-standard').click(); pg.wait_for_selector('text=Syarat Mustahil Sang Putri Jelita')
    check('FR-2D-FB-01: full scene text reachable from 2D mode, at scene 1', 'Adegan 1 dari 4' in pg.inner_text('body') and pg.get_by_text('Setelah gugurnya Prabu Boko').count() == 1)
    check('standard view of a 2D story labels the image honestly (provenance unknown, not "AI")', 'AI' not in (pg.get_by_test_id('visual-badge').inner_text() if pg.get_by_test_id('visual-badge').count() else ''))
    pg.screenshot(path=f'{SHOTS}/11-standard-reader.png')

    # =============== 13. admin publication rules in the UI ===============
    section('Admin UI: publication rules and 2D readiness')
    page.get_by_test_id('tab-stories').click(); page.get_by_test_id('open-roro-jonggrang').click(); page.wait_for_selector('[data-testid=story-editor]')
    check('admin: legacy story shows publication blockers (unverified sources / unlicensed visuals)', 'penghambat' in page.get_by_test_id('gate').inner_text())
    check('admin: 2D section reports status and validation', page.get_by_test_id('status-2d').inner_text() == 'ready' and 'lolos' in page.get_by_test_id('section-2d').inner_text())
    page.get_by_test_id('to-draft').click(); page.wait_for_selector('text=Draft')
    for _ in range(3):
        nxt = page.locator('[data-testid^=to-]:not([data-testid=to-draft])').first; nxt.click(); page.wait_for_timeout(250)
    page.get_by_test_id('to-published').click(); page.wait_for_selector('[data-testid=admin-error]')
    check('admin: publishing is refused with a reason list', 'belum diverifikasi' in page.get_by_test_id('admin-error').inner_text())
    page.screenshot(path=f'{SHOTS}/12-admin-gate.png')
    page.get_by_test_id('generate-ai').click(); page.wait_for_function("document.querySelector('[data-testid=admin-error]')?.innerText.includes('GEMINI_API_KEY')")
    check('admin: AI generation without key shows a clear error (no fake success)', True)
    # after unpublishing roro it must disappear from the public catalog
    pg.goto(BASE + '/#/katalog'); pg.reload(); pg.wait_for_selector('text=Baca Cerita')
    check('unpublished story disappears from the public catalog', pg.get_by_text('Roro Jonggrang & Pasukan Jin').count() == 0)
    r = apijson('POST', '/api/admin/stories/roro-jonggrang/status', {'to': 'draft'})
    ctx.close()

    # =============== 14. failure injection ===============
    section('Failure handling: API outage, asset failure')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.route('**/api/content', lambda r: r.abort())
    page.goto(BASE + '/#/katalog'); page.wait_for_selector('[data-testid=content-error]')
    check('API failure shows a retryable error state', page.get_by_test_id('retry').is_visible())
    page.unroute('**/api/content'); page.get_by_test_id('retry').click(); page.wait_for_selector('text=Baca Cerita')
    check('retry recovers once the API is back', True)
    ctx.close()

    # restore roro as published for the asset-failure test via the seed-independent route: use a fresh admin session
    adm = browser.new_context(); ap = adm.new_page(); ap.goto(BASE + '/#/admin'); ap.wait_for_selector('[data-testid=login-form]')
    ap.fill('#email', ADMIN[0]); ap.fill('#password', ADMIN[1]); ap.get_by_role('button', name='Masuk').click(); ap.wait_for_selector('[data-testid=admin-dashboard]')
    def aj(m, p, b=None): return ap.evaluate("""async ([m, p, b]) => { const r = await fetch(p, {method: m, headers: {'Content-Type':'application/json'}, body: b ? JSON.stringify(b) : undefined}); let j=null; try{ j = await r.json(); }catch(e){}; return {status: r.status, body: j}; }""", [m, p, b])
    # make roro publishable the way an editor would: verify sources, set visual licences, then walk the workflow
    for s in aj('GET', '/api/admin/sources')['body']: aj('PATCH', f"/api/admin/sources/{s['id']}", {'verificationStatus': 'verified', 'rightsStatus': 'licensed'})
    det = aj('GET', '/api/admin/stories/roro-jonggrang')['body']
    for c in det['cultural']: aj('PATCH', f"/api/admin/cultural/{c['id']}", {'verificationStatus': 'verified'})
    for v in det['visuals']:
        if v['status'] == 'approved': aj('POST', f"/api/admin/visuals/{v['id']}/review", {'status': 'approved', 'licenseStatus': 'licensed'})
    ok = True
    for to in ['content-review', 'visual-review', 'approved', 'published']:
        rr = aj('POST', f'/api/admin/stories/roro-jonggrang/status', {'to': to}); ok = ok and rr['status'] == 200
    check('admin: story can be re-published once sources/rights/licences are resolved by an editor', ok)
    adm.close()

    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.route('**/bg-scene1-keraton.png', lambda r: r.abort())
    page.goto(BASE + '/#/baca/roro-jonggrang')
    page.wait_for_selector('[data-testid=fallback-notice]', timeout=15000)
    check('AC-2D-15: background asset failure falls back to the standard reader with a message', page.get_by_text('Setelah gugurnya Prabu Boko').count() == 1 and page.get_by_test_id('interactive-2d').count() == 0)
    page.screenshot(path=f'{SHOTS}/13-fallback.png')
    page.get_by_test_id('switch-2d').click()
    check('user can retry 2D after fallback (button offered)', True)
    ctx.close()

    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.route('**/avatar-pemandu.png', lambda r: r.abort())
    page.goto(BASE + '/#/baca/roro-jonggrang'); page.wait_for_selector('[data-testid=fallback-notice]', timeout=15000)
    check('avatar sprite failure also falls back (no blank screen)', page.get_by_text('Setelah gugurnya Prabu Boko').count() == 1)
    ctx.close()

    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.route('**/decor-obor.png', lambda r: r.abort())
    page.goto(BASE + '/#/baca/roro-jonggrang'); page.wait_for_selector('[data-testid=scene-viewport]')
    check('decorative sprite failure does not break the scene', page.get_by_test_id('interactive-2d').count() == 1 and page.get_by_test_id('fallback-notice').count() == 0)
    ctx.close()

    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page()
    page.route('**/*.jpg', lambda r: r.abort()); page.route('**googleusercontent.com/**', lambda r: r.abort())
    page.goto(BASE + '/#/katalog'); page.wait_for_selector('text=Baca Cerita'); page.wait_for_timeout(800)
    check('catalog cover image failure shows placeholder fallbacks', page.get_by_test_id('image-fallback').count() >= 1)
    ctx.close()

    # analytics got recorded
    ctx = browser.new_context(); page = ctx.new_page(); page.goto(BASE + '/#/admin'); page.wait_for_selector('[data-testid=login-form]')
    page.fill('#email', ADMIN[0]); page.fill('#password', ADMIN[1]); page.get_by_role('button', name='Masuk').click(); page.wait_for_selector('[data-testid=admin-dashboard]')
    page.get_by_test_id('tab-analytics').click(); page.wait_for_timeout(500)
    txt = page.get_by_test_id('analytics-tab').inner_text()
    check('analytics events recorded (2d_start, 2d_too_far, story_complete, 2d_fallback)', all(k in txt for k in ['2d_start', '2d_too_far', '2d_story_complete', '2d_fallback']), txt[:200])
    ctx.close()
    browser.close()
finally:
    stop()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} checks passed. Screenshots: {SHOTS}")
for n, _, d in failed: print('FAILED:', n, d)
sys.exit(1 if failed else 0)
