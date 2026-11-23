/**
 * General Department of Safety and Compliance - Marsa Alam Airport
 * Consolidated General Department Monthly Report (general-report.js)
 */

const API_URL = "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

const DEFAULT_GR_RECOMMENDATIONS = [
  "استكمال تأمين اللوحات الكهربائية بالمحطات الفرعية بنظام Fire Search واستبدال نظام الماتيك بنظام إطفاء تلقائي CO2.",
  "ضرورة تأمين ساحة انتظار الأتوبيسات والسيارات بالوسائل الإطفائية المناسبة.",
  "استكمال تأمين غرفة سيرفرات إنارة الممرات بالدور الرابع بمبنى برج المراقبة الجوية بالوسائل الإطفائية المناسبة.",
  "توفير مكان واحد مخزن طوارئ لتجميع كل معدات الطوارئ لسهولة المناولة أثناء حالات الطوارئ (تم إدراجه في مشروع الصالات الجديدة).",
  "ضرورة سمكرة ودهان جسم سيارة الإطفاء رقم (4 - 5) لعدم انتشار الصدأ في باقي أجزاء السيارة.",
  "استكمال أعمال الصيانة الخاصة بملء الفواصل المطاطية للبلاطات الخرسانية بساحة وقوف الطائرات (جاري)."
];

const CRITERIA_LIST_GR = [
  "Communication Tower", "Communication Ground", "VOR-DME", "RNP APR 33_15",
  "Aeronautical Beacon", "Approach Lighting System", "PAPI System", "Wind Cone",
  "Apron Marking", "Apron Lighting", "Apron Signs", "APRON Stands Size",
  "G.H Performance", "Fuelling Performance", "Marshall Services", "RFF Team performance",
  "Runway Marking", "Runway Lighting", "Runway Signs", "RWY Brakes Action",
  "RWY Evaluating Pavement", "Taxi Way Marking", "Taxi Way Lighting", "Taxi Way Signs",
  "TWY Brakes Action", "TWY Evaluating Pavement", "Stop Bars", "Weather",
  "Wildlife", "Bird Strike", "FOD"
];

const FOD_LOCATIONS_GR = [
  { loc: "Aircraft Stands Area", area: "53.125 M²" },
  { loc: "GSE Area", area: "4152 M²" },
  { loc: "Arrival & Departures Gates", area: "2420 M²" },
  { loc: "Around Aprons Gas station", area: "2539 M²" }
];

let grAppData = {
  surveys: [],
  daily: [],
  incidents: [],
  fod: [],
  movements: [],
  cdDaily: [],
  cdMonthly: {},
  oshDaily: [],
  oshMonthly: {},
  envDaily: [],
  envMonthly: {}
};

let grChartInstances = [];
let grLiveFetchPromise = null;

document.addEventListener('DOMContentLoaded', () => {
  const curMonth = new Date().toISOString().slice(0, 7);
  if (document.getElementById('grMonth')) document.getElementById('grMonth').value = curMonth;

  const recBox = document.getElementById('gr-recommendations-box');
  if (recBox) {
    recBox.innerHTML = DEFAULT_GR_RECOMMENDATIONS.map(r => buildGrRecRow(r)).join('');
  }

  loadLocalCachesForGr();
  fetchLiveAllDataForGr();
});

function buildGrRecRow(txt) {
  return `
    <div class="gr-rec-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
      <input type="text" class="gr-rec-inp" value="${(txt || '').replace(/"/g, '&quot;')}" placeholder="اكتب التوصية..." style="flex:1;padding:7px 10px;border:1px solid #ccc;border-radius:5px;font-weight:bold;">
      <button type="button" onclick="this.closest('.gr-rec-row').remove()" style="background:#dc3545;color:#fff;border:none;padding:7px 10px;border-radius:5px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;
}

function addGrRecommendationRow() {
  document.getElementById('gr-recommendations-box')?.insertAdjacentHTML('beforeend', buildGrRecRow(''));
}

function normalizeYearMonth(val) {
  if (!val) return '';
  let s = String(val).trim();
  if (s.includes('T')) s = s.split('T')[0];
  // YYYY-MM-DD or YYYY/MM/DD
  let m1 = s.match(/^(\d{4})[-\/](\d{1,2})/);
  if (m1) return `${m1[1]}-${String(m1[2]).padStart(2, '0')}`;
  // DD/MM/YYYY or DD-MM-YYYY
  let m2 = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m2) return `${m2[3]}-${String(m2[2]).padStart(2, '0')}`;
  let dt = new Date(val);
  if (!isNaN(dt.getTime())) {
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  }
  return '';
}

function normalizeDateStr(val) {
  if (!val) return '';
  let s = String(val).trim();
  if (s.includes('T')) return s.split('T')[0];
  let m1 = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m1) return `${m1[1]}-${String(m1[2]).padStart(2, '0')}-${String(m1[3]).padStart(2, '0')}`;
  let m2 = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m2) return `${m2[3]}-${String(m2[2]).padStart(2, '0')}-${String(m2[1]).padStart(2, '0')}`;
  return s;
}

function formatGrTrendBadge(curVal, prevVal, higherBetter, unit = "", pad2 = true) {
  let c = parseFloat(curVal);
  let p = parseFloat(prevVal);
  if (isNaN(c)) c = 0;
  if (isNaN(p)) p = 0;
  let diff = c - p;
  let isFloat = unit.toLowerCase().includes("kg") || unit.includes("كجم");

  if (Math.abs(diff) < 0.0001) {
    let zeroTxt = isFloat ? `0.000 ${unit}`.trim() : (pad2 ? `00 ${unit}`.trim() : `0 ${unit}`.trim());
    return `<span style="color:#0d6efd;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">${zeroTxt} <i class="fa-solid fa-arrow-right"></i></span>`;
  }

  let isPositive = diff > 0;
  let isGood = higherBetter ? isPositive : !isPositive;
  let clr = isGood ? "#28a745" : "#dc3545";
  let ico = isGood ? "fa-arrow-up" : "fa-arrow-down";
  let absFormatted = isFloat
    ? Math.abs(diff).toFixed(3)
    : (pad2 ? String(Math.abs(Math.round(diff))).padStart(2, '0') : Math.abs(Math.round(diff)).toLocaleString());

  return `<span style="color:${clr};font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">${absFormatted} ${unit} <i class="fa-solid ${ico}"></i></span>`;
}

function loadLocalCachesForGr() {
  try {
    grAppData.surveys = JSON.parse(localStorage.getItem('rmf_surveys') || '[]');
    grAppData.daily = JSON.parse(localStorage.getItem('rmf_daily_inspections') || '[]');
    grAppData.incidents = JSON.parse(localStorage.getItem('rmf_incidents') || '[]');
    grAppData.fod = JSON.parse(localStorage.getItem('rmf_fod') || '[]');
    grAppData.movements = JSON.parse(localStorage.getItem('rmf_movements') || '[]');
    grAppData.cdDaily = JSON.parse(localStorage.getItem('rmf_cd_daily') || '[]');
    grAppData.cdMonthly = JSON.parse(localStorage.getItem('rmf_cd_monthly') || '{}');
    grAppData.oshDaily = JSON.parse(localStorage.getItem('rmf_osh_daily') || '[]');
    grAppData.oshMonthly = JSON.parse(localStorage.getItem('rmf_osh_monthly') || '{}');
    grAppData.envDaily = JSON.parse(localStorage.getItem('rmf_env_daily') || '[]');
    grAppData.envMonthly = JSON.parse(localStorage.getItem('rmf_env_monthly') || '{}');
  } catch (e) {}
}

function fetchLiveAllDataForGr() {
  if (grLiveFetchPromise) return grLiveFetchPromise;
  grLiveFetchPromise = new Promise(resolve => {
    const cb = 'jsonpGr_' + Math.round(100000 * Math.random());
    const timer = setTimeout(() => { delete window[cb]; grLiveFetchPromise = null; resolve(false); }, 9000);
    window[cb] = function (d) {
      clearTimeout(timer);
      try {
        if (d && d.status === 'success') {
          if (Array.isArray(d.surveys)) { grAppData.surveys = d.surveys; try { localStorage.setItem('rmf_surveys', JSON.stringify(d.surveys)); } catch (e) {} }
          if (Array.isArray(d.incidents)) { grAppData.incidents = d.incidents; try { localStorage.setItem('rmf_incidents', JSON.stringify(d.incidents)); } catch (e) {} }
          if (Array.isArray(d.fod)) { grAppData.fod = d.fod; try { localStorage.setItem('rmf_fod', JSON.stringify(d.fod)); } catch (e) {} }
          if (Array.isArray(d.movements)) { grAppData.movements = d.movements; try { localStorage.setItem('rmf_movements', JSON.stringify(d.movements)); } catch (e) {} }
          if (Array.isArray(d.daily)) {
            let rMap = {};
            d.daily.forEach(row => {
              let repId = row.Report_ID;
              if (!rMap[repId]) {
                rMap[repId] = {
                  id: repId,
                  date: normalizeDateStr(row.Date),
                  shift: row.Shift,
                  findings: []
                };
              }
              if (row.Category && row.Category !== "لا توجد ملاحظات") {
                let rawSt = String(row.Status || '').trim();
                let isCl = rawSt === 'مغلق' || rawSt.toLowerCase() === 'closed' || String(row.Corrective_Action || '').includes('تم تلافي');
                rMap[repId].findings.push({
                  category: row.Category,
                  item: row.Finding_Item,
                  location: row.Location,
                  responsible: row.Responsible,
                  note: row.Corrective_Action || '',
                  status: isCl ? 'مغلق' : 'مفتوح'
                });
              }
            });
            grAppData.daily = Object.values(rMap);
            try { localStorage.setItem('rmf_daily_inspections', JSON.stringify(grAppData.daily)); } catch (e) {}
          }
          if (Array.isArray(d.cdDaily) && d.cdDaily.length > 0) grAppData.cdDaily = d.cdDaily;
          if (d.cdMonthly && typeof d.cdMonthly === 'object' && Object.keys(d.cdMonthly).length > 0) grAppData.cdMonthly = d.cdMonthly;
          if (Array.isArray(d.oshDaily) && d.oshDaily.length > 0) grAppData.oshDaily = d.oshDaily;
          if (d.oshMonthly && typeof d.oshMonthly === 'object' && Object.keys(d.oshMonthly).length > 0) grAppData.oshMonthly = d.oshMonthly;
          if (Array.isArray(d.envDaily) && d.envDaily.length > 0) grAppData.envDaily = d.envDaily;
          if (d.envMonthly && typeof d.envMonthly === 'object' && Object.keys(d.envMonthly).length > 0) grAppData.envMonthly = d.envMonthly;
        }
      } catch (err) {} finally {
        delete window[cb];
        grLiveFetchPromise = null;
        resolve(true);
      }
    };
    const s = document.createElement('script');
    s.src = API_URL + '?action=getAppData&_t=' + Date.now() + '&callback=' + cb;
    s.onerror = () => { clearTimeout(timer); delete window[cb]; grLiveFetchPromise = null; resolve(false); };
    document.body.appendChild(s);
  });
  return grLiveFetchPromise;
}

function getPrevMonthStr(ms) {
  let p = ms.split('-'), d = new Date(parseInt(p[0]), parseInt(p[1]) - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function fetchSpiForYearGr(year) {
  try {
    let res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getSPIData', year: String(year) })
    });
    let j = await res.json();
    if (j.status === 'success' && j.data) return j.data;
  } catch (e) {}
  return { movements: {}, events: {} };
}

function pageHeaderBanner(pageNum) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #003366;padding-bottom:8px;margin-bottom:14px;">
      <div style="text-align:right;font-size:11px;font-weight:bold;color:#003366;">
        إيماك مرسى علم<br>لإدارة وتشغيل المطارات (ش.م.م)<br>مطار مرسى علم الدولي
      </div>
      <div><img src="LOGO-removebg-preview (1).png" style="height:52px;"></div>
      <div style="text-align:left;direction:ltr;font-size:10px;font-weight:bold;color:#003366;">
        EMAK Marsa Alam<br>For Management and Operation Airports (S.A.E)<br><span style="color:#777;">Page ${pageNum}</span>
      </div>
    </div>
  `;
}

function pageFooterBanner() {
  return `
    <div style="border-top:1.5px solid #003366;padding-top:6px;margin-top:16px;display:flex;justify-content:space-between;font-size:9.5px;color:#555;">
      <div>الكيلو (65) جنوب مدينة القصير - طريق مرسى علم | تليفون: 065/3700020-29</div>
      <div style="direction:ltr;">65 km Southern El-Quseir City - Marsa Alam Highway</div>
    </div>
  `;
}

// Helper: build OSH monthly object from daily inspections if monthly wasn't manually saved
function resolveOshMonthly(monthKey) {
  if (grAppData.oshMonthly && grAppData.oshMonthly[monthKey]) {
    let m = JSON.parse(JSON.stringify(grAppData.oshMonthly[monthKey]));
    let r = Number(m.kpis?.rectifiedFindings || 0);
    let p = Number(m.kpis?.pendingFindings || 0);
    m.kpis.totalFindings = r + p;
    return m;
  }
  let reps = (grAppData.oshDaily || []).filter(r => normalizeYearMonth(r.date) === monthKey);
  let pend = [], rect = [];
  reps.forEach(r => {
    (r.findings || []).forEach(f => {
      let txt = `${f.category}: ${f.desc} (${f.location})`;
      if (f.status === 'مغلق') rect.push({ text: txt, dept: f.dept });
      else pend.push({ text: txt, dept: f.dept });
    });
  });
  return {
    kpis: {
      totalFindings: pend.length + rect.length,
      rectifiedFindings: rect.length,
      pendingFindings: pend.length,
      incidents: 0,
      workInjuries: 0,
      meetings: 0
    },
    prevKpis: {},
    pendingList: pend,
    rectifiedList: rect,
    accidentsText: 'لا يوجد',
    occurrencesText: 'لا يوجد',
    meetingsText: '-',
    periodicText: '-',
    injuriesText: 'لا يوجد'
  };
}

// Helper: build Civil Defense monthly object from daily inspections if monthly wasn't manually saved
function resolveCdMonthly(monthKey) {
  if (grAppData.cdMonthly && grAppData.cdMonthly[monthKey]) {
    return JSON.parse(JSON.stringify(grAppData.cdMonthly[monthKey]));
  }
  let reps = (grAppData.cdDaily || []).filter(r => normalizeYearMonth(r.date) === monthKey);
  let pendObs = [], rectObs = [], recObs = [];
  let truckDef = 0, equipDef = 0, commDef = 0, bldgDef = 0;
  reps.forEach(rep => {
    (rep.trucks || []).forEach(t => { if (t.status !== 'صالح' || (t.note && t.note.trim())) { truckDef++; recObs.push({ text: `سيارة (${t.id}): ${t.note || t.status}`, date: rep.date }); } });
    (rep.rooms || []).forEach(r => { if (r.hazard !== 'لا يوجد' || (r.note && r.note.trim())) { bldgDef++; if (r.status === 'مغلق') rectObs.push({ text: `${r.room}: ${r.note}`, obsDate: rep.date, rectDate: r.rectDate || rep.date }); else pendObs.push({ text: `${r.room}: ${r.note}`, dept: r.responsible || 'الهندسة المدنية' }); } });
    (rep.comm || []).forEach(c => { if (c.condition !== 'صالح' || (c.note && c.note.trim())) { commDef++; if (c.status === 'مغلق') rectObs.push({ text: `${c.item}: ${c.note}`, obsDate: rep.date, rectDate: c.rectDate || rep.date }); else pendObs.push({ text: `${c.item}: ${c.note}`, dept: c.responsible || 'تكنولوجيا المعلومات' }); } });
    (rep.equip || []).forEach(eq => { if (eq.condition !== 'صالح' || (eq.note && eq.note.trim())) { equipDef++; if (eq.status === 'مغلق') rectObs.push({ text: `${eq.name}: ${eq.note}`, obsDate: rep.date, rectDate: eq.rectDate || rep.date }); else pendObs.push({ text: `${eq.name}: ${eq.note}`, dept: eq.responsible || 'الهندسة الميكانيكية' }); } });
    (rep.pendingNotes || []).forEach(pn => { if (pn.status === 'مغلق') rectObs.push({ text: pn.note, obsDate: pn.obsDate || rep.date, rectDate: pn.rectDate || rep.date }); else pendObs.push({ text: pn.note, dept: pn.dept || 'الإدارة الهندسية' }); });
  });
  return {
    kpis: {
      drills: 0,
      truckDefects: truckDef,
      equipDefects: equipDef,
      ppeDefects: 0,
      commDefects: commDef,
      bldgDefects: bldgDef,
      pendingTotal: pendObs.length,
      rectifiedTotal: rectObs.length,
      stockStatus: 'مطابق'
    },
    prevKpis: {},
    trainings: [],
    recordedObs: recObs,
    rectifiedObs: rectObs,
    pendingObs: pendObs
  };
}

// Helper: build ENV monthly object from daily inspections if monthly wasn't manually saved
function resolveEnvMonthly(monthKey) {
  if (grAppData.envMonthly && grAppData.envMonthly[monthKey]) {
    let m = JSON.parse(JSON.stringify(grAppData.envMonthly[monthKey]));
    let p = Number(m.kpis?.pendingEnv || 0);
    let r = Number(m.kpis?.rectifiedEnv || 0);
    m.kpis.totalEnv = p + r;
    return m;
  }
  let reps = (grAppData.envDaily || []).filter(r => normalizeYearMonth(r.date) === monthKey);
  let obs = [], doneCnt = 0, pendCnt = 0;
  reps.forEach(r => {
    (r.findings || []).forEach(f => {
      let isDone = (f.status === 'تم' || f.status === 'مغلق');
      if (isDone) doneCnt++; else pendCnt++;
      obs.push({
        desc: f.desc, location: f.location, category: f.category, dept: f.dept, date: r.date,
        action: `${f.paCode ? '[' + f.paCode + '] ' : ''}${f.action}`,
        status: isDone ? 'تم' : 'معلق'
      });
    });
  });
  return {
    kpis: {
      pendingEnv: pendCnt,
      rectifiedEnv: doneCnt,
      totalEnv: pendCnt + doneCnt,
      meetingsEnv: 0
    },
    prevKpis: {},
    observations: obs,
    accidentsText: 'لا يوجد',
    fenceText: 'تم المرور الدوري وتنظيف الأسوار وسد الفتحات.',
    externalText: 'تم المرور الشهري على مناطق الجذب الخارجية.',
    pestEval: '78.0%'
  };
}

async function generateConsolidatedMonthlyReport() {
  const mStr = document.getElementById('grMonth')?.value;
  if (!mStr) return alert("اختر شهر التقرير أولاً!");

  const btn = document.getElementById('genGrBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تجميع ومراجعة بيانات الإدارات الأربع...'; }

  // Ensure latest data from server is loaded
  await fetchLiveAllDataForGr();

  const pmStr = getPrevMonthStr(mStr);
  const yCur = mStr.split('-')[0], mCurInt = parseInt(mStr.split('-')[1]);
  const yPrev = pmStr.split('-')[0], mPrevInt = parseInt(pmStr.split('-')[1]);

  const spiCur = await fetchSpiForYearGr(yCur);
  const spiPrev = (yPrev === yCur) ? spiCur : await fetchSpiForYearGr(yPrev);

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-layer-group"></i> تجميع وإصدار التقرير الشهري المجمع'; }

  const mgrName = document.getElementById('grManagerName')?.value?.trim() || 'محمد محمد مرسي';
  const mAr = new Date(yCur, mCurInt - 1, 15).toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
  const pmAr = new Date(parseInt(yPrev), mPrevInt - 1, 15).toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
  const mOnlyAr = new Date(yCur, mCurInt - 1, 15).toLocaleString('ar-EG', { month: 'long' });
  const mEngShort = new Date(yCur, mCurInt - 1, 15).toLocaleString('en-US', { month: 'long' });

  // 1. بيانات قسم سلامة الطيران (مع التحقق المنطقي من كل مصادر البيانات)
  const lookupMovements = (ymKey, spiObj, yr, mIdx) => {
    let val = Number(spiObj?.movements?.[mIdx] || 0);
    if (!val && Array.isArray(grAppData.movements)) {
      let mRow = grAppData.movements.find(r => normalizeYearMonth(r.YearMonth) === ymKey);
      if (mRow) val = Number(mRow.Movements || 0);
    }
    if (!val && String(yr) === '2026') {
      const base2026 = { 1: 1333, 2: 1314, 3: 1620, 4: 1509, 5: 1534, 6: 1415, 7: 1571, 8: 1689, 9: 1662, 10: 1804 };
      val = base2026[mIdx] || 0;
    }
    return val;
  };

  const movCur = lookupMovements(mStr, spiCur, yCur, mCurInt);
  const movPrev = lookupMovements(pmStr, spiPrev, yPrev, mPrevInt);

  const incCurList = (grAppData.incidents || []).filter(i => normalizeYearMonth(i.Date || i.date) === mStr);
  const incPrevList = (grAppData.incidents || []).filter(i => normalizeYearMonth(i.Date || i.date) === pmStr);
  const accCur = incCurList.filter(i => String(i.Risk_Severity || '').trim() === 'Catastrophic').length;
  const accPrev = incPrevList.filter(i => String(i.Risk_Severity || '').trim() === 'Catastrophic').length;
  const occCur = incCurList.length - accCur;
  const occPrev = incPrevList.length - accPrev;

  const getAirsideFindings = (monthKey) => {
    let map = {};
    (grAppData.daily || []).forEach(r => {
      if (normalizeYearMonth(r.date) === monthKey) {
        (r.findings || []).forEach(f => {
          let k = `${(f.category || '').trim()}|${(f.item || '').trim()}|${(f.location || '').trim()}`.toLowerCase();
          let isCl = f.status === 'مغلق';
          if (!map[k]) map[k] = { ...f, closed: isCl };
          else if (isCl) map[k].closed = true;
        });
      }
    });
    let list = Object.values(map);
    let closed = list.filter(x => x.closed).length;
    let open = list.filter(x => !x.closed).length;
    return { total: open + closed, closed: closed, open: open, list: list };
  };

  const afCur = getAirsideFindings(mStr);
  const afPrev = getAirsideFindings(pmStr);

  const survCur = (grAppData.surveys || []).filter(s => normalizeYearMonth(s.Date || s.date) === mStr);
  const survPrev = (grAppData.surveys || []).filter(s => normalizeYearMonth(s.Date || s.date) === pmStr);

  // مصفوفة استبيان الطيارين للشهر الحالي
  let survMatrix = {};
  CRITERIA_LIST_GR.forEach(c => survMatrix[c] = { Excellent: 0, Good: 0, Poor: 0, "N/A": 0, Blank: 0 });
  let survComments = [];
  survCur.forEach(s => {
    CRITERIA_LIST_GR.forEach(c => {
      let v = s[c] || "Blank";
      if (survMatrix[c][v] !== undefined) survMatrix[c][v]++;
    });
    if (s.Captain_Comments && String(s.Captain_Comments).trim() !== "") survComments.push(s);
  });

  // بيانات FOD للشهر الحالي والشهر السابق (تجميع كافة الإدخالات بدون فقدان أي سجل)
  const fodCurRows = (grAppData.fod || []).filter(f => normalizeYearMonth(f.Date || f.date) === mStr);
  let fodTotPlastic = 0, fodTotMetal = 0;
  const fodTableRowsHtml = FOD_LOCATIONS_GR.map(loc => {
    let matching = fodCurRows.filter(f => String(f.Location || f.location || '').trim().toLowerCase() === loc.loc.toLowerCase());
    let p = matching.reduce((acc, r) => acc + (parseFloat(r.Plastic || r.plastic || 0) || 0), 0);
    let m = matching.reduce((acc, r) => acc + (parseFloat(r.Metal || r.metal || 0) || 0), 0);
    fodTotPlastic += p; fodTotMetal += m;
    let dStr = matching.length > 0 ? normalizeDateStr(matching[matching.length - 1].Date || matching[matching.length - 1].date) : '---';
    return `<tr><td dir="ltr">${dStr}</td><td style="text-align:left;font-weight:bold;">${loc.loc}</td><td>${loc.area}</td><td>${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td><td>${m > 0 ? m.toFixed(3) + ' kg' : '---'}</td><td>${(p + m) > 0 ? (p + m).toFixed(3) + ' kg' : '---'}</td></tr>`;
  }).join('');
  const fodCur = fodTotPlastic + fodTotMetal;

  let fodPrev = 0;
  (grAppData.fod || []).forEach(f => {
    if (normalizeYearMonth(f.Date || f.date) === pmStr) {
      fodPrev += ((parseFloat(f.Plastic || f.plastic || 0) || 0) + (parseFloat(f.Metal || f.metal || 0) || 0));
    }
  });

  const avMeetings = Number(document.getElementById('grAvMeetings')?.value || 2);
  const avAudits = Number(document.getElementById('grAvAudits')?.value || 0);
  const avCourses = Number(document.getElementById('grAvCourses')?.value || 2);

  // 2. بيانات السلامة والصحة المهنية (OSH)
  const oshCur = resolveOshMonthly(mStr);
  const oshPrev = grAppData.oshMonthly[pmStr] ? resolveOshMonthly(pmStr) : (Object.keys(oshCur.prevKpis || {}).length ? { kpis: oshCur.prevKpis } : resolveOshMonthly(pmStr));

  // 3. بيانات الحماية المدنية (Civil Defense)
  const cdCur = resolveCdMonthly(mStr);
  const cdPrev = grAppData.cdMonthly[pmStr] ? resolveCdMonthly(pmStr) : (Object.keys(cdCur.prevKpis || {}).length ? { kpis: cdCur.prevKpis } : resolveCdMonthly(pmStr));

  // 4. بيانات البيئة والحياة البرية (ENV)
  const envCur = resolveEnvMonthly(mStr);
  const envPrev = grAppData.envMonthly[pmStr] ? resolveEnvMonthly(pmStr) : (Object.keys(envCur.prevKpis || {}).length ? { kpis: envCur.prevKpis } : resolveEnvMonthly(pmStr));

  // التوصيات الختامية
  let recs = [];
  document.querySelectorAll('#gr-recommendations-box .gr-rec-inp').forEach(inp => { if (inp.value.trim()) recs.push(inp.value.trim()); });

  // الصفحة 1: الغلاف
  const pageCover = `
    <div class="gr-page" style="text-align:center;">
      ${pageHeaderBanner(1)}
      <div style="margin:25px auto;">
        <img src="report cover.jpg" onerror="this.onerror=null;this.src='Gemini_Generated_Image_vgja40vgja.jpg.jpg';" style="width:100%;max-width:650px;max-height:360px;object-fit:contain;border-radius:10px;border:1px solid #ddd;">
      </div>
      <h1 style="color:#003366;font-size:24px;font-weight:900;margin:15px 0 8px 0;">التقرير الشهري لإدارة السلامة والمطابقة</h1>
      <div style="display:inline-block;background:#003366;color:#fff;padding:8px 36px;border-radius:25px;font-size:17px;font-weight:bold;margin-bottom:25px;">( ${mOnlyAr} ${yCur} )</div>
      <div style="text-align:left;padding-left:30px;margin:20px 0;">
        <div style="font-size:14px;color:#555;font-weight:bold;">مدير إدارة السلامة والمطابقة</div>
        <div style="font-size:18px;color:#003366;font-weight:900;">${mgrName}</div>
      </div>
      <div style="background:#f0f4f8;border-right:4px solid #003366;padding:12px 16px;text-align:right;font-size:12.5px;font-weight:bold;color:#333;border-radius:6px;margin-top:25px;">
        يعتبر هذا التقرير نتاج لتقارير تم إعدادها بواسطة رئيس كل قسم من أقسام الإدارة العامة للسلامة والمطابقة نتيجة لتقارير يومية وقاعدة بيانات متاحة للعرض التفصيلي والمناقشة.
      </div>
      ${pageFooterBanner()}
    </div>
  `;

  // الصفحة 2: 1. قسم سلامة الطيران (المؤشرات + الأسهم الملونة + المخاطر + الشارتات)
  const pageAv1 = `
    <div class="gr-page">
      ${pageHeaderBanner(2)}
      <p style="font-weight:bold;color:#003366;margin-bottom:10px;">أتشرف بالعرض على سيادتكم أهم مؤشرات الأداء لكل قسم بالإدارة كالتالي:</p>
      <div class="gr-hdr-banner"><span>1. قسم سلامة الطيران</span><span>Airport Safety Department</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:50%;">الشهر (السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:18%;">الفرق</th></tr></thead>
        <tbody>
          <tr><td style="text-align:right;font-weight:bold;">عدد التحركات الجوية</td><td>${movPrev.toLocaleString()}</td><td><b>${movCur.toLocaleString()}</b></td><td>${formatGrTrendBadge(movCur, movPrev, true, "", false)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">عدد الحوادث</td><td>${String(accPrev).padStart(2,'0')}</td><td><b>${String(accCur).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(accCur, accPrev, false, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">عدد الوقائع</td><td>${String(occPrev).padStart(2,'0')}</td><td><b>${String(occCur).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(occCur, occPrev, false, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">إجمالي حالات عدم المطابقة</td><td>${String(afPrev.total).padStart(2,'0')}</td><td><b>${String(afCur.total).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(afCur.total, afPrev.total, false, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">حالات عدم المطابقة المعلقة</td><td>${String(afPrev.open).padStart(2,'0')}</td><td><b>${String(afCur.open).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(afCur.open, afPrev.open, false, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">حالات عدم المطابقة التي تم تلافيها</td><td>${String(afPrev.closed).padStart(2,'0')}</td><td><b>${String(afCur.closed).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(afCur.closed, afPrev.closed, true, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">استبيان الطيارين</td><td>${String(survPrev.length).padStart(2,'0')}</td><td><b>${String(survCur.length).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(survCur.length, survPrev.length, true, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">الاجتماعات</td><td>01</td><td><b>${String(avMeetings).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(avMeetings, 1, true, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">تفتيشات السلامة</td><td>00</td><td><b>${String(avAudits).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(avAudits, 0, true, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">دورات توعية</td><td>01</td><td><b>${String(avCourses).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(avCourses, 1, true, "", true)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">إجمالي كمية F.O.D التي تم التقاطها وتجميعها خلال الشهر</td><td dir="ltr">${fodPrev.toFixed(3)} KG</td><td dir="ltr"><b>${fodCur.toFixed(3)} KG</b></td><td>${formatGrTrendBadge(fodCur, fodPrev, false, "KG", false)}</td></tr>
        </tbody>
      </table>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <div style="flex:1;min-width:250px;height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;"><canvas id="grAvDeptChart"></canvas></div>
        <div style="flex:1;min-width:250px;height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;"><canvas id="grAvStatusChart"></canvas></div>
      </div>
      <div style="font-weight:bold;color:#003366;margin-bottom:6px;">حصر وتصنيف المخاطر (حالات عدم المطابقة المعلقة وما تم تلافيه):</div>
      <ol style="line-height:1.65;font-size:11px;margin-bottom:8px;">
        ${afCur.list.length ? afCur.list.map(f => `<li><b>${f.category} - ${f.item}</b> (${f.location}) — <span style="color:#003366;">الإجراء التصحيحي:</span> ${f.note} <b>[${f.closed ? 'تم' : 'معلق'}]</b></li>`).join('') : '<li>لا توجد حالات عدم مطابقة مسجلة خلال الشهر.</li>'}
      </ol>
      <div style="font-weight:bold;font-size:12px;">• الحوادث: <span style="color:#28a745;">${accCur === 0 ? 'لا يوجد' : accCur}</span></div>
      ${pageFooterBanner()}
    </div>
  `;

  // الصفحة 3: 1. قسم سلامة الطيران (الوقائع + مصفوفة استبيان الطيارين + ملاحظات الكابتن + FOD)
  const incRowsHtml = incCurList.length === 0
    ? '<tr><td colspan="4" style="color:#28a745;font-weight:bold;">لا توجد وقائع مسجلة خلال الشهر</td></tr>'
    : incCurList.map((i, idx) => `<tr><td>0${idx+1}</td><td>${i.Characterization || '-'}</td><td style="text-align:left;direction:ltr;font-size:9.5px;"><b>Description:</b> ${i.Description || '-'}<br><b>Action Taken:</b> ${i.Action_Taken || '-'}</td><td>${normalizeDateStr(i.Date)}<br><b>${i.CAR || '-'}</b></td></tr>`).join('');

  const survMatrixRowsHtml = CRITERIA_LIST_GR.map(c => `
    <tr>
      <td style="text-align:left;font-weight:bold;padding:2px 6px;">${c}</td>
      <td style="padding:2px;">${survMatrix[c].Excellent}</td>
      <td style="padding:2px;">${survMatrix[c].Good}</td>
      <td style="padding:2px;">${survMatrix[c].Poor}</td>
      <td style="padding:2px;">${survMatrix[c]["N/A"]}</td>
      <td style="padding:2px;">${survMatrix[c].Blank}</td>
    </tr>
  `).join('');

  const survCommentsHtml = survComments.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:#777;">No captain comments recorded for this month.</td></tr>'
    : survComments.map(s => `<tr><td><b>${s.CAR || '-'}</b></td><td>${s.Flight_NO || '-'}</td><td>${s.TYPE || '-'}</td><td dir="ltr">${normalizeDateStr(s.Date)}</td><td>${s.REG || '-'}</td><td style="text-align:left;">${s.Captain_Comments}</td></tr>`).join('');

  const pageAv2 = `
    <div class="gr-page">
      ${pageHeaderBanner(3)}
      <div style="font-weight:bold;color:#003366;margin-bottom:6px;">• الوقائع: تم حصر عدد (${String(occCur).padStart(2,'0')}) واقعة وتصنيفها كالتالي:</div>
      <table class="gr-tbl">
        <thead><tr><th style="width:7%;">م</th><th style="width:20%;">تصنيف الواقعة</th><th style="width:53%;">الوصف والإجراء المتخذ</th><th style="width:20%;">التاريخ / الشركة</th></tr></thead>
        <tbody>${incRowsHtml}</tbody>
      </table>

      <div style="font-weight:bold;color:#003366;margin:10px 0 6px 0;">• حصر استطلاع رأي الطيارين: تم عمل عدد (${survCur.length}) استعلام طيارين (Safety Captain Survey Report For ${mEngShort})</div>
      <table class="gr-tbl" style="direction:ltr;font-size:8.5px;margin-bottom:8px;">
        <thead><tr><th style="text-align:left;">Criteria</th><th>Excellent</th><th>Good</th><th>Poor</th><th>N/A</th><th>Blank</th></tr></thead>
        <tbody>${survMatrixRowsHtml}</tbody>
      </table>

      <table class="gr-tbl" style="direction:ltr;font-size:9px;margin-bottom:10px;">
        <thead><tr><th>Airline</th><th>FLT NO</th><th>Type</th><th>Date</th><th>REG</th><th>Captain Comments</th></tr></thead>
        <tbody>${survCommentsHtml}</tbody>
      </table>

      <div style="font-weight:bold;color:#003366;margin:10px 0 6px 0;">• F.O.D Collected and Classifications:</div>
      <table class="gr-tbl" style="direction:ltr;font-size:9.5px;">
        <thead><tr><th>Day</th><th>Location</th><th>Area</th><th>Plastic</th><th>Metal</th><th>Total</th></tr></thead>
        <tbody>
          ${fodTableRowsHtml}
          <tr style="background:#f0f4f8;font-weight:bold;"><td colspan="3">Total</td><td>${fodTotPlastic.toFixed(3)} kg</td><td>${fodTotMetal.toFixed(3)} kg</td><td>${fodCur.toFixed(3)} kg</td></tr>
        </tbody>
      </table>
      ${pageFooterBanner()}
    </div>
  `;

  // الصفحة 4: 2. السلامة والصحة المهنية (OSH) مع الأسهم الملونة
  const oshTotalPrev = Number(oshPrev.kpis?.rectifiedFindings || 0) + Number(oshPrev.kpis?.pendingFindings || 0);
  const oshTotalCur = Number(oshCur.kpis?.rectifiedFindings || 0) + Number(oshCur.kpis?.pendingFindings || 0);

  const oshKpiRows = [
    { l: "حالات عدم المطابقة", p: oshTotalPrev, c: oshTotalCur, hb: false },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: Number(oshPrev.kpis?.rectifiedFindings || 0), c: Number(oshCur.kpis?.rectifiedFindings || 0), hb: true },
    { l: "حالات عدم المطابقة المعلقة", p: Number(oshPrev.kpis?.pendingFindings || 0), c: Number(oshCur.kpis?.pendingFindings || 0), hb: false },
    { l: "الوقائع", p: Number(oshPrev.kpis?.incidents || 0), c: Number(oshCur.kpis?.incidents || 0), hb: false },
    { l: "إصابات العمل", p: Number(oshPrev.kpis?.workInjuries || 0), c: Number(oshCur.kpis?.workInjuries || 0), hb: false },
    { l: "الاجتماعات", p: Number(oshPrev.kpis?.meetings || 0), c: Number(oshCur.kpis?.meetings || 0), hb: true }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;">${r.l}</td><td>${String(r.p).padStart(2,'0')}</td><td><b>${String(r.c).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(r.c, r.p, r.hb, "", true)}</td></tr>`).join('');

  const pageOsh = `
    <div class="gr-page">
      ${pageHeaderBanner(4)}
      <div class="gr-hdr-banner" style="background:#fd7e14;"><span>2. قسم السلامة والصحة المهنية</span><span>Occupational Safety & Health</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:50%;">الشهر (السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:18%;">الفرق</th></tr></thead>
        <tbody>${oshKpiRows}</tbody>
      </table>
      <div style="height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;margin-bottom:12px;"><canvas id="grOshDeptChart"></canvas></div>
      <div style="font-weight:bold;color:#dc3545;margin-bottom:4px;">حالات عدم المطابقة (المخاطر) المعلقة:</div>
      <ol style="line-height:1.6;font-size:11px;margin-bottom:8px;">${(oshCur.pendingList || []).length ? oshCur.pendingList.map(x => `<li>${x.text} <b>(${x.dept})</b></li>`).join('') : '<li>لا يوجد</li>'}</ol>
      <div style="font-weight:bold;color:#28a745;margin-bottom:4px;">حالات عدم المطابقة (المخاطر) التي تم تلافيها:</div>
      <ol style="line-height:1.6;font-size:11px;margin-bottom:8px;">${(oshCur.rectifiedList || []).length ? oshCur.rectifiedList.map(x => `<li>${x.text} <b>(${x.dept})</b></li>`).join('') : '<li>لا يوجد</li>'}</ol>
      <div style="background:#f9fbfd;border:1px solid #ddd;padding:10px;border-radius:6px;font-size:11px;line-height:1.7;">
        <div><b>• الحوادث:</b> ${oshCur.accidentsText || 'لا يوجد'} | <b>إصابات العمل:</b> ${oshCur.injuriesText || 'لا يوجد'}</div>
        <div><b>• الوقائع:</b> ${oshCur.occurrencesText || 'لا يوجد'}</div>
        <div><b>• الاجتماعات:</b> ${oshCur.meetingsText || '-'}</div>
        <div><b>• نتائج الفحص والمرور الدوري:</b> ${oshCur.periodicText || '-'}</div>
      </div>
      ${pageFooterBanner()}
    </div>
  `;

  // الصفحة 5: 3. قسم سلامة الحماية المدنية (Civil Defense) مع الأسهم الملونة
  const cdKpiRows = [
    { l: "التدريبات", p: Number(cdPrev.kpis?.drills || 0), c: Number(cdCur.kpis?.drills || 0), hb: true },
    { l: "الأعطال والملاحظات التي تم تسجيلها بسيارات الإطفاء", p: Number(cdPrev.kpis?.truckDefects || 0), c: Number(cdCur.kpis?.truckDefects || 0), hb: false },
    { l: "حالات عدم المطابقة لمعدات الإنقاذ والإطفاء المحملة داخل السيارات", p: Number(cdPrev.kpis?.equipDefects || 0), c: Number(cdCur.kpis?.equipDefects || 0), hb: false },
    { l: "حالات عدم المطابقة لمهمات الوقاية الشخصية", p: Number(cdPrev.kpis?.ppeDefects || 0), c: Number(cdCur.kpis?.ppeDefects || 0), hb: false },
    { l: "حالات عدم المطابقة لتجهيزات غرفة عمليات الاتصالات", p: Number(cdPrev.kpis?.commDefects || 0), c: Number(cdCur.kpis?.commDefects || 0), hb: false },
    { l: "حالات عدم المطابقة لتجهيزات مبنى وحدة الإطفاء والإنقاذ", p: Number(cdPrev.kpis?.bldgDefects || 0), c: Number(cdCur.kpis?.bldgDefects || 0), hb: false },
    { l: "إجمالي حالات عدم المطابقة المعلقة", p: Number(cdPrev.kpis?.pendingTotal || 0), c: Number(cdCur.kpis?.pendingTotal || 0), hb: false },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: Number(cdPrev.kpis?.rectifiedTotal || 0), c: Number(cdCur.kpis?.rectifiedTotal || 0), hb: true },
    { l: "حالة المطابقة للمخزون الاستراتيجي", p: cdPrev.kpis?.stockStatus || 'مطابق', c: cdCur.kpis?.stockStatus || 'مطابق', isText: true }
  ].map(r => {
    if (r.isText) {
      let badge = '';
      if (r.p === r.c) badge = `<span style="color:#0d6efd;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">00 <i class="fa-solid fa-arrow-right"></i></span>`;
      else if (r.c === 'مطابق') badge = `<span style="color:#28a745;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">${r.c} <i class="fa-solid fa-arrow-up"></i></span>`;
      else badge = `<span style="color:#dc3545;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">${r.c} <i class="fa-solid fa-arrow-down"></i></span>`;
      return `<tr><td style="text-align:right;font-weight:bold;">${r.l}</td><td>${r.p}</td><td><b>${r.c}</b></td><td>${badge}</td></tr>`;
    }
    return `<tr><td style="text-align:right;font-weight:bold;">${r.l}</td><td>${String(r.p).padStart(2,'0')}</td><td><b>${String(r.c).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(r.c, r.p, r.hb, "", true)}</td></tr>`;
  }).join('');

  const pageCd = `
    <div class="gr-page">
      ${pageHeaderBanner(5)}
      <div class="gr-hdr-banner" style="background:#dc3545;"><span>3. قسم سلامة الحماية المدنية</span><span>Civil Defense & ARFF</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:50%;">الشهر (السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:18%;">الفرق</th></tr></thead>
        <tbody>${cdKpiRows}</tbody>
      </table>
      <div style="height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;margin-bottom:12px;"><canvas id="grCdCompareChart"></canvas></div>
      <div style="font-weight:bold;color:#dc3545;margin-bottom:5px;">حالات عدم المطابقة والملاحظات المعلقة:</div>
      <table class="gr-tbl">
        <thead><tr><th style="width:8%;">م</th><th>الملاحظات المعلقة</th><th style="width:25%;">الإدارة المعنية</th></tr></thead>
        <tbody>${(cdCur.pendingObs || []).length ? cdCur.pendingObs.map((x, i) => `<tr><td>${i+1}</td><td style="text-align:right;">${x.text}</td><td><b>${x.dept}</b></td></tr>`).join('') : '<tr><td colspan="3">لا يوجد</td></tr>'}</tbody>
      </table>
      <div style="font-weight:bold;color:#003366;margin-bottom:4px;">التدريبات المنفذة خلال الشهر:</div>
      <ol style="line-height:1.6;font-size:11px;">${(cdCur.trainings || []).length ? cdCur.trainings.map(t => `<li>${t}</li>`).join('') : '<li>لا يوجد</li>'}</ol>
      ${pageFooterBanner()}
    </div>
  `;

  // الصفحة 6: 4. قسم البيئة ومكافحة مخاطر الحياة البرية مع الأسهم الملونة
  const envTotalPrev = Number(envPrev.kpis?.pendingEnv || 0) + Number(envPrev.kpis?.rectifiedEnv || 0);
  const envTotalCur = Number(envCur.kpis?.pendingEnv || 0) + Number(envCur.kpis?.rectifiedEnv || 0);

  const envKpiRows = [
    { l: "الحالات والمخاطر البيئية المعلقة", p: Number(envPrev.kpis?.pendingEnv || 0), c: Number(envCur.kpis?.pendingEnv || 0), hb: false },
    { l: "الحالات والمخاطر البيئية التي تم تلافيها", p: Number(envPrev.kpis?.rectifiedEnv || 0), c: Number(envCur.kpis?.rectifiedEnv || 0), hb: true },
    { l: "إجمالي الحالات والمخاطر البيئية", p: envTotalPrev, c: envTotalCur, hb: false },
    { l: "الاجتماعات", p: Number(envPrev.kpis?.meetingsEnv || 0), c: Number(envCur.kpis?.meetingsEnv || 0), hb: true }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;">${r.l}</td><td>${String(r.p).padStart(2,'0')}</td><td><b>${String(r.c).padStart(2,'0')}</b></td><td>${formatGrTrendBadge(r.c, r.p, r.hb, "", true)}</td></tr>`).join('');

  const pageEnv = `
    <div class="gr-page">
      ${pageHeaderBanner(6)}
      <div class="gr-hdr-banner" style="background:#28a745;"><span>4. قسم البيئة ومكافحة مخاطر الحياة البرية</span><span>Environment & Wildlife</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:50%;">الشهر (السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:18%;">الفرق</th></tr></thead>
        <tbody>${envKpiRows}</tbody>
      </table>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <div style="flex:1;min-width:250px;height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;"><canvas id="grEnvDeptChart"></canvas></div>
        <div style="flex:1;min-width:250px;height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;"><canvas id="grEnvCatChart"></canvas></div>
      </div>
      <div style="background:#f9fbfd;border:1px solid #ddd;padding:10px;border-radius:6px;font-size:11px;line-height:1.7;margin-bottom:10px;">
        <div><b>• الحوادث:</b> ${envCur.accidentsText || 'لا يوجد'}</div>
        <div><b>• نتائج التفتيشات البيئية:</b><br>أ- التفتيش والمرور الأسبوعي على سور السلك بمنطقة العمليات الجوية: ${envCur.fenceText || '-'}<br>ب- التفتيش والمرور الشهري على مناطق الجذب الخارجية للطيور والحياة البرية: ${envCur.externalText || '-'}</div>
        <div><b>• نتيجة تقييم أداء شركة المكافحة:</b> <b>(${envCur.pestEval || '78.0%'})</b> عن الشهر الحالي وتم إرساله لإدارة الشئون الإدارية.</div>
      </div>
      <div style="font-weight:bold;color:#003366;margin-bottom:5px;">نتائج المرور والملاحظات التي تم رصدها:</div>
      <ol style="line-height:1.6;font-size:10.5px;">${(envCur.observations || []).length ? envCur.observations.map(o => `<li><b>${o.desc}</b> (${o.location}) - ${o.date} — <span style="color:#003366;">الإجراء التصحيحي:</span> ${o.action} <b>[${o.status}]</b></li>`).join('') : '<li>لا توجد ملاحظات مسجلة خلال الشهر.</li>'}</ol>
      ${pageFooterBanner()}
    </div>
  `;

  // الصفحة 7: توصيات إدارة السلامة والمطابقة (الخاتمة)
  const pageRecs = `
    <div class="gr-page">
      ${pageHeaderBanner(7)}
      <div class="gr-hdr-banner" style="background:#003366;"><span>توصيات الإدارة العامة للسلامة والمطابقة</span><span>General Department Recommendations</span></div>
      <ul style="line-height:2.1;font-size:13px;font-weight:bold;color:#222;margin:20px 0 40px 0;padding-right:24px;">
        ${recs.map(r => `<li>${r}</li>`).join('')}
      </ul>
      <div style="text-align:center;font-size:15px;font-weight:bold;margin:30px 0;">وتفضلوا بقبول فائق الاحترام ،،</div>
      <div style="text-align:left;padding-left:35px;margin-top:30px;">
        <div style="font-size:14px;color:#555;font-weight:bold;">مدير إدارة السلامة والمطابقة</div>
        <div style="font-size:18px;color:#003366;font-weight:900;margin-top:4px;">${mgrName}</div>
      </div>
      ${pageFooterBanner()}
    </div>
  `;

  const out = document.getElementById('printable-general-report');
  out.innerHTML = pageCover + pageAv1 + pageAv2 + pageOsh + pageCd + pageEnv + pageRecs;
  out.style.display = 'block';

  grChartInstances.forEach(c => { try { c.destroy(); } catch (e) {} });
  grChartInstances = [];

  const intTickOpts = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

  // 1. رسوم سلامة الطيران
  let avDeptMap = {};
  afCur.list.forEach(f => {
    let d = f.responsible || 'أخرى';
    if (!avDeptMap[d]) avDeptMap[d] = { open: 0, closed: 0 };
    if (f.closed) avDeptMap[d].closed++; else avDeptMap[d].open++;
  });
  const ctxAv1 = document.getElementById('grAvDeptChart')?.getContext('2d');
  if (ctxAv1) {
    const lbs = Object.keys(avDeptMap).length ? Object.keys(avDeptMap) : ['الهندسة المدنية', 'الهندسة الكهربائية'];
    grChartInstances.push(new Chart(ctxAv1, {
      type: 'bar',
      data: {
        labels: lbs,
        datasets: [
          { label: 'معلق', data: lbs.map(l => avDeptMap[l]?.open || 0), backgroundColor: '#dc3545' },
          { label: 'تم', data: lbs.map(l => avDeptMap[l]?.closed || 0), backgroundColor: '#28a745' }
        ]
      },
      options: { ...intTickOpts, plugins: { title: { display: true, text: 'المخاطر طبقاً للإدارة / الجهة (سلامة الطيران)' } } }
    }));
  }

  const ctxAv2 = document.getElementById('grAvStatusChart')?.getContext('2d');
  if (ctxAv2) {
    grChartInstances.push(new Chart(ctxAv2, {
      type: 'bar',
      data: {
        labels: ['معلق', 'تم', 'الإجمالي'],
        datasets: [{ label: 'حالات عدم المطابقة', data: [afCur.open, afCur.closed, afCur.total], backgroundColor: ['#dc3545', '#28a745', '#6c757d'] }]
      },
      options: { ...intTickOpts, plugins: { title: { display: true, text: 'إجمالي المخاطر المرصودة (سلامة الطيران)' } } }
    }));
  }

  // 2. رسم السلامة والصحة المهنية
  let oshDeptMap = { "الهندسة المدنية": { open: 0, closed: 0 }, "الهندسة الميكانيكية": { open: 0, closed: 0 }, "الهندسة الكهربائية": { open: 0, closed: 0 }, "إدارة الاتصالات": { open: 0, closed: 0 }, "شركات خارجية": { open: 0, closed: 0 } };
  (oshCur.pendingList || []).forEach(x => { if (!oshDeptMap[x.dept]) oshDeptMap[x.dept] = { open: 0, closed: 0 }; oshDeptMap[x.dept].open++; });
  (oshCur.rectifiedList || []).forEach(x => { if (!oshDeptMap[x.dept]) oshDeptMap[x.dept] = { open: 0, closed: 0 }; oshDeptMap[x.dept].closed++; });
  const ctxOsh = document.getElementById('grOshDeptChart')?.getContext('2d');
  if (ctxOsh) {
    const lbs = Object.keys(oshDeptMap);
    grChartInstances.push(new Chart(ctxOsh, {
      type: 'bar',
      data: {
        labels: lbs,
        datasets: [
          { label: 'معلق', data: lbs.map(l => oshDeptMap[l].open), backgroundColor: '#dc3545' },
          { label: 'تم', data: lbs.map(l => oshDeptMap[l].closed), backgroundColor: '#28a745' }
        ]
      },
      options: { ...intTickOpts, plugins: { title: { display: true, text: 'حالات عدم المطابقة ما تم وما هو معلق طبقاً للإدارة / الجهة (OSH)' } } }
    }));
  }

  // 3. رسم الحماية المدنية
  const ctxCd = document.getElementById('grCdCompareChart')?.getContext('2d');
  if (ctxCd) {
    const cdKeys = ['drills', 'truckDefects', 'equipDefects', 'ppeDefects', 'commDefects', 'bldgDefects', 'pendingTotal', 'rectifiedTotal'];
    const cdLabels = ['التدريبات', 'أعطال السيارات', 'المعدات', 'مهمات الوقاية', 'الاتصالات', 'المبنى', 'المعلقة', 'المتلافية'];
    grChartInstances.push(new Chart(ctxCd, {
      type: 'bar',
      data: {
        labels: cdLabels,
        datasets: [
          { label: pmAr, data: cdKeys.map(k => Number(cdPrev.kpis?.[k] || 0)), backgroundColor: '#6c757d' },
          { label: mAr, data: cdKeys.map(k => Number(cdCur.kpis?.[k] || 0)), backgroundColor: '#dc3545' }
        ]
      },
      options: { ...intTickOpts, plugins: { title: { display: true, text: 'مقارنة مؤشرات الحماية المدنية بين الشهر السابق والحالي' } } }
    }));
  }

  // 4. رسوم البيئة والحياة البرية
  let envDeptMap = {}, envCatMap = {};
  (envCur.observations || []).forEach(o => {
    const isDone = o.status === 'تم';
    if (!envDeptMap[o.dept]) envDeptMap[o.dept] = { done: 0, pend: 0 };
    if (isDone) envDeptMap[o.dept].done++; else envDeptMap[o.dept].pend++;
    if (!envCatMap[o.category]) envCatMap[o.category] = { done: 0, pend: 0 };
    if (isDone) envCatMap[o.category].done++; else envCatMap[o.category].pend++;
  });
  const ctxEnv1 = document.getElementById('grEnvDeptChart')?.getContext('2d');
  if (ctxEnv1) {
    const lbs = Object.keys(envDeptMap).length ? Object.keys(envDeptMap) : ['الشئون الإدارية', 'جرين لاب', 'الهندسة المدنية', 'شركة توب'];
    grChartInstances.push(new Chart(ctxEnv1, {
      type: 'bar',
      data: {
        labels: lbs,
        datasets: [
          { label: 'تم', data: lbs.map(l => envDeptMap[l]?.done || 0), backgroundColor: '#28a745' },
          { label: 'معلق', data: lbs.map(l => envDeptMap[l]?.pend || 0), backgroundColor: '#dc3545' }
        ]
      },
      options: { ...intTickOpts, plugins: { title: { display: true, text: 'الإدارة / الجهة المعنية بحالات عدم المطابقة البيئية' } } }
    }));
  }

  const ctxEnv2 = document.getElementById('grEnvCatChart')?.getContext('2d');
  if (ctxEnv2) {
    const lbs = Object.keys(envCatMap).length ? Object.keys(envCatMap) : ['ثعبان', 'حيوانات ضالة', 'نفايات صلبة'];
    grChartInstances.push(new Chart(ctxEnv2, {
      type: 'bar',
      data: {
        labels: lbs,
        datasets: [
          { label: 'تم', data: lbs.map(l => envCatMap[l]?.done || 0), backgroundColor: '#28a745' },
          { label: 'معلق', data: lbs.map(l => envCatMap[l]?.pend || 0), backgroundColor: '#dc3545' }
        ]
      },
      options: { ...intTickOpts, plugins: { title: { display: true, text: 'حصر وتصنيف حالات عدم المطابقة البيئية' } } }
    }));
  }

  out.scrollIntoView({ behavior: 'smooth' });
}

async function exportGrPagesAsImages() {
  const pages = document.querySelectorAll('#printable-general-report .gr-page');
  if (!pages.length) return alert("اضغط على (تجميع وإصدار التقرير الشهري المجمع) أولاً!");
  const mStr = document.getElementById('grMonth')?.value || 'Report';
  for (let i = 0; i < pages.length; i++) {
    const cvs = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    await new Promise(res => {
      cvs.toBlob(b => {
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u; a.download = `General_Safety_Report_${mStr}_Page_0${i + 1}.png`;
        a.click();
        setTimeout(() => { URL.revokeObjectURL(u); res(); }, 500);
      }, 'image/png');
    });
  }
  alert("✅ تم تصدير جميع صفحات التقرير المجمع كصور PNG بنجاح!");
}

function exportGrPDF() {
  const el = document.getElementById('printable-general-report');
  if (!el || el.style.display === 'none') return alert("اضغط على (تجميع وإصدار التقرير الشهري المجمع) أولاً!");
  const mStr = document.getElementById('grMonth')?.value || 'Report';
  html2pdf().set({
    margin: 0.2,
    filename: `General_Department_Monthly_Report_${mStr}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: 'css', after: '.gr-page' }
  }).from(el).save();
}

async function sendGrViaEmail() {
  const mStr = document.getElementById('grMonth')?.value;
  const el = document.getElementById('printable-general-report');
  if (!el || el.style.display === 'none') return alert("اضغط على (تجميع وإصدار التقرير الشهري المجمع) أولاً!");
  const mgrName = document.getElementById('grManagerName')?.value || 'محمد محمد مرسي';
  const cvs = await html2canvas(el, { scale: 1.3, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = cvs.toDataURL('image/jpeg', 0.82);
  await fetch(API_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'sendReportEmail',
      subject: `التقرير الشهري المجمع لإدارة السلامة والمطابقة - ${mStr}`,
      htmlBody: `<div dir="rtl"><h2>التقرير الشهري المجمع للإدارة العامة للسلامة والمطابقة - ${mStr}</h2><p>إعداد واعتماد: <b>${mgrName}</b> - مدير إدارة السلامة والمطابقة</p><img src="cid:monthlyReportImage" style="max-width:100%;"></div>`,
      imageData: imgData,
      imageName: `General_Safety_Report_${mStr}.jpg`
    })
  });
  alert("✅ تم إرسال التقرير الشهري المجمع بالإيميل بنجاح!");
}
