'use strict';

/* ================================================================
   CONFIG — modifica la password qui
   ================================================================ */
const ADMIN_PASSWORD = 'pederzoli2025';

/* ================================================================
   DATI DEFAULT
   ================================================================ */
const SERVICES_DATA = [
  {
    icon: 'fa-stethoscope', title: 'Prestazioni ambulatoriali',
    desc: 'Visite urologiche specialistiche, follow-up oncologici, cistoscopia ambulatoriale e urodinamica.',
    list: ['Visita urologica', 'Ecografia prostatica trans-rettale', 'Cistoscopia ambulatoriale', 'Biopsia prostatica eco-guidata', 'Urodinamica']
  },
  {
    icon: 'fa-x-ray', title: 'Ambulatorio uro-radiologia',
    desc: 'Diagnostica per immagini dedicata alle patologie urologiche, in sinergia con la radiologia interventistica.',
    list: ['Uro-TC con mezzo di contrasto', 'Risonanza multiparametrica prostatica (mpMRI)', 'Cistografia minzionale', 'Uretrocistoscopia']
  },
  {
    icon: 'fa-syringe', title: 'Chirurgia avanzata',
    desc: 'Interventi laparoscopici, mininvasivi e open per patologie benigne e oncologiche di rene, vescica, prostata, testicolo e surrene.',
    list: ['Nefrectomia laparoscopica', 'Prostatectomia radicale', 'Cistectomia radicale', 'Pieloplastica', 'Adrenalectomia']
  },
  {
    icon: 'fa-robot', title: 'Tecnologie robotiche',
    desc: 'Centro di riferimento per la chirurgia robotica con Da Vinci Multiport e Single Port, tra i pochi centri in Italia ad adottare entrambe le piattaforme.',
    list: ['Da Vinci Xi Multiport', 'Da Vinci SP Single Port', 'Prostatectomia robotica nerve-sparing', 'Pieloplastica robotica', 'Nefroureterectomia robotica']
  }
];

const DEFAULT_TEAM = [
  { name: 'Dott. Luca Aresu',           role: 'Urologo',                 photo: '' },
  { name: 'Dott. Rossella Bertoloni',    role: 'Urologa',                 photo: '' },
  { name: 'Dott. Gaetano Grosso',        role: 'Direttore U.O. Urologia', photo: '' },
  { name: 'Dott.ssa Sara Grosso',        role: 'Urologa',                 photo: '' },
  { name: 'Dott. Armando Marciano',      role: 'Urologo',                 photo: '' },
  { name: 'Dott. Matteo Marini',         role: 'Urologo',                 photo: '' },
  { name: 'Dott. Francesco Maritati',    role: 'Urologo',                 photo: '' },
  { name: 'Dott. Arjan Nazaraj',         role: 'Urologo',                 photo: '' },
  { name: 'Dott. Massimo Occhipinti',    role: 'Urologo',                 photo: '' },
  { name: 'Dott.ssa Angela Pecoraro',    role: 'Urologa',                 photo: '' },
  { name: 'Dott. Andrea Polara',         role: 'Urologo',                 photo: '' },
  { name: 'Dott. Sebastiano Rapisarda',  role: 'Urologo',                 photo: '' },
  { name: 'Dott.ssa Federica Trovato',   role: 'Urologa',                 photo: '' }
];

const DEFAULT_SETTINGS = {
  about:       "Il reparto di Urologia dell'Ospedale Pederzoli è un centro di riferimento nazionale per la chirurgia urologica robotica e mininvasiva. Con un team di professionisti altamente specializzati e tecnologie d'avanguardia, offriamo cure di eccellenza per patologie urologiche benigne e oncologiche.\n\nLa nostra filosofia unisce rigore scientifico e umanità: ogni paziente è accolto con attenzione e rispetto, in un ambiente pensato per il benessere fisico e psicologico.",
  address:     'Via Monte Baldo, 24 — 37019 Peschiera del Garda (VR)',
  phone:       '+39 045 6449111',
  email:       'urologia@pederzoli.it',
  hours:       'Lunedì – Venerdì: 8:00 – 16:00',
  prenoting:   'https://portalepaziente.ospedalepederzoli.it/home.php?virtualSites[]=0',
  mypederzoli: 'https://www.ospedalepederzoli.it/mypederzoli/'
};

/* ================================================================
   STORAGE
   ================================================================ */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('Errore: spazio insufficiente.'); } }
};

/* ================================================================
   STATE
   ================================================================ */
let posts, gallery, team, settings;

function loadState() {
  posts    = LS.get('uro_posts',    []);
  gallery  = LS.get('uro_gallery',  []);
  team     = LS.get('uro_team',     null); if (!team)     { team     = JSON.parse(JSON.stringify(DEFAULT_TEAM));  LS.set('uro_team',     team);     }
  settings = LS.get('uro_settings', null); if (!settings) { settings = Object.assign({}, DEFAULT_SETTINGS);      LS.set('uro_settings', settings); }
  // migra URL segnaposto obsoleti al valore corretto
  let dirty = false;
  if (!settings.prenoting   || settings.prenoting   === 'https://www.prenoting.it')  { settings.prenoting   = DEFAULT_SETTINGS.prenoting;   dirty = true; }
  if (!settings.mypederzoli || settings.mypederzoli === 'https://my.pederzoli.it')   { settings.mypederzoli = DEFAULT_SETTINGS.mypederzoli; dirty = true; }
  if (dirty) LS.set('uro_settings', settings);
}

/* ================================================================
   UTILITIES
   ================================================================ */
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc  = s => s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
const fmtD = iso => new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

function embedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) { const id = u.searchParams.get('v'); if (id) return `https://www.youtube.com/embed/${id}`; }
    if (u.hostname === 'youtu.be')           { const id = u.pathname.slice(1);     if (id) return `https://www.youtube.com/embed/${id}`; }
    if (u.hostname.includes('vimeo.com'))    { const id = u.pathname.split('/').filter(Boolean).pop(); if (id) return `https://player.vimeo.com/video/${id}`; }
  } catch {}
  return null;
}

function ytId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || null;
    if (u.hostname === 'youtu.be')           return u.pathname.slice(1)     || null;
  } catch {}
  return null;
}

function loadVideo(el, src) {
  const ytMatch = src.match(/youtube\.com\/embed\/([^?&]+)/);
  if (ytMatch) {
    window.open('https://www.youtube.com/watch?v=' + ytMatch[1], '_blank', 'noopener,noreferrer');
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.setAttribute('style', 'width:100%;aspect-ratio:16/9;border:none;display:block');
  el.replaceWith(iframe);
}

function readFile(file) {
  return new Promise((ok, err) => { const r = new FileReader(); r.onload = e => ok(e.target.result); r.onerror = err; r.readAsDataURL(file); });
}

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

/* ================================================================
   INIT PAGINA — chiamato da ogni HTML
   ================================================================ */
function initPage(pageName) {
  loadState();
  injectScrollBar();
  injectHeader(pageName);
  injectFooter();
  injectToast();
  setupScrollProgress();
  setupHamburger();
  document.getElementById('footer-yr').textContent = new Date().getFullYear();
  applySettings();
}

/* ================================================================
   SCROLL PROGRESS
   ================================================================ */
function injectScrollBar() {
  const el = document.createElement('div');
  el.id = 'scroll-bar';
  el.setAttribute('role', 'progressbar');
  el.setAttribute('aria-label', 'Avanzamento lettura');
  document.body.prepend(el);
}

function setupScrollProgress() {
  window.addEventListener('scroll', () => {
    const st = document.documentElement.scrollTop || document.body.scrollTop;
    const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const el = document.getElementById('scroll-bar');
    if (el && sh) el.style.width = (st / sh * 100) + '%';
  }, { passive: true });
}

/* ================================================================
   HEADER
   ================================================================ */
const NAV_ITEMS = [
  { href: 'index.html',     label: 'Home',       page: 'home' },
  { href: 'servizi.html',   label: 'Servizi',    page: 'servizi' },
  { href: 'patologie.html', label: 'Patologie',  page: 'patologie' },
  { href: 'team.html',      label: 'Team',       page: 'team' },
  { href: 'news.html',      label: 'News',       page: 'news' },
  { href: 'galleria.html',  label: 'Galleria',   page: 'galleria' },
  { href: 'contatti.html',  label: 'Contatti',   page: 'contatti', cta: true },
];

function injectHeader(activePage) {
  const links = NAV_ITEMS.map(n => {
    const active = n.page === activePage ? ' active' : '';
    const cls    = (n.cta ? ' nav-cta' : '') + active;
    return `<a href="${n.href}" class="${cls.trim()}"${n.page === activePage ? ' aria-current="page"' : ''}>${n.label}</a>`;
  }).join('');

  const html = `
  <header id="site-header">
    <div class="hdr-inner">
      <a href="index.html" class="hdr-brand" aria-label="Vai alla homepage">
        <span class="dept">Urologia</span>
        <span class="hosp">Ospedale Pederzoli</span>
      </a>
      <button class="hamburger" id="hamburger" aria-label="Apri menu" aria-expanded="false">
        <i class="fas fa-bars"></i>
      </button>
      <nav id="main-nav" aria-label="Navigazione principale">${links}</nav>
    </div>
  </header>`;

  document.body.insertAdjacentHTML('afterbegin', html);
}

function setupHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function() {
    const open = nav.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
}

/* ================================================================
   FOOTER
   ================================================================ */
function injectFooter() {
  const html = `
  <footer>
    <div style="max-width:var(--max-w);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;text-align:left;padding-bottom:2rem;border-bottom:1px solid rgba(255,255,255,.12)">
      <div>
        <div style="font-family:var(--font-title);font-size:1.1rem;color:white;margin-bottom:.5rem">Urologia</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.5);letter-spacing:.06em;text-transform:uppercase">Ospedale Pederzoli</div>
        <div style="margin-top:1rem;display:flex;flex-direction:column;gap:.4rem">
          <span style="font-size:.85rem;color:rgba(255,255,255,.7)"><i class="fas fa-map-marker-alt" style="width:16px;color:var(--accent)"></i> Via Monte Baldo, 24 — 37019 Peschiera del Garda (VR)</span>
          <span style="font-size:.85rem;color:rgba(255,255,255,.7)"><i class="fas fa-phone"           style="width:16px;color:var(--accent)"></i> +39 045 6449111</span>
          <span style="font-size:.85rem;color:rgba(255,255,255,.7)"><i class="fas fa-envelope"        style="width:16px;color:var(--accent)"></i> urologia@pederzoli.it</span>
          <span style="font-size:.85rem;color:rgba(255,255,255,.7)"><i class="fas fa-door-open"       style="width:16px;color:var(--accent)"></i> Ingresso 2, piano terra, Area D01</span>
        </div>
      </div>
      <div>
        <div style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:.75rem">Pagine</div>
        <nav style="display:flex;flex-direction:column;gap:.4rem" aria-label="Link footer">
          <a href="index.html"     class="ftr-lnk">Home</a>
          <a href="servizi.html"   class="ftr-lnk">Servizi</a>
          <a href="patologie.html" class="ftr-lnk">Patologie</a>
          <a href="team.html"      class="ftr-lnk">Team medico</a>
          <a href="news.html"      class="ftr-lnk">News &amp; Aggiornamenti</a>
          <a href="galleria.html"  class="ftr-lnk">Galleria</a>
          <a href="contatti.html"  class="ftr-lnk">Contatti</a>
        </nav>
      </div>
      <div>
        <div style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:.75rem">Prenotazioni</div>
        <div style="display:flex;flex-direction:column;gap:.5rem">
          <a href="https://portalepaziente.ospedalepederzoli.it/home.php?virtualSites[]=0" target="_blank" rel="noopener noreferrer" class="ftr-lnk"><i class="fas fa-calendar-check" style="margin-right:.4rem;color:var(--accent)"></i>Prenoting™</a>
          <a href="https://www.ospedalepederzoli.it/mypederzoli/" target="_blank" rel="noopener noreferrer" class="ftr-lnk"><i class="fas fa-file-medical" style="margin-right:.4rem;color:var(--accent)"></i>My Pederzoli</a>
        </div>
        <div style="margin-top:1.5rem">
          <div style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:.75rem">Area riservata</div>
          <a href="admin.html" class="ftr-admin-lnk"><i class="fas fa-lock"></i> Pannello admin</a>
        </div>
      </div>
    </div>
    <div style="max-width:var(--max-w);margin:0 auto;padding-top:1.25rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem">
      <p style="font-size:.78rem;color:rgba(255,255,255,.4)">© <span id="footer-yr"></span> Ospedale Pederzoli S.p.A. — P.IVA 00244840237. Tutti i diritti riservati.</p>
    </div>
  </footer>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ================================================================
   TOAST
   ================================================================ */
function injectToast() {
  if (document.getElementById('toast')) return;
  const el = document.createElement('div');
  el.id = 'toast';
  document.body.appendChild(el);
}

/* ================================================================
   APPLY SETTINGS TO PAGE
   ================================================================ */
function applySettings() {
  const tx = (id, v) => { const e = document.getElementById(id); if (e && v) e.textContent = v; };
  const lk = (id, v) => { const e = document.getElementById(id); if (e && v) e.href = v; };
  if (settings.about) {
    const e = document.getElementById('about-text');
    if (e) e.innerHTML = settings.about.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  }
  tx('c-address', settings.address);
  tx('c-phone',   settings.phone);
  tx('c-email',   settings.email);
  tx('c-hours',   settings.hours);
  lk('prenoting-link',   settings.prenoting);
  lk('mypederzoli-link', settings.mypederzoli);
}

/* ================================================================
   SERVIZI
   ================================================================ */
function renderServices() {
  const grid = document.getElementById('svc-grid');
  if (!grid) return;
  grid.innerHTML = SERVICES_DATA.map((s, i) => `
    <div class="svc-card" id="sc${i}">
      <div class="svc-head" role="button" tabindex="0" aria-expanded="false" aria-controls="sb${i}"
           onclick="toggleSvc(${i})" onkeydown="if(event.key==='Enter'||event.key===' ')toggleSvc(${i})">
        <i class="fas ${s.icon} si" aria-hidden="true"></i>
        <h3>${s.title}</h3>
        <i class="fas fa-chevron-down tog" aria-hidden="true"></i>
      </div>
      <div class="svc-body" id="sb${i}">
        <p>${s.desc}</p>
        <ul>${s.list.map(l => `<li>${l}</li>`).join('')}</ul>
      </div>
    </div>`).join('');
}

function toggleSvc(i) {
  const c = document.getElementById('sc' + i);
  const h = c.querySelector('.svc-head');
  h.setAttribute('aria-expanded', c.classList.toggle('open'));
}

/* ================================================================
   TEAM
   ================================================================ */
function renderTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;
  grid.innerHTML = team.map(m => `
    <article class="team-card">
      <div class="tc-photo">
        ${m.photo
          ? `<img src="${m.photo}" alt="Foto di ${esc(m.name)}" loading="lazy">`
          : `<div class="tc-placeholder" aria-hidden="true"><i class="fas fa-user-md"></i></div>`}
      </div>
      <div class="tc-info">
        <div class="tc-name">${esc(m.name)}</div>
        <div class="tc-role">${esc(m.role)}</div>
      </div>
    </article>`).join('');
}

/* ================================================================
   POSTS / NEWS
   ================================================================ */
let curFilter = 'all';
const tagClass = { 'Notizia': 'tag-n', 'Intervista': 'tag-i', 'Evento': 'tag-e', 'Articolo scientifico': 'tag-a' };

function renderPosts() {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;
  const list = (curFilter === 'all' ? posts : posts.filter(p => p.category === curFilter))
               .slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!list.length) {
    grid.innerHTML = `<div class="no-posts"><i class="fas fa-newspaper" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.75rem"></i>Nessun aggiornamento disponibile al momento.</div>`;
    return;
  }
  grid.innerHTML = list.map(p => {
    const ev  = p.videoUrl ? embedUrl(p.videoUrl) : null;
    const vid = p.videoUrl ? ytId(p.videoUrl) : null;
    let mediaHtml = '';
    if (ev) {
      if (vid) {
        const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
        mediaHtml = `<div class="post-vid">
          <div class="vid-facade" onclick="loadVideo(this,'${ev}')" role="button" aria-label="Riproduci video: ${esc(p.title)}">
            <img src="${thumb}" alt="Anteprima: ${esc(p.title)}" loading="lazy">
            <div class="vid-play"><div class="vid-play-btn"><i class="fas fa-play"></i></div></div>
          </div></div>`;
      } else {
        mediaHtml = `<div class="post-vid"><iframe src="${ev}" title="${esc(p.title)}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
      }
    } else if (p.image) {
      mediaHtml = `<img class="post-img" src="${p.image}" alt="${esc(p.title)}" loading="lazy">`;
    }
    return `<article class="post-card">
      ${mediaHtml}
      <div class="post-body">
        <div class="post-meta">
          <span class="ptag ${tagClass[p.category] || 'tag-n'}">${esc(p.category)}</span>
          <span class="pdate"><time datetime="${p.date}">${fmtD(p.date)}</time></span>
        </div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
      </div>
    </article>`;
  }).join('');
}

function setupPostFilters() {
  document.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', function() {
    document.querySelectorAll('.fbtn').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
    this.classList.add('active'); this.setAttribute('aria-pressed', 'true');
    curFilter = this.dataset.f; renderPosts();
  }));
}

/* ================================================================
   GALLERIA
   ================================================================ */
function renderGallery() {
  const grid  = document.getElementById('gal-grid');
  const empty = document.getElementById('gal-empty');
  if (!grid) return;
  if (!gallery.length) { grid.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = gallery.map(item => {
    if (item.type === 'photo') return `
      <div class="gal-item" tabindex="0" role="button" aria-label="Apri foto: ${esc(item.caption || 'Foto')}"
           onclick="openLb('${item.src.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}','${esc(item.caption || '')}')"
           onkeydown="if(event.key==='Enter'||event.key===' ')openLb('${item.src.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}','${esc(item.caption || '')}')">
        <img src="${item.src}" alt="${esc(item.caption || 'Foto del reparto di Urologia')}" loading="lazy">
        <div class="gal-overlay" aria-hidden="true"><i class="fas fa-expand"></i></div>
      </div>`;
    const ev  = embedUrl(item.url);
    const vid = ytId(item.url);
    if (!ev) return '';
    if (vid) {
      const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
      return `<div class="gal-vid">
        ${item.title ? `<div class="gal-vid-title"><i class="fas fa-play-circle" style="margin-right:.4rem"></i>${esc(item.title)}</div>` : ''}
        <div class="vid-facade" onclick="loadVideo(this,'${ev}')" role="button" aria-label="Riproduci video${item.title ? ': ' + esc(item.title) : ''}">
          <img src="${thumb}" alt="Anteprima${item.title ? ': ' + esc(item.title) : ''}" loading="lazy">
          <div class="vid-play"><div class="vid-play-btn"><i class="fas fa-play"></i></div></div>
        </div></div>`;
    }
    return `<div class="gal-vid">
      ${item.title ? `<div class="gal-vid-title"><i class="fas fa-play-circle" style="margin-right:.4rem"></i>${esc(item.title)}</div>` : ''}
      <iframe src="${ev}" title="${esc(item.title || 'Video')}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>
    </div>`;
  }).join('');
}

function setupLightbox() {
  const lb = document.getElementById('lightbox');
  const cl = document.getElementById('lb-close');
  if (!lb || !cl) return;
  cl.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === e.currentTarget) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') { closeLb(); return; }
    if (e.key === 'Tab') { e.preventDefault(); cl.focus(); }
  });
}

function openLb(src, alt) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lb-img').src = src;
  document.getElementById('lb-img').alt = alt || 'Immagine ingrandita';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('lb-close').focus();
}

function closeLb() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
}
