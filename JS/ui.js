/**
 * ui.js — Fonctions de rendu HTML
 * Chaque fonction retourne du HTML sous forme de string.
 */

/* ── KPI Stats ── */
function renderStats(jobs) {
  const counts = {};
  STATUTS.forEach(s => (counts[s] = 0));
  jobs.forEach(j => (counts[j.statut] = (counts[j.statut] || 0) + 1));

  const actifs = jobs.filter(j => !['Refus', 'Abandonné'].includes(j.statut)).length;
  const toRelance = jobs.filter(j => needsRelance(j)).length;
  const tauxReponse = jobs.length
    ? Math.round((jobs.filter(j => j.statut !== 'Envoyé').length / jobs.length) * 100)
    : 0;

  document.getElementById('statsRow').innerHTML = `
    <div class="scard s-total">
      <div class="sl">Total</div>
      <div class="sv">${jobs.length}</div>
      <div class="sd">candidatures</div>
    </div>
    <div class="scard s-actif">
      <div class="sl">Actives</div>
      <div class="sv">${actifs}</div>
      <div class="sd">en cours</div>
    </div>
    <div class="scard s-entretien">
      <div class="sl">Entretiens</div>
      <div class="sv">${counts['Entretien'] || 0}</div>
      <div class="sd">planifiés</div>
    </div>
    <div class="scard s-offre">
      <div class="sl">Offres</div>
      <div class="sv">${counts['Offre reçue'] || 0}</div>
      <div class="sd">reçues</div>
    </div>
    <div class="scard s-refus">
      <div class="sl">Taux réponse</div>
      <div class="sv">${tauxReponse}%</div>
      <div class="sd">${toRelance} à relancer</div>
    </div>
  `;

  const now = new Date();
  document.getElementById('subline').textContent =
    `${jobs.length} candidature${jobs.length !== 1 ? 's' : ''} · ${actifs} active${actifs !== 1 ? 's' : ''} · ${now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

/* ── Tabs ── */
function renderTabs(jobs, currentTab) {
  const toRelance = jobs.filter(j => needsRelance(j)).length;
  const entretiens = jobs.filter(j => ['Entretien', 'Test technique'].includes(j.statut)).length;
  const actifs = jobs.filter(j => !['Refus', 'Abandonné'].includes(j.statut)).length;

  const tabs = [
    { id: 'toutes',    label: 'Toutes',      count: jobs.length },
    { id: 'actives',   label: 'Actives',     count: actifs },
    { id: 'relancer',  label: 'À relancer',  count: toRelance },
    { id: 'entretiens',label: 'Entretiens',  count: entretiens },
  ];

  document.getElementById('tabsEl').innerHTML = tabs
    .map(t => `
      <button class="tab ${currentTab === t.id ? 'active' : ''}" onclick="App.setTab('${t.id}')">
        ${t.label}<span class="tc">${t.count}</span>
      </button>`)
    .join('');
}

/* ── Job card (list view) ── */
function jobCardHTML(job, isExpanded) {
  const c = STATUS_COLORS[job.statut] || STATUS_COLORS['Envoyé'];
  const [logoBg, logoFg] = logoColor(job.entreprise);
  const urgent = needsRelance(job);

  const detailsHTML = isExpanded ? `
    <div class="jcard-body">
      <div class="detail-chips">
        ${job.salaire ? `<div class="chip"><i class="ti ti-currency-euro"></i>${job.salaire} €/an</div>` : ''}
        ${job.mode    ? `<div class="chip"><i class="ti ti-home"></i>${job.mode}</div>` : ''}
        ${job.contrat ? `<div class="chip"><i class="ti ti-file-text"></i>${job.contrat}</div>` : ''}
        ${job.contact ? `<div class="chip"><i class="ti ti-user"></i>${job.contact}</div>` : ''}
        ${job.lien    ? `<div class="chip clickable" onclick="window.open('${job.lien}','_blank')"><i class="ti ti-external-link"></i>Voir l'offre</div>` : ''}
      </div>
      ${job.history && job.history.length ? `
        <div class="timeline">
          ${[...job.history].reverse().map(h => `
            <div class="tl-item">
              <div class="tl-label">${h.event}</div>
              <div class="tl-date">${h.date}</div>
            </div>`).join('')}
        </div>` : ''}
      ${job.notes ? `<div class="notes-area">${job.notes}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-sm btn-outline" onclick="App.editJob(${job.id}, event)">
          <i class="ti ti-edit"></i> Modifier
        </button>
        <button class="btn btn-sm btn-outline" onclick="App.quickStatus(${job.id}, event)">
          <i class="ti ti-arrows-exchange"></i> Statut
        </button>
        <button class="btn btn-sm btn-danger" onclick="App.deleteJob(${job.id}, event)">
          <i class="ti ti-trash"></i> Supprimer
        </button>
      </div>
    </div>` : '';

  return `
    <div class="jcard ${isExpanded ? 'expanded' : ''}" id="jcard-${job.id}">
      <div class="jcard-top" onclick="App.toggleCard(${job.id})">
        <div class="jcard-logo" style="background:${logoBg};color:${logoFg}">
          ${logoLetters(job.entreprise)}
        </div>
        <div class="jcard-info">
          <div class="jcard-title">
            ${job.poste}
            ${urgent ? '<span class="urgent-dot" title="Relance recommandée (14j+)"></span>' : ''}
          </div>
          <div class="jcard-sub">
            <span><i class="ti ti-building" style="font-size:13px"></i>${job.entreprise}</span>
            ${job.ville ? `<span><i class="ti ti-map-pin" style="font-size:13px"></i>${job.ville}</span>` : ''}
            ${job.contrat ? `<span>${job.contrat}</span>` : ''}
          </div>
        </div>
        <div class="jcard-right">
          <div class="jcard-date">${daysAgo(job.date)}</div>
          <span class="badge" style="background:${c.bg};color:${c.fg}">${job.statut}</span>
        </div>
        <i class="ti ti-chevron-${isExpanded ? 'up' : 'down'}" style="color:var(--text-3);font-size:16px;flex-shrink:0"></i>
      </div>
      ${detailsHTML}
    </div>`;
}

/* ── List view ── */
function renderListView(jobs, expandedId) {
  const el = document.getElementById('listView');
  if (!jobs.length) {
    el.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-file-search"></i>
        <p>Aucune candidature trouvée.<br>Cliquez sur « Nouvelle candidature » pour commencer !</p>
      </div>`;
    return;
  }
  el.innerHTML = jobs.map(j => jobCardHTML(j, expandedId === j.id)).join('');
}

/* ── Kanban view ── */
function renderKanbanView(jobs) {
  const kanbanStatuts = STATUTS.filter(s => s !== 'Abandonné');
  const el = document.getElementById('kanbanEl');

  el.innerHTML = kanbanStatuts.map(s => {
    const c = STATUS_COLORS[s];
    const items = jobs.filter(j => j.statut === s);

    const cards = items.length
      ? items.map(j => {
          const [logoBg, logoFg] = logoColor(j.entreprise);
          return `
            <div class="kb-card" onclick="App.openModal(${j.id})" title="Cliquer pour modifier">
              <div class="kb-card-title">${j.poste}</div>
              <div class="kb-card-co">${j.entreprise}${j.ville ? ' · ' + j.ville : ''}</div>
              <div class="kb-card-meta">
                <span>${daysAgo(j.date)}</span>
                ${j.contrat ? `<span class="kb-card-tag" style="background:${c.bg};color:${c.fg}">${j.contrat}</span>` : ''}
              </div>
            </div>`;
        }).join('')
      : '<div class="kb-empty">Aucune</div>';

    return `
      <div class="kb-col">
        <div class="kb-header">
          <span><span class="kb-dot" style="background:${c.dot}"></span>${s}</span>
          <span class="kb-count">${items.length}</span>
        </div>
        <div class="kb-cards">${cards}</div>
      </div>`;
  }).join('');
}

/* ── Stats / Charts ── */
let _barChart = null;
let _lineChart = null;

function renderChartsView(jobs) {
  const counts = {};
  STATUTS.forEach(s => (counts[s] = 0));
  jobs.forEach(j => (counts[j.statut] = (counts[j.statut] || 0) + 1));

  const labels = STATUTS.filter(s => counts[s] > 0);
  const data = labels.map(s => counts[s]);
  const bgColors = labels.map(s => STATUS_COLORS[s].bg);
  const borderColors = labels.map(s => STATUS_COLORS[s].dot);

  // Legend
  document.getElementById('chartLegend').innerHTML = labels
    .map(s => `<span><b style="background:${STATUS_COLORS[s].dot}"></b>${s} (${counts[s]})</span>`)
    .join('');

  // Bar chart
  if (_barChart) _barChart.destroy();
  _barChart = new Chart(document.getElementById('chartBar'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(128,128,128,.1)' } },
        x: { grid: { display: false } },
      },
    },
  });

  // Line chart — activité par mois
  const monthCounts = {};
  jobs.forEach(j => {
    const m = j.date.slice(0, 7);
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  });
  const months = Object.keys(monthCounts).sort();
  const monthLabels = months.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  });

  if (_lineChart) _lineChart.destroy();
  _lineChart = new Chart(document.getElementById('chartLine'), {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        data: months.map(m => monthCounts[m]),
        borderColor: '#185FA5',
        backgroundColor: 'rgba(56,138,221,.12)',
        fill: true,
        tension: .35,
        pointBackgroundColor: '#185FA5',
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(128,128,128,.1)' } },
        x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 45 } },
      },
    },
  });

  // Insights
  const avgDays = jobs.length
    ? Math.round(jobs.reduce((acc, j) => acc + Math.floor((Date.now() - new Date(j.date)) / 86400000), 0) / jobs.length)
    : 0;

  const tauxConversion = jobs.length
    ? Math.round(jobs.filter(j => ['Entretien', 'Test technique', 'Offre reçue'].includes(j.statut)).length / jobs.length * 100)
    : 0;

  const bestMonth = months.length
    ? (() => {
        const best = months.reduce((a, b) => monthCounts[a] >= monthCounts[b] ? a : b);
        return monthLabels[months.indexOf(best)];
      })()
    : '—';

  document.getElementById('statsInsights').innerHTML = `
    <div class="scard s-actif">
      <div class="sl">Âge moyen</div>
      <div class="sv">${avgDays}j</div>
      <div class="sd">depuis l'envoi</div>
    </div>
    <div class="scard s-entretien">
      <div class="sl">Taux entretien</div>
      <div class="sv">${tauxConversion}%</div>
      <div class="sd">des candidatures</div>
    </div>
    <div class="scard s-offre">
      <div class="sl">Mois le plus actif</div>
      <div class="sv" style="font-size:18px">${bestMonth}</div>
      <div class="sd">${months.length ? monthCounts[months.find(m => monthLabels[months.indexOf(m)] === bestMonth)] : 0} candidature(s)</div>
    </div>
  `;
}