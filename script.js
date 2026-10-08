// Always start from the top (first page) after a refresh or when coming back with the Back button
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);
addEventListener('pageshow', () => scrollTo(0, 0));
addEventListener('load', () => scrollTo(0, 0));

// ===== CONFIG: edit these =====
const WEDDING_DATE = new Date('2026-12-11T19:00:00');
const EVENT_TITLE = 'Tannu & Saurav Wedding';
const VENUE_NAME = '';      // e.g. 'Rose Palace'
const VENUE_ADDRESS = '';   // e.g. '12 Lakeview Road, Patna, Bihar' (used for the map)
const EVENT_LOCATION = [VENUE_NAME, VENUE_ADDRESS].filter(Boolean).join(', ') || 'Venue to be announced';

// Story chapters: edit text and optionally add a photo path
const STORY = [
  { year: 'Chapter 1', title: 'A Call, A Hello', text: 'It was meant to be a call with a friend. It turned out to be so much more.', img: 'assets/photos/story1.jpg' },
  { year: 'Chapter 2', title: 'One Call Became Many', text: 'Short hellos turned into long conversations. Somewhere between the laughter and the late nights, we stopped needing a reason to call.', img: 'assets/photos/story2.jpg' },
  { year: 'Chapter 3', title: 'Meeting in Person', text: 'The voice finally had a face. It felt like we had known each other forever.', img: 'assets/photos/story3.jpg' },
  { year: 'Chapter 4', title: 'Forever Begins', text: 'From one random call to seven pheras. Join us as we begin our forever.', img: 'assets/photos/story4.jpg' },
];
// Gallery: put photos in assets/photos and list them here
const PHOTOS = [
  { src: '1.jpg', cap: 'The day we met' },
  { src: '2.jpg', cap: 'Our first laugh' },
  { src: '3.jpg', cap: 'The little talks' },
  { src: '4.jpg', cap: 'Getting closer' },
  { src: '5.jpg', cap: 'Creating memories' },
  { src: '6.jpg', cap: 'Forever to go' },
];
// ==============================

// Build story + gallery
document.getElementById('story').innerHTML = STORY.map((c, i) =>
  `<div class="ch ${i % 2 ? 'r' : 'l'} reveal"><div class="pic" style="background-image:url('${c.img}')"><i class="tape"></i></div><div class="note"><b class="cn">Chapter ${i + 1}</b><h3>${c.title}</h3><p>${c.text}</p></div></div>`).join('');
document.getElementById('grid').innerHTML = PHOTOS.map((p, i) =>
  `<figure class="pl reveal" style="--r:${[-2.2, 1.8, 1.4, -1.6, -1.2, 2][i % 6]}deg;--d:${(i % 2) * .15}s"><i class="tape"></i><b class="num">${String(i + 1).padStart(2, '0')}</b><div class="frame"><img src="assets/photos/${p.src}" alt="${p.cap}" loading="lazy" onerror="this.style.visibility='hidden'"></div><figcaption>${p.cap}</figcaption></figure>`).join('');

// Calendar with animated heart on the wedding day
(function () {
  const y = WEDDING_DATE.getFullYear(), m = WEDDING_DATE.getMonth(), day = WEDDING_DATE.getDate();
  const first = new Date(y, m, 1).getDay(), total = new Date(y, m + 1, 0).getDate();
  const month = WEDDING_DATE.toLocaleString('en', { month: 'long' });
  let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<span class="dow">${d}</span>`).join('');
  cells += '<span></span>'.repeat(first);
  for (let d = 1; d <= total; d++)
    cells += d === day ? `<span class="wd"><svg class="heart" viewBox="0 0 32 29"><path d="M16 28C5 19 1 14 1 8.500 1 4 4.500 1 8.500 1c3 0 5.500 1.700 7.500 4.500C18 2.700 20.500 1 23.500 1 27.500 1 31 4 31 8.500 31 14 27 19 16 28z"/></svg><b>${d}</b></span>` : `<span>${d}</span>`;
  document.getElementById('calendar').innerHTML = `<h3>${month} ${y}</h3><div class="cal-grid">${cells}</div>`;
})();

// Lightbox
const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img');
document.getElementById('grid').addEventListener('click', e => {
  const img = e.target.closest('.pl')?.querySelector('img');
  if (img) { lbImg.src = img.src; lb.hidden = false; }
});
lb.addEventListener('click', () => lb.hidden = true);

// Music (starts on envelope tap since browsers block autoplay)
const bgm = document.getElementById('bgm'), mBtn = document.getElementById('music');
// Playlist: plays the songs in order, then starts again from the first. Add more songs here.
const PLAYLIST = ['assets/music.mp3', 'assets/music2.mp3'];
let track = 0, skipped = 0;
function playTrack(i) {
  track = i % PLAYLIST.length;
  bgm.src = PLAYLIST[track];
  return bgm.play();
}
bgm.addEventListener('ended', () => { skipped = 0; playTrack(track + 1).catch(() => {}); });
// a song that is missing or can't play is skipped (stop if none of them work)
bgm.addEventListener('error', () => { if (++skipped < PLAYLIST.length) playTrack(track + 1).catch(() => {}); });
function fadeIn() { bgm.volume = 0; let v = 0; const t = setInterval(() => { v = Math.min(.6, v + .03); bgm.volume = v; if (v >= .6) clearInterval(t); }, 150); }
mBtn.addEventListener('click', () => {
  if (bgm.paused) { bgm.play(); mBtn.classList.remove('off'); } else { bgm.pause(); mBtn.classList.add('off'); }
});

// Envelope intro
const envelope = document.getElementById('envelope');
const intro = document.getElementById('intro');
envelope.addEventListener('click', () => {
  envelope.classList.add('open');
  bgm.play().then(() => { fadeIn(); mBtn.hidden = false; }).catch(() => { mBtn.hidden = false; mBtn.classList.add('off'); });
  setTimeout(() => {
    intro.classList.add('done');
    document.body.classList.remove('locked');
    document.body.classList.add('opened');
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('in'));
  }, 1700);
}, { once: true });

// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  e.target.classList.toggle('in', e.isIntersecting);
}), { threshold: .2 });
document.querySelectorAll('.reveal:not(.hero .reveal)').forEach(el => io.observe(el));

// Countdown with flip effect
const ids = ['d', 'h', 'm', 's'].map(i => document.getElementById(i));
function tick() {
  let diff = Math.max(0, WEDDING_DATE - Date.now()) / 1000;
  const vals = [Math.floor(diff / 86400), Math.floor(diff % 86400 / 3600), Math.floor(diff % 3600 / 60), Math.floor(diff % 60)];
  vals.forEach((v, i) => {
    const t = String(v).padStart(2, '0');
    if (ids[i].textContent !== t) {
      ids[i].textContent = t;
      ids[i].classList.remove('tick'); void ids[i].offsetWidth; ids[i].classList.add('tick');
    }
  });
}
tick(); setInterval(tick, 1000);

// Parallax on hero names
addEventListener('scroll', () => {
  document.querySelector('.names').style.transform = `translateY(${scrollY * .25}px)`;
}, { passive: true });

// Falling petals
const c = document.getElementById('petals'), ctx = c.getContext('2d');
let petals = [];
function resize() { c.width = innerWidth; c.height = innerHeight; }
addEventListener('resize', resize); resize();
const colors = ['#f4a6b4', '#f8c8d0', '#e88fa0', '#ffd9b8'];
const make = () => ({ x: Math.random() * c.width, y: -20, s: 6 + Math.random() * 10, vy: .6 + Math.random() * 1.2, vx: Math.random() - .5, r: Math.random() * 6, vr: (Math.random() - .5) * .05, sw: Math.random() * 6, col: colors[Math.random() * colors.length | 0] });
for (let i = 0; i < 30; i++) { const p = make(); p.y = Math.random() * c.height; petals.push(p); }
(function draw() {
  ctx.clearRect(0, 0, c.width, c.height);
  petals.forEach((p, i) => {
    p.y += p.vy; p.sw += .02; p.x += p.vx + Math.sin(p.sw) * .8; p.r += p.vr;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.globalAlpha = .75;
    ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s / 2, 0, 0, 7); ctx.fill(); ctx.restore();
    if (p.y > c.height + 20) petals[i] = make();
  });
  requestAnimationFrame(draw);
})();

// Add to calendar (.ics)
document.getElementById('cal').addEventListener('click', e => {
  e.preventDefault();
  const f = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const end = new Date(WEDDING_DATE.getTime() + 4 * 3600e3);
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${EVENT_TITLE}\nLOCATION:${EVENT_LOCATION}\nDTSTART:${f(WEDDING_DATE)}\nDTEND:${f(end)}\nEND:VEVENT\nEND:VCALENDAR`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'wedding.ics'; a.click();
});

// Reception: night-sky fireworks (runs only while the page is on screen)
(function () {
  const panel = document.querySelector('.fn.reception'), cv = document.getElementById('fw');
  if (!panel || !cv || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const g = cv.getContext('2d'), cols = ['#ffd27a', '#ff7aa8', '#ff9d3d', '#fff6d6', '#8fd3ff', '#c79bff'];
  let W, H, rockets = [], sparks = [], stars = [], running = false, next = 0;
  function size() {
    W = cv.width = panel.clientWidth; H = cv.height = panel.clientHeight;
    stars = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H * .7, r: Math.random() * 1.3 + .3, p: Math.random() * 6 }));
  }
  addEventListener('resize', size); size();
  function burst(x, y) {
    const c = cols[Math.random() * cols.length | 0], c2 = cols[Math.random() * cols.length | 0], n = 70 + (Math.random() * 40 | 0);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * 2 * i / n, v = 1.2 + Math.random() * 2.6;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, col: i % 3 ? c : c2 });
    }
  }
  function frame(t) {
    if (!running) return;
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    stars.forEach(s => { g.globalAlpha = .35 + .35 * Math.sin(t / 700 + s.p); g.fillStyle = '#fff'; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill(); });
    if (t > next) { rockets.push({ x: W * (.35 + Math.random() * .6), y: H, ty: H * (.12 + Math.random() * .4), vy: -(5 + Math.random() * 2) }); next = t + 700 + Math.random() * 900; }
    rockets = rockets.filter(r => {
      r.y += r.vy; g.globalAlpha = 1; g.fillStyle = '#ffe9b0'; g.fillRect(r.x, r.y, 2, 8);
      if (r.y <= r.ty) { burst(r.x, r.y); return false; } return true;
    });
    sparks = sparks.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .035; p.vx *= .985; p.life -= .011;
      g.globalAlpha = Math.max(p.life, 0); g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, 1.8, 0, 7); g.fill();
      return p.life > 0;
    });
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !running) { running = true; size(); requestAnimationFrame(frame); }
    else if (!e.isIntersecting) { running = false; g.clearRect(0, 0, W, H); }
  }), { threshold: .3 }).observe(panel);
})();

// Venue: real Google Map in a card
(function () {
  if (!VENUE_ADDRESS) return;
  const q = encodeURIComponent([VENUE_NAME, VENUE_ADDRESS].filter(Boolean).join(', '));
  const f = document.getElementById('mapFrame');
  f.src = `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
  f.hidden = false;
  document.getElementById('mapEmpty').hidden = true;
  document.getElementById('mapLink').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  document.getElementById('venueText').textContent = [VENUE_NAME, VENUE_ADDRESS].filter(Boolean).join(' · ');
})();

// Pages: animated page turn, next-page arrow and auto-advance after 3 seconds of no activity
(function () {
  const AUTO_MS = 3000, MOVE_MS = 1200;
  const btn = document.getElementById('next');
  const root = document.documentElement;
  const pages = [...document.querySelectorAll('main>section:not(.events), main>section.events>.fn, main>footer')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lightbox = document.getElementById('lightbox');
  let auto = !reduce, moving = false, lastActive = Date.now();
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const top = p => p.getBoundingClientRect().top;
  const current = () => pages.reduce((a, b) => Math.abs(top(b)) < Math.abs(top(a)) ? b : a);
  const next = () => pages[pages.indexOf(current()) + 1];
  const locked = () => document.body.classList.contains('locked');
  const touch = () => { lastActive = Date.now(); };

  function goTo(p) {
    if (!p || moving) return;
    const from = scrollY, to = from + top(p), t0 = performance.now();
    moving = true; root.classList.add('is-moving');
    (function step(now) {
      const k = Math.min(1, (now - t0) / MOVE_MS);
      scrollTo(0, from + (to - from) * ease(k));
      if (k < 1) requestAnimationFrame(step);
      else { moving = false; root.classList.remove('is-moving'); touch(); }
    })(t0);
  }

  // one steady ticker decides when to advance, so no pause can ever get "stuck"
  setInterval(() => {
    if (!auto || moving || locked() || document.hidden || !lightbox.hidden) return;
    if (Date.now() - lastActive < AUTO_MS) return;
    const n = next();
    if (n) goTo(n);
  }, 250);

  function update() {
    const last = pages[pages.length - 1];
    btn.hidden = locked() || top(last) < innerHeight * .5;
    ab.hidden = locked();
  }

  // auto on/off button
  const ab = document.createElement('button');
  ab.id = 'autoBtn'; ab.className = 'autobtn'; ab.hidden = true;
  const label = () => { ab.textContent = auto ? 'Auto \u275A\u275A' : 'Auto \u25B6'; ab.setAttribute('aria-pressed', auto); };
  ab.addEventListener('click', () => { auto = !auto; label(); touch(); });
  label(); document.body.appendChild(ab);

  btn.addEventListener('click', () => { touch(); goTo(next()); });
  // any user activity restarts the 3-second wait
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'keydown', 'mousemove']
    .forEach(ev => addEventListener(ev, () => { if (!moving) touch(); }, { passive: true }));
  addEventListener('scroll', () => { update(); if (!moving) touch(); }, { passive: true });
  addEventListener('resize', update);
  document.addEventListener('visibilitychange', touch);
  new MutationObserver(() => { update(); touch(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(touch).observe(lightbox, { attributes: true, attributeFilter: ['hidden'] });
  update();
})();
