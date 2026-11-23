/**
 * General Department of Safety and Compliance - Marsa Alam Airport
 * Environment & Wildlife Hazard Control Module (env.js)
 */

window.API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

const ENV_CLASSIFICATIONS = [
  "ثعبان",
  "أفعى (طريشة)",
  "عقرب",
  "مشاهدة حيوانات ضالة",
  "مشاهدة طيور",
  "تسريب / انسكاب",
  "مصدر جذب (مأوى)",
  "مصدر جذب (غذاء)",
  "مصدر جذب (مياه)",
  "نفايات صلبة",
  "نفايات سائلة",
  "حشرات طائرة / زاحفة"
];

const ENV_RESPONSIBLE_DEPTS = [
  "الشئون الإدارية",
  "جرين لاب",
  "الهندسة المدنية",
  "شركة توب",
  "الهندسة الميكانيكية",
  "شركة الخدمات الأرضية",
  "مصر للطيران للصيانة",
  "مصر للطيران للأسواق الحرة",
  "شركة أوفر سيز",
  "شرطة أمن الموانئ",
  "شركة توتال",
  "قسم البيئة والمكافحة"
];

const ENV_MONTHLY_KPIS = [
  { key: "pendingEnv", label: "الحالات والمخاطر البيئية المعلقة", higherBetter: false },
  { key: "rectifiedEnv", label: "الحالات والمخاطر البيئية التي تم تلافيها", higherBetter: true },
  { key: "totalEnv", label: "إجمالي الحالات والمخاطر البيئية", higherBetter: false },
  { key: "meetingsEnv", label: "الاجتماعات", higherBetter: true }
];

var globalEnvDaily = [];
var globalEnvMonthly = {};
let currentEnvDailyIndex = -1;
let isEnvEditMode = false;
let currentEnvEditId = null;
let envChartDeptInstance = null;
let envChartCatInstance = null;
let envChartLocInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  try {
    const uStr = sessionStorage.getItem('rmf_user');
    if (uStr) {
      const u = JSON.parse(uStr);
      const r = (u.Role || '').toLowerCase();
      if (!r.includes('admin') && document.getElementById('envBackMainBtn')) {
        document.getElementById('envBackMainBtn').style.display = 'none';
      }
    }
  } catch (e) {}

  try {
    const dCache = localStorage.getItem('rmf_env_daily');
    if (dCache) globalEnvDaily = JSON.parse(dCache) || [];
    const mCache = localStorage.getItem('rmf_env_monthly');
    if (mCache) globalEnvMonthly = JSON.parse(mCache) || {};
  } catch (e) {}

  const today = new Date().toISOString().split('T')[0];
  const curMonth = today.slice(0, 7);
  if (document.getElementById('envDailyDate')) document.getElementById('envDailyDate').value = today;
  if (document.getElementById('envDailyTime')) document.getElementById('envDailyTime').value = new Date().toTimeString().slice(0, 5);
  if (document.getElementById('envPrintDate')) document.getElementById('envPrintDate').value = today;
  if (document.getElementById('envMonthlyMonth')) document.getElementById('envMonthlyMonth').value = curMonth;
  if (document.getElementById('envExtractMonth')) document.getElementById('envExtractMonth').value = curMonth;

  addEnvFindingRow();
  renderSavedEnvDaily();
  updateEnvNavCounter();
  loadEnvMonthlyForm();
  syncEnvFromServer();
});

function getEnvActorName() {
  try {
    const u = JSON.parse(sessionStorage.getItem('rmf_user') || 'null');
    if (u && u.Username) return u.Username;
  } catch (e) {}
  return document.getElementById('envDailyInspector')?.value?.trim() || 'ENV Officer';
}

function initEnvSection() {
  try {
    const uObj = (typeof currentLoggedInUser !== 'undefined' && currentLoggedInUser) ? currentLoggedInUser : JSON.parse(sessionStorage.getItem('rmf_user') || 'null');
    const r = (uObj && uObj.Role ? uObj.Role : '').toLowerCase();
    const backBtn = document.getElementById('envBackMainBtn');
    if (backBtn) backBtn.style.display = r.includes('admin') ? 'inline-flex' : 'none';
  } catch (e) {}
  try {
    const dCache = localStorage.getItem('rmf_env_daily');
    if (dCache) globalEnvDaily = JSON.parse(dCache) || [];
    const mCache = localStorage.getItem('rmf_env_monthly');
    if (mCache) globalEnvMonthly = JSON.parse(mCache) || {};
  } catch (e) {}
  renderSavedEnvDaily();
  updateEnvNavCounter();
  loadEnvMonthlyForm();
  syncEnvFromServer();
}

function envLogout() {
  if (typeof logout === 'function') { logout(); return; }
  try { sessionStorage.removeItem('rmf_user'); } catch (e) {}
  window.location.href = 'index.html';
}

function syncEnvFromServer() {
  const cb = 'jsonpEnv_' + Math.round(100000 * Math.random());
  window[cb] = function (d) {
    try {
      if (d && d.status === 'success') {
        if (Array.isArray(d.envDaily) && d.envDaily.length > 0) {
          globalEnvDaily = d.envDaily.sort((a, b) => String((a.date || '') + ' ' + (a.time || '')).localeCompare(String((b.date || '') + ' ' + (b.time || ''))));
          try { localStorage.setItem('rmf_env_daily', JSON.stringify(globalEnvDaily)); } catch (e) {}
          renderSavedEnvDaily();
        }
        if (d.envMonthly && typeof d.envMonthly === 'object' && Object.keys(d.envMonthly).length > 0) {
          globalEnvMonthly = d.envMonthly;
          try { localStorage.setItem('rmf_env_monthly', JSON.stringify(globalEnvMonthly)); } catch (e) {}
          loadEnvMonthlyForm();
        }
      }
    } catch (err) {} finally { delete window[cb]; }
  };
  const s = document.createElement('script');
  s.src = window.API_URL + '?action=getAppData&_t=' + Date.now() + '&callback=' + cb;
  document.body.appendChild(s);
}

function switchEnvMainTab(tab) {
  const bD = document.getElementById('env-main-tab-daily');
  const bM = document.getElementById('env-main-tab-monthly');
  const vD = document.getElementById('env-view-daily');
  const vM = document.getElementById('env-view-monthly');
  if (tab === 'daily') {
    vD.style.display = 'block'; vM.style.display = 'none';
    bD.style.background = '#28a745'; bM.style.background = '#6c757d';
  } else {
    vD.style.display = 'none'; vM.style.display = 'block';
    bM.style.background = '#003366'; bD.style.background = '#6c757d';
    loadEnvMonthlyForm();
  }
}

function switchEnvDailySubTab(tab) {
  document.querySelectorAll('#env-view-daily .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#env-view-daily .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-env-daily-' + tab)?.classList.add('active');
  document.getElementById('tab-env-daily-' + tab)?.classList.add('active');
  if (tab === 'report') renderSavedEnvDaily();
}

function switchEnvMonthlySubTab(tab) {
  document.querySelectorAll('#env-view-monthly .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#env-view-monthly .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-env-monthly-' + tab)?.classList.add('active');
  document.getElementById('tab-env-monthly-' + tab)?.classList.add('active');
}

function addEnvFindingRow(data) {
  const tb = document.getElementById('env-findings-entry-tbody');
  if (!tb) return;
  const f = data || { desc: "", location: "", category: "ثعبان", dept: "جرين لاب", paCode: "", action: "", status: "تم", endDate: new Date().toISOString().split('T')[0] };
  const isClosed = f.status === 'تم' || f.status === 'مغلق';
  const catOpts = ENV_CLASSIFICATIONS.map(c => `<option value="${c}" ${c === f.category ? 'selected' : ''}>${c}</option>`).join('');
  const deptOpts = ENV_RESPONSIBLE_DEPTS.map(d => `<option value="${d}" ${d === f.dept ? 'selected' : ''}>${d}</option>`).join('');

  const tr = document.createElement('tr');
  tr.className = 'env-finding-row';
  tr.innerHTML = `
    <td><input type="text" class="env-f-desc" value="${(f.desc || '').replace(/"/g, '&quot;')}" placeholder="وصف الحالة البيئية..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td>
    <td><input type="text" list="envLocationsList" class="env-f-loc" value="${(f.location || '').replace(/"/g, '&quot;')}" placeholder="المكان..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td>
    <td><select class="env-f-cat" style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;">${catOpts}</select></td>
    <td><select class="env-f-dept" style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;">${deptOpts}</select></td>
    <td><input type="text" class="env-f-pa" value="${(f.paCode || '').replace(/"/g, '&quot;')}" placeholder="PA1-10-26" style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;direction:ltr;text-align:center;"></td>
    <td><input type="text" class="env-f-act" value="${(f.action || '').replace(/"/g, '&quot;')}" placeholder="الإجراء المتخذ..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td>
    <td>
      <input type="hidden" class="env-f-status" value="${isClosed ? 'تم' : 'معلق'}">
      <input type="hidden" class="env-f-enddate" value="${f.endDate || ''}">
      <button type="button" onclick="toggleEnvFindingStatusBtn(this)" style="background:${isClosed ? '#28a745' : '#dc3545'};color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px;white-space:nowrap;">
        ${isClosed ? 'تم ✔' : 'معلق'}
      </button>
    </td>
    <td><button type="button" onclick="this.closest('tr').remove()" style="background:#888;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
  `;
  tb.appendChild(tr);
}

function toggleEnvFindingStatusBtn(btn) {
  const tr = btn.closest('tr');
  const stInp = tr.querySelector('.env-f-status');
  const edInp = tr.querySelector('.env-f-enddate');
  const today = new Date().toISOString().split('T')[0];
  if (stInp.value !== 'تم') {
    stInp.value = 'تم'; edInp.value = today;
    btn.style.background = '#28a745'; btn.innerHTML = 'تم ✔';
  } else {
    stInp.value = 'معلق'; edInp.value = '';
    btn.style.background = '#dc3545'; btn.innerHTML = 'معلق';
  }
}

function submitEnvDailyInspection(e) {
  if (e) e.preventDefault();
  const dt = document.getElementById('envDailyDate')?.value || new Date().toISOString().split('T')[0];
  const tm = document.getElementById('envDailyTime')?.value || '08:30';
  const sh = document.getElementById('envDailyShift')?.value || 'نهاراً';
  const type = document.getElementById('envDailyType')?.value || 'التفتيش اليومي للبيئة ومكافحة مخاطر الحياة البرية';
  const insp = document.getElementById('envDailyInspector')?.value?.trim() || 'أحمد إسماعيل محمد';

  let findings = [];
  document.querySelectorAll('#env-findings-entry-tbody .env-finding-row').forEach(tr => {
    const desc = tr.querySelector('.env-f-desc')?.value?.trim() || '';
    if (desc) {
      findings.push({
        desc: desc,
        location: tr.querySelector('.env-f-loc')?.value?.trim() || '-',
        category: tr.querySelector('.env-f-cat')?.value || 'أخرى',
        dept: tr.querySelector('.env-f-dept')?.value || 'الشئون الإدارية',
        paCode: tr.querySelector('.env-f-pa')?.value?.trim() || '',
        action: tr.querySelector('.env-f-act')?.value?.trim() || 'تم التعامل',
        status: tr.querySelector('.env-f-status')?.value || 'تم',
        endDate: tr.querySelector('.env-f-enddate')?.value || dt
      });
    }
  });

  const repObj = {
    id: isEnvEditMode ? (currentEnvEditId || Date.now()) : Date.now(),
    date: dt, time: tm, shift: sh, type: type, inspector: insp, findings: findings
  };

  if (isEnvEditMode && currentEnvDailyIndex >= 0 && currentEnvDailyIndex < globalEnvDaily.length) {
    globalEnvDaily[currentEnvDailyIndex] = repObj;
  } else {
    globalEnvDaily.push(repObj);
    globalEnvDaily.sort((a, b) => String((a.date || '') + ' ' + (a.time || '')).localeCompare(String((b.date || '') + ' ' + (b.time || ''))));
    currentEnvDailyIndex = globalEnvDaily.length - 1;
  }

  try { localStorage.setItem('rmf_env_daily', JSON.stringify(globalEnvDaily)); } catch (err) {}
  renderSavedEnvDaily();
  updateEnvNavCounter();

  const btn = document.getElementById('submitEnvDailyBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...'; }

  fetch(window.API_URL, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: isEnvEditMode ? 'updateENVDaily' : 'submitENVDaily', performedBy: getEnvActorName(), reportData: repObj })
  }).finally(() => {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيان التفتيش اليومي للبيئة'; btn.style.backgroundColor = '#28a745'; }
    isEnvEditMode = false; currentEnvEditId = null;
    alert('✅ تم حفظ بيان التفتيش اليومي للبيئة بنجاح!');
    if (document.getElementById('envPrintDate')) document.getElementById('envPrintDate').value = repObj.date;
    switchEnvDailySubTab('report');
    generateEnvDailyPrintView(repObj);
  });
}

function renderSavedEnvDaily() {
  const tb = document.getElementById('saved-env-daily-tbody');
  if (!tb) return;
  tb.innerHTML = '';
  updateEnvNavCounter();
  if (!globalEnvDaily || globalEnvDaily.length === 0) {
    tb.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:15px;color:#777;font-weight:bold;">لا توجد سجلات تفتيش بيئي محفوظة بعد.</td></tr>';
    return;
  }
  globalEnvDaily.forEach((rep, idx) => {
    const fList = rep.findings || [];
    const closedCnt = fList.filter(f => f.status === 'تم' || f.status === 'مغلق').length;
    const openCnt = fList.length - closedCnt;
    let badge = fList.length === 0
      ? '<span style="background:#28a745;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold;font-size:11px;">سليم 100%</span>'
      : `<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">${openCnt > 0 ? `<span style="background:#dc3545;color:#fff;padding:3px 8px;border-radius:12px;font-weight:bold;font-size:11px;">${openCnt} معلق</span>` : ''}${closedCnt > 0 ? `<span style="background:#28a745;color:#fff;padding:3px 8px;border-radius:12px;font-weight:bold;font-size:11px;">${closedCnt} تم</span>` : ''}</div>`;

    tb.innerHTML += `
      <tr>
        <td dir="ltr" style="font-weight:bold;">${rep.date}</td>
        <td dir="ltr">${rep.time || '-'}</td>
        <td>${rep.shift || '-'}</td>
        <td>${rep.type || '-'}</td>
        <td>${rep.inspector || '-'}</td>
        <td>${badge}</td>
        <td style="white-space:nowrap;">
          <button type="button" onclick="generateEnvDailyPrintView(globalEnvDaily[${idx}])" style="background:#003366;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;margin-left:3px;"><i class="fa-solid fa-eye"></i> البيان</button>
          <button type="button" onclick="loadEnvDailyToForm(${idx})" style="background:#ffc107;color:#000;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;font-weight:bold;margin-left:3px;"><i class="fa-solid fa-pen"></i> تعديل</button>
          <button type="button" onclick="deleteEnvDailyRecord(${idx})" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
}

function updateEnvNavCounter() {
  const el = document.getElementById('nav-env-daily-counter');
  if (el) el.innerText = globalEnvDaily.length > 0 ? `${currentEnvDailyIndex + 1} / ${globalEnvDaily.length}` : '0 / 0';
}

function navEnvDaily(dir) {
  if (!globalEnvDaily.length) return alert("لا توجد سجلات.");
  if (dir === 'first') currentEnvDailyIndex = 0;
  else if (dir === 'last') currentEnvDailyIndex = globalEnvDaily.length - 1;
  else if (dir === 'next' && currentEnvDailyIndex < globalEnvDaily.length - 1) currentEnvDailyIndex++;
  else if (dir === 'prev' && currentEnvDailyIndex > 0) currentEnvDailyIndex--;
  if (currentEnvDailyIndex >= 0) loadEnvDailyToForm(currentEnvDailyIndex);
}

function loadEnvDailyToForm(idx) {
  const rep = globalEnvDaily[idx];
  if (!rep) return;
  currentEnvDailyIndex = idx;
  switchEnvDailySubTab('entry');
  document.getElementById('envDailyDate').value = rep.date || '';
  document.getElementById('envDailyTime').value = rep.time || '';
  document.getElementById('envDailyShift').value = rep.shift || 'نهاراً';
  document.getElementById('envDailyType').value = rep.type || '';
  document.getElementById('envDailyInspector').value = rep.inspector || '';
  const tb = document.getElementById('env-findings-entry-tbody');
  tb.innerHTML = '';
  (rep.findings || []).forEach(f => addEnvFindingRow(f));
  isEnvEditMode = true; currentEnvEditId = rep.id;
  updateEnvNavCounter();
}

function clearEnvDailyForm() {
  currentEnvDailyIndex = -1; isEnvEditMode = false; currentEnvEditId = null;
  document.getElementById('envDailyForm').reset();
  document.getElementById('envDailyDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('envDailyTime').value = new Date().toTimeString().slice(0, 5);
  document.getElementById('env-findings-entry-tbody').innerHTML = '';
  addEnvFindingRow();
  updateEnvNavCounter();
}

function deleteEnvDailyRecord(idx) {
  const rep = globalEnvDaily[idx];
  if (!rep || !confirm(`⚠️ حذف سجل يوم (${rep.date}) نهائياً؟`)) return;
  const delId = rep.id;
  globalEnvDaily.splice(idx, 1);
  try { localStorage.setItem('rmf_env_daily', JSON.stringify(globalEnvDaily)); } catch (e) {}
  renderSavedEnvDaily();
  fetch(window.API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteENVDaily', performedBy: getEnvActorName(), id: delId }) });
}

function generateEnvDailyPrintView(specificRep) {
  let rep = specificRep;
  if (!rep) {
    const dt = document.getElementById('envPrintDate')?.value;
    if (!dt) return alert("اختر التاريخ أولاً!");
    rep = globalEnvDaily.find(r => r.date === dt);
    if (!rep) return alert("لا يوجد سجل تفتيش بيئي لهذا التاريخ!");
  }
  const box = document.getElementById('printable-env-daily-report');
  if (!box) return;

  // إحصائيات الإدارات والتصنيفات كما في شيت الإكسل
  const deptMap = {};
  ENV_RESPONSIBLE_DEPTS.forEach(d => deptMap[d] = { done: 0, pend: 0 });
  const catMap = {};
  ENV_CLASSIFICATIONS.forEach(c => catMap[c] = { done: 0, pend: 0 });

  (rep.findings || []).forEach(f => {
    let isDone = (f.status === 'تم' || f.status === 'مغلق');
    if (!deptMap[f.dept]) deptMap[f.dept] = { done: 0, pend: 0 };
    if (isDone) deptMap[f.dept].done++; else deptMap[f.dept].pend++;

    if (!catMap[f.category]) catMap[f.category] = { done: 0, pend: 0 };
    if (isDone) catMap[f.category].done++; else catMap[f.category].pend++;
  });

  const fRows = (rep.findings || []).length === 0
    ? '<tr><td colspan="8" style="padding:12px;color:#28a745;font-weight:bold;">سليم 100% ولا توجد حالات غير مطابقة</td></tr>'
    : rep.findings.map((f, i) => `
      <tr>
        <td>${i + 1}</td>
        <td dir="ltr">${rep.date}</td>
        <td style="text-align:right;font-weight:bold;">${f.desc}</td>
        <td>${f.location}</td>
        <td>${f.category}</td>
        <td><b>${f.dept}</b></td>
        <td style="text-align:right;">${f.paCode ? '<b>[' + f.paCode + ']</b> ' : ''}${f.action}</td>
        <td style="color:${(f.status === 'تم' || f.status === 'مغلق') ? '#28a745' : '#dc3545'};font-weight:bold;">${f.status}</td>
      </tr>
    `).join('');

  let totDone = 0, totPend = 0;
  const deptSummaryRows = Object.keys(deptMap).filter(k => deptMap[k].done > 0 || deptMap[k].pend > 0).map(k => {
    totDone += deptMap[k].done; totPend += deptMap[k].pend;
    return `<tr><td style="text-align:right;font-weight:bold;">${k}</td><td>${deptMap[k].done}</td><td>${deptMap[k].pend}</td><td><b>${deptMap[k].done + deptMap[k].pend}</b></td></tr>`;
  }).join('');

  const catSummaryRows = Object.keys(catMap).filter(k => catMap[k].done > 0 || catMap[k].pend > 0).map(k => {
    return `<tr><td style="text-align:right;font-weight:bold;">${k}</td><td>${catMap[k].done}</td><td>${catMap[k].pend}</td><td><b>${catMap[k].done + catMap[k].pend}</b></td></tr>`;
  }).join('');

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:14px;">
      <div style="text-align:right;font-weight:bold;font-size:12px;">مطار مرسى علم الدولي<br>الإدارة العامة للسلامة والمطابقة<br>قسم البيئة ومكافحة مخاطر الحياة البرية</div>
      <div style="text-align:center;">
        <h2 style="margin:0;font-size:15.5px;font-weight:900;text-decoration:underline;">${rep.type || 'التفتيش اليومي لإدارة البيئة ومكافحة مخاطر الحياة البرية'}</h2>
        <div style="margin-top:4px;font-weight:bold;font-size:11.5px;">تاريخ التفتيش: ${rep.date} | وقت البداية: ${rep.time} (${rep.shift})</div>
      </div>
      <div><img src="LOGO-removebg-preview (1).png" style="height:50px;"></div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;margin-bottom:16px;" border="1" cellpadding="4">
      <thead><tr style="background:#f0f4f8;"><th>م</th><th>التاريخ</th><th>وصف الحالات غير المطابقة</th><th>المكان</th><th>تصنيف الحالة</th><th>الجهة المسئولة</th><th>الإجراء التصحيحي / الوقائي</th><th>الحالة</th></tr></thead>
      <tbody>${fRows}</tbody>
    </table>

    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px;">
      <div style="flex:1;min-width:260px;">
        <div style="background:#003366;color:#fff;padding:4px 8px;font-weight:bold;font-size:11px;">تحليل الإدارات المعنية بالحالات</div>
        <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;" border="1" cellpadding="4">
          <tr style="background:#f0f4f8;"><th>الإدارة / الجهة</th><th>تم</th><th>معلق</th><th>الإجمالي</th></tr>
          ${deptSummaryRows || '<tr><td colspan="4">لا يوجد</td></tr>'}
          <tr style="background:#e8f4fd;font-weight:bold;"><td>الإجمالي</td><td>${totDone}</td><td>${totPend}</td><td>${totDone + totPend}</td></tr>
        </table>
      </div>
      <div style="flex:1;min-width:260px;">
        <div style="background:#28a745;color:#fff;padding:4px 8px;font-weight:bold;font-size:11px;">تحليل الحالات حسب التصنيف</div>
        <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;" border="1" cellpadding="4">
          <tr style="background:#f0f4f8;"><th>تصنيف الحالة</th><th>تم</th><th>معلق</th><th>الإجمالي</th></tr>
          ${catSummaryRows || '<tr><td colspan="4">لا يوجد</td></tr>'}
          <tr style="background:#e8f4fd;font-weight:bold;"><td>الإجمالي</td><td>${totDone}</td><td>${totPend}</td><td>${totDone + totPend}</td></tr>
        </table>
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;padding-left:20px;font-weight:bold;font-size:12px;">
      <div>القائم بالأعمال (رئيس قسم البيئة ومكافحة مخاطر الحياة البرية): <span style="color:#003366;">${rep.inspector}</span></div>
    </div>
  `;
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth' });
}

async function exportEnvDailyPNG() {
  const el = document.getElementById('printable-env-daily-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض البيان الرسمي أولاً!");
  const dt = document.getElementById('envPrintDate')?.value || 'Report';
  const cvs = await window.rmfWithDesktopWidth(el, () => html2canvas(el, { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' }), '840px');
  await window.rmfExportCanvas(cvs, `ENV_Daily_${dt}.png`, `بيان التفتيش البيئي اليومي (${dt})`);
}

async function exportEnvDailyPDF() {
  const el = document.getElementById('printable-env-daily-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض البيان الرسمي أولاً!");
  const dt = document.getElementById('envPrintDate')?.value || 'Report';
  await window.rmfExportElementToPdf(el, `ENV_Daily_${dt}.pdf`, { margin: 0.25, filename: `ENV_Daily_${dt}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4' } }, `بيان التفتيش البيئي اليومي (${dt})`);
}

// =============================================================================
// التقرير الشهري للبيئة ومكافحة مخاطر الحياة البرية (ENV Monthly Report)
// =============================================================================
function getEnvPrevMonth(ms) {
  let p = ms.split('-'), d = new Date(parseInt(p[0]), parseInt(p[1]) - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function loadEnvMonthlyForm() {
  const mStr = document.getElementById('envMonthlyMonth')?.value || new Date().toISOString().slice(0, 7);
  const pmStr = getEnvPrevMonth(mStr);
  const cur = globalEnvMonthly[mStr] || {};
  const prev = globalEnvMonthly[pmStr] || {};

  if (cur.preparedBy && document.getElementById('envMonthlyPreparedBy')) {
    document.getElementById('envMonthlyPreparedBy').value = cur.preparedBy;
  }

  const cKpi = cur.kpis || { pendingEnv: 0, rectifiedEnv: 11, totalEnv: 11, meetingsEnv: 0 };
  const pKpi = cur.prevKpis || prev.kpis || { pendingEnv: 1, rectifiedEnv: 9, totalEnv: 10, meetingsEnv: 0 };

  const container = document.getElementById('env-monthly-form-container');
  if (!container) return;

  let kpiRows = ENV_MONTHLY_KPIS.map(k => `
    <tr>
      <td style="text-align:right;font-weight:bold;">${k.label}</td>
      <td><input type="number" id="env_mk_p_${k.key}" value="${pKpi[k.key] || 0}" oninput="recalcEnvMonthlyDiff()" style="width:70px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td>
      <td><input type="number" id="env_mk_c_${k.key}" value="${cKpi[k.key] || 0}" oninput="recalcEnvMonthlyDiff()" style="width:70px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td>
      <td id="env_mk_d_${k.key}" style="font-weight:bold;">00</td>
    </tr>
  `).join('');

  const obsList = cur.observations || [];

  container.innerHTML = `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">جدول مؤشرات البيئة ومكافحة مخاطر الحياة البرية (${pmStr} / ${mStr})</div>
      <div style="width:100%;overflow-x:auto;"><table class="report-table" style="width:100%;min-width:520px;margin:0;"><thead><tr><th>البيان</th><th>الشهر السابق</th><th>الشهر الحالي</th><th>الفرق</th></tr></thead><tbody>${kpiRows}</tbody></table></div>
    </div>

    <div style="border:1.5px solid #28a745;border-radius:8px;padding:15px;background:#fff;margin-bottom:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
      <div class="form-group"><label>الحوادث البيئية:</label><input type="text" id="envMAccidents" value="${cur.accidentsText || 'لا يوجد'}"></div>
      <div class="form-group"><label>نتيجة تقييم أداء شركة المكافحة (%):</label><input type="text" id="envMPestEval" value="${cur.pestEval || '78.0%'}" placeholder="مثال: 78.0%"></div>
      <div class="form-group" style="grid-column:1 / -1;"><label>أ- التفتيش والمرور الأسبوعي على سور السلك بمنطقة العمليات الجوية:</label><input type="text" id="envMFenceText" value="${cur.fenceText || 'تم عمل المرور الدوري وتنظيف الأسوار وسد الفتحات.'}"></div>
      <div class="form-group" style="grid-column:1 / -1;"><label>ب- التفتيش والمرور الشهري على مناطق الجذب الخارجية للطيور والحياة البرية:</label><input type="text" id="envMExternalText" value="${cur.externalText || 'تم عمل المرور الشهري على مناطق الجذب الخارجية.'}"></div>
    </div>

    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;">
        <span>نتائج المرور والملاحظات التي تم رصدها وإجراءاتها التصحيحية</span>
        <button type="button" onclick="addEnvMonthlyObsRow()" style="background:#28a745;color:#fff;border:none;padding:4px 12px;border-radius:4px;font-weight:bold;cursor:pointer;">+ إضافة ملاحظة</button>
      </div>
      <div id="env-m-obs-box" style="padding:12px;">${obsList.map(o => buildEnvMonthlyObsRowHtml(o)).join('')}</div>
    </div>
  `;
  recalcEnvMonthlyDiff();
}

function buildEnvMonthlyObsRowHtml(o) {
  const item = o || { desc: '', location: '', category: 'ثعبان', dept: 'جرين لاب', date: '', action: '', status: 'تم' };
  const catOpts = ENV_CLASSIFICATIONS.map(c => `<option value="${c}" ${c === item.category ? 'selected' : ''}>${c}</option>`).join('');
  const deptOpts = ENV_RESPONSIBLE_DEPTS.map(d => `<option value="${d}" ${d === item.dept ? 'selected' : ''}>${d}</option>`).join('');
  return `
    <div class="env-m-obs-row" style="border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:10px;background:#fbfcfe;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;">
      <input type="text" class="env-mo-desc" value="${(item.desc || '').replace(/"/g, '&quot;')}" placeholder="وصف الملاحظة..." style="grid-column:1 / -1;padding:6px;border:1px solid #ccc;border-radius:4px;font-weight:bold;">
      <input type="text" list="envLocationsList" class="env-mo-loc" value="${(item.location || '').replace(/"/g, '&quot;')}" placeholder="المكان..." style="padding:5px;border:1px solid #ccc;border-radius:4px;">
      <select class="env-mo-cat" style="padding:5px;border:1px solid #ccc;border-radius:4px;">${catOpts}</select>
      <select class="env-mo-dept" style="padding:5px;border:1px solid #ccc;border-radius:4px;">${deptOpts}</select>
      <input type="date" class="env-mo-date" value="${item.date || ''}" style="padding:5px;border:1px solid #ccc;border-radius:4px;">
      <select class="env-mo-status" style="padding:5px;border:1px solid #ccc;border-radius:4px;font-weight:bold;"><option value="تم" ${item.status === 'تم' ? 'selected' : ''}>تم ✔</option><option value="معلق" ${item.status === 'معلق' ? 'selected' : ''}>معلق ⚠️</option></select>
      <input type="text" class="env-mo-act" value="${(item.action || '').replace(/"/g, '&quot;')}" placeholder="الإجراء التصحيحي ورقم PA..." style="grid-column:1 / -1;padding:6px;border:1px solid #ccc;border-radius:4px;">
      <button type="button" onclick="this.closest('.env-m-obs-row').remove()" style="background:#dc3545;color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;width:fit-content;"><i class="fa-solid fa-trash"></i> حذف</button>
    </div>
  `;
}
function addEnvMonthlyObsRow() { document.getElementById('env-m-obs-box')?.insertAdjacentHTML('beforeend', buildEnvMonthlyObsRowHtml()); }

function formatEnvTrendBadge(cur, prev, higherBetter) {
  let d = Number(cur) - Number(prev);
  let absStr = String(Math.abs(Math.round(d))).padStart(2, '0');
  if (d === 0) {
    return `<span style="color:#0d6efd;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">00 <i class="fa-solid fa-arrow-right"></i></span>`;
  }
  let isGood = higherBetter ? (d > 0) : (d < 0);
  let clr = isGood ? "#28a745" : "#dc3545";
  let ico = (d > 0) ? "fa-arrow-up" : "fa-arrow-down";
  return `<span style="color:${clr};font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">${absStr} <i class="fa-solid ${ico}"></i></span>`;
}

function recalcEnvMonthlyDiff() {
  // Enforce logical total: totalEnv = pendingEnv + rectifiedEnv
  const pPend = Number(document.getElementById('env_mk_p_pendingEnv')?.value || 0);
  const pRect = Number(document.getElementById('env_mk_p_rectifiedEnv')?.value || 0);
  const cPend = Number(document.getElementById('env_mk_c_pendingEnv')?.value || 0);
  const cRect = Number(document.getElementById('env_mk_c_rectifiedEnv')?.value || 0);
  if (document.getElementById('env_mk_p_totalEnv')) document.getElementById('env_mk_p_totalEnv').value = pPend + pRect;
  if (document.getElementById('env_mk_c_totalEnv')) document.getElementById('env_mk_c_totalEnv').value = cPend + cRect;

  ENV_MONTHLY_KPIS.forEach(k => {
    const p = Number(document.getElementById(`env_mk_p_${k.key}`)?.value || 0);
    const c = Number(document.getElementById(`env_mk_c_${k.key}`)?.value || 0);
    const dEl = document.getElementById(`env_mk_d_${k.key}`);
    if (dEl) {
      dEl.innerHTML = formatEnvTrendBadge(c, p, k.higherBetter);
    }
  });
}

function autoPopulateEnvMonthly() {
  const mStr = document.getElementById('envMonthlyMonth')?.value;
  if (!mStr) return alert("اختر الشهر أولاً!");
  const reps = globalEnvDaily.filter(r => r.date && r.date.startsWith(mStr));
  if (!reps.length) return alert(`لا توجد سجلات تفتيش بيئي يومي خلال شهر (${mStr})!`);

  let obs = [], doneCnt = 0, pendCnt = 0;
  reps.forEach(r => {
    (r.findings || []).forEach(f => {
      const isDone = (f.status === 'تم' || f.status === 'مغلق');
      if (isDone) doneCnt++; else pendCnt++;
      obs.push({
        desc: f.desc, location: f.location, category: f.category, dept: f.dept, date: r.date,
        action: `${f.paCode ? '[' + f.paCode + '] ' : ''}${f.action}`,
        status: isDone ? 'تم' : 'معلق'
      });
    });
  });

  document.getElementById('env_mk_c_pendingEnv').value = pendCnt;
  document.getElementById('env_mk_c_rectifiedEnv').value = doneCnt;
  document.getElementById('env_mk_c_totalEnv').value = pendCnt + doneCnt;
  document.getElementById('env-m-obs-box').innerHTML = obs.map(o => buildEnvMonthlyObsRowHtml(o)).join('');
  recalcEnvMonthlyDiff();
  alert(`✅ تم تجميع (${obs.length}) حالة بيئية من (${reps.length}) سجل تفتيش يومي!`);
}

function saveEnvMonthlyReport() {
  const mStr = document.getElementById('envMonthlyMonth')?.value;
  if (!mStr) return alert("اختر الشهر!");
  let kpis = {}, prevKpis = {};
  ENV_MONTHLY_KPIS.forEach(k => {
    prevKpis[k.key] = Number(document.getElementById(`env_mk_p_${k.key}`)?.value || 0);
    kpis[k.key] = Number(document.getElementById(`env_mk_c_${k.key}`)?.value || 0);
  });

  let observations = [];
  document.querySelectorAll('#env-m-obs-box .env-m-obs-row').forEach(r => {
    let d = r.querySelector('.env-mo-desc')?.value?.trim();
    if (d) {
      observations.push({
        desc: d,
        location: r.querySelector('.env-mo-loc')?.value?.trim() || '-',
        category: r.querySelector('.env-mo-cat')?.value || 'أخرى',
        dept: r.querySelector('.env-mo-dept')?.value || 'الشئون الإدارية',
        date: r.querySelector('.env-mo-date')?.value || '',
        status: r.querySelector('.env-mo-status')?.value || 'تم',
        action: r.querySelector('.env-mo-act')?.value?.trim() || ''
      });
    }
  });

  const obj = {
    month: mStr,
    preparedBy: document.getElementById('envMonthlyPreparedBy')?.value?.trim() || 'أحمد إسماعيل محمد',
    kpis: kpis, prevKpis: prevKpis, observations: observations,
    accidentsText: document.getElementById('envMAccidents')?.value || 'لا يوجد',
    pestEval: document.getElementById('envMPestEval')?.value || '78.0%',
    fenceText: document.getElementById('envMFenceText')?.value || '',
    externalText: document.getElementById('envMExternalText')?.value || ''
  };

  globalEnvMonthly[mStr] = obj;
  try { localStorage.setItem('rmf_env_monthly', JSON.stringify(globalEnvMonthly)); } catch (e) {}

  fetch(window.API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveENVMonthly', performedBy: getEnvActorName(), monthlyData: obj }) }).finally(() => {
    alert("✅ تم حفظ بيانات التقرير الشهري للبيئة والحياة البرية بنجاح!");
    document.getElementById('envExtractMonth').value = mStr;
    switchEnvMonthlySubTab('extract');
    generateEnvMonthlyPreview();
  });
}

function generateEnvMonthlyPreview() {
  const mStr = document.getElementById('envExtractMonth')?.value;
  const rep = globalEnvMonthly[mStr];
  if (!rep) return alert("لا توجد بيانات محفوظة لهذا الشهر! يرجى حفظ البيانات أولاً.");

  const pmStr = getEnvPrevMonth(mStr);
  const mAr = new Date(mStr + '-01').toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
  const pmAr = new Date(pmStr + '-01').toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

  const kpiRows = ENV_MONTHLY_KPIS.map(k => {
    let p = Number(rep.prevKpis?.[k.key] || 0), c = Number(rep.kpis?.[k.key] || 0);
    if (k.key === 'totalEnv') {
      p = Number(rep.prevKpis?.pendingEnv || 0) + Number(rep.prevKpis?.rectifiedEnv || 0);
      c = Number(rep.kpis?.pendingEnv || 0) + Number(rep.kpis?.rectifiedEnv || 0);
    }
    let badge = formatEnvTrendBadge(c, p, k.higherBetter);
    return `<tr><td style="border:1px solid #888;padding:7px;text-align:right;font-weight:bold;">${k.label}</td><td style="border:1px solid #888;padding:7px;">${String(p).padStart(2, '0')}</td><td style="border:1px solid #888;padding:7px;font-weight:bold;">${String(c).padStart(2, '0')}</td><td style="border:1px solid #888;padding:7px;font-weight:bold;">${badge}</td></tr>`;
  }).join('');

  const deptMap = {};
  const catMap = {};
  const locMap = {};
  (rep.observations || []).forEach(o => {
    const isDone = o.status === 'تم';
    if (!deptMap[o.dept]) deptMap[o.dept] = { done: 0, pend: 0 };
    if (isDone) deptMap[o.dept].done++; else deptMap[o.dept].pend++;

    if (!catMap[o.category]) catMap[o.category] = { done: 0, pend: 0 };
    if (isDone) catMap[o.category].done++; else catMap[o.category].pend++;

    if (o.location && o.location !== '-') locMap[o.location] = (locMap[o.location] || 0) + 1;
  });

  const obsHtml = (rep.observations || []).length === 0
    ? '<p style="color:#28a745;font-weight:bold;">لا توجد ملاحظات مسجلة خلال الشهر.</p>'
    : `<ol style="margin:6px 0;padding-right:22px;line-height:1.8;font-size:11.5px;">${rep.observations.map(o => `<li><b>${o.desc}</b> (${o.location}) - <span dir="ltr">${o.date}</span><br><span style="color:#003366;">الإجراء التصحيحي:</span> ${o.action} — <b style="color:${o.status === 'تم' ? '#28a745' : '#dc3545'};">[${o.status}]</b></li>`).join('')}</ol>`;

  const prevEl = document.getElementById('printable-env-monthly-report');
  prevEl.innerHTML = `
    <div style="max-width:850px;margin:0 auto;padding:28px 24px;background:#fff;border:1.5px solid #cbd5e1;border-radius:8px;font-family:'Cairo',sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #28a745;padding-bottom:12px;margin-bottom:18px;">
        <div style="text-align:right;"><h2 style="color:#003366;margin:0;font-size:16px;">مطار مرسى علم الدولي</h2><h3 style="color:#003366;margin:3px 0 0 0;font-size:14px;">الإدارة العامة للسلامة والمطابقة</h3><h4 style="color:#28a745;margin:3px 0 0 0;font-size:13px;">قسم البيئة ومكافحة مخاطر الحياة البرية</h4></div>
        <div><img src="LOGO-removebg-preview (1).png" style="height:60px;"></div>
      </div>
      <div style="text-align:center;background:#f0fff4;border:1.5px solid #28a745;padding:10px;border-radius:8px;margin-bottom:16px;"><h2 style="margin:0;color:#003366;font-size:17px;">التقرير الشهري لقسم البيئة ومكافحة مخاطر الحياة البرية - ${mAr}</h2></div>

      <table style="width:100%;border-collapse:collapse;font-size:11.5px;text-align:center;margin-bottom:16px;"><thead><tr style="background:#003366;color:#fff;"><th style="padding:8px;text-align:right;">البيان</th><th>${pmAr}</th><th>${mAr}</th><th>الفرق</th></tr></thead><tbody>${kpiRows}</tbody></table>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px;">
        <div style="height:200px;background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;"><canvas id="envMonthlyDeptChart"></canvas></div>
        <div style="height:200px;background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;"><canvas id="envMonthlyCatChart"></canvas></div>
        <div style="height:200px;background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;"><canvas id="envMonthlyLocChart"></canvas></div>
      </div>

      <div style="border:1px solid #ccc;border-radius:6px;padding:12px;background:#f9fbfd;line-height:1.8;font-size:12px;margin-bottom:14px;">
        <div><b>• الحوادث:</b> ${rep.accidentsText || 'لا يوجد'}</div>
        <div><b>• نتائج التفتيشات البيئية:</b><br>
          <b>أ- التفتيش والمرور الأسبوعي على سور السلك بمنطقة العمليات الجوية:</b> ${rep.fenceText}<br>
          <b>ب- التفتيش والمرور الشهري على مناطق الجذب الخارجية للطيور والحياة البرية:</b> ${rep.externalText}
        </div>
        <div><b>• نتيجة تقييم أداء شركة المكافحة:</b> <span style="color:#003366;font-weight:900;">(${rep.pestEval})</span> عن الشهر الحالي وتم إرساله لإدارة الشئون الإدارية.</div>
      </div>

      <div style="background:#28a745;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;margin-bottom:6px;">نتائج المرور والملاحظات التي تم رصدها:</div>
      ${obsHtml}

      <div style="margin-top:25px;text-align:left;padding-left:20px;font-weight:bold;"><div>إعداد: ${rep.preparedBy}</div><div style="color:#28a745;">رئيس قسم البيئة ومكافحة مخاطر الحياة البرية</div></div>
    </div>
  `;
  prevEl.style.display = 'block';

  if (envChartDeptInstance) envChartDeptInstance.destroy();
  if (envChartCatInstance) envChartCatInstance.destroy();
  if (envChartLocInstance) envChartLocInstance.destroy();

  const ctxD = document.getElementById('envMonthlyDeptChart')?.getContext('2d');
  if (ctxD) {
    const dLabels = Object.keys(deptMap);
    envChartDeptInstance = new Chart(ctxD, { type: 'bar', data: { labels: dLabels, datasets: [{ label: 'تم', data: dLabels.map(l => deptMap[l].done), backgroundColor: '#28a745' }, { label: 'معلق', data: dLabels.map(l => deptMap[l].pend), backgroundColor: '#dc3545' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'الإدارة / الجهة المعنية بحالات عدم المطابقة' } } } });
  }
  const ctxC = document.getElementById('envMonthlyCatChart')?.getContext('2d');
  if (ctxC) {
    const cLabels = Object.keys(catMap);
    envChartCatInstance = new Chart(ctxC, { type: 'bar', data: { labels: cLabels, datasets: [{ label: 'تم', data: cLabels.map(l => catMap[l].done), backgroundColor: '#28a745' }, { label: 'معلق', data: cLabels.map(l => catMap[l].pend), backgroundColor: '#dc3545' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'حصر وتصنيف حالات عدم المطابقة البيئية' } } } });
  }
  const ctxL = document.getElementById('envMonthlyLocChart')?.getContext('2d');
  if (ctxL) {
    const lLabels = Object.keys(locMap);
    envChartLocInstance = new Chart(ctxL, { type: 'doughnut', data: { labels: lLabels, datasets: [{ data: lLabels.map(l => locMap[l]), backgroundColor: ['#003366', '#28a745', '#fd7e14', '#17a2b8', '#6f42c1', '#dc3545', '#ffc107', '#20c997'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'أماكن رصد المخاطر البيئية' }, legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 8 } } } } } });
  }
}

async function exportEnvMonthlyPNG() {
  const el = document.getElementById('printable-env-monthly-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض التقرير أولاً!");
  const m = document.getElementById('envExtractMonth')?.value || 'Report';
  const cvs = await window.rmfWithDesktopWidth(el, () => html2canvas(el, { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' }), '840px');
  await window.rmfExportCanvas(cvs, `ENV_Monthly_${m}.png`, `التقرير الشهري للبيئة والحياة البرية (${m})`);
}
async function exportEnvMonthlyPDF() {
  const el = document.getElementById('printable-env-monthly-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض التقرير أولاً!");
  const m = document.getElementById('envExtractMonth')?.value || 'Report';
  await window.rmfExportElementToPdf(el, `ENV_Monthly_${m}.pdf`, { margin: 0.25, filename: `ENV_Monthly_${m}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4' } }, `التقرير الشهري للبيئة والحياة البرية (${m})`);
}
async function sendEnvMonthlyEmail() {
  const mStr = document.getElementById('envExtractMonth')?.value;
  const el = document.getElementById('printable-env-monthly-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض التقرير أولاً!");
  const cvs = await html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = cvs.toDataURL('image/jpeg', 0.85);
  await fetch(window.API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'sendReportEmail', subject: `التقرير الشهري لقسم البيئة والحياة البرية - ${mStr}`, htmlBody: `<div dir="rtl"><h2>التقرير الشهري لقسم البيئة ومكافحة مخاطر الحياة البرية - ${mStr}</h2><img src="cid:monthlyReportImage" style="max-width:100%;"></div>`, imageData: imgData, imageName: `ENV_Report_${mStr}.jpg` }) });
  alert("✅ تم إرسال التقرير بالإيميل بنجاح!");
}
