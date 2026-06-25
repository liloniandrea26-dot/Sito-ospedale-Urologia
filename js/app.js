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
  prenoting:   'https://www.prenoting.it',
  mypederzoli: 'https://my.pederzoli.it'
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
  team     = LS.get('uro_team',     null); if (!team)     { team     = JSON.parse(JSON.stringify(DEFAULT_TEAM));     LS.set('uro_team',     team);     }
  settings = LS.get('uro_settings', null); if (!settings) { settings = Object.assign({}, DEFAULT_SETTINGS); LS.set('uro_settings', settings); }
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
  injectAdmin();
  setupScrollProgress();
  setupHamburger();
  document.getElementById('footer-yr').textContent = new Date().getFullYear();
  applySettings();
  setupAdmin();
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
  { href: 'index.html',    label: 'Home',       page: 'home' },
  { href: 'servizi.html',  label: 'Servizi',    page: 'servizi' },
  { href: 'team.html',     label: 'Team',       page: 'team' },
  { href: 'news.html',     label: 'News',       page: 'news' },
  { href: 'galleria.html', label: 'Galleria',   page: 'galleria' },
  { href: 'contatti.html', label: 'Contatti',   page: 'contatti', cta: true },
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
    <p><strong>Urologia — Ospedale Pederzoli</strong></p>
    <p style="margin-top:.4rem">Via Monte Baldo, 24 — 37019 Peschiera del Garda (VR) &nbsp;|&nbsp; P.IVA 00244840237</p>
    <p style="margin-top:.25rem">© <span id="footer-yr"></span> Ospedale Pederzoli. Tutti i diritti riservati.</p>
    <button class="admin-dot" id="admin-dot-btn" aria-label="Accesso amministratori" title="Accesso amministratori">●</button>
  </footer>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ================================================================
   TOAST
   ================================================================ */
function injectToast() {
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
  lk('prenoting-link',    settings.prenoting);
  lk('mypederzoli-link',  settings.mypederzoli);
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
    const ev = p.videoUrl ? embedUrl(p.videoUrl) : null;
    return `<article class="post-card">
      ${ev ? `<div class="post-vid"><iframe src="${ev}" title="${esc(p.title)}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : ''}
      ${p.image && !ev ? `<img class="post-img" src="${p.image}" alt="${esc(p.title)}" loading="lazy">` : ''}
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
           onkeydown="if(event.key==='Enter')openLb('${item.src.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}','${esc(item.caption || '')}')">
        <img src="${item.src}" alt="${esc(item.caption || 'Foto del reparto di Urologia')}" loading="lazy">
        <div class="gal-overlay" aria-hidden="true"><i class="fas fa-expand"></i></div>
      </div>`;
    const ev = embedUrl(item.url);
    return ev ? `
      <div class="gal-vid">
        ${item.title ? `<div class="gal-vid-title"><i class="fas fa-play-circle" style="margin-right:.4rem"></i>${esc(item.title)}</div>` : ''}
        <iframe src="${ev}" title="${esc(item.title || 'Video')}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>
      </div>` : '';
  }).join('');
}

function setupLightbox() {
  const lb = document.getElementById('lightbox');
  const cl = document.getElementById('lb-close');
  if (!lb || !cl) return;
  cl.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === e.currentTarget) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

function openLb(src, alt) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lb-img').src = src;
  document.getElementById('lb-img').alt = alt || 'Immagine ingrandita';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLb() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ================================================================
   ADMIN — iniezione HTML
   ================================================================ */
function injectAdmin() {
  const html = `
  <div id="admin-ov" role="dialog" aria-modal="true" aria-label="Pannello amministratore">
    <div class="adm-wrap">
      <div id="adm-login">
        <i class="fas fa-lock" style="font-size:2.5rem;color:rgba(255,255,255,.35)"></i>
        <h3>Accesso Amministratore</h3>
        <p style="color:rgba(255,255,255,.5);font-size:.85rem;text-align:center">Inserisci la password per accedere al pannello di gestione.</p>
        <input type="password" id="adm-pw-input" placeholder="Password" aria-label="Password amministratore">
        <button id="adm-login-btn" type="button">Accedi</button>
        <span id="login-err">Password non corretta.</span>
        <button id="adm-cancel" type="button">Annulla</button>
      </div>
      <div id="adm-panel">
        <div class="adm-hdr">
          <h2><i class="fas fa-cog" style="margin-right:.5rem;opacity:.65"></i>Pannello Admin — Urologia</h2>
          <button id="adm-close" type="button">Chiudi ✕</button>
        </div>
        <div class="adm-tabs" role="tablist">
          <button class="atab active" data-tab="posts"    role="tab" aria-selected="true">Post &amp; News</button>
          <button class="atab"        data-tab="gallery"  role="tab" aria-selected="false">Galleria</button>
          <button class="atab"        data-tab="team"     role="tab" aria-selected="false">Team</button>
          <button class="atab"        data-tab="settings" role="tab" aria-selected="false">Testi &amp; Contatti</button>
        </div>
        <!-- Posts -->
        <div class="asec active" id="tab-posts" role="tabpanel">
          <h3 class="a-sec-title">Aggiungi un nuovo post</h3>
          <div class="ag2">
            <div class="fgrp"><label class="albl" for="p-title">Titolo *</label><input type="text" class="ainput" id="p-title" placeholder="Titolo del post"></div>
            <div class="fgrp"><label class="albl" for="p-cat">Categoria *</label>
              <select class="asel" id="p-cat">
                <option value="Notizia">Notizia</option><option value="Intervista">Intervista</option>
                <option value="Evento">Evento</option><option value="Articolo scientifico">Articolo scientifico</option>
              </select>
            </div>
          </div>
          <div class="fgrp"><label class="albl" for="p-text">Testo</label><textarea class="atea" id="p-text" placeholder="Testo del post..."></textarea></div>
          <div class="fgrp"><label class="albl" for="p-video">URL Video — YouTube o Vimeo (opzionale)</label><input type="url" class="ainput" id="p-video" placeholder="https://www.youtube.com/watch?v=..."></div>
          <div class="fgrp"><label class="albl" for="p-img">Immagine (opzionale)</label><input type="file" class="ainput" id="p-img" accept="image/*" style="padding:.4rem"></div>
          <button class="abtn abtn-p" id="add-post-btn" type="button"><i class="fas fa-plus"></i> Aggiungi post</button>
          <hr class="asep">
          <h3 class="a-sec-title">Post esistenti</h3>
          <div id="adm-posts-list"></div>
        </div>
        <!-- Gallery -->
        <div class="asec" id="tab-gallery" role="tabpanel">
          <h3 class="a-sec-title">Carica una foto</h3>
          <div class="fgrp"><label class="albl" for="g-img">Seleziona immagine/i *</label><input type="file" class="ainput" id="g-img" accept="image/*" multiple style="padding:.4rem"></div>
          <div class="fgrp"><label class="albl" for="g-caption">Didascalia</label><input type="text" class="ainput" id="g-caption" placeholder="Descrizione dell'immagine"></div>
          <button class="abtn abtn-p" id="add-gphoto-btn" type="button"><i class="fas fa-upload"></i> Carica foto</button>
          <hr class="asep">
          <h3 class="a-sec-title">Aggiungi un video</h3>
          <div class="fgrp"><label class="albl" for="g-vurl">URL YouTube o Vimeo *</label><input type="url" class="ainput" id="g-vurl" placeholder="https://www.youtube.com/watch?v=..."></div>
          <div class="fgrp"><label class="albl" for="g-vtitle">Titolo video</label><input type="text" class="ainput" id="g-vtitle" placeholder="Titolo del video"></div>
          <button class="abtn abtn-p" id="add-gvideo-btn" type="button"><i class="fas fa-video"></i> Aggiungi video</button>
          <hr class="asep">
          <h3 class="a-sec-title">Elementi in galleria</h3>
          <div id="adm-gal-list"></div>
        </div>
        <!-- Team -->
        <div class="asec" id="tab-team" role="tabpanel">
          <h3 class="a-sec-title">Modifica i membri del team</h3>
          <p style="color:rgba(255,255,255,.45);font-size:.85rem;margin-bottom:1rem">Clicca su un membro per modificarne il ruolo o la foto.</p>
          <div class="adm-team-grid" id="adm-team-grid"></div>
          <div id="team-edit-box">
            <h4 id="te-heading">Modifica membro</h4>
            <input type="hidden" id="te-idx">
            <div class="fgrp"><label class="albl" for="te-role">Ruolo</label><input type="text" class="ainput" id="te-role" placeholder="es. Urologo, Dirigente Medico"></div>
            <div class="fgrp"><label class="albl" for="te-photo">Foto</label><input type="file" class="ainput" id="te-photo" accept="image/*" style="padding:.4rem"></div>
            <button class="abtn abtn-p" id="te-save" type="button">Salva</button>
            <button class="abtn abtn-s" id="te-cancel" type="button" style="margin-left:.5rem">Annulla</button>
          </div>
        </div>
        <!-- Settings -->
        <div class="asec" id="tab-settings" role="tabpanel">
          <h3 class="a-sec-title">Testo "Chi siamo"</h3>
          <div class="fgrp"><label class="albl" for="s-about">Testo descrittivo</label><textarea class="atea" id="s-about" style="min-height:140px"></textarea></div>
          <hr class="asep">
          <h3 class="a-sec-title">Informazioni di contatto</h3>
          <div class="ag2">
            <div class="fgrp"><label class="albl" for="s-addr">Indirizzo</label><input type="text" class="ainput" id="s-addr"></div>
            <div class="fgrp"><label class="albl" for="s-phone">Telefono</label><input type="text" class="ainput" id="s-phone"></div>
            <div class="fgrp"><label class="albl" for="s-email">Email</label><input type="email" class="ainput" id="s-email"></div>
            <div class="fgrp"><label class="albl" for="s-hours">Orari</label><input type="text" class="ainput" id="s-hours"></div>
          </div>
          <hr class="asep">
          <h3 class="a-sec-title">Link prenotazioni</h3>
          <div class="fgrp"><label class="albl" for="s-prenoting">URL Prenoting™</label><input type="url" class="ainput" id="s-prenoting"></div>
          <div class="fgrp"><label class="albl" for="s-myped">URL My Pederzoli</label><input type="url" class="ainput" id="s-myped"></div>
          <button class="abtn abtn-p" id="save-settings-btn" type="button"><i class="fas fa-save"></i> Salva impostazioni</button>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ================================================================
   ADMIN — logica
   ================================================================ */
let loggedIn = false;

function setupAdmin() {
  document.getElementById('admin-dot-btn').addEventListener('click', openAdmin);
  document.getElementById('adm-cancel').addEventListener('click', closeAdmin);
  document.getElementById('adm-close').addEventListener('click', () => { closeAdmin(); loggedIn = false; });
  document.getElementById('adm-login-btn').addEventListener('click', doLogin);
  document.getElementById('adm-pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  if (location.hash === '#admin') openAdmin();
  window.addEventListener('hashchange', () => { if (location.hash === '#admin') openAdmin(); });

  document.querySelectorAll('.atab').forEach(t => t.addEventListener('click', function() {
    document.querySelectorAll('.atab').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.asec').forEach(x => x.classList.remove('active'));
    this.classList.add('active'); this.setAttribute('aria-selected', 'true');
    document.getElementById('tab-' + this.dataset.tab).classList.add('active');
  }));

  // Posts
  document.getElementById('add-post-btn').addEventListener('click', addPost);
  // Gallery
  document.getElementById('add-gphoto-btn').addEventListener('click', addGalleryPhoto);
  document.getElementById('add-gvideo-btn').addEventListener('click', addGalleryVideo);
  // Team
  document.getElementById('te-cancel').addEventListener('click', () => { document.getElementById('team-edit-box').style.display = 'none'; });
  document.getElementById('te-save').addEventListener('click', saveTeamMember);
  // Settings
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
}

function openAdmin() {
  document.getElementById('admin-ov').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (loggedIn) showPanel(); else showLogin();
}
function closeAdmin() {
  document.getElementById('admin-ov').classList.remove('open');
  document.body.style.overflow = '';
  history.pushState(null, '', location.pathname + location.search);
}
function showLogin() {
  document.getElementById('adm-login').style.display = 'flex';
  document.getElementById('adm-panel').style.display = 'none';
}
function showPanel() {
  document.getElementById('adm-login').style.display = 'none';
  document.getElementById('adm-panel').style.display = 'block';
  refreshAdmPosts(); refreshAdmGallery(); refreshAdmTeam(); loadSettingsForm();
}
function doLogin() {
  const pw = document.getElementById('adm-pw-input').value;
  const err = document.getElementById('login-err');
  if (pw === ADMIN_PASSWORD) {
    loggedIn = true; err.style.display = 'none';
    document.getElementById('adm-pw-input').value = '';
    showPanel();
  } else { err.style.display = 'block'; }
}

/* Admin — Posts */
async function addPost() {
  const title = document.getElementById('p-title').value.trim();
  if (!title) { toast('Inserisci almeno il titolo!'); return; }
  const cat   = document.getElementById('p-cat').value;
  const text  = document.getElementById('p-text').value.trim();
  const video = document.getElementById('p-video').value.trim();
  const file  = document.getElementById('p-img').files[0];
  let image = '';
  if (file) { try { image = await readFile(file); } catch { toast('Errore caricamento immagine.'); return; } }
  posts.unshift({ id: uid(), title, category: cat, text, videoUrl: video, image, date: new Date().toISOString() });
  LS.set('uro_posts', posts);
  renderPosts(); refreshAdmPosts(); toast('Post aggiunto!');
  ['p-title', 'p-text', 'p-video'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('p-img').value = '';
}

function refreshAdmPosts() {
  const el = document.getElementById('adm-posts-list');
  if (!posts.length) { el.innerHTML = '<p style="color:rgba(255,255,255,.4);font-size:.85rem">Nessun post ancora.</p>'; return; }
  el.innerHTML = posts.map(p => `
    <div class="adm-item">
      <div class="adm-item-info"><div class="it">${esc(p.title)}</div><div class="im">${esc(p.category)} · ${fmtD(p.date)}</div></div>
      <div class="adm-item-actions"><button class="abtn abtn-d" onclick="delPost('${p.id}')">Elimina</button></div>
    </div>`).join('');
}

function delPost(id) {
  if (!confirm('Eliminare questo post?')) return;
  posts = posts.filter(p => p.id !== id); LS.set('uro_posts', posts);
  renderPosts(); refreshAdmPosts(); toast('Post eliminato.');
}

/* Admin — Gallery */
async function addGalleryPhoto() {
  const files   = document.getElementById('g-img').files;
  const caption = document.getElementById('g-caption').value.trim();
  if (!files.length) { toast('Seleziona almeno una foto!'); return; }
  for (const f of files) {
    try { gallery.push({ id: uid(), type: 'photo', src: await readFile(f), caption, date: new Date().toISOString() }); }
    catch { toast('Errore con: ' + f.name); }
  }
  LS.set('uro_gallery', gallery); renderGallery(); refreshAdmGallery(); toast('Foto caricata!');
  document.getElementById('g-img').value = ''; document.getElementById('g-caption').value = '';
}

function addGalleryVideo() {
  const url   = document.getElementById('g-vurl').value.trim();
  const title = document.getElementById('g-vtitle').value.trim();
  if (!url) { toast('Inserisci un URL video!'); return; }
  if (!embedUrl(url)) { toast('URL non riconosciuto. Usa YouTube o Vimeo.'); return; }
  gallery.push({ id: uid(), type: 'video', url, title, date: new Date().toISOString() });
  LS.set('uro_gallery', gallery); renderGallery(); refreshAdmGallery(); toast('Video aggiunto!');
  document.getElementById('g-vurl').value = ''; document.getElementById('g-vtitle').value = '';
}

function refreshAdmGallery() {
  const el = document.getElementById('adm-gal-list');
  if (!gallery.length) { el.innerHTML = '<p style="color:rgba(255,255,255,.4);font-size:.85rem">Galleria vuota.</p>'; return; }
  el.innerHTML = gallery.map(g => `
    <div class="adm-item">
      <div class="adm-item-info"><div class="it">${g.type === 'photo' ? '🖼 ' : '▶ '}${esc(g.caption || g.title || g.url || 'Elemento')}</div><div class="im">${g.type === 'photo' ? 'Foto' : 'Video'} · ${fmtD(g.date)}</div></div>
      <div class="adm-item-actions"><button class="abtn abtn-d" onclick="delGal('${g.id}')">Elimina</button></div>
    </div>`).join('');
}

function delGal(id) {
  if (!confirm('Eliminare questo elemento?')) return;
  gallery = gallery.filter(g => g.id !== id); LS.set('uro_gallery', gallery);
  renderGallery(); refreshAdmGallery(); toast('Elemento eliminato.');
}

/* Admin — Team */
function refreshAdmTeam() {
  document.getElementById('adm-team-grid').innerHTML = team.map((m, i) => `
    <div class="atc">
      <div class="atc-photo">${m.photo ? `<img src="${m.photo}" alt="Foto di ${esc(m.name)}">` : '<i class="fas fa-user-md"></i>'}</div>
      <div class="atc-name">${esc(m.name)}</div>
      <div class="atc-role">${esc(m.role) || '—'}</div>
      <button class="abtn abtn-s" style="font-size:.75rem;padding:.3rem .7rem" onclick="openTeamEdit(${i})">Modifica</button>
    </div>`).join('');
}

function openTeamEdit(i) {
  document.getElementById('team-edit-box').style.display = 'block';
  document.getElementById('te-idx').value = i;
  document.getElementById('te-heading').textContent = 'Modifica: ' + team[i].name;
  document.getElementById('te-role').value = team[i].role || '';
  document.getElementById('te-photo').value = '';
  document.getElementById('team-edit-box').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function saveTeamMember() {
  const i = parseInt(document.getElementById('te-idx').value);
  team[i].role = document.getElementById('te-role').value.trim();
  const f = document.getElementById('te-photo').files[0];
  if (f) { try { team[i].photo = await readFile(f); } catch { toast('Errore caricamento foto.'); return; } }
  LS.set('uro_team', team); renderTeam(); refreshAdmTeam();
  document.getElementById('team-edit-box').style.display = 'none'; toast('Team aggiornato!');
}

/* Admin — Settings */
function loadSettingsForm() {
  document.getElementById('s-about').value    = settings.about       || '';
  document.getElementById('s-addr').value     = settings.address     || '';
  document.getElementById('s-phone').value    = settings.phone       || '';
  document.getElementById('s-email').value    = settings.email       || '';
  document.getElementById('s-hours').value    = settings.hours       || '';
  document.getElementById('s-prenoting').value= settings.prenoting   || '';
  document.getElementById('s-myped').value    = settings.mypederzoli || '';
}

function saveSettings() {
  settings.about       = document.getElementById('s-about').value;
  settings.address     = document.getElementById('s-addr').value.trim();
  settings.phone       = document.getElementById('s-phone').value.trim();
  settings.email       = document.getElementById('s-email').value.trim();
  settings.hours       = document.getElementById('s-hours').value.trim();
  settings.prenoting   = document.getElementById('s-prenoting').value.trim();
  settings.mypederzoli = document.getElementById('s-myped').value.trim();
  LS.set('uro_settings', settings); applySettings(); toast('Impostazioni salvate!');
}
