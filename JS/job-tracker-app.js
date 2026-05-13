/**
 * app.js — Contrôleur principal de l'application
 * Gère la navigation, les filtres, la modal et les interactions utilisateur.
 */

const App = (() => {

  /* ── State ── */
  let _currentView  = 'list';
  let _currentTab   = 'toutes';
  let _expandedId   = null;
  let _editingId    = null;

  /* ── Bootstrap ── */
  function init() {
    Store.load();
    setView('list');
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ── Navigation ── */
  function setView(view, btnEl) {
    _currentView = view;

    // Toggle sections
    ['list', 'kanban', 'stats'].forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.classList.toggle('active', v === view);
    });

    // Toggle nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update header title
    const titles = { list: 'Mes candidatures', kanban: 'Vue Kanban', stats: 'Statistiques' };
    document.getElementById('viewTitle').textContent = titles[view] || 'Mes candidatures';

    // Render the right view
    const jobs = Store.getAll();
    renderStats(jobs);
    if (view === 'list')   { renderTabs(jobs, _currentTab); renderListView(_getFiltered(), _expandedId); }
    if (view === 'kanban') renderKanbanView(jobs);
    if (view === 'stats')  renderChartsView(jobs);
  }

  function setTab(tab) {
    _currentTab = tab;
    const jobs = Store.getAll();
    renderTabs(jobs, _currentTab);
    renderListView(_getFiltered(), _expandedId);
  }

  /* ── Filtering ── */
  function _getFiltered() {
    let list = Store.getAll();
    const q  = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const st = document.getElementById('filterStatus')?.value || '';
    const sort = document.getElementById('filterSort')?.value || 'date';

    if (q)  list = list.filter(j =>
      j.poste.toLowerCase().includes(q) ||
      j.entreprise.toLowerCase().includes(q) ||
      (j.ville || '').toLowerCase().includes(q));

    if (st) list = list.filter(j => j.statut === st);

    if (_currentTab === 'actives')    list = list.filter(j => !['Refus', 'Abandonné'].includes(j.statut));
    if (_currentTab === 'relancer')   list = list.filter(j => needsRelance(j));
    if (_currentTab === 'entretiens') list = list.filter(j => ['Entretien', 'Test technique'].includes(j.statut));

    if (sort === 'date')   list.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sort === 'alpha')  list.sort((a, b) => a.poste.localeCompare(b.poste, 'fr'));
    if (sort === 'statut') list.sort((a, b) => STATUTS.indexOf(a.statut) - STATUTS.indexOf(b.statut));

    return list;
  }

  function renderList() {
    const jobs = Store.getAll();
    renderStats(jobs);
    renderTabs(jobs, _currentTab);
    renderListView(_getFiltered(), _expandedId);
  }

  /* ── Card interactions ── */
  function toggleCard(id) {
    _expandedId = _expandedId === id ? null : id;
    renderList();
  }

  /* ── Modal ── */
  function openModal(idOrEvent) {
    let job = null;

    // Called from Kanban card click → id is a number
    if (typeof idOrEvent === 'number') {
      job = Store.getById(idOrEvent);
    }

    _editingId = job ? job.id : null;

    document.getElementById('modalTitleText').textContent = job
      ? 'Modifier la candidature'
      : 'Nouvelle candidature';

    // Fill form
    document.getElementById('fPoste').value      = job?.poste      || '';
    document.getElementById('fEntreprise').value = job?.entreprise || '';
    document.getElementById('fVille').value      = job?.ville      || '';
    document.getElementById('fContrat').value    = job?.contrat    || '';
    document.getElementById('fSalaire').value    = job?.salaire    || '';
    document.getElementById('fMode').value       = job?.mode       || '';
    document.getElementById('fDate').value       = job?.date       || todayISO();
    document.getElementById('fStatut').value     = job?.statut     || 'Envoyé';
    document.getElementById('fContact').value    = job?.contact    || '';
    document.getElementById('fLien').value       = job?.lien       || '';
    document.getElementById('fNotes').value      = job?.notes      || '';

    document.getElementById('modalBackdrop').classList.add('show');
    document.getElementById('fPoste').focus();
  }

  function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('show');
    _editingId = null;
  }

  function closeModalBg(e) {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  }

  function saveJob() {
    const poste      = document.getElementById('fPoste').value.trim();
    const entreprise = document.getElementById('fEntreprise').value.trim();

    if (!poste || !entreprise) {
      alert('Le poste et l\'entreprise sont obligatoires.');
      return;
    }

    const data = {
      poste,
      entreprise,
      ville:    document.getElementById('fVille').value.trim(),
      contrat:  document.getElementById('fContrat').value,
      salaire:  document.getElementById('fSalaire').value.trim(),
      mode:     document.getElementById('fMode').value,
      date:     document.getElementById('fDate').value || todayISO(),
      statut:   document.getElementById('fStatut').value,
      contact:  document.getElementById('fContact').value.trim(),
      lien:     document.getElementById('fLien').value.trim(),
      notes:    document.getElementById('fNotes').value.trim(),
    };

    if (_editingId) {
      Store.update(_editingId, data);
    } else {
      Store.add(data);
    }

    closeModal();
    _refresh();
  }

  function editJob(id, e) {
    e.stopPropagation();
    openModal(id);
  }

  function deleteJob(id, e) {
    e.stopPropagation();
    const job = Store.getById(id);
    if (!job) return;
    if (!confirm(`Supprimer la candidature "${job.poste}" chez ${job.entreprise} ?`)) return;
    Store.remove(id);
    if (_expandedId === id) _expandedId = null;
    _refresh();
  }

  function quickStatus(id, e) {
    e.stopPropagation();
    const job = Store.getById(id);
    if (!job) return;

    const options = STATUTS.map((s, i) => `${i + 1}. ${s}${s === job.statut ? ' ✓' : ''}`).join('\n');
    const input = prompt(`Nouveau statut pour "${job.poste}" :\n\n${options}\n\nEntrez le numéro ou le nom du statut :`);
    if (!input) return;

    const trimmed = input.trim();
    let newStatut = null;

    // Try numeric
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 1 && num <= STATUTS.length) {
      newStatut = STATUTS[num - 1];
    } else {
      // Try name (case-insensitive)
      newStatut = STATUTS.find(s => s.toLowerCase() === trimmed.toLowerCase());
    }

    if (newStatut && newStatut !== job.statut) {
      Store.update(id, { ...job, statut: newStatut });
      _refresh();
    } else if (!newStatut) {
      alert('Statut non reconnu. Réessayez.');
    }
  }

  /* ── Export ── */
  function exportCSV() {
    const csv = Store.exportCSV();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatures_${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Internal refresh ── */
  function _refresh() {
    setView(_currentView);
  }

  /* ── Public API ── */
  return {
    init,
    setView,
    setTab,
    renderList,
    toggleCard,
    openModal,
    closeModal,
    closeModalBg,
    saveJob,
    editJob,
    deleteJob,
    quickStatus,
    exportCSV,
  };

})();

// Lance l'app au chargement de la page
document.addEventListener('DOMContentLoaded', () => App.init());