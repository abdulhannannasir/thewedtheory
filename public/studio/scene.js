/* THE WED THEORY — procedural 3D venue and décor simulator (Three.js r128) */
(function () {
  const T = THREE;
  const col = h => new T.Color(h).convertSRGBToLinear();
  const hexInt = s => parseInt(String(s).replace('#', ''), 16);
  const rng = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const L = (a, b, t) => a + (b - a) * t;
  const MG = [0xf59e0b, 0xf7b733, 0xe8590c, 0xffc93c], WI = [0xb9a2d8, 0xd9c9ee, 0xf3eefa, 0xa58bd0], WHITES = [0xfffaf0, 0xf6ecd6, 0xffffff, 0xf2e6cf], GREENS = [0x4e6b3a, 0x66724f, 0x7f8b6a, 0x3f5a30];
  const KEYS = [
    { top: 0x7fa3c9, bot: 0xf7c08f, hemi: 0xffe1c2, hg: 0x8a6a4a, hi: 0.95, sun: 0xffb36b, si: 1.5, warm: 0.45, sy: 9 },
    { top: 0x2a3463, bot: 0xc98aa0, hemi: 0x9aa6d8, hg: 0x3a3040, hi: 0.55, sun: 0x8f8fd0, si: 0.45, warm: 1.25, sy: 14 },
    { top: 0x05060f, bot: 0x141a33, hemi: 0x3a4270, hg: 0x17141c, hi: 0.3, sun: 0x5b6aa8, si: 0.16, warm: 1.9, sy: 20 }
  ];
  const PIV = { floor: [0, 2.9], stage: [0, -12], ceiling: [0, 1], seating: [0, 3.5], entrance: [0, 17] }, FOOT = { floor: [4.4, 25], stage: [12, 6.5], ceiling: [23.5, 28], seating: [29, 18], entrance: [7, 4.5] };
  const VIEWS = {
    wide: { theta: 0, phi: 1.27, rad: 31, t: [0, 2.6, -3] }, stage: { theta: 0.22, phi: 1.36, rad: 15.5, t: [0, 3.1, -12] },
    ceiling: { theta: 0.35, phi: 1.5, rad: 24, t: [0, 5.6, 0] }, floor: { theta: 0.05, phi: 1.22, rad: 21, t: [0, 1.2, 0] },
    seating: { theta: -0.65, phi: 1.2, rad: 13, t: [7.5, 1, 3.5] }, entrance: { theta: 0.3, phi: 1.3, rad: 15, t: [0, 2, 15] }
  };

  function archPanelGeo(w, h, hw, ah, depth) {
    const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
    const sp = ah * 0.62, p = new T.Path();
    p.moveTo(-hw / 2, 0); p.lineTo(-hw / 2, sp); p.quadraticCurveTo(-hw / 2, ah * 0.93, 0, ah); p.quadraticCurveTo(hw / 2, ah * 0.93, hw / 2, sp); p.lineTo(hw / 2, 0); p.lineTo(-hw / 2, 0);
    s.holes.push(p);
    return new T.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 10 });
  }
  function archPts(hw, ah, n) {
    const sp = ah * 0.62, out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, a = 1 - t; out.push([-(a * a * hw / 2 + 2 * a * t * hw / 2), a * a * sp + 2 * a * t * ah * 0.93 + t * t * ah]); }
    const m = out.slice(0, -1).reverse().map(p => [-p[0], p[1]]);
    return out.concat(m);
  }
  function canvasTex(w, h, draw, rx, ry) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
    if (rx) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); }
    return t;
  }
  const css = n => '#' + ('000000' + n.toString(16)).slice(-6);

  class Studio3D {
    constructor(canvas, o) {
      o = o || {};
      this.canvas = canvas;
      this.r = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
      this.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.maxDpr || 1.75));
      this.r.outputEncoding = T.sRGBEncoding; this.r.toneMapping = T.ACESFilmicToneMapping;
      this.shadows = !!o.shadows; this.r.shadowMap.enabled = this.shadows; this.r.shadowMap.type = T.PCFSoftShadowMap;
      this.scene = new T.Scene();
      this.cam = new T.PerspectiveCamera(42, 1.6, 0.1, 500);
      this.orbit = { theta: 0, phi: 1.27, rad: 31, target: new T.Vector3(0, 2.6, -3) };
      this.locked = false; this.venue = 'ballroom'; this.onChange = o.onChange || function () {};
      this.hemi = new T.HemisphereLight(0xffffff, 0x444444, 0.8);
      this.sun = new T.DirectionalLight(0xffffff, 1);
      this.stageLight = new T.PointLight(0xffc98a, 1, 42, 2); this.stageLight.position.set(0, 6.5, -8);
      this.roomLight = new T.PointLight(0xffb870, 0.8, 60, 2); this.roomLight.position.set(0, 7.2, 4);
      if (this.shadows) { const sh = this.sun.shadow; this.sun.castShadow = true; sh.mapSize.set(2048, 2048); sh.camera.left = -30; sh.camera.right = 30; sh.camera.top = 30; sh.camera.bottom = -30; sh.camera.near = 1; sh.camera.far = 110; sh.bias = -0.0006; sh.normalBias = 0.04; sh.radius = 3; }
      this.scene.add(this.hemi, this.sun, this.sun.target, this.stageLight, this.roomLight);
      this.groups = {}; this.outers = {}; this.sel = null; this.prevKeys = null; this.anim = []; this.glowMats = []; this.swayers = []; this.fx = {}; this.glowBase = { op: 1, size: 0.42 }; this.sv = null; this.goal = null; this.animate = !!o.animate; this.lastTouch = 0; this.t = 0;
      this.root = new T.Group(); this.scene.add(this.root);
      this.pmrem = new T.PMREMGenerator(this.r);
      this.unitBox = new T.BoxGeometry(1, 1, 1); this.ico = new T.IcosahedronGeometry(1, 1); this.flat = new T.PlaneGeometry(1, 1); this.flat.rotateX(-Math.PI / 2); this.sph = new T.SphereGeometry(1, 18, 12);
      this.blobTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 4, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }); this.candleGeo = new T.CylinderGeometry(0.045, 0.045, 1, 8);
      this.glowTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,244,214,1)'); gr.addColorStop(0.25, 'rgba(255,214,150,.75)'); gr.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
      this.trash = []; this.mats = {}; this.cur = this.root;
      if (o.interactive) this.bind();
      if (o.bloom) this.initFX();
      this.updateCam();
    }
    initFX() {
      if (!T.EffectComposer || !T.UnrealBloomPass || !T.ShaderPass) return;
      try {
        const sz = this.r.getDrawingBufferSize(new T.Vector2()), opt = { format: T.RGBAFormat, type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter };
        const rt = this.r.capabilities.isWebGL2 && T.WebGLMultisampleRenderTarget ? new T.WebGLMultisampleRenderTarget(Math.max(4, sz.x), Math.max(4, sz.y), opt) : new T.WebGLRenderTarget(Math.max(4, sz.x), Math.max(4, sz.y), opt);
        this.comp = new T.EffectComposer(this.r, rt); this.comp.addPass(new T.RenderPass(this.scene, this.cam));
        this.bloom = new T.UnrealBloomPass(new T.Vector2(sz.x, sz.y), 0.4, 0.55, 1.08); this.comp.addPass(this.bloom);
        this.final = new T.ShaderPass({ uniforms: { tDiffuse: { value: null }, exposure: { value: 1 }, grain: { value: 0 } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'uniform sampler2D tDiffuse; uniform float exposure; uniform float grain; varying vec2 vUv; vec3 fit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; } void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb * exposure / 0.6; const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777)); const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602)); c = clamp(O * fit(I * c), 0.0, 1.0); c = pow(c, vec3(1.0 / 2.2)); float n = fract(sin(dot(vUv * (grain + 1.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5; gl_FragColor = vec4(c + n * 0.018, 1.0); }' });
        this.comp.addPass(this.final);
      } catch (e) { this.comp = null; }
    }
    track(x) { this.trash.push(x); return x; }
    M(hex, rough, metal, extra) {
      const k = hex + '|' + rough + '|' + metal + '|' + (extra ? JSON.stringify(extra) : '');
      if (!this.mats[k]) this.mats[k] = this.track(new T.MeshStandardMaterial(Object.assign({ color: col(hex), roughness: rough == null ? 0.85 : rough, metalness: metal || 0 }, extra || {})));
      return this.mats[k];
    }
    metal() { return this.P.metal === 'silver' ? this.M(0xd9dde4, 0.28, 0.85) : this.M(0xc9a45c, 0.32, 0.8); }
    mirror() { return this.M(0xeef1f5, 0.05, 1); }
    add(geo, mat, x, y, z) { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; this.cur.add(m); return m; }
    sway() { if (!this._sw) { const g = new T.Group(); g.position.y = 8.6; this.cur.add(g); this.swayers.push(g); this._sw = g; } return this._sw; }
    addS(geo, mat, x, y, z) { const m = new T.Mesh(geo, mat); m.position.set(x, y - 8.6, z); m.castShadow = true; this.sway().add(m); return m; }
    drape(w, h, x, y, z, hex, op) {
      const g = this.track(new T.PlaneGeometry(w, h, 48, 1)), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 5.2) * 0.13 + Math.sin(p.getX(i) * 1.7) * 0.05); g.computeVertexNormals();
      const m = this.add(g, this.M(hex, 0.92, 0, { side: T.DoubleSide, transparent: op != null, opacity: op == null ? 1 : op }), x, y, z); m.castShadow = false; return m;
    }
    box(w, h, d, mat, x, y, z) { const m = this.add(this.unitBox, mat, x, y, z); m.scale.set(w, h, d); return m; }
    cyl(rt, rb, h, mat, x, y, z, seg) { return this.add(this.track(new T.CylinderGeometry(rt, rb, h, seg || 16)), mat, x, y, z); }
    plane(w, h, mat, x, y, z) { const m = this.add(this.track(new T.PlaneGeometry(w, h)), mat, x, y, z); m.rotation.x = -Math.PI / 2; m.castShadow = false; return m; }
    flower(x, y, z, s, c) { this.F.push(x, y, z, s, c); }
    blob(cx, cy, cz, rx, ry, rz, n, cols, leaf, raw) {
      const R = this.R; n = Math.round(raw ? n : n * this.dm); if (leaf == null) leaf = 0.22;
      for (let i = 0; i < n; i++) {
        const u = R() * 2 - 1, th = R() * 6.283, r = Math.cbrt(0.35 + 0.65 * R()), s = Math.sqrt(1 - u * u);
        const x = cx + rx * r * s * Math.cos(th), y = cy + ry * r * u, z = cz + rz * r * s * Math.sin(th);
        if (R() < leaf) this.Lf.push(x, y, z, 0.14 + R() * 0.14); else this.F.push(x, y, z, 0.11 + R() * 0.12, cols[(R() * cols.length) | 0]);
      }
    }
    candle(x, y, z, h) { const lv = this.el.candles; if (!lv) return; this.CA.push(x, y, z, h); this.G.push(x, y + h + 0.07, z); if (lv > 1) { this.CA.push(x + 0.15, y, z + 0.11, h * 0.68); this.G.push(x + 0.15, y + h * 0.68 + 0.07, z + 0.11); this.CA.push(x - 0.1, y, z + 0.16, h * 0.45); this.G.push(x - 0.1, y + h * 0.45 + 0.07, z + 0.16); } }
    soft(x, z, sx, sz) { this.SB.push(x, z, sx, sz); }
    backdrop(w, h, x, y, z) { const k = this.el.drape; if (k === 'none') return; this.drape(w, h, x, y, z, k === 'ivory' ? 0xf6f1e6 : k === 'palette' ? hexInt(this.P.sw[1]) : hexInt(this.P.deep)); }

    clear() {
      while (this.root.children.length) this.root.remove(this.root.children[0]);
      this.trash.forEach(x => x.dispose && x.dispose()); this.trash = []; this.mats = {}; this.groups = {}; this.outers = {}; this.selLine = null; this.glowMats = []; this.swayers = []; this.fx = {}; this.anim = [];
    }
    build(c) {
      this.clear(); this.cfg = c; this.venue = c.venue;
      this.P = PALETTES[c.palette]; this.fl = this.P.flowers.map(hexInt); this.dm = 0.2 + 1.8 * c.density; this.d = c.density;
      this.R = rng(11); const fx = c.fx || {}, keys = {}, now = this.t;
      this.el = Object.assign({ seat: 'settee', drape: 'deep', markers: 'floral', centre: 'tall', chairs: 'gold', linen: 'palette', candles: 1 }, c.el || {});
      this.fxOn = !!this.comp && c.venue !== 'photo' && c.venue !== 'street'; this.r.toneMapping = this.fxOn ? T.NoToneMapping : T.ACESFilmicToneMapping;
      const layer = (name, key, fn) => {
        const piv = PIV[name] || [0, 0], outer = new T.Group(), g = new T.Group(); outer.add(g); g.position.set(-piv[0], 0, -piv[1]); this.root.add(outer); this.outers[name] = outer; this.applyTf(name, (c.tf || {})[name]); this.cur = g; this._sw = null; this.F = []; this.H = []; this.Lf = []; this.G = []; this.CA = []; this.CH = []; this.SB = [];
        fn(); this.finalize(g); this.groups[name] = g; keys[name] = key;
        if (this.animate && this.prevKeys && !c.empty && name !== 'env' && this.prevKeys[name] !== key) this.anim.push({ g: g, t0: now, from: name === 'ceiling' ? 1.4 : -0.55 });
      };
      layer('env', c.venue, () => this['env_' + c.venue]());
      if (!c.empty) {
        if (c.on.floor) layer('floor', c.floor, () => this.floor(c.floor));
        if (c.on.stage) layer('stage', c.stage, () => this['stage_' + c.stage]());
        if (c.on.ceiling) layer('ceiling', c.ceiling, () => this.ceiling(c.ceiling));
        if (c.on.seating) layer('seating', c.seating, () => this.seating(c.seating, c.guests));
        if (c.on.entrance && c.entrance) layer('entrance', c.entrance, () => this.entrance(c.entrance));
        (c.props || []).forEach((q, i) => { if (this['prop_' + q.t]) { c.tf = c.tf || {}; layer('p' + i, q.t + '#' + q.id, () => this['prop_' + q.t]()); this.applyTf('p' + i, q); } });
        if (fx.petals || fx.sparks || fx.beams) layer('fx', JSON.stringify(fx), () => this.effects(fx));
        this.prevKeys = keys;
      }
      this.cur = this.root; this.select(this.sel); this.light(c.time); this.updateCam();
    }
    applyTf(name, t) { const o = this.outers[name], piv = PIV[name] || [0, 0]; if (!o) return; t = t || {}; o.position.set(piv[0] + (t.x || 0), t.y || 0, piv[1] + (t.z || 0)); o.rotation.y = t.r || 0; o.scale.setScalar(t.s || 1); }
    select(name) {
      this.sel = name || null; if (this.selLine) { if (this.selLine.parent) this.selLine.parent.remove(this.selLine); this.selLine.geometry.dispose(); this.selLine.material.dispose(); this.selLine = null; }
      const o = name && this.outers[name], f = FOOT[name] || (name && name[0] === 'p' ? [2.2, 2.2] : null); if (!o || !f) return;
      const g = new T.BufferGeometry(), w = f[0] / 2, d = f[1] / 2, y = 0.09, pts = [-w, y, -d, w, y, -d, w, y, d, -w, y, d]; for (let k = 0; k < 4; k++) { const a = k * 3, b = ((k + 1) % 4) * 3, len = 1.2; const dx = Math.sign(pts[b] - pts[a]), dz = Math.sign(pts[b + 2] - pts[a + 2]); }
      g.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); this.selLine = new T.LineLoop(g, new T.LineBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.95, depthTest: false })); this.selLine.renderOrder = 5; this.selLine.visible = !this.selHidden; o.add(this.selLine);
    }
    hideSel(h) { this.selHidden = h; if (this.selLine) this.selLine.visible = !h; }
    groundPoint(cx, cy) {
      const r = this.canvas.getBoundingClientRect(), ray = new T.Raycaster(); ray.setFromCamera({ x: (cx - r.left) / r.width * 2 - 1, y: 1 - (cy - r.top) / r.height * 2 }, this.cam);
      const hit = ray.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), 0), new T.Vector3()); if (!hit) return null; const k = this.root.scale.x || 1; hit.multiplyScalar(1 / k); return Math.abs(hit.x) > 80 || Math.abs(hit.z) > 80 ? null : hit;
    }

    /* ---------- venues ---------- */
    env_photo() { const m = this.plane(90, 90, this.track(new T.ShadowMaterial({ opacity: 0.34 })), 0, 0, 0); m.receiveShadow = true; }
    env_street() { this.env_photo(); }
    env_fort() {
      const st = this.M(0xa05f47, 0.92), dark = this.M(0x6f3d30, 0.95), pale = this.M(0xe6d6bd, 0.8);
      const R0 = rng(6), pv = this.track(canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = 0.9 + R0() * 0.18; g.fillStyle = 'rgb(' + Math.round(186 * v) + ',' + Math.round(144 * v) + ',' + Math.round(110 * v) + ')'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(90,60,40,.55)'; g.lineWidth = 2; for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(0, k * 64); g.lineTo(w, k * 64); g.moveTo(k * 64, 0); g.lineTo(k * 64, h); g.stroke(); } }, 24, 24));
      this.plane(120, 120, this.track(new T.MeshStandardMaterial({ map: pv, roughness: 0.9 })), 0, -0.02, 0);
      const pg = this.track(archPanelGeo(4, 8, 2.7, 6.2, 0.6));
      for (let i = -6; i <= 6; i++) this.add(pg, st, i * 4, 0, -22.3);
      for (let k = 0; k < 11; k++) { const z = -20 + k * 4; const a = this.add(pg, st, -24.3, 0, z); a.rotation.y = Math.PI / 2; const b = this.add(pg, st, 24.3, 0, z); b.rotation.y = -Math.PI / 2; }
      this.box(56, 8, 0.4, dark, 0, 4, -23.6); this.box(0.4, 8, 46, dark, -25.4, 4, 0); this.box(0.4, 8, 46, dark, 25.4, 4, 0);
      this.box(53, 0.45, 1, pale, 0, 8.22, -22.1); this.box(1, 0.45, 46, pale, -24.1, 8.22, 0); this.box(1, 0.45, 46, pale, 24.1, 8.22, 0);
      const dome = this.track(new T.SphereGeometry(1.6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2));
      [[-24, -22], [0, -22], [24, -22]].forEach(p => {
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(q => this.cyl(0.12, 0.12, 2, pale, p[0] + q[0] * 1.1, 9.45, p[1] + q[1] * 1.1, 8));
        this.box(3, 0.25, 3, pale, p[0], 10.55, p[1]); const d = this.add(dome, pale, p[0], 10.65, p[1]); d.scale.y = 1.15; this.cyl(0.03, 0.08, 0.9, this.M(0xc9a45c, 0.35, 0.8), p[0], 12.9, p[1], 8);
      });
    }
    env_farm() {
      const R = rng(5);
      const gt = this.track(canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#58783f'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = ['#4c6b36', '#638549', '#547540'][i % 3]; g.fillRect(R() * w, R() * h, 2, 2); } }, 30, 30));
      this.plane(160, 160, this.track(new T.MeshStandardMaterial({ map: gt, roughness: 1 })), 0, -0.02, 0);
      const trunk = this.M(0x5a4030, 1), leafA = this.M(0x3f5d33, 1), leafB = this.M(0x4f7040, 1), sph = this.track(new T.SphereGeometry(1, 10, 8));
      const tree = (x, z, s) => { this.cyl(0.22 * s, 0.3 * s, 3.2 * s, trunk, x, 1.6 * s, z, 8); const a = this.add(sph, leafA, x, 4.6 * s, z); a.scale.set(2.3 * s, 2.5 * s, 2.3 * s); const b = this.add(sph, leafB, x + 0.9 * s, 5.6 * s, z + 0.5 * s); b.scale.set(1.6 * s, 1.7 * s, 1.6 * s); };
      for (let i = 0; i < 12; i++) { tree(-24 - R() * 6, -30 + i * 5 + R() * 2, 0.9 + R() * 0.6); tree(24 + R() * 6, -30 + i * 5 + R() * 2, 0.9 + R() * 0.6); }
      for (let i = 0; i < 9; i++) tree(-36 + i * 9 + R() * 3, -44 - R() * 5, 1.1 + R() * 0.6);
      const wall = this.M(0xefe6d4, 0.9);
      this.box(20, 5.6, 7, wall, 0, 2.8, -34); this.box(21.5, 0.4, 8.5, this.M(0x8a6a4c, 0.9), 0, 5.8, -34);
      const win = this.track(new T.MeshBasicMaterial({ color: col(0xffd9a0) }));
      for (let i = -3; i <= 3; i++) if (i) this.box(1.5, 2.3, 0.1, win, i * 2.6, 2.6, -30.45);
      for (let i = -4; i <= 4; i++) this.cyl(0.16, 0.16, 5.4, wall, i * 2.6 + 1.3 * (i < 0 ? 1 : -1), 2.7, -29.6, 10);
      const hedge = this.M(0x3d5932, 1);
      this.box(1.2, 1.3, 56, hedge, -19.5, 0.65, -2); this.box(1.2, 1.3, 56, hedge, 19.5, 0.65, -2); this.box(40, 1.3, 1.2, hedge, 0, 0.65, -20.5);
    }
    env_ballroom() {
      const rm = this.cfg.room || {}, W = rm.w || 32, D = rm.d || 46, H = rm.h || 9, zc = 1;
      const R0 = rng(4), pt = this.track(canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { const v = 0.82 + R0() * 0.3; g.fillStyle = 'rgb(' + Math.round(92 * v) + ',' + Math.round(60 * v) + ',' + Math.round(38 * v) + ')'; g.fillRect(x * 64 + (y % 2 ? 32 : 0) - 64, y * 32, 64, 32); g.fillRect(x * 64 + (y % 2 ? 32 : 0) + 192, y * 32, 64, 32); } g.strokeStyle = 'rgba(30,18,10,.5)'; g.lineWidth = 1; for (let y = 0; y <= 8; y++) { g.beginPath(); g.moveTo(0, y * 32); g.lineTo(w, y * 32); g.stroke(); } }, W / 3.2, D / 3.3));
      this.plane(W, D, this.track(new T.MeshStandardMaterial({ map: pt, roughness: 0.32, metalness: 0.05 })), 0, -0.02, zc);
      const wtex = rx => this.track(canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#ddd0b8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c4b495'; g.lineWidth = 3; g.strokeRect(26, 22, w - 52, h - 100); g.strokeRect(40, 36, w - 80, h - 128);
        g.fillStyle = '#b89b62'; g.fillRect(0, h - 62, w, 4); g.fillStyle = '#cfc0a4'; g.fillRect(0, h - 58, w, 58);
      }, rx, 1));
      const wall = (w, x, z, ry) => { const m = this.add(this.track(new T.PlaneGeometry(w, H)), this.track(new T.MeshStandardMaterial({ map: wtex(Math.max(2, Math.round(w / 4))), roughness: 0.9 })), x, H / 2, z); m.rotation.y = ry; m.castShadow = false; };
      wall(W, 0, zc - D / 2, 0); wall(W, 0, zc + D / 2, Math.PI); wall(D, -W / 2, zc, Math.PI / 2); wall(D, W / 2, zc, -Math.PI / 2);
      const ct = this.track(canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#efe6d6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2c3a4'; g.lineWidth = 8; g.strokeRect(0, 0, w, h); g.strokeStyle = '#e1d5bd'; g.lineWidth = 3; g.strokeRect(16, 16, w - 32, h - 32); }, W / 4, D / 4.2));
      const cm = this.add(this.track(new T.PlaneGeometry(W, D)), this.track(new T.MeshStandardMaterial({ map: ct, roughness: 1 })), 0, H, zc); cm.rotation.x = Math.PI / 2; cm.castShadow = false;
      for (let z = zc - D / 2 + 4; z <= zc + D / 2 - 3; z += 4.75) { this.G.push(-W / 2 + 0.2, Math.min(4.6, H * 0.55), z); this.G.push(W / 2 - 0.2, Math.min(4.6, H * 0.55), z); }
    }

    /* ---------- layers ---------- */
    floor(kind) {
      const w = 3.2, z0 = 15, z1 = -9.2, len = z0 - z1, zc = (z0 + z1) / 2, P = this.P, fl = this.fl;
      if (kind === 'acrylic') {
        const m = this.track(new T.MeshPhysicalMaterial({ color: col(0xfdfdfb), roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.05 }));
        this.box(w, 0.05, len, m, 0, 0.025, zc); this.box(9.5, 0.05, 4.6, m, 0, 0.03, -6.8);
        for (let z = z1 + 3; z <= z0; z += 1.5) { this.candle(-w / 2 - 0.2, 0, z, 0.28); this.candle(w / 2 + 0.2, 0, z, 0.28); }
      } else if (kind === 'mirror') {
        this.box(w, 0.05, len, this.mirror(), 0, 0.025, zc);
        for (let z = z1; z <= z0; z += 0.45) { this.blob(-w / 2 - 0.28, 0.28, z, 0.34, 0.3, 0.3, 5, fl); this.blob(w / 2 + 0.28, 0.28, z, 0.34, 0.3, 0.3, 5, fl); }
      } else if (kind === 'rug') {
        const deep = P.deep, a = P.sw[2], b = P.linen;
        const t = this.track(canvasTex(256, 480, (g, W, H) => {
          g.fillStyle = deep; g.fillRect(0, 0, W, H); g.strokeStyle = a; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, H - 28); g.strokeStyle = b; g.lineWidth = 3; g.strokeRect(30, 30, W - 60, H - 60);
          g.fillStyle = a; g.beginPath(); g.moveTo(W / 2, 110); g.lineTo(W - 62, H / 2); g.lineTo(W / 2, H - 110); g.lineTo(62, H / 2); g.closePath(); g.fill();
          g.fillStyle = deep; g.beginPath(); g.moveTo(W / 2, 160); g.lineTo(W - 100, H / 2); g.lineTo(W / 2, H - 160); g.lineTo(100, H / 2); g.closePath(); g.fill();
          g.fillStyle = b; for (let y = 52; y < H - 40; y += 26) for (let x = 48; x < W - 40; x += 26) if ((x + y) % 52 < 26) { g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); }
          g.beginPath(); g.arc(W / 2, H / 2, 16, 0, 7); g.fill();
        }, 1, 4));
        this.plane(w, len, this.track(new T.MeshStandardMaterial({ map: t, roughness: 0.95 })), 0, 0.02, zc);
        for (let z = z1 + 1.5; z <= z0; z += 3) [-1, 1].forEach(s => { this.box(0.28, 0.5, 0.28, this.metal(), s * (w / 2 + 0.35), 0.25, z); this.G.push(s * (w / 2 + 0.35), 0.42, z); });
      } else if (kind === 'chequer') {
        const tex = (rx, ry) => this.track(canvasTex(64, 64, (g) => { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#16130f'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); }, rx, ry));
        const mk = t => this.track(new T.MeshPhysicalMaterial({ map: t, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }));
        this.box(w, 0.05, len, mk(tex(2, 15)), 0, 0.025, zc); this.box(9.6, 0.05, 4.8, mk(tex(6, 3)), 0, 0.03, -6.8);
        this.box(0.06, 0.07, len, this.metal(), -w / 2 - 0.03, 0.035, zc); this.box(0.06, 0.07, len, this.metal(), w / 2 + 0.03, 0.035, zc);
      } else if (kind === 'petal') {
        this.plane(w, len, this.M(hexInt(P.linen), 0.95), 0, 0.02, zc);
        const n = Math.round(1700 * (0.5 + this.d)), R = this.R; for (let i = 0; i < n; i++) { const e = R() < 0.4 ? (R() < 0.5 ? -1 : 1) * (w / 2 - R() * 0.35) : (R() - 0.5) * w; this.flower(e, 0.05, L(z1, z0, R()), 0.05 + R() * 0.04, fl[(R() * fl.length) | 0]); }
      } else {
        this.plane(w, len, this.M(0x6f8f4a, 1), 0, 0.015, zc);
        const stone = this.M(0xe6dcc8, 0.9); for (let z = z1 + 0.8; z <= z0; z += 1.25) this.cyl(0.42, 0.42, 0.05, stone, 0, 0.03, z, 14);
        const n = Math.round(320 * this.dm); for (let i = 0; i < n; i++) { const s = this.R() < 0.5 ? -1 : 1; this.flower(s * (w / 2 + (this.R() - 0.3) * 0.7), 0.05, L(z1, z0, this.R()), 0.07, fl[(this.R() * fl.length) | 0]); }
      }
      if (this.cfg.on.stage && this.cfg.stage === 'tunnel') return;
      const ped = this.P.metal === 'silver' ? this.metal() : this.M(0xf1e9da, 0.6), mk = this.el.markers, mt = this.metal();
      if (mk !== 'none') [12, 8.5, 5, 1.5, -2, -5.5].forEach(z => [-1, 1].forEach(s => {
        const x = s * 2.3; this.soft(x, z, 1.5, 1.5);
        if (mk === 'floral') { this.cyl(0.2, 0.26, 1, ped, x, 0.5, z, 12); this.blob(x, 1.45, z, 0.5, 0.5, 0.5, 30, fl); this.candle(x + s * 0.5, 0, z + 0.3, 0.5); this.candle(x + s * 0.45, 0, z - 0.35, 0.34); }
        else if (mk === 'lantern') { [[0, 0, 0.7], [0.38, 0.3, 0.48], [-0.1, -0.36, 0.34]].forEach(q => { this.box(0.3, q[2], 0.3, mt, x + s * q[0], q[2] / 2, z + q[1]); this.box(0.2, q[2] * 0.6, 0.31, this.track(new T.MeshBasicMaterial({ color: col(0xffd38a) })), x + s * q[0], q[2] / 2, z + q[1]); this.G.push(x + s * q[0], q[2] * 0.55, z + q[1]); }); }
        else { this.cyl(0.035, 0.035, 1.7, mt, x, 0.85, z, 8); this.cyl(0.22, 0.26, 0.06, mt, x, 0.03, z, 12); this.box(0.7, 0.04, 0.04, mt, x, 1.6, z); this.box(0.04, 0.04, 0.7, mt, x, 1.6, z); [[0, 0, 0.3], [0.33, 0, 0.22], [-0.33, 0, 0.22], [0, 0.33, 0.22], [0, -0.33, 0.22]].forEach(q => { this.CA.push(x + q[0], 1.62, z + q[1], q[2]); this.G.push(x + q[0], 1.7 + q[2], z + q[1]); }); }
      }));
    }
    plinth(mat) {
      this.box(11, 0.5, 5, mat, 0, 0.25, -12); this.box(6.4, 0.34, 0.5, mat, 0, 0.17, -9.3); this.box(7, 0.17, 0.5, mat, 0, 0.085, -8.85);
      const s = this.M(hexInt(this.P.linen), 0.9), d = this.M(hexInt(this.P.deep), 0.95); this.soft(0, -11.6, 15, 9);
      if (this.el.seat === 'settee') {
        this.box(2.6, 0.45, 0.95, s, 0, 0.75, -12.3); this.box(2.6, 0.75, 0.22, s, 0, 1.2, -12.7); this.box(0.22, 0.62, 0.95, s, -1.35, 0.85, -12.3); this.box(0.22, 0.62, 0.95, s, 1.35, 0.85, -12.3);
        this.box(0.5, 0.4, 0.16, d, -0.75, 1.15, -12.5); this.box(0.5, 0.4, 0.16, d, 0.75, 1.15, -12.5);
      } else if (this.el.seat === 'thrones') {
        [-0.75, 0.75].forEach(x => { this.box(0.9, 0.5, 0.85, d, x, 0.75, -12.3); this.box(0.9, 1.55, 0.16, d, x, 1.6, -12.72); this.box(1.02, 0.12, 0.2, this.metal(), x, 2.42, -12.72); this.box(0.1, 0.75, 0.85, this.metal(), x - 0.5, 0.9, -12.3); this.box(0.1, 0.75, 0.85, this.metal(), x + 0.5, 0.9, -12.3); });
      }
    }
    stage_jharoka() {
      const fac = this.M(0xd9bf85, 0.45, 0.4), fl = this.fl;
      this.plinth(this.M(0xefe5d0, 0.85));
      this.backdrop(10.2, 6.2, 0, 3.6, -14.5);
      this.add(this.track(archPanelGeo(4.6, 6.2, 3.2, 4.9, 0.45)), fac, 0, 0.5, -14.3);
      const sg = this.track(archPanelGeo(2.9, 5, 1.9, 3.8, 0.45)); this.add(sg, fac, -3.75, 0.5, -14.3); this.add(sg, fac, 3.75, 0.5, -14.3);
      const dome = this.track(new T.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2));
      const dm = this.add(dome, fac, 0, 6.7, -14.05); dm.scale.set(1.5, 1.7, 1.2); this.cyl(0.03, 0.09, 0.8, this.metal(), 0, 8.75, -14.05, 8);
      [-3.75, 3.75].forEach(x => { const m = this.add(dome, fac, x, 5.5, -14.05); m.scale.set(0.9, 1, 0.8); this.G.push(x, 3.4, -13.9); this.G.push(x, 3.1, -13.9); });
      this.box(4.9, 0.18, 0.7, fac, 0, 6.72, -14.08); this.box(3.1, 0.16, 0.65, fac, -3.75, 5.52, -14.08); this.box(3.1, 0.16, 0.65, fac, 3.75, 5.52, -14.08);
      archPts(3.2, 4.9, 16).forEach(p => this.blob(p[0], 0.5 + p[1], -13.75, 0.24, 0.24, 0.2, 5, fl));
      [-3.75, 3.75].forEach(x => archPts(1.9, 3.8, 9).forEach(p => this.blob(x + p[0], 0.5 + p[1], -13.75, 0.2, 0.2, 0.18, 3, fl)));
      [-5.3, -2.3, 2.3, 5.3].forEach(x => { this.blob(x, 1, -13.5, 0.55, 0.5, 0.45, 42, fl); this.candle(x + 0.5, 0.5, -13, 0.5); this.candle(x - 0.4, 0.5, -12.9, 0.34); });
    }
    stage_rosewall() {
      const fl = this.fl, R = this.R;
      this.plinth(this.M(0xf6f1e7, 0.8));
      this.box(9.5, 5, 0.5, this.M(0xf4efe6, 0.9), 0, 3, -14.3);
      const n = Math.round(500 + 1500 * this.d);
      for (let i = 0; i < n; i++) {
        const x = (R() - 0.5) * 9.5, y = 0.55 + R() * 4.95, z = -13.98 + R() * 0.14;
        if (R() < 0.12) this.Lf.push(x, y, z, 0.16 + R() * 0.1); else this.flower(x, y, z, 0.14 + R() * 0.12, R() < 0.72 ? WHITES[(R() * 4) | 0] : fl[(R() * fl.length) | 0]);
      }
      [-5.7, 5.7].forEach(x => { this.box(0.75, 1.2, 0.75, this.M(0xf6f1e7, 0.7), x, 1.1, -12.4); this.blob(x, 2.15, -12.4, 0.6, 0.55, 0.6, 46, fl); this.candle(x * 0.87, 0.5, -11.6, 0.6); this.candle(x * 0.8, 0.5, -11.3, 0.4); });
    }
    stage_tunnel() {
      const mt = this.metal(), mir = this.mirror(), fl = this.fl;
      this.plinth(this.M(0xf2f0ec, 0.5));
      const arc = this.track(new T.TorusGeometry(2.6, 0.11, 8, 36, Math.PI));
      [12, 9, 6, 3, 0, -3, -6].forEach(z => {
        this.add(arc, mt, 0, 2.4, z); [-2.6, 2.6].forEach(x => { this.cyl(0.11, 0.11, 2.4, mt, x, 1.2, z, 10); this.blob(x, 0.36, z, 0.48, 0.4, 0.48, 22, fl); });
        for (let k = 1; k < 8; k++) { const a = k / 8 * Math.PI; this.G.push(Math.cos(a) * 2.45, 2.4 + Math.sin(a) * 2.45 - 0.15, z); }
      });
      [-3.6, -1.8, 0, 1.8, 3.6].forEach((x, i) => { const p = this.box(1.72, 5.5, 0.1, mir, x, 3.25, -14.25); p.rotation.y = (i % 2 ? 0.24 : -0.24); this.blob(x, 0.82, -13.6, 0.95, 0.36, 0.42, 45, fl); });
    }
    stage_jhoola() {
      const wood = this.M(0x6b4226, 0.6), fl = this.fl, R = this.R, mg = MG.concat([fl[0], fl[fl.length - 1]]);
      this.plinth(this.M(0xf3e7cf, 0.85));
      [-2.15, 2.15].forEach(x => this.cyl(0.11, 0.14, 4.3, wood, x, 2.65, -11.2, 10)); this.box(5, 0.2, 0.2, wood, 0, 4.85, -11.2);
      this.box(2.7, 0.12, 0.85, wood, 0, 1.6, -11.2); this.box(2.6, 0.2, 0.8, this.M(hexInt(this.P.deep), 0.95), 0, 1.76, -11.2); this.box(2.7, 0.7, 0.1, wood, 0, 2.15, -11.62);
      [-1.25, 1.25].forEach(x => [-0.38, 0.38].forEach(dz => { for (let y = 1.7; y < 4.8; y += 0.16) this.flower(x, y, -11.2 + dz, 0.085, MG[(R() * 4) | 0]); }));
      this.box(9.8, 0.3, 0.3, this.metal(), 0, 6.2, -14.3); [-4.9, 4.9].forEach(x => this.cyl(0.1, 0.1, 5.7, this.metal(), x, 3.35, -14.3, 10));
      const keep = 0.4 + 0.6 * this.d;
      for (let x = -4.6; x <= 4.6; x += 0.23) { if (R() > keep) continue; const len = 4.3 + R() * 1.1; for (let y = 0; y < len; y += 0.2) this.flower(x + (R() - 0.5) * 0.04, 6.02 - y, -14.25 + (R() - 0.5) * 0.08, 0.1, mg[(R() * mg.length) | 0]); }
      [-3.8, 3.8].forEach(x => { this.cyl(0.34, 0.2, 0.8, this.metal(), x, 0.9, -11); this.blob(x, 1.75, -11, 0.6, 0.55, 0.6, 50, mg); this.candle(x * 1.12, 0.5, -10.4, 0.45); });
    }
    ball(r, mat, x, y, z, sy) { const m = this.add(this.sph, mat, x, y, z); m.scale.set(r, r * (sy || 1), r); return m; }
    swag(r, tube, mat, x, y, z, ry) { const m = this.add(this.track(new T.TorusGeometry(r, tube, 8, 22, Math.PI)), mat, x, y, z); m.rotation.z = Math.PI; if (ry) m.rotation.y = ry; return m; }
    stage_velvetswag() {
      const fl = this.fl, deep = hexInt(this.P.deep), vm = this.M(deep, 0.97);
      this.plinth(this.M(0x2a2420, 0.9)); this.drape(9.6, 5.3, 0, 3.15, -14.35, deep);
      [-3.2, 0, 3.2].forEach((x, i) => { this.swag(1.6, 0.26, vm, x, 5.75, -14.15); this.swag(1.1, 0.2, vm, x + (i - 1) * 0.3, 4.6 - i * 0.5, -14.1); });
      this.box(10.4, 0.07, 1.6, vm, 0, 0.54, -13.5);
      this.blob(3.1, 4.3, -13.75, 1.15, 0.85, 0.5, 80, fl); this.blob(-3.7, 2.7, -13.7, 1.05, 0.75, 0.5, 66, fl); this.blob(-4.8, 0.95, -12.5, 1.15, 0.5, 0.75, 64, fl); this.blob(3.5, 0.95, -12.4, 1.05, 0.5, 0.7, 56, fl);
      for (let k = 0; k < 9; k++) { this.flower(3.3 + (this.R() - 0.5) * 0.3, 3.4 - k * 0.16, -13.5, 0.07, fl[0]); }
    }
    stage_pillars() {
      const fl = this.fl, iv = this.M(0xf6f1e4, 0.75), hs = [4.6, 5.6, 6.5, 5.2, 6.5, 5.6, 4.6];
      this.plinth(this.M(0xf3efe4, 0.85));
      hs.forEach((h, i) => { const x = -6.3 + i * 2.1, z = -13.7 - (i % 2) * 0.5; this.box(0.72, h, 0.72, iv, x, 0.5 + h / 2, z); this.G.push(x, 0.75, z + 0.7); this.G.push(x, 0.75, z + 0.7);
        if (i % 2 === 0 || i === 3) for (let y = 0.8; y < h * 0.86; y += 0.3) this.blob(x + Math.sin(y * 1.7) * 0.34, 0.5 + y, z + 0.45, 0.42, 0.3, 0.36, 8, fl);
        this.blob(x, 0.95, z + 0.8, 0.95, 0.45, 0.6, 30, fl); });
    }
    stage_gotalotus() {
      const R = this.R, gold = this.M(0xd4a73c, 0.38, 0.75), pink = this.M(0xd6246e, 0.6, 0.2), rose = this.M(0xe8829c, 0.6, 0.15), yel = this.M(0xf0c75e, 0.45, 0.5);
      this.plinth(this.M(0xf3e7cf, 0.85));
      const lotus = (x, y, z, s) => { this.cyl(0.03, 0.04, y - 0.5, gold, x, 0.5 + (y - 0.5) / 2, z - 0.1, 6);
        for (let ring = 0; ring < 2; ring++) for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + ring * 0.31, r = (ring ? 0.42 : 0.78) * s, m = this.ball(0.34 * s, ring ? rose : (k % 2 ? gold : pink), x + Math.cos(a) * r, y + Math.sin(a) * r, z + ring * 0.12, 1); m.scale.set(0.3 * s, 0.42 * s, 0.07); m.rotation.z = a - Math.PI / 2; }
        this.ball(0.24 * s, yel, x, y, z + 0.2, 1).scale.z = 0.1; };
      const leaf = (x, y, z, s, rz) => { this.cyl(0.025, 0.03, y - 0.5, gold, x, 0.5 + (y - 0.5) / 2, z - 0.05, 6); const m = this.ball(1, gold, x, y, z, 1); m.scale.set(0.55 * s, 0.9 * s, 0.05); m.rotation.z = rz; };
      [[-3.4, 3.1, 1.15], [-1.5, 4.2, 1.25], [0.9, 3.6, 1.2], [3.2, 4.4, 1.1], [-2.6, 1.9, 0.9], [3.6, 2.4, 1]].forEach(q => lotus(q[0], q[1], -13.6, q[2]));
      [[-4.3, 4.3, 1.1, 0.3], [0, 5.6, 1.4, -0.1], [1.9, 5.2, 1, -0.4], [-0.6, 2.4, 0.8, 0.5], [4.5, 3.6, 0.9, -0.5], [2.2, 1.9, 0.7, 0.2]].forEach(q => leaf(q[0], q[1], -13.9, q[2], q[3]));
      this.box(9.6, 0.1, 0.1, gold, 0, 6.4, -13.3); const tc = [0xd6246e, 0xf0c75e, 0xd4a73c, 0xff7ab0];
      for (let x = -4.6; x <= 4.6; x += 0.72) { const len = 2.6 + R() * 2.2; for (let y = 0; y < len; y += 0.17) this.flower(x, 6.35 - y, -13.3 + (R() - 0.5) * 0.05, 0.075, tc[((y / 0.51) | 0) % 2 + (x > 0 ? 1 : 0)]); }
      this.box(2.7, 0.12, 0.85, gold, 0, 1.0, -11.9); [-1.2, 1.2].forEach(x => [-0.3, 0.3].forEach(dz => this.cyl(0.05, 0.05, 0.5, gold, x, 0.75, -11.9 + dz, 8))); this.box(2.7, 0.5, 0.08, gold, 0, 1.35, -12.3);
      [-1, -0.5, 0, 0.5, 1].forEach((x, i) => this.box(0.46, 0.46, 0.14, i % 2 ? yel : pink, x, 1.32, -12.15));
      [-2.4, 2.4].forEach(x => { this.cyl(0.4, 0.3, 0.7, gold, x, 0.85, -11.5, 12); [[0, 0], [0.2, 0.15], [-0.18, 0.12]].forEach((q, i) => this.ball(0.17, i % 2 ? rose : gold, x + q[0], 1.35 + (i === 0 ? 0.2 : 0), -11.5 + q[1], 1)); });
      this.blob(-1.6, 0.62, -10.8, 0.9, 0.12, 0.5, 50, [0xd6246e, 0xe8829c]); this.blob(1.8, 0.62, -10.7, 0.9, 0.12, 0.5, 50, [0xd6246e, 0xe8829c]);
    }
    stage_haveli() {
      const fl = this.fl, sage = 0x8a9a78;
      this.plinth(this.M(0xf3ede0, 0.85)); this.drape(11.2, 6.1, 0, 3.55, -14.5, 0xf3ecdc);
      this.drape(1.5, 5.9, -2.3, 3.45, -14.32, sage); this.drape(1.5, 5.9, 4.9, 3.45, -14.32, sage); this.swag(1.9, 0.3, this.M(sage, 0.95), -0.4, 6.3, -14.25);
      this.blob(-3.5, 2.0, -13.35, 1.5, 1.5, 0.9, 150, fl); this.blob(3.4, 2.45, -13.35, 1.4, 1.95, 0.9, 165, fl); this.blob(-3.4, 0.8, -10.4, 1.7, 0.36, 0.6, 60, fl); this.blob(3.4, 0.8, -10.4, 1.7, 0.36, 0.6, 60, fl);
      [-5.3, 5.3].forEach(x => { this.box(0.14, 0.4, 0.14, this.metal(), x, 4.1, -14.3); this.G.push(x, 4.3, -14.15); this.G.push(x, 4.3, -14.15); });
      for (let x = -4.6; x <= 4.6; x += 0.66) if (Math.abs(x) > 1.6) this.candle(x, 0.5, -10.9 + Math.sin(x * 3) * 0.15, 0.22 + (Math.abs(x * 7) % 3) * 0.1);
    }
    stage_moongate() {
      const fl = this.fl, mt = this.metal();
      this.plinth(this.M(0xf4efe6, 0.8)); this.backdrop(10.6, 6.4, 0, 3.7, -14.45);
      this.add(this.track(new T.TorusGeometry(3, 0.14, 10, 72)), mt, 0, 3.95, -13.6); this.add(this.track(new T.TorusGeometry(2.25, 0.06, 8, 60)), mt, 0.55, 3.6, -13.85);
      for (let a = 0; a < 6.283; a += 0.085) { const wgt = 0.3 + 0.9 * Math.pow(Math.max(0, Math.cos(a - 3.95)), 2) + 0.7 * Math.pow(Math.max(0, Math.cos(a - 0.85)), 2); this.blob(Math.cos(a) * 3, 3.95 + Math.sin(a) * 3, -13.5, 0.3 + wgt * 0.16, 0.3 + wgt * 0.16, 0.3, 8 * wgt, fl); }
      [-3.9, 3.9].forEach(x => { this.blob(x, 0.9, -13.1, 1.1, 0.42, 0.5, 60, fl); this.candle(x * 1.2, 0.5, -12.3, 0.55); this.candle(x * 1.1, 0.5, -11.9, 0.36); this.candle(x * 1.28, 0.5, -11.8, 0.26); });
    }
    stage_mandap() {
      const fl = this.fl, mt = this.metal(), P = this.P;
      this.plinth(this.M(0xf3ead8, 0.85)); this.backdrop(5.6, 4.6, 0, 2.85, -14.05);
      const posts = [[-2.75, -10.4], [2.75, -10.4], [-2.75, -13.95], [2.75, -13.95]];
      posts.forEach(q => { this.cyl(0.13, 0.16, 4.6, mt, q[0], 2.8, q[1], 12); this.box(0.5, 0.18, 0.5, mt, q[0], 0.6, q[1]); for (let y = 0.9; y < 5.1; y += 0.27) this.blob(q[0], y, q[1], 0.25, 0.2, 0.25, 5, fl); this.blob(q[0], 0.85, q[1], 0.5, 0.35, 0.5, 26, fl); });
      this.box(5.8, 0.16, 0.16, mt, 0, 5.18, -10.4); this.box(5.8, 0.16, 0.16, mt, 0, 5.18, -13.95); this.box(0.16, 0.16, 3.7, mt, -2.75, 5.18, -12.18); this.box(0.16, 0.16, 3.7, mt, 2.75, 5.18, -12.18);
      const roof = this.add(this.track(new T.ConeGeometry(4.2, 1.5, 4, 1)), this.M(hexInt(P.linen), 0.9), 0, 6.0, -12.18); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.72;
      this.cyl(0.03, 0.09, 0.7, mt, 0, 7.1, -12.18, 8);
      for (let x = -2.6; x <= 2.6; x += 0.4) { this.blob(x, 5.2, -10.4, 0.26, 0.22, 0.22, 6, fl); for (let k = 0; k < 4; k++) this.G.push(x, 4.9 - k * 0.32 - Math.abs(Math.sin(x * 2)) * 0.5, -10.42); }
      for (let z = -13.7; z <= -10.6; z += 0.4) { this.blob(-2.75, 5.2, z, 0.22, 0.22, 0.26, 5, fl); this.blob(2.75, 5.2, z, 0.22, 0.22, 0.26, 5, fl); }
      this.G.push(0, 4.6, -12.2); this.G.push(0.3, 4.3, -12); this.G.push(-0.3, 4.4, -12.4);
    }
    prop_pedestal() { this.soft(0, 0, 1.5, 1.5); this.cyl(0.2, 0.26, 1, this.M(0xf1e9da, 0.6), 0, 0.5, 0, 12); this.blob(0, 1.45, 0, 0.5, 0.5, 0.5, 34, this.fl); this.candle(0.5, 0, 0.3, 0.5); this.candle(-0.45, 0, 0.35, 0.34); }
    prop_urn() { this.soft(0, 0, 2.2, 2.2); const m = this.M(0xefe9dc, 0.7); this.cyl(0.42, 0.24, 0.9, m, 0, 0.75, 0, 16); this.cyl(0.3, 0.36, 0.3, m, 0, 0.15, 0, 16); this.blob(0, 1.9, 0, 0.9, 0.85, 0.9, 110, this.fl); }
    prop_lanterns() { const mt = this.metal(), w = this.track(new T.MeshBasicMaterial({ color: col(0xffd38a) })); this.soft(0, 0, 1.6, 1.6); [[0, 0, 0.72], [0.4, 0.3, 0.5], [-0.15, -0.38, 0.36]].forEach(q => { this.box(0.3, q[2], 0.3, mt, q[0], q[2] / 2, q[1]); this.box(0.2, q[2] * 0.6, 0.31, w, q[0], q[2] / 2, q[1]); this.box(0.31, q[2] * 0.6, 0.2, w, q[0], q[2] / 2, q[1]); this.G.push(q[0], q[2] * 0.55, q[1]); }); }
    prop_candles() { const lv = this.el.candles; this.el.candles = 1; [[0, 0, 0.6], [0.22, 0.12, 0.42], [-0.2, 0.16, 0.5], [0.08, -0.24, 0.3], [-0.26, -0.14, 0.36], [0.32, -0.12, 0.24], [-0.05, 0.34, 0.22]].forEach(q => this.candle(q[0], 0, q[1], q[2])); this.el.candles = lv; this.soft(0, 0, 1.2, 1.2); }
    prop_candelabra() { const mt = this.metal(); this.cyl(0.035, 0.035, 1.7, mt, 0, 0.85, 0, 8); this.cyl(0.22, 0.26, 0.06, mt, 0, 0.03, 0, 12); this.box(0.7, 0.04, 0.04, mt, 0, 1.6, 0); this.box(0.04, 0.04, 0.7, mt, 0, 1.6, 0); [[0, 0, 0.3], [0.33, 0, 0.22], [-0.33, 0, 0.22], [0, 0.33, 0.22], [0, -0.33, 0.22]].forEach(q => { this.CA.push(q[0], 1.62, q[1], q[2]); this.G.push(q[0], 1.7 + q[2], q[1]); }); this.soft(0, 0, 1, 1); }
    prop_arch() { const mt = this.metal(), fl = this.fl; this.add(this.track(new T.TorusGeometry(2.1, 0.09, 8, 36, Math.PI)), mt, 0, 2.4, 0); [-2.1, 2.1].forEach(x => { this.cyl(0.09, 0.09, 2.4, mt, x, 1.2, 0, 8); for (let y = 0.3; y < 2.4; y += 0.32) this.blob(x, y, 0, 0.34, 0.3, 0.34, 8, fl); }); for (let a = 0; a <= Math.PI; a += 0.1) this.blob(Math.cos(a) * 2.1, 2.4 + Math.sin(a) * 2.1, 0, 0.36, 0.36, 0.36, 9, fl); }
    prop_table() { const lk = this.el.linen, linen = this.M(lk === 'ivory' ? 0xf6f1e6 : lk === 'deep' ? hexInt(this.P.deep) : lk === 'black' ? 0x17140f : hexInt(this.P.linen), 0.9); this.soft(0, 0, 4.2, 4.2); this.add(this.track(new T.CylinderGeometry(0.85, 0.95, 0.76, 20)), linen, 0, 0.38, 0); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; this.CH.push(1.32 * Math.cos(a), 1.32 * Math.sin(a), Math.atan2(-Math.cos(a), -Math.sin(a))); } this.blob(0, 0.95, 0, 0.32, 0.17, 0.32, 34, this.fl); for (let i = 0; i < 3; i++) this.candle(0.4 * Math.cos(i * 2.1), 0.76, 0.4 * Math.sin(i * 2.1), 0.2); }
    prop_sofa() { const s = this.M(hexInt(this.P.linen), 0.9), d = this.M(hexInt(this.P.deep), 0.95); this.soft(0, 0, 3.4, 1.8); this.box(2.4, 0.45, 0.95, s, 0, 0.25, 0); this.box(2.4, 0.7, 0.22, s, 0, 0.7, -0.4); this.box(0.22, 0.6, 0.95, s, -1.25, 0.35, 0); this.box(0.22, 0.6, 0.95, s, 1.25, 0.35, 0); this.box(0.5, 0.4, 0.16, d, -0.7, 0.66, -0.2); this.box(0.5, 0.4, 0.16, d, 0.7, 0.66, -0.2); }
    prop_tree() { const tr = this.M(0x5a4030, 1), lf = this.M(0x3f5d33, 1); this.soft(0, 0, 3.4, 3.4); this.cyl(0.18, 0.28, 3.4, tr, 0, 1.7, 0, 8); this.ball(2.1, lf, 0, 4.6, 0, 1); this.ball(1.4, this.M(0x4f7040, 1), 0.9, 5.4, 0.4, 1); for (let k = 0; k < 60; k++) { const a = k * 0.5, y = 0.3 + k * 0.05; this.G.push(Math.cos(a) * 0.3, y, Math.sin(a) * 0.3); } for (let k = 0; k < 40; k++) { const a = this.R() * 6.283, e = this.R() * 1.2 - 0.2; this.G.push(Math.cos(a) * Math.cos(e) * 2.1, 4.6 + Math.sin(e) * 2.1, Math.sin(a) * Math.cos(e) * 2.1); } }
    prop_chandelier() { const mt = this.metal(), y = 5.6; [[1, 0], [0.62, -0.45], [0.36, 0.42]].forEach(q => { const t = this.add(this.track(new T.TorusGeometry(q[0], 0.035, 6, 28)), mt, 0, y + q[1], 0); t.rotation.x = Math.PI / 2; }); this.cyl(0.02, 0.02, 3, mt, 0, y + 1.5, 0, 6); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; this.G.push(Math.cos(a), y + 0.14, Math.sin(a)); } for (let i = 0; i < 30; i++) { const a = this.R() * 6.283, rr = this.R() * 0.55; this.G.push(Math.cos(a) * rr, y - 0.5 - this.R() * 0.9, Math.sin(a) * rr); } }
    entrance(kind) {
      const fl = this.fl, mt = this.metal(), z = 16.6;
      if (kind === 'gate') {
        this.add(this.track(new T.TorusGeometry(2.3, 0.1, 8, 40, Math.PI)), mt, 0, 2.6, z); [-2.3, 2.3].forEach(x => this.cyl(0.1, 0.1, 2.6, mt, x, 1.3, z, 10));
        for (let a = 0; a <= Math.PI; a += 0.075) { const w = 0.45 + 0.9 * Math.pow(Math.max(0, Math.cos(a - 2.45)), 2); this.blob(Math.cos(a) * 2.3, 2.6 + Math.sin(a) * 2.3, z, 0.3 + w * 0.14, 0.3 + w * 0.14, 0.32, 9 * w, fl); }
        for (let y = 0.25; y < 2.6; y += 0.28) this.blob(-2.3, y, z, 0.36, 0.3, 0.36, 9, fl);
        this.blob(2.3, 0.4, z, 0.6, 0.4, 0.55, 34, fl); this.candle(2.9, 0, z + 0.4, 0.5); this.candle(-3, 0, z + 0.5, 0.4);
      } else if (kind === 'welcome') {
        const fr = this.box(1.44, 2.24, 0.05, mt, -3.2, 1.5, z - 0.03); fr.rotation.y = 0.38; const mi = this.box(1.3, 2.1, 0.06, this.mirror(), -3.2, 1.5, z); mi.rotation.y = 0.38;
        this.blob(-3.7, 2.45, z + 0.1, 0.55, 0.4, 0.35, 30, fl); this.blob(-2.7, 0.4, z + 0.3, 0.6, 0.35, 0.45, 30, fl);
        [3, 3.9].forEach((x, i) => { this.cyl(0.32, 0.2, 0.8 + i * 0.2, mt, x, 0.4 + i * 0.1, z - i * 0.5); this.blob(x, 1.3 + i * 0.25, z - i * 0.5, 0.6, 0.55, 0.6, 46, fl); });
        [[2.2, 0.5], [2.5, 0.34], [1.9, 0.28]].forEach((q, i) => { this.box(0.26, q[1], 0.26, mt, q[0], q[1] / 2, z + 0.5 + i * 0.3); this.G.push(q[0], q[1] * 0.7, z + 0.5 + i * 0.3); });
      } else if (kind === 'pearlstairs') {
        const iv = 0xf6f1e4, wh = [0xffffff, 0xfbf6ea];
        [-1.9, 1.9].forEach(x => { this.cyl(0.07, 0.07, 3.6, mt, x, 1.8, z, 8); this.drape(0.75, 3.5, x, 1.8, z + 0.08, iv); this.blob(x, 3.5, z + 0.2, 0.42, 0.34, 0.3, 30, wh); this.blob(x * 1.05, 1.9, z + 0.25, 0.3, 0.26, 0.25, 16, wh); });
        this.box(4, 0.08, 0.08, mt, 0, 3.6, z); this.swag(1.9, 0.2, this.M(iv, 0.95), 0, 3.6, z + 0.1);
        for (let k = 0; k < 3; k++) for (let a = 0.05; a < 3.1; a += 0.07) this.flower(Math.cos(a) * (1.75 - k * 0.3), 3.55 - Math.sin(a) * (0.9 + k * 0.35), z + 0.3, 0.045, 0xffffff);
        [-1.9, 1.9].forEach(x => { for (let y = 0.3; y < 3.5; y += 0.09) this.flower(x + (x < 0 ? 0.42 : -0.42), y, z + 0.3, 0.04, 0xffffff); });
        for (let k = 0; k < 5; k++) [-1, 1].forEach(sd => { this.candle(sd * (1.5 + (k % 2) * 0.35), 0, z + 0.7 + k * 0.75, 0.24 + (k % 3) * 0.1); if (k % 2 === 0) { this.box(0.24, 0.42, 0.24, mt, sd * 2.1, 0.21, z + 0.9 + k * 0.75); this.G.push(sd * 2.1, 0.3, z + 0.9 + k * 0.75); } });
      } else if (kind === 'welcometable') {
        const sat = this.M(0xf4ecd8, 0.5), x0 = -3.7; this.soft(x0, z, 4.6, 2.6);
        this.box(2.8, 0.82, 1.05, sat, x0, 0.41, z); [-0.92, 0, 0.92].forEach(dx => { this.swag(0.46, 0.09, sat, x0 + dx, 0.82, z + 0.55); this.swag(0.4, 0.05, this.M(0xffffff, 0.4), x0 + dx, 0.74, z + 0.6); });
        this.box(0.86, 1.16, 0.05, this.M(0xd9dde4, 0.3, 0.8), x0, 1.42, z - 0.2); this.box(0.74, 1.04, 0.06, this.M(0xfdfdfb, 0.8), x0, 1.42, z - 0.19);
        [-1.05, 1.05].forEach(dx => { this.cyl(0.1, 0.12, 0.2, this.M(0xf1ece2, 0.7), x0 + dx, 0.92, z + 0.1, 10); this.ball(0.14, this.M(0xf1ece2, 0.7), x0 + dx, 1.14, z + 0.1, 1.15); this.blob(x0 + dx * 0.6, 0.98, z + 0.15, 0.26, 0.16, 0.22, 16, fl); });
        [-1.25, -0.8, -0.45, 0.45, 0.8, 1.25].forEach((dx, i) => { this.CA.push(x0 + dx, 0.82, z - 0.15, 0.45 + (i % 2) * 0.2); this.G.push(x0 + dx, 1.36 + (i % 2) * 0.2, z - 0.15); });
        [-1.9, -2.1].forEach((dx, i) => this.candle(x0 + dx, 0, z + 0.4 + i * 0.3, 0.7 + i * 0.4));
      } else if (kind === 'balloon') {
        const x0 = 3.7, cream = this.M(0xefe7d6, 0.8), R = this.R, cols = [this.M(0x6f8f72, 0.4), this.M(0x87a58a, 0.4), this.M(0xe8dfcc, 0.45), this.M(0x4f6f55, 0.4), this.M(0xc9a45c, 0.3, 0.7)];
        this.box(2.1, 2.3, 0.12, cream, x0, 1.15, z); const top = this.cyl(1.05, 1.05, 0.12, cream, x0, 2.3, z, 28); top.rotation.x = Math.PI / 2; this.soft(x0, z + 0.4, 4, 2.4);
        for (let k = 0; k < 46; k++) { const t = k / 45, a = 2.5 - t * 3.3, r = 1.25 + (R() - 0.5) * 0.5, big = R() < 0.25; this.ball(big ? 0.34 + R() * 0.14 : 0.13 + R() * 0.12, cols[(R() * (big ? 4 : 5)) | 0], x0 - 0.1 + Math.cos(a) * r * (t > 0.6 ? 1 : 1.05), Math.max(0.3, 2.2 + Math.sin(a) * r * 1.25 - (t > 0.7 ? (t - 0.7) * 2.2 : 0)), z + 0.25 + R() * 0.35, 1.08); }
        this.cyl(0.32, 0.32, 1.0, cream, x0 + 0.5, 0.5, z + 0.8, 20); this.cyl(0.2, 0.2, 0.3, this.M(0xffffff, 0.6), x0 + 0.5, 1.15, z + 0.8, 20);
        [[-0.9, 0.5], [-1.3, 0.38]].forEach(q => { this.cyl(0.18, 0.2, q[1], this.M(0xc79a5a, 0.8), x0 + q[0], q[1] / 2, z + 0.9, 10); this.G.push(x0 + q[0], q[1] * 0.6, z + 0.9); });
      } else if (kind === 'arches') {
        const arc = this.track(new T.TorusGeometry(2.3, 0.08, 6, 30, Math.PI));
        for (let k = 0; k < 5; k++) { const zz = 16.5 + k * 2.1; this.add(arc, mt, 0, 2.5, zz); [-2.3, 2.3].forEach(x => { this.cyl(0.08, 0.08, 2.5, mt, x, 1.25, zz, 8); for (let y = 0.3; y < 2.5; y += 0.34) this.blob(x, y, zz, 0.34, 0.3, 0.34, 7, fl); this.candle(x * 0.8, 0, zz + 0.9, 0.25); });
          for (let a = 0; a <= Math.PI; a += 0.11) this.blob(Math.cos(a) * 2.3, 2.5 + Math.sin(a) * 2.3, zz, 0.36, 0.36, 0.36, 8, fl); }
      } else {
        const arc = this.track(new T.TorusGeometry(2.2, 0.035, 6, 36, Math.PI));
        for (let k = 0; k < 6; k++) { const zz = 16.4 + k * 1.7; this.add(arc, mt, 0, 2.2, zz); [-2.2, 2.2].forEach(x => { this.cyl(0.035, 0.035, 2.2, mt, x, 1.1, zz, 6); for (let y = 0.2; y < 2.2; y += 0.2) this.G.push(x, y, zz); }); for (let a = 0.06; a < 3.1; a += 0.09) this.G.push(Math.cos(a) * 2.2, 2.2 + Math.sin(a) * 2.2, zz); }
      }
    }
    effects(fx) {
      const R = rng(21), P = this.P;
      if (fx.petals) {
        const n = 320, p = new Float32Array(n * 3), v = new Float32Array(n * 2); for (let i = 0; i < n; i++) { p[i * 3] = (R() - 0.5) * 26; p[i * 3 + 1] = R() * 9; p[i * 3 + 2] = -14 + R() * 30; v[i * 2] = 0.5 + R() * 0.7; v[i * 2 + 1] = R() * 6.28; }
        const g = this.track(new T.BufferGeometry()); g.setAttribute('position', new T.BufferAttribute(p, 3));
        const tex = this.track(canvasTex(32, 32, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(16, 16, 12, 7, 0.6, 0, 7); c.fill(); }));
        const m = this.track(new T.PointsMaterial({ map: tex, color: col(hexInt(P.flowers[P.flowers.length > 3 ? 3 : 0])), size: 0.2, transparent: true, alphaTest: 0.3, depthWrite: false })); const pts = new T.Points(g, m); pts.frustumCulled = false; this.cur.add(pts); this.fx.petals = { g: g, p: p, v: v, n: n };
      }
      if (fx.sparks) {
        const em = [[-4.9, -9.9], [4.9, -9.9], [-3.3, -9.7], [3.3, -9.7]], n = 520, p = new Float32Array(n * 3), s = []; for (let i = 0; i < n; i++) { s.push({ e: i % 4, life: R() * 1.2, vy: 0, vx: 0, vz: 0 }); p[i * 3 + 1] = -5; }
        const g = this.track(new T.BufferGeometry()); g.setAttribute('position', new T.BufferAttribute(p, 3));
        const m = this.track(new T.PointsMaterial({ map: this.glowTex, color: 0xfff1cf, size: 0.2, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); const pts = new T.Points(g, m); pts.frustumCulled = false; this.cur.add(pts); this.fx.sparks = { g: g, p: p, s: s, em: em, R: R };
        em.forEach(e => this.box(0.3, 0.22, 0.3, this.M(0x1c1a18, 0.5, 0.5), e[0], 0.11, e[1]));
      }
      if (fx.beams) {
        const geo = this.track(new T.ConeGeometry(1.5, 17, 20, 1, true)); geo.translate(0, -8.5, 0); this.fx.beams = [];
        [[-9.5, -11], [9.5, -11], [-9.5, 1], [9.5, 1], [-9.5, 12], [9.5, 12]].forEach((q, i) => { const m = new T.Mesh(geo, this.track(new T.MeshBasicMaterial({ color: col(i % 2 ? 0xffffff : hexInt(P.sw[0])), transparent: true, opacity: 0.06, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }))); m.position.set(q[0], 8.5, q[1]); this.cur.add(m); this.fx.beams.push(m); this.box(0.35, 0.4, 0.35, this.M(0x1c1a18, 0.5, 0.5), q[0], 8.5, q[1]); });
      }
    }
    ceiling(kind) {
      const R = this.R, outdoor = this.venue === 'fort' || this.venue === 'farm';
      if (outdoor && kind !== 'sky') {
        const tr = this.M(0x2a2622, 0.5, 0.6);
        [-13, 1, 15].forEach(z => { [-11.5, 11.5].forEach(x => this.cyl(0.12, 0.12, 8.6, tr, x, 4.3, z, 8)); this.box(23.2, 0.18, 0.18, tr, 0, 8.6, z); });
        [-11.5, 11.5].forEach(x => this.box(0.18, 0.18, 28.2, tr, x, 8.6, 1));
      }
      if (kind === 'fairy') {
        for (let z = -12.5; z <= 14.6; z += 1.35) [-1, 1].forEach(s => { for (let k = 0; k <= 30; k++) { const t = k / 30; this.G.push(s * 11.2 * t, 8.5 - 1.5 * t - 0.9 * Math.sin(Math.PI * t), z + (R() - 0.5) * 0.1); } });
      } else if (kind === 'wisteria') {
        const keep = 0.5 + 0.5 * this.d, wc = WI.concat([this.fl[0]]);
        for (let x = -10.4; x <= 10.4; x += 1.3) for (let z = -12; z <= 14; z += 1.3) {
          if (R() > keep) continue; const len = 0.7 + R() * 1.9, ox = (R() - 0.5) * 0.8, oz = (R() - 0.5) * 0.8;
          this.Lf.push(x + ox, 8.4, z + oz, 0.2);
          for (let y = 0; y < len; y += 0.17) this.H.push(x + ox + (R() - 0.5) * 0.12, 8.3 - y, z + oz + (R() - 0.5) * 0.12, L(0.13, 0.05, y / len), wc[(R() * wc.length) | 0]);
        }
      } else if (kind === 'drapes') {
        let i = 0; const cA = hexInt(this.P.linen), cB = hexInt(this.P.sw[1]);
        for (let z = -12.5; z <= 14.6; z += 1.5, i++) {
          const g = this.track(new T.PlaneGeometry(22.6, 0.85, 30, 1)), p = g.attributes.position;
          for (let k = 0; k < p.count; k++) { const px = p.getX(k), t = Math.abs(px) / 11.3, py = p.getY(k); p.setXYZ(k, px, 8.5 - 1.5 * t - 0.95 * Math.sin(Math.PI * t) + Math.sin(px * 2.2 + i) * 0.04, py); }
          g.computeVertexNormals(); const m = this.addS(g, this.M(i % 2 ? cB : cA, 0.9, 0, { side: T.DoubleSide, transparent: true, opacity: 0.62, depthWrite: false }), 0, 0, z); m.castShadow = false;
          this.blob(0, 8.3, z, 0.5, 0.3, 0.5, 14, this.fl); if (i % 2 === 0) { this.G.push(-5.6, 6.3, z); this.G.push(5.6, 6.3, z); this.G.push(0, 7.9, z); }
        }
      } else if (kind === 'ribbons') {
        const cols = this.fl.concat([hexInt(this.P.sw[1])]), pts = []; let zi = 0;
        for (let z = -12.5; z <= 14.5; z += 0.9, zi++) for (let x = -10.6; x <= 10.6; x += 0.2) pts.push(x + (R() - 0.5) * 0.06, z + (R() - 0.5) * 0.25, 0.4 + (zi % 3) * 0.25 + R() * 0.3, cols[Math.abs(zi + Math.round(x * 2)) % cols.length]);
        const n = pts.length / 4, m = new T.InstancedMesh(this.unitBox, this.track(new T.MeshStandardMaterial({ roughness: 0.55, side: T.DoubleSide })), n), d = new T.Object3D(), c = new T.Color();
        for (let i = 0; i < n; i++) { const o = i * 4, len = pts[o + 2]; d.position.set(pts[o], 8.55 - len / 2, pts[o + 1]); d.scale.set(0.16, len, 0.012); d.rotation.set(0, (i % 5) * 0.3, 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); m.setColorAt(i, c.set(pts[o + 3]).convertSRGBToLinear()); }
        m.instanceColor.needsUpdate = true; m.position.y = -8.6; this.sway().add(m);
        [[-4, 0], [3.5, -5], [0.5, 6], [5, 10]].forEach(q => { this.addS(this.sph, this.mirror(), q[0], 6.2, q[1]).scale.setScalar(0.42); this.G.push(q[0], 6.2, q[1]); });
      } else if (kind === 'bulbs') {
        const posts = [[-11.5, -13], [11.5, -13], [-11.5, 1], [11.5, 1], [-11.5, 15], [11.5, 15]], pairs = [[0, 3], [1, 2], [2, 5], [3, 4], [0, 1], [4, 5], [0, 5], [1, 4]], pole = this.M(0x1c1a18, 0.6), lp = [];
        if (!outdoor) posts.forEach(q => this.cyl(0.05, 0.05, 8.2, pole, q[0], 4.1, q[1], 6));
        pairs.forEach(pr => { const a = posts[pr[0]], b = posts[pr[1]], len = Math.hypot(a[0] - b[0], a[1] - b[1]), n = Math.round(len / 0.75); let px = null; for (let k = 0; k <= n; k++) { const t = k / n, x = L(a[0], b[0], t), z = L(a[1], b[1], t), y = 8.3 - Math.sin(Math.PI * t) * (1 + len * 0.045); if (px) lp.push(px[0], px[1], px[2], x, y, z); px = [x, y, z]; if (k && k < n) { this.G.push(x, y - 0.14, z); this.G.push(x, y - 0.14, z); } } });
        const g = this.track(new T.BufferGeometry()); g.setAttribute('position', new T.Float32BufferAttribute(lp, 3)); this.cur.add(new T.LineSegments(g, this.track(new T.LineBasicMaterial({ color: 0x15130f }))));
      } else if (kind === 'gota') {
        const keep = 0.5 + 0.5 * this.d, gc = [0xd4a73c, 0xf0c75e, 0xb8891f, 0xffd76a];
        for (let x = -10.4; x <= 10.4; x += 0.95) for (let z = -12; z <= 14; z += 0.95) { if (R() > keep) continue; const len = 0.8 + R() * 1.5, ox = x + (R() - 0.5) * 0.6, oz = z + (R() - 0.5) * 0.6; for (let y = 0; y < len; y += 0.13) this.H.push(ox, 8.45 - y, oz, ((y / 0.13) | 0) % 2 ? 0.05 : 0.028, gc[(R() * 4) | 0]); if (R() < 0.3) this.G.push(ox, 8.3 - len * R(), oz); }
      } else if (kind === 'lanterns') {
        const mt = this.metal(), warm = this.track(new T.MeshBasicMaterial({ color: col(0xffd38a) })), cord = this.M(0x2a2622, 0.8);
        const cg = this.track(new T.CylinderGeometry(0.008, 0.008, 1, 4)), top = this.track(new T.ConeGeometry(0.24, 0.16, 4));
        for (let x = -9; x <= 9; x += 3) for (let z = -11; z <= 13; z += 3) {
          const ox = x + (R() - 0.5) * 1.6, oz = z + (R() - 0.5) * 1.6, len = (oz < -6 ? 0.5 : 0.7) + R() * (oz < -6 ? 0.8 : 1.7), y = 8.55 - len, s = 0.55 + R() * 0.4;
          const c = this.addS(cg, cord, ox, 8.55 - len / 2, oz); c.scale.y = len; c.castShadow = false;
          const b = this.addS(this.unitBox, mt, ox, y - 0.24 * s, oz); b.scale.set(0.32 * s, 0.46 * s, 0.32 * s);
          const w = this.addS(this.unitBox, warm, ox, y - 0.24 * s, oz); w.scale.set(0.335 * s, 0.3 * s, 0.2 * s); w.castShadow = false; const w2 = this.addS(this.unitBox, warm, ox, y - 0.24 * s, oz); w2.scale.set(0.2 * s, 0.3 * s, 0.335 * s); w2.castShadow = false;
          const t = this.addS(top, mt, ox, y + 0.06 * s, oz); t.rotation.y = Math.PI / 4; t.scale.setScalar(s); this.G.push(ox, y - 0.24 * s, oz);
        }
      } else if (kind === 'chandeliers') {
        const mt = this.metal();
        const chand = (x, y, z, s) => {
          [[1, 0], [0.62, -0.45], [0.36, 0.42]].forEach(q => { const t = this.add(this.track(new T.TorusGeometry(q[0] * s, 0.035 * s, 6, 28)), mt, x, y + q[1] * s, z); t.rotation.x = Math.PI / 2; });
          this.cyl(0.02, 0.02, 8.9 - y, mt, x, (8.9 + y) / 2, z, 6);
          for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; this.G.push(x + Math.cos(a) * s, y + 0.14, z + Math.sin(a) * s); }
          for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; this.G.push(x + Math.cos(a) * 0.62 * s, y - 0.33 * s, z + Math.sin(a) * 0.62 * s); }
          for (let i = 0; i < 26; i++) { const a = R() * 6.283, rr = R() * 0.55 * s; this.G.push(x + Math.cos(a) * rr, y - 0.5 * s - R() * 0.9 * s, z + Math.sin(a) * rr); }
        };
        chand(0, 6.9, 2, 1.25); chand(-6.5, 7.3, -5, 0.8); chand(6.5, 7.3, -5, 0.8); chand(-6.5, 7.3, 9.5, 0.8); chand(6.5, 7.3, 9.5, 0.8);
      }
    }
    seating(kind, guests) {
      const P = this.P, fl = this.fl, lk = this.el.linen, linen = this.M(lk === 'ivory' ? 0xf6f1e6 : lk === 'deep' ? hexInt(P.deep) : lk === 'black' ? 0x17140f : hexInt(P.linen), 0.9), mt = this.metal(), ce = this.el.centre;
      const T_ = Math.ceil(guests / SEATS[kind].per);
      if (kind === 'round') {
        const cloth = this.track(new T.CylinderGeometry(0.92, 1.03, 0.76, 20)), spots = [];
        [-4.1, -0.2, 3.7, 7.6, 11.5].forEach(z => [5.4, 9.3, 13.2].forEach(x => { spots.push([-x, z]); spots.push([x, z]); }));
        spots.slice(0, Math.min(T_, 30)).forEach(p => {
          const x = p[0], z = p[1]; this.add(cloth, linen, x, 0.38, z); this.soft(x, z, 4.4, 4.4);
          for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; this.CH.push(x + 1.42 * Math.cos(a), z + 1.42 * Math.sin(a), Math.atan2(-Math.cos(a), -Math.sin(a))); }
          if (ce === 'tall') { this.cyl(0.03, 0.05, 1.1, mt, x, 1.31, z, 8); this.blob(x, 2.1, z, 0.42, 0.36, 0.42, 26, fl); }
          else if (ce === 'low') this.blob(x, 0.95, z, 0.32, 0.17, 0.32, 34, fl);
          else if (ce === 'busts') { const bm = this.M(0xefe6d6, 0.7); this.cyl(0.11, 0.14, 0.22, bm, x, 0.87, z, 10); this.ball(0.14, bm, x, 1.1, z, 1.15); this.blob(x, 0.9, z, 0.42, 0.13, 0.42, 30, fl); for (let a = 0; a < 6.2; a += 0.3) this.flower(x + Math.cos(a) * 0.15, 0.99, z + Math.sin(a) * 0.15, 0.025, 0xffffff); [[0.4, 0.1], [-0.35, 0.25]].forEach(q => { this.CA.push(x + q[0], 0.76, z + q[1], 0.42); this.G.push(x + q[0], 1.26, z + q[1]); }); }
          else if (ce === 'candelabra') { this.cyl(0.03, 0.07, 0.75, mt, x, 1.14, z, 8); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; this.CA.push(x + 0.17 * Math.cos(a), 1.5, z + 0.17 * Math.sin(a), 0.18); this.G.push(x + 0.17 * Math.cos(a), 1.76, z + 0.17 * Math.sin(a)); } }
          for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.5; this.candle(x + 0.4 * Math.cos(a), 0.76, z + 0.4 * Math.sin(a), 0.2); }
        });
      } else if (kind === 'daybed') {
        const wood = this.M(0xe9e4d8, 0.85), mat = this.M(0xf6f2e8, 0.9), tap = this.M(hexInt(P.deep), 0.95), spots = [];
        [-4.6, -2, 0.6, 3.2, 5.8, 8.4, 11].forEach(z => [4.4, 6.9, 9.4, 11.9].forEach(x => { spots.push([-x, z]); spots.push([x, z]); }));
        const bol = this.track(new T.CylinderGeometry(0.19, 0.19, 1.9, 12)); bol.rotateZ(Math.PI / 2);
        spots.slice(0, Math.min(T_, 56)).forEach(p => { const x = p[0], z = p[1]; this.soft(x, z, 3, 1.9); this.box(2.05, 0.34, 0.9, wood, x, 0.17, z); this.box(1.95, 0.16, 0.82, mat, x, 0.42, z); this.add(bol, mat, x, 0.66, z + 0.3); [-1, 1].forEach(sd => this.box(0.07, 0.62, 0.07, wood, x + sd * 1.0, 0.31, z + 0.42)); this.box(0.6, 0.3, 0.5, tap, x, 0.15, z - 0.95); });
      } else if (kind === 'majlis') {
        const spots = [], deep = this.M(hexInt(P.deep), 0.96), rug = this.M(hexInt(P.sw[2]), 0.97);
        [-4.1, -0.2, 3.7, 7.6, 11.5].forEach(z => [5.6, 9.5, 13.4].forEach(x => { spots.push([-x, z]); spots.push([x, z]); }));
        spots.slice(0, Math.min(T_, 30)).forEach(p => {
          const x = p[0], z = p[1]; this.soft(x, z, 4.6, 4.6); this.plane(3.3, 3.3, rug, x, 0.012, z); this.box(1.15, 0.3, 1.15, mt, x, 0.15, z); this.blob(x, 0.5, z, 0.36, 0.15, 0.36, 26, fl);
          for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, dx = Math.cos(a), dz = Math.sin(a), w = k % 2 ? 0.6 : 1.7, dp = k % 2 ? 1.7 : 0.6; this.box(k % 2 ? 1.7 : 0.6, 0.32, k % 2 ? 0.6 : 1.7, deep, x + dx * 1.22, 0.16, z + dz * 1.22); this.box(k % 2 ? 1.7 : 0.16, 0.44, k % 2 ? 0.16 : 1.7, deep, x + dx * 1.46, 0.5, z + dz * 1.46); void w; void dp; }
          this.candle(x + 0.3, 0.3, z + 0.3, 0.2); this.candle(x - 0.32, 0.3, z - 0.2, 0.28);
        });
      } else {
        const spots = []; [-3.4, 3.6, 10.6].forEach(z => [5.8, 10.6].forEach(x => { spots.push([-x, z]); spots.push([x, z]); }));
        const deep = this.M(hexInt(P.deep), 0.96);
        spots.slice(0, Math.min(T_, 12)).forEach(p => {
          const x = p[0], z = p[1], out = x < 0 ? -1 : 1; this.soft(x, z, 3.6, 8.4);
          if (kind === 'mirror') { this.box(1.1, 0.06, 6, this.mirror(), x, 0.76, z); [[-0.45, -2.8], [0.45, -2.8], [-0.45, 2.8], [0.45, 2.8], [-0.45, 0], [0.45, 0]].forEach(q => this.box(0.08, 0.73, 0.08, mt, x + q[0], 0.365, z + q[1])); }
          else { this.box(1.1, 0.06, 6, linen, x, 0.76, z); this.box(1.06, 0.73, 5.96, linen, x, 0.365, z); }
          for (let i = 0; i < 9; i++) { const zz = z + (i - 4) * 0.64; this.CH.push(x - out * 0.88, zz, out * Math.PI / 2); if (kind === 'mirror') this.CH.push(x + out * 0.88, zz, -out * Math.PI / 2); }
          if (kind === 'mirror') { this.CH.push(x, z + 3.4, Math.PI); this.CH.push(x, z - 3.4, 0); }
          else { this.box(0.7, 0.45, 5.8, deep, x + out * 0.98, 0.225, z); this.box(0.18, 0.6, 5.8, deep, x + out * 1.28, 0.72, z); }
          if (ce === 'busts') { const bm = this.M(0xefe6d6, 0.7); [-2.2, 0, 2.2].forEach(dz => { this.cyl(0.11, 0.14, 0.24, bm, x, 0.9, z + dz, 10); this.ball(0.15, bm, x, 1.15, z + dz, 1.15); for (let a = 0; a < 6.2; a += 0.3) this.flower(x + Math.cos(a) * 0.16, 1.03, z + dz + Math.sin(a) * 0.16, 0.025, 0xffffff); }); for (let k = -5; k <= 5; k++) this.blob(x, 0.93, z + k * 0.52, 0.24, 0.14, 0.28, 6, fl); [-2.8, -1.1, 1.1, 2.8].forEach(dz => { this.CA.push(x, 0.79, z + dz, 0.45); this.G.push(x, 1.32, z + dz); }); }
          if (ce === 'tall' || ce === 'low') for (let k = -5; k <= 5; k++) this.blob(x, 0.93, z + k * 0.52, 0.22, ce === 'tall' ? 0.2 : 0.13, 0.28, ce === 'tall' ? 7 : 5, fl);
          [-2, 0, 2].forEach(dz => {
            if (ce === 'none' || ce === 'busts') return; if (kind === 'mirror' || ce === 'candelabra') { this.cyl(0.03, 0.07, 0.7, mt, x, 1.14, z + dz, 8); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; this.candle(x + 0.16 * Math.cos(a), 1.45, z + dz + 0.16 * Math.sin(a), 0.16); } }
            else { this.candle(x - 0.2, 0.79, z + dz + 0.3, 0.34); this.candle(x + 0.2, 0.79, z + dz - 0.3, 0.26); }
          });
        });
      }
    }

    finalize(grp) {
      const dummy = new T.Object3D(), c = new T.Color(), inst = (geo, mat, n) => { const m = new T.InstancedMesh(geo, mat, n); m.castShadow = true; m.receiveShadow = true; grp.add(m); return m; };
      if (this.H.length) { const n = this.H.length / 5, m = new T.InstancedMesh(this.ico, this.track(new T.MeshStandardMaterial({ roughness: 0.78 })), n); m.castShadow = true; m.position.y = -8.6; this.sway().add(m); for (let i = 0; i < n; i++) { const o = i * 5; dummy.position.set(this.H[o], this.H[o + 1], this.H[o + 2]); dummy.scale.setScalar(this.H[o + 3]); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, c.set(this.H[o + 4]).convertSRGBToLinear()); } m.instanceColor.needsUpdate = true; }
      let n = this.F.length / 5;
      if (n) {
        const m = inst(this.ico, this.track(new T.MeshStandardMaterial({ roughness: 0.78 })), n);
        for (let i = 0; i < n; i++) { const o = i * 5; dummy.position.set(this.F[o], this.F[o + 1], this.F[o + 2]); dummy.scale.setScalar(this.F[o + 3]); dummy.rotation.set(o, o * 1.3, 0); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, c.set(this.F[o + 4]).convertSRGBToLinear().multiplyScalar(0.8 + ((i * 7919) % 100) / 300)); }
        m.instanceColor.needsUpdate = true;
      }
      if (this.SB.length) { const k = this.SB.length / 4, m = new T.InstancedMesh(this.flat, this.track(new T.MeshBasicMaterial({ map: this.blobTex, transparent: true, depthWrite: false, opacity: 0.8 })), k); m.renderOrder = 1; grp.add(m); for (let i = 0; i < k; i++) { const o = i * 4; dummy.position.set(this.SB[o], 0.062, this.SB[o + 1]); dummy.rotation.set(0, 0, 0); dummy.scale.set(this.SB[o + 2], 1, this.SB[o + 3]); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); } }
      n = this.Lf.length / 4;
      if (n) {
        const m = inst(this.ico, this.track(new T.MeshStandardMaterial({ roughness: 0.9 })), n);
        for (let i = 0; i < n; i++) { const o = i * 4; dummy.position.set(this.Lf[o], this.Lf[o + 1], this.Lf[o + 2]); dummy.scale.set(this.Lf[o + 3], this.Lf[o + 3] * 0.6, this.Lf[o + 3]); dummy.rotation.set(o, o * 0.7, o * 0.3); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, c.set(GREENS[i % 4]).convertSRGBToLinear()); }
        m.instanceColor.needsUpdate = true;
      }
      dummy.rotation.set(0, 0, 0);
      n = this.CA.length / 4;
      if (n) {
        const m = inst(this.candleGeo, this.track(new T.MeshStandardMaterial({ color: col(0xfff6e2), roughness: 0.6, emissive: col(0x6b4a1e) })), n);
        for (let i = 0; i < n; i++) { const o = i * 4, h = this.CA[o + 3]; dummy.position.set(this.CA[o], this.CA[o + 1] + h / 2, this.CA[o + 2]); dummy.scale.set(1, h, 1); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }
      }
      n = this.CH.length / 3;
      if (n) {
        const ck = this.el.chairs, cm = ck === 'silver' ? this.M(0xd9dde4, 0.28, 0.85) : ck === 'ghost' ? this.track(new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transparent: true, opacity: 0.32, clearcoat: 1 })) : ck === 'velvet' ? this.M(hexInt(this.P.deep), 0.95) : ck === 'white' ? this.M(0xf4f1ea, 0.6) : ck === 'bentwood' ? this.M(0x141312, 0.45) : this.M(0xc9a45c, 0.32, 0.8);
        const m = inst(this.unitBox, cm, n * 4), parts = [[0, 0.46, 0, 0.42, 0.06, 0.42], [0, 0.76, -0.19, 0.42, 0.5, 0.04], [0, 0.22, 0.19, 0.4, 0.44, 0.03], [0, 0.22, -0.19, 0.4, 0.44, 0.03]];
        for (let i = 0; i < n; i++) {
          const o = i * 3, x = this.CH[o], z = this.CH[o + 1], r = this.CH[o + 2], sn = Math.sin(r), cs = Math.cos(r);
          parts.forEach((p, k) => { dummy.position.set(x + p[2] * sn, p[1], z + p[2] * cs); dummy.rotation.set(0, r, 0); dummy.scale.set(p[3], p[4], p[5]); dummy.updateMatrix(); m.setMatrixAt(i * 4 + k, dummy.matrix); });
        }
      }
      if (this.G.length) {
        const B = [[], [], []]; for (let i = 0; i < this.G.length; i += 3) B[(i / 3) % 3].push(this.G[i], this.G[i + 1], this.G[i + 2]);
        B.forEach((arr, k) => { if (!arr.length) return; const g = this.track(new T.BufferGeometry()); g.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
          const m = this.track(new T.PointsMaterial({ map: this.glowTex, size: 0.42, transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true })); grp.add(new T.Points(g, m)); this.glowMats.push({ m: m, ph: k * 2.1 + this.glowMats.length }); });
      }
    }

    light(t) {
      const i = t < 0.5 ? 0 : 1, f = t < 0.5 ? t * 2 : (t - 0.5) * 2, A = KEYS[i], B = KEYS[i + 1];
      const mix = (a, b) => new T.Color(a).lerp(new T.Color(b), f);
      const room = this.venue === 'ballroom', photo = this.venue === 'photo' || this.venue === 'street';
      const top = room ? new T.Color(0x0f0c0a) : mix(A.top, B.top), bot = room ? new T.Color(0x2a211b) : mix(A.bot, B.bot);
      if (this.bgTex) this.bgTex.dispose();
      this.bgTex = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#' + top.getHexString()); gr.addColorStop(0.62, '#' + bot.getHexString()); gr.addColorStop(1, '#' + bot.getHexString()); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      this.scene.background = photo ? null : this.bgTex;
      const hi = L(A.hi, B.hi, f), si = L(A.si, B.si, f), warm = L(A.warm, B.warm, f);
      this.hemi.color.copy(mix(A.hemi, B.hemi)); this.hemi.groundColor.copy(mix(A.hg, B.hg)); this.hemi.intensity = room ? L(0.75, 0.3, t) : hi;
      this.sun.color.copy(mix(A.sun, B.sun)); this.sun.intensity = room ? L(0.5, 0.12, t) : si; this.sun.position.set(-18, L(A.sy, B.sy, f), 8);
      const c = this.cfg || { on: {} }, lit = c.on.ceiling && (c.ceiling === 'fairy' || c.ceiling === 'chandeliers') && !c.empty;
      this.stageLight.intensity = c.empty ? 0 : warm * (this.fxOn ? 0.6 : 1.15); this.roomLight.intensity = c.empty ? (room ? 0.5 : 0) : warm * (lit ? 1.15 : 0.5);
      this.glowBase = { op: L(0.6, 1, t), size: L(0.34, 0.5, t) }; this.glowMats.forEach(o => { o.m.opacity = this.glowBase.op; o.m.size = this.glowBase.size; });
      if (this.fx.beams) this.fx.beams.forEach(b => { b.material.opacity = 0.015 + 0.075 * Math.max(0, t - 0.25); });
      this.r.toneMappingExposure = L(1.05, 0.98, t); if (this.final) this.final.uniforms.exposure.value = L(1.05, 0.98, t); if (this.bloom) this.bloom.strength = L(0.28, 0.5, t);
      this.scene.fog = photo ? null : new T.FogExp2(bot.clone().convertSRGBToLinear().getHex(), room ? 0.004 : 0.0075);
      if (this.stars) { this.scene.remove(this.stars); this.stars.geometry.dispose(); this.stars.material.dispose(); this.stars = null; }
      if (!room && !photo && t > 0.4) {
        const R = rng(3), p = []; for (let k = 0; k < 420; k++) { const a = R() * 6.283, e = 0.12 + R() * 1.3; p.push(Math.cos(a) * Math.cos(e) * 220, Math.sin(e) * 220, Math.sin(a) * Math.cos(e) * 220); }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(p, 3));
        this.stars = new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false, transparent: true, opacity: (t - 0.4) / 0.6 })); this.scene.add(this.stars);
      }
      /* reflections for mirror, acrylic and metal */
      const es = new T.Scene(), sm = new T.MeshBasicMaterial({ map: this.bgTex, side: T.BackSide }), sg = new T.SphereGeometry(50, 16, 12);
      es.add(new T.Mesh(sg, sm)); const pm = new T.MeshBasicMaterial({ color: new T.Color(0xffd9a0).multiplyScalar(0.5 + warm) }), pg = new T.PlaneGeometry(26, 26), pl = new T.Mesh(pg, pm); pl.position.y = 30; pl.rotation.x = Math.PI / 2; es.add(pl);
      const rt = this.pmrem.fromScene(es, 0.04); if (this.envRT) this.envRT.dispose(); this.envRT = rt; this.scene.environment = rt.texture;
      sm.dispose(); sg.dispose(); pm.dispose(); pg.dispose();
    }

    /* ---------- camera ---------- */
    setView(name, instant) {
      const v = VIEWS[name] || VIEWS.wide; this.locked = false; this.cam.fov = 42;
      if (instant || !this.running) { this.goal = null; this.orbit.theta = v.theta; this.orbit.phi = v.phi; this.orbit.rad = v.rad; this.orbit.target.set(v.t[0], v.t[1], v.t[2]); } else this.goal = { theta: v.theta, phi: v.phi, rad: v.rad, t: new T.Vector3(v.t[0], v.t[1], v.t[2]) };
      this.updateCam();
    }
    walk() { if (this.venue === 'street' || this.locked) return false; this.goal = null; this.walkT = 0; return true; }
    setStreet(pov, sv) { this.sv = Object.assign({}, sv, pov); this.updateCam(); }
    start() {
      if (this.running) return; this.running = true; let last = performance.now();
      const loop = now => { if (!this.running) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; this.t += dt; this.tick(this.t, dt); this.render(); this.raf = requestAnimationFrame(loop); };
      this.raf = requestAnimationFrame(loop);
    }
    stop() { this.running = false; cancelAnimationFrame(this.raf); }
    tick(t, dt) {
      this.glowMats.forEach((o, i) => { o.m.opacity = this.glowBase.op * (0.74 + 0.26 * Math.sin(t * (1.9 + (i % 3) * 0.8) + o.ph)); });
      this.swayers.forEach((g, i) => { g.rotation.z = Math.sin(t * 0.55 + i) * 0.013; g.rotation.x = Math.sin(t * 0.41 + i * 2) * 0.01; });
      for (let i = this.anim.length - 1; i >= 0; i--) { const a = this.anim[i], k = Math.min(1, (t - a.t0) / 0.85), e = 1 - Math.pow(1 - k, 3); a.g.position.y = a.from * (1 - e); a.g.scale.setScalar(0.965 + 0.035 * e); if (k >= 1) this.anim.splice(i, 1); }
      const f = this.fx;
      if (f.petals) { const p = f.petals.p, v = f.petals.v; for (let i = 0; i < f.petals.n; i++) { p[i * 3 + 1] -= v[i * 2] * dt; p[i * 3] += Math.sin(t * 0.9 + v[i * 2 + 1]) * 0.35 * dt; p[i * 3 + 2] += Math.cos(t * 0.7 + v[i * 2 + 1]) * 0.2 * dt; if (p[i * 3 + 1] < 0.03) p[i * 3 + 1] = 8.5 + Math.random(); } f.petals.g.attributes.position.needsUpdate = true; }
      if (f.sparks) { const p = f.sparks.p, s = f.sparks.s, em = f.sparks.em; for (let i = 0; i < s.length; i++) { const q = s[i]; q.life -= dt; if (q.life <= 0) { const e = em[q.e]; p[i * 3] = e[0]; p[i * 3 + 1] = 0.25; p[i * 3 + 2] = e[1]; q.vy = 6.5 + Math.random() * 3.5; q.vx = (Math.random() - 0.5) * 1.1; q.vz = (Math.random() - 0.5) * 1.1; q.life = 0.7 + Math.random() * 0.7; } else { q.vy -= 9.5 * dt; p[i * 3] += q.vx * dt; p[i * 3 + 1] += q.vy * dt; p[i * 3 + 2] += q.vz * dt; } } f.sparks.g.attributes.position.needsUpdate = true; }
      if (f.beams) f.beams.forEach((b, i) => { b.rotation.z = Math.sin(t * 0.5 + i * 1.3) * 0.55 + (b.position.x < 0 ? -0.35 : 0.35); b.rotation.x = Math.cos(t * 0.37 + i * 1.9) * 0.45; });
      if (this.walkT != null) {
        this.walkT += dt; const u = this.walkT / 20, sm = x => x * x * (3 - 2 * x);
        if (u >= 1) { this.walkT = null; this.cam.fov = 42; this.setView('wide'); }
        else { const c = this.cam; c.fov = 60; if (u < 0.72) { const k = sm(u / 0.72); c.position.set(Math.sin(k * 5) * 0.3, 1.7 + Math.sin(k * 40) * 0.02, L(29, -4.5, k)); c.lookAt(Math.sin(k * 3) * 1.5, L(2.2, 3, k), -12); } else { const k = sm((u - 0.72) / 0.28); c.position.set(L(0, 10, k), L(1.7, 6.5, k), L(-4.5, 8, k)); c.lookAt(0, 2.6, L(-12, -8, k)); } c.updateProjectionMatrix(); }
        return;
      }
      if (this.goal) { const o = this.orbit, g = this.goal, k = 1 - Math.exp(-dt * 3.6); o.theta += (g.theta - o.theta) * k; o.phi += (g.phi - o.phi) * k; o.rad += (g.rad - o.rad) * k; o.target.lerp(g.t, k); if (Math.abs(g.theta - o.theta) + Math.abs(g.phi - o.phi) + Math.abs(g.rad - o.rad) * 0.05 < 0.004) this.goal = null; this.updateCam(); }
      else if (!this.locked && this.venue !== 'street' && t - this.lastTouch > 5) { this.orbit.theta += Math.cos(t * 0.16) * 0.0125 * dt; this.updateCam(); }
    }
    updateCam() {
      if (this.venue === 'street' && this.sv) {
        const s = this.sv, hf = 180 / Math.pow(2, s.zoom == null ? 1 : s.zoom) * Math.PI / 180, vf = 2 * Math.atan(Math.tan(Math.min(hf, 3) / 2) / this.cam.aspect);
        this.cam.fov = Math.max(8, Math.min(120, vf * 180 / Math.PI)); this.cam.position.set(0, s.height, s.dist); this.cam.rotation.order = 'YXZ'; this.cam.rotation.set((s.pitch || 0) * Math.PI / 180, -((s.heading || 0) - s.h0) * Math.PI / 180, 0);
        this.root.scale.setScalar(s.scale); this.cam.updateProjectionMatrix(); return;
      }
      this.root.scale.setScalar(1);
      if (this.walkT != null || this.locked) return;
      const o = this.orbit; o.phi = Math.max(0.35, Math.min(1.5, o.phi)); o.rad = Math.max(9, Math.min(46, o.rad)); o.theta = Math.max(-1.25, Math.min(1.25, o.theta));
      let x = o.target.x + o.rad * Math.sin(o.phi) * Math.sin(o.theta), y = o.target.y + o.rad * Math.cos(o.phi), z = o.target.z + o.rad * Math.sin(o.phi) * Math.cos(o.theta);
      if (this.venue === 'fort') x = Math.max(-22, Math.min(22, x));
      this.cam.position.set(x, Math.max(0.6, y), z); this.cam.lookAt(o.target); this.cam.updateProjectionMatrix();
    }
    bind() {
      const el = this.canvas, pts = new Map(); let pinch = 0;
      el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); this.goal = null; this.lastTouch = this.t; if (this.walkT != null) { this.walkT = null; this.cam.fov = 42; this.updateCam(); } });
      el.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId) || this.locked) return; const p = pts.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size === 1) { this.orbit.theta -= dx * 0.006; this.orbit.phi -= dy * 0.005; }
        else if (pts.size === 2) { const a = Array.from(pts.values()), d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch) this.orbit.rad *= pinch / d; pinch = d; }
        this.lastTouch = this.t; this.updateCam(); this.render(); this.onChange();
      });
      const up = e => { pts.delete(e.pointerId); pinch = 0; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      el.addEventListener('wheel', e => { if (this.locked) return; e.preventDefault(); this.goal = null; this.lastTouch = this.t; this.orbit.rad *= 1 + Math.sign(e.deltaY) * 0.07; this.updateCam(); this.render(); this.onChange(); }, { passive: false });
    }
    /* Fit the camera so the décor footprint lands on four floor corners marked on a photo (near-left, near-right, far-right, far-left; x,y in 0..1). */
    solveCamera(q) {
      const world = [[-9, 0, 14], [9, 0, 14], [9, 0, -14], [-9, 0, -14]].map(p => new T.Vector3(p[0], p[1], p[2]));
      const tgt = q.map(p => [p[0] * 2 - 1, 1 - p[1] * 2]), cam = this.cam, v = new T.Vector3(), R = rng(9);
      const err = p => {
        cam.fov = p[5]; cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], 0, p[4]); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
        let e = 0; for (let i = 0; i < 4; i++) { v.copy(world[i]).project(cam); if (v.z > 1) return 1e9; e += (v.x - tgt[i][0]) ** 2 + (v.y - tgt[i][1]) ** 2; } return e;
      };
      let best = [0, 6, 30, 0, -2, 45], be = err(best), step = [6, 4, 8, 5, 6, 10];
      for (let it = 0; it < 5000; it++) {
        const s = Math.max(0.02, 1 - it / 5000), p = best.map((x, i) => x + (R() * 2 - 1) * step[i] * s * (R() < 0.3 ? 1 : 0.25));
        p[1] = Math.max(0.8, Math.min(40, p[1])); p[5] = Math.max(18, Math.min(95, p[5])); p[2] = Math.max(15, p[2]);
        const e = err(p); if (e < be) { be = e; best = p; }
      }
      err(best); this.locked = true; return be;
    }
    resize(w, h) { this.r.setSize(w, h, false); if (this.comp) { this.comp.setPixelRatio(this.r.getPixelRatio()); this.comp.setSize(w, h); } this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); }
    render() { if (this.fxOn && this.comp) { try { if (this.final) this.final.uniforms.grain.value = this.t % 7; this.comp.render(); return; } catch (e) { this.comp = null; this.fxOn = false; this.r.toneMapping = T.ACESFilmicToneMapping; } } this.r.render(this.scene, this.cam); }
    snapshot(type) { this.render(); return this.canvas.toDataURL(type || 'image/jpeg', 0.86); }
  }
  window.Studio3D = Studio3D;
})();
