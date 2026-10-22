const D = window.DATA;
const app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
document.getElementById('ft').textContent = D.book.title;
const ACCENT = {emerald:'', rose:'rose', violet:'violet'};
const setAccent = a => { document.body.classList.remove('rose', 'violet'); if (ACCENT[a]) document.body.classList.add(ACCENT[a]); };
const rgb = () => getComputedStyle(document.body).getPropertyValue('--rgb').trim() || '52,211,153';

/* ================= Efectos visuales: brasas y runas flotantes ================= */
const cv = document.getElementById('fx'), cx = cv.getContext('2d');
let parts = [];
const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
addEventListener('resize', resize); resize();
const ember = (x, y, burst) => ({
  x, y, burst,
  vx: burst ? (Math.random() - .5) * 7 : (Math.random() - .5) * .3,
  vy: burst ? (Math.random() - .8) * 5 : -Math.random() * .55 - .15,
  r: Math.random() * 2 + .6, life: burst ? 60 + Math.random() * 40 : 1, max: 100,
  rune: burst && Math.random() < .38 ? RUNES[Math.random() * RUNES.length | 0] : null, ph: Math.random() * 6
});
for (let i = 0; i < 55; i++) parts.push(ember(Math.random() * innerWidth, Math.random() * innerHeight));
function burst(x, y, n = 45) { for (let i = 0; i < n; i++) parts.push(ember(x, y, true)); }
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  const c = rgb();
  parts = parts.filter(p => !p.burst || p.life > 0);
  for (const p of parts) {
    p.x += p.vx + (p.burst ? 0 : Math.sin(p.ph += .01) * .3); p.y += p.vy;
    if (p.burst) { p.life--; p.vy += .04; p.vx *= .99; }
    else if (p.y < -10) { p.y = cv.height + 10; p.x = Math.random() * cv.width; }
    const a = p.burst ? Math.max(p.life / p.max, 0) : .25 + Math.sin(p.ph) * .15;
    if (p.rune) { cx.font = '20px serif'; cx.fillStyle = `rgba(${c},${a})`; cx.shadowColor = `rgb(${c})`; cx.shadowBlur = 12; cx.fillText(p.rune, p.x, p.y); }
    else { cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fillStyle = `rgba(${c},${a})`; cx.shadowColor = `rgb(${c})`; cx.shadowBlur = 10; cx.fill(); }
  }
  cx.shadowBlur = 0;
  requestAnimationFrame(loop);
}
loop();
const glow = document.getElementById('glow');
addEventListener('mousemove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

/* ================= Motor Musical Místico Evolutivo (4 Movimientos) ================= */
let ac, master, droneOscs = [], filterNode, soundOn = false, melodyTimer = null, moodTimer = null, curMood = 0;
const MOODS = [
  { name: 'I. Brumas de Quicaví', root: 73.42, chords: [[1, 1.2, 1.5], [0.89, 1.12, 1.33]], scale: [293.66, 329.63, 349.23, 440, 493.88, 523.25, 587.33, 659.25], tempo: 2400 },
  { name: 'II. El Galeón y la Gitana', root: 82.41, chords: [[1, 1.2, 1.5], [1.06, 1.33, 1.6]], scale: [329.63, 349.23, 415.30, 440, 493.88, 523.25, 622.25, 659.25], tempo: 2100 },
  { name: 'III. El Canto de las Hadas', root: 65.41, chords: [[1, 1.25, 1.5], [1.12, 1.41, 1.68]], scale: [261.63, 293.66, 329.63, 370.0, 392.0, 440, 493.88, 523.25], tempo: 2600 },
  { name: 'IV. Pasillo de la Eternidad', root: 55.00, chords: [[1, 1.19, 1.5], [0.94, 1.19, 1.41]], scale: [220, 246.94, 261.63, 329.63, 349.23, 415.30, 440, 523.25], tempo: 2800 }
];
let chordIdx = 0;

function updateMoodUI() {
  const m = document.getElementById('snd-mood');
  if (m) m.textContent = soundOn ? MOODS[curMood].name : '';
}

function setMood(idx) {
  curMood = ((idx % MOODS.length) + MOODS.length) % MOODS.length;
  updateMoodUI();
  if (!ac || !soundOn) return;
  const m = MOODS[curMood];
  const ch = m.chords[chordIdx % m.chords.length];
  const now = ac.currentTime;
  droneOscs.forEach((d, i) => {
    const ratio = ch[i % ch.length] * (i >= 3 ? 2 : 1);
    d.osc.frequency.setTargetAtTime(m.root * ratio, now, 2.2);
  });
  if (filterNode) filterNode.frequency.setTargetAtTime(340 + curMood * 70, now, 2.0);
}

function playMysticNote() {
  if (!soundOn || !ac) return;
  const m = MOODS[curMood];
  const now = ac.currentTime;
  const freq = m.scale[Math.floor(Math.random() * m.scale.length)];

  // Arpa celta / kantele
  const osc = ac.createOscillator();
  const sub = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'triangle';
  sub.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  sub.frequency.setValueAtTime(freq * 0.5, now);

  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.075, now + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

  osc.connect(g); sub.connect(g); g.connect(master);
  osc.start(now); sub.start(now);
  osc.stop(now + 3.7); sub.stop(now + 3.7);

  // Flauta de madera lejana ocasional
  if (Math.random() < 0.38) {
    const fl = ac.createOscillator();
    const fg = ac.createGain();
    const delay = 0.7 + Math.random() * 0.8;
    const f2 = m.scale[Math.floor(Math.random() * m.scale.length)] * (Math.random() < 0.3 ? 1 : 0.5);
    fl.type = 'sine';
    fl.frequency.setValueAtTime(f2, now + delay);
    fg.gain.setValueAtTime(0.0001, now + delay);
    fg.gain.linearRampToValueAtTime(0.045, now + delay + 0.6);
    fg.gain.exponentialRampToValueAtTime(0.0001, now + delay + 3.2);
    fl.connect(fg); fg.connect(master);
    fl.start(now + delay); fl.stop(now + delay + 3.3);
  }

  melodyTimer = setTimeout(playMysticNote, m.tempo * (0.65 + Math.random() * 0.8));
}

function startAudio() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  if (!master) {
    master = ac.createGain(); master.gain.value = 0.0; master.connect(ac.destination);
    filterNode = ac.createBiquadFilter(); filterNode.type = 'lowpass'; filterNode.frequency.value = 380; filterNode.connect(master);

    // 4-voice warm cello/choir pad
    [0, 1, 2, 3].forEach(i => {
      const o = ac.createOscillator();
      o.type = i % 2 ? 'sine' : 'sawtooth';
      o.frequency.value = MOODS[0].root * (i + 1);
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.07 + i * 0.03;
      const lfoG = ac.createGain(); lfoG.gain.value = 2.5;
      lfo.connect(lfoG); lfoG.connect(o.frequency);
      const g = ac.createGain(); g.gain.value = i % 2 ? 0.14 : 0.06;
      o.connect(g); g.connect(filterNode);
      o.start(); lfo.start();
      droneOscs.push({ osc: o, gain: g });
    });
  }
  ac.resume();
  master.gain.setTargetAtTime(0.42, ac.currentTime, 1.2);
  setMood(curMood);
  clearTimeout(melodyTimer);
  playMysticNote();
  clearInterval(moodTimer);
  moodTimer = setInterval(() => {
    if (!soundOn) return;
    chordIdx++;
    if (chordIdx % 2 === 0) setMood(curMood + 1);
    else setMood(curMood);
  }, 16000);
}

function rustle() {
  if (!soundOn || !ac) return;
  const len = ac.sampleRate * .42, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
  const s = ac.createBufferSource(); s.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900;
  const g = ac.createGain(); g.gain.value = .16; s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
  const m = MOODS[curMood];
  const o = ac.createOscillator(), og = ac.createGain();
  o.type = 'triangle';
  o.frequency.value = m.scale[Math.floor(Math.random() * m.scale.length)];
  og.gain.setValueAtTime(.05, ac.currentTime);
  og.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + 1.5);
  o.connect(og); og.connect(ac.destination); o.start(); o.stop(ac.currentTime + 1.6);
}

const sndBtn = document.getElementById('snd');
const sndNext = document.getElementById('snd-next');
const sndRainBtn = document.getElementById('snd-rain');
let rainOn = false, rainGain = null, fireTimer = null;

function toggleRainSound() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  ac.resume();
  rainOn = !rainOn;
  if (rainOn) {
    if (!rainGain) {
      rainGain = ac.createGain();
      rainGain.gain.value = 0.001;
      rainGain.connect(ac.destination);
      // 4-second looping pink/brown rain noise buffer
      const len = ac.sampleRate * 4;
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const out = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + w * 0.029;
        b1 = 0.985 * b1 + w * 0.032;
        b2 = 0.950 * b2 + w * 0.048;
        out[i] = (b0 + b1 + b2) * 0.35;
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1150;
      src.connect(lp);
      lp.connect(rainGain);
      src.start();
    }
    rainGain.gain.setTargetAtTime(0.22, ac.currentTime, 0.8);
    clearInterval(fireTimer);
    fireTimer = setInterval(() => {
      if (!rainOn || !ac) return;
      // Subtle hearth fire crackle pop
      const len = Math.floor(ac.sampleRate * 0.035);
      const b = ac.createBuffer(1, len, ac.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.3));
      const s = ac.createBufferSource(); s.buffer = b;
      const hp = ac.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 2600;
      const g = ac.createGain(); g.gain.value = 0.06 + Math.random() * 0.05;
      s.connect(hp); hp.connect(g); g.connect(ac.destination); s.start();
    }, 650);
  } else if (rainGain) {
    rainGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.5);
    clearInterval(fireTimer);
  }
  if (sndRainBtn) {
    sndRainBtn.classList.toggle('on', rainOn);
    sndRainBtn.innerHTML = rainOn ? '🌧🔥 <span class="hide-mob">Lluvia y Fogón: On</span>' : '🌧 <span class="hide-mob">Lluvia: Off</span>';
  }
}
if (sndRainBtn) sndRainBtn.onclick = toggleRainSound;

sndBtn.onclick = () => {
  soundOn = !soundOn;
  if (soundOn) startAudio();
  else {
    if (master) master.gain.setTargetAtTime(0, ac.currentTime, .4);
    clearTimeout(melodyTimer);
  }
  sndBtn.classList.toggle('on', soundOn);
  document.getElementById('snd-txt').textContent = soundOn ? 'Música: On' : 'Música: Off';
  sndNext.style.display = soundOn ? 'inline-block' : 'none';
  updateMoodUI();
};
sndNext.onclick = () => { setMood(curMood + 1); clearTimeout(melodyTimer); playMysticNote(); };

/* ================= Vista Inicio (Portada & Contraportada 3D) ================= */
const home = () => `
<section class="hero">
  <div>
    <div class="eyebrow">ᚱ Trilogía de Fantasía Oscura · Mitología Chilota · Edición Completa y 4 Volúmenes</div>
    <h1>El Sacrificio del <span>Brujo Chilote</span></h1>
    <p class="lead">${esc(D.book.tagline)}. Una obra de <strong>${esc(D.book.author)}</strong>.</p>
    <div class="chips">${D.book.themes.map(t => `<span class="chip">✦ ${esc(t.label)}</span>`).join('')}</div>
    <div class="hero-actions">
      <a class="btn" href="#/leer/trilogia-completa/0">ᚱ Leer y Escuchar Obra Completa</a>
      <a class="btn sec" href="#/oraculo">🔮 Consultar Oráculo Rúnico</a>
      <a class="btn sec" href="#/linajes">🌳 Linajes, Cronología y Glosario</a>
      <a class="btn sec" href="#/descargar">⬇ Descargar (PDF, Word y ePub)</a>
    </div>
  </div>
  <div class="book3d-wrap">
    <div class="book3d" id="book3d" title="Haz clic para girar entre Portada y Contraportada">
      <div class="book3d-spine"></div>
      <div class="book3d-face book3d-front">
        <img src="${esc(D.images.cover)}" alt="Portada El Sacrificio del Brujo Chilote">
      </div>
      <div class="book3d-face book3d-back">
        <img src="${esc(D.images.backCover)}" alt="Contraportada El Sacrificio del Brujo Chilote">
      </div>
    </div>
    <button class="flip-btn" id="flip-cov">↻ Girar Portada / Contraportada</button>
  </div>
</section>

<h2 class="title">Sinopsis de la Saga</h2>
<div class="synopsis-box">
  ${D.book.synopsis.map(p => `<p>${esc(p)}</p>`).join('')}
</div>

<h2 class="title">Edición Completa (Recopilación de los 3 Tomos), Tomos Individuales y Libro del Grimorio</h2>
${booksGrid()}

<h2 class="title">Descarga la Obra Completa, cada Tomo y el Grimorio Expandido (PDF, Word y ePub)</h2>
${downloadCardsHTML()}

<h2 class="title">Plan Maestro de Ilustraciones (${D.scenePlan.length} Escenas Clave)</h2>
<p style="text-align:center;color:var(--muted);max-width:760px;margin:-12px auto 24px">
  Recorre las ${D.scenePlan.length} escenas fundamentales ilustradas para los tres tomos y los largos viajes de Neyküyene. Haz clic en cualquier lámina para ampliarla o ir directamente a su página en el Códice.
</p>
<div class="scenes-grid">
  ${(D.scenePlan || []).slice(0, 6).map(s => renderSceneCard(s)).join('')}
</div>
<div style="text-align:center;margin-top:26px">
  <a class="btn" href="#/escenas">✦ Ver las ${D.scenePlan.length} Escenas Ilustradas de la Obra →</a>
</div>

<h2 class="title">Colección Oficial de Portadas y Contraportadas</h2>
${allCoversGalleryHTML()}`;

function getMasterCompilationBook() {
  const allActs = [];
  D.books.forEach(b => {
    b.acts.forEach(a => {
      allActs.push({
        title: `Tomo ${b.number} (${b.title}) — ${a.title}`,
        chapters: a.chapters
      });
    });
  });
  return {
    id: 'trilogia-completa',
    number: 'I–III + Grimorio',
    title: 'El Sacrificio del Brujo Chilote — Recopilación Completa (Los 3 Tomos + Grimorio y Bestiario)',
    accent: 'emerald',
    coverImage: D.images.cover,
    backCoverImage: D.images.backCover,
    pdfFile: 'El_Sacrificio_del_Brujo_Chilote.pdf',
    docxFile: 'El_Sacrificio_del_Brujo_Chilote.docx',
    epubFile: 'El_Sacrificio_del_Brujo_Chilote.epub',
    description: `Edición Maestra Integral que recopila en un solo gran volumen los Tres Tomos completos (Tomo I: El Amor Eterno, Tomo II: El Sacrificio, Tomo III: Nunca Es Tarde Para Salvar), las ilustraciones de capítulos con los nuevos personajes y eventos de la Mitología de Chiloé, las 16 Runas del Tablón de Quicaví, el Bestiario Ilustrado de ${D.characters.length} entidades, el Atlas de los 16 Grandes Recorridos, los Árboles de Linajes y el Glosario Mitológico.`,
    acts: allActs
  };
}

function findBookById(id) {
  if (id === 'trilogia-completa') return getMasterCompilationBook();
  return D.books.find(x => x.id === id);
}

const booksGrid = () => {
  const G = D.grimorioBook || {};
  const M = getMasterCompilationBook();
  const totalMasterChapters = M.acts.reduce((n, a) => n + a.chapters.length, 0);
  const pageTargets = { 'tomo-1': 305, 'tomo-2': 407, 'tomo-final': 509 };
  return `
  <!-- TARJETA DESTACADA: VERSIÓN LIBRO RECOPILATORIA DE LOS 3 TOMOS + GRIMORIO -->
  <div class="card rise" data-acc="emerald" style="margin-bottom:24px;border:2px solid rgba(212,175,55,0.65);background:linear-gradient(135deg, rgba(16,42,32,0.88), rgba(24,14,18,0.92))">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;padding:18px;align-items:center">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:rgba(0,0,0,0.35);padding:10px;border-radius:8px">
        <a href="#/libro/trilogia-completa" title="Ver Portada Edición Completa">
          <img src="${esc(M.coverImage)}" alt="Portada Edición Completa" style="height:260px;width:100%;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.6)">
        </a>
        <a href="#/libro/trilogia-completa" title="Ver Contraportada Edición Completa">
          <img src="${esc(M.backCoverImage)}" alt="Contraportada Edición Completa" style="height:260px;width:100%;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.6)">
        </a>
      </div>
      <div class="b" style="padding:6px">
        <div class="r" style="font-size:13px;color:#fbbf24">★ EDICIÓN INTEGRAL RECOPILATORIA · LOS 3 TOMOS + GRIMORIO Y BESTIARIO · 1.339 PÁGINAS</div>
        <h3 style="font-size:26px;margin:6px 0 10px"><a href="#/libro/trilogia-completa" style="color:inherit;text-decoration:none">${esc(M.title)}</a></h3>
        <p style="font-size:17px;line-height:1.6">${esc(M.description)}</p>
        <div class="chips" style="margin:12px 0">
          <span class="chip">✦ ${totalMasterChapters} Capítulos Integrales</span>
          <span class="chip">✦ 72 Ilustraciones de Capítulos y Eventos</span>
          <span class="chip">✦ 16 Runas + ${D.characters.length} Entidades + Linajes y Glosario</span>
          <span class="chip">✦ 1.339 Páginas en Pergamino Vectorial</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
          <a class="btn" href="#/libro/trilogia-completa">ᚱ Abrir Obra Completa (${totalMasterChapters} Capítulos)</a>
          <a class="btn sec" href="#/leer/trilogia-completa/0">🔊 Leer / Escuchar Audiolibro</a>
          <a class="btn sec" href="${esc(M.pdfFile)}" download="El Sacrificio del Brujo Chilote - Edicion Completa.pdf">⬇ PDF (1.339 Págs)</a>
          <a class="btn sec" href="${esc(M.docxFile)}" download="El Sacrificio del Brujo Chilote - Edicion Completa.docx">⬇ Word (.docx)</a>
          <a class="btn sec" href="${esc(M.epubFile)}" download="El Sacrificio del Brujo Chilote - Edicion Completa.epub">⬇ ePub (Kindle)</a>
        </div>
      </div>
    </div>
  </div>

  <div class="grid">
  ${D.books.map(b => {
    const chCount = b.acts.reduce((n, a) => n + a.chapters.length, 0);
    const pgTarget = pageTargets[b.id] || 300;
    return `
    <div class="card rise" data-acc="${b.accent}" style="display:flex;flex-direction:column">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px;background:rgba(0,0,0,0.28)">
        <a href="#/libro/${b.id}" title="Ver Portada Tomo ${esc(b.number)}">
          <img src="${esc(b.coverImage)}" alt="Portada ${esc(b.title)}" style="height:230px;width:100%;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
        </a>
        <a href="#/libro/${b.id}" title="Ver Contraportada Tomo ${esc(b.number)}">
          <img src="${esc(b.backCoverImage)}" alt="Contraportada ${esc(b.title)}" style="height:230px;width:100%;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
        </a>
      </div>
      <div class="b" style="display:flex;flex-direction:column;flex:1">
        <div class="r">Tomo ${esc(b.number)} · ${chCount} Capítulos · ${pgTarget} Páginas</div>
        <h3><a href="#/libro/${b.id}" style="color:inherit;text-decoration:none">${esc(b.title)}</a></h3>
        <p style="flex:1">${esc(b.description)}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:14px">
          <a class="btn" style="padding:8px 10px;font-size:11.5px;flex:1;text-align:center" href="#/libro/${b.id}">ᚱ Abrir Tomo ${esc(b.number)}</a>
          <a class="btn sec" style="padding:8px 10px;font-size:11.5px" href="${esc(b.pdfFile)}" download>⬇ PDF</a>
          <a class="btn sec" style="padding:8px 10px;font-size:11.5px" href="${esc(b.docxFile)}" download>⬇ Word</a>
          ${b.epubFile ? `<a class="btn sec" style="padding:8px 10px;font-size:11.5px" href="${esc(b.epubFile)}" download>⬇ ePub</a>` : ''}
        </div>
      </div>
    </div>`;
  }).join('')}
  ${G.title ? `
    <div class="card rise" data-acc="violet" style="display:flex;flex-direction:column">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px;background:rgba(0,0,0,0.28)">
        <a href="#/runas" title="Ver Portada Grimorio">
          <img src="${esc(G.coverImage)}" alt="Portada ${esc(G.title)}" style="height:230px;width:100%;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
        </a>
        <a href="#/runas" title="Ver Contraportada Grimorio">
          <img src="${esc(G.backCoverImage)}" alt="Contraportada ${esc(G.title)}" style="height:230px;width:100%;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
        </a>
      </div>
      <div class="b" style="display:flex;flex-direction:column;flex:1">
        <div class="r">${esc(G.number)} · 165+ Páginas · 16 Runas · ${D.characters.length} Seres · Glosario</div>
        <h3><a href="#/runas" style="color:inherit;text-decoration:none">${esc(G.title)}</a></h3>
        <p style="flex:1">${esc(G.synopsis)}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:14px">
          <a class="btn" style="padding:8px 10px;font-size:11.5px;flex:1;text-align:center" href="#/runas">ᚱ Abrir Grimorio</a>
          <a class="btn sec" style="padding:8px 10px;font-size:11.5px" href="${esc(G.pdfFile)}" download>⬇ PDF</a>
          <a class="btn sec" style="padding:8px 10px;font-size:11.5px" href="${esc(G.docxFile)}" download>⬇ Word</a>
          ${G.epubFile ? `<a class="btn sec" style="padding:8px 10px;font-size:11.5px" href="${esc(G.epubFile)}" download>⬇ ePub</a>` : ''}
        </div>
      </div>
    </div>` : ''}
  </div>`;
};

const books = () => `<h2 class="title">El Códice Completo — Recopilación Integral, Tres Tomos y Grimorio</h2>${booksGrid()}`;

/* ================= Paginación del Libro (300 págs Tomo I, 400 págs Tomo II, 500 págs Tomo III, 1.200+ Completa) ================= */
const pageCache = {};
function paginate(b) {
  const baseBudgets = { 'tomo-1': 2600, 'tomo-2': 2200, 'tomo-final': 2050, 'trilogia-completa': 2200 };
  const budget = innerWidth < 760 ? 1400 : (baseBudgets[b.id] || 2100);
  if (pageCache[b.id + budget]) return pageCache[b.id + budget];
  const pages = [], chapters = [];

  // Map all 16 runes across the tomes so every rune appears as a full-page LOTR leaf
  const tomeRunes = b.id === 'trilogia-completa'
    ? D.runes.slice()
    : b.id === 'tomo-1'
      ? [D.runes[0], D.runes[1], D.runes[2], D.runes[3], D.runes[13], D.runes[14]].filter(Boolean)
      : b.id === 'tomo-2'
        ? [D.runes[4], D.runes[5], D.runes[6], D.runes[7], D.runes[15]].filter(Boolean)
        : [D.runes[8], D.runes[9], D.runes[10], D.runes[11], D.runes[12]].filter(Boolean);
  let rIdx = 0;

  b.acts.forEach((a, ai) => {
    if (tomeRunes[rIdx]) {
      pages.push({ type: 'rune', act: a.title, rune: tomeRunes[rIdx++] });
    }
    a.chapters.forEach((c, ci) => {
      const hasPaintedIll = c.illustration && !/image(41|42|43|44)\./.test(c.illustration.img);
      chapters.push({ title: c.title, act: a.title, page: pages.length, hasIll: hasPaintedIll });
      if (hasPaintedIll) {
        pages.push({
          type: 'plate',
          chapter: c.title,
          act: a.title,
          title: c.title,
          img: c.illustration.img,
          cap: c.illustration.cap
        });
      }
      let cur = [], used = 0, first = !hasPaintedIll, limit = first ? budget * .84 : budget;
      const push = () => {
        if (cur.length) {
          pages.push({ type: 'text', chapter: c.title, act: a.title, title: first ? c.title : null, paras: cur, first });
          first = false; cur = []; used = 0; limit = budget;
        }
      };
      c.content.forEach(par => {
        let rest = String(par), cont = false;
        while (rest.length) {
          const room = limit - used;
          if (rest.length <= room) { cur.push({ t: rest, cont }); used += rest.length + 28; rest = ''; }
          else {
            let cut = rest.lastIndexOf('. ', room); if (cut < room * .4) cut = rest.lastIndexOf(' ', room);
            if (cut <= 0 || room < 120) { push(); continue; }
            cur.push({ t: rest.slice(0, cut + 1), cont }); rest = rest.slice(cut + 1).trimStart(); cont = true; push();
          }
        }
        if (used >= limit) push();
      });
      push();
    });
    while (rIdx < tomeRunes.length && ai === b.acts.length - 1) {
      pages.push({ type: 'rune', act: a.title, rune: tomeRunes[rIdx++] });
    }
  });
  return pageCache[b.id + budget] = { pages, chapters };
}

const book = id => {
  const b = findBookById(id); if (!b) return notFound();
  setAccent(b.accent);
  const { chapters, pages } = paginate(b);
  let k = 0;
  const saved = localStorage.getItem('pg-' + id);
  return `<div class="book-head" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));align-items:center">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="text-align:center">
        <img src="${esc(b.coverImage)}" alt="Portada ${esc(b.title)}" style="width:100%;border-radius:10px;border:2px solid var(--accent)">
        <div style="font-size:12px;color:var(--muted);margin-top:6px"><a href="${esc(b.coverImage)}" download style="color:var(--accent)">⬇ Descargar Portada</a></div>
      </div>
      <div style="text-align:center">
        <img src="${esc(b.backCoverImage)}" alt="Contraportada ${esc(b.title)}" style="width:100%;border-radius:10px;border:2px solid var(--accent)">
        <div style="font-size:12px;color:var(--muted);margin-top:6px"><a href="${esc(b.backCoverImage)}" download style="color:var(--accent)">⬇ Descargar Contraportada</a></div>
      </div>
    </div>
    <div>
      <div class="act" style="margin-top:0">Volumen ${esc(b.number)} · ${chapters.length} Capítulos · ${pages.length} Folios en Códice</div>
      <h1 style="margin:0 0 12px" class="accent">${esc(b.title)}</h1>
      <p style="color:var(--muted);font-size:20px">${esc(b.description)}</p>
      <div class="hero-actions" style="margin-top:18px;flex-wrap:wrap">
        <a class="btn" href="#/leer/${b.id}/${saved || 0}">ᚱ ${saved ? 'Continuar lectura (Pág. ' + (+saved + 1) + ')' : 'Abrir y Escuchar en el Lector'}</a>
        <a class="btn sec" href="${esc(b.pdfFile)}" download>📕 PDF (${esc(b.number)})</a>
        <a class="btn sec" href="${esc(b.docxFile)}" download>📘 Word (.docx)</a>
        ${b.epubFile ? `<a class="btn sec" href="${esc(b.epubFile)}" download>📗 ePub (Kindle / eReaders)</a>` : ''}
      </div>
    </div>
  </div>
  <div class="toc">${b.acts.map(a => `
    <div class="act">${esc(a.title)}</div>
    ${a.chapters.map(() => {
      const c = chapters[k++];
      return `<a href="#/leer/${b.id}/${c.page}">
        <span>${esc(c.title)}</span>
        ${c.hasIll ? `<span class="toc-badge">✦ Ilustrado</span>` : ''}
      </a>`;
    }).join('')}`).join('')}
  </div>`;
};

const runeMedallionSVG = () => `
<svg class="ring" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(106,22,22,0.55)" stroke-width="1.5" stroke-dasharray="6 4"/>
  <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(106,22,22,0.4)" stroke-width="1"/>
  <polygon points="100,12 188,100 100,188 12,100" fill="none" stroke="rgba(106,22,22,0.3)" stroke-width="1"/>
  <polygon points="38,38 162,38 162,162 38,162" fill="none" stroke="rgba(106,22,22,0.3)" stroke-width="1"/>
</svg>`;

const renderRuneFolia = (r, actTitle, footerTxt) => {
  const showPlate = r.ink && /rune_/.test(r.ink);
  const showExtended = !footerTxt;
  return `
  <div class="page-border"></div>
  <div class="rune-strip top">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ</div>
  <div class="rune-strip bot">ᛟ ᛞ ᛜ ᛚ ᛗ ᛖ ᛒ ᛏ ᛊ ᛉ ᛈ ᛇ ᛃ ᛁ ᚾ ᚺ ᚹ ᚷ ᚲ ᚱ ᚨ ᚦ ᚢ ᚠ</div>
  <div class="page-watermark">${esc(r.symbol || 'ᚱ')}</div>
  <div class="rune-folia">
    <div class="rune-folia-top">
      <div class="rune-folia-eyebrow">${esc(actTitle || 'Códice Rúnico de la Recta Provincia')}</div>
      <h2 class="rune-folia-title">${esc(r.name)}</h2>
      ${r.inkCaption ? `<div class="rune-folia-sub">«${esc(r.inkCaption)}»</div>` : ''}
    </div>
    <div class="rune-centerpiece" style="${showPlate ? '' : 'grid-template-columns:1fr'}">
      ${showPlate ? `<div class="rune-etch-box"><img src="${esc(r.ink)}" alt="${esc(r.name)}"></div>` : ''}
      <div class="rune-medallion">
        ${runeMedallionSVG()}
        <span class="rune-drawn">${esc(r.symbol || '✦')}</span>
      </div>
      ${showPlate ? `<div class="rune-cirth-gloss">Inscripción tallada en el Tablón de alerce negro y preservada en las hojas del Grimorio chilote.</div>` : ''}
    </div>
    <dl class="rune-lore-grid">
      <div class="rune-lore-item"><dt>✦ Origen Ancestral</dt><dd>${esc(r.origin)}</dd></div>
      <div class="rune-lore-item"><dt>✦ Poder y Efecto</dt><dd>${esc(r.effect)}</dd></div>
      <div class="rune-lore-item"><dt>✦ Precio de Sangre</dt><dd>${esc(r.cost)}</dd></div>
      <div class="rune-lore-item danger"><dt>⚠ Peligro del Velo</dt><dd>${esc(r.danger)}</dd></div>
    </dl>
    ${showExtended && r.invocation ? `
      <div style="margin-top:14px;padding:12px 16px;background:rgba(106,22,22,0.08);border:1px dashed rgba(106,22,22,0.45);border-radius:6px;color:#3d1d0e;font-style:italic;font-size:17px">
        <strong style="color:#6a1616;font-style:normal">🕯️ Cántico Ritual en el Tablón:</strong> ${esc(r.invocation)}
      </div>` : ''}
    ${showExtended && Array.isArray(r.chronicle) ? `
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(139,104,60,0.4);color:#2b1d10;font-size:17.5px;line-height:1.68;text-align:justify">
        <div style="font-family:'Cinzel',serif;font-size:13px;color:#6a1616;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;text-align:center">─── ✦ Crónica Histórica y Tratado Hermético de ${esc(r.symbol || 'ᚱ')} ✦ ───</div>
        ${r.chronicle.map(p => `<p style="margin:0 0 10px">${esc(p)}</p>`).join('')}
      </div>` : ''}
  </div>
  <div class="ft">${footerTxt}</div>`;
};

const pageHTML = (b, pg, n, total) => {
  const foot = `— Folio ${n + 1} de ${total} · Volumen ${esc(b.number)} —`;
  if (pg.type === 'rune') {
    return renderRuneFolia(pg.rune, pg.act, foot);
  }
  if (pg.type === 'plate') {
    const isInk = /image(41|42|43|44)\./.test(pg.img);
    return `
      <div class="page-border"></div>
      <div class="rune-strip top">ᚠ ᚢ ᚦ ᚨ ᚱ · CÓDICE ILUSTRADO · ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛞ ᛟ</div>
      <div class="rune-strip bot">ᛟ ᛞ ᛗ ᛖ ᛒ ᛏ ᛊ ᛉ · RECTA PROVINCIA · ᚱ ᚨ ᚦ ᚢ ᚠ</div>
      <div class="page-inner">
        <div class="hd"><span>${esc(pg.act)}</span><span>Volumen ${esc(b.number)}</span></div>
        <h1>${esc(pg.title)}</h1>
        <div class="page-plate">
          <div class="plate-frame">
            <img src="${esc(pg.img)}" alt="${esc(pg.cap)}" class="${isInk ? 'ink-blend' : ''}">
          </div>
          <div class="plate-cap">«${esc(pg.cap)}»</div>
        </div>
      </div>
      <div class="ft">${foot}</div>`;
  }
  const wm = RUNES[(n * 3) % RUNES.length];
  return `
    <div class="page-border"></div>
    <div class="rune-strip top">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ</div>
    <div class="rune-strip bot">ᛟ ᛞ ᛜ ᛚ ᛗ ᛖ ᛒ ᛏ ᛊ ᛉ ᛈ ᛇ ᛃ ᛁ ᚾ ᚺ ᚹ ᚷ ᚲ ᚱ ᚨ ᚦ ᚢ ᚠ</div>
    <div class="page-watermark">${wm}</div>
    <div class="page-inner">
      <div class="hd"><span>${esc(pg.act)}</span><span>${esc(pg.title ? 'Volumen ' + b.number : pg.chapter)}</span></div>
      ${pg.title ? `<div class="orn">─── ᚠ ᚱ ᛞ ───</div><h1>${esc(pg.title)}</h1>` : ''}
      ${pg.paras.map((p, i) => `<p class="${i === 0 && !p.cont ? 'first' : ''}">${esc(p.t)}</p>`).join('')}
    </div>
    <div class="ft">${foot}</div>`;
};

function wordify(el) {
  let i = 0;
  el.querySelectorAll('.page-inner > p').forEach(p => {
    p.innerHTML = p.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : `<span class="w" style="animation-delay:${Math.min(i++ * 11, 1300) + 250}ms">${esc(w)}</span>`).join('');
  });
}

let cur = null, busy = false, readerKey = null;
let ttsActive = false, ttsRate = 1.0, ttsUtter = null;

function stopTTS() {
  ttsActive = false;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  document.querySelectorAll('.tts-speaking').forEach(el => el.classList.remove('tts-speaking'));
  const btn = document.getElementById('btn-tts');
  if (btn) {
    btn.classList.remove('tts-active');
    btn.innerHTML = '🔊 Escuchar Audiolibro';
  }
}

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('brujo-bookmarks') || '[]'); } catch { return []; }
}
function saveBookmarks(list) {
  localStorage.setItem('brujo-bookmarks', JSON.stringify(list));
}

function reader(id, n) {
  stopTTS();
  const b = findBookById(id); if (!b) { app.innerHTML = notFound(); return; }
  setAccent(b.accent);
  if (soundOn) setMood(b.id === 'tomo-1' ? 0 : b.id === 'tomo-2' ? 1 : 3);
  const { pages } = paginate(b), total = pages.length;
  n = Math.max(0, Math.min(total - 1, n | 0));
  const savedTheme = localStorage.getItem('brujo-theme') || 'parchment';
  const savedFont = localStorage.getItem('brujo-font') || 'md';

  app.innerHTML = `
    <div class="reader-toolbar">
      <div class="reader-tool-group">
        <button class="reader-btn" id="btn-tts" title="Narrar el folio actual en voz alta y pasar página automáticamente">🔊 Escuchar Audiolibro</button>
        <select class="reader-btn" id="sel-tts-rate" title="Velocidad del narrador" style="background:#0d1411">
          <option value="0.9">0.9x Pausado</option>
          <option value="1" selected>1.0x Normal</option>
          <option value="1.15">1.15x Ágil</option>
          <option value="1.3">1.3x Rápido</option>
        </select>
      </div>
      <div class="reader-tool-group">
        <button class="reader-btn ${savedTheme === 'parchment' ? 'on' : ''}" data-th="parchment">📜 Pergamino</button>
        <button class="reader-btn ${savedTheme === 'sepia' ? 'on' : ''}" data-th="sepia">🏺 Sepia</button>
        <button class="reader-btn ${savedTheme === 'night' ? 'on' : ''}" data-th="night">🌙 Noche</button>
        <button class="reader-btn" id="btn-f-sm" title="Reducir letra">A-</button>
        <button class="reader-btn" id="btn-f-md" title="Letra estándar">A</button>
        <button class="reader-btn" id="btn-f-lg" title="Aumentar letra">A+</button>
      </div>
      <div class="reader-tool-group">
        <span style="font-size:11px;font-family:'Cinzel',serif;color:var(--muted)">Ir a:</span>
        <input type="number" id="jump-folio" class="reader-jump-input" min="1" max="${total}" value="${n + 1}" title="Escribe el número de folio y presiona Enter">
        <button class="reader-btn" id="btn-bm-toggle" title="Guardar o ver marcapáginas y notas">🔖 Marcapáginas</button>
      </div>
    </div>
    <div class="reader-drawer" id="bm-drawer"></div>
    <div class="stage"><div class="book ${savedTheme !== 'parchment' ? 'theme-' + savedTheme : ''} ${savedFont !== 'md' ? 'font-' + savedFont : ''}" id="bk"></div></div>
    <div class="ctrl"><button id="pv" title="Página anterior">‹</button><span id="lbl"></span><button id="nx" title="Página siguiente">›</button></div>
    <div class="bar"><i id="pr"></i></div>
    <div class="hint">Usa las flechas ← → · haz clic en los bordes de la hoja · <a href="#/libro/${id}" class="accent">Volver al Índice (${esc(b.number)})</a></div>`;

  const bk = document.getElementById('bk');
  const bmDrawer = document.getElementById('bm-drawer');

  const renderBmDrawer = () => {
    const list = getBookmarks();
    const curPg = pages[n];
    const chapTitle = curPg?.chapter || curPg?.title || curPg?.act || `Folio ${n + 1}`;
    bmDrawer.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
        <input type="text" id="bm-note-in" placeholder="Escribe una nota personal para este folio (opcional)..." style="flex:1;min-width:220px;padding:8px 12px;border-radius:8px;border:1px solid rgba(212,175,55,0.45);background:rgba(0,0,0,0.45);color:var(--fg);font-family:inherit;font-size:16px">
        <button class="btn" id="bm-save-now" style="padding:8px 16px;font-size:11.5px">🔖 Guardar Folio ${n + 1} (${esc(chapTitle)})</button>
      </div>
      ${list.length ? `<div style="display:grid;gap:8px;max-height:200px;overflow-y:auto">
        ${list.map((item, idx) => `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(212,175,55,0.28);border-radius:8px">
            <a href="#/leer/${esc(item.bookId)}/${item.page}" style="flex:1">
              <strong style="color:var(--gold);font-family:'Cinzel',serif;font-size:12px">[${esc(item.bookNum)} · Folio ${item.page + 1}]</strong>
              <span style="margin-left:6px;color:var(--fg)">${esc(item.chapter)}</span>
              ${item.note ? `<div style="font-size:14.5px;color:var(--accent);font-style:italic">«${esc(item.note)}»</div>` : ''}
            </a>
            <button class="reader-btn" data-del-bm="${idx}" title="Eliminar marcapáginas">✕</button>
          </div>
        `).join('')}
      </div>` : `<div style="color:var(--muted);font-size:15px">Aún no tienes marcapáginas guardados en el Códice.</div>`}
    `;
    const saveBtn = document.getElementById('bm-save-now');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const note = document.getElementById('bm-note-in')?.value.trim() || '';
        const arr = getBookmarks();
        arr.unshift({ bookId: id, bookNum: b.number, page: n, chapter: chapTitle, note });
        saveBookmarks(arr.slice(0, 30));
        renderBmDrawer();
      };
    }
    bmDrawer.querySelectorAll('[data-del-bm]').forEach(btn => {
      btn.onclick = () => {
        const arr = getBookmarks();
        arr.splice(+btn.dataset.delBm, 1);
        saveBookmarks(arr);
        renderBmDrawer();
      };
    });
  };

  document.getElementById('btn-bm-toggle').onclick = () => {
    bmDrawer.classList.toggle('open');
    if (bmDrawer.classList.contains('open')) renderBmDrawer();
  };

  // Theme & Font buttons
  document.querySelectorAll('[data-th]').forEach(btn => {
    btn.onclick = () => {
      const th = btn.dataset.th;
      localStorage.setItem('brujo-theme', th);
      document.querySelectorAll('[data-th]').forEach(x => x.classList.toggle('on', x === btn));
      bk.classList.remove('theme-sepia', 'theme-night');
      if (th !== 'parchment') bk.classList.add('theme-' + th);
    };
  });
  const setFontSz = sz => {
    localStorage.setItem('brujo-font', sz);
    bk.classList.remove('font-sm', 'font-lg');
    if (sz !== 'md') bk.classList.add('font-' + sz);
  };
  document.getElementById('btn-f-sm').onclick = () => setFontSz('sm');
  document.getElementById('btn-f-md').onclick = () => setFontSz('md');
  document.getElementById('btn-f-lg').onclick = () => setFontSz('lg');

  // Direct Folio Jump
  const jumpIn = document.getElementById('jump-folio');
  jumpIn.onchange = () => {
    const target = Math.max(1, Math.min(total, +jumpIn.value || 1)) - 1;
    if (target !== n) show(target, target > n ? 1 : -1);
  };

  // Audiobook / TTS Narrator
  const speakCurrentPage = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const pNodes = Array.from(cur ? cur.querySelectorAll('.page-inner > h1, .page-inner > p, .plate-cap, .rune-folia-title, .rune-lore-item dd') : []);
    if (!pNodes.length) {
      if (ttsActive && n < total - 1) setTimeout(() => { if (ttsActive) go(1); }, 900);
      return;
    }
    let idxP = 0;
    const speakNext = () => {
      if (!ttsActive) return;
      pNodes.forEach(el => el.classList.remove('tts-speaking'));
      if (idxP >= pNodes.length) {
        if (n < total - 1) {
          go(1);
          setTimeout(() => { if (ttsActive) speakCurrentPage(); }, 950);
        } else {
          stopTTS();
        }
        return;
      }
      const node = pNodes[idxP++];
      node.classList.add('tts-speaking');
      const u = new SpeechSynthesisUtterance(node.textContent);
      u.lang = 'es-CL';
      u.rate = ttsRate;
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => /es[-_](CL|ES|MX|AR|419)/i.test(v.lang)) || voices.find(v => /^es/i.test(v.lang));
      if (esVoice) u.voice = esVoice;
      u.onend = () => { if (ttsActive) speakNext(); };
      u.onerror = () => { if (ttsActive) speakNext(); };
      ttsUtter = u;
      window.speechSynthesis.speak(u);
    };
    speakNext();
  };

  document.getElementById('sel-tts-rate').onchange = e => {
    ttsRate = parseFloat(e.target.value) || 1.0;
    if (ttsActive) speakCurrentPage();
  };
  document.getElementById('btn-tts').onclick = () => {
    if (ttsActive) {
      stopTTS();
    } else {
      ttsActive = true;
      const btn = document.getElementById('btn-tts');
      btn.classList.add('tts-active');
      btn.innerHTML = '⏹ Detener Narrador';
      speakCurrentPage();
    }
  };

  const show = (i, dir) => {
    localStorage.setItem('pg-' + id, i);
    history.replaceState(null, '', `#/leer/${id}/${i}`);
    const pg = pages[i];
    const el = document.createElement('div');
    el.className = 'page' + (pg.type === 'rune' ? ' rune-leaf' : '');
    el.innerHTML = pageHTML(b, pg, i, total);
    if (pg.type === 'text') wordify(el);
    if (cur && dir) {
      const old = cur; old.classList.add('cur', dir > 0 ? 'fwd' : 'bwd'); busy = true;
      const r = bk.getBoundingClientRect();
      burst(dir > 0 ? r.left + 20 : r.right - 20, r.top + r.height / 2, 55);
      rustle(); bk.insertBefore(el, old);
      setTimeout(() => { old.remove(); busy = false; }, 860);
    } else {
      bk.innerHTML = ''; bk.appendChild(el);
      const r = bk.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 30);
    }
    cur = el; n = i;
    document.getElementById('lbl').textContent = `Folio ${i + 1} de ${total}`;
    if (jumpIn) jumpIn.value = i + 1;
    if (bmDrawer.classList.contains('open')) renderBmDrawer();
    document.getElementById('pr').style.width = ((i + 1) / total * 100) + '%';
    document.getElementById('pv').disabled = i === 0;
    document.getElementById('nx').disabled = i === total - 1;
    if (dir && innerWidth <= 860) {
      const stg = document.querySelector('.stage');
      if (stg && stg.getBoundingClientRect().top < 0) stg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const go = d => {
    if (busy) return;
    const t = n + d;
    if (t < 0 || t >= total) { bk.classList.remove('shake'); void bk.offsetWidth; bk.classList.add('shake'); return; }
    show(t, d);
    if (ttsActive) setTimeout(() => { if (ttsActive) speakCurrentPage(); }, 900);
  };
  cur = null; show(n, 0);
  document.getElementById('pv').onclick = () => go(-1);
  document.getElementById('nx').onclick = () => go(1);
  bk.onclick = e => { const r = bk.getBoundingClientRect(); go(e.clientX < r.left + r.width * .32 ? -1 : 1); };
  readerKey = e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') go(-1);
  };
  let sx = null;
  bk.ontouchstart = e => sx = e.touches[0].clientX;
  bk.ontouchend = e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); sx = null; };
}
addEventListener('keydown', e => readerKey && readerKey(e));

/* ================= Mapa Interactivo del Recorrido del Brujo ================= */
const mapView = (idx = 0) => {
  const stops = D.mapStops || [];
  idx = Math.max(0, Math.min(stops.length - 1, idx | 0));
  const st = stops[idx];
  const pts = stops.map(s => `${s.coords[0] * 3.6},${s.coords[1] * 5.8}`).join(' ');

  // Find chapter page in tome
  const tomeObj = D.books.find(b => b.id === st.tome);
  let targetPage = 0;
  if (tomeObj) {
    const { chapters } = paginate(tomeObj);
    let flatIdx = 0;
    for (let a = 0; a < st.ch[0]; a++) flatIdx += (tomeObj.acts[a]?.chapters.length || 0);
    flatIdx += st.ch[1];
    if (chapters[flatIdx]) targetPage = chapters[flatIdx].page;
  }

  return `
  <h2 class="title" style="margin-top:10px">Mapa Cartográfico del Recorrido del Brujo</h2>
  <p style="text-align:center;color:var(--muted);max-width:760px;margin:-12px auto 22px">
    Sigue los cinco siglos de travesía de Neyküyene y las reencarnaciones del alma amada, desde la fractura primordial hasta las costas brujas de Cucao en 2024. Haz clic en cada hito del pergamino.
  </p>
  <div class="map-timeline">
    ${stops.map((s, i) => `<a class="map-step-btn ${i === idx ? 'on' : ''}" href="#/mapa/${i}">${i + 1}. ${esc(s.year)}</a>`).join('')}
  </div>
  <div class="map-wrap">
    <div class="map-board">
      <svg class="map-svg" viewBox="0 0 360 580">
        <!-- Compass Rose -->
        <g transform="translate(52,82)" opacity="0.65">
          <circle cx="0" cy="0" r="26" fill="none" stroke="#6a1616" stroke-width="1"/>
          <polygon points="0,-24 5,-5 24,0 5,5 0,24 -5,5 -24,0 -5,-5" fill="#6a1616"/>
          <text x="-4" y="-29" font-family="Cinzel" font-size="9" fill="#6a1616">N</text>
        </g>
        <!-- Stylized Coastline & Chiloé Archipelago -->
        <path d="M 140,20 Q 155,90 135,160 T 145,280 T 155,395 L 180,415 L 195,390 L 195,550 L 330,550 L 330,20 Z"
              fill="rgba(135, 98, 52, 0.28)" stroke="#6b4c28" stroke-width="1.5"/>
        <!-- Andes Mountains symbols -->
        <path d="M 245,60 L 260,35 L 275,60 M 255,140 L 272,110 L 288,140 M 250,230 L 268,198 L 285,230 M 248,330 L 266,298 L 284,330 M 240,430 L 258,395 L 276,430"
              fill="none" stroke="rgba(90,55,25,0.45)" stroke-width="1.6"/>
        <!-- Isla Grande de Chiloé & Smaller Islands -->
        <path d="M 105,425 Q 145,420 162,440 Q 168,485 152,525 Q 115,530 98,505 Q 92,465 105,425 Z"
              fill="rgba(106, 22, 22, 0.16)" stroke="#6a1616" stroke-width="1.8"/>
        <circle cx="176" cy="462" r="9" fill="rgba(106, 22, 22, 0.16)" stroke="#6a1616" stroke-width="1.2"/>
        <circle cx="185" cy="482" r="6" fill="rgba(106, 22, 22, 0.16)" stroke="#6a1616" stroke-width="1.2"/>
        <!-- Labels -->
        <text x="20" y="310" font-family="Cormorant Garamond" font-style="italic" font-size="13" fill="#5a3e20">Océano Pacífico</text>
        <text x="32" y="555" font-family="Cinzel" font-size="11" font-weight="bold" fill="#6a1616">Archipiélago de Chiloé</text>
        <!-- Journey Polyline -->
        <polyline class="map-route-glow" points="${pts}"/>
        <polyline class="map-route-line" points="${pts}"/>
        <!-- Interactive Nodes -->
        ${stops.map((s, i) => {
          const x = s.coords[0] * 3.6, y = s.coords[1] * 5.8;
          const alignLeft = x > 210;
          return `<g class="map-node ${i === idx ? 'active' : ''}" onclick="location.hash='#/mapa/${i}'">
            <circle class="outer" cx="${x}" cy="${y}" r="${i === idx ? 12 : 8}"/>
            <circle class="inner" cx="${x}" cy="${y}" r="${i === idx ? 6 : 4}"/>
            <text x="${alignLeft ? x - 12 : x + 12}" y="${y + 3}" text-anchor="${alignLeft ? 'end' : 'start'}">${i + 1}. ${esc(s.place.split(' ')[0])}</text>
          </g>`;
        }).join('')}
      </svg>
    </div>
    <div class="map-detail">
      <img src="${esc(st.img)}" alt="${esc(st.title)}">
      <div class="map-detail-body">
        <span class="map-year">✦ ${esc(st.year)}</span>
        <h3>${esc(st.title)}</h3>
        <div class="map-place">📍 ${esc(st.place)} — ${esc(st.region)}</div>
        <p style="color:var(--fg);font-size:19px">${esc(st.desc)}</p>
        ${Array.isArray(st.chronicle) ? st.chronicle.map(p => `<p style="color:var(--muted);font-size:16.5px;line-height:1.6;margin-top:8px">${esc(p)}</p>`).join('') : ''}
        <div class="hero-actions" style="margin-top:20px;justify-content:space-between">
          <a class="btn" href="#/leer/${st.tome}/${targetPage}">ᚱ Ir a este capítulo en el Códice</a>
          <div style="display:flex;gap:8px">
            <a class="btn sec" style="padding:10px 14px" href="#/mapa/${Math.max(0, idx - 1)}">‹ Ant.</a>
            <a class="btn sec" style="padding:10px 14px" href="#/mapa/${Math.min(stops.length - 1, idx + 1)}">Sig. ›</a>
          </div>
        </div>
      </div>
    </div>
  </div>`;
};

/* ================= Modal Lightbox para Ilustraciones y Personajes ================= */
window.openArtModal = (idx, type) => {
  const modal = document.getElementById('art-modal');
  if (!modal) return;
  let item = null, linkHref = '', linkLabel = '', extraParas = [];
  if (type === 'scene') {
    const s = (D.scenePlan || [])[idx];
    if (!s) return;
    const lnk = findSceneLink(s);
    item = { img: s.img, eyebrow: `Escena ${s.num} de ${D.scenePlan.length} · ${s.tomeTitle}`, title: s.title, sub: s.subtitle, quote: s.quote, rune: s.rune };
    linkHref = lnk;
    linkLabel = 'ᚱ Leer esta escena en el Códice →';
  } else if (type === 'char') {
    const c = (D.characters || [])[idx];
    if (!c) return;
    item = { img: c.image, eyebrow: c.role, title: c.name, sub: c.description, quote: '', rune: c.type };
    extraParas = Array.isArray(c.chronicle) ? c.chronicle : [];
  }
  if (!item) return;
  modal.innerHTML = `
    <div class="art-modal-box" onclick="event.stopPropagation()">
      <button class="art-modal-close" onclick="closeArtModal()" title="Cerrar">✕</button>
      <div class="art-modal-img"><img src="${esc(item.img)}" alt="${esc(item.title)}"></div>
      <div class="art-modal-info" style="max-height:80vh;overflow-y:auto">
        <div class="eyebrow" style="margin-bottom:8px">${esc(item.eyebrow)}</div>
        <h2 style="margin:0 0 10px;color:var(--fg);font-family:'Cinzel Decorative',serif">${esc(item.title)}</h2>
        ${item.rune ? `<div style="font-family:'Cinzel',serif;font-size:13px;color:var(--accent);margin-bottom:14px">✦ ${esc(item.rune)}</div>` : ''}
        <p style="font-size:18px;color:var(--fg);line-height:1.6;margin:0 0 12px">${esc(item.sub)}</p>
        ${extraParas.map(p => `<p style="font-size:16px;color:var(--muted);line-height:1.6;margin:0 0 10px">${esc(p)}</p>`).join('')}
        ${item.quote ? `<div class="scene-quote" style="margin-bottom:20px">${esc(item.quote)}</div>` : ''}
        ${linkHref ? `<a class="btn" href="${linkHref}" onclick="closeArtModal()">${linkLabel}</a>` : ''}
      </div>
    </div>`;
  modal.classList.add('open');
  modal.onclick = closeArtModal;
  rustle();
};
window.closeArtModal = () => {
  const modal = document.getElementById('art-modal');
  if (modal) modal.classList.remove('open');
};
addEventListener('keydown', e => { if (e.key === 'Escape') window.closeArtModal(); });

function findSceneLink(s) {
  const targetTomeId = s.readTome || s.tome;
  for (const b of D.books) {
    const { pages } = paginate(b);
    const pIdx = pages.findIndex(pg => pg.img === s.img);
    if (pIdx >= 0) return `#/leer/${b.id}/${pIdx}`;
  }
  const tomeObj = D.books.find(b => b.id === targetTomeId) || D.books[0];
  const { chapters } = paginate(tomeObj);
  let flatIdx = 0;
  for (let a = 0; a < (s.ch?.[0] || 0); a++) flatIdx += (tomeObj.acts[a]?.chapters.length || 0);
  flatIdx += (s.ch?.[1] || 0);
  const pg = chapters[Math.min(flatIdx, chapters.length - 1)]?.page || 0;
  return `#/leer/${tomeObj.id}/${pg}`;
}

function renderSceneCard(s) {
  const idx = (D.scenePlan || []).indexOf(s);
  const href = findSceneLink(s);
  return `
  <article class="scene-card rise">
    <div class="scene-img-wrap" onclick="openArtModal(${idx}, 'scene')" title="Haz clic para ampliar ilustración">
      <img src="${esc(s.img)}" alt="${esc(s.title)}" loading="lazy">
      <span class="scene-badge-num">Escena ${s.num}</span>
      <span class="scene-badge-rune">${esc(s.rune)}</span>
    </div>
    <div class="scene-body">
      <div class="scene-tome-tag">${esc(s.tomeTitle)}</div>
      <h4>${esc(s.title)}</h4>
      <p class="scene-sub">${esc(s.subtitle)}</p>
      <div class="scene-quote">${esc(s.quote)}</div>
      <div class="scene-actions">
        <a class="btn" href="${href}">ᚱ Leer en el Códice →</a>
      </div>
    </div>
  </article>`;
}

/* ================= Plan de Ilustraciones para la Obra (26 Escenas) ================= */
const scenesView = (filter = 'all') => {
  const list = D.scenePlan || [];
  const t1Count = list.filter(s => s.tome === 'tomo-1').length;
  const t2Count = list.filter(s => s.tome === 'tomo-2').length;
  const t3Count = list.filter(s => s.tome === 'tomo-final').length;
  const groups = [
    { id: 'tomo-1', title: 'Tomo I: El Amor Eterno', sub: 'Quicaví, Castro, Cucao, Isla Guafo y Parlamento de Boroa (1567–1590)', acc: 'emerald' },
    { id: 'tomo-2', title: 'Tomo II: El Sacrificio', sub: 'Las Cinco Reencarnaciones, Sevilla, Atacama, el Caleuche y Aukan (1595–1975)', acc: 'rose' },
    { id: 'tomo-final', title: 'Tomo III: Nunca Es Tarde Para Salvar', sub: 'Santiago 2024, Relojería San Diego, la Disolución, la Flor Negra y Peregrinación Austral', acc: 'violet' }
  ];
  const visibleGroups = filter === 'all' ? groups : groups.filter(g => g.id === filter);
  return `
  <h2 class="title" style="margin-top:10px">Plan de Ilustraciones de la Obra — ${list.length} Escenas</h2>
  <p style="text-align:center;color:var(--muted);max-width:780px;margin:-12px auto 20px">
    Compendio visual de los ${list.length} momentos sagrados y largos recorridos de <em>El Sacrificio del Brujo Chilote</em> a través de sus tres tomos. Haz clic en cada grabado o pintura para inspeccionar su lámina completa o abrir directamente su folio en el libro.
  </p>
  <div class="filter-bar">
    <a class="filter-pill ${filter === 'all' ? 'on' : ''}" href="#/escenas">Todas las Escenas (${list.length})</a>
    <a class="filter-pill ${filter === 'tomo-1' ? 'on' : ''}" href="#/escenas/tomo-1">Tomo I: El Amor Eterno (${t1Count})</a>
    <a class="filter-pill ${filter === 'tomo-2' ? 'on' : ''}" href="#/escenas/tomo-2">Tomo II: El Sacrificio (${t2Count})</a>
    <a class="filter-pill ${filter === 'tomo-final' ? 'on' : ''}" href="#/escenas/tomo-final">Tomo III: Nunca Es Tarde Para Salvar (${t3Count})</a>
  </div>
  ${visibleGroups.map(g => {
    const items = list.filter(s => s.tome === g.id);
    return `
      <div class="scene-tome-banner">
        <h3>ᚱ ${esc(g.title)}</h3>
        <span>${esc(g.sub)} · ${items.length} Escenas Ilustradas</span>
      </div>
      <div class="scenes-grid">
        ${items.map(s => renderSceneCard(s)).join('')}
      </div>`;
  }).join('')}`;
};

/* ================= Bestiario Ilustrado y Mitología de Chiloé (49 Personajes y Seres) ================= */
function charCategory(c) {
  const t = (c.name + ' ' + c.role + ' ' + c.type).toLowerCase();
  if (/1\. deidades primordiales|ten ten|cai cai/.test(t)) return 'deidades';
  if (/2\. seres y espíritus del mar|millalobo|pincoya|pincoy|sirena chilota|camahueto|cuero|caleuche/.test(t)) return 'mar';
  if (/3\. seres del bosque|trauco|fiura|invunche|imbunche|basilisco|culebrón/.test(t)) return 'bosque';
  if (/4\. brujería y seres tutelares|brujo de chiloé|voladora|huenchula|ngenechen|ngen-ko/.test(t)) return 'brujeria';
  if (/reencarnaci|rayén|luz|inés|rosario|chiara|sin nombre|sin memoria|narradora/.test(t)) return 'reencarnaciones';
  if (/vampir|caín|aukan|lautaro|noble|amaru/.test(t)) return 'vampiros';
  if (/hada|duende|pudú|zorro|runa|barquero|abel|kallfü/.test(t)) return 'velo';
  return 'protagonistas';
}

function isChiloeMyth(c) {
  const cat = charCategory(c);
  return cat === 'deidades' || cat === 'mar' || cat === 'bosque' || cat === 'brujeria';
}

const characters = (cat = 'all') => {
  const all = D.characters || [];
  const filtered = cat === 'all'
    ? all
    : cat === 'mitologia'
      ? all.filter(isChiloeMyth)
      : all.filter(c => charCategory(c) === cat);
  return `
  <h2 class="title" style="margin-top:10px">Bestiario Ilustrado y Mitología de Chiloé — ${all.length} Personajes y Seres</h2>
  <p style="text-align:center;color:var(--muted);max-width:820px;margin:-12px auto 20px">
    Guía ilustrada y resumida de los <strong>Personajes de la Mitología de Chiloé</strong> integrados en los tres tomos junto a <strong>Neyküyene</strong>, las seis vidas del alma amada, los brujos de la Recta Provincia y las criaturas del Velo Místico. Haz clic en cualquier retrato para abrir su ficha completa y crónica.
  </p>
  <div class="filter-bar">
    <a class="filter-pill ${cat === 'all' ? 'on' : ''}" href="#/personajes">Todos (${all.length})</a>
    <a class="filter-pill ${cat === 'mitologia' ? 'on' : ''}" href="#/personajes/mitologia">🌊 Guía Mitología de Chiloé (19)</a>
    <a class="filter-pill ${cat === 'deidades' ? 'on' : ''}" href="#/personajes/deidades">1. Deidades Primordiales</a>
    <a class="filter-pill ${cat === 'mar' ? 'on' : ''}" href="#/personajes/mar">2. Espíritus del Mar y Costas</a>
    <a class="filter-pill ${cat === 'bosque' ? 'on' : ''}" href="#/personajes/bosque">3. Seres del Bosque y Tierra</a>
    <a class="filter-pill ${cat === 'brujeria' ? 'on' : ''}" href="#/personajes/brujeria">4. Brujería y Seres Tutelares</a>
    <a class="filter-pill ${cat === 'protagonistas' ? 'on' : ''}" href="#/personajes/protagonistas">Neyküyene y Aliados</a>
    <a class="filter-pill ${cat === 'reencarnaciones' ? 'on' : ''}" href="#/personajes/reencarnaciones">Las Vidas de la Amada</a>
    <a class="filter-pill ${cat === 'vampiros' ? 'on' : ''}" href="#/personajes/vampiros">Hijos de la Noche</a>
    <a class="filter-pill ${cat === 'velo' ? 'on' : ''}" href="#/personajes/velo">Criaturas del Velo</a>
  </div>
  ${(cat === 'mitologia' || cat === 'deidades' || cat === 'all') ? `
  <div class="synopsis-box" style="margin-bottom:22px;padding:16px 22px;border-left:4px solid var(--gold)">
    <div class="eyebrow" style="margin-bottom:4px">✦ Nota de Contexto Cosmogónico · Formación del Archipiélago de Chiloé</div>
    <p style="margin:0;font-size:17.5px">El choque ancestral entre <strong>Ten Ten Vilu (Trentren Vilu)</strong> y <strong>Cai Cai Vilu (Caicai Vilu)</strong> explica la formación geográfica del Archipiélago de Chiloé: el levantamiento de la tierra por Ten Ten Vilu, fragmentado por el avance embravecido del mar de Cai Cai Vilu, dio origen a las múltiples islas, fiordos y canales donde transcurre la historia de <strong>Neyküyene</strong>.</p>
  </div>` : ''}
  <div class="grid">${filtered.map(c => {
    const idx = all.indexOf(c);
    return `
    <div class="card tilt rise" style="cursor:pointer" onclick="openArtModal(${idx}, 'char')">
      ${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">` : ''}
      <div class="b">
        <div class="r">${esc(c.role)}</div>
        <h3>${esc(c.name)}</h3>
        <p style="font-size:13px;color:var(--accent);margin-bottom:8px">✦ ${esc(c.type)}</p>
        <p>${esc(c.description)}</p>
      </div>
    </div>`;
  }).join('')}</div>`;
};

/* ================= Grimorio Rúnico (Libro Independiente + Hojas de Pergamino) ================= */
const runes = (i = 0) => {
  const list = D.runes;
  const G = D.grimorioBook || {};
  i = Math.max(0, Math.min(list.length - 1, i | 0));
  const r = list[i];
  return `
  <h2 class="title" style="margin-top:10px">Grimorio de las ${list.length} Runas del Sacrificio y de los Viajes</h2>
  <p style="text-align:center;color:var(--muted);max-width:760px;margin:-12px auto 24px">
    Cada runa está inscrita sobre pergamino siguiendo la tradición del Tablón de Quicaví y los largos recorridos de Neyküyene. Además, puedes consultar el <a href="#/oraculo" style="color:var(--gold);text-decoration:underline">Oráculo Rúnico Interactivo</a> o descargar el <strong>Grimorio y Bestiario Expandido</strong> como cuarto libro independiente en PDF, Word y ePub.
  </p>
  ${G.title ? `
  <div class="book-head" style="margin-bottom:28px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));align-items:center">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="text-align:center">
        <img src="${esc(G.coverImage)}" alt="Portada Grimorio" style="width:100%;border-radius:10px;border:2px solid var(--accent)">
        <div style="font-size:12px;margin-top:6px"><a href="${esc(G.coverImage)}" download style="color:var(--accent)">⬇ Descargar Portada</a></div>
      </div>
      <div style="text-align:center">
        <img src="${esc(G.backCoverImage)}" alt="Contraportada Grimorio" style="width:100%;border-radius:10px;border:2px solid var(--accent)">
        <div style="font-size:12px;margin-top:6px"><a href="${esc(G.backCoverImage)}" download style="color:var(--accent)">⬇ Descargar Contraportada</a></div>
      </div>
    </div>
    <div>
      <div class="act" style="margin-top:0">${esc(G.number)} · LIBRO SEPARADO · 151 PÁGINAS COMPLETAS</div>
      <h2 style="margin:0 0 8px;color:var(--accent);font-family:'Cinzel Decorative',serif">${esc(G.title)}</h2>
      <p style="color:var(--muted);font-size:18px;margin-bottom:14px">${esc(G.synopsis)}</p>
      <div class="hero-actions" style="flex-wrap:wrap">
        <a class="btn" href="${esc(G.pdfFile)}" download>📕 PDF (151 Págs)</a>
        <a class="btn sec" href="${esc(G.docxFile)}" download>📘 Word (.docx)</a>
        ${G.epubFile ? `<a class="btn sec" href="${esc(G.epubFile)}" download>📗 ePub (Kindle)</a>` : ''}
        <a class="btn sec" href="#/oraculo">🔮 Tirada del Oráculo Rúnico</a>
      </div>
    </div>
  </div>` : ''}
  <div class="grim-layout">
    <aside>
      <div class="act" style="margin-top:0">Índice del Grimorio (${i + 1} / ${list.length})</div>
      <ul class="rlist">
        ${list.map((x, k) => `<li><a class="${k === i ? 'on' : ''}" href="#/runas/${k}"><span class="rs">${esc(x.symbol || '✦')}</span><span>${esc(x.name)}</span></a></li>`).join('')}
      </ul>
    </aside>
    <div class="grim-sheet">
      ${renderRuneFolia(r, `Folio Rúnico ${i + 1} de ${list.length} · Grimorio de Chiloé`, '')}
      <div style="display:flex;justify-content:space-between;position:relative;z-index:4;margin-top:14px">
        <a class="btn sec" style="color:#5a1414;border-color:#6a1616;padding:8px 18px" href="#/runas/${Math.max(0, i - 1)}">← Runa Anterior</a>
        <a class="btn sec" style="color:#5a1414;border-color:#6a1616;padding:8px 18px" href="#/runas/${Math.min(list.length - 1, i + 1)}">Siguiente Runa →</a>
      </div>
    </div>
  </div>`;
};

/* ================= Oráculo Rúnico Interactivo del Tablón de Quicaví ================= */
let currentOracleSpread = null;
window.drawOracleRunes = () => {
  const pool = [...D.runes];
  const picked = [];
  const positions = [
    { pos: 'I · Raíz en el Velo (El Pasado)', role: 'Aquello que fue tallado en la primera marea' },
    { pos: 'II · El Precio de Sangre (El Presente)', role: 'El umbral que hoy exige tu coraje' },
    { pos: 'III · Sendero del Sacrificio (El Destino)', role: 'La luz esmeralda que aguarda tras la niebla' }
  ];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const r = pool.splice(idx, 1)[0];
    const reversed = Math.random() < 0.28;
    picked.push({ rune: r, reversed, ...positions[i] });
  }
  currentOracleSpread = picked;
  const box = document.getElementById('oracle-result');
  if (box) {
    box.innerHTML = renderOracleSpreadHTML(picked);
    const rect = box.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + 120, 65);
    rustle();
  }
};

function renderOracleSpreadHTML(spread) {
  if (!spread || !spread.length) {
    return `<p style="color:var(--muted);font-size:19px;margin:24px 0">Posiciona tus manos sobre el Tablón virtual de alerce negro y presiona el botón para extraer tres runas del Velo Místico.</p>`;
  }
  const [r1, r2, r3] = spread;
  return `
    <div class="oracle-grid">
      ${spread.map((s, idx) => `
        <div class="oracle-card">
          <div class="oracle-pos">${esc(s.pos)}</div>
          <div style="font-size:13px;font-style:italic;color:#5a381e;margin-bottom:4px">${esc(s.role)}</div>
          <div class="oracle-symbol ${s.reversed ? 'reversed' : ''}">${esc(s.rune.symbol || 'ᚱ')}</div>
          <h3 style="margin:4px 0;color:#163829;font-family:'Cinzel Decorative',serif;font-size:20px">${esc(s.rune.name)}</h3>
          <div style="font-size:12px;font-weight:bold;color:${s.reversed ? '#6a1616' : '#0f5132'};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">
            ${s.reversed ? '⚠ Posición Merkstave (Sombra del Umbral)' : '✦ Posición Derecha (Luz de Esmeralda)'}
          </div>
          <p style="font-size:15.5px;line-height:1.5;margin:0 0 8px;text-align:justify">
            ${esc(s.reversed ? s.rune.danger : s.rune.effect)}
          </p>
          <div style="font-size:13.5px;color:#5a381e;border-top:1px dashed rgba(106,22,22,0.35);padding-top:6px">
            <strong>Precio:</strong> ${esc(s.rune.cost)}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="oracle-prophecy">
      <div class="eyebrow" style="margin-bottom:6px">🕯️ Sentencia del Tablón de Quicaví</div>
      <h3 style="margin:0 0 10px;color:var(--gold)">Lectura Conjunta: ${esc(r1.rune.symbol)} · ${esc(r2.rune.symbol)} · ${esc(r3.rune.symbol)}</h3>
      <p style="margin:0 0 10px;font-size:18.5px;line-height:1.65">
        Tu camino nace bajo el signo de <strong>${esc(r1.rune.name)}</strong> (${r1.reversed ? 'en sombra de advertencia' : 'en plenitud luminosa'}), recordándote que <em>${esc(r1.rune.origin.toLowerCase())}</em>.
        En el presente, el umbral te enfrenta a <strong>${esc(r2.rune.name)}</strong>: ${esc(r2.reversed ? r2.rune.danger : r2.rune.effect)}
      </p>
      <p style="margin:0;font-size:18.5px;line-height:1.65;color:var(--accent)">
        <strong>Destino en Cucao (${esc(r3.rune.name)}):</strong> Si sostienes la promesa sin olvidar el precio (<em>${esc(r3.rune.cost.toLowerCase())}</em>), la tercera piedra anuncia que ${esc(r3.reversed ? 'deberás cruzar la niebla con cautela antes del amanecer: ' + r3.rune.danger : r3.rune.effect)}
      </p>
    </div>`;
}

const oracleView = () => {
  if (!currentOracleSpread) {
    // Draw an initial spread automatically
    const pool = [...D.runes];
    currentOracleSpread = [0, 1, 2].map(i => {
      const idx = Math.floor(Math.random() * pool.length);
      const r = pool.splice(idx, 1)[0];
      return {
        rune: r,
        reversed: Math.random() < 0.25,
        pos: ['I · Raíz en el Velo (El Pasado)', 'II · El Precio de Sangre (El Presente)', 'III · Sendero del Sacrificio (El Destino)'][i],
        role: ['Aquello que fue tallado en la primera marea', 'El umbral que hoy exige tu coraje', 'La luz esmeralda que aguarda tras la niebla'][i]
      };
    });
  }
  return `
  <h2 class="title" style="margin-top:10px">Oráculo Rúnico del Tablón de Quicaví</h2>
  <p style="text-align:center;color:var(--muted);max-width:780px;margin:-12px auto 24px">
    En la Caverna de Quicaví, la machi Huenchumán y Neyküyene leían las corrientes del Velo lanzando tres astillas de alerce negro grabadas con las 16 runas matrices. Consulta la tirada de los Tres Tiempos.
  </p>
  <div class="oracle-wrap">
    <div class="eyebrow">ᚱ Tirada Sagrada de los Tres Tiempos · Pasado, Presente y Destino ᚱ</div>
    <div style="margin:12px 0 18px">
      <button class="btn" onclick="drawOracleRunes()" style="font-size:14px;padding:14px 30px">🔮 Lanzar las Runas sobre el Tablón de Alerce</button>
    </div>
    <div id="oracle-result">
      ${renderOracleSpreadHTML(currentOracleSpread)}
    </div>
  </div>`;
};

/* ================= Árbol de Linajes, Cronología (1540–2028) y Glosario Mitológico ================= */
window.filterGlossaryDOM = q => {
  const term = String(q || '').toLowerCase().trim();
  document.querySelectorAll('.glossary-card').forEach(card => {
    const txt = (card.dataset.search || '').toLowerCase();
    card.style.display = !term || txt.includes(term) ? '' : 'none';
  });
};

const lineagesView = (tab = 'all') => {
  const lins = D.lineages || [];
  const chron = D.chronology || [];
  const gloss = D.glossary || [];
  return `
  <h2 class="title" style="margin-top:10px">Linajes de Sangre, Cronología de 5 Siglos y Glosario Mitológico</h2>
  <p style="text-align:center;color:var(--muted);max-width:800px;margin:-12px auto 22px">
    Explora la genealogía de las cuatro estirpes del umbral, los 24 hitos históricos entre los albores del tiempo y 2028, y el diccionario completo de términos chilotes, mapudungun, romané y rúnicos.
  </p>
  <div class="filter-bar">
    <a class="filter-pill ${tab === 'all' ? 'on' : ''}" href="#/linajes">Todo el Compendio</a>
    <a class="filter-pill ${tab === 'arboles' ? 'on' : ''}" href="#/linajes/arboles">🌳 Árboles de Linajes y 6 Vidas (${lins.length})</a>
    <a class="filter-pill ${tab === 'cronologia' ? 'on' : ''}" href="#/linajes/cronologia">⏳ Cronología 1540–2028 (${chron.length} Hitos)</a>
    <a class="filter-pill ${tab === 'glosario' ? 'on' : ''}" href="#/linajes/glosario">📖 Glosario Mitológico (${gloss.length} Voces)</a>
  </div>

  ${(tab === 'all' || tab === 'arboles') ? `
    <h3 style="font-family:'Cinzel Decorative',serif;color:var(--gold);font-size:25px;margin:28px 0 16px;text-align:center">🌳 Árboles Genealógicos de las Cuatro Estirpes</h3>
    ${lins.map(lin => `
      <div class="lineage-card rise">
        <div class="eyebrow">${esc(lin.rune)} · ${esc(lin.banner)}</div>
        <h3 style="margin:0 0 8px;font-size:23px;color:var(--fg)">${esc(lin.title)}</h3>
        <p style="margin:0;color:var(--muted);font-size:18px">${esc(lin.summary)}</p>
        <div class="lineage-nodes">
          ${lin.nodes.map(nd => `
            <div class="lineage-node">
              <div style="font-family:'Cinzel',serif;font-size:11.5px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase">${esc(nd.era)} · ${esc(nd.role)}</div>
              <h4 style="margin:4px 0 6px;font-size:19px;color:var(--accent)">${esc(nd.name)}</h4>
              <p style="margin:0;font-size:16.5px;color:var(--fg);line-height:1.55">${esc(nd.desc)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  ` : ''}

  ${(tab === 'all' || tab === 'cronologia') ? `
    <h3 style="font-family:'Cinzel Decorative',serif;color:var(--gold);font-size:25px;margin:38px 0 16px;text-align:center">⏳ Línea de Tiempo Completa (Albores del Mundo – 2028)</h3>
    <div class="lineage-card rise">
      <div class="lineage-nodes">
        ${chron.map((c, idx) => `
          <div class="lineage-node">
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
              <span style="font-family:'Cinzel',serif;font-size:12px;color:var(--gold);font-weight:bold">✦ ${idx + 1}. ${esc(c.year)} (${esc(c.era)})</span>
              <a href="#/libro/${esc(c.tome)}" style="font-family:'Cinzel',serif;font-size:11px;color:var(--accent)">Ver en ${esc(c.tome.toUpperCase())} →</a>
            </div>
            <h4 style="margin:4px 0 6px;font-size:19px;color:var(--fg)">${esc(c.title)}</h4>
            <p style="margin:0;font-size:16.5px;color:var(--muted);line-height:1.55">${esc(c.desc)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  ${(tab === 'all' || tab === 'glosario') ? `
    <h3 style="font-family:'Cinzel Decorative',serif;color:var(--gold);font-size:25px;margin:38px 0 14px;text-align:center">📖 Diccionario y Glosario Mitológico Chilote, Mapudungun, Romané y Rúnico</h3>
    <div style="max-width:540px;margin:0 auto 20px">
      <input type="search" class="search-input" placeholder="Filtrar término (ej. Caleuche, Machi, Pewma, Tablón, Lachi Drom)..." oninput="filterGlossaryDOM(this.value)" style="margin-bottom:0;font-size:18px;padding:11px 16px">
    </div>
    <div class="glossary-grid">
      ${gloss.map(g => `
        <div class="glossary-card rise" data-search="${esc(g.term + ' ' + g.cat + ' ' + g.origin + ' ' + g.def)}">
          <div style="font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:0.14em;color:var(--gold);text-transform:uppercase">${esc(g.cat)}</div>
          <h4 style="margin:4px 0;font-size:19px;color:var(--accent)">${esc(g.term)}</h4>
          <div style="font-size:13.5px;font-style:italic;color:var(--muted);margin-bottom:8px">${esc(g.origin)}</div>
          <p style="margin:0;font-size:16px;color:var(--fg);line-height:1.55">${esc(g.def)}</p>
        </div>
      `).join('')}
    </div>
  ` : ''}`;
};

/* ================= Buscador Global Instantáneo (Ctrl+K) ================= */
let searchIndexCache = null;
function getSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  const items = [];
  D.books.forEach(b => {
    const { chapters } = paginate(b);
    let k = 0;
    b.acts.forEach(a => {
      a.chapters.forEach(c => {
        const chMeta = chapters[k++];
        const snippet = c.content.slice(0, 2).join(' ').slice(0, 220) + '…';
        const fullTxt = (c.title + ' ' + a.title + ' ' + c.content.join(' ')).toLowerCase();
        items.push({
          tag: `Tomo ${b.number} · ${a.title} · Folio ${(chMeta?.page || 0) + 1}`,
          title: c.title,
          desc: snippet,
          href: `#/leer/${b.id}/${chMeta?.page || 0}`,
          search: fullTxt
        });
      });
    });
  });
  (D.runes || []).forEach((r, idx) => {
    items.push({
      tag: `Grimorio Rúnico · Runa ${idx + 1} (${r.symbol})`,
      title: r.name,
      desc: `${r.effect} — ${r.cost}`,
      href: `#/runas/${idx}`,
      search: (r.name + ' ' + r.symbol + ' ' + r.origin + ' ' + r.effect + ' ' + r.cost + ' ' + r.danger).toLowerCase()
    });
  });
  (D.characters || []).forEach((c) => {
    items.push({
      tag: `Bestiario Ilustrado · ${c.role}`,
      title: c.name,
      desc: c.description,
      href: `#/personajes`,
      search: (c.name + ' ' + c.role + ' ' + c.type + ' ' + c.description).toLowerCase()
    });
  });
  (D.mapStops || []).forEach((m, idx) => {
    items.push({
      tag: `Mapa Cartográfico · Hito ${idx + 1} (${m.year})`,
      title: `${m.title} — ${m.place}`,
      desc: m.desc,
      href: `#/mapa/${idx}`,
      search: (m.title + ' ' + m.place + ' ' + m.region + ' ' + m.year + ' ' + m.desc).toLowerCase()
    });
  });
  (D.glossary || []).forEach(g => {
    items.push({
      tag: `Glosario Mitológico · ${g.cat}`,
      title: g.term,
      desc: g.def,
      href: `#/linajes/glosario`,
      search: (g.term + ' ' + g.cat + ' ' + g.origin + ' ' + g.def).toLowerCase()
    });
  });
  return searchIndexCache = items;
}

window.openSearchModal = () => {
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  modal.innerHTML = `
    <div class="search-box" onclick="event.stopPropagation()">
      <button class="art-modal-close" onclick="closeSearchModal()" title="Cerrar">✕</button>
      <div class="eyebrow" style="margin-bottom:6px">🔍 Buscador Instantáneo del Códice (159 Capítulos, 16 Runas, ${D.characters.length} Entidades y Glosario)</div>
      <input type="search" id="global-search-in" class="search-input" placeholder="Escribe un nombre, lugar, runa o palabra clave (ej. Cucao, Rayén, Aukan, Matías, Sowilo, Caleuche)...">
      <div class="search-results" id="global-search-res"></div>
    </div>`;
  modal.classList.add('open');
  modal.onclick = closeSearchModal;
  const input = document.getElementById('global-search-in');
  const resBox = document.getElementById('global-search-res');
  const runQuery = q => {
    const term = String(q || '').toLowerCase().trim();
    const all = getSearchIndex();
    const matches = !term ? all.slice(0, 18) : all.filter(it => it.search.includes(term)).slice(0, 35);
    resBox.innerHTML = matches.length ? matches.map(it => `
      <a class="search-item" href="${it.href}" onclick="closeSearchModal()">
        <div class="search-item-tag">${esc(it.tag)}</div>
        <h4>${esc(it.title)}</h4>
        <p>${esc(it.desc)}</p>
      </a>
    `).join('') : `<div style="padding:20px;text-align:center;color:var(--muted)">No se encontraron coincidencias en las crónicas de Quicaví para «${esc(q)}».</div>`;
  };
  input.oninput = () => runQuery(input.value);
  runQuery('');
  setTimeout(() => input.focus(), 50);
};
window.closeSearchModal = () => {
  const modal = document.getElementById('search-modal');
  if (modal) modal.classList.remove('open');
};
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    window.openSearchModal();
  } else if (e.key === 'Escape') {
    window.closeSearchModal();
  }
});

const notFound = () => `<h2 class="title">Las nieblas de Chiloé lo ocultaron</h2><div style="text-align:center"><a class="btn" href="#/">Volver al inicio</a></div>`;

/* ================= Descarga Oficial por Separado (3 Tomos + Libro del Grimorio + Trilogía Unificada) ================= */
const downloadCardsHTML = () => {
  const G = D.grimorioBook || {};
  const pageCounts = { 'tomo-1': 305, 'tomo-2': 407, 'tomo-final': 509 };
  return `
  <!-- EDICIÓN MAESTRA RECOPILATORIA DE LOS 3 TOMOS + GRIMORIO Y BESTIARIO -->
  <div class="dl-showcase" style="margin-bottom:24px">
    <div class="dl-card rise" style="border:2px solid rgba(212,175,55,0.65);background:linear-gradient(135deg, rgba(16,42,32,0.88), rgba(24,14,18,0.92))">
      <div class="dl-badge" style="color:#fbbf24">★ VERSIÓN LIBRO COMPLETA · RECOPILACIÓN DE LOS 3 TOMOS + GRIMORIO Y BESTIARIO (1.339 PÁGINAS)</div>
      <h3>El Sacrificio del Brujo Chilote — Edición Completa Unificada (PDF, Word y ePub)</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:440px;margin:10px 0">
        <img src="${esc(D.images.cover)}" alt="Portada General" style="width:100%;height:210px;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.5)">
        <img src="${esc(D.images.backCover)}" alt="Contraportada General" style="width:100%;height:210px;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.5)">
      </div>
      <p>La versión libro integral que recopila los <strong>Tres Tomos completos</strong> (159 capítulos e ilustraciones de capítulos con todos los personajes de la Mitología de Chiloé) más el <strong>Grimorio Rúnico, Bestiario de ${D.characters.length} entidades, Atlas Cartográfico, Árboles de Linajes y Glosario Mitológico</strong> en un solo volumen monumental sobre pergamino con texto vectorial seleccionable y letras capitulares iluminadas.</p>
      <ul class="dl-specs">
        <li><strong>1.339 páginas completas en PDF</strong> (texto real sobre pergamino), <strong>Word (.docx)</strong> y <strong>ePub (.epub) para Kindle / Apple Books</strong></li>
        <li>Incluye <strong>Tomo I (305 págs) + Tomo II (407 págs) + Tomo III (509 págs) + Grimorio, Linajes y Glosario (151 págs)</strong></li>
        <li>Incluye todas las ilustraciones de los nuevos personajes, runas y eventos históricos</li>
      </ul>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:auto">
        <a class="btn" style="flex:1" href="El_Sacrificio_del_Brujo_Chilote.pdf" download="El Sacrificio del Brujo Chilote - Edicion Completa.pdf">⬇ PDF Completo (1.339 Págs)</a>
        <a class="btn sec" style="flex:1" href="El_Sacrificio_del_Brujo_Chilote.docx" download="El Sacrificio del Brujo Chilote - Edicion Completa.docx">⬇ Word (.docx)</a>
        <a class="btn sec" style="flex:1" href="El_Sacrificio_del_Brujo_Chilote.epub" download="El Sacrificio del Brujo Chilote - Edicion Completa.epub">⬇ ePub (Kindle / eReaders)</a>
        <a class="btn sec" href="#/leer/trilogia-completa/0">🔊 Leer / Escuchar Online</a>
      </div>
    </div>
  </div>

  <div class="dl-showcase" style="grid-template-columns:repeat(auto-fit,minmax(310px,1fr))">
    ${D.books.map(b => {
      const chCount = b.acts.reduce((n, a) => n + a.chapters.length, 0);
      const pgs = pageCounts[b.id] || 305;
      return `
      <div class="dl-card rise">
        <div class="dl-badge">📕📘📗 Tomo ${esc(b.number)} por Separado · ${pgs} Páginas</div>
        <h3>Tomo ${esc(b.number)}: ${esc(b.title)}</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
          <img src="${esc(b.coverImage)}" alt="Portada Tomo ${esc(b.number)}" style="width:100%;height:190px;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
          <img src="${esc(b.backCoverImage)}" alt="Contraportada Tomo ${esc(b.number)}" style="width:100%;height:190px;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
        </div>
        <p>${esc(b.description)}</p>
        <ul class="dl-specs">
          <li><strong>${pgs} páginas completas</strong> en texto vectorial real sobre fondo de pergamino con capitulares iluminadas</li>
          <li><strong>${chCount} capítulos</strong> e ilustraciones de nuevos personajes y eventos del Tomo ${esc(b.number)}</li>
          <li>Disponible en PDF, Word (<code>.docx</code>) y ePub (<code>.epub</code>)</li>
        </ul>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto">
          <a class="btn" style="flex:1;padding:9px 10px;font-size:12px" href="${esc(b.pdfFile)}" download>⬇ PDF</a>
          <a class="btn sec" style="flex:1;padding:9px 10px;font-size:12px" href="${esc(b.docxFile)}" download>⬇ Word</a>
          ${b.epubFile ? `<a class="btn sec" style="flex:1;padding:9px 10px;font-size:12px" href="${esc(b.epubFile)}" download>⬇ ePub</a>` : ''}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <a class="btn sec" style="flex:1;padding:7px 10px;font-size:12px" href="${esc(b.coverImage)}" download>🖼 Bajar Portada</a>
          <a class="btn sec" style="flex:1;padding:7px 10px;font-size:12px" href="${esc(b.backCoverImage)}" download>🖼 Bajar Contraportada</a>
        </div>
      </div>`;
    }).join('')}

    ${G.title ? `
    <div class="dl-card rise">
      <div class="dl-badge">🔮 Cuarto Libro Separado · 151 Páginas · Grimorio, Bestiario y Glosario</div>
      <h3>${esc(G.title)}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
        <img src="${esc(G.coverImage)}" alt="Portada Grimorio" style="width:100%;height:190px;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
        <img src="${esc(G.backCoverImage)}" alt="Contraportada Grimorio" style="width:100%;height:190px;object-fit:cover;border-radius:6px;border:1px solid rgba(212,175,55,0.45)">
      </div>
      <p>${esc(G.synopsis)}</p>
      <ul class="dl-specs">
        <li><strong>151 páginas completas</strong> en pergamino vectorial (Runas, Bestiario, Atlas, Linajes, Cronología y Glosario)</li>
        <li><strong>Las 16 Runas del Tablón</strong> con cánticos + <strong>Bestiario de ${D.characters.length} entidades ilustradas (incluyendo las 19 deidades y seres de la Mitología de Chiloé)</strong></li>
        <li>Disponible en PDF, Word (<code>.docx</code>) y ePub (<code>.epub</code>)</li>
      </ul>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto">
        <a class="btn" style="flex:1;padding:9px 10px;font-size:12px" href="${esc(G.pdfFile)}" download>⬇ PDF (151 Págs)</a>
        <a class="btn sec" style="flex:1;padding:9px 10px;font-size:12px" href="${esc(G.docxFile)}" download>⬇ Word</a>
        ${G.epubFile ? `<a class="btn sec" style="flex:1;padding:9px 10px;font-size:12px" href="${esc(G.epubFile)}" download>⬇ ePub</a>` : ''}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <a class="btn sec" style="flex:1;padding:7px 10px;font-size:12px" href="${esc(G.coverImage)}" download>🖼 Bajar Portada</a>
        <a class="btn sec" style="flex:1;padding:7px 10px;font-size:12px" href="${esc(G.backCoverImage)}" download>🖼 Bajar Contraportada</a>
      </div>
    </div>` : ''}
  </div>`;
};

const allCoversGalleryHTML = () => {
  const G = D.grimorioBook || {};
  const items = [
    { img: D.books[0]?.coverImage, label: 'Portada — Tomo I: El Amor Eterno' },
    { img: D.books[0]?.backCoverImage, label: 'Contraportada — Tomo I: El Amor Eterno' },
    { img: D.books[1]?.coverImage, label: 'Portada — Tomo II: El Sacrificio' },
    { img: D.books[1]?.backCoverImage, label: 'Contraportada — Tomo II: El Sacrificio' },
    { img: D.books[2]?.coverImage, label: 'Portada — Tomo III: Nunca Es Tarde Para Salvar' },
    { img: D.books[2]?.backCoverImage, label: 'Contraportada — Tomo III: Nunca Es Tarde Para Salvar' },
    { img: G.coverImage, label: 'Portada — Libro IV: El Grimorio y Bestiario' },
    { img: G.backCoverImage, label: 'Contraportada — Libro IV: El Grimorio y Bestiario' },
    { img: D.images.cover, label: 'Portada General — Trilogía Completa' },
    { img: D.images.backCover, label: 'Contraportada General — Trilogía Completa' },
    { img: D.images.spine || 'img/Lateral.jpg', label: 'Lomo Editorial del Códice (Lateral)' },
    { img: D.images.bookmark || 'img/Guarda_Pagina.jpg', label: 'Guarda Página / Marcapáginas Oficial' },
    { img: 'img/QR_El_Sacrificio_del_Brujo_Chilote.png', label: 'Código QR Oficial Ilustrado (Acceso Directo Web)' }
  ].filter(x => x.img);

  return `<div class="covers-showcase" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
    ${items.map(it => `
      <div class="cover-card">
        <img src="${esc(it.img)}" alt="${esc(it.label)}" loading="lazy">
        <span>${esc(it.label)}</span>
        <a class="btn sec" style="margin-top:8px;padding:7px 14px;font-size:12px" href="${esc(it.img)}" download>⬇ Descargar Arte (.jpg)</a>
      </div>
    `).join('')}
  </div>`;
};

const downloadView = () => `
  <h2 class="title" style="margin-top:10px">Centro de Descargas — Edición Completa, 3 Tomos y Grimorio (PDF, Word y ePub)</h2>
  <p style="text-align:center;color:var(--muted);max-width:820px;margin:-12px auto 26px">
    Descarga la <strong>Edición Completa Recopilatoria (1.339 páginas)</strong>, cada uno de los <strong>Tres Tomos por separado</strong> (305, 407 y 509 páginas), o el <strong>Cuarto Libro del Grimorio, Bestiario, Linajes y Glosario (151 páginas)</strong> en formato <strong>PDF vectorial sobre pergamino</strong>, <strong>Microsoft Word (<code>.docx</code>)</strong> y <strong>ePub (<code>.epub</code> para Kindle, Apple Books y Kobo)</strong>.
  </p>
  ${downloadCardsHTML()}
  <h2 class="title">Galería Descargable de Todas las Portadas, Contraportadas, Lomo y Marcapáginas</h2>
  ${allCoversGalleryHTML()}`;

/* ================= Enrutador Principal ================= */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
function route() {
  stopTTS();
  const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  readerKey = null; cur = null; busy = false; setAccent('emerald');
  let html = '';
  if (!p.length) html = home();
  else if (p[0] === 'libros') html = books();
  else if (p[0] === 'libro') html = book(p[1]);
  else if (p[0] === 'leer') { reader(p[1], +p[2] || 0); markNav(p); return; }
  else if (p[0] === 'escenas') {
    const f = p[1] || 'all';
    if (f === 'tomo-2') setAccent('rose');
    else if (f === 'tomo-final') setAccent('violet');
    html = scenesView(f);
  }
  else if (p[0] === 'mapa') { html = mapView(+p[1] || 0); if (soundOn) setMood(2); }
  else if (p[0] === 'personajes') html = characters(p[1] || 'all');
  else if (p[0] === 'oraculo') { setAccent('violet'); html = oracleView(); }
  else if (p[0] === 'linajes') { html = lineagesView(p[1] || 'all'); }
  else if (p[0] === 'descargar') html = downloadView();
  else if (p[0] === 'runas') {
    setAccent('violet');
    html = runes(+p[1] || 0);
    setTimeout(() => {
      const e = document.querySelector('.rune-drawn');
      if (e) { const r = e.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40); rustle(); }
    }, 60);
  }
  else html = notFound();

  app.innerHTML = html; markNav(p);
  if (p[0] !== 'mapa' && p[0] !== 'runas' && p[0] !== 'escenas' && p[0] !== 'personajes' && p[0] !== 'linajes') window.scrollTo(0, 0);
  document.querySelectorAll('.rise').forEach(c => io.observe(c));
  document.querySelectorAll('a.card[data-acc], div.card[data-acc]').forEach(c => c.onmouseenter = () => setAccent(c.dataset.acc));

  const b3d = document.getElementById('book3d');
  const flipBtn = document.getElementById('flip-cov');
  if (b3d && flipBtn) {
    const toggleFlip = () => {
      b3d.classList.toggle('flipped');
      const r = b3d.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 35);
      rustle();
    };
    b3d.onclick = toggleFlip;
    flipBtn.onclick = toggleFlip;
  }
}

function markNav(p) {
  const t = '#/' + ({ libro: 'libros', leer: 'libros' }[p[0]] || p[0] || '');
  document.querySelectorAll('.nav nav a, .mobile-bottom-nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === t));
  const navEl = document.querySelector('.nav');
  if (navEl) navEl.classList.remove('mob-open');
}
addEventListener('hashchange', route);
route();
