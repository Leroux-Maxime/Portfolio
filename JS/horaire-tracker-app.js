/**
 * app.js — Contrôleur principal
 * Navigation, gestion de la modal, interactions utilisateur.
 */

const App = (() => {

  /* ── State ── */
  let _currentView = 'week';
  let _editingId   = null;
  let weekOffset   = 0;  // exposé pour ui.js

  /* ── Init ── */
  function init() {
    Settings.load();
    Store.load();
    _setView('week');
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  /* ── Navigation ── */
  function setView(view, btnEl) {
    _setView(view);
  }

  function _setView(view) {
    _currentView = view;

    // Sections
    ['week', 'list', 'month', 'charts'].forEach(v => {
      document.getElementById('view-' + v).classList.toggle('active', v === view);
    });

    // Sidebar buttons
    document.querySelectorAll('.nav-item, .mobile-nav-item[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Title
    const titles = {
      week: 'Mes horaires', list: 'Journal', month: 'Récapitulatif mensuel', charts: 'Graphiques',
    };
    document.getElementById('viewTitle').textContent = titles[view] || 'Mes horaires';

    // Render
    renderStats();
    if (view === 'week')   renderWeekView(weekOffset);
    if (view === 'list')   { populateMonthFilter(); renderListView(); }
    if (view === 'month')  { populateMonthSelect();  renderMonthView(); }
    if (view === 'charts') renderChartsView();
  }

  /* ── Week navigation ── */
  function shiftWeek(dir) {
    weekOffset += dir;
    renderStats();
    renderWeekView(weekOffset);
  }

  function goToday() {
    weekOffset = 0;
    renderStats();
    renderWeekView(weekOffset);
  }

  function dayClick(iso, entryId) {
    if (entryId) {
      openModal(entryId);
    } else {
      openModal(null);
      document.getElementById('fDate').value = iso;
    }
  }

  /* ── List refresh ── */
  function renderList() {
    renderListView();
  }

  /* ── Month refresh ── */
  function renderMonth() {
    renderMonthView();
  }

  /* ── Modal ── */
  function openModal(id) {
    _editingId = id || null;
    const e = id ? Store.getById(id) : null;

    document.getElementById('modalTitleText').textContent = e ? 'Modifier la journée' : 'Nouvelle journée';
    document.getElementById('fDate').value    = e?.date    || todayISO();
    document.getElementById('fArrive').value  = e?.arrive  || '';
    document.getElementById('fDepart').value  = e?.depart  || '';
    document.getElementById('fPause').value   = e?.pause   ?? 0;
    document.getElementById('fContrat').value = e?.contrat ?? Settings.getWeeklyHours();
    document.getElementById('fNote').value    = e?.note    || '';

    document.getElementById('modalBackdrop').classList.add('show');
    document.body.classList.add('modal-open');
    setTimeout(() => document.getElementById('fDate').focus(), 50);
  }

  function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('show');
    document.body.classList.remove('modal-open');
    _editingId = null;
  }

  function closeModalBg(e) {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  }

  function saveEntry() {
    const date = document.getElementById('fDate').value;
    if (!date) { alert('La date est obligatoire.'); return; }

    const data = {
      date,
      type:    _editingId ? (Store.getById(_editingId)?.type || 'Normal') : 'Normal',
      arrive:  document.getElementById('fArrive').value,
      depart:  document.getElementById('fDepart').value,
      pause:   parseFloat(document.getElementById('fPause').value)   || 0,
      contrat: parseFloat(document.getElementById('fContrat').value) || Settings.getWeeklyHours(),
      note:    document.getElementById('fNote').value.trim(),
    };

    Settings.setWeeklyHours(data.contrat);

    if (_editingId) {
      Store.update(_editingId, data);
    } else {
      Store.add(data);
    }

    closeModal();
    _refresh();
  }

  function deleteEntry(id) {
    const e = Store.getById(id);
    if (!e) return;
    const d = new Date(e.date + 'T00:00:00');
    if (!confirm(`Supprimer la journée du ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} ?`)) return;
    Store.remove(id);
    _refresh();
  }

  /* ── Export ── */
  function exportCSV() {
    const csv  = Store.exportCSV();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `horaires_${todayISO().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Internal refresh ── */
  function _refresh() {
    _setView(_currentView);
  }

  /* ── Public API ── */
  return {
    init,
    setView,
    shiftWeek,
    goToday,
    dayClick,
    renderList,
    renderMonth,
    openModal,
    closeModal,
    closeModalBg,
    saveEntry,
    deleteEntry,
    exportCSV,
    get weekOffset() { return weekOffset; },
  };

})();

document.addEventListener('DOMContentLoaded', () => App.init());