/**
 * ui.js — Fonctions de rendu HTML pour chaque vue
 */

/* ─── KPI Stats ─── */
function renderStats() {
  const entries = Store.getAll();
  const today   = todayISO();
  const thisMonth = today.slice(0, 7);
  const ws = weekStart(App.weekOffset);
  const analysis = buildWeeklyAnalysis(entries);
  const currentWeekKey = weekKey(localISODate(ws));
  const currentWeek = analysis.buckets.find(bucket => bucket.key === currentWeekKey) || {
    total: 0,
    target: Settings.getWeeklyHours(),
    overtime: 0,
    entries: [],
  };

  const monthWeeks = analysis.buckets.filter(bucket => bucket.entries.some(entry => entry.date.startsWith(thisMonth)));
  const wH = currentWeek.total;
  const mH = monthWeeks.reduce((acc, bucket) => acc + bucket.total, 0);
  const mDue = monthWeeks.reduce((acc, bucket) => acc + bucket.target, 0);
  const mSup = monthWeeks.reduce((acc, bucket) => acc + bucket.overtime, 0);
  const mDelta = mH - mDue;
  const d = new Date();

  document.getElementById('statsRow').innerHTML = `
    <div class="scard c1">
      <div class="sl">Cette semaine</div>
      <div class="sv">${fmtH(wH)}</div>
      <div class="sd">travaillées</div>
    </div>
    <div class="scard c2">
      <div class="sl">Ce mois</div>
      <div class="sv">${fmtH(mH)}</div>
      <div class="sd">/ ${fmtH(mDue)} hebdo</div>
    </div>
    <div class="scard c3">
      <div class="sl">Heures sup.</div>
      <div class="sv">${fmtH(mSup)}</div>
      <div class="sd">ce mois</div>
    </div>
    <div class="scard c4">
      <div class="sl">Balance</div>
      <div class="sv" style="color:${mDelta >= 0 ? '#3B6D11' : '#A32D2D'}">
        ${mDelta >= 0 ? '+' : ''}${fmtH(mDelta)}
      </div>
      <div class="sd">vs contrat</div>
    </div>
    <div class="scard c5">
      <div class="sl">Jours saisis</div>
      <div class="sv">${entries.length}</div>
      <div class="sd">au total</div>
    </div>
  `;

  document.getElementById('subline').textContent =
    `Semaine ${isoWeek(today)} · ${MOIS_LONGS[d.getMonth()]} ${d.getFullYear()}${Sync.isEnabled() ? ' · Cloud actif' : ''}`;
}

/* ─── Vue Semaine ─── */
function renderWeekView(offset) {
  const ws = weekStart(offset);
  const we = new Date(ws.getTime() + 6 * 864e5);
  const today = todayISO();
  const entries = Store.getAll();
  const analysis = buildWeeklyAnalysis(entries);
  const weekKeyValue = weekKey(localISODate(ws));
  const weekBucket = analysis.buckets.find(bucket => bucket.key === weekKeyValue) || {
    target: Settings.getWeeklyHours(),
    total: 0,
    overtime: 0,
    entries: [],
  };

  const entryMap = analysis.entryMap;

  document.getElementById('weekLabel').textContent =
    `${ws.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} – ` +
    `${we.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const days = Array.from({ length: 7 }, (_, i) => new Date(ws.getTime() + i * 864e5));

  document.getElementById('weekGrid').innerHTML = days.map((d, i) => {
    const iso   = localISODate(d);
    const isToday = iso === today;
    const dayEntries = entries.filter(e => e.date === iso);
    const isWE  = i === 5 || i === 6;
    const annotatedEntries = dayEntries.map(entry => entryMap.get(entry.id)).filter(Boolean);
    const dayTotalHours = annotatedEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
    const dayHasOvertime = annotatedEntries.some(entry => entry.overtime > 0);
    const primaryEntry = dayEntries[0] || null;
    const primaryAnnotated = primaryEntry ? entryMap.get(primaryEntry.id) : null;

    const badge = dayEntries.length > 1 ? `${dayEntries.length} saisies` : (primaryAnnotated?.displayType || 'Normal');
    const primaryType = primaryAnnotated?.displayType || 'Normal';
    const primaryColors = TYPE_COLORS[primaryType] || TYPE_COLORS['Normal'];
    const badgeBg = dayEntries.length > 1 ? '#1a1917' : primaryColors.bg;
    const badgeFg = dayEntries.length > 1 ? '#ffffff' : primaryColors.fg;

    const hColor = dayHasOvertime ? '#534AB7' : 'inherit';
    const clickTargetId = dayEntries.length === 1 ? dayEntries[0].id : 'null';

    return `
      <div class="day-col${isToday ? ' today' : ''}" data-date="${iso}" onclick="App.dayClick('${iso}', ${clickTargetId})">
        <div class="day-head">
          <div class="dn">${JOURS_COURTS[d.getDay()]}</div>
          <div>${d.getDate()}</div>
        </div>
        <div class="day-body">
          ${dayEntries.length
            ? `<div class="day-hours" style="color:${hColor}">${fmtH(dayTotalHours)}</div>
               ${primaryEntry?.note ? `<div class="day-note">${primaryEntry.note}${dayEntries.length > 1 ? ` · +${dayEntries.length - 1} autre${dayEntries.length > 2 ? 's' : ''}` : ''}</div>` : ''}
               ${!primaryEntry?.note && dayEntries.length > 1 ? `<div class="day-note">${dayEntries.length} saisies ce jour</div>` : ''}
               <span class="day-badge" style="background:${badgeBg};color:${badgeFg}">${badge}</span>`
            : `<div class="day-empty">${isWE ? '—' : '+ saisir'}</div>`
          }
        </div>
      </div>`;
  }).join('');

  if (window.matchMedia('(max-width: 600px)').matches) {
    requestAnimationFrame(() => {
      const currentDay = document.querySelector('.day-col.today') || document.querySelector('.day-col[data-date="' + today + '"]');
      currentDay?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }

  const wTotal = weekBucket.total;
  const wDue = weekBucket.target;
  const wSup = weekBucket.overtime;
  const wDelta = wTotal - wDue;
  document.getElementById('weekSummary').innerHTML = `
    <div class="sum-card">
      <div class="sl">Total semaine</div>
      <div class="sv">${fmtH(wTotal)}</div>
      <div class="sd">heures travaillées</div>
    </div>
    <div class="sum-card">
      <div class="sl">Heures dues</div>
      <div class="sv">${fmtH(wDue)}</div>
      <div class="sd">taux hebdo</div>
    </div>
    <div class="sum-card">
      <div class="sl">Heures sup.</div>
      <div class="sv" style="color:#534AB7">${fmtH(wSup)}</div>
      <div class="sd">à récupérer</div>
    </div>
    <div class="sum-card">
      <div class="sl">Balance</div>
      <div class="sv" style="color:${wDelta >= 0 ? '#3B6D11' : '#A32D2D'}">
        ${wDelta >= 0 ? '+' : ''}${fmtH(wDelta)}
      </div>
      <div class="sd">vs contrat</div>
    </div>
  `;
}

/* ─── Vue Journal ─── */
function populateMonthFilter() {
  const months = [...new Set(Store.getAll().map(e => e.date.slice(0, 7)))].sort().reverse();
  const sel    = document.getElementById('filterMonth');
  const cur    = sel.value;
  sel.innerHTML = '<option value="">Tous les mois</option>' +
    months.map(m => {
      const [y, mo] = m.split('-');
      return `<option value="${m}" ${m === cur ? 'selected' : ''}>${MOIS_LONGS[parseInt(mo) - 1]} ${y}</option>`;
    }).join('');
}

function renderListView() {
  const q   = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const fm  = document.getElementById('filterMonth')?.value || '';
  const ft  = document.getElementById('filterType')?.value  || '';

  const allEntries = Store.getAll();
  const analysis = buildWeeklyAnalysis(allEntries);

  let list = allEntries.filter(e => {
    const annotated = analysis.entryMap.get(e.id);
    const displayType = annotated?.displayType || 'Normal';

    if (q && !((e.note || '').toLowerCase().includes(q) || displayType.toLowerCase().includes(q) || e.date.includes(q))) {
      return false;
    }

    if (fm && !e.date.startsWith(fm)) {
      return false;
    }

    if (ft && displayType !== ft) {
      return false;
    }

    return true;
  });

  list.sort((a, b) => b.date.localeCompare(a.date));

  const el = document.getElementById('listView');
  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-clock-off" aria-hidden="true"></i>
        <p>Aucune journée trouvée.<br>Ajustez les filtres ou ajoutez une nouvelle entrée.</p>
      </div>`;
    return;
  }

  el.innerHTML = list.map(e => {
    const annotated = analysis.entryMap.get(e.id);
    const h     = annotated?.hours || calcHours(e.arrive, e.depart, e.pause || 0);
    const delta = annotated?.overtime || 0;
    const displayType = annotated?.displayType || 'Normal';
    const c     = TYPE_COLORS[displayType] || TYPE_COLORS['Normal'];
    const d     = new Date(e.date + 'T00:00:00');

    return `
      <div class="entry-card">
        <div class="entry-dot" style="background:${c.dot}"></div>
        <div class="entry-info">
          <div class="entry-date">
            ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div class="entry-meta">
            ${e.arrive && e.depart
              ? `<span><i class="ti ti-clock" style="font-size:13px" aria-hidden="true"></i>${e.arrive} → ${e.depart}</span>`
              : ''}
            ${e.pause ? `<span><i class="ti ti-coffee" style="font-size:13px" aria-hidden="true"></i>${e.pause} min pause</span>` : ''}
            ${e.note  ? `<span><i class="ti ti-notes" style="font-size:13px" aria-hidden="true"></i>${e.note}</span>` : ''}
          </div>
        </div>
        <div class="entry-right">
          <div class="entry-hours">${fmtH(h)}</div>
          <span class="badge" style="background:${c.bg};color:${c.fg}">${displayType}</span>
          ${delta > 0
            ? `<span style="font-size:11px;color:#534AB7">+${fmtH(delta)}</span>`
            : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;margin-left:4px">
          <button class="btn btn-sm" onclick="App.openModal(${e.id})" aria-label="Modifier">
            <i class="ti ti-edit" aria-hidden="true"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="App.deleteEntry(${e.id})" aria-label="Supprimer">
            <i class="ti ti-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>`;
  }).join('');
}

/* ─── Vue Récap mois ─── */
function populateMonthSelect() {
  const months = [...new Set(Store.getAll().map(e => e.date.slice(0, 7)))].sort().reverse();
  const sel    = document.getElementById('monthSelect');
  const cur    = sel.value || months[0] || '';
  sel.innerHTML = months.map(m => {
    const [y, mo] = m.split('-');
    return `<option value="${m}" ${m === cur ? 'selected' : ''}>${MOIS_LONGS[parseInt(mo) - 1]} ${y}</option>`;
  }).join('');
}

function renderMonthView() {
  const sel = document.getElementById('monthSelect').value;
  if (!sel) {
    document.getElementById('monthContent').innerHTML = `
      <div class="empty-state">
        <i class="ti ti-calendar-off" aria-hidden="true"></i>
        <p>Sélectionnez un mois pour voir le récapitulatif.</p>
      </div>`;
    return;
  }

  const allEntries = Store.getAll();
  const list = allEntries
    .filter(e => e.date.startsWith(sel))
    .sort((a, b) => a.date.localeCompare(b.date));
  const analysis = buildWeeklyAnalysis(allEntries);

  const monthWeeks = analysis.buckets.filter(bucket => bucket.entries.some(entry => entry.date.startsWith(sel)));
  const totH = monthWeeks.reduce((acc, bucket) => acc + bucket.total, 0);
  const totDue = monthWeeks.reduce((acc, bucket) => acc + bucket.target, 0);
  const totSup = monthWeeks.reduce((acc, bucket) => acc + bucket.overtime, 0);
  const delta = totH - totDue;

  document.getElementById('monthContent').innerHTML = `
    <div class="summary-row" style="margin-bottom:1.25rem">
      <div class="sum-card">
        <div class="sl">Heures réelles</div>
        <div class="sv">${fmtH(totH)}</div>
        <div class="sd">travaillées</div>
      </div>
      <div class="sum-card">
        <div class="sl">Heures dues</div>
        <div class="sv">${fmtH(totDue)}</div>
        <div class="sd">taux hebdo</div>
      </div>
      <div class="sum-card">
        <div class="sl">Heures sup.</div>
        <div class="sv" style="color:#534AB7">${fmtH(totSup)}</div>
        <div class="sd">à récupérer</div>
      </div>
      <div class="sum-card">
        <div class="sl">Balance</div>
        <div class="sv" style="color:${delta >= 0 ? '#3B6D11' : '#A32D2D'}">
          ${delta >= 0 ? '+' : ''}${fmtH(delta)}
        </div>
        <div class="sd">vs contrat</div>
      </div>
      <div class="sum-card">
        <div class="sl">Jours saisis</div>
        <div class="sv">${list.length}</div>
        <div class="sd">dans ce mois</div>
      </div>
    </div>
    <div style="overflow-x:auto">
      <table class="month-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Arrivée</th>
            <th>Départ</th>
            <th>Pause</th>
            <th>Réel</th>
            <th>Contrat</th>
            <th>Delta</th>
            <th>Type</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(e => {
            const annotated = analysis.entryMap.get(e.id);
            const h     = annotated?.hours || calcHours(e.arrive, e.depart, e.pause || 0);
            const delta = annotated?.overtime || 0;
            const displayType = annotated?.displayType || e.type;
            const c     = TYPE_COLORS[displayType] || TYPE_COLORS['Normal'];
            const d     = new Date(e.date + 'T00:00:00');
            return `
              <tr>
                <td><strong>${d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</strong></td>
                <td>${e.arrive || '—'}</td>
                <td>${e.depart || '—'}</td>
                <td>${e.pause ? e.pause + ' min' : '—'}</td>
                <td><strong>${fmtH(h)}</strong></td>
                <td>${fmtH(Settings.getWeeklyHours())}</td>
                <td class="${delta > 0 ? 'delta-pos' : 'delta-zero'}">
                  ${delta > 0 ? '+' : '—'}${delta > 0 ? fmtH(delta) : ''}
                </td>
                <td><span class="badge" style="background:${c.bg};color:${c.fg}">${displayType}</span></td>
                <td style="color:var(--text-2);font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.note || ''}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ─── Vue Graphiques ─── */
const _charts = {};

function renderChartsView() {
  const entries = Store.getAll();
  const analysis = buildWeeklyAnalysis(entries);
  const displayEntries = entries.map(entry => analysis.entryMap.get(entry.id) || entry);

  // --- Heures par semaine ---
  const byWeek = {};
  analysis.buckets.forEach(bucket => {
    byWeek[bucket.key] = byWeek[bucket.key] || { h: 0, due: 0 };
    byWeek[bucket.key].h   += bucket.total;
    byWeek[bucket.key].due += bucket.target;
  });
  const wks     = Object.keys(byWeek).sort().slice(-12);
  const wLabels = wks.map(w => 'S' + w.split('-W')[1]);
  const wData   = wks.map(w => Math.round(byWeek[w].h   * 10) / 10);
  const wDue    = wks.map(w => Math.round(byWeek[w].due * 10) / 10);

  if (_charts.weeks) _charts.weeks.destroy();
  _charts.weeks = new Chart(document.getElementById('chartWeeks'), {
    type: 'bar',
    data: {
      labels: wLabels,
      datasets: [
        {
          label: 'Réelles',
          data: wData,
          backgroundColor: '#E6F1FB',
          borderColor: '#185FA5',
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: 'Dues (contrat)',
          data: wDue,
          type: 'line',
          borderColor: '#A32D2D',
          borderDash: [4, 3],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { font: { size: 12 }, boxWidth: 12, padding: 16 },
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(128,128,128,.1)' }, ticks: { callback: v => fmtH(v) } },
        x: { grid: { display: false } },
      },
    },
  });

  // --- Répartition par type ---
  const typeCounts = {};
  displayEntries.forEach(e => typeCounts[e.displayType || e.type] = (typeCounts[e.displayType || e.type] || 0) + 1);
  const tLabels = Object.keys(typeCounts);
  const tData   = tLabels.map(t => typeCounts[t]);
  const tDots   = tLabels.map(t => TYPE_HEX[t]?.dot  || '#888');
  const tBg     = tLabels.map(t => TYPE_HEX[t]?.bg   || '#eee');

  document.getElementById('typeLegend').innerHTML = tLabels
    .map((t, i) => `<span><b style="background:${tDots[i]}"></b>${t} (${typeCounts[t]})</span>`)
    .join('');

  if (_charts.type) _charts.type.destroy();
  _charts.type = new Chart(document.getElementById('chartType'), {
    type: 'doughnut',
    data: {
      labels: tLabels,
      datasets: [{ data: tData, backgroundColor: tDots, borderColor: tBg, borderWidth: 2, hoverOffset: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: { legend: { display: false } },
    },
  });

  // --- Delta cumulé ---
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  let cumul = 0;
  const dLabels = sorted.map(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  });
  const dData = sorted.map(e => {
    const annotated = analysis.entryMap.get(e.id);
    const delta = annotated?.overtime || 0;
    cumul += delta;
    return Math.round(cumul * 100) / 100;
  });

  if (_charts.delta) _charts.delta.destroy();
  _charts.delta = new Chart(document.getElementById('chartDelta'), {
    type: 'line',
    data: {
      labels: dLabels,
      datasets: [{
        label: 'Delta cumulé',
        data: dData,
        borderColor: '#534AB7',
        backgroundColor: 'rgba(83,74,183,.1)',
        fill: true,
        tension: .35,
        pointRadius: 3,
        pointBackgroundColor: '#534AB7',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(128,128,128,.1)' },
          ticks: { callback: v => fmtH(v) },
        },
        x: {
          grid: { display: false },
          ticks: { autoSkip: true, maxTicksLimit: 8, maxRotation: 45 },
        },
      },
    },
  });
}