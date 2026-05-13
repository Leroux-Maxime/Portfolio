/**
 * data.js — Données, constantes, Store (localStorage) et helpers
 */

const STORAGE_KEY = 'horairetracker_v1';

const JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const MOIS_LONGS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const TYPE_COLORS = {
  'Normal':     { bg: 'var(--normal-bg)',  fg: 'var(--normal-fg)',  dot: '#3B6D11' },
  'Heure sup.': { bg: 'var(--sup-bg)',     fg: 'var(--sup-fg)',     dot: '#534AB7' },
  'Absence':    { bg: 'var(--absence-bg)', fg: 'var(--absence-fg)', dot: '#A32D2D' },
  'Partiel':    { bg: 'var(--partiel-bg)', fg: 'var(--partiel-fg)', dot: '#BA7517' },
};

// Chart.js ne résout pas les CSS variables → on passe des hex fixes
const TYPE_HEX = {
  'Normal':     { bg: '#EAF3DE', dot: '#3B6D11' },
  'Heure sup.': { bg: '#EEEDFE', dot: '#534AB7' },
  'Absence':    { bg: '#FCEBEB', dot: '#A32D2D' },
  'Partiel':    { bg: '#FAEEDA', dot: '#BA7517' },
};

/* ─── Données de démonstration ─── */
function mkDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_ENTRIES = [
  { id: 1,  date: mkDate(0),  type: 'Normal',     arrive: '08:45', depart: '17:30', pause: 60, contrat: 7, note: 'Télétravail' },
  { id: 2,  date: mkDate(1),  type: 'Heure sup.', arrive: '08:00', depart: '19:00', pause: 60, contrat: 7, note: 'Livraison client' },
  { id: 3,  date: mkDate(2),  type: 'Normal',     arrive: '09:00', depart: '17:00', pause: 60, contrat: 7, note: '' },
  { id: 4,  date: mkDate(3),  type: 'Partiel',    arrive: '09:00', depart: '13:00', pause: 0,  contrat: 7, note: 'Rdv médical après-midi' },
  { id: 5,  date: mkDate(4),  type: 'Normal',     arrive: '08:30', depart: '17:30', pause: 45, contrat: 7, note: '' },
  { id: 6,  date: mkDate(7),  type: 'Heure sup.', arrive: '07:30', depart: '19:30', pause: 60, contrat: 7, note: 'Réunion stratégique' },
  { id: 7,  date: mkDate(8),  type: 'Normal',     arrive: '09:00', depart: '17:00', pause: 60, contrat: 7, note: '' },
  { id: 8,  date: mkDate(9),  type: 'Absence',    arrive: '',      depart: '',      pause: 0,  contrat: 7, note: 'Congé maladie' },
  { id: 9,  date: mkDate(10), type: 'Normal',     arrive: '08:45', depart: '17:15', pause: 60, contrat: 7, note: '' },
  { id: 10, date: mkDate(11), type: 'Normal',     arrive: '09:00', depart: '18:00', pause: 60, contrat: 7, note: 'Présentiel' },
  { id: 11, date: mkDate(14), type: 'Normal',     arrive: '08:30', depart: '17:00', pause: 45, contrat: 7, note: '' },
  { id: 12, date: mkDate(15), type: 'Heure sup.', arrive: '08:00', depart: '20:00', pause: 60, contrat: 7, note: 'Sprint final' },
  { id: 13, date: mkDate(16), type: 'Normal',     arrive: '09:15', depart: '17:15', pause: 60, contrat: 7, note: '' },
  { id: 14, date: mkDate(21), type: 'Partiel',    arrive: '14:00', depart: '18:00', pause: 0,  contrat: 7, note: 'Formation matin' },
];

/* ─── Store ─── */
const Store = (() => {
  let _entries = [];
  let _nextId  = 1;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        _entries = p.entries || [];
        _nextId  = p.nextId  || (_entries.length ? Math.max(..._entries.map(e => e.id)) + 1 : 1);
      } else {
        // Premier lancement : données de démo
        _entries = JSON.parse(JSON.stringify(SAMPLE_ENTRIES));
        _nextId  = SAMPLE_ENTRIES.length + 1;
        _persist();
      }
    } catch (err) {
      console.error('HoraireTracker: erreur chargement', err);
      _entries = [];
      _nextId  = 1;
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: _entries, nextId: _nextId }));
  }

  function getAll()     { return _entries; }
  function getById(id)  { return _entries.find(e => e.id === id) || null; }

  function add(data) {
    const entry = { ...data, id: _nextId++ };
    _entries.push(entry);
    _persist();
    return entry;
  }

  function update(id, data) {
    const idx = _entries.findIndex(e => e.id === id);
    if (idx === -1) return null;
    _entries[idx] = { ..._entries[idx], ...data };
    _persist();
    return _entries[idx];
  }

  function remove(id) {
    _entries = _entries.filter(e => e.id !== id);
    _persist();
  }

  function exportCSV() {
    const headers = ['Date', 'Jour', 'Type', 'Arrivée', 'Départ', 'Pause (min)', 'Heures réelles', 'Heures contrat', 'Delta (h)', 'Note'];
    const sorted = [..._entries].sort((a, b) => a.date.localeCompare(b.date));
    const rows = sorted.map(e => {
      const h    = calcHours(e.arrive, e.depart, e.pause || 0);
      const delta = e.type === 'Absence' ? -(e.contrat || 7) : h - (e.contrat || 7);
      const d    = new Date(e.date + 'T00:00:00');
      return [
        e.date,
        JOURS_COURTS[d.getDay()],
        e.type,
        e.arrive  || '',
        e.depart  || '',
        e.pause   || 0,
        h.toFixed(2),
        (e.contrat || 7).toFixed(2),
        delta.toFixed(2),
        (e.note || '').replace(/,/g, ';'),
      ].map(v => `"${v}"`).join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  return { load, getAll, getById, add, update, remove, exportCSV };
})();

/* ─── Helpers ─── */

/** Calcule les heures travaillées depuis arrivée, départ et pause en minutes */
function calcHours(arrive, depart, pauseMin) {
  if (!arrive || !depart) return 0;
  const [ah, am] = arrive.split(':').map(Number);
  const [dh, dm] = depart.split(':').map(Number);
  const minutes  = (dh * 60 + dm) - (ah * 60 + am) - (pauseMin || 0);
  return Math.max(0, Math.round(minutes * 100 / 60) / 100);
}

/** Formate une durée décimale en "Xh" ou "Xh30" */
function fmtH(h) {
  const sign = h < 0 ? '-' : '';
  const abs  = Math.abs(h);
  const hh   = Math.floor(abs);
  const mm   = Math.round((abs - hh) * 60);
  return `${sign}${hh}h${mm > 0 ? String(mm).padStart(2, '0') : ''}`;
}

/** Numéro de semaine ISO */
function isoWeek(dateStr) {
  const d   = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const y   = d.getFullYear();
  const w1  = new Date(y, 0, 4);
  return Math.ceil(((d - w1) / 864e5 + 1) / 7);
}

/** Lundi de la semaine courante, décalé de `offset` semaines */
function weekStart(offset = 0) {
  const d   = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Date du jour en ISO YYYY-MM-DD */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}