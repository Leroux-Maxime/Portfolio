/**
 * data.js — Données, constantes, Store (localStorage) et helpers
 */

const STORAGE_KEY = 'horairetracker_v2';
const LEGACY_STORAGE_KEY = 'horairetracker_v1';
const SETTINGS_KEY = 'horairetracker_settings_v1';
const SYNC_SETTINGS_KEY = 'horairetracker_sync_v1';
const STORAGE_VERSION = 3;
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
  return localISODate(d);
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

function makeUid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `uid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEntry(entry, fresh = false) {
  return {
    ...entry,
    uid: entry.uid || makeUid(),
    updatedAt: entry.updatedAt || (fresh ? new Date().toISOString() : '1970-01-01T00:00:00.000Z'),
    contrat: normalizeWeeklyHours(entry.contrat),
  };
}

function mergeEntriesByUid(localEntries = [], remoteEntries = []) {
  const merged = new Map();

  for (const entry of [...localEntries, ...remoteEntries]) {
    const normalized = normalizeEntry(entry);
    const current = merged.get(normalized.uid);
    if (!current) {
      merged.set(normalized.uid, normalized);
      continue;
    }

    const currentStamp = current.updatedAt || '1970-01-01T00:00:00.000Z';
    const incomingStamp = normalized.updatedAt || '1970-01-01T00:00:00.000Z';
    if (incomingStamp >= currentStamp) {
      merged.set(normalized.uid, normalized);
    }
  }

  return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date) || (a.id - b.id));
}

function localISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
        _entries = legacyEntries.map(entry => {
          const normalizedContract = normalizeWeeklyHours(entry.contrat) <= 12
            ? normalizeWeeklyHours(entry.contrat) * 5
            : normalizeWeeklyHours(entry.contrat);

          return normalizeEntry({
            ...entry,
            contrat: normalizedContract,
          });
        });
        _nextId  = p.nextId  || (_entries.length ? Math.max(..._entries.map(e => e.id)) + 1 : 1);
        if (p.version !== STORAGE_VERSION) {
          _persist();
        }
      } else {
        // Premier lancement : données de démo
        _entries = SAMPLE_ENTRIES.map(entry => normalizeEntry(entry));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, entries: _entries, nextId: _nextId }));
  }

  function getAll()     { return _entries; }
  function getById(id)  { return _entries.find(e => e.id === id) || null; }
  function getByUid(uid) { return _entries.find(e => e.uid === uid) || null; }

  function replaceAll(entries) {
    _entries = entries.map(entry => normalizeEntry(entry));
    _nextId = _entries.length ? Math.max(..._entries.map(e => e.id || 0)) + 1 : 1;
    _persist();
  }

  function importEntries(entries) {
    const byUid = new Map(_entries.map(entry => [entry.uid, entry]));

    for (const incoming of entries) {
      const normalized = normalizeEntry(incoming);
      const current = byUid.get(normalized.uid);
      if (!current) {
        _entries.push(normalized);
        continue;
      }

      const currentStamp = current.updatedAt || '1970-01-01T00:00:00.000Z';
      const incomingStamp = normalized.updatedAt || '1970-01-01T00:00:00.000Z';
      if (incomingStamp >= currentStamp) {
        Object.assign(current, normalized);
      }
    }

    _entries.sort((a, b) => a.date.localeCompare(b.date) || (a.id - b.id));
    _nextId = _entries.length ? Math.max(..._entries.map(e => e.id || 0)) + 1 : 1;
    _persist();
  }

  function add(data) {
    const entry = normalizeEntry({ ...data, id: _nextId++ }, true);
    _entries.push(entry);
    _persist();
    return entry;
  }

  function update(id, data) {
    const idx = _entries.findIndex(e => e.id === id);
    if (idx === -1) return null;
    _entries[idx] = normalizeEntry({
      ..._entries[idx],
      ...data,
      uid: _entries[idx].uid,
      id: _entries[idx].id,
      updatedAt: new Date().toISOString(),
    }, true);
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

  return { load, getAll, getById, getByUid, replaceAll, importEntries, add, update, remove, exportCSV };
})();

const Sync = (() => {
  let _config = {
    enabled: false,
    supabaseUrl: '',
    anonKey: '',
    syncToken: '',
    tableName: 'horairetracker_entries',
  };

  function load() {
    try {
      const raw = localStorage.getItem(SYNC_SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      _config = {
        enabled: Boolean(parsed.enabled),
        supabaseUrl: (parsed.supabaseUrl || '').trim().replace(/\/$/, ''),
        anonKey: (parsed.anonKey || '').trim(),
        syncToken: (parsed.syncToken || '').trim(),
        tableName: (parsed.tableName || 'horairetracker_entries').trim() || 'horairetracker_entries',
      };
    } catch (err) {
      console.error('HoraireTracker: erreur chargement synchronisation', err);
    }
  }

  function save(config) {
    _config = {
      enabled: true,
      supabaseUrl: (config.supabaseUrl || '').trim().replace(/\/$/, ''),
      anonKey: (config.anonKey || '').trim(),
      syncToken: (config.syncToken || '').trim(),
      tableName: (config.tableName || 'horairetracker_entries').trim() || 'horairetracker_entries',
    };
    localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(_config));
  }

  function clear() {
    _config = {
      enabled: false,
      supabaseUrl: '',
      anonKey: '',
      syncToken: '',
      tableName: 'horairetracker_entries',
    };
    localStorage.removeItem(SYNC_SETTINGS_KEY);
  }

  function getConfig() {
    return { ..._config };
  }

  function isEnabled() {
    return Boolean(_config.enabled && _config.supabaseUrl && _config.anonKey && _config.syncToken);
  }

  function baseUrl() {
    return `${_config.supabaseUrl}/rest/v1/${encodeURIComponent(_config.tableName)}`;
  }

  function headers() {
    return {
      apikey: _config.anonKey,
      Authorization: `Bearer ${_config.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };
  }

  function toRemoteRow(entry) {
    return {
      uid: entry.uid,
      sync_token: _config.syncToken,
      id: entry.id,
      date: entry.date,
      type: entry.type,
      arrive: entry.arrive,
      depart: entry.depart,
      pause: entry.pause,
      contrat: entry.contrat,
      note: entry.note,
      updated_at: entry.updatedAt || new Date().toISOString(),
    };
  }

  function fromRemoteRow(row) {
    return normalizeEntry({
      uid: row.uid,
      id: Number(row.id),
      date: row.date,
      type: row.type,
      arrive: row.arrive || '',
      depart: row.depart || '',
      pause: Number(row.pause) || 0,
      contrat: normalizeWeeklyHours(row.contrat),
      note: row.note || '',
      updatedAt: row.updated_at || row.updatedAt || '1970-01-01T00:00:00.000Z',
    });
  }

  async function fetchRows() {
    if (!isEnabled()) return [];
    const url = `${baseUrl()}?sync_token=eq.${encodeURIComponent(_config.syncToken)}&select=*`;
    const response = await fetch(url, { headers: headers() });
    if (!response.ok) {
      throw new Error(`Supabase fetch failed (${response.status})`);
    }
    return response.json();
  }

  async function pushEntries(entries) {
    if (!isEnabled()) return;
    const rows = entries.map(toRemoteRow);
    const response = await fetch(`${baseUrl()}?on_conflict=uid`, {
      method: 'POST',
      headers: {
        ...headers(),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    });

    if (!response.ok) {
      throw new Error(`Supabase push failed (${response.status})`);
    }
  }

  async function pushEntry(entry) {
    return pushEntries([entry]);
  }

  async function deleteEntry(entry) {
    if (!isEnabled() || !entry?.uid) return;
    const url = `${baseUrl()}?sync_token=eq.${encodeURIComponent(_config.syncToken)}&uid=eq.${encodeURIComponent(entry.uid)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers(),
    });

    if (!response.ok) {
      throw new Error(`Supabase delete failed (${response.status})`);
    }
  }

  async function pullIntoStore() {
    if (!isEnabled()) return { remoteCount: 0, localCount: Store.getAll().length };
    const rows = await fetchRows();
    const remoteEntries = rows.map(fromRemoteRow);
    if (remoteEntries.length) {
      Store.replaceAll(mergeEntriesByUid(Store.getAll(), remoteEntries));
    }
    return { remoteCount: remoteEntries.length, localCount: Store.getAll().length };
  }

  async function syncNow() {
    if (!isEnabled()) return { skipped: true };
    const rows = await fetchRows();
    const remoteEntries = rows.map(fromRemoteRow);
    const mergedEntries = mergeEntriesByUid(Store.getAll(), remoteEntries);
    Store.replaceAll(mergedEntries);
    await pushEntries(mergedEntries);
    return { pulled: remoteEntries.length, pushed: mergedEntries.length };
  }

  return { load, save, clear, getConfig, isEnabled, pullIntoStore, pushEntry, pushEntries, deleteEntry, syncNow };
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
  return localISODate(new Date());
}