/**
 * data.js — Gestion des données (localStorage)
 * Toutes les opérations CRUD et helpers sur les candidatures.
 */

const STORAGE_KEY = 'jobtracker_v1';

const STATUTS = ['Envoyé', 'Relancé', 'Entretien', 'Test technique', 'Offre reçue', 'Refus', 'Abandonné'];

const STATUS_COLORS = {
  'Envoyé':         { bg: 'var(--s-envoye-bg)',    fg: 'var(--s-envoye-fg)',    dot: '#185FA5' },
  'Relancé':        { bg: 'var(--s-relance-bg)',   fg: 'var(--s-relance-fg)',   dot: '#BA7517' },
  'Entretien':      { bg: 'var(--s-entretien-bg)', fg: 'var(--s-entretien-fg)', dot: '#534AB7' },
  'Test technique': { bg: 'var(--s-test-bg)',      fg: 'var(--s-test-fg)',      dot: '#854F0B' },
  'Offre reçue':    { bg: 'var(--s-offre-bg)',     fg: 'var(--s-offre-fg)',     dot: '#3B6D11' },
  'Refus':          { bg: 'var(--s-refus-bg)',     fg: 'var(--s-refus-fg)',     dot: '#A32D2D' },
  'Abandonné':      { bg: 'var(--s-abandon-bg)',   fg: 'var(--s-abandon-fg)',   dot: '#888780' },
};

/** Données de démonstration chargées au premier lancement */
const SAMPLE_JOBS = [
  {
    id: 1,
    poste: 'Product Designer',
    entreprise: 'Studio Moderne',
    ville: 'Paris',
    contrat: 'CDI',
    salaire: '48 000',
    mode: 'Hybride',
    date: '2025-04-28',
    statut: 'Entretien',
    contact: 'Clara M.',
    lien: '',
    notes: 'Entretien RH prévu prochainement. Très bonne impression. Portfolio demandé.',
    history: [
      { date: '2025-04-28', event: 'Candidature envoyée' },
      { date: '2025-05-05', event: 'Réponse positive — RH' },
      { date: '2025-05-10', event: 'Entretien planifié' },
    ],
  },
  {
    id: 2,
    poste: 'UX Researcher',
    entreprise: 'DataCorp',
    ville: 'Lyon',
    contrat: 'CDI',
    salaire: '42 000',
    mode: 'Présentiel',
    date: '2025-04-20',
    statut: 'Refus',
    contact: '',
    lien: '',
    notes: 'Profil trop junior selon eux.',
    history: [
      { date: '2025-04-20', event: 'Candidature envoyée' },
      { date: '2025-05-02', event: 'Refus reçu' },
    ],
  },
  {
    id: 3,
    poste: 'Designer UI Senior',
    entreprise: 'Agence Pixel',
    ville: 'Remote',
    contrat: 'Freelance',
    salaire: '600/j',
    mode: 'Télétravail',
    date: '2025-05-01',
    statut: 'Envoyé',
    contact: 'Thomas B.',
    lien: '',
    notes: 'Mission de 3 mois. En attente de retour.',
    history: [{ date: '2025-05-01', event: 'Candidature envoyée' }],
  },
  {
    id: 4,
    poste: 'Chef de projet digital',
    entreprise: 'Innova Group',
    ville: 'Paris',
    contrat: 'CDI',
    salaire: '55 000',
    mode: 'Hybride',
    date: '2025-04-15',
    statut: 'Relancé',
    contact: '',
    lien: '',
    notes: 'Relance envoyée après 2 semaines sans réponse.',
    history: [
      { date: '2025-04-15', event: 'Candidature envoyée' },
      { date: '2025-04-30', event: 'Relance effectuée' },
    ],
  },
  {
    id: 5,
    poste: 'Motion Designer',
    entreprise: 'CréaStudio',
    ville: 'Bordeaux',
    contrat: 'CDD',
    salaire: '38 000',
    mode: 'Hybride',
    date: '2025-03-10',
    statut: 'Offre reçue',
    contact: 'Paul R.',
    lien: '',
    notes: 'Offre reçue ! Délai de réponse : 1 semaine.',
    history: [
      { date: '2025-03-10', event: 'Candidature envoyée' },
      { date: '2025-03-22', event: 'Entretien RH' },
      { date: '2025-04-02', event: 'Entretien technique' },
      { date: '2025-04-18', event: 'Offre reçue' },
    ],
  },
];

/* ── Store ── */
const Store = (() => {
  let _jobs = [];
  let _nextId = 1;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        _jobs = parsed.jobs || [];
        _nextId = parsed.nextId || (_jobs.length ? Math.max(..._jobs.map(j => j.id)) + 1 : 1);
      } else {
        _jobs = JSON.parse(JSON.stringify(SAMPLE_JOBS));
        _nextId = SAMPLE_JOBS.length + 1;
        _persist();
      }
    } catch (e) {
      console.error('JobTracker: erreur de chargement', e);
      _jobs = [];
      _nextId = 1;
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ jobs: _jobs, nextId: _nextId }));
  }

  function getAll() { return _jobs; }

  function getById(id) { return _jobs.find(j => j.id === id) || null; }

  function add(data) {
    const job = {
      ...data,
      id: _nextId++,
      history: [{ date: data.date, event: 'Candidature envoyée' }],
    };
    _jobs.push(job);
    _persist();
    return job;
  }

  function update(id, data) {
    const idx = _jobs.findIndex(j => j.id === id);
    if (idx === -1) return null;
    const prev = _jobs[idx];
    const updated = { ...prev, ...data };
    if (prev.statut !== data.statut) {
      updated.history = [...(prev.history || []), {
        date: new Date().toISOString().split('T')[0],
        event: `Statut → ${data.statut}`,
      }];
    }
    _jobs[idx] = updated;
    _persist();
    return updated;
  }

  function remove(id) {
    _jobs = _jobs.filter(j => j.id !== id);
    _persist();
  }

  function exportCSV() {
    const headers = ['Poste', 'Entreprise', 'Ville', 'Contrat', 'Salaire', 'Mode', 'Date', 'Statut', 'Contact', 'Lien', 'Notes'];
    const rows = _jobs.map(j => [
      j.poste, j.entreprise, j.ville, j.contrat, j.salaire,
      j.mode, j.date, j.statut, j.contact, j.lien,
      (j.notes || '').replace(/\n/g, ' '),
    ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  return { load, getAll, getById, add, update, remove, exportCSV };
})();

/* ── Helpers ── */
function logoLetters(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const LOGO_COLORS = [
  ['#E6F1FB', '#0C447C'], ['#EEEDFE', '#3C3489'], ['#EAF3DE', '#27500A'],
  ['#FAEEDA', '#633806'], ['#E1F5EE', '#085041'], ['#FBEAF0', '#72243E'],
];

function logoColor(name) {
  const i = name.charCodeAt(0) % LOGO_COLORS.length;
  return LOGO_COLORS[i];
}

function daysAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return 'Hier';
  return `${d}j`;
}

function needsRelance(job) {
  if (!['Envoyé', 'Relancé'].includes(job.statut)) return false;
  return Math.floor((Date.now() - new Date(job.date)) / 86400000) >= 14;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}