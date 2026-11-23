/**
 * General Department of Safety and Compliance - Marsa Alam Airport
 * Occupational Safety & Health Module (osh.js)
 */

window.API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

const OSH_RESPONSIBLE_DEPTS = [
  "الهندسة المدنية",
  "الهندسة الميكانيكية",
  "الهندسة الكهربائية",
  "إدارة الاتصالات",
  "شركات خارجية",
  "الشئون الإدارية",
  "أخرى"
];

const OSH_HAZARD_CATEGORIES = [
  "مخاطر كهربائية",
  "مخاطر حريق وإطفاء",
  "مخاطر ميكانيكية ومعدات",
  "بيئة العمل ومهمات الوقاية (PPE)",
  "سلامة مرورية وساحات انتظار",
  "تخزين ومواد خطرة",
  "أخرى"
];

const OSH_CHECKLIST_GROUPS = [
  {
    title: "1. المخاطر الكهربائية",
    cat: "مخاطر كهربائية",
    defaultDept: "الهندسة الكهربائية",
    items: [
      "صدأ أو تلف باللوحات الكهربائية الفرعية وعدم وجود دهان عازل",
      "مقابس أو مفاتيح كهربائية بدون غطاء خارجي / أسلاك مكشوفة",
      "وصلات كهربائية عشوائية ومشتركات غير مطابقة للمواصفات",
      "عدم إحكام غلق غرف ولوحات الكهرباء أو غياب العلامات التحذيرية",
      "محطات الكهرباء الفرعية وأنظمة الإطفاء التلقائي (CO2 / Fire Search)"
    ]
  },
  {
    title: "2. الوقاية من الحريق ومهمات الإطفاء",
    cat: "مخاطر حريق وإطفاء",
    defaultDept: "شركات خارجية",
    items: [
      "إعاقة الوصول لصناديق الحريق وطفايات الإطفاء بتخزين بضائع أو ديكور",
      "طفايات حريق غير صالحة أو منتهية الصلاحية أو غير مثبتة",
      "إغلاق أو إعاقة مخارج الطوارئ ومسارات الهروب",
      "عطل في لوحة إنذار الحريق أو كواشف الدخان أو إضاءة الطوارئ"
    ]
  },
  {
    title: "3. بيئة العمل ومهمات الوقاية (PPE)",
    cat: "بيئة العمل ومهمات الوقاية (PPE)",
    defaultDept: "الشئون الإدارية",
    items: [
      "عدم التزام العاملين بارتداء مهمات الوقاية الشخصية المناسبة",
      "تلف بالأرضيات أو السلالم أو الممرات يسبب مخاطر انزلاق وتعثر",
      "سوء التهوية أو الإضاءة في أماكن العمل والورش",
      "تخزين غير آمن للمواد الكيميائية أو أسطوانات الغاز"
    ]
  },
  {
    title: "4. السلامة المرورية وساحات الانتظار",
    cat: "سلامة مرورية وساحات انتظار",
    defaultDept: "الهندسة المدنية",
    items: [
      "نقص الوسائل الإطفائية المناسبة بساحة انتظار الأتوبيسات والسيارات",
      "عدم الالتزام بمسارات السير والسرعات المحددة بالساحات الخارجية",
      "غياب اللوحات الإرشادية والتحذيرية بمناطق حركة المركبات والمشاة"
    ]
  }
];

const OSH_MONTHLY_KPIS = [
  { key: "totalFindings", label: "حالات عدم المطابقة", higherBetter: false },
  { key: "rectifiedFindings", label: "حالات عدم المطابقة التي تم تلافيها", higherBetter: true },
  { key: "pendingFindings", label: "حالات عدم المطابقة المعلقة", higherBetter: false },
  { key: "incidents", label: "الوقائع", higherBetter: false },
  { key: "workInjuries", label: "إصابات العمل", higherBetter: false },
  { key: "meetings", label: "الاجتماعات", higherBetter: true }
];

var globalOshDaily = [];
var globalOshMonthly = {};
let currentOshDailyIndex = -1;
let isOshEditMode = false;
let currentOshEditId = null;
let oshMonthlyChart = null;
let oshDailyChart = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check auth session
  try {
    const uStr = sessionStorage.getItem('rmf_user');
    if (uStr) {
      const u = JSON.parse(uStr);
      const r = (u.Role || '').toLowerCase();
      if (!r.includes('admin') && document.getElementById('oshBackMainBtn')) {
        document.getElementById('oshBackMainBtn').style.display = 'none';
      }
    }
  } catch (e) {}

  try {
    const dCache = localStorage.getItem('rmf_osh_daily');
    if (dCache) globalOshDaily = JSON.parse(dCache) || [];
    const mCache = localStorage.getItem('rmf_osh_monthly');
    if (mCache) globalOshMonthly = JSON.parse(mCache) || {};
  } catch (e) {}

  const today = new Date().toISOString().split('T')[0];
  const curMonth = today.slice(0, 7);
  if (document.getElementById('oshDailyDate')) document.getElementById('oshDailyDate').value = today;
  if (document.getElementById('oshDailyTime')) document.getElementById('oshDailyTime').value = new Date().toTimeString().slice(0, 5);
  if (document.getElementById('oshPrintDate')) document.getElementById('oshPrintDate').value = today;
  if (document.getElementById('oshMonthlyMonth')) document.getElementById('oshMonthlyMonth').value = curMonth;
  if (document.getElementById('oshExtractMonth')) document.getElementById('oshExtractMonth').value = curMonth;

  buildOshChecklist();
  renderSavedOshDaily();
  updateOshNavCounter();
  loadOshMonthlyForm();
  syncOshFromServer();
});

function getOshActorName() {
  try {
    const u = JSON.parse(sessionStorage.getItem('rmf_user') || 'null');
    if (u && u.Username) return u.Username;
  } catch (e) {}
  return document.getElementById('oshDailyInspector')?.value?.trim() || 'OSH Officer';
}

function initOshSection() {
  try {
    const uObj = (typeof currentLoggedInUser !== 'undefined' && currentLoggedInUser) ? currentLoggedInUser : JSON.parse(sessionStorage.getItem('rmf_user') || 'null');
    const r = (uObj && uObj.Role ? uObj.Role : '').toLowerCase();
    const backBtn = document.getElementById('oshBackMainBtn');
    if (backBtn) backBtn.style.display = r.includes('admin') ? 'inline-flex' : 'none';
  } catch (e) {}
  try {
    const dCache = localStorage.getItem('rmf_osh_daily');
    if (dCache) globalOshDaily = JSON.parse(dCache) || [];
    const mCache = localStorage.getItem('rmf_osh_monthly');
    if (mCache) globalOshMonthly = JSON.parse(mCache) || {};
  } catch (e) {}
  buildOshChecklist();
  renderSavedOshDaily();
  updateOshNavCounter();
  loadOshMonthlyForm();
  syncOshFromServer();
}

function oshLogout() {
  if (typeof logout === 'function') { logout(); return; }
  try { sessionStorage.removeItem('rmf_user'); } catch (e) {}
  window.location.href = 'index.html';
}

function syncOshFromServer() {
  const cb = 'jsonpOsh_' + Math.round(100000 * Math.random());
  window[cb] = function (d) {
    try {
      if (d && d.status === 'success') {
        if (Array.isArray(d.oshDaily) && d.oshDaily.length > 0) {
          globalOshDaily = d.oshDaily.sort((a, b) => String((a.date || '') + ' ' + (a.time || '')).localeCompare(String((b.date || '') + ' ' + (b.time || ''))));
          try { localStorage.setItem('rmf_osh_daily', JSON.stringify(globalOshDaily)); } catch (e) {}
          renderSavedOshDaily();
        }
        if (d.oshMonthly && typeof d.oshMonthly === 'object' && Object.keys(d.oshMonthly).length > 0) {
          globalOshMonthly = d.oshMonthly;
          try { localStorage.setItem('rmf_osh_monthly', JSON.stringify(globalOshMonthly)); } catch (e) {}
          loadOshMonthlyForm();
        }
      }
    } catch (err) {} finally { delete window[cb]; }
  };
  const s = document.createElement('script');
  s.src = window.API_URL + '?action=getAppData&_t=' + Date.now() + '&callback=' + cb;
  document.body.appendChild(s);
}

function switchOshMainTab(tab) {
  const bD = document.getElementById('osh-main-tab-daily');
  const bM = document.getElementById('osh-main-tab-monthly');
  const vD = document.getElementById('osh-view-daily');
  const vM = document.getElementById('osh-view-monthly');
  if (tab === 'daily') {
    vD.style.display = 'block'; vM.style.display = 'none';
    bD.style.background = '#fd7e14'; bM.style.background = '#6c757d';
  } else {
    vD.style.display = 'none'; vM.style.display = 'block';
    bM.style.background = '#003366'; bD.style.background = '#6c757d';
    loadOshMonthlyForm();
  }
}

function switchOshDailySubTab(tab) {
  document.querySelectorAll('#osh-view-daily .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#osh-view-daily .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-osh-daily-' + tab)?.classList.add('active');
  document.getElementById('tab-osh-daily-' + tab)?.classList.add('active');
  if (tab === 'report') renderSavedOshDaily();
}

function switchOshMonthlySubTab(tab) {
  document.querySelectorAll('#osh-view-monthly .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#osh-view-monthly .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-osh-monthly-' + tab)?.classList.add('active');
  document.getElementById('tab-osh-monthly-' + tab)?.classList.add('active');
}

function buildOshChecklist() {
  const grid = document.getElementById('osh-checklist-grid');
  if (!grid) return;
  let html = '';
  let idx = 0;
  OSH_CHECKLIST_GROUPS.forEach(grp => {
    html += `<div class="osh-col"><div class="osh-col-hdr">${grp.title}</div>`;
    grp.items.forEach(itm => {
      html += `
        <div class="osh-chk-row">
          <input type="checkbox" id="osh_chk_${idx}" onchange="onOshChecklistToggle(this, '${itm.replace(/'/g, "\\'")}', '${grp.cat}', '${grp.defaultDept}')">
          <label for="osh_chk_${idx}">${itm}</label>
        </div>
      `;
      idx++;
    });
    html += `</div>`;
  });
  grid.innerHTML = html;
}

function onOshChecklistToggle(chk, itemText, category, defaultDept) {
  if (chk.checked) {
    addOshFindingRow({
      desc: itemText,
      location: "",
      category: category,
      dept: defaultDept,
      action: "",
      status: "مفتوح",
      rectDate: ""
    });
  }
}

function addOshFindingRow(data) {
  const tb = document.getElementById('osh-findings-entry-tbody');
  if (!tb) return;
  const f = data || { desc: "", location: "", category: "مخاطر كهربائية", dept: "الهندسة المدنية", action: "", status: "مفتوح", rectDate: "" };
  const isCl = f.status === 'مغلق';
  const catOpts = OSH_HAZARD_CATEGORIES.map(c => `<option value="${c}" ${c === f.category ? 'selected' : ''}>${c}</option>`).join('');
  const deptOpts = OSH_RESPONSIBLE_DEPTS.map(d => `<option value="${d}" ${d === f.dept ? 'selected' : ''}>${d}</option>`).join('');

  const tr = document.createElement('tr');
  tr.className = 'osh-finding-row';
  tr.innerHTML = `
    <td><input type="text" class="osh-f-desc" value="${(f.desc || '').replace(/"/g, '&quot;')}" placeholder="وصف الخطر بالتفصيل..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td>
    <td><input type="text" class="osh-f-loc" value="${(f.location || '').replace(/"/g, '&quot;')}" placeholder="المكان / الصالة..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td>
    <td><select class="osh-f-cat" style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;">${catOpts}</select></td>
    <td><select class="osh-f-dept" style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;">${deptOpts}</select></td>
    <td><input type="text" class="osh-f-act" value="${(f.action || '').replace(/"/g, '&quot;')}" placeholder="الإجراء التصحيحي..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td>
    <td>
      <input type="hidden" class="osh-f-status" value="${isCl ? 'مغلق' : 'مفتوح'}">
      <input type="hidden" class="osh-f-rdate" value="${f.rectDate || ''}">
      <button type="button" onclick="toggleOshFindingStatusBtn(this)" style="background:${isCl ? '#28a745' : '#dc3545'};color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px;white-space:nowrap;">
        ${isCl ? 'مغلق ✔' : 'مفتوح'}
      </button>
    </td>
    <td><button type="button" onclick="this.closest('tr').remove()" style="background:#888;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
  `;
  tb.appendChild(tr);
}

function toggleOshFindingStatusBtn(btn) {
  const tr = btn.closest('tr');
  const stInp = tr.querySelector('.osh-f-status');
  const rdInp = tr.querySelector('.osh-f-rdate');
  const today = new Date().toISOString().split('T')[0];
  if (stInp.value !== 'مغلق') {
    stInp.value = 'مغلق'; rdInp.value = today;
    btn.style.background = '#28a745'; btn.innerHTML = 'مغلق ✔';
  } else {
    stInp.value = 'مفتوح'; rdInp.value = '';
    btn.style.background = '#dc3545'; btn.innerHTML = 'مفتوح';
  }
}

function submitOshDailyInspection(e) {
  if (e) e.preventDefault();
  const dt = document.getElementById('oshDailyDate')?.value || new Date().toISOString().split('T')[0];
  const tm = document.getElementById('oshDailyTime')?.value || '09:00';
  const sh = document.getElementById('oshDailyShift')?.value || 'صباحي';
  const scope = document.getElementById('oshDailyScope')?.value || 'مرور يومي عام على مرافق المطار';
  const insp = document.getElementById('oshDailyInspector')?.value?.trim() || 'مسئول السلامة والصحة المهنية';

  let findings = [];
  document.querySelectorAll('#osh-findings-entry-tbody .osh-finding-row').forEach(tr => {
    const desc = tr.querySelector('.osh-f-desc')?.value?.trim() || '';
    if (desc) {
      findings.push({
        desc: desc,
        location: tr.querySelector('.osh-f-loc')?.value?.trim() || '-',
        category: tr.querySelector('.osh-f-cat')?.value || 'أخرى',
        dept: tr.querySelector('.osh-f-dept')?.value || 'أخرى',
        action: tr.querySelector('.osh-f-act')?.value?.trim() || 'جاري المتابعة',
        status: tr.querySelector('.osh-f-status')?.value || 'مفتوح',
        rectDate: tr.querySelector('.osh-f-rdate')?.value || ''
      });
    }
  });

  const repObj = {
    id: isOshEditMode ? (currentOshEditId || Date.now()) : Date.now(),
    date: dt, time: tm, shift: sh, scope: scope, inspector: insp, findings: findings
  };

  if (isOshEditMode && currentOshDailyIndex >= 0 && currentOshDailyIndex < globalOshDaily.length) {
    globalOshDaily[currentOshDailyIndex] = repObj;
  } else {
    globalOshDaily.push(repObj);
    globalOshDaily.sort((a, b) => String((a.date || '') + ' ' + (a.time || '')).localeCompare(String((b.date || '') + ' ' + (b.time || ''))));
    currentOshDailyIndex = globalOshDaily.length - 1;
  }

  try { localStorage.setItem('rmf_osh_daily', JSON.stringify(globalOshDaily)); } catch (err) {}
  renderSavedOshDaily();
  updateOshNavCounter();

  const btn = document.getElementById('submitOshDailyBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...'; }

  fetch(window.API_URL, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: isOshEditMode ? 'updateOSHDaily' : 'submitOSHDaily', performedBy: getOshActorName(), reportData: repObj })
  }).finally(() => {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ جولة السلامة والصحة المهنية'; btn.style.backgroundColor = '#fd7e14'; }
    isOshEditMode = false; currentOshEditId = null;
    alert('✅ تم حفظ جولة السلامة والصحة المهنية بنجاح!');
    if (document.getElementById('oshPrintDate')) document.getElementById('oshPrintDate').value = repObj.date;
    switchOshDailySubTab('report');
    generateOshDailyPrintView(repObj);
  });
}

function renderSavedOshDaily() {
  const tb = document.getElementById('saved-osh-daily-tbody');
  if (!tb) return;
  tb.innerHTML = '';
  updateOshNavCounter();
  if (!globalOshDaily || globalOshDaily.length === 0) {
    tb.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:15px;color:#777;font-weight:bold;">لا توجد جولات مسجلة للسلامة والصحة المهنية بعد.</td></tr>';
    return;
  }
  globalOshDaily.forEach((rep, idx) => {
    const fList = rep.findings || [];
    const closedCnt = fList.filter(f => f.status === 'مغلق').length;
    const openCnt = fList.length - closedCnt;
    let badge = fList.length === 0
      ? '<span style="background:#28a745;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold;font-size:11px;">سليم 100%</span>'
      : `<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">${openCnt > 0 ? `<span style="background:#dc3545;color:#fff;padding:3px 8px;border-radius:12px;font-weight:bold;font-size:11px;">${openCnt} مفتوح</span>` : ''}${closedCnt > 0 ? `<span style="background:#28a745;color:#fff;padding:3px 8px;border-radius:12px;font-weight:bold;font-size:11px;">${closedCnt} مغلق</span>` : ''}</div>`;

    tb.innerHTML += `
      <tr>
        <td dir="ltr" style="font-weight:bold;">${rep.date}</td>
        <td dir="ltr">${rep.time || '-'}</td>
        <td>${rep.shift || '-'}</td>
        <td>${rep.scope || '-'}</td>
        <td>${rep.inspector || '-'}</td>
        <td>${badge}</td>
        <td style="white-space:nowrap;">
          <button type="button" onclick="generateOshDailyPrintView(globalOshDaily[${idx}])" style="background:#003366;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;margin-left:3px;"><i class="fa-solid fa-eye"></i> البيان</button>
          <button type="button" onclick="loadOshDailyToForm(${idx})" style="background:#ffc107;color:#000;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;font-weight:bold;margin-left:3px;"><i class="fa-solid fa-pen"></i> تعديل</button>
          <button type="button" onclick="copyOshDailyToToday(${idx})" style="background:#17a2b8;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;margin-left:3px;"><i class="fa-solid fa-copy"></i> نسخ لليوم</button>
          <button type="button" onclick="deleteOshDailyRecord(${idx})" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
}

function updateOshNavCounter() {
  const el = document.getElementById('nav-osh-daily-counter');
  if (el) el.innerText = globalOshDaily.length > 0 ? `${currentOshDailyIndex + 1} / ${globalOshDaily.length}` : '0 / 0';
}

function navOshDaily(dir) {
  if (!globalOshDaily.length) return alert("لا توجد جولات مسجلة.");
  if (dir === 'first') currentOshDailyIndex = 0;
  else if (dir === 'last') currentOshDailyIndex = globalOshDaily.length - 1;
  else if (dir === 'next' && currentOshDailyIndex < globalOshDaily.length - 1) currentOshDailyIndex++;
  else if (dir === 'prev' && currentOshDailyIndex > 0) currentOshDailyIndex--;
  if (currentOshDailyIndex >= 0) loadOshDailyToForm(currentOshDailyIndex);
}

function loadOshDailyToForm(idx) {
  const rep = globalOshDaily[idx];
  if (!rep) return;
  currentOshDailyIndex = idx;
  switchOshDailySubTab('entry');
  document.getElementById('oshDailyDate').value = rep.date || '';
  document.getElementById('oshDailyTime').value = rep.time || '';
  document.getElementById('oshDailyShift').value = rep.shift || 'صباحي';
  document.getElementById('oshDailyScope').value = rep.scope || 'مرور يومي عام على مرافق المطار';
  document.getElementById('oshDailyInspector').value = rep.inspector || '';

  const tb = document.getElementById('osh-findings-entry-tbody');
  tb.innerHTML = '';
  (rep.findings || []).forEach(f => addOshFindingRow(f));
  isOshEditMode = true; currentOshEditId = rep.id;
  updateOshNavCounter();
  const btn = document.getElementById('submitOshDailyBtn');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> حفظ التعديلات وتحديث الجولة'; btn.style.backgroundColor = '#ffc107'; btn.style.color = '#000'; }
}

function clearOshDailyForm() {
  currentOshDailyIndex = -1; isOshEditMode = false; currentOshEditId = null;
  document.getElementById('oshDailyForm').reset();
  document.getElementById('oshDailyDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('oshDailyTime').value = new Date().toTimeString().slice(0, 5);
  document.getElementById('osh-findings-entry-tbody').innerHTML = '';
  updateOshNavCounter();
  const btn = document.getElementById('submitOshDailyBtn');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ جولة السلامة والصحة المهنية'; btn.style.backgroundColor = '#fd7e14'; btn.style.color = '#fff'; }
}

function copyOshDailyToToday(idx) {
  const rep = globalOshDaily[idx];
  if (!rep) return;
  if (!confirm(`هل تريد نسخ المخالفات المفتوحة من جولة (${rep.date}) إلى اليوم؟`)) return;
  clearOshDailyForm();
  switchOshDailySubTab('entry');
  document.getElementById('oshDailyScope').value = rep.scope || '';
  document.getElementById('oshDailyInspector').value = rep.inspector || '';
  let cnt = 0;
  (rep.findings || []).forEach(f => {
    if (f.status !== 'مغلق') { addOshFindingRow(f); cnt++; }
  });
  alert(`✅ تم نسخ (${cnt}) مخالفة مفتوحة إلى جولة اليوم.`);
}

function deleteOshDailyRecord(idx) {
  const rep = globalOshDaily[idx];
  if (!rep || !confirm(`⚠️ حذف جولة (${rep.date}) نهائياً؟`)) return;
  const delId = rep.id;
  globalOshDaily.splice(idx, 1);
  try { localStorage.setItem('rmf_osh_daily', JSON.stringify(globalOshDaily)); } catch (e) {}
  renderSavedOshDaily();
  fetch(window.API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteOSHDaily', performedBy: getOshActorName(), id: delId }) });
}

function generateOshDailyPrintView(specificRep) {
  let rep = specificRep;
  if (!rep) {
    const dt = document.getElementById('oshPrintDate')?.value;
    if (!dt) return alert("اختر التاريخ أولاً!");
    rep = globalOshDaily.find(r => r.date === dt);
    if (!rep) return alert("لا توجد جولة مسجلة لهذا التاريخ!");
  }
  const box = document.getElementById('printable-osh-daily-report');
  if (!box) return;

  const deptStats = {};
  OSH_RESPONSIBLE_DEPTS.slice(0, 6).forEach(d => deptStats[d] = { open: 0, closed: 0 });
  (rep.findings || []).forEach(f => {
    let d = deptStats[f.dept] ? f.dept : 'أخرى';
    if (!deptStats[d]) deptStats[d] = { open: 0, closed: 0 };
    if (f.status === 'مغلق') deptStats[d].closed++; else deptStats[d].open++;
  });

  const fRows = (rep.findings || []).length === 0
    ? '<tr><td colspan="6" style="padding:12px;color:#28a745;font-weight:bold;">سليم 100% ولا توجد ملاحظات عدم مطابقة</td></tr>'
    : rep.findings.map((f, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="text-align:right;font-weight:bold;">${f.desc}</td>
        <td>${f.location}</td>
        <td>${f.category}</td>
        <td><b>${f.dept}</b></td>
        <td style="color:${f.status === 'مغلق' ? '#28a745' : '#dc3545'};font-weight:bold;">${f.status} ${f.action ? '<br><span style="color:#444;font-weight:normal;font-size:9px;">(' + f.action + ')</span>' : ''}</td>
      </tr>
    `).join('');

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:14px;">
      <div style="text-align:right;font-weight:bold;font-size:12px;">مطار مرسى علم الدولي<br>الإدارة العامة للسلامة والمطابقة<br>قسم السلامة والصحة المهنية</div>
      <div style="text-align:center;">
        <h2 style="margin:0;font-size:16px;font-weight:900;text-decoration:underline;">بيان التفتيش والمرور اليومي للسلامة والصحة المهنية</h2>
        <div style="margin-top:4px;font-weight:bold;font-size:11.5px;">التاريخ: ${rep.date} | الوردية: ${rep.shift} | النطاق: ${rep.scope}</div>
      </div>
      <div><img src="LOGO-removebg-preview (1).png" style="height:50px;"></div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:10.5px;text-align:center;margin-bottom:16px;" border="1" cellpadding="5">
      <thead><tr style="background:#f0f4f8;"><th>م</th><th>وصف الخطر / الحالة غير المطابقة</th><th>المكان</th><th>تصنيف الخطر</th><th>الجهة المسئولة</th><th>الحالة والإجراء</th></tr></thead>
      <tbody>${fRows}</tbody>
    </table>

    <div style="height:200px;background:#fafafa;border:1px solid #ddd;padding:10px;border-radius:6px;margin-bottom:14px;">
      <canvas id="oshDailyDeptChart"></canvas>
    </div>

    <div style="display:flex;justify-content:flex-end;padding-left:20px;font-weight:bold;font-size:12px;">
      <div>القائم بالتفتيش (قسم السلامة والصحة المهنية): <span style="color:#003366;">${rep.inspector}</span></div>
    </div>
  `;
  box.style.display = 'block';

  if (oshDailyChart) oshDailyChart.destroy();
  const ctx = document.getElementById('oshDailyDeptChart')?.getContext('2d');
  if (ctx) {
    const labels = Object.keys(deptStats);
    oshDailyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'معلق', data: labels.map(l => deptStats[l].open), backgroundColor: '#dc3545' },
          { label: 'تم', data: labels.map(l => deptStats[l].closed), backgroundColor: '#28a745' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'حالات عدم المطابقة (معلق / تم) طبقاً للإدارة / الجهة' } } }
    });
  }
  box.scrollIntoView({ behavior: 'smooth' });
}

async function exportOshDailyPNG() {
  const el = document.getElementById('printable-osh-daily-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض البيان الرسمي أولاً!");
  const dt = document.getElementById('oshPrintDate')?.value || 'Report';
  const cvs = await window.rmfWithDesktopWidth(el, () => html2canvas(el, { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' }), '840px');
  await window.rmfExportCanvas(cvs, `OSH_Daily_${dt}.png`, `بيان السلامة والصحة المهنية (${dt})`);
}

async function exportOshDailyPDF() {
  const el = document.getElementById('printable-osh-daily-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض البيان الرسمي أولاً!");
  const dt = document.getElementById('oshPrintDate')?.value || 'Report';
  await window.rmfExportElementToPdf(el, `OSH_Daily_${dt}.pdf`, { margin: 0.25, filename: `OSH_Daily_${dt}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4' } }, `بيان السلامة والصحة المهنية (${dt})`);
}

// =============================================================================
// التقرير الشهري للسلامة والصحة المهنية (OSH Monthly Report)
// =============================================================================
function getPrevMonth(ms) {
  let p = ms.split('-'), d = new Date(parseInt(p[0]), parseInt(p[1]) - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function loadOshMonthlyForm() {
  const mStr = document.getElementById('oshMonthlyMonth')?.value || new Date().toISOString().slice(0, 7);
  const pmStr = getPrevMonth(mStr);
  const cur = globalOshMonthly[mStr] || {};
  const prev = globalOshMonthly[pmStr] || {};

  if (cur.preparedBy && document.getElementById('oshMonthlyPreparedBy')) {
    document.getElementById('oshMonthlyPreparedBy').value = cur.preparedBy;
  }

  const cKpi = cur.kpis || { totalFindings: 3, rectifiedFindings: 2, pendingFindings: 1, incidents: 1, workInjuries: 0, meetings: 1 };
  const pKpi = cur.prevKpis || prev.kpis || { totalFindings: 2, rectifiedFindings: 1, pendingFindings: 1, incidents: 1, workInjuries: 0, meetings: 1 };

  const container = document.getElementById('osh-monthly-form-container');
  if (!container) return;

  let kpiRows = OSH_MONTHLY_KPIS.map(k => `
    <tr>
      <td style="text-align:right;font-weight:bold;">${k.label}</td>
      <td><input type="number" id="osh_mk_p_${k.key}" value="${pKpi[k.key] || 0}" oninput="recalcOshMonthlyDiff()" style="width:70px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td>
      <td><input type="number" id="osh_mk_c_${k.key}" value="${cKpi[k.key] || 0}" oninput="recalcOshMonthlyDiff()" style="width:70px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td>
      <td id="osh_mk_d_${k.key}" style="font-weight:bold;">00</td>
    </tr>
  `).join('');

  const pendList = cur.pendingList || [];
  const rectList = cur.rectifiedList || [];

  container.innerHTML = `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">جدول مؤشرات السلامة والصحة المهنية (${pmStr} / ${mStr})</div>
      <div style="width:100%;overflow-x:auto;"><table class="report-table" style="width:100%;min-width:520px;margin:0;"><thead><tr><th>البيان</th><th>الشهر السابق</th><th>الشهر الحالي</th><th>الفرق</th></tr></thead><tbody>${kpiRows}</tbody></table></div>
    </div>

    <div style="border:1.5px solid #dc3545;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#dc3545;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;"><span>حالات عدم المطابقة (المخاطر) المعلقة</span><button type="button" onclick="addOshMonthlyItemRow('osh-m-pend-box')" style="background:#fff;color:#dc3545;border:none;padding:3px 10px;border-radius:4px;font-weight:bold;cursor:pointer;">+ إضافة</button></div>
      <div id="osh-m-pend-box" style="padding:12px;">${pendList.map(x => buildOshMonthlyItemHtml(x)).join('')}</div>
    </div>

    <div style="border:1.5px solid #28a745;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#28a745;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;"><span>حالات عدم المطابقة (المخاطر) التي تم تلافيها</span><button type="button" onclick="addOshMonthlyItemRow('osh-m-rect-box')" style="background:#fff;color:#28a745;border:none;padding:3px 10px;border-radius:4px;font-weight:bold;cursor:pointer;">+ إضافة</button></div>
      <div id="osh-m-rect-box" style="padding:12px;">${rectList.map(x => buildOshMonthlyItemHtml(x)).join('')}</div>
    </div>

    <div style="border:1.5px solid #003366;border-radius:8px;padding:15px;background:#fff;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
      <div class="form-group"><label>الحوادث:</label><input type="text" id="oshMIncidentsMain" value="${cur.accidentsText || 'لا يوجد'}"></div>
      <div class="form-group"><label>إصابات العمل:</label><input type="text" id="oshMWorkInjuriesText" value="${cur.injuriesText || 'لا يوجد'}"></div>
      <div class="form-group" style="grid-column:1 / -1;"><label>تفاصيل الوقائع المسجلة خلال الشهر:</label><textarea id="oshMOccurrencesText" class="inc-textarea" style="height:65px;">${cur.occurrencesText || ''}</textarea></div>
      <div class="form-group" style="grid-column:1 / -1;"><label>الاجتماعات (لجنة السلامة والصحة المهنية):</label><input type="text" id="oshMMeetingsText" value="${cur.meetingsText || ''}" placeholder="مثال: لجنة السلامة والصحة المهنية بتاريخ ..."></div>
      <div class="form-group" style="grid-column:1 / -1;"><label>نتائج الفحص والمرور الدوري (طفايات الحريق / محطات الكهرباء):</label><textarea id="oshMPeriodicText" class="inc-textarea" style="height:65px;">${cur.periodicText || 'أ- الفحص الشهري الخاص بطفايات الحريق بالمطار.'}</textarea></div>
    </div>
  `;
  recalcOshMonthlyDiff();
}

function buildOshMonthlyItemHtml(obj) {
  const item = typeof obj === 'string' ? { text: obj, dept: 'الهندسة المدنية' } : (obj || { text: '', dept: 'الهندسة المدنية' });
  const opts = OSH_RESPONSIBLE_DEPTS.map(d => `<option value="${d}" ${d === item.dept ? 'selected' : ''}>${d}</option>`).join('');
  return `<div class="osh-m-item-row" style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;"><input type="text" class="osh-m-txt" value="${(item.text || '').replace(/"/g, '&quot;')}" placeholder="وصف الحالة والموقع..." style="flex:2;min-width:220px;padding:6px;border:1px solid #ccc;border-radius:4px;"><select class="osh-m-dpt" style="flex:1;min-width:140px;padding:6px;border:1px solid #ccc;border-radius:4px;">${opts}</select><button type="button" onclick="this.closest('.osh-m-item-row').remove()" style="background:#dc3545;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></div>`;
}
function addOshMonthlyItemRow(boxId) { document.getElementById(boxId)?.insertAdjacentHTML('beforeend', buildOshMonthlyItemHtml({ text: '', dept: 'الهندسة المدنية' })); }

function formatOshTrendBadge(cur, prev, higherBetter) {
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

function recalcOshMonthlyDiff() {
  // Enforce logical total: totalFindings = rectifiedFindings + pendingFindings
  const pRect = Number(document.getElementById('osh_mk_p_rectifiedFindings')?.value || 0);
  const pPend = Number(document.getElementById('osh_mk_p_pendingFindings')?.value || 0);
  const cRect = Number(document.getElementById('osh_mk_c_rectifiedFindings')?.value || 0);
  const cPend = Number(document.getElementById('osh_mk_c_pendingFindings')?.value || 0);
  if (document.getElementById('osh_mk_p_totalFindings')) document.getElementById('osh_mk_p_totalFindings').value = pRect + pPend;
  if (document.getElementById('osh_mk_c_totalFindings')) document.getElementById('osh_mk_c_totalFindings').value = cRect + cPend;

  OSH_MONTHLY_KPIS.forEach(k => {
    const p = Number(document.getElementById(`osh_mk_p_${k.key}`)?.value || 0);
    const c = Number(document.getElementById(`osh_mk_c_${k.key}`)?.value || 0);
    const dEl = document.getElementById(`osh_mk_d_${k.key}`);
    if (dEl) {
      dEl.innerHTML = formatOshTrendBadge(c, p, k.higherBetter);
    }
  });
}

function autoPopulateOshMonthly() {
  const mStr = document.getElementById('oshMonthlyMonth')?.value;
  if (!mStr) return alert("اختر الشهر أولاً!");
  const reps = globalOshDaily.filter(r => r.date && r.date.startsWith(mStr));
  if (!reps.length) return alert(`لا توجد جولات يومية مسجلة لـ OSH خلال شهر (${mStr})!`);

  let pend = [], rect = [];
  reps.forEach(r => {
    (r.findings || []).forEach(f => {
      const txt = `${f.category}: ${f.desc} (${f.location})`;
      if (f.status === 'مغلق') rect.push({ text: txt, dept: f.dept });
      else pend.push({ text: txt, dept: f.dept });
    });
  });

  document.getElementById('osh_mk_c_totalFindings').value = pend.length + rect.length;
  document.getElementById('osh_mk_c_rectifiedFindings').value = rect.length;
  document.getElementById('osh_mk_c_pendingFindings').value = pend.length;
  document.getElementById('osh-m-pend-box').innerHTML = pend.map(x => buildOshMonthlyItemHtml(x)).join('');
  document.getElementById('osh-m-rect-box').innerHTML = rect.map(x => buildOshMonthlyItemHtml(x)).join('');
  recalcOshMonthlyDiff();
  alert(`✅ تم تجميع (${pend.length + rect.length}) حالة من (${reps.length}) جولة يومية!`);
}

function saveOshMonthlyReport() {
  const mStr = document.getElementById('oshMonthlyMonth')?.value;
  if (!mStr) return alert("اختر الشهر!");
  let kpis = {}, prevKpis = {};
  OSH_MONTHLY_KPIS.forEach(k => {
    prevKpis[k.key] = Number(document.getElementById(`osh_mk_p_${k.key}`)?.value || 0);
    kpis[k.key] = Number(document.getElementById(`osh_mk_c_${k.key}`)?.value || 0);
  });
  let pendingList = [], rectifiedList = [];
  document.querySelectorAll('#osh-m-pend-box .osh-m-item-row').forEach(r => { let t = r.querySelector('.osh-m-txt')?.value?.trim(); if (t) pendingList.push({ text: t, dept: r.querySelector('.osh-m-dpt')?.value }); });
  document.querySelectorAll('#osh-m-rect-box .osh-m-item-row').forEach(r => { let t = r.querySelector('.osh-m-txt')?.value?.trim(); if (t) rectifiedList.push({ text: t, dept: r.querySelector('.osh-m-dpt')?.value }); });

  const obj = {
    month: mStr,
    preparedBy: document.getElementById('oshMonthlyPreparedBy')?.value?.trim() || 'مسئول السلامة والصحة المهنية',
    kpis: kpis, prevKpis: prevKpis, pendingList: pendingList, rectifiedList: rectifiedList,
    accidentsText: document.getElementById('oshMIncidentsMain')?.value || 'لا يوجد',
    injuriesText: document.getElementById('oshMWorkInjuriesText')?.value || 'لا يوجد',
    occurrencesText: document.getElementById('oshMOccurrencesText')?.value || '',
    meetingsText: document.getElementById('oshMMeetingsText')?.value || '',
    periodicText: document.getElementById('oshMPeriodicText')?.value || ''
  };

  globalOshMonthly[mStr] = obj;
  try { localStorage.setItem('rmf_osh_monthly', JSON.stringify(globalOshMonthly)); } catch (e) {}

  fetch(window.API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveOSHMonthly', performedBy: getOshActorName(), monthlyData: obj }) }).finally(() => {
    alert("✅ تم حفظ بيانات التقرير الشهري للسلامة والصحة المهنية بنجاح!");
    document.getElementById('oshExtractMonth').value = mStr;
    switchOshMonthlySubTab('extract');
    generateOshMonthlyPreview();
  });
}

function generateOshMonthlyPreview() {
  const mStr = document.getElementById('oshExtractMonth')?.value;
  const rep = globalOshMonthly[mStr];
  if (!rep) return alert("لا توجد بيانات محفوظة لهذا الشهر! يرجى حفظ البيانات أولاً.");

  const pmStr = getPrevMonth(mStr);
  const mAr = new Date(mStr + '-01').toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
  const pmAr = new Date(pmStr + '-01').toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

  const kpiRows = OSH_MONTHLY_KPIS.map(k => {
    let p = Number(rep.prevKpis?.[k.key] || 0), c = Number(rep.kpis?.[k.key] || 0);
    if (k.key === 'totalFindings') {
      p = Number(rep.prevKpis?.rectifiedFindings || 0) + Number(rep.prevKpis?.pendingFindings || 0);
      c = Number(rep.kpis?.rectifiedFindings || 0) + Number(rep.kpis?.pendingFindings || 0);
    }
    let badge = formatOshTrendBadge(c, p, k.higherBetter);
    return `<tr><td style="border:1px solid #888;padding:7px;text-align:right;font-weight:bold;">${k.label}</td><td style="border:1px solid #888;padding:7px;">${String(p).padStart(2, '0')}</td><td style="border:1px solid #888;padding:7px;font-weight:bold;">${String(c).padStart(2, '0')}</td><td style="border:1px solid #888;padding:7px;font-weight:bold;">${badge}</td></tr>`;
  }).join('');

  const deptMap = { "الهندسة المدنية": { open: 0, closed: 0 }, "الهندسة الميكانيكية": { open: 0, closed: 0 }, "الهندسة الكهربائية": { open: 0, closed: 0 }, "إدارة الاتصالات": { open: 0, closed: 0 }, "شركات خارجية": { open: 0, closed: 0 } };
  (rep.pendingList || []).forEach(x => { if (!deptMap[x.dept]) deptMap[x.dept] = { open: 0, closed: 0 }; deptMap[x.dept].open++; });
  (rep.rectifiedList || []).forEach(x => { if (!deptMap[x.dept]) deptMap[x.dept] = { open: 0, closed: 0 }; deptMap[x.dept].closed++; });

  const prevEl = document.getElementById('printable-osh-monthly-report');
  prevEl.innerHTML = `
    <div style="max-width:850px;margin:0 auto;padding:28px 24px;background:#fff;border:1.5px solid #cbd5e1;border-radius:8px;font-family:'Cairo',sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #fd7e14;padding-bottom:12px;margin-bottom:18px;">
        <div style="text-align:right;"><h2 style="color:#003366;margin:0;font-size:16px;">مطار مرسى علم الدولي</h2><h3 style="color:#003366;margin:3px 0 0 0;font-size:14px;">الإدارة العامة للسلامة والمطابقة</h3><h4 style="color:#fd7e14;margin:3px 0 0 0;font-size:13px;">قسم السلامة والصحة المهنية</h4></div>
        <div><img src="LOGO-removebg-preview (1).png" style="height:60px;"></div>
      </div>
      <div style="text-align:center;background:#fff8f1;border:1.5px solid #fd7e14;padding:10px;border-radius:8px;margin-bottom:16px;"><h2 style="margin:0;color:#003366;font-size:17px;">التقرير الشهري لقسم السلامة والصحة المهنية - ${mAr}</h2></div>
      <table style="width:100%;border-collapse:collapse;font-size:11.5px;text-align:center;margin-bottom:16px;"><thead><tr style="background:#003366;color:#fff;"><th style="padding:8px;text-align:right;">البيان</th><th>${pmAr}</th><th>${mAr}</th><th>الفرق</th></tr></thead><tbody>${kpiRows}</tbody></table>
      <div style="height:210px;background:#fafafa;border:1px solid #ddd;padding:10px;border-radius:6px;margin-bottom:16px;"><canvas id="oshMonthlyDeptChart"></canvas></div>
      <div style="background:#dc3545;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;margin-bottom:6px;">حالات عدم المطابقة (المخاطر) المعلقة:</div>
      <ol style="margin:0 0 14px 0;padding-right:22px;line-height:1.7;">${(rep.pendingList || []).length ? rep.pendingList.map(x => `<li><b>${x.text}</b> <span style="color:#003366;">(${x.dept})</span></li>`).join('') : '<li>لا يوجد</li>'}</ol>
      <div style="background:#28a745;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;margin-bottom:6px;">حالات عدم المطابقة (المخاطر) التي تم تلافيها:</div>
      <ol style="margin:0 0 14px 0;padding-right:22px;line-height:1.7;">${(rep.rectifiedList || []).length ? rep.rectifiedList.map(x => `<li><b>${x.text}</b> <span style="color:#003366;">(${x.dept})</span></li>`).join('') : '<li>لا يوجد</li>'}</ol>
      <div style="border:1px solid #ccc;border-radius:6px;padding:12px;background:#f9fbfd;line-height:1.8;font-size:12px;">
        <div><b>الحوادث:</b> ${rep.accidentsText || 'لا يوجد'}</div>
        <div><b>الوقائع:</b> ${rep.occurrencesText || 'لا يوجد'}</div>
        <div><b>الاجتماعات:</b> ${rep.meetingsText || '-'}</div>
        <div><b>نتائج الفحص والمرور الدوري:</b><br>${(rep.periodicText || '').replace(/\n/g, '<br>')}</div>
        <div><b>إصابات العمل:</b> ${rep.injuriesText || 'لا يوجد'}</div>
      </div>
      <div style="margin-top:25px;text-align:left;padding-left:20px;font-weight:bold;"><div>إعداد: ${rep.preparedBy}</div><div style="color:#003366;">مسئول السلامة والصحة المهنية</div></div>
    </div>
  `;
  prevEl.style.display = 'block';

  if (oshMonthlyChart) oshMonthlyChart.destroy();
  const ctx = document.getElementById('oshMonthlyDeptChart')?.getContext('2d');
  if (ctx) {
    const labels = Object.keys(deptMap);
    oshMonthlyChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: [{ label: 'معلق', data: labels.map(l => deptMap[l].open), backgroundColor: '#dc3545' }, { label: 'تم', data: labels.map(l => deptMap[l].closed), backgroundColor: '#28a745' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'حالات عدم المطابقة ما تم وما هو معلق طبقاً للإدارة / الجهة' } } }
    });
  }
}

async function exportOshMonthlyPNG() {
  const el = document.getElementById('printable-osh-monthly-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض التقرير أولاً!");
  const m = document.getElementById('oshExtractMonth')?.value || 'Report';
  const cvs = await window.rmfWithDesktopWidth(el, () => html2canvas(el, { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' }), '840px');
  await window.rmfExportCanvas(cvs, `OSH_Monthly_${m}.png`, `التقرير الشهري للسلامة والصحة المهنية (${m})`);
}
async function exportOshMonthlyPDF() {
  const el = document.getElementById('printable-osh-monthly-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض التقرير أولاً!");
  const m = document.getElementById('oshExtractMonth')?.value || 'Report';
  await window.rmfExportElementToPdf(el, `OSH_Monthly_${m}.pdf`, { margin: 0.25, filename: `OSH_Monthly_${m}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4' } }, `التقرير الشهري للسلامة والصحة المهنية (${m})`);
}
async function sendOshMonthlyEmail() {
  const mStr = document.getElementById('oshExtractMonth')?.value;
  const el = document.getElementById('printable-osh-monthly-report');
  if (!el || el.style.display === 'none') return alert("اضغط على عرض التقرير أولاً!");
  const cvs = await html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = cvs.toDataURL('image/jpeg', 0.85);
  await fetch(window.API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'sendReportEmail', subject: `التقرير الشهري لقسم السلامة والصحة المهنية - ${mStr}`, htmlBody: `<div dir="rtl"><h2>التقرير الشهري لقسم السلامة والصحة المهنية - ${mStr}</h2><img src="cid:monthlyReportImage" style="max-width:100%;"></div>`, imageData: imgData, imageName: `OSH_Report_${mStr}.jpg` }) });
  alert("✅ تم إرسال التقرير بالإيميل بنجاح!");
}
