/* THE WED THEORY — consultation app: portfolio, design studio, proposal, enquiries */
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'twt.studio.v1';
  const store = { get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }, set(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { return false; } } };
  const s0 = store.get(), clone = o => JSON.parse(JSON.stringify(o));
  const S = {
    view: 'home', filter: 'All', featured: false, edit: false,
    projects: s0.pv === 3 && s0.projects ? s0.projects : clone(SEED_PROJECTS).concat((s0.projects || []).filter(p => !p.sample && !/^(p|r)\d+$/.test(p.id))),
    cfg: { venue: 'ballroom', vibe: 'classic', palette: 'ivory', stage: 'jharoka', ceiling: 'chandeliers', floor: 'rug', seating: 'round', entrance: 'gate', fx: { petals: false, sparks: false, beams: false }, el: Object.assign({}, EL_DEFAULT), time: 0.55, density: 0.45, guests: 300, on: { stage: true, ceiling: true, floor: true, seating: true, entrance: true } },
    sv: { h0: 0, dist: 34, height: 2.6, scale: 1 }, loc: '', gkey: (() => { try { return localStorage.getItem('twt.gmaps') || ''; } catch (e) { return ''; } })(), decorHidden: false,
    step: 1, q: 0, concepts: s0.concepts || [], duel: [0, 1], compare: false, photo: null, quad: [[0.08, 0.93], [0.92, 0.93], [0.68, 0.58], [0.32, 0.58]], note: null, ai: null, busy: false,
    prop: Object.assign({ refs: [], concept: null, tier: 'couture', fx: 280, guests: 300, client: { name: '', phone: '', email: '', type: 'Wedding', date: '', venue: '', notes: '' }, signed: null }, s0.prop || {}),
    enquiries: s0.enquiries || [], budget: 3000000, fitLog: null
  };
  S.cfg.room = { w: 32, d: 46, h: 9 }; S.cfg.tf = {}; S.cfg.props = []; S.prop = null; S.paint = { on: false, erase: false, size: 46 }; S.strokes = null; S.venues = s0.venues || []; S.tab = 'stage'; S.move = false; S.hist = []; S.redo = [];
  S.events = [{ id: 'ev0', name: 'Main event', cfg: S.cfg }]; S.ev = 0;
  const norm = c => { c.tf = c.tf || {}; c.props = c.props || []; c.room = Object.assign({ w: 32, d: 46, h: 9 }, c.room || {}); c.el = Object.assign({}, EL_DEFAULT, c.el || {}); c.entrance = c.entrance || 'gate'; c.fx = Object.assign({ petals: false, sparks: false, beams: false }, c.fx || {}); if (c.on.entrance == null) c.on.entrance = false; if (c.venue === 'street') c.venue = 'ballroom'; return c; };
  S.concepts.forEach(k => norm(k.cfg));
  const GM = { state: 'idle', msg: '', pano: null, svc: null, where: '' };
  function persist() { if (!store.set({ pv: 3, venues: S.venues, projects: S.projects, concepts: S.concepts, prop: S.prop, enquiries: S.enquiries })) toast('This browser is out of storage, so the last change is kept only until the page closes. Remove a few uploaded photos or saved concepts.'); }
  const src = x => /^(data:|blob:)/.test(x) ? x : IMG(x);
  const pkr = n => n >= 1e6 ? 'PKR ' + (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : 'PKR ' + Math.round(n / 1000) + 'k';
  const usd = n => '$' + (Math.round(n / S.prop.fx / 100) * 100).toLocaleString('en-US');
  const range = (lo, hi) => pkr(lo) + ' – ' + pkr(hi).replace('PKR ', ''), rangeU = (lo, hi) => usd(lo) + ' – ' + usd(hi);
  const fdate = d => { if (!d) return 'Date to be confirmed'; const x = new Date(d + 'T00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
  const sw = (arr, cls) => '<span class="sw ' + (cls || '') + '">' + arr.map(c => '<i style="background:' + esc(c) + '"></i>').join('') + '</span>';
  let toastT; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 4200); }
  const waLink = msg => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  const proj = id => S.projects.find(p => p.id === id);
  const SHARES = [['Florals and botanicals', 0.34], ['Stage, flooring and canopy', 0.24], ['Furniture and linen', 0.17], ['Lighting, sound and power', 0.16], ['Crew, transport and setup', 0.09]];
  const projCost = p => { if (!p.guests) return null; const lo = p.guests * RATES.perGuestFallback[0], hi = p.guests * RATES.perGuestFallback[1]; return { lo, hi, depts: SHARES.map(s => [s[0], [lo * s[1], hi * s[1]]]) }; };
  const costTable = c => '<table class="cost"><tr><th>Department</th><th>PKR</th><th>USD</th></tr>' + c.depts.map(d => '<tr><td>' + d[0] + '</td><td>' + range(d[1][0], d[1][1]).replace(/PKR /g, '') + '</td><td>' + rangeU(d[1][0], d[1][1]) + '</td></tr>').join('') + '<tr class="total"><td>Indicative décor range</td><td>' + range(c.lo, c.hi) + '</td><td>' + rangeU(c.lo, c.hi) + '</td></tr></table>';
  const baHTML = (before, after, ratio) => '<div class="ba" data-ba style="aspect-ratio:' + (ratio || '16/10') + '"><img src="' + after + '" alt="After: the finished setup"><div class="top" style="clip-path:inset(0 50% 0 0)"><img src="' + before + '" alt="Before: the raw venue"></div><div class="bar" style="left:50%"></div><span class="lab l">Before</span><span class="lab r">After</span></div>';

  /* ================= HOME ================= */
  const R = {};
  R.home = () => {
    const feat = S.projects.filter(p => p.featured);
    $('#v-home').innerHTML =
      '<div class="hero">' + ['twtstage', 'haveli', 'pillars', 'dinner'].map(i => '<div class="slide" style="background-image:url(' + IMG(i) + ')"></div>').join('') +
      '<div class="scrim"></div><div class="copy"><div class="wrap"><p class="eyebrow" style="color:var(--gold-soft)">The Wed Theory Events</p><h1>The Art of Celebration</h1><p class="sub">Event Planning &amp; Design · Lahore</p>' +
      '<div class="row"><a class="btn light" href="#portfolio">View portfolio</a><a class="btn light" href="#studio">Open design studio</a><a class="btn wa" target="_blank" rel="noopener" href="' + waLink('Hello The Wed Theory, I would like to book a consultation.') + '">WhatsApp ' + WA_TXT + '</a></div></div></div></div>' +
      '<div class="sec"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Three signature divisions</p><h2>What we design</h2></div><p class="muted">One studio for the wedding week, the family table and the company stage.</p></div><div class="div-grid">' +
      DIVISIONS.map(d => '<button class="div-card" data-a="division" data-cat="' + esc(d.cat) + '"><img src="' + IMG(d.img) + '" alt=""><div class="t"><p class="eyebrow" style="color:var(--gold-soft)">Division</p><h3>' + esc(d.title || d.cat) + '</h3><p class="small">' + esc(d.line) + '</p></div></button>').join('') + '</div></div></div>' +
      '<div class="sec dark"><div class="wrap"><div class="sec-head"><div><p class="eyebrow" style="color:var(--gold-soft)">Front-page highlights</p><h2>Featured projects</h2></div><a class="btn light" href="#portfolio">All projects</a></div><div class="pf-grid">' + feat.map(card).join('') + '</div>' +
      '<div class="steps" style="margin-top:clamp(36px,5vw,64px)">' + [['Discover', 'We listen first: the people, the venue, the feeling you want in the room.'], ['Design', 'Moodboards and a 3D preview of your venue, layer by layer.'], ['Plan', 'Vendors, timelines and rehearsals, managed by one team.'], ['Celebrate', 'We run the day. Nothing is booked until you approve the design.']].map(s => '<div><h4>' + s[0] + '</h4><p class="small muted">' + s[1] + '</p></div>').join('') + '</div></div></div>' +
      '<div class="sec"><div class="wrap founder"><img src="' + IMG('welcome') + '" alt="Satin-draped welcome table with candles, busts and a framed sign against a brick haveli wall"><div><p class="eyebrow">Led from Lahore</p><p class="script" style="margin:.4rem 0 .2rem">Abdul Hannan Nasir</p><h3>Lead Creative Director &amp; Managing Director</h3><p class="muted" style="margin-top:1rem;max-width:56ch">Every arch, bloom and candle is chosen with intention, so the day feels unmistakably yours. Consultations run on this tablet: we walk through past rooms, build yours in 3D, and you sign off the concept before anything is ordered.</p>' +
      '<p class="lab" style="margin-top:1.4rem">Venues we design for</p><div class="venues">' + VENUE_LIST.map(v => '<span>' + esc(v) + '</span>').join('') + '</div></div></div></div>';
  };

  /* ================= PORTFOLIO ================= */
  function card(p) {
    return '<button class="pcard" data-a="open" data-id="' + p.id + '"><div class="ph"><img src="' + src(p.images[0]) + '" alt="' + esc(p.title) + '" loading="lazy"><div class="tags">' + (p.featured ? '<span class="tag feat">Featured</span>' : '') + (p.sample ? '<span class="tag sample">Sample entry</span>' : '') + '</div></div>' +
      '<div class="b" style="color:var(--ink)"><p class="eyebrow">' + esc(p.cat) + '</p><h3>' + esc(p.title) + '</h3><p class="small muted">' + esc([p.venue, p.date ? fdate(p.date) : ''].filter(Boolean).join(' · ') || p.theme) + '</p><div class="meta">' + sw(p.palette) + '<span class="small muted num">' + (p.guests ? p.guests + ' guests' : p.images.length + ' photo' + (p.images.length > 1 ? 's' : '')) + '</span></div></div></button>';
  }
  R.portfolio = () => {
    const list = S.projects.filter(p => (S.filter === 'All' || p.cat === S.filter) && (!S.featured || p.featured));
    $('#v-portfolio').innerHTML = '<div class="wrap sec" style="padding-block-start:36px"><div class="sec-head"><div><p class="eyebrow">Portfolio</p><h2>Rooms we have imagined</h2></div><p class="muted small">Tap a project for the gallery, palette, cost range and the before / after slider.</p></div>' +
      '<div class="pf-bar">' + ['All'].concat(CATS).map(c => '<button class="chip" data-a="filter" data-c="' + esc(c) + '" aria-pressed="' + (S.filter === c) + '">' + esc(c) + '</button>').join('') +
      '<label class="switch" style="margin-left:.6rem"><input type="checkbox" data-i="featured" ' + (S.featured ? 'checked' : '') + '>Featured projects only</label>' +
      '<label class="switch" style="margin-left:auto"><input type="checkbox" data-i="edit" ' + (S.edit ? 'checked' : '') + '>Studio mode (edit)</label>' + (S.edit ? '<button class="btn sm solid" data-a="new">Add project</button>' : '') + '</div>' +
      (list.length ? '<div class="pf-grid">' + list.map(card).join('') + '</div>' : '<p class="muted">No projects match this filter. Turn off Featured only or choose another category.</p>') +
      (S.projects.some(p => p.sample) ? '<p class="small muted" style="margin-top:1.6rem">Entries marked Sample use the studio\'s concept imagery with placeholder details. Switch on Studio mode to replace them with real events, client names, films and testimonials.</p>' : '') + '</div>';
  };
  function openProject(id, shot) {
    const p = proj(id); if (!p) return; const c = projCost(p), inRef = S.prop.refs.includes(id), main = shot || p.images[0];
    modal('<div class="pm"><div class="gal"><img class="main" src="' + src(main) + '" alt="' + esc(p.title) + '"><div class="thumbs">' + p.images.map(i => '<button data-a="shot" data-id="' + id + '" data-img="' + esc(i) + '" class="' + (i === main ? 'on' : '') + '"><img src="' + src(i) + '" alt=""></button>').join('') + '</div></div>' +
      '<div class="info"><div><p class="eyebrow">' + esc(p.cat) + '</p><h2 style="font-size:2.2rem;margin:.3rem 0 .5rem">' + esc(p.title) + '</h2>' + (p.featured ? '<span class="tag feat">Featured</span> ' : '') + (p.sample ? '<span class="tag sample">Sample entry</span>' : '') + '</div>' +
      '<dl class="facts"><div><dt>Client</dt><dd>' + (p.client ? esc(p.client) : '<span class="muted">Not added yet</span>') + '</dd></div><div><dt>Venue</dt><dd>' + (p.venue ? esc(p.venue) : '<span class="muted">Not added yet</span>') + '</dd></div><div><dt>Event date</dt><dd>' + (p.date ? fdate(p.date) : '<span class="muted">Not added yet</span>') + '</dd></div><div><dt>Guests</dt><dd class="num">' + (p.guests || '<span class="muted">Not added yet</span>') + '</dd></div><div><dt>Aesthetic theme</dt><dd>' + esc(p.theme) + '</dd></div><div><dt>Colour palette</dt><dd>' + sw(p.palette, 'lg') + '</dd></div></dl>' +
      (p.testimonial ? '<blockquote>“' + esc(p.testimonial) + '”' + (p.testimonialBy ? '<div class="small muted" style="font-style:normal;font-family:var(--body);margin-top:.4rem">' + esc(p.testimonialBy) + '</div>' : '') + '</blockquote>' : '<blockquote class="empty">No client testimonial added yet. Add the client\'s own words in Studio mode.</blockquote>') +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' + (p.video ? '<a class="btn sm solid" target="_blank" rel="noopener" href="' + esc(p.video) + '">▶ Watch highlight film</a>' : '<span class="small muted" style="align-self:center">No highlight film linked yet.</span>') +
      '<button class="btn sm' + (inRef ? '' : ' gold') + '" data-a="ref" data-id="' + id + '">' + (inRef ? 'Remove from proposal' : 'Add to proposal') + '</button>' + (S.edit ? '<button class="btn sm" data-a="editp" data-id="' + id + '">Edit project</button>' : '') + '</div></div></div>' +
      '<div class="below"><div>' + (c ? '<p class="lab">Décor cost breakdown · ' + p.guests + ' guests · sample rate card</p>' + costTable(c) : '<p class="lab">Décor cost breakdown</p><p class="small muted">Add the guest count in Studio mode and the PKR and USD range appears here.</p>') + '</div><div><p class="lab" style="margin-bottom:.5rem">Venue transformation</p>' +
      (p.before ? baHTML(src(p.before), src(p.images[0]), '16/9') + '<p class="small muted" style="margin-top:.4rem">Drag the handle to compare the raw venue with the finished setup.</p>' : '<div class="drop"><span class="small muted" style="flex:1;min-width:220px">Add the raw, empty venue photo for this event and a drag slider appears here against the finished setup.</span><button class="btn sm" data-a="before" data-id="' + id + '">Upload before photo</button></div>') + '</div></div>');
  }
  function editProject(id) {
    const p = id ? proj(id) : { id: '', title: '', cat: CATS[0], client: '', venue: '', date: '', guests: 200, theme: '', palette: ['#fbf7ee', '#d5ba80', '#a9b295', '#5b5346'], images: [], video: '', testimonial: '', testimonialBy: '', featured: false, before: '', sample: false };
    S.draft = clone(p);
    const f = (k, l, t, extra) => '<div class="f"><label for="e-' + k + '">' + l + '</label><input id="e-' + k + '" type="' + (t || 'text') + '" data-e="' + k + '" value="' + esc(S.draft[k]) + '" ' + (extra || '') + '></div>';
    modal('<div style="padding:clamp(18px,3vw,34px);display:grid;gap:1rem"><h3>' + (id ? 'Edit project' : 'New project') + '</h3><div class="grid2">' + f('title', 'Event title') +
      '<div class="f"><label for="e-cat">Category</label><select id="e-cat" data-e="cat">' + CATS.map(c => '<option' + (c === S.draft.cat ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      f('client', 'Client name') + f('venue', 'Venue location', 'text', 'list="venues"') + f('date', 'Event date', 'date') + f('guests', 'Guest count', 'number', 'min="0" max="5000"') + f('theme', 'Aesthetic theme') + f('video', 'Video highlights link', 'url', 'placeholder="https://"') + '</div>' +
      '<datalist id="venues">' + VENUE_LIST.map(v => '<option value="' + esc(v) + '">').join('') + '</datalist>' +
      '<div class="f"><span class="lab">Colour palette</span><div style="display:flex;gap:.5rem">' + S.draft.palette.map((c, i) => '<input type="color" aria-label="Palette colour ' + (i + 1) + '" data-pal="' + i + '" value="' + esc(c) + '" style="width:54px;height:46px;padding:2px;border:1px solid var(--line);background:#fff">').join('') + '</div></div>' +
      '<div class="f"><label for="e-testimonial">Client testimonial</label><textarea id="e-testimonial" data-e="testimonial">' + esc(S.draft.testimonial) + '</textarea></div>' + f('testimonialBy', 'Testimonial attributed to') +
      '<div class="f"><span class="lab">Image gallery</span><div class="thumbs" id="e-imgs" style="padding:0"></div></div>' +
      '<label class="switch"><input type="checkbox" data-e="featured" ' + (S.draft.featured ? 'checked' : '') + '>Featured project (shown on the home page)</label>' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn solid" data-a="savep">Save project</button><button class="btn" data-a="close">Cancel</button>' + (id ? '<button class="btn" style="margin-left:auto;border-color:#8a2d2d;color:#8a2d2d" data-a="delp" data-id="' + id + '">Delete</button>' : '') + '</div></div>');
    drawDraftImgs();
  }
  function drawDraftImgs() { const el = $('#e-imgs'); if (!el) return; el.innerHTML = S.draft.images.map((i, k) => '<button data-a="rmimg" data-k="' + k + '" title="Remove photo" class="on"><img src="' + src(i) + '" alt="Photo ' + (k + 1) + ', tap to remove"></button>').join('') + '<button class="btn sm" style="width:auto;height:56px" data-a="addimg">Add photo</button>'; }
  function pickImage(cb, max) {
    const inp = $('#file'); inp.value = ''; inp.onchange = () => {
      const f = inp.files[0]; if (!f) return; const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => { const k = Math.min(1, (max || 1400) / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg', 0.8), c.width / c.height); };
      img.onerror = () => toast('That file could not be read as an image. Try a JPG or PNG.'); img.src = url;
    }; inp.click();
  }

  /* ================= MODAL ================= */
  function modal(html) { const m = $('#modal'); m.innerHTML = '<div class="sheet"><button class="x" data-a="close" aria-label="Close">×</button>' + html + '</div>'; m.hidden = false; m.scrollTop = 0; }
  function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
  function confirmBox(text, yes, fn) { S.onYes = fn; modal('<div class="confirm"><h3>' + esc(text) + '</h3><div style="display:flex;gap:.5rem"><button class="btn solid" data-a="yes">' + esc(yes) + '</button><button class="btn" data-a="close">Keep it</button></div></div>'); }

  /* ================= STUDIO ================= */
  let main = null, thumbs = null, glFail = false, tq = [], tcache = new Map(), tTimer = null;
  function ensureStudio() {
    if (main || glFail) return !!main;
    try {
      main = new Studio3D($('#gl'), { interactive: true, shadows: true, animate: true, bloom: true, onChange: () => { if (S.compare) { S.compare = false; drawVp(); } } });
      const tc = document.createElement('canvas'); tc.width = 360; tc.height = 225; thumbs = new Studio3D(tc, { maxDpr: 1 }); thumbs.resize(360, 225);
      const vp = $('#vp'); new ResizeObserver(() => fit()).observe(vp); fit(); applyCfg();
    } catch (e) { glFail = true; main = null; $('#vp').insertAdjacentHTML('beforeend', '<div class="nogl">3D preview needs WebGL, which this browser has switched off. The moodboards, manifest and proposal still work.</div>'); }
    return !!main;
  }
  function fit() { if (!main) return; const vp = $('#vp'), w = vp.clientWidth || 960, h = vp.clientHeight || 600; main.resize(w, h); main.render(); }
  function snap() { const j = JSON.stringify(S.cfg); if (S.hist[S.hist.length - 1] !== j) { S.hist.push(j); if (S.hist.length > 40) S.hist.shift(); S.redo = []; } }
  function restore(j) { const o = JSON.parse(j); Object.keys(S.cfg).forEach(k => delete S.cfg[k]); Object.assign(S.cfg, o); }
  function applyCfg(lightOnly) {
    snap(); if (!main) return;
    if (S.cfg.venue === 'photo' && S.photo && !main.locked) main.solveCamera(S.quad);
    if (S.cfg.venue !== 'photo' && main.locked) main.setView('wide', true);
    if (S.lastVenue === 'street' && S.cfg.venue !== 'street') { main.sv = null; main.setView('wide', true); } S.lastVenue = S.cfg.venue;
    if (S.cfg.venue === 'street') syncStreet();
    if (lightOnly) { main.cfg.time = S.cfg.time; main.light(S.cfg.time); } else main.build(S.cfg);
    main.select(selName()); main.render(); if (S.compare) { S.compare = false; } drawVp();
  }
  function shot(maxW, empty) {
    if (!main) return ''; main.hideSel(true); try { return shot0(maxW, empty); } finally { main.hideSel(false); }
  }
  function shot0(maxW, empty) { const g = $('#gl'), w = maxW || 800, h = Math.round(w * g.height / g.width) || 500, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    if (empty && S.cfg.venue !== 'photo') { main.build(Object.assign({}, S.cfg, { empty: true })); }
    if (S.cfg.venue === 'photo' && S.photo) { x.drawImage($('#vp-photo'), 0, 0, w, h); }
    if (S.cfg.venue === 'street') { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b2420'); gr.addColorStop(1, '#6d6156'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }
    if (!(empty && S.cfg.venue === 'photo')) { main.render(); x.drawImage(g, 0, 0, w, h); }
    if (empty && S.cfg.venue !== 'photo') { main.build(S.cfg); main.render(); }
    if (!empty && S.cfg.venue === 'photo' && S.strokes) { try { x.drawImage($('#mask'), 0, 0, w, h); } catch (e) {} }
    return c.toDataURL('image/jpeg', 0.84);
  }
  function thumb(cfg, view) {
    const c = Object.assign({}, cfg, { guests: view === 'seating' ? Math.min(cfg.guests, 200) : 120 }); if (c.venue === 'photo' || c.venue === 'street') c.venue = 'ballroom'; c.props = [];
    const k = view + JSON.stringify([c.venue, c.palette, c.stage, c.ceiling, c.floor, c.seating, c.entrance, c.fx, c.el, c.room, c.tf, Math.round(c.time * 8), Math.round(c.density * 5), c.on, !!c.empty]);
    if (!tcache.has(k)) { thumbs.setView(view, true); thumbs.build(c); tcache.set(k, thumbs.snapshot()); if (tcache.size > 160) tcache.delete(tcache.keys().next().value); }
    return tcache.get(k);
  }
  function th(cfg, view) { tq.push([cfg, view]); return '<img data-th="' + (tq.length - 1) + '" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">'; }
  function runThumbs() {
    clearTimeout(tTimer); if (!thumbs || window.__twtSkipThumbs) return; const q = tq, imgs = $$('img[data-th]'); let i = 0;
    const next = () => { if (i >= imgs.length || tq !== q) return; const el = imgs[i++], job = q[+el.dataset.th]; if (job && el.isConnected) el.src = thumb(job[0], job[1]); tTimer = setTimeout(next, 0); };
    tTimer = setTimeout(next, 30);
  }
  const selName = () => S.step !== 3 ? null : LAYERS[S.tab] ? S.tab : S.tab === 'props' && S.prop != null && S.cfg.props[S.prop] ? 'p' + S.prop : null;
  function remask() { const m = $('#mask'), ph = $('#vp-photo'); if (!S.strokes || !m) return; const x = m.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, m.width, m.height); x.drawImage(S.strokes, 0, 0); x.globalCompositeOperation = 'source-in'; try { x.drawImage(ph, 0, 0, m.width, m.height); } catch (e) {} x.globalCompositeOperation = 'source-over'; }
  function newMask() { const m = $('#mask'), w = 1000, h = Math.round(1000 / Math.max(1.15, Math.min(2.1, S.photo.ar))); m.width = w; m.height = h; S.strokes = document.createElement('canvas'); S.strokes.width = w; S.strokes.height = h; }
  const LAYERS = { stage: ['Stage & backdrop', STAGES, 'stage', ['seat', 'drape']], ceiling: ['Ceiling & canopy', CEILINGS, 'ceiling', []], floor: ['Aisle & flooring', FLOORS, 'floor', ['markers']], seating: ['Seating & tables', SEATS, 'seating', ['centre', 'chairs', 'linen']], entrance: ['Entrance & accents', ENTRANCES, 'entrance', []] };
  const withCfg = o => Object.assign({}, S.cfg, o, { on: Object.assign({}, S.cfg.on, o.on || {}) });
  function preset(v, rand) { const r = VIBES[v].rec, pick = a => rand ? a[(Math.random() * a.length) | 0] : a[0]; return { vibe: v, palette: pick(r.palette), stage: pick(r.stage), ceiling: pick(r.ceiling), floor: pick(r.floor), seating: pick(r.seating), time: r.time, density: r.density }; }
  const isRec = (kind, id) => (VIBES[S.cfg.vibe].rec[kind] || []).includes(id);
  const recFirst = (kind, ids) => ids.slice().sort((a, b) => isRec(kind, b) - isRec(kind, a));

  function drawVp() {
    const c = S.cfg, photo = c.venue === 'photo' && S.photo, street = c.venue === 'street', ph = $('#vp-photo'), vp = $('#vp');
    { const mk = $('#mask'); mk.hidden = !(photo && S.strokes) || S.compare; mk.classList.toggle('paint', !!(photo && S.paint.on && S.step === 3 && S.tab === 'front')); }
    $('#pano').hidden = !street; vp.classList.toggle('street', street); $('#gl').style.visibility = street && S.decorHidden ? 'hidden' : 'visible';
    ph.hidden = !photo; if (photo && ph.src !== S.photo.url) ph.src = S.photo.url;
    const ar = photo ? Math.max(1.15, Math.min(2.1, S.photo.ar)) : 1.6; if (vp.dataset.ar !== String(ar)) { vp.dataset.ar = ar; vp.style.aspectRatio = ar; }
    $('#hud').innerHTML = [VENUES[c.venue].name, PALETTES[c.palette].name, timeName(c.time)].map(t => '<span>' + esc(t) + '</span>').join('');
    $('#views').innerHTML = street ? '<button data-a="facehere">Face décor this way</button><button data-a="hidedecor">' + (S.decorHidden ? 'Show décor' : 'Hide décor') + '</button>' : photo ? '<button data-a="align">Align to corners</button><button data-a="freelook">' + (main && main.locked ? 'Free look' : 'Photo view') + '</button>' : ['wide', 'stage', 'ceiling', 'floor', 'seating', 'entrance'].map(v => '<button data-a="view" data-v="' + v + '">' + (v === 'floor' ? 'aisle' : v) + '</button>').join('') + '<button data-a="walk" style="background:var(--gold);color:#fff">▶ Walk through</button>';
    const hd = $('#handles'); hd.hidden = !(photo && main && main.locked && !S.compare && S.step === 1);
    if (!hd.hidden) hd.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="' + S.quad.map(p => (p[0] * 100) + ',' + (p[1] * 100)).join(' ') + '" fill="rgba(213,186,128,.14)" stroke="#fff" stroke-width=".35" stroke-dasharray="1.2 1"/></svg>' + S.quad.map((p, i) => '<b data-h="' + i + '" style="left:' + p[0] * 100 + '%;top:' + p[1] * 100 + '%">' + ['NL', 'NR', 'FR', 'FL'][i] + '</b>').join('');
    if (street) S.compare = false;
    const ba = $('#vp-ba'); ba.hidden = !S.compare;
    if (S.compare && main) { const before = photo ? S.photo.url : shot(1100, true), after = shot(1100); ba.innerHTML = baHTML(before, after, 'auto').replace('style="aspect-ratio:auto"', 'style="position:absolute;inset:0"'); } else ba.innerHTML = '';
    $('#vbar').innerHTML = '<button class="btn sm" data-a="undo"' + (S.hist.length < 2 ? ' disabled' : '') + ' aria-label="Undo">↶ Undo</button><button class="btn sm" data-a="redo"' + (!S.redo.length ? ' disabled' : '') + ' aria-label="Redo">↷</button><button class="btn sm' + (S.compare ? ' solid' : '') + '" data-a="compare">' + (street ? (S.decorHidden ? 'Show décor' : 'Before (hide décor)') : S.compare ? 'Back to 3D' : 'Before / After') + '</button><button class="btn sm" data-a="saveconcept">Save concept</button><button class="btn sm" data-a="duel"' + (S.concepts.length < 2 ? ' disabled' : '') + '>A/B design duel</button><button class="btn sm" data-a="newlook">New look</button><button class="btn sm gold" style="margin-left:auto" data-a="toproposal">Use in proposal</button>';
    $('#dials').innerHTML = '<div class="f"><label for="d-den">Floral density</label><input id="d-den" type="range" min="0" max="100" value="' + Math.round(c.density * 100) + '" data-i="density"><span class="v" id="v-den">' + densityName(c.density) + '</span></div><div class="f"><label for="d-time">Day to night</label><input id="d-time" type="range" min="0" max="100" value="' + Math.round(c.time * 100) + '" data-i="time"><span class="v" id="v-time">' + timeName(c.time) + '</span></div><div class="f"><label for="d-g">Guests</label><input id="d-g" type="range" min="50" max="1500" step="10" value="' + c.guests + '" data-i="guests"><span class="v num" id="v-g">' + c.guests + ' guests</span></div>';
  }
  const optCard = (kind, id, o, mb, on, extra) => '<button class="opt' + (on ? ' on' : '') + '" data-a="pick" data-k="' + kind + '" data-id="' + id + '" aria-pressed="' + on + '">' + (isRec(kind, id) ? '<span class="rec">Suits ' + esc(VIBES[S.cfg.vibe].name.replace('The ', '')) + '</span>' : '') + mb + '<span class="tx"><strong>' + esc(o.name) + '</strong><small>' + esc(o.desc || o.line || o.note || '') + '</small>' + (extra || '') + '</span></button>';
  const palTile = id => '<span class="pal">' + PALETTES[id].sw.map(c => '<i style="background:' + c + '"></i>').join('') + '</span>';
  const matTile = (t, bg) => '<span class="tile" style="background:' + bg + '">' + esc(t) + '</span>';

  function drawPanel() {
    const c = S.cfg, P = PALETTES[c.palette]; tq = []; let h = '';
    $('#events').innerHTML = S.events.map((e, i) => '<button class="chip' + (i === S.ev ? ' on' : '') + '" data-a="ev" data-i="' + i + '">' + esc(e.name) + '</button>').join('') + '<button class="chip" data-a="evadd">+ Event</button>' + (S.events.length < 3 ? '<button class="chip" data-a="evweek">Plan mehndi, baraat & walima</button>' : '') + (S.events.length > 1 ? '<button class="chip" data-a="evdel">Remove this event</button><button class="btn sm gold" style="margin-left:auto" data-a="packall">Use all ' + S.events.length + ' events in proposal</button>' : '') + '<span class="f" style="flex-direction:row;align-items:center;gap:.4rem;margin-left:' + (S.events.length > 1 ? '.4rem' : 'auto') + '"><label for="ev-name">Name</label><input id="ev-name" data-i="evname" value="' + esc(S.events[S.ev].name) + '" style="min-height:38px;width:150px"></span>';
    $('#stepper').innerHTML = [['Venue canvas', 1], ['Style questions', 2], ['3D designer', 3], ['Manifest', 4]].map(s => '<button data-a="step" data-s="' + s[1] + '" class="' + (S.step === s[1] ? 'on' : '') + '"><b>' + s[1] + '</b><span>' + s[0] + '</span></button>').join('');
    if (S.step === 1) {
      h = '<div><p class="eyebrow">Step 1</p><h3>Where is the event?</h3></div><div class="opts">' + ['photo', 'ballroom', 'fort', 'farm', 'street'].map(id => optCard('venue', id, VENUES[id], '<span class="mb one">' + (id === 'street' ? '<span class="tile" style="height:100%;background:radial-gradient(circle at 50% 120%,#a9864a,#2c2117 70%);align-items:center;justify-content:center;font-size:.7rem;text-align:center">Live Street View<br>any address</span>' : id === 'photo' ? (S.photo ? '<img src="' + S.photo.url + '" alt="">' : '<span class="tile" style="height:100%;background:repeating-linear-gradient(45deg,#2c2117,#2c2117 10px,#35281c 10px,#35281c 20px);align-items:center;justify-content:center;font-size:.7rem">Upload a venue photo</span>') : th(withCfg({ venue: id, empty: true }), 'wide')) + '</span>', c.venue === id)).join('') + '</div>' +
        (S.venues.length || (c.venue === 'photo' && S.photo) ? '<div class="layer"><h4>Saved venues</h4>' + (S.venues.length ? '<div class="saved" style="margin-top:.4rem">' + S.venues.map((v, i) => '<div class="s"><img src="' + v.url + '" alt=""><div><strong>' + esc(v.name) + '</strong><span style="display:flex;gap:.3rem"><button class="btn sm" data-a="venueload" data-i="' + i + '">Open</button><button class="btn sm" data-a="venuedel" data-i="' + i + '" aria-label="Delete ' + esc(v.name) + '">×</button></span></div></div>').join('') + '</div>' : '') + (c.venue === 'photo' && S.photo ? '<div style="display:flex;gap:.4rem;margin-top:.6rem;flex-wrap:wrap"><input id="vn-name" aria-label="Venue name" placeholder="Venue name, e.g. Haveli courtyard" style="flex:1;min-width:180px;min-height:40px;padding:.4rem .6rem;border:1px solid var(--line)"><button class="btn sm solid" data-a="venuesave">Save this venue</button></div><p class="small muted" style="margin-top:.3rem">Keeps the photo and floor corners on this device.</p>' : '') + '</div>' : '') + (c.venue === 'street' ? streetUI() : '') + (c.venue === 'photo' ? '<div class="note">' + (S.photo ? 'Drag the four gold markers to the corners of the usable floor: near-left, near-right, far-right, far-left. The décor snaps to them when you let go. <button class="btn sm" style="margin-top:.5rem" data-a="pickphoto">Change photo</button>' : 'No photo yet. <button class="btn sm" data-a="pickphoto">Upload venue photo</button>') + '</div>' : '') +
        (c.venue !== 'photo' && c.venue !== 'street' ? '<div class="layer"><h4>' + (c.venue === 'ballroom' ? 'Hall size' : 'Usable area') + '</h4><p class="small muted" style="margin:.2rem 0 .5rem">Enter the real measurements in metres' + (c.venue === 'ballroom' ? '; the 3D hall resizes to match.' : '.') + '</p><div class="grid2" style="grid-template-columns:1fr 1fr 1fr">' + [['w', 'Width', 14, 80], ['d', 'Length', 20, 120], ['h', 'Ceiling', 3, 20]].map(q => '<div class="f"><label for="rm-' + q[0] + '">' + q[1] + '</label><input id="rm-' + q[0] + '" type="number" min="' + q[2] + '" max="' + q[3] + '" step="0.5" value="' + c.room[q[0]] + '" data-i="room" data-k="' + q[0] + '"></div>').join('') + '</div><div id="fit" style="margin-top:.6rem">' + fitHTML(c) + '</div></div>' : '') +
        '<div style="display:flex;justify-content:flex-end"><button class="btn solid" data-a="step" data-s="2">Next: style questions</button></div>';
    } else if (S.step === 2) {
      const qs = ['Vibe', 'Palette', 'Stage', 'Lighting']; let cards = '';
      if (S.q === 0) cards = Object.keys(VIBES).map(id => { const v = VIBES[id], p = preset(id); return optCard('vibe', id, v, '<span class="mb"><img class="big" src="' + IMG(v.img) + '" alt="">' + th(withCfg(Object.assign({}, p, { venue: c.venue })), 'wide') + palTile(p.palette) + '</span>', c.vibe === id, '<small>' + v.words.join(' · ') + '</small>'); }).join('');
      if (S.q === 1) cards = recFirst('palette', Object.keys(PALETTES)).map(id => optCard('palette', id, { name: PALETTES[id].name, desc: RECIPES[id].slice(0, 3).map(r => r[0]).join(', ') }, '<span class="mb">' + th(withCfg({ palette: id }), 'stage').replace('<img', '<img class="big"') + palTile(id) + matTile(PALETTES[id].metal + ' metalwork', PALETTES[id].deep) + '</span>', c.palette === id)).join('');
      if (S.q === 2) cards = recFirst('stage', Object.keys(STAGES)).map(id => { const o = STAGES[id]; return optCard('stage', id, o, '<span class="mb">' + th(withCfg({ stage: id, on: { stage: true } }), 'stage').replace('<img', '<img class="big"') + (o.ref ? '<img src="' + IMG(o.ref) + '" alt="">' : matTile(o.mats[0], P.deep)) + matTile(o.mats[1], '#6f6250') + '</span>', c.stage === id, '<small>' + o.mats.join(' · ') + '</small>'); }).join('');
      if (S.q === 3) cards = Object.keys(TIMES).map(id => { const o = TIMES[id]; return '<button class="opt' + (timeName(c.time) === o.name ? ' on' : '') + '" data-a="pick" data-k="time" data-id="' + id + '"><span class="mb one">' + th(withCfg({ time: o.t }), 'wide') + '</span><span class="tx"><strong>' + o.name + '</strong><small>' + ['Low amber sun, long shadows, candles just lit.', 'Blue-violet sky, warm pools of light on every table.', 'Dark room, full rig: crystal, beams and haze.'][o.t * 2] + '</small></span></button>'; }).join('');
      h = '<div><p class="eyebrow">Step 2 · Question ' + (S.q + 1) + ' of 4</p><h3>' + ['What should the room feel like?', 'Which colours carry it?', 'What stands behind the couple?', 'When does the room come alive?'][S.q] + '</h3></div><div class="qnav">' + qs.map((q, i) => '<button class="chip' + (S.q === i ? ' on' : '') + '" data-a="q" data-q="' + i + '">' + q + '</button>').join('') + '</div><div class="opts">' + cards + '</div>' +
        (S.q === 0 ? '<p class="small muted">Choosing a vibe sets a starting palette, stage and lighting. The next questions put its best matches first.</p>' : '') +
        '<div style="display:flex;justify-content:space-between;gap:.5rem"><button class="btn" data-a="qprev">Back</button><button class="btn solid" data-a="qnext">' + (S.q < 3 ? 'Next question' : 'Open 3D layers') + '</button></div>';
    } else if (S.step === 3) {
      const chips = keys => keys.map(k => '<div style="margin-top:.6rem"><span class="lab">' + ELEMENTS[k].name + '</span><div class="qnav" style="margin-top:.25rem">' + Object.keys(ELEMENTS[k].opts).map(o => '<button class="chip sm' + (String(c.el[k]) === o ? ' on' : '') + '" data-a="el" data-k="' + k + '" data-o="' + o + '" aria-pressed="' + (String(c.el[k]) === o) + '">' + ELEMENTS[k].opts[o] + '</button>').join('') + '</div></div>').join('');
      const tabs = [['stage', 'Stage'], ['ceiling', 'Ceiling'], ['floor', 'Aisle'], ['seating', 'Seating'], ['entrance', 'Entrance'], ['props', 'Pieces' + (c.props.length ? ' (' + c.props.length + ')' : '')], ['front', 'Foreground'], ['look', 'Colour & light'], ['fx', 'Effects'], ['ai', 'Ideas']];
      let body = '';
      if (LAYERS[S.tab]) {
        const L_ = LAYERS[S.tab], key = S.tab, cat = L_[1], ids = Object.keys(cat), t = c.tf[key] || {}, photo = c.venue === 'photo' && S.photo;
        const nb = (k, d, lab, aria) => '<button class="btn sm" data-a="nudge" data-k="' + k + '" data-d="' + d + '" aria-label="' + aria + '">' + lab + '</button>';
        body = '<div class="layer-h"><h4>' + L_[0] + '</h4><label class="switch"><input type="checkbox" data-i="on" data-k="' + key + '" ' + (c.on[key] ? 'checked' : '') + '>Show</label></div>' +
          '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:.5rem;align-items:center;margin-bottom:.6rem"><button class="btn sm" data-a="cycle" data-d="-1" aria-label="Previous style">◂</button><div style="text-align:center"><strong style="font-family:var(--display);font-size:1.25rem;font-weight:500">' + esc(cat[c[key]].name) + '</strong><br><span class="small muted">Style ' + (ids.indexOf(c[key]) + 1) + ' of ' + ids.length + '</span></div><button class="btn sm solid" data-a="cycle" data-d="1" aria-label="Next style">Next ▸</button></div>' +
          '<div class="mini">' + ids.map(id => '<button data-a="pick" data-k="' + key + '" data-id="' + id + '" class="' + (c[key] === id ? 'on' : '') + '" aria-pressed="' + (c[key] === id) + '">' + th(withCfg({ [key]: id, tf: {}, on: { [key]: true } }), L_[2]) + '<span>' + esc(cat[id].name) + '</span></button>').join('') + '</div>' +
          (cat[c[key]].ref ? '<figure style="margin:.6rem 0 0;display:grid;grid-template-columns:110px 1fr;gap:.6rem;align-items:center"><img src="' + IMG(cat[c[key]].ref) + '" alt="" style="width:110px;height:80px;object-fit:cover"><figcaption class="small muted"><span class="lab">From our events</span><br>' + esc(cat[c[key]].desc) + '</figcaption></figure>' : '<p class="small muted" style="margin-top:.5rem">' + esc(cat[c[key]].desc) + '</p>') +
          chips(L_[3]) +
          '<div class="layer" style="margin-top:.8rem"><div class="layer-h"><h4>Place it</h4>' + (photo ? '<span class="small muted">Drag it in the photo</span>' : '<label class="switch"><input type="checkbox" data-i="move" ' + (S.move ? 'checked' : '') + '>Drag to move</label>') + '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem">' + nb('x', -1, '← Left', 'Move left') + nb('x', 1, 'Right →', 'Move right') + nb('z', -1, '↑ Back', 'Move back') + nb('z', 1, '↓ Front', 'Move forward') + nb('r', -1, '⟲ Turn', 'Rotate left') + nb('r', 1, 'Turn ⟳', 'Rotate right') + nb('s', -1, '− Smaller', 'Make smaller') + nb('s', 1, '+ Bigger', 'Make bigger') + nb('y', 1, '▲ Raise', 'Raise') + nb('y', -1, '▼ Lower', 'Lower') + '<button class="btn sm" style="grid-column:span 2" data-a="tfreset">Reset position</button></div>' +
          '<p class="small muted num" style="margin-top:.4rem">Offset ' + (t.x || 0).toFixed(1) + ' m across, ' + (t.z || 0).toFixed(1) + ' m deep, ' + (t.y || 0).toFixed(1) + ' m up · turned ' + Math.round((t.r || 0) * 57.3) + '° · size ' + Math.round((t.s || 1) * 100) + '%</p></div>';
      } else if (S.tab === 'props') {
        const q = S.prop != null ? c.props[S.prop] : null;
        body = '<h4>Add single pieces</h4><p class="small muted" style="margin:.2rem 0 .5rem">Tap to add, then drag the piece in the view to where it belongs.</p><div class="qnav">' + Object.keys(PROPS).map(t => '<button class="chip sm" data-a="propadd" data-t="' + t + '">+ ' + PROPS[t].name + '</button>').join('') + '</div>' +
          (c.props.length ? '<div class="layer" style="margin-top:.8rem"><h4>Placed pieces</h4><div class="qnav" style="margin-top:.4rem">' + c.props.map((x, i) => '<button class="chip sm' + (i === S.prop ? ' on' : '') + '" data-a="propsel" data-i="' + i + '">' + (i + 1) + ' · ' + PROPS[x.t].name + '</button>').join('') + '</div>' +
          (q ? '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem;margin-top:.6rem"><button class="btn sm" data-a="propdo" data-k="r" data-d="-1">⟲ Turn</button><button class="btn sm" data-a="propdo" data-k="r" data-d="1">Turn ⟳</button><button class="btn sm" data-a="propdo" data-k="dup">Duplicate</button><button class="btn sm" data-a="propdo" data-k="s" data-d="-1">− Smaller</button><button class="btn sm" data-a="propdo" data-k="s" data-d="1">+ Bigger</button><button class="btn sm" style="border-color:#8a2d2d;color:#8a2d2d" data-a="propdo" data-k="del">Remove</button></div><p class="small muted num" style="margin-top:.4rem">' + PROPS[q.t].name + ' at ' + q.x.toFixed(1) + ' m across, ' + q.z.toFixed(1) + ' m deep · size ' + Math.round(q.s * 100) + '%</p>' : '<p class="small muted" style="margin-top:.4rem">Tap a piece in the list or in the view to select it.</p>') +
          '<button class="btn sm" style="margin-top:.5rem" data-a="propclear">Remove all pieces</button></div>' : '');
      } else if (S.tab === 'front') {
        body = c.venue === 'photo' && S.photo ? '<h4>Bring the foreground forward</h4><p class="small muted" style="margin:.2rem 0 .6rem">Paint over anything real that should stay in front of the décor: a tree trunk, a pillar, a railing. The décor then sits behind it.</p><div class="qnav"><button class="chip' + (S.paint.on && !S.paint.erase ? ' on' : '') + '" data-a="paint" data-m="paint">Paint foreground</button><button class="chip' + (S.paint.on && S.paint.erase ? ' on' : '') + '" data-a="paint" data-m="erase">Erase</button><button class="chip' + (!S.paint.on ? ' on' : '') + '" data-a="paint" data-m="off">Done painting</button><button class="chip" data-a="paint" data-m="clear">Clear all</button></div><div class="f" style="margin-top:.6rem"><label for="br">Brush size</label><input id="br" type="range" min="10" max="140" value="' + S.paint.size + '" data-i="brush"></div>' : '<h4>Bring the foreground forward</h4><p class="small muted" style="margin-top:.3rem">This works on your own venue photo. Choose "Your own venue photo" in step 1 first.</p>';
      } else if (S.tab === 'look') {
        body = '<h4>Colour palette</h4><div class="qnav" style="margin:.5rem 0 .2rem">' + Object.keys(PALETTES).map(id => '<button class="chip' + (c.palette === id ? ' on' : '') + '" data-a="pick" data-k="palette" data-id="' + id + '" style="gap:.5rem">' + sw(PALETTES[id].sw.slice(0, 4)) + '<span style="margin-left:.6rem">' + PALETTES[id].name + '</span></button>').join('') + '</div>' + chips(['candles']) + '<p class="small muted" style="margin-top:.8rem">Floral density, day-to-night light and guest count are the three sliders under the view.</p>';
      } else if (S.tab === 'fx') {
        body = '<h4>Live effects</h4><p class="small muted" style="margin:.2rem 0 .5rem">Animated in the view and added to the manifest.</p><div class="qnav">' + Object.keys(FX).map(k => '<button class="chip' + (c.fx[k] ? ' on' : '') + '" data-a="fx" data-k="' + k + '" aria-pressed="' + !!c.fx[k] + '">' + FX[k] + '</button>').join('') + '</div>';
      } else {
        body = ('<div><h4>Reimagine from a wish</h4><p class="small muted" style="margin:.2rem 0 .5rem">' + (S.ai ? 'Claude reads the wish' + (S.photo ? ' and your venue photo' : '') + ', then picks every layer and explains why.' : 'Type what the client says. Keywords pick the layers. Opened inside Claude, this box uses Claude to write the brief instead.') + '</p><div class="f"><label for="wish">Client wish</label><input id="wish" placeholder="e.g. royal but not heavy, lots of candles, burgundy" value="' + esc(S.wish || '') + '" data-i="wish"></div><button class="btn solid" style="margin-top:.5rem" data-a="reimagine"' + (S.busy ? ' disabled' : '') + '>' + (S.busy ? 'Thinking…' : 'Reimagine the room') + '</button> <button class="btn" style="margin-top:.5rem" data-a="inspo"' + (S.busy ? ' disabled' : '') + '>Match an inspiration photo</button>' +
        (S.note ? '<div class="note" style="margin-top:.7rem"><span class="lab">' + esc(S.note.by) + '</span><br>' + esc(S.note.text) + '</div>' : '') + '</div>') +
        '<div class="layer"><div class="layer-h"><h4>Saved concepts</h4><span class="small muted">' + S.concepts.length + ' saved</span></div>' + (S.concepts.length ? '<div class="saved">' + S.concepts.map((k, i) => '<div class="s"><img src="' + k.img + '" alt=""><div><strong>' + esc(k.name) + '</strong><span class="muted num">' + range(k.lo, k.hi) + '</span><span style="display:flex;gap:.3rem"><button class="btn sm" data-a="loadc" data-i="' + i + '">Load</button><button class="btn sm" data-a="delc" data-i="' + i + '" aria-label="Delete ' + esc(k.name) + '">×</button></span></div></div>').join('') + '</div>' : '<p class="small muted">Save two looks, then open the A/B design duel to compare them side by side.</p>') + '</div>';
      }
      h = '<div><p class="eyebrow">Step 3 · Designer</p><h3>Select a piece, then change it</h3></div><div class="qnav">' + tabs.map(q => '<button class="chip' + (S.tab === q[0] ? ' on' : '') + '" data-a="tab" data-t="' + q[0] + '">' + q[1] + (LAYERS[q[0]] && !c.on[q[0]] ? ' (off)' : '') + '</button>').join('') + '</div><div>' + body + '</div>' +
        '<div style="display:flex;justify-content:flex-end"><button class="btn solid" data-a="step" data-s="4">See the manifest</button></div>';
    } else {
      const m = manifest(c), tbl = (rows) => '<table>' + rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table>';
      h = '<div><p class="eyebrow">Step 4</p><h3>Botanical & production manifest</h3><p class="small muted">Built from the design on screen: ' + esc(STAGES[c.stage].name) + ', ' + esc(CEILINGS[c.ceiling].name) + ', ' + esc(FLOORS[c.floor].name) + ', ' + esc(SEATS[c.seating].name) + (c.on.entrance ? ', ' + esc(ENTRANCES[c.entrance].name) : '') + ' for ' + c.guests + ' guests.</p></div><div class="man">' +
        '<h4>Botanical <span class="small muted num">' + m.stems.toLocaleString() + ' stems</span></h4>' + (m.botanical.length ? tbl(m.botanical) : '<p class="small muted">All floral layers are switched off.</p>') +
        '<h4>Structural carpentry</h4>' + (m.structure.length ? tbl(m.structure) : '<p class="small muted">No built structures in this design.</p>') +
        '<h4>Furniture & tabletop <span class="small muted num">' + m.tables + ' tables</span></h4>' + (m.furniture.length ? tbl(m.furniture) : '<p class="small muted">Seating layer is switched off.</p>') +
        '<h4>Lighting, sound & power</h4>' + tbl(m.av) + '<h4>Crew & schedule</h4>' + tbl(m.crew) + '</div>' +
        '<div><p class="lab">Indicative décor estimate · sample rate card</p>' + costTable(m) + '<p class="small muted" style="margin-top:.5rem">USD at PKR ' + S.prop.fx + '. Quantities and rates are planning figures, confirmed after a site visit.</p></div>' +
        '<div class="layer"><h4>Fit this design to a budget</h4><div class="f" style="margin-top:.4rem"><label for="bud">Décor budget ceiling</label><input id="bud" type="range" min="800000" max="15000000" step="100000" value="' + S.budget + '" data-i="budget"><span class="v num" id="v-bud" style="font-family:var(--display);font-size:1.15rem">' + pkr(S.budget) + ' · ' + usd(S.budget) + '</span></div><div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem"><button class="btn solid sm" data-a="fitbudget">Fit to this budget</button>' + (S.fitLog && S.fitLog.undo ? '<button class="btn sm" data-a="fitundo">Undo changes</button>' : '') + '</div>' + (S.fitLog ? '<div class="note" style="margin-top:.6rem"><strong>' + esc(S.fitLog.head) + '</strong>' + (S.fitLog.steps.length ? '<table class="cost" style="margin-top:.4rem">' + S.fitLog.steps.map(x => '<tr><td>' + esc(x[0]) + '</td><td>saves ' + pkr(x[1]) + '</td></tr>').join('') + '</table>' : '') + '</div>' : '') + '</div>' +
        '<div class="layer"><h4>Supplier order sheets</h4><p class="small muted" style="margin:.2rem 0 .5rem">One list per vendor, ready to paste into WhatsApp or email.</p><div class="qnav">' + [['botanical', 'Florist'], ['structure', 'Carpenter & fabricator'], ['furniture', 'Furniture hire'], ['av', 'Lighting, sound & power']].map(q => '<button class="chip" data-a="sheet" data-k="' + q[0] + '" data-n="' + q[1] + '">Copy ' + q[1].toLowerCase() + ' order</button>').join('') + '</div></div>' +
        '<div><p class="lab">Photo brief for an image generator</p><pre class="msg" style="margin-top:.4rem">' + esc(brief(c)) + '</pre><p class="small muted" style="margin-top:.4rem">The 3D view is a model, not a photograph. Paste this brief into an AI image tool for a photographic render of the same design.</p><button class="btn sm" style="margin-top:.5rem" data-a="copybrief">Copy photo brief</button></div>' +
        '<div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn" data-a="copyman">Copy manifest</button><button class="btn gold" data-a="toproposal">Use in proposal</button></div>';
    }
    $('#panel').innerHTML = h; runThumbs();
  }
  function streetUI() {
    const live = GM.state === 'live';
    return '<div class="note" style="display:grid;gap:.7rem"><div><span class="lab">Live Street View</span><br>' + (live ? 'Showing ' + esc(GM.where || 'this location') + '. Drag the street scene to look around; the décor stays planted on the ground.' : 'Type the venue address, paste a Google Maps link, or enter "lat, lng".') + '</div>' +
      '<div class="f"><label for="sv-loc">Venue location</label><input id="sv-loc" data-i="loc" value="' + esc(S.loc) + '" placeholder="e.g. Royal Palm Golf & Country Club, Lahore"></div>' +
      '<div class="qnav">' + VENUE_LIST.map(v => '<button class="chip" data-a="svquick" data-q="' + esc(v + ', Lahore, Pakistan') + '">' + esc(v.replace(/ \(.*\)/, '')) + '</button>').join('') + '</div>' +
      '<div class="f"><label for="sv-key">Google Maps API key</label><input id="sv-key" data-i="gkey" value="' + esc(S.gkey) + '" placeholder="Paste your Maps JavaScript API key" autocomplete="off"><span class="small muted">Kept in this browser only. Needs Maps JavaScript API and Geocoding API switched on.</span></div>' +
      '<button class="btn solid" data-a="svfind"' + (GM.state === 'loading' ? ' disabled' : '') + '>' + (GM.state === 'loading' ? 'Loading Street View…' : 'Show this street') + '</button>' +
      (GM.msg ? '<div style="color:var(--warn)">' + esc(GM.msg) + '</div>' : '') +
      (live ? '<div class="grid2"><div class="f"><label for="sv-dist">Distance to décor</label><input id="sv-dist" type="range" min="12" max="90" value="' + S.sv.dist + '" data-i="svdist"></div><div class="f"><label for="sv-scale">Décor scale</label><input id="sv-scale" type="range" min="30" max="160" value="' + Math.round(S.sv.scale * 100) + '" data-i="svscale"></div><div class="f"><label for="sv-h">Camera height</label><input id="sv-h" type="range" min="10" max="60" value="' + Math.round(S.sv.height * 10) + '" data-i="svheight"></div></div>' : '') + '</div>';
  }
  function syncStreet() { if (!main) return; let pov = { heading: S.sv.h0, pitch: 0, zoom: 1 }; if (GM.pano) { const p = GM.pano.getPov(); pov = { heading: p.heading, pitch: p.pitch, zoom: GM.pano.getZoom() }; } main.setStreet(pov, S.sv); }
  function loadMaps(cb) {
    if (window.google && google.maps && google.maps.StreetViewService) { cb(true); return; }
    let done = false; const fin = ok => { if (!done) { done = true; cb(ok); } };
    window.gm_authFailure = () => { GM.state = 'error'; GM.msg = 'Google rejected this API key. Check that Maps JavaScript API is enabled, billing is on, and the key allows this website.'; drawPanel(); };
    window.__twtMaps = () => fin(true);
    const sc = document.createElement('script'); sc.src = 'https://maps.googleapis.com/maps/api/js?v=weekly&key=' + encodeURIComponent(S.gkey) + '&callback=__twtMaps'; sc.async = true; sc.onerror = () => fin(false); document.head.appendChild(sc); setTimeout(() => fin(false), 8000);
  }
  function findStreet(q) {
    q = (q || '').trim(); if (!q) { GM.msg = 'Enter the venue address first.'; drawPanel(); return; }
    if (!S.gkey.trim()) { GM.msg = 'Street View needs a Google Maps API key. Paste yours in the box below the address.'; drawPanel(); return; }
    GM.state = 'loading'; GM.msg = ''; drawPanel();
    loadMaps(ok => {
      if (!ok) { GM.state = 'blocked'; GM.msg = 'Google Maps could not load on this page. The Claude-hosted version blocks outside map services, so Street View only runs when this app is opened from your own website. Use a venue photo here instead.'; drawPanel(); return; }
      const fail = m => { GM.state = 'none'; GM.msg = m; drawPanel(); };
      const go = loc => {
        GM.svc = GM.svc || new google.maps.StreetViewService();
        GM.svc.getPanorama({ location: loc, radius: 400, preference: 'nearest' }).then(r => {
          if (!GM.pano) { GM.pano = new google.maps.StreetViewPanorama($('#pano'), { addressControl: false, fullscreenControl: false, motionTracking: false, motionTrackingControl: false, showRoadLabels: false, zoomControl: false }); GM.pano.addListener('pov_changed', syncStreet); GM.pano.addListener('zoom_changed', syncStreet); }
          GM.pano.setPano(r.data.location.pano); GM.pano.setVisible(true); GM.state = 'live'; GM.where = r.data.location.description || q; S.sv.h0 = GM.pano.getPov().heading; S.decorHidden = false; applyCfg(); drawPanel();
        }).catch(() => fail('No Street View imagery within 400 m of that spot. Coverage in Pakistan is limited to selected roads and landmarks. Try a main road near the venue, or switch to a venue photo.'));
      };
      const m = q.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
      if (m) go({ lat: +m[1], lng: +m[2] }); else new google.maps.Geocoder().geocode({ address: q }).then(r => go(r.results[0].geometry.location)).catch(() => fail('That address could not be found. Paste a Google Maps link or "lat, lng" coordinates instead.'));
    });
  }
  R.studio = () => { ensureStudio(); drawVp(); drawPanel(); requestAnimationFrame(fit); };
  function brief(c) {
    const P = PALETTES[c.palette], e = c.el, E = ELEMENTS, low = x => x.toLowerCase(), bits = [];
    const where = { fort: 'the open courtyard of Lahore Fort, red sandstone Mughal arcades and white marble chhatris', ballroom: 'a grand pillarless hotel ballroom in Lahore with cream panelled walls and polished parquet', farm: 'a private farmhouse lawn on Bedian Road, Lahore, framed by mature trees', photo: 'the venue shown in the reference photo', street: 'the venue shown in the reference photo' }[c.venue];
    if (c.on.stage) bits.push('Stage: ' + low(STAGES[c.stage].name) + ' (' + low(STAGES[c.stage].desc.replace(/\.$/, '')) + ')' + (e.seat !== 'none' ? ', with ' + low(E.seat.opts[e.seat]) : '') + (e.drape !== 'none' ? ' and a ' + low(E.drape.opts[e.drape]) + ' backdrop' : '') + '.');
    if (c.on.ceiling) bits.push('Overhead: ' + low(CEILINGS[c.ceiling].name) + ', ' + low(CEILINGS[c.ceiling].desc));
    if (c.on.floor) bits.push('Aisle: ' + low(FLOORS[c.floor].name) + (e.markers !== 'none' ? ' lined with ' + low(E.markers.opts[e.markers]) : '') + '.');
    if (c.on.seating) bits.push('Seating for ' + c.guests + ' guests: ' + low(SEATS[c.seating].name) + ', ' + low(E.chairs.opts[e.chairs]) + ' chairs, ' + low(E.linen.opts[e.linen]) + ' linen' + (e.centre !== 'none' ? ', ' + low(E.centre.opts[e.centre]) + ' centrepieces' : '') + '.');
    if (c.on.entrance) bits.push('Entrance: ' + low(ENTRANCES[c.entrance].name) + '.');
    const fx = Object.keys(FX).filter(k => c.fx[k]).map(k => low(FX[k])); if (fx.length) bits.push('In the air: ' + fx.join(', ') + '.');
    return 'Photorealistic wide-angle photograph of a luxury Pakistani wedding setup at ' + where + ', ' + low(timeName(c.time)) + '. Mood: ' + VIBES[c.vibe].line.toLowerCase() + ' Colour palette ' + P.name + ' (' + P.sw.slice(0, 4).join(', ') + ') with ' + P.metal + ' metalwork. ' + bits.join(' ') + ' Florals are ' + low(densityName(c.density)) + ': ' + RECIPES[c.palette].slice(0, 4).map(r => r[0]).join(', ') + '. ' + (e.candles ? (e.candles > 1 ? 'Hundreds of' : 'Clusters of') + ' real candles. ' : '') + 'No people. Shot on a full-frame camera, 24mm, natural depth of field, editorial event photography, true-to-life materials and lighting.';
  }
  const mid = c => { const m = manifest(c); return (m.lo + m.hi) / 2; };
  function fitHTML(c) {
    const r = c.room, out = [], T = tableCount(c), shown = Math.min(T, c.seating === 'mirror' || c.seating === 'velvet' ? 12 : 30);
    const needW = c.on.seating ? (({ round: [12.7, 20.5, 28.3], majlis: [14.6, 22.4, 30.2], mirror: [14.2, 23.8], velvet: [14.8, 24.4] }[c.seating] || [26, 26, 26])[Math.min(Math.ceil(shown / (c.seating === 'mirror' || c.seating === 'velvet' ? 6 : 10)), c.seating === 'mirror' || c.seating === 'velvet' ? 2 : 3) - 1]) : 12;
    const needH = Math.max(c.on.stage ? ({ jharoka: 9.2, rosewall: 5.8, tunnel: 5.8, jhoola: 6.6, moongate: 7.3, mandap: 7.5, gotalotus: 6.8, pillars: 7.3 }[c.stage] || 6.5) : 0, c.on.ceiling && c.ceiling !== 'sky' ? 8.8 : 0);
    const per = ({ round: 1.5, mirror: 1.2, velvet: 1.3, majlis: 2 }[c.seating] || 1.6), cap = Math.max(0, Math.floor((r.w * r.d - 78 - 3.2 * r.d) / per / 10) * 10);
    const row = (ok, t) => out.push('<div class="small" style="display:flex;gap:.5rem;padding:.2rem 0"><span class="tag ' + (ok ? 'ok' : 'sample') + '">' + (ok ? 'Fits' : 'Check') + '</span><span>' + t + '</span></div>');
    row(r.w >= needW, 'Width: this layout needs ' + needW + ' m, the venue has ' + r.w + ' m.');
    row(r.d >= 33, 'Length: stage to entrance needs 33 m, the venue has ' + r.d + ' m.');
    if (c.venue === 'ballroom' && needH) row(r.h >= needH, 'Height: ' + (c.on.stage && needH > 8.8 ? STAGES[c.stage].name : 'the chosen stage and canopy') + ' needs ' + needH + ' m clear, the ceiling is ' + r.h + ' m.');
    if (c.on.seating) row(cap >= c.guests, 'Capacity: about ' + cap + ' guests with ' + SEATS[c.seating].name.toLowerCase() + '; you planned ' + c.guests + '.' + (T > shown ? ' The 3D view shows ' + shown + ' of ' + T + ' tables.' : ''));
    return out.join('');
  }
  function fitBudget() {
    const c = S.cfg, before = clone(c), steps = [], start = mid(c), cheaper = (kind, order) => { const i = order.indexOf(c[kind]); return i >= 0 && i < order.length - 1 ? order[i + 1] : null; };
    const moves = [
      () => { if (Object.keys(c.fx).some(k => c.fx[k])) { Object.keys(c.fx).forEach(k => c.fx[k] = false); return 'Live effects removed'; } },
      () => { if (c.density > 0.5) { c.density = Math.max(0.5, c.density - 0.15); return 'Florals eased to ' + densityName(c.density); } },
      () => { if (c.el.centre === 'tall') { c.el.centre = 'low'; return 'Centrepieces changed to low florals'; } },
      () => { const n = c.on.ceiling && cheaper('ceiling', ['chandeliers', 'wisteria', 'lanterns', 'drapes', 'fairy']); if (n) { c.ceiling = n; return 'Ceiling changed to ' + CEILINGS[n].name; } },
      () => { const n = c.on.seating && cheaper('seating', ['mirror', 'majlis', 'velvet', 'round']); if (n) { c.seating = n; return 'Seating changed to ' + SEATS[n].name; } },
      () => { const n = c.on.floor && cheaper('floor', ['mirror', 'chequer', 'acrylic', 'rug', 'petal', 'lawn']); if (n) { c.floor = n; return 'Aisle changed to ' + FLOORS[n].name; } },
      () => { if (c.density > 0.25) { c.density = Math.max(0.25, c.density - 0.15); return 'Florals eased to ' + densityName(c.density); } },
      () => { const n = c.on.stage && cheaper('stage', ['tunnel', 'jharoka', 'mandap', 'rosewall', 'moongate', 'jhoola']); if (n) { c.stage = n; return 'Stage changed to ' + STAGES[n].name; } },
      () => { if (c.on.entrance && c.entrance !== 'welcome') { c.entrance = 'welcome'; return 'Entrance changed to ' + ENTRANCES.welcome.name; } },
      () => { if (c.on.ceiling) { c.on.ceiling = false; return 'Ceiling installation removed'; } },
      () => { if (c.on.entrance) { c.on.entrance = false; return 'Entrance piece removed'; } }
    ];
    let guard = 0;
    while (mid(c) > S.budget && guard++ < 40) { let done = false; for (const mv of moves) { const was = mid(c), snap = clone(c), label = mv(); if (label) { const now = mid(c); if (now < was - 20000) { const key = label.split(' ')[0], last = steps[steps.length - 1]; if (last && last[0].split(' ')[0] === key) { last[0] = label; last[1] += was - now; } else steps.push([label, was - now]); done = true; break; } Object.assign(c, snap); } } if (!done) break; }
    const end = mid(c), ok = end <= S.budget;
    S.fitLog = { head: start <= S.budget ? 'Already inside the budget at about ' + pkr(start) + '. Nothing changed.' : ok ? 'Now about ' + pkr(end) + ', down from ' + pkr(start) + '.' : 'Lowest this design reaches is about ' + pkr(end) + ', still above ' + pkr(S.budget) + '. Reduce guests or raise the ceiling.', steps: steps, undo: steps.length ? before : null };
    applyCfg(); drawPanel();
  }
  function sheetText(key, title) {
    const c = S.cfg, m = manifest(c), cl = S.prop.client, rows = m[key];
    return ['THE WED THEORY · ' + title.toUpperCase() + ' ORDER', 'Event: ' + S.events[S.ev].name + ' · ' + fdate(cl.date) + ' · ' + (cl.venue || VENUES[c.venue].name) + ' · ' + c.guests + ' guests', 'Palette: ' + PALETTES[c.palette].name + ' · Setup: ' + m.crew[m.crew.length - 1][1] + ' before doors', '', rows.length ? rows.map((r, i) => (i + 1) + '. ' + r[0] + ' — ' + r[1]).join('\n') : 'Nothing required from this supplier for the current design.', '', 'Please confirm availability and quote to The Wed Theory, ' + WA_TXT + '.'].join('\n');
  }
  const WEEK = {
    Mehndi: { vibe: 'heirloom', palette: 'marigold', stage: 'jhoola', ceiling: 'lanterns', floor: 'rug', seating: 'majlis', entrance: 'lightwalk', time: 0.15, density: 0.75, el: { markers: 'lantern' }, fx: { petals: true } },
    Baraat: { vibe: 'heirloom', palette: 'burgundy', stage: 'jharoka', ceiling: 'chandeliers', floor: 'mirror', seating: 'mirror', entrance: 'gate', time: 0.9, density: 0.7, el: { seat: 'thrones' }, fx: { sparks: true } },
    Walima: { vibe: 'romantic', palette: 'ivory', stage: 'moongate', ceiling: 'wisteria', floor: 'petal', seating: 'round', entrance: 'welcome', time: 0.5, density: 0.5, el: {}, fx: {} }
  };
  function switchEvent(i) { S.ev = i; S.cfg = S.events[i].cfg; S.note = null; S.fitLog = null; if (main) main.prevKeys = null; applyCfg(); drawPanel(); }
  function inspo() {
    pickImage((d) => {
      const img = new Image(); img.onload = () => {
        const cv = document.createElement('canvas'); cv.width = cv.height = 32; const x = cv.getContext('2d'); x.drawImage(img, 0, 0, 32, 32); const px = x.getImageData(0, 0, 32, 32).data; let lum = 0; const pts = [];
        for (let i = 0; i < px.length; i += 4) { pts.push([px[i], px[i + 1], px[i + 2]]); lum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]; } lum /= pts.length * 255;
        const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; let best = null, bs = 1e18;
        Object.keys(PALETTES).forEach(id => { const sw = PALETTES[id].sw.map(rgb); let sc = 0; pts.forEach(q => { let m = 1e9; sw.forEach(w => { const dd = (q[0] - w[0]) ** 2 + (q[1] - w[1]) ** 2 + (q[2] - w[2]) ** 2; if (dd < m) m = dd; }); sc += m; }); sw.forEach(w => { let m = 1e9; pts.forEach(q => { const dd = (q[0] - w[0]) ** 2 + (q[1] - w[1]) ** 2 + (q[2] - w[2]) ** 2; if (dd < m) m = dd; }); sc += m * 40; }); if (sc < bs) { bs = sc; best = id; } });
        const time = lum < 0.28 ? 1 : lum < 0.5 ? 0.55 : 0.1, vibe = Object.keys(VIBES).find(v => VIBES[v].rec.palette[0] === best) || Object.keys(VIBES).find(v => VIBES[v].rec.palette.includes(best)) || S.cfg.vibe;
        const o = Object.assign(preset(vibe), { palette: best, time: time, entrance: S.cfg.entrance });
        S.inspoUrl = d;
        if (S.ai) { S.wish = 'Match the attached inspiration photo as closely as the catalogue allows.'; reimagine(d, o); }
        else setLook(o, { by: 'Colour match', text: 'The photo\'s colours sit closest to ' + PALETTES[best].name + ' and its light reads as ' + timeName(time).toLowerCase() + ', so the room starts from ' + VIBES[vibe].name + '. Adjust any layer from here.' });
      }; img.src = d;
    }, 900);
  }
  function conceptName() { return VIBES[S.cfg.vibe].name.replace('The ', '') + ' · ' + STAGES[S.cfg.stage].name; }
  function saveConcept(silent) {
    if (!ensureStudio()) { toast('The 3D preview is unavailable in this browser, so there is no image to save.'); return null; }
    const m = manifest(S.cfg), k = { id: 'c' + Date.now(), name: (S.events.length > 1 ? S.events[S.ev].name : 'Concept ' + String.fromCharCode(65 + S.concepts.length % 26)) + ' · ' + conceptName(), cfg: Object.assign(clone(S.cfg), S.cfg.venue === 'street' ? { venue: 'ballroom' } : {}), img: shot(720), lo: m.lo, hi: m.hi, stems: m.stems };
    S.concepts.push(k); if (S.concepts.length > 10) S.concepts.shift(); persist(); if (!silent) toast('Saved as ' + k.name + '.'); return k;
  }
  function manifestText(c) {
    const m = manifest(c), sec = (t, rows) => rows.length ? t + '\n' + rows.map(r => '• ' + r[0] + ': ' + r[1]).join('\n') : '';
    return ['THE WED THEORY · Production manifest', VENUES[c.venue].name + ' · ' + c.guests + ' guests · ' + timeName(c.time), sec('BOTANICAL (' + m.stems + ' stems)', m.botanical), sec('STRUCTURE', m.structure), sec('FURNITURE', m.furniture), sec('LIGHTING, SOUND, POWER', m.av), sec('CREW', m.crew), 'Indicative décor range: ' + range(m.lo, m.hi)].filter(Boolean).join('\n\n');
  }
  function openDuel() {
    const A = S.concepts[S.duel[0]] || S.concepts[0], B = S.concepts[S.duel[1]] || S.concepts[1]; if (!A || !B) return;
    const rows = [['Venue', k => VENUES[k.cfg.venue].name], ['Vibe', k => VIBES[k.cfg.vibe].name], ['Palette', k => PALETTES[k.cfg.palette].name], ['Stage', k => k.cfg.on.stage ? STAGES[k.cfg.stage].name : 'None'], ['Ceiling', k => k.cfg.on.ceiling ? CEILINGS[k.cfg.ceiling].name : 'None'], ['Aisle', k => k.cfg.on.floor ? FLOORS[k.cfg.floor].name : 'None'], ['Seating', k => k.cfg.on.seating ? SEATS[k.cfg.seating].name : 'None'], ['Entrance', k => k.cfg.on.entrance ? ENTRANCES[k.cfg.entrance].name : 'None'], ['Effects', k => Object.keys(FX).filter(x => k.cfg.fx[x]).map(x => FX[x]).join(', ') || 'None'], ['Lighting', k => timeName(k.cfg.time)], ['Florals', k => densityName(k.cfg.density) + ', ' + k.stems.toLocaleString() + ' stems'], ['Estimate', k => range(k.lo, k.hi)]];
    const side = (k, o, idx, lab) => '<div class="side"><img src="' + k.img + '" alt="' + esc(k.name) + '"><div><p class="eyebrow">Design ' + lab + '</p><div class="f" style="margin:.3rem 0"><label for="duel' + idx + '">Concept</label><select id="duel' + idx + '" data-i="duel" data-k="' + idx + '">' + S.concepts.map((x, i) => '<option value="' + i + '"' + (x === k ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></div><dl>' + rows.map(r => '<dt>' + r[0] + '</dt><dd class="' + (r[1](k) !== r[1](o) ? 'diff' : '') + '">' + esc(r[1](k)) + '</dd>').join('') + '</dl><div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn sm solid" data-a="choose" data-id="' + k.id + '">Choose ' + lab + ' for proposal</button><button class="btn sm" data-a="loadc" data-i="' + S.concepts.indexOf(k) + '">Open in 3D</button></div></div></div>';
    modal('<div style="padding:1.2rem 1.4rem .8rem"><p class="eyebrow">A/B design duel</p><h3>Two rooms, side by side</h3><p class="small muted">Differences are marked in gold.</p></div><div class="duel">' + side(A, B, 0, 'A') + side(B, A, 1, 'B') + '</div>');
  }
  const KW = [[/royal|mughal|tradition|heritage|shahi|regal/, { vibe: 'heirloom' }], [/mehndi|mayun|marigold|genda|vibrant|dholki|colou?rful/, { vibe: 'heirloom', palette: 'marigold', stage: 'jhoola' }], [/modern|minimal|clean|simple|white/, { vibe: 'romantic', palette: 'ivory', stage: 'rosewall', floor: 'acrylic', density: 0.15 }], [/garden|outdoor|lawn|nature|fresh/, { vibe: 'garden' }], [/glam|crystal|grand|glitter|mirror|gala|corporate|launch/, { vibe: 'radiant' }], [/romantic|soft|pastel|blush|pink|dreamy/, { vibe: 'romantic', palette: 'blush' }], [/warm|candle|classic|timeless|intimate/, { vibe: 'classic' }], [/burgundy|red|maroon|baraat/, { palette: 'burgundy' }], [/blue|navy|silver/, { palette: 'midnight' }], [/emerald|green/, { palette: 'emerald' }], [/sunset|golden hour|day/, { time: 0 }], [/midnight|late night/, { time: 1 }], [/lush|opulent|overgrow|lots of flowers/, { density: 0.95 }], [/chandelier/, { ceiling: 'chandeliers' }], [/fairy|string light/, { ceiling: 'fairy' }], [/wisteria/, { ceiling: 'wisteria' }], [/swing|jhoola/, { stage: 'jhoola' }], [/jharoka|arch/, { stage: 'jharoka' }], [/rug|carpet/, { floor: 'rug' }]];
  function localLook(wish) {
    const w = (wish || '').toLowerCase(), hits = KW.filter(k => k[0].test(w)); let o = {};
    const v = (hits.find(h => h[1].vibe) || [0, {}])[1].vibe || (() => { const ks = Object.keys(VIBES).filter(x => x !== S.cfg.vibe); return ks[(Math.random() * ks.length) | 0]; })();
    o = preset(v, true); hits.forEach(h => Object.assign(o, h[1])); o.vibe = v;
    return { cfg: o, note: { by: 'Studio rules', text: hits.length ? 'Matched "' + hits.map(h => (w.match(h[0]) || [''])[0]).filter(Boolean).slice(0, 4).join('", "') + '" to ' + VIBES[v].name + ' with ' + PALETTES[o.palette].name + '.' : 'A fresh take on ' + VIBES[v].name + ' in ' + PALETTES[o.palette].name + '. Type a wish for a targeted result.' } };
  }
  function setLook(o, note) { ['vibe', 'palette', 'stage', 'ceiling', 'floor', 'seating', 'entrance'].forEach(k => { if (o[k] && CATALOG[k][o[k]]) S.cfg[k] = o[k]; }); ['time', 'density'].forEach(k => { const n = Number(o[k]); if (isFinite(n)) S.cfg[k] = Math.max(0, Math.min(1, n)); }); S.cfg.on = { stage: true, ceiling: true, floor: true, seating: true, entrance: true }; S.note = note; applyCfg(); drawPanel(); }
  async function reimagine(imgUrl, fallback) {
    const wish = (S.wish || '').trim(); if (typeof imgUrl !== 'string') { imgUrl = null; fallback = null; }
    if (!S.ai || !wish) { const l = localLook(wish); setLook(l.cfg, l.note); return; }
    S.busy = true; drawPanel();
    try {
      const cat = {}; ['vibe', 'palette', 'stage', 'ceiling', 'floor', 'seating', 'entrance'].forEach(k => { cat[k] = {}; Object.keys(CATALOG[k]).forEach(id => cat[k][id] = CATALOG[k][id].name); });
      const prompt = 'You are the design director at The Wed Theory, a luxury event design studio in Lahore, Pakistan. Pick exactly one option id for every layer from the catalogue so the room matches the client wish. The venue is ' + VENUES[S.cfg.venue].name + ' for ' + S.cfg.guests + ' guests.' + (imgUrl ? ' An inspiration photo is attached; match its palette, mood and key pieces.' : S.photo ? ' A photo of the venue is attached; let its architecture and light inform the choice.' : '') + '\n\nCatalogue (id: name): ' + JSON.stringify(cat) + '\nCurrent design: ' + JSON.stringify({ vibe: S.cfg.vibe, palette: S.cfg.palette, stage: S.cfg.stage, ceiling: S.cfg.ceiling, floor: S.cfg.floor, seating: S.cfg.seating }) + '\nClient wish: "' + wish.slice(0, 400) + '"\n\nReply with JSON only, no other text: {"vibe":"","palette":"","stage":"","ceiling":"","floor":"","seating":"","entrance":"","time":0 to 1 where 0 is sunset, 0.5 dusk, 1 midnight,"density":0 to 1 where 0 is minimalist and 1 is opulent,"note":"two plain sentences to the client on why these choices fit their wish"}';
      const opts = { modelTier: 'default' };
      const pic = imgUrl || (S.photo && S.photo.url); if (pic) { try { const lim = await S.ai.limits(); if (lim && lim.images) opts.images = [await (await fetch(pic)).blob()]; } catch (e) {} }
      const r = await S.ai(prompt, opts), j = JSON.parse((r.text.match(/\{[\s\S]*\}/) || ['{}'])[0]);
      S.busy = false; setLook(j, { by: 'Claude, design director', text: String(j.note || 'Updated to match the wish.').slice(0, 500) });
    } catch (e) {
      S.busy = false; if (e && e.code === 'not_granted') S.ai = null; if (fallback) { setLook(fallback, { by: 'Colour match', text: 'Matched the photo by colour to ' + PALETTES[fallback.palette].name + '. Claude was not available for a fuller read.' }); return; } const l = localLook(wish); l.note.text += ' (Claude was not available for this request.)'; setLook(l.cfg, l.note);
    }
  }

  /* ================= PROPOSAL ================= */
  const concept = () => S.concepts.find(k => k.id === S.prop.concept) || null;
  const pack = () => (S.prop.pack || []).map(id => S.concepts.find(k => k.id === id)).filter(Boolean);
  function estimate() {
    const k = concept(), g = S.prop.guests, tier = TIERS.find(t => t.id === S.prop.tier) || TIERS[0], PK = pack(); let base, m = null;
    if (PK.length > 1) { base = [0, 0]; PK.forEach(x => { const mm = manifest(x.cfg); base[0] += mm.lo; base[1] += mm.hi; }); m = manifest(PK[0].cfg); }
    else if (k) { m = manifest(Object.assign({}, k.cfg, { guests: g })); base = [m.lo, m.hi]; } else base = [g * RATES.perGuestFallback[0], g * RATES.perGuestFallback[1]];
    const at = t => [base[0] * (1 + t.add), base[1] * (1 + t.add)], cur = at(tier), mid = (cur[0] + cur[1]) / 2;
    return { m, base, cur, at, tier, bracket: (BUDGET_BRACKETS.find(b => mid >= b[0] && mid < b[1]) || BUDGET_BRACKETS[4])[2] };
  }
  function message() {
    const p = S.prop, c = p.client, k = concept(), e = estimate(), L = [], PK = pack();
    L.push('*THE WED THEORY · Preliminary Concept ' + (p.signed ? 'Sign-off' : 'Enquiry') + '*');
    L.push('Client: ' + (c.name || 'Name not given') + (c.phone ? ' · ' + c.phone : '') + (c.email ? ' · ' + c.email : ''));
    L.push('Event: ' + c.type + ' · ' + fdate(c.date) + ' · ' + (c.venue || (k ? VENUES[k.cfg.venue].name : 'Venue to be confirmed')) + ' · ' + (PK.length > 1 ? PK.length + ' events' : p.guests + ' guests'));
    if (PK.length > 1) { PK.forEach(x => { const f = x.cfg, mm = manifest(f); L.push('', '*' + x.name + '*', f.guests + ' guests · ' + PALETTES[f.palette].name + ' · ' + (f.on.stage ? STAGES[f.stage].name : 'no stage') + ' · ' + (f.on.ceiling ? CEILINGS[f.ceiling].name : 'open ceiling') + ' · ' + SEATS[f.seating].name, 'Décor estimate: ' + range(mm.lo, mm.hi)); }); }
    else if (k) {
      const f = k.cfg; L.push('', '*Concept:* ' + k.name, 'Vibe: ' + VIBES[f.vibe].name + ' · Palette: ' + PALETTES[f.palette].name, 'Stage: ' + (f.on.stage ? STAGES[f.stage].name : 'none') + ' · Ceiling: ' + (f.on.ceiling ? CEILINGS[f.ceiling].name : 'none'), 'Aisle: ' + (f.on.floor ? FLOORS[f.floor].name : 'none') + ' · Seating: ' + (f.on.seating ? SEATS[f.seating].name : 'none'), 'Lighting: ' + timeName(f.time) + ' · Florals: ' + densityName(f.density), 'Entrance: ' + (f.on.entrance ? ENTRANCES[f.entrance].name : 'none') + ' · Effects: ' + (Object.keys(FX).filter(x => f.fx[x]).map(x => FX[x]).join(', ') || 'none'));
      if (e.m.botanical.length) L.push('*Key botanicals:* ' + e.m.botanical.slice(0, 4).map(b => b[0] + ' ' + b[1]).join('; '));
      if (e.m.structure.length) L.push('*Production:* ' + e.m.structure.slice(1, 4).map(b => b[1] + ' × ' + b[0]).join('; '));
    } else L.push('', 'Concept: not attached yet');
    L.push('', '*Design tier:* ' + e.tier.name + ' · ' + range(e.cur[0], e.cur[1]) + ' (' + rangeU(e.cur[0], e.cur[1]) + ')');
    if (p.refs.length) L.push('*Portfolio references:* ' + p.refs.map(id => (proj(id) || {}).title).filter(Boolean).join(', '));
    if (c.notes) L.push('Notes: ' + c.notes.slice(0, 300));
    L.push('', p.signed ? 'Signed on the studio tablet by ' + p.signed.name + ', ' + new Date(p.signed.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) + '. Preliminary concept only, not a booking.' : 'Not signed yet.');
    return L.join('\n');
  }
  R.proposal = () => {
    const p = S.prop, c = p.client, f = (k, l, t, ph) => '<div class="f"><label for="c-' + k + '">' + l + '</label><input id="c-' + k + '" type="' + (t || 'text') + '" data-c="' + k + '" value="' + esc(c[k]) + '" placeholder="' + (ph || '') + '" autocomplete="off"></div>';
    $('#v-proposal').innerHTML = '<div class="wrap sec" style="padding-block-start:36px"><div class="sec-head"><div><p class="eyebrow">Proposal</p><h2>Preliminary concept proposal</h2></div><p class="muted small">Fill it in with the client, attach the concept, and take the sign-off on the tablet.</p></div><div class="prop"><div style="display:grid;gap:1rem">' +
      '<div class="card"><h4>Client details</h4><div class="grid2">' + f('name', 'Client name') + f('phone', 'WhatsApp / phone', 'tel', '+92') + f('email', 'Email', 'email') + '<div class="f"><label for="c-type">Event type</label><select id="c-type" data-c="type">' + ['Wedding', 'Mehndi', 'Baraat', 'Walima', 'Engagement', 'Birthday', 'Private soirée', 'Corporate gala', 'Brand launch'].map(t => '<option' + (t === c.type ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' + f('date', 'Proposed date', 'date') + f('venue', 'Venue', 'text', 'e.g. Royal Palm') + '</div><div class="f"><label for="c-notes">Notes from the conversation</label><textarea id="c-notes" data-c="notes">' + esc(c.notes) + '</textarea></div></div>' +
      '<div class="card"><h4>Guests and budget tier</h4><div id="p-nums"></div></div>' +
      '<div class="card"><h4>Design concept</h4><div id="p-concepts"></div></div>' +
      '<div class="card"><h4>Portfolio references</h4><div id="p-refs"></div></div>' +
      '<div class="card"><h4>Client sign-off</h4><p class="small muted">Signing approves the preliminary concept and estimate range so the studio can prepare a full quotation. It is not a booking.</p><div class="sig"><canvas id="sig" aria-label="Signature pad"></canvas></div><div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center"><button class="btn sm" data-a="sigclear">Clear</button><button class="btn sm solid" data-a="sign">Confirm sign-off</button><span id="p-signed" class="small"></span></div></div>' +
      '<div class="card"><h4>Send to the studio line</h4><div id="p-send"></div></div></div><div class="doc" id="p-doc"></div></div></div>';
    updProposal(true); initSig();
  };
  function updProposal(all) {
    const p = S.prop, e = estimate(), k = concept(), c = p.client, PK = pack();
    const nums = $('#p-nums'); if (!nums) return;
    if (all || !$('#p-g')) nums.innerHTML = '<div class="f"><label for="p-g">Guest count</label><input id="p-g" type="range" min="50" max="1500" step="10" value="' + p.guests + '" data-i="pguests"></div><div id="p-live"></div><div class="f" style="max-width:200px;margin-top:.6rem"><label for="p-fx">PKR per USD</label><input id="p-fx" type="number" min="100" max="1000" value="' + p.fx + '" data-i="fx"></div>';
    $('#p-live').innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap;margin:.3rem 0 .8rem"><span class="big-num">' + p.guests + ' guests</span><span class="small muted">' + (PK.length > 1 ? PK.length + ' events attached; each keeps its own guest count. ' : '') + 'Falls in the ' + e.bracket + ' bracket</span></div><div class="tiers">' + TIERS.map(t => { const r = e.at(t); return '<button class="tier' + (t.id === p.tier ? ' on' : '') + '" data-a="tier" data-id="' + t.id + '" aria-pressed="' + (t.id === p.tier) + '"><strong>' + t.name + '</strong><span class="p">' + range(r[0], r[1]) + '</span><span class="p muted">' + rangeU(r[0], r[1]) + '</span><span class="small muted">' + t.line + '</span></button>'; }).join('') + '</div><p class="small muted" style="margin-top:.5rem">' + (k ? 'Priced from the attached concept\'s manifest at this guest count.' : 'No concept attached, so this uses a flat per-guest planning rate.') + ' Sample rate card.</p>';
    $('#p-concepts').innerHTML = (S.concepts.length ? '<div class="saved">' + S.concepts.map(x => '<div class="s" style="' + (x.id === p.concept ? 'outline:2px solid var(--gold)' : '') + '"><img src="' + x.img + '" alt=""><div><strong>' + esc(x.name) + '</strong><button class="btn sm' + (x.id === p.concept ? ' solid' : '') + '" data-a="choose" data-id="' + x.id + '">' + (x.id === p.concept ? 'Attached' : 'Attach') + '</button></div></div>').join('') + '</div>' : '<p class="small muted">No saved concepts yet.</p>') + '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.7rem"><button class="btn sm" data-a="toproposal">Attach the current studio design</button><a class="btn sm" href="#studio">Open design studio</a></div>';
    $('#p-refs').innerHTML = (p.refs.length ? '<div class="refs">' + p.refs.map(id => { const x = proj(id); return x ? '<span class="ref"><img src="' + src(x.images[0]) + '" alt="">' + esc(x.title) + '<button data-a="ref" data-id="' + id + '" aria-label="Remove ' + esc(x.title) + '">×</button></span>' : ''; }).join('') + '</div>' : '<p class="small muted">None attached. Open a project in the portfolio and tap Add to proposal.</p>') + '<a class="btn sm" style="margin-top:.7rem;align-self:flex-start" href="#portfolio">Browse portfolio</a>';
    $('#p-signed').innerHTML = p.signed ? '<span class="tag ok">Signed</span> ' + esc(p.signed.name) + ', ' + new Date(p.signed.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '<span class="muted">Not signed yet.</span>';
    const msg = message();
    $('#p-send').innerHTML = '<pre class="msg">' + esc(msg) + '</pre><div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.7rem"><a class="btn wa" target="_blank" rel="noopener" href="' + waLink(msg) + '">Open WhatsApp to ' + WA_TXT + '</a><button class="btn" data-a="copymsg">Copy message</button><button class="btn solid" data-a="saveenq">Save enquiry</button></div><p class="small muted" style="margin-top:.5rem">WhatsApp opens with this text filled in; you press send there. The signature image stays on this tablet.</p>';
    const f = k && k.cfg;
    $('#p-doc').innerHTML = '<div class="lh"><img src="img/logo.png" alt="The Wed Theory Events"><div style="text-align:right" class="small muted">Lahore, Pakistan<br>' + WA_TXT + '<br>' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</div></div>' +
      '<div><p class="eyebrow">Preliminary concept proposal</p><h3 style="font-size:2rem;margin-top:.3rem">' + (c.name ? 'Prepared for ' + esc(c.name) : 'Prepared for your celebration') + '</h3><p class="muted">' + esc(c.type) + ' · ' + fdate(c.date) + ' · ' + esc(c.venue || (f ? VENUES[f.venue].name : 'Venue to be confirmed')) + ' · <span class="num">' + p.guests + '</span> guests</p></div>' +
      (PK.length > 1 ? '<div class="saved" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">' + PK.map(x => { const mm = manifest(x.cfg); return '<div class="s"><img src="' + x.img + '" alt=""><div><strong>' + esc(x.name) + '</strong><span class="small muted">' + x.cfg.guests + ' guests · ' + PALETTES[x.cfg.palette].name + '</span><span class="num">' + range(mm.lo, mm.hi) + '</span></div></div>'; }).join('') + '</div>' : k ? '<div class="concept"><img src="' + k.img + '" alt="3D concept view"><p class="lab" style="margin-top:.6rem">' + esc(k.name) + '</p><dl class="facts" style="border-top:0;padding-top:.5rem"><div><dt>Vibe</dt><dd>' + VIBES[f.vibe].name + '</dd></div><div><dt>Palette</dt><dd>' + sw(PALETTES[f.palette].sw) + ' <span class="small">' + PALETTES[f.palette].name + '</span></dd></div><div><dt>Stage</dt><dd>' + (f.on.stage ? STAGES[f.stage].name : 'None') + '</dd></div><div><dt>Ceiling</dt><dd>' + (f.on.ceiling ? CEILINGS[f.ceiling].name : 'None') + '</dd></div><div><dt>Aisle</dt><dd>' + (f.on.floor ? FLOORS[f.floor].name : 'None') + '</dd></div><div><dt>Seating</dt><dd>' + (f.on.seating ? SEATS[f.seating].name : 'None') + '</dd></div><div><dt>Entrance</dt><dd>' + (f.on.entrance ? ENTRANCES[f.entrance].name : 'None') + '</dd></div><div><dt>Effects</dt><dd>' + (Object.keys(FX).filter(x => f.fx[x]).map(x => FX[x]).join(', ') || 'None') + '</dd></div><div><dt>Lighting</dt><dd>' + timeName(f.time) + '</dd></div><div><dt>Florals</dt><dd>' + densityName(f.density) + '</dd></div></dl>' + (e.m.botanical.length ? '<p class="small"><span class="lab">Key botanicals</span><br>' + e.m.botanical.slice(0, 5).map(b => esc(b[0]) + ' (' + esc(b[1]) + ')').join(', ') + '</p>' : '') + '</div>' : '<div class="drop"><span class="small muted">No concept attached yet. Attach a saved concept or the current studio design.</span></div>') +
      (p.refs.length ? '<div><p class="lab">In the spirit of</p><div class="refs" style="margin-top:.4rem">' + p.refs.map(id => { const x = proj(id); return x ? '<span class="ref"><img src="' + src(x.images[0]) + '" alt="">' + esc(x.title) + '</span>' : ''; }).join('') + '</div></div>' : '') +
      '<div><p class="lab">' + e.tier.name + ' tier · indicative investment</p><p class="big-num">' + range(e.cur[0], e.cur[1]) + '</p><p class="muted num">' + rangeU(e.cur[0], e.cur[1]) + ' at PKR ' + p.fx + '</p></div>' +
      '<p class="small muted">This is a preliminary concept and estimate range. A detailed quotation follows a site visit and vendor confirmations. Nothing is booked until the design is approved in writing.</p>' +
      '<div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;border-top:1px solid var(--line);padding-top:1rem"><div>' + (p.signed ? '<img src="' + p.signed.img + '" alt="Client signature" style="height:70px"><p class="small">' + esc(p.signed.name) + '</p>' : '<p class="small muted">Awaiting client signature</p>') + '<p class="lab">Client</p></div><div style="text-align:right"><p class="script" style="font-size:1.9rem">Abdul Hannan Nasir</p><p class="lab">Lead Creative Director</p></div></div>';
  }
  function unsign() { if (S.prop.signed) { S.prop.signed = null; toast('The proposal changed, so the earlier sign-off was cleared. Please sign again.'); } }
  let sigDirty = false;
  function initSig() {
    const cv = $('#sig'); if (!cv) return; const dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 500, h = cv.clientHeight || 170; cv.width = w * dpr; cv.height = h * dpr;
    const x = cv.getContext('2d'); x.scale(dpr, dpr); x.lineWidth = 2.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#1d150d'; sigDirty = false; let down = false;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); down = true; const p = pos(e); x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] + 0.1, p[1] + 0.1); x.stroke(); sigDirty = true; };
    cv.onpointermove = e => { if (!down) return; const p = pos(e); x.lineTo(p[0], p[1]); x.stroke(); };
    cv.onpointerup = cv.onpointercancel = () => { down = false; };
  }

  /* ================= ENQUIRIES ================= */
  R.enquiries = () => {
    $('#v-enquiries').innerHTML = '<div class="wrap sec" style="padding-block-start:36px"><div class="sec-head"><div><p class="eyebrow">Enquiries</p><h2>Captured in consultations</h2></div><p class="muted small">Saved in this browser on this device only. Send each one to the studio WhatsApp so it is not lost.</p></div>' +
      (S.enquiries.length ? '<div class="enq">' + S.enquiries.slice().reverse().map(q => '<div class="e"><div><h4>' + esc(q.name || 'Name not given') + ' <span class="tag ' + (q.signed ? 'ok' : 'sample') + '" style="vertical-align:middle;margin-left:.4rem">' + (q.signed ? 'Signed' : 'Unsigned') + '</span></h4><p class="small muted">' + esc(q.type) + ' · ' + fdate(q.date) + ' · ' + q.guests + ' guests · ' + esc(q.tier) + ' · ' + esc(q.est) + '</p><p class="small">' + esc(q.phone || 'No phone given') + (q.concept ? ' · ' + esc(q.concept) : '') + '</p><p class="small muted">Saved ' + new Date(q.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) + '</p></div><div style="display:flex;gap:.4rem;flex-wrap:wrap;justify-content:flex-end"><a class="btn sm wa" target="_blank" rel="noopener" href="' + waLink(q.msg) + '">WhatsApp</a><button class="btn sm" data-a="copyenq" data-id="' + q.id + '">Copy</button><button class="btn sm" data-a="delenq" data-id="' + q.id + '">Delete</button></div></div>').join('') + '</div>'
        : '<div class="card" style="max-width:640px"><p>No enquiries saved on this tablet yet.</p><p class="small muted">Fill in a proposal with the client and tap Save enquiry. It appears here with its WhatsApp message.</p><a class="btn solid" style="align-self:flex-start" href="#proposal">Start a proposal</a></div>') + '</div>';
  };

  /* ================= EVENTS ================= */
  function copy(text, ok) { try { navigator.clipboard.writeText(text).then(() => toast(ok), () => toast('Copy was blocked by the browser. Select the text and copy it by hand.')); } catch (e) { toast('Copy was blocked by the browser. Select the text and copy it by hand.'); } }
  const A = {
    division: el => { S.filter = el.dataset.cat; S.featured = false; location.hash = 'portfolio'; },
    filter: el => { S.filter = el.dataset.c; R.portfolio(); },
    open: el => openProject(el.dataset.id), shot: el => openProject(el.dataset.id, el.dataset.img), close: closeModal,
    ref: el => { const id = el.dataset.id, i = S.prop.refs.indexOf(id); if (i < 0) { S.prop.refs.push(id); toast('Added to the proposal as a reference.'); } else S.prop.refs.splice(i, 1); persist(); if (S.view === 'proposal') updProposal(); else openProject(id); },
    before: el => pickImage(d => { const p = proj(el.dataset.id); p.before = d; persist(); openProject(p.id); }),
    'new': () => editProject(null), editp: el => editProject(el.dataset.id),
    addimg: () => pickImage(d => { S.draft.images.push(d); drawDraftImgs(); }), rmimg: el => { S.draft.images.splice(+el.dataset.k, 1); drawDraftImgs(); },
    savep: () => {
      const d = S.draft; d.title = d.title.trim(); if (!d.title) { toast('Give the project an event title before saving.'); return; } if (!d.images.length) { toast('Add at least one photo so the project has a cover.'); return; }
      if (d.video && !/^https?:\/\//i.test(d.video)) { toast('The video link must start with https://'); return; }
      d.guests = Math.max(0, +d.guests || 0); if (d.client.trim()) d.sample = false;
      if (d.id) Object.assign(proj(d.id), d); else { d.id = 'p' + Date.now(); S.projects.unshift(d); }
      persist(); closeModal(); R.portfolio(); toast('Project saved on this device.');
    },
    delp: el => confirmBox('Delete this project from the portfolio?', 'Delete project', () => { S.projects = S.projects.filter(p => p.id !== el.dataset.id); S.prop.refs = S.prop.refs.filter(x => x !== el.dataset.id); persist(); closeModal(); R.portfolio(); }),
    yes: () => { const f = S.onYes; S.onYes = null; if (f) f(); },
    step: el => { S.step = +el.dataset.s; if (main) main.select(selName()); drawVp(); drawPanel(); }, q: el => { S.q = +el.dataset.q; drawPanel(); },
    qnext: () => { if (S.q < 3) S.q++; else S.step = 3; drawPanel(); }, qprev: () => { if (S.q > 0) S.q--; else S.step = 1; drawPanel(); },
    pick: el => {
      const k = el.dataset.k, id = el.dataset.id, c = S.cfg;
      if (k === 'venue') { c.venue = id; if (id === 'street') { S.step = 1; } else if (id === 'photo') { if (!S.photo) { A.pickphoto(); } else if (main) { main.solveCamera(S.quad); } } else if (main) { main.setView('wide', true); } }
      else if (k === 'vibe') Object.assign(c, preset(id));
      else if (k === 'time') c.time = TIMES[id].t;
      else { c[k] = id; c.on[k] = true; }
      S.note = null; applyCfg(); drawPanel();
    },
    pickphoto: () => pickImage((d, ar) => { S.photo = { url: d, ar: ar }; S.strokes = null; S.cfg.venue = 'photo'; { const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'); cv.width = cv.height = 24; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, 24, 24); const px = x.getImageData(0, 0, 24, 24).data; let l = 0; for (let q = 0; q < px.length; q += 4) l += 0.299 * px[q] + 0.587 * px[q + 1] + 0.114 * px[q + 2]; l /= 576 * 255; S.cfg.time = l < 0.25 ? 0.95 : l < 0.42 ? 0.6 : 0.15; applyCfg(); drawPanel(); toast('Light matched to the photo: ' + timeName(S.cfg.time) + '. Mark the four floor corners, then design in step 3.'); }; im.src = d; } drawVp(); requestAnimationFrame(() => { fit(); if (main) { main.solveCamera(S.quad); applyCfg(); } drawPanel(); }); }, 1600),
    align: () => { if (main) { main.solveCamera(S.quad); main.render(); drawVp(); } },
    freelook: () => { if (!main) return; if (main.locked) { main.setView('wide'); } else main.solveCamera(S.quad); main.render(); drawVp(); },
    view: el => { if (main) { S.compare = false; main.setView(el.dataset.v); main.render(); drawVp(); } },
    compare: () => { if (!ensureStudio()) return; if (S.cfg.venue === 'street') S.decorHidden = !S.decorHidden; else S.compare = !S.compare; drawVp(); },
    propadd: el => { let g = null; if (main) { const r = $('#gl').getBoundingClientRect(); g = main.groundPoint(r.left + r.width / 2, r.top + r.height * 0.62); } const n = S.cfg.props.filter(x => x.t === el.dataset.t).length; S.cfg.props.push({ id: Date.now() % 1e7, t: el.dataset.t, x: g ? Math.max(-14, Math.min(14, g.x)) + n * 0.8 : n * 1.5, z: g ? Math.max(-14, Math.min(20, g.z)) : 8, y: 0, r: 0, s: 1 }); S.prop = S.cfg.props.length - 1; applyCfg(); drawPanel(); },
    propsel: el => { S.prop = +el.dataset.i; if (main) main.select(selName()); drawPanel(); },
    propdo: el => { const q = S.cfg.props[S.prop]; if (!q) return; const k = el.dataset.k, d = +el.dataset.d; if (k === 'r') q.r += d * Math.PI / 12; else if (k === 's') q.s = Math.max(0.3, Math.min(3, q.s * (d > 0 ? 1.1 : 0.91))); else if (k === 'dup') { S.cfg.props.push(Object.assign({}, q, { id: Date.now() % 1e7, x: q.x + 1.6 })); S.prop = S.cfg.props.length - 1; applyCfg(); drawPanel(); return; } else if (k === 'del') { S.cfg.props.splice(S.prop, 1); S.prop = null; applyCfg(); drawPanel(); return; } snap(); if (main) main.applyTf('p' + S.prop, q); drawPanel(); },
    propclear: () => { S.cfg.props = []; S.prop = null; applyCfg(); drawPanel(); },
    paint: el => { const m = el.dataset.m; if (m === 'clear') { if (S.strokes) { S.strokes.getContext('2d').clearRect(0, 0, S.strokes.width, S.strokes.height); remask(); } } else { S.paint.on = m !== 'off'; S.paint.erase = m === 'erase'; if (S.paint.on && !S.strokes && S.photo) newMask(); } drawVp(); drawPanel(); },
    venuesave: () => { if (!S.photo) return; const name = ($('#vn-name').value || '').trim() || 'Venue ' + (S.venues.length + 1); S.venues.push({ name: name.slice(0, 40), url: S.photo.url, ar: S.photo.ar, quad: clone(S.quad) }); if (S.venues.length > 5) S.venues.shift(); persist(); drawPanel(); toast('Saved ' + name + ' on this device.'); },
    venueload: el => { const v = S.venues[+el.dataset.i]; if (!v) return; S.photo = { url: v.url, ar: v.ar }; S.quad = clone(v.quad); S.strokes = null; S.cfg.venue = 'photo'; drawVp(); requestAnimationFrame(() => { fit(); if (main) { main.solveCamera(S.quad); applyCfg(); } drawPanel(); }); },
    venuedel: el => { S.venues.splice(+el.dataset.i, 1); persist(); drawPanel(); },
    tab: el => { S.tab = el.dataset.t; if (S.tab !== 'front') S.paint.on = false; if (main) { main.select(selName()); if (LAYERS[S.tab] && !(S.cfg.venue === 'photo' || S.cfg.venue === 'street')) main.setView(LAYERS[S.tab][2]); } drawPanel(); },
    cycle: el => { const key = S.tab, ids = Object.keys(LAYERS[key][1]), i = ids.indexOf(S.cfg[key]); S.cfg[key] = ids[(i + (+el.dataset.d) + ids.length) % ids.length]; S.cfg.on[key] = true; S.note = null; applyCfg(); drawPanel(); },
    nudge: el => { const key = S.tab, t = S.cfg.tf[key] = Object.assign({ x: 0, y: 0, z: 0, r: 0, s: 1 }, S.cfg.tf[key] || {}), k = el.dataset.k, d = +el.dataset.d; if (k === 's') t.s = Math.max(0.3, Math.min(2.5, t.s * (d > 0 ? 1.08 : 0.926))); else if (k === 'r') t.r += d * Math.PI / 24; else if (k === 'y') t.y = Math.max(-2, Math.min(6, t.y + d * 0.25)); else t[k] += d * 0.5; snap(); if (main) main.applyTf(key, t); drawVp(); drawPanel(); },
    tfreset: () => { delete S.cfg.tf[S.tab]; snap(); if (main) main.applyTf(S.tab, null); drawVp(); drawPanel(); },
    undo: () => { if (S.hist.length < 2) return; S.redo.push(S.hist.pop()); restore(S.hist[S.hist.length - 1]); const r = S.redo; applyCfg(); S.redo = r; drawVp(); drawPanel(); },
    redo: () => { if (!S.redo.length) return; const r = S.redo, j = r.pop(); restore(j); applyCfg(); S.redo = r; drawVp(); drawPanel(); },
    walk: () => { if (main && main.walk()) { S.compare = false; drawVp(); toast('Walking the aisle. Touch the view to stop.'); } },
    ev: el => switchEvent(+el.dataset.i),
    evadd: () => { S.events.push({ id: 'ev' + Date.now(), name: 'Event ' + (S.events.length + 1), cfg: clone(S.cfg) }); switchEvent(S.events.length - 1); },
    evweek: () => { Object.keys(WEEK).forEach(n => { const w = WEEK[n], c = norm(Object.assign(clone(S.cfg), clone(w), { el: Object.assign({}, EL_DEFAULT, w.el), fx: Object.assign({ petals: false, sparks: false, beams: false }, w.fx), on: { stage: true, ceiling: true, floor: true, seating: true, entrance: true } })); if (S.cfg.venue === 'street') c.venue = 'street'; c.venue = S.cfg.venue; S.events.push({ id: 'ev' + n + Date.now(), name: n, cfg: c }); }); switchEvent(S.events.length - 3); },
    evdel: () => { if (S.events.length < 2) return; S.events.splice(S.ev, 1); switchEvent(Math.max(0, S.ev - 1)); },
    packall: () => { if (!ensureStudio()) { toast('The 3D preview is unavailable, so events cannot be captured.'); return; } const cur = S.ev, ids = []; S.events.forEach((e, i) => { S.ev = i; S.cfg = e.cfg; applyCfg(); const k = saveConcept(true); if (k) ids.push(k.id); }); S.ev = cur; S.cfg = S.events[cur].cfg; applyCfg(); unsign(); S.prop.pack = ids; S.prop.concept = ids[0] || null; persist(); location.hash = 'proposal'; },
    fitbudget: fitBudget, fitundo: () => { if (S.fitLog && S.fitLog.undo) { Object.assign(S.cfg, S.fitLog.undo); S.fitLog = null; applyCfg(); drawPanel(); } },
    sheet: el => copy(sheetText(el.dataset.k, el.dataset.n), el.dataset.n + ' order copied.'), inspo: inspo,
    el: el => { const k = el.dataset.k; S.cfg.el[k] = k === 'candles' ? +el.dataset.o : el.dataset.o; applyCfg(); drawPanel(); },
    copybrief: () => copy(brief(S.cfg), 'Photo brief copied.'),
    fx: el => { S.cfg.fx[el.dataset.k] = !S.cfg.fx[el.dataset.k]; applyCfg(); drawPanel(); },
    svfind: () => findStreet(S.loc), svquick: el => { S.loc = el.dataset.q; findStreet(S.loc); },
    facehere: () => { if (GM.pano) { S.sv.h0 = GM.pano.getPov().heading; syncStreet(); } }, hidedecor: () => { S.decorHidden = !S.decorHidden; drawVp(); },
    saveconcept: () => { saveConcept(); drawVp(); if (S.step === 3) drawPanel(); },
    duel: openDuel, newlook: () => { const l = localLook(''); setLook(l.cfg, l.note); },
    reimagine: reimagine,
    loadc: el => { const k = S.concepts[+el.dataset.i]; if (!k) return; const keepPhoto = k.cfg.venue === 'photo' && !S.photo; S.cfg = norm(clone(k.cfg)); S.events[S.ev].cfg = S.cfg; if (keepPhoto) S.cfg.venue = 'ballroom'; closeModal(); if (S.view !== 'studio') location.hash = 'studio'; else { applyCfg(); drawPanel(); } toast('Loaded ' + k.name + '.'); },
    delc: el => { const k = S.concepts.splice(+el.dataset.i, 1)[0]; if (k && S.prop.concept === k.id) S.prop.concept = null; persist(); drawVp(); drawPanel(); },
    choose: el => { if (S.prop.concept !== el.dataset.id || (S.prop.pack || []).length) unsign(); S.prop.pack = []; S.prop.concept = el.dataset.id; const k = concept(); if (k) S.prop.guests = k.cfg.guests; persist(); closeModal(); if (S.view === 'proposal') updProposal(true); else location.hash = 'proposal'; },
    toproposal: () => { const k = saveConcept(true); if (!k) return; unsign(); S.prop.pack = []; S.prop.concept = k.id; S.prop.guests = k.cfg.guests; persist(); if (S.view === 'proposal') { updProposal(true); toast('Attached the current studio design.'); } else location.hash = 'proposal'; },
    copyman: () => copy(manifestText(S.cfg), 'Manifest copied.'),
    tier: el => { if (S.prop.tier !== el.dataset.id) unsign(); S.prop.tier = el.dataset.id; persist(); updProposal(); },
    sigclear: () => { initSig(); if (S.prop.signed) { S.prop.signed = null; persist(); updProposal(); } },
    sign: () => { const n = S.prop.client.name.trim(); if (!n) { toast('Enter the client name before signing.'); $('#c-name').focus(); return; } if (!sigDirty) { toast('Ask the client to sign in the box first.'); return; } S.prop.signed = { name: n, at: new Date().toISOString(), img: $('#sig').toDataURL('image/png') }; persist(); updProposal(); toast('Sign-off recorded on this device.'); },
    copymsg: () => copy(message(), 'Message copied.'),
    saveenq: () => { const p = S.prop, e = estimate(), k = concept(); if (!p.client.name.trim() && !p.client.phone.trim()) { toast('Add the client name or phone so the enquiry can be followed up.'); return; } S.enquiries.push({ id: 'e' + Date.now(), at: new Date().toISOString(), name: p.client.name, phone: p.client.phone, type: p.client.type, date: p.client.date, guests: p.guests, tier: e.tier.name, est: range(e.cur[0], e.cur[1]), concept: k ? k.name : '', signed: !!p.signed, msg: message() }); persist(); toast('Enquiry saved. Send it on WhatsApp so the studio has it.'); location.hash = 'enquiries'; },
    copyenq: el => { const q = S.enquiries.find(x => x.id === el.dataset.id); if (q) copy(q.msg, 'Enquiry copied.'); },
    delenq: el => confirmBox('Delete this enquiry from the tablet?', 'Delete enquiry', () => { S.enquiries = S.enquiries.filter(x => x.id !== el.dataset.id); persist(); closeModal(); R.enquiries(); })
  };
  document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el) { if (el.tagName !== 'A') e.preventDefault(); const fn = A[el.dataset.a]; if (fn) fn(el, e); } else if (e.target.id === 'modal') closeModal(); });
  let buildT;
  document.addEventListener('input', e => {
    const el = e.target, i = el.dataset.i;
    if (el.dataset.e) { S.draft[el.dataset.e] = el.type === 'checkbox' ? el.checked : el.value; return; }
    if (el.dataset.pal) { S.draft.palette[+el.dataset.pal] = el.value; return; }
    if (el.dataset.c) { S.prop.client[el.dataset.c] = el.value; clearTimeout(buildT); buildT = setTimeout(persist, 500); updProposal(); return; }
    if (i === 'featured') { S.featured = el.checked; R.portfolio(); }
    else if (i === 'edit') { S.edit = el.checked; R.portfolio(); }
    else if (i === 'density') { S.cfg.density = el.value / 100; $('#v-den').textContent = densityName(S.cfg.density); clearTimeout(buildT); buildT = setTimeout(() => { if (main) { main.build(S.cfg); main.render(); } }, 40); }
    else if (i === 'time') { S.cfg.time = el.value / 100; $('#v-time').textContent = timeName(S.cfg.time); if (main) { main.cfg.time = S.cfg.time; main.light(S.cfg.time); main.render(); } const hs = $$('#hud span'); if (hs[2]) hs[2].textContent = timeName(S.cfg.time); }
    else if (i === 'guests') { S.cfg.guests = +el.value; $('#v-g').textContent = el.value + ' guests'; clearTimeout(buildT); buildT = setTimeout(() => { if (main) { main.build(S.cfg); main.render(); } }, 40); }
    else if (i === 'on') { S.cfg.on[el.dataset.k] = el.checked; applyCfg(); drawPanel(); }
    else if (i === 'wish') S.wish = el.value;
    else if (i === 'move') S.move = el.checked;
    else if (i === 'brush') S.paint.size = +el.value;
    else if (i === 'loc') S.loc = el.value;
    else if (i === 'evname') { S.events[S.ev].name = el.value.slice(0, 30) || 'Event'; const b = $('#events .chip.on'); if (b) b.textContent = S.events[S.ev].name; }
    else if (i === 'budget') { S.budget = +el.value; $('#v-bud').textContent = pkr(S.budget) + ' · ' + usd(S.budget); }
    else if (i === 'room') { const v = +el.value; if (v >= +el.min && v <= +el.max) { S.cfg.room[el.dataset.k] = v; $('#fit').innerHTML = fitHTML(S.cfg); clearTimeout(buildT); buildT = setTimeout(() => { if (main) { main.build(S.cfg); main.render(); } }, 250); } }
    else if (i === 'gkey') { S.gkey = el.value.trim(); try { localStorage.setItem('twt.gmaps', S.gkey); } catch (e2) {} }
    else if (i === 'svdist') { S.sv.dist = +el.value; syncStreet(); } else if (i === 'svscale') { S.sv.scale = el.value / 100; syncStreet(); } else if (i === 'svheight') { S.sv.height = el.value / 10; syncStreet(); }
    else if (i === 'pguests') { if (+el.value !== S.prop.guests) unsign(); S.prop.guests = +el.value; updProposal(); }
    else if (i === 'fx') { const v = +el.value; if (v >= 100 && v <= 1000) { S.prop.fx = v; updProposal(); } }
    else if (i === 'duel') { S.duel[+el.dataset.k] = +el.value; openDuel(); }
  });
  document.addEventListener('change', e => { const i = e.target.dataset.i; if (i === 'density' || i === 'guests' || i === 'time') { if (S.compare) { S.compare = false; } drawVp(); if (S.step >= 2) drawPanel(); } if (i === 'pguests' || i === 'fx') persist(); });
  /* drag: before/after sliders and photo corner markers */
  let drag = null;
  const baSet = (b, e) => { const r = b.getBoundingClientRect(), p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 100; b.querySelector('.top').style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)'; b.querySelector('.bar').style.left = p + '%'; };
  document.addEventListener('pointerdown', e => { const h = e.target.closest('[data-h]'), b = e.target.closest('[data-ba]'); if (h) { drag = { h: +h.dataset.h }; e.preventDefault(); } else if (b) { drag = { b: b }; baSet(b, e); } });
  { const mk = $('#mask'); let down = false, last = null;
    const dab = e => { if (!S.strokes) return; const r = mk.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * mk.width, y = (e.clientY - r.top) / r.height * mk.height, c = S.strokes.getContext('2d'); c.globalCompositeOperation = S.paint.erase ? 'destination-out' : 'source-over'; c.strokeStyle = c.fillStyle = '#000'; c.lineWidth = S.paint.size; c.lineCap = 'round'; c.beginPath(); if (last) { c.moveTo(last[0], last[1]); c.lineTo(x, y); c.stroke(); } else { c.arc(x, y, S.paint.size / 2, 0, 7); c.fill(); } last = [x, y]; remask(); };
    mk.addEventListener('pointerdown', e => { if (!S.paint.on) return; mk.setPointerCapture(e.pointerId); down = true; last = null; dab(e); }); mk.addEventListener('pointermove', e => { if (down) dab(e); }); const up = () => { down = false; last = null; }; mk.addEventListener('pointerup', up); mk.addEventListener('pointercancel', up); }
  $('#vp').addEventListener('pointerdown', e => {
    if (main && e.target.id === 'gl' && S.step === 3 && S.tab === 'props' && S.cfg.props.length) { const g = main.groundPoint(e.clientX, e.clientY); if (g) { let bi = -1, bd = 2.6; S.cfg.props.forEach((q, i) => { const dd = Math.hypot(q.x - g.x, q.z - g.z); if (dd < bd * Math.max(1, q.s)) { bd = dd; bi = i; } }); if (bi >= 0) { e.stopPropagation(); e.preventDefault(); S.prop = bi; main.select('p' + bi); const q = S.cfg.props[bi]; drag = { pr: bi, g0: g, x0: q.x, z0: q.z }; return; } } }
    if (!main || e.target.id !== 'gl' || S.step !== 3 || !LAYERS[S.tab] || !S.cfg.on[S.tab]) return; const photo = S.cfg.venue === 'photo' && main.locked; if (!photo && !S.move) return;
    const g = main.groundPoint(e.clientX, e.clientY); if (!g) return; e.stopPropagation(); e.preventDefault();
    const t = S.cfg.tf[S.tab] = Object.assign({ x: 0, y: 0, z: 0, r: 0, s: 1 }, S.cfg.tf[S.tab] || {}); drag = { mv: S.tab, g0: g, x0: t.x, z0: t.z };
  }, true);
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    if (drag.pr != null) { const g = main.groundPoint(e.clientX, e.clientY), q = S.cfg.props[drag.pr]; if (g && q) { q.x = Math.max(-40, Math.min(40, drag.x0 + g.x - drag.g0.x)); q.z = Math.max(-40, Math.min(40, drag.z0 + g.z - drag.g0.z)); main.applyTf('p' + drag.pr, q); } return; }
    if (drag.mv) { const g = main.groundPoint(e.clientX, e.clientY); if (g) { const t = S.cfg.tf[drag.mv]; t.x = Math.max(-40, Math.min(40, drag.x0 + g.x - drag.g0.x)); t.z = Math.max(-40, Math.min(40, drag.z0 + g.z - drag.g0.z)); main.applyTf(drag.mv, t); } return; }
    if (drag.b) baSet(drag.b, e);
    else { const r = $('#vp').getBoundingClientRect(); S.quad[drag.h] = [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; const el = $('#handles [data-h="' + drag.h + '"]'); if (el) { el.style.left = S.quad[drag.h][0] * 100 + '%'; el.style.top = S.quad[drag.h][1] * 100 + '%'; } const pg = $('#handles polygon'); if (pg) pg.setAttribute('points', S.quad.map(p => (p[0] * 100) + ',' + (p[1] * 100)).join(' ')); }
  });
  const endDrag = () => { if (drag && drag.pr != null) { snap(); drag = null; drawPanel(); return; } if (drag && drag.mv) { snap(); drag = null; drawVp(); drawPanel(); return; } if (drag && drag.h != null && main) { main.solveCamera(S.quad); main.render(); } drag = null; };
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

  /* ================= ROUTER ================= */
  const VIEWSET = ['home', 'portfolio', 'studio', 'proposal', 'enquiries'];
  function route() {
    let v = location.hash.slice(1); if (!VIEWSET.includes(v)) v = 'home'; S.view = v; closeModal();
    $$('.view').forEach(e => e.classList.toggle('on', e.id === 'v-' + v)); $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
    R[v](); window.scrollTo(0, 0); if (main) { if (v === 'studio') main.start(); else main.stop(); }
  }
  window.addEventListener('hashchange', route); route();
  if (window.claude && window.claude.use) window.claude.use('sample').then(s => { S.ai = s || null; if (S.ai && S.view === 'studio' && S.step === 3) drawPanel(); }).catch(() => {});
})();
