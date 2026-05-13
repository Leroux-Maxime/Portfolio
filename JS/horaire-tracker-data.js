/**
 * data.js — Données, constantes, Store (localStorage) et helpers
 */

const STORAGE_KEY = 'horairetracker_v2';
const LEGACY_STORAGE_KEY = 'horairetracker_v1';
const SETTINGS_KEY = 'horairetracker_settings_v1';
const DEFAULT_WEEKLY_HOURS = 35;

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

const Settings = (() => {
  let _weeklyHours = DEFAULT_WEEKLY_HOURS;

  function load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        _weeklyHours = DEFAULT_WEEKLY_HOURS;
        return;
      }

      const parsed = JSON.parse(raw);
      const value = Number(parsed.weeklyHours);
      _weeklyHours = Number.isFinite(value) && value > 0 ? value : DEFAULT_WEEKLY_HOURS;
    } catch (err) {
      console.error('HoraireTracker: erreur chargement réglages', err);
      _weeklyHours = DEFAULT_WEEKLY_HOURS;
    }
  }

  function _persist() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ weeklyHours: _weeklyHours }));
  }

  function getWeeklyHours() {
    return _weeklyHours;
  }

  function setWeeklyHours(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return _weeklyHours;
    _weeklyHours = parsed;
    _persist();
    return _weeklyHours;
  }

  return { load, getWeeklyHours, setWeeklyHours };
})();

/* ─── Données de démonstration ─── */
function mkDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_ENTRIES = [
  { id: 1,  date: mkDate(0),  type: 'Normal',     arrive: '08:45', depart: '17:30', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: 'Télétravail' },
  { id: 2,  date: mkDate(1),  type: 'Heure sup.', arrive: '08:00', depart: '19:00', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: 'Livraison client' },
  { id: 3,  date: mkDate(2),  type: 'Normal',     arrive: '09:00', depart: '17:00', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: '' },
  { id: 4,  date: mkDate(3),  type: 'Partiel',    arrive: '09:00', depart: '13:00', pause: 0,  contrat: DEFAULT_WEEKLY_HOURS, note: 'Rdv médical après-midi' },
  { id: 5,  date: mkDate(4),  type: 'Normal',     arrive: '08:30', depart: '17:30', pause: 45, contrat: DEFAULT_WEEKLY_HOURS, note: '' },
  { id: 6,  date: mkDate(7),  type: 'Heure sup.', arrive: '07:30', depart: '19:30', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: 'Réunion stratégique' },
  { id: 7,  date: mkDate(8),  type: 'Normal',     arrive: '09:00', depart: '17:00', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: '' },
  { id: 8,  date: mkDate(9),  type: 'Absence',    arrive: '',      depart: '',      pause: 0,  contrat: DEFAULT_WEEKLY_HOURS, note: 'Congé maladie' },
  { id: 9,  date: mkDate(10), type: 'Normal',     arrive: '08:45', depart: '17:15', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: '' },
  { id: 10, date: mkDate(11), type: 'Normal',     arrive: '09:00', depart: '18:00', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: 'Présentiel' },
  { id: 11, date: mkDate(14), type: 'Normal',     arrive: '08:30', depart: '17:00', pause: 45, contrat: DEFAULT_WEEKLY_HOURS, note: '' },
  { id: 12, date: mkDate(15), type: 'Heure sup.', arrive: '08:00', depart: '20:00', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: 'Sprint final' },
  { id: 13, date: mkDate(16), type: 'Normal',     arrive: '09:15', depart: '17:15', pause: 60, contrat: DEFAULT_WEEKLY_HOURS, note: '' },
  { id: 14, date: mkDate(21), type: 'Partiel',    arrive: '14:00', depart: '18:00', pause: 0,  contrat: DEFAULT_WEEKLY_HOURS, note: 'Formation matin' },
];

function normalizeWeeklyHours(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_WEEKLY_HOURS;
  return parsed;
}

function weekKey(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const weekYear = date.getFullYear();
  const week1 = new Date(weekYear, 0, 4);
  const weekNumber = Math.ceil(((date - week1) / 864e5 + 1) / 7);
  return `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
}

function buildWeeklyAnalysis(entries = []) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date) || (a.id - b.id));
  const buckets = new Map();
  const entryMap = new Map();
  const weeklyHours = Settings.getWeeklyHours();

  for (const entry of sorted) {
    const hours = calcHours(entry.arrive, entry.depart, entry.pause || 0);
    const key = weekKey(entry.date);

    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        target: weeklyHours,
        total: 0,
        overtime: 0,
        entries: [],
      });
    }

    const bucket = buckets.get(key);
    const overtimeBefore = Math.max(0, bucket.total - bucket.target);
    bucket.total += hours;
    bucket.overtime = Math.max(0, bucket.total - bucket.target);
    const overtime = Math.max(0, bucket.overtime - overtimeBefore);

    const annotated = {
      ...entry,
      hours,
      overtime,
      weekKey: key,
      displayType: overtime > 0 ? 'Heure sup.' : 'Normal',
    };

    bucket.entries.push(annotated);
    entryMap.set(entry.id, annotated);
  }

  return {
    buckets: [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key)),
    entryMap,
  };
}

/* ─── Store ─── */
const Store = (() => {
  let _entries = [];
  let _nextId  = 1;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        const legacyEntries = p.entries || [];
        _entries = p.version === 2
          ? legacyEntries
          : legacyEntries.map(entry => ({
              ...entry,
              contrat: normalizeWeeklyHours(entry.contrat) <= 12
                ? normalizeWeeklyHours(entry.contrat) * 5
                : normalizeWeeklyHours(entry.contrat),
            }));
        _nextId  = p.nextId  || (_entries.length ? Math.max(..._entries.map(e => e.id)) + 1 : 1);
        if (p.version !== 2) {
          _persist();
        }
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, entries: _entries, nextId: _nextId }));
  }

  function getAll()     { return _entries; }
  function getById(id)  { return _entries.find(e => e.id === id) || null; }

  function add(data) {
    const entry = { ...data, contrat: normalizeWeeklyHours(data.contrat), id: _nextId++ };
    _entries.push(entry);
    _persist();
    return entry;
  }

  function update(id, data) {
    const idx = _entries.findIndex(e => e.id === id);
    if (idx === -1) return null;
    _entries[idx] = { ..._entries[idx], ...data, contrat: normalizeWeeklyHours(data.contrat ?? _entries[idx].contrat) };
    _persist();
    return _entries[idx];
  }

  function remove(id) {
    _entries = _entries.filter(e => e.id !== id);
    _persist();
  }

  function exportCSV() {
    const headers = ['Date', 'Jour', 'Type', 'Arrivée', 'Départ', 'Pause (min)', 'Heures réelles', 'Heures hebdo', 'Delta (h)', 'Note'];
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