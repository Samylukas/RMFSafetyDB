/**
 * General Department of Safety and Compliance - Marsa Alam Airport
 * Consolidated General Department Monthly Report (general-report.js)
 */

window.API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

const SPI_CONFIG_GR = [
  { category: "Post-crash fires", items: ["Airport firefighting services’ decreased (ICAO Airports firefighting categories)", "Reported inadequate equipment or resources (fire trucks, fire tools, etc.)", "Reported unqualified personnel (firefighters - Airport familiarization)", "Reported unqualified personnel (firefighters - Tactical training)"] },
  { category: "Precursors to Runway Incursion (RI) (HRC)", items: ["Failures or defects regarding signage found during routine inspection affect operation", "Failures or defects regarding lighting found during routine inspection affect operation", "Reported traffic not comply with mandatory runway stop sign/ lights / markings", "Reported disturbed ground frequency between ATC & vehicles (Follow-me Cars)", "Unauthorized or uncoordinated movement of vehicles or personnel near runways"] },
  { category: "Taxiway & Apron", items: ["Reported inadequate signage on TWY", "Reported inadequate signage on apron", "Reported inadequate lights on TWY", "Reported inadequate lights on apron", "Reported inadequate markings on TWY", "Reported inadequate markings on apron", "Reported lack of information signs", "Reported violating limited speed by vehicles on apron", "Reported walking across aprons", "Violations to low visibility procedures", "Unauthorized or uncoordinated movement of vehicles or personnel on aprons/ taxiways"] },
  { category: "Airport Operation", items: ["Reported ground collision with equipment/ aircraft/ vehicle", "Reported airport ground equipment malfunctions", "Reported airport electricity malfunctions", "Reported failures of SMGCS “surface movement guidance and control systems”"] },
  { category: "Bird / Wildlife", items: ["Reported birds strike", "Reported fencing openings", "Reported other defective protective devices", "Reported source of attraction such as (water, food, etc. ) in or around the airport", "Reported presence of weeds", "Observed birds /wildlife in or near airport"] },
  { category: "Foreign object debris (FOD)", items: ["Inspections in which FOD was detected (RWY)", "Inspections in which FOD was detected ( Taxiway)", "Inspections in which FOD was detected(Apron)"] },
  { category: "Emergency procedures", items: ["Carried out emergency procedures (fuel leak, engine fire, etc.)", "Delayed response to emergency (fuel leak, engine fire, etc.)"] },
  { category: "Laser", items: ["Reported observed laser beam"] },
  { category: "Reporting / safety awareness", items: ["Number of received safety reports", "Number of closed safety reports"] }
];

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

function initGeneralReportSection() {
  const curMonth = new Date().toISOString().slice(0, 7);
  if (document.getElementById('grMonth') && !document.getElementById('grMonth').value) {
    document.getElementById('grMonth').value = curMonth;
  }
  const recBox = document.getElementById('gr-recommendations-box');
  if (recBox && recBox.children.length === 0) {
    recBox.innerHTML = DEFAULT_GR_RECOMMENDATIONS.map(r => buildGrRecRow(r)).join('');
  }
  loadLocalCachesForGr();
  fetchLiveAllDataForGr();
}

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
  let m1 = s.match(/^(\d{4})[-\/](\d{1,2})/);
  if (m1) return `${m1[1]}-${String(m1[2]).padStart(2, '0')}`;
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
  let ico = isPositive ? "fa-arrow-up" : "fa-arrow-down";
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
    s.src = window.API_URL + '?action=getAppData&_t=' + Date.now() + '&callback=' + cb;
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
  const yStr = String(year || '2026');
  try {
    let res = await fetch(window.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getSPIData', year: yStr })
    });
    let j = await res.json();
    if (j.status === 'success' && j.data) {
      try { localStorage.setItem('spi_records_' + yStr, JSON.stringify(j.data)); } catch (e) {}
      return j.data;
    }
  } catch (e) {}
  try {
    let ls = localStorage.getItem('spi_records_' + yStr);
    if (ls) return JSON.parse(ls);
  } catch (e) {}
  return { movements: {}, events: {} };
}

function pageHeaderBanner() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #003366;padding-bottom:8px;margin-bottom:14px;flex-shrink:0;">
      <div style="text-align:right;font-size:11px;font-weight:bold;color:#003366;">
        إيماك مرسى علم<br>لإدارة وتشغيل المطارات (ش.م.م)<br>مطار مرسى علم الدولي
      </div>
      <div><img src="LOGO-removebg-preview (1).png" style="height:54px;"></div>
      <div style="text-align:left;direction:ltr;font-size:10px;font-weight:bold;color:#003366;">
        EMAK Marsa Alam<br>For Management and Operation Airports (S.A.E)
      </div>
    </div>
  `;
}

function pageFooterBanner(pageNum, totalPages = 10) {
  return `
    <div class="gr-page-footer">
      <div style="text-align:right;font-weight:bold;color:#333;">
        الكيلو (65) جنوب مدينة القصير - طريق مرسى علم | تليفون: 065/3700020-29 &nbsp;|&nbsp; <span dir="ltr" style="color:#555;">65 km Southern El-Quseir City - Marsa Alam Highway</span>
      </div>
      <div style="text-align:left;direction:ltr;font-weight:900;color:#003366;white-space:nowrap;font-size:10.5px;">
        Page ${pageNum} of ${totalPages}
      </div>
    </div>
  `;
}

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
    kpis: { drills: 0, truckDefects: truckDef, equipDefects: equipDef, ppeDefects: 0, commDefects: commDef, bldgDefects: bldgDef, pendingTotal: pendObs.length, rectifiedTotal: rectObs.length, stockStatus: 'مطابق' },
    prevKpis: {}, trainings: [], recordedObs: recObs, rectifiedObs: rectObs, pendingObs: pendObs
  };
}

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
    kpis: { totalFindings: pend.length + rect.length, rectifiedFindings: rect.length, pendingFindings: pend.length, incidents: 0, workInjuries: 0, meetings: 0 },
    prevKpis: {}, pendingList: pend, rectifiedList: rect, accidentsText: 'لا يوجد', occurrencesText: 'لا يوجد', meetingsText: '-', periodicText: '-', injuriesText: 'لا يوجد'
  };
}

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
      obs.push({ desc: f.desc, location: f.location, category: f.category, dept: f.dept, date: r.date, action: `${f.paCode ? '[' + f.paCode + '] ' : ''}${f.action}`, status: isDone ? 'تم' : 'معلق' });
    });
  });
  return {
    kpis: { pendingEnv: pendCnt, rectifiedEnv: doneCnt, totalEnv: pendCnt + doneCnt, meetingsEnv: 0 },
    prevKpis: {}, observations: obs, accidentsText: 'لا يوجد', fenceText: 'تم المرور الدوري وتنظيف الأسوار وسد الفتحات.', externalText: 'تم المرور الشهري على مناطق الجذب الخارجية.', pestEval: '78.0%'
  };
}

async function generateConsolidatedMonthlyReport() {
  const mStr = document.getElementById('grMonth')?.value;
  if (!mStr) return alert("اختر شهر التقرير أولاً!");

  const btn = document.getElementById('genGrBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تجميع ومراجعة بيانات الإدارات الأربع...'; }

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
  const mEngName = new Date(yCur, mCurInt - 1, 15).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // =========================================================================
  // 1. بيانات إدارة سلامة المطارات (طبق الأصل من تقرير سلامة المطارات المعتمد)
  // =========================================================================
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

  const getUniqAirsideFindings = (monthKey) => {
    let uM = {};
    (grAppData.daily || []).forEach(r => {
      if (normalizeYearMonth(r.date) === monthKey && r.findings) {
        r.findings.forEach(f => {
          let k = ((f.category || '').trim() + '___' + (f.item || '').trim() + '___' + (f.location || '').trim()).toLowerCase();
          let st = String(f.status || f.Status || '').trim().toLowerCase();
          let nt = String(f.note || '');
          let ac = String(f.actionTaken || f.action || '');
          let cl = (st === 'مغلق' || st === 'closed' || nt.includes('تم تلافي') || ac.includes('تم تلافي'));
          if (!uM[k]) uM[k] = { ...f, closed: cl, dept: f.responsible || 'أخرى' };
          else if (cl) uM[k].closed = true;
        });
      }
    });
    let list = Object.values(uM);
    let closed = list.filter(x => x.closed).length;
    let open = list.filter(x => !x.closed).length;
    let dp = {};
    list.forEach(x => { if (!x.closed) dp[x.dept] = (dp[x.dept] || 0) + 1; });
    return { total: open + closed, closed: closed, open: open, deptOpenMap: dp, list: list };
  };

  const afCur = getUniqAirsideFindings(mStr);
  const afPrev = getUniqAirsideFindings(pmStr);

  const survCur = (grAppData.surveys || []).filter(s => normalizeYearMonth(s.Date || s.date) === mStr);
  const survPrev = (grAppData.surveys || []).filter(s => normalizeYearMonth(s.Date || s.date) === pmStr);

  const lookupSafetyRep = (spiObj, yr, mIdx, itemKey) => {
    let val = Number(spiObj?.events?.[itemKey]?.[mIdx] || 0);
    if (!val && String(yr) === '2026') {
      const baseRep2026 = { 1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 1, 7: 5, 8: 2, 9: 5, 10: 1 };
      val = baseRep2026[mIdx] || 0;
    }
    return val;
  };
  const recRepCur = lookupSafetyRep(spiCur, yCur, mCurInt, "Number of received safety reports");
  const recRepPrev = lookupSafetyRep(spiPrev, yPrev, mPrevInt, "Number of received safety reports");
  const clsRepCur = lookupSafetyRep(spiCur, yCur, mCurInt, "Number of closed safety reports");
  const clsRepPrev = lookupSafetyRep(spiPrev, yPrev, mPrevInt, "Number of closed safety reports");

  // بيانات FOD للشهر الحالي والشهر السابق
  const fodCurRows = (grAppData.fod || []).filter(f => normalizeYearMonth(f.Date || f.date) === mStr);
  let fodTotPlastic = 0, fodTotMetal = 0;
  const fodTableRowsHtml = FOD_LOCATIONS_GR.map(loc => {
    let matching = fodCurRows.filter(f => String(f.Location || f.location || '').trim().toLowerCase() === loc.loc.toLowerCase());
    let p = matching.reduce((acc, r) => acc + (parseFloat(r.Plastic || r.plastic || 0) || 0), 0);
    let m = matching.reduce((acc, r) => acc + (parseFloat(r.Metal || r.metal || 0) || 0), 0);
    fodTotPlastic += p; fodTotMetal += m;
    let dStr = matching.length > 0 ? normalizeDateStr(matching[matching.length - 1].Date || matching[matching.length - 1].date) : '---';
    return `<tr><td style="padding:7px;" dir="ltr">${dStr}</td><td style="padding:7px;text-align:left;font-weight:bold;">${loc.loc}</td><td style="padding:7px;">${loc.area}</td><td style="padding:7px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td><td style="padding:7px;">${m > 0 ? m.toFixed(3) + ' kg' : '---'}</td><td style="padding:7px;font-weight:bold;">${(p + m) > 0 ? (p + m).toFixed(3) + ' kg' : '---'}</td></tr>`;
  }).join('');
  const fodCur = fodTotPlastic + fodTotMetal;

  let fodPrev = 0;
  (grAppData.fod || []).forEach(f => {
    if (normalizeYearMonth(f.Date || f.date) === pmStr) {
      fodPrev += ((parseFloat(f.Plastic || f.plastic || 0) || 0) + (parseFloat(f.Metal || f.metal || 0) || 0));
    }
  });

  // =========================================================================
  // 2. بيانات الحماية المدنية (الترتيب الثاني بعد سلامة المطارات)
  // =========================================================================
  const cdCur = resolveCdMonthly(mStr);
  const cdPrev = grAppData.cdMonthly[pmStr] ? resolveCdMonthly(pmStr) : (Object.keys(cdCur.prevKpis || {}).length ? { kpis: cdCur.prevKpis } : resolveCdMonthly(pmStr));

  // =========================================================================
  // 3. بيانات السلامة والصحة المهنية (الترتيب الثالث)
  // =========================================================================
  const oshCur = resolveOshMonthly(mStr);
  const oshPrev = grAppData.oshMonthly[pmStr] ? resolveOshMonthly(pmStr) : (Object.keys(oshCur.prevKpis || {}).length ? { kpis: oshCur.prevKpis } : resolveOshMonthly(pmStr));

  // =========================================================================
  // 4. بيانات البيئة والحياة البرية (الترتيب الرابع)
  // =========================================================================
  const envCur = resolveEnvMonthly(mStr);
  const envPrev = grAppData.envMonthly[pmStr] ? resolveEnvMonthly(pmStr) : (Object.keys(envCur.prevKpis || {}).length ? { kpis: envCur.prevKpis } : resolveEnvMonthly(pmStr));

  // =========================================================================
  // 5. الملاحظات العامة والأنشطة المشتركة على الإدارة العامة ككل
  // =========================================================================
  const genAuditsPrev = Number(document.getElementById('grGenAuditsPrev')?.value || 0);
  const genAuditsCur = Number(document.getElementById('grGenAuditsCur')?.value || 0);
  const genCoursesPrev = Number(document.getElementById('grGenCoursesPrev')?.value || 0);
  const genCoursesCur = Number(document.getElementById('grGenCoursesCur')?.value || 0);
  const genMeetingsPrev = Number(document.getElementById('grGenMeetingsPrev')?.value || 0);
  const genMeetingsCur = Number(document.getElementById('grGenMeetingsCur')?.value || 0);
  const genNotesText = document.getElementById('grGenNotesText')?.value?.trim() || '';

  // التوصيات الختامية
  let recs = [];
  document.querySelectorAll('#gr-recommendations-box .gr-rec-inp').forEach(inp => { if (inp.value.trim()) recs.push(inp.value.trim()); });

  // =========================================================================
  // بناء صفحات التقرير
  // =========================================================================

  // الصفحة 1: الغلاف
  const pageCover = `
    <div class="gr-page" style="text-align:center;">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div style="margin:22px auto;">
        <img src="report cover.jpg" onerror="this.onerror=null;this.src='Gemini_Generated_Image_vgja40vgja.jpg.jpg';" style="width:100%;max-width:650px;max-height:360px;object-fit:contain;border-radius:10px;border:1px solid #ddd;">
      </div>
      <h1 style="color:#003366;font-size:24px;font-weight:900;margin:15px 0 8px 0;">التقرير الشهري لإدارة السلامة والمطابقة</h1>
      <div style="display:inline-block;background:#003366;color:#fff;padding:8px 36px;border-radius:25px;font-size:16px;font-weight:bold;margin-bottom:22px;">( ${mOnlyAr} ${yCur} — ${mEngName} )</div>
      <div style="text-align:left;padding-left:30px;margin:18px 0;">
        <div style="font-size:14px;color:#555;font-weight:bold;">مدير إدارة السلامة والمطابقة</div>
        <div style="font-size:18px;color:#003366;font-weight:900;">${mgrName}</div>
      </div>
      <div style="background:#f0f4f8;border-right:4px solid #003366;padding:12px 16px;text-align:right;font-size:12.5px;font-weight:bold;color:#333;border-radius:6px;margin-top:22px;">
        يعتبر هذا التقرير نتاج لتقارير تم إعدادها بواسطة رئيس كل قسم من أقسام الإدارة العامة للسلامة والمطابقة نتيجة لتقارير يومية وقاعدة بيانات متاحة للعرض التفصيلي والمناقشة.
      </div>
      </div>
      ${pageFooterBanner(1, 10)}
    </div>
  `;

  // الصفحة 2: 1. إدارة سلامة المطارات (أولاً: مؤشرات الأداء العامة + ثانياً: الحصر والتحليل البياني وحصر المخاطر)
  const avKpis = [
    { l: "عدد التحركات الجوية", p: movPrev, c: movCur, hb: true, u: "", pad: false },
    { l: "عدد الحوادث", p: accPrev, c: accCur, hb: false, u: "", pad: true },
    { l: "عدد الوقائع", p: occPrev, c: occCur, hb: false, u: "", pad: true },
    { l: "حالات عدم المطابقة (الإجمالي)", p: afPrev.total, c: afCur.total, hb: false, u: "", pad: true },
    { l: "حالات عدم المطابقة المعلقة", p: afPrev.open, c: afCur.open, hb: false, u: "", pad: true },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: afPrev.closed, c: afCur.closed, hb: true, u: "", pad: true },
    { l: "استبيان الطيارين", p: survPrev.length, c: survCur.length, hb: true, u: "", pad: true },
    { l: "تقارير السلامة المستلمة (Received Safety Reports)", p: recRepPrev, c: recRepCur, hb: true, u: "", pad: true },
    { l: "تقارير السلامة المغلقة (Closed Safety Reports)", p: clsRepPrev, c: clsRepCur, hb: true, u: "", pad: true },
    { l: "كمية الأجسام الغريبة FOD (بلاستيك + معدن)", p: fodPrev, c: fodCur, hb: false, u: "كجم", isF: true, pad: false }
  ];

  const avKpiRowsHtml = avKpis.map(i => {
    let pDisp = i.isF ? i.p.toFixed(3) + " كجم" : (i.pad ? String(i.p).padStart(2, '0') : i.p.toLocaleString());
    let cDisp = i.isF ? i.c.toFixed(3) + " كجم" : (i.pad ? String(i.c).padStart(2, '0') : i.c.toLocaleString());
    let trend = formatGrTrendBadge(i.c, i.p, i.hb, i.u, i.pad);
    return `<tr><td style="text-align:right;font-weight:bold;padding-right:12px;">${i.l}</td><td dir="ltr" style="white-space:nowrap;">${pDisp}</td><td dir="ltr" style="font-weight:bold;background:#f9fbfd;white-space:nowrap;">${cDisp}</td><td style="white-space:nowrap;">${trend}</td></tr>`;
  }).join('');

  const pageAv1 = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <p style="font-weight:bold;color:#003366;margin-bottom:10px;">أتشرف بالعرض على سيادتكم أهم مؤشرات الأداء لكل قسم بالإدارة كالتالي:</p>
      <div class="gr-hdr-banner"><span>1. إدارة سلامة المطارات — أولاً: مؤشرات الأداء العامة لمنطقة التحركات الجوية</span><span>Airport Safety Department</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="width:44%;text-align:right;padding-right:12px;">البيان</th><th style="width:18%;">${pmAr}</th><th style="width:18%;">${mAr}</th><th style="width:20%;">الفرق والاتجاه</th></tr></thead>
        <tbody>${avKpiRowsHtml}</tbody>
      </table>

      <div class="gr-sub-banner">ثانياً: الحصر والتحليل البياني للمخالفات والوقائع وحصر المخاطر</div>
      <div style="display:flex;gap:14px;margin-bottom:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:260px;background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;">
          <h5 style="color:#003366;margin:0 0 6px 0;font-size:11px;">المخالفات المرصودة طبقاً للإدارة المسؤولة</h5>
          <div style="height:175px;"><canvas id="grAvChart1"></canvas></div>
        </div>
        <div style="flex:1;min-width:260px;background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;">
          <h5 style="color:#003366;margin:0 0 6px 0;font-size:11px;">تصنيف الوقائع والحوادث المسجلة</h5>
          <div style="height:175px;"><canvas id="grAvChart2"></canvas></div>
        </div>
      </div>

      <div style="font-weight:bold;color:#003366;margin-bottom:4px;font-size:11.5px;">حصر وتصنيف المخاطر (حالات عدم المطابقة المعلقة وما تم تلافيه):</div>
      <ol style="line-height:1.6;font-size:10.5px;margin:0 0 8px 0;padding-right:20px;">
        ${afCur.list.length ? afCur.list.map(f => `<li><b>${f.category} - ${f.item}</b> (${f.location}) — <span style="color:#003366;">الإجراء التصحيحي:</span> ${f.note} <b style="color:${f.closed ? '#28a745' : '#dc3545'};">[${f.closed ? 'تم' : 'معلق'}]</b></li>`).join('') : '<li>لا توجد حالات عدم مطابقة مسجلة خلال الشهر.</li>'}
      </ol>
      <div style="font-weight:bold;font-size:11.5px;">• الحوادث: <span style="color:#28a745;">${accCur === 0 ? 'لا يوجد' : accCur}</span></div>
      </div>
      ${pageFooterBanner(2, 10)}
    </div>
  `;

  // الصفحة 3: إدارة سلامة المطارات (ثالثاً: مؤشرات السلامة التشغيلية وحركة الطائرات التراكمي YTD)
  const pageAv2 = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner"><span>1. إدارة سلامة المطارات — ثالثاً: مؤشرات السلامة التشغيلية وحركة الطائرات (YTD)</span><span>تراكمي حتى ${mAr}</span></div>
      <div style="background:#fafafa;border:1px solid #ddd;padding:10px;border-radius:6px;margin-bottom:14px;">
        <h5 style="color:#003366;margin:0 0 6px 0;font-size:11.5px;text-align:center;">منحنى حركة الطائرات التراكمي (${yCur}) حتى شهر ${mAr}</h5>
        <div style="height:185px;"><canvas id="grAvSpiTrendChart"></canvas></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
        <div style="background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;">
          <h6 style="color:#003366;margin:0 0 6px 0;font-size:10px;font-weight:bold;">توزيع المؤشرات حسب التصنيف</h6>
          <div style="height:165px;"><canvas id="grAvSpiCatChart"></canvas></div>
        </div>
        <div style="background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;">
          <h6 style="color:#003366;margin:0 0 6px 0;font-size:10px;font-weight:bold;">مؤشرات الممرات والساحة</h6>
          <div style="height:165px;"><canvas id="grAvSpiApronChart"></canvas></div>
        </div>
        <div style="background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;">
          <h6 style="color:#003366;margin:0 0 6px 0;font-size:10px;font-weight:bold;">المهبط، الحياة البرية والأجسام الغريبة</h6>
          <div style="height:165px;"><canvas id="grAvSpiWfChart"></canvas></div>
        </div>
        <div style="background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;">
          <h6 style="color:#003366;margin:0 0 6px 0;font-size:10px;font-weight:bold;">تقارير السلامة المستلمة والمغلقة (YTD)</h6>
          <div style="height:165px;"><canvas id="grAvSpiReportsChart"></canvas></div>
        </div>
      </div>
      </div>
      ${pageFooterBanner(3, 10)}
    </div>
  `;

  // الصفحة 4: إدارة سلامة المطارات (رابعاً: حصر وسجل الوقائع والحوادث المسجلة خلال الشهر)
  let gI = {};
  incCurList.forEach(i => { let ct = i.Characterization ? i.Characterization.split('/')[0].trim() : 'Others'; if (!gI[ct]) gI[ct] = []; gI[ct].push(i); });
  let incSectionHtml = '';
  if (Object.keys(gI).length === 0) {
    incSectionHtml = `<div style="background:#e8f5e9;border:1.5px solid #28a745;padding:30px;border-radius:8px;text-align:center;margin:25px 0;"><i class="fa-solid fa-shield-halved" style="color:#28a745;font-size:3rem;margin-bottom:10px;"></i><h3 style="color:#155724;margin:0 0 6px 0;">سجل آمن 100%</h3><p style="color:#28a745;margin:0;font-weight:bold;font-size:12px;">لم يتم تسجيل أي حوادث أو وقائع في منطقة التحركات الجوية خلال شهر ${mAr}.</p></div>`;
  } else {
    let cIdx = 1;
    for (let ct in gI) {
      incSectionHtml += `<div style="background:#003366;color:#fff;font-weight:bold;padding:6px 12px;margin-top:10px;border-radius:4px;display:flex;justify-content:space-between;font-size:11px;direction:ltr;"><span>${ct} (${cIdx})</span><span>Count: ${gI[ct].length}</span></div><table class="gr-tbl" style="direction:ltr;text-align:left;margin-bottom:12px;"><thead><tr><th style="width:6%;">Seq</th><th style="width:54%;">Description / Action Taken</th><th style="width:15%;">Date</th><th style="width:25%;">Flight Information</th></tr></thead><tbody>`;
      gI[ct].forEach((i, x) => {
        let dt = normalizeDateStr(i.Date);
        let ds = i.Description ? i.Description.replace(/\n/g, '<br>') : '-';
        let ac = i.Action_Taken ? i.Action_Taken.replace(/\n/g, '<br>') : '-';
        let dsDir = /[\u0600-\u06FF]/.test(ds) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
        let acDir = /[\u0600-\u06FF]/.test(ac) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
        let fInfo = `<b>Airline:</b> ${i.CAR || '-'}<br><b>Local Agent:</b> ${i.Equipment_Owned || '-'}<br><b>FLT NO:</b> ${i.Flight_No || '-'}<br><b>REG:</b> ${i.REG || '-'}`;
        incSectionHtml += `<tr><td style="font-weight:bold;">0${x + 1}</td><td style="padding:7px 9px;"><div style="text-align:center;margin-bottom:2px;"><strong style="color:#003366;text-decoration:underline;font-size:10px;">الوصف / Description</strong></div><div style="${dsDir} margin-bottom:8px;line-height:1.4;font-size:9.5px;">${ds}</div><div style="text-align:center;margin-bottom:2px;"><strong style="color:#28a745;text-decoration:underline;font-size:10px;">الإجراء المتخذ / Action Taken</strong></div><div style="${acDir} line-height:1.4;font-size:9.5px;color:#155724;">${ac}</div></td><td style="font-weight:bold;">${dt}</td><td style="text-align:left;line-height:1.5;font-size:9px;">${fInfo}</td></tr>`;
      });
      incSectionHtml += `</tbody></table>`;
      cIdx++;
    }
  }

  const pageAv3 = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner"><span>1. إدارة سلامة المطارات — رابعاً: حصر وسجل الوقائع والحوادث المسجلة خلال الشهر</span><span>إجمالي الوقائع: ${incCurList.length}</span></div>
      ${incSectionHtml}
      </div>
      ${pageFooterBanner(4, 10)}
    </div>
  `;

  // الصفحة 5: إدارة سلامة المطارات (خامساً: استبيان الطيارين Pilot Safety Surveys)
  let mS = { "Excellent": {}, "Good": {}, "Poor": {}, "N/A": {}, "Blank": {} };
  CRITERIA_LIST_GR.forEach(c => { mS["Excellent"][c] = 0; mS["Good"][c] = 0; mS["Poor"][c] = 0; mS["N/A"][c] = 0; mS["Blank"][c] = 0; });
  let aC = {}, eTC = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 }, cL = [];
  survCur.forEach(s => {
    if (s.CAR) aC[s.CAR] = (aC[s.CAR] || 0) + 1;
    CRITERIA_LIST_GR.forEach(c => { let v = s[c] || "Blank"; if (mS[v]) mS[v][c]++; if (eTC[v] !== undefined) eTC[v]++; });
    if (s.Captain_Comments && String(s.Captain_Comments).trim() !== "") cL.push(s);
  });

  let mH = `<table class="gr-tbl" style="direction:ltr;text-align:center;font-size:8px;margin-bottom:8px;"><thead><tr><th style="text-align:left;width:40%;">Evaluation Criteria</th><th style="background:#28a745;width:12%;">Excellent</th><th style="background:#ffc107;color:#000;width:12%;">Good</th><th style="background:#dc3545;width:12%;">Poor</th><th style="background:#6c757d;width:12%;">N/A</th><th style="background:#1a2a6c;width:12%;">Blank</th></tr></thead><tbody>`;
  CRITERIA_LIST_GR.forEach(c => {
    mH += `<tr><td style="padding:1.8px 5px;text-align:left;font-weight:bold;background:#fbfbfb;">${c}</td><td style="padding:1.8px;color:${mS["Excellent"][c] > 0 ? '#28a745' : '#bbb'};font-weight:bold;">${mS["Excellent"][c] || 0}</td><td style="padding:1.8px;color:${mS["Good"][c] > 0 ? '#ffc107' : '#bbb'};font-weight:bold;">${mS["Good"][c] || 0}</td><td style="padding:1.8px;color:${mS["Poor"][c] > 0 ? '#dc3545' : '#bbb'};font-weight:bold;">${mS["Poor"][c] || 0}</td><td style="padding:1.8px;color:#777;">${mS["N/A"][c] || 0}</td><td style="padding:1.8px;color:#777;">${mS["Blank"][c] || 0}</td></tr>`;
  });
  mH += `</tbody></table>`;

  let cH = `<div style="direction:ltr;text-align:left;"><h5 style="color:#003366;margin:6px 0;font-size:11px;">Captain Comments & Observations:</h5><table class="gr-tbl" style="direction:ltr;text-align:left;font-size:9px;"><thead><tr><th style="width:15%;">Airline</th><th style="width:12%;">FLT NO</th><th style="width:12%;">Type</th><th style="width:12%;">Date</th><th style="width:12%;">REG</th><th style="width:37%;">Comments</th></tr></thead><tbody>`;
  if (cL.length === 0) cH += `<tr><td colspan="6" style="padding:6px;text-align:center;color:#777;">No comments recorded for this month.</td></tr>`;
  else cL.forEach(s => {
    let cmt = s.Captain_Comments || '-';
    let cmtDir = /[\u0600-\u06FF]/.test(cmt) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
    cH += `<tr><td style="font-weight:bold;">${s.CAR || '-'}</td><td>${s.Flight_NO || '-'}</td><td>${s.TYPE || '-'}</td><td dir="ltr">${normalizeDateStr(s.Date)}</td><td>${s.REG || '-'}</td><td style="${cmtDir}">${cmt}</td></tr>`;
  });
  cH += `</tbody></table></div>`;

  const pageAv4 = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner"><span>1. إدارة سلامة المطارات — خامساً: استبيان الطيارين (Pilot Safety Surveys)</span><span>إجمالي الاستبيانات: ${survCur.length}</span></div>
      <div style="display:flex;gap:14px;margin-bottom:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:260px;background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;"><h5 style="color:#003366;margin:0 0 6px 0;font-size:11px;">مشاركات شركات الطيران</h5><div style="height:135px;"><canvas id="grAvSurveyAirChart"></canvas></div></div>
        <div style="flex:1;min-width:260px;background:#fafafa;border:1px solid #ddd;padding:8px;border-radius:6px;text-align:center;"><h5 style="color:#003366;margin:0 0 6px 0;font-size:11px;">توزيع التقييم العام للخدمات</h5><div style="height:135px;"><canvas id="grAvSurveyEvalChart"></canvas></div></div>
      </div>
      <div style="text-align:center;margin-bottom:6px;"><h5 style="color:#003366;margin:0;font-size:11.5px;font-weight:bold;">مصفوفة تقييم بنود السلامة (Safety Evaluation Matrix)</h5></div>
      ${mH}${cH}
      </div>
      ${pageFooterBanner(5, 10)}
    </div>
  `;

  // الصفحة 6: إدارة سلامة المطارات (سادساً: حصر وتصنيف الأجسام الغريبة F.O.D Collected)
  const pageAv5 = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner"><span>1. إدارة سلامة المطارات — سادساً: حصر وتصنيف الأجسام الغريبة (F.O.D Collected)</span><span>شهر ${mAr}</span></div>
      <table class="gr-tbl" style="direction:ltr;text-align:center;font-size:10px;">
        <thead>
          <tr><th rowspan="2" style="width:15%;">Date</th><th rowspan="2" style="width:32%;text-align:left;">Location</th><th rowspan="2" style="width:15%;">Area</th><th colspan="2" style="width:24%;">FOD Quantity</th><th rowspan="2" style="width:14%;">Total</th></tr>
          <tr><th>Plastic (kg)</th><th>Metal (kg)</th></tr>
        </thead>
        <tbody>
          ${fodTableRowsHtml}
          <tr style="background:#f0f4f8;font-weight:bold;"><td colspan="3" style="text-align:left;padding:9px;">Total Weight</td><td style="padding:9px;color:#003366;">${fodTotPlastic.toFixed(3)} kg</td><td style="padding:9px;color:#003366;">${fodTotMetal.toFixed(3)} kg</td><td style="padding:9px;color:#28a745;font-size:12px;">${fodCur.toFixed(3)} kg</td></tr>
        </tbody>
      </table>

      </div>
      ${pageFooterBanner(6, 10)}
    </div>
  `;

  // =========================================================================
  // الصفحة 7: 2. قسم سلامة الحماية المدنية (الترتيب الثاني بعد سلامة المطارات)
  // =========================================================================
  const cdKpiRows = [
    { l: "التدريبات وفقاً للخطة المخططة", p: Number(cdPrev.kpis?.drills || 0), c: Number(cdCur.kpis?.drills || 0), hb: true },
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
      return `<tr><td style="text-align:right;font-weight:bold;padding-right:12px;">${r.l}</td><td>${r.p}</td><td style="font-weight:bold;background:#f9fbfd;">${r.c}</td><td>${badge}</td></tr>`;
    }
    return `<tr><td style="text-align:right;font-weight:bold;padding-right:12px;">${r.l}</td><td style="white-space:nowrap;">${String(r.p).padStart(2,'0')}</td><td style="font-weight:bold;background:#f9fbfd;white-space:nowrap;">${String(r.c).padStart(2,'0')}</td><td style="white-space:nowrap;">${formatGrTrendBadge(r.c, r.p, r.hb, "", true)}</td></tr>`;
  }).join('');

  const pageCd = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner" style="background:#dc3545;"><span>2. قسم سلامة الحماية المدنية</span><span>Civil Defense & ARFF</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:48%;padding-right:12px;">البيان (الشهر السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:20%;">الفرق والاتجاه</th></tr></thead>
        <tbody>${cdKpiRows}</tbody>
      </table>
      <div style="height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;margin-bottom:12px;"><canvas id="grCdCompareChart"></canvas></div>
      <div style="font-weight:bold;color:#dc3545;margin-bottom:5px;font-size:11.5px;">حالات عدم المطابقة والملاحظات المعلقة:</div>
      <table class="gr-tbl">
        <thead><tr><th style="width:8%;">م</th><th>الملاحظات المعلقة</th><th style="width:25%;">الإدارة المعنية</th></tr></thead>
        <tbody>${(cdCur.pendingObs || []).length ? cdCur.pendingObs.map((x, i) => `<tr><td>${i+1}</td><td style="text-align:right;">${x.text}</td><td><b>${x.dept}</b></td></tr>`).join('') : '<tr><td colspan="3">لا يوجد</td></tr>'}</tbody>
      </table>
      <div style="font-weight:bold;color:#003366;margin-bottom:4px;font-size:11.5px;">التدريبات المنفذة خلال الشهر:</div>
      <ol style="line-height:1.6;font-size:11px;margin:0;">${(cdCur.trainings || []).length ? cdCur.trainings.map(t => `<li>${t}</li>`).join('') : '<li>لا يوجد</li>'}</ol>
      </div>
      ${pageFooterBanner(7, 10)}
    </div>
  `;

  // =========================================================================
  // الصفحة 8: 3. قسم السلامة والصحة المهنية (الترتيب الثالث)
  // =========================================================================
  const oshTotalPrev = Number(oshPrev.kpis?.rectifiedFindings || 0) + Number(oshPrev.kpis?.pendingFindings || 0);
  const oshTotalCur = Number(oshCur.kpis?.rectifiedFindings || 0) + Number(oshCur.kpis?.pendingFindings || 0);

  const oshKpiRows = [
    { l: "حالات عدم المطابقة (الإجمالي)", p: oshTotalPrev, c: oshTotalCur, hb: false },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: Number(oshPrev.kpis?.rectifiedFindings || 0), c: Number(oshCur.kpis?.rectifiedFindings || 0), hb: true },
    { l: "حالات عدم المطابقة المعلقة", p: Number(oshPrev.kpis?.pendingFindings || 0), c: Number(oshCur.kpis?.pendingFindings || 0), hb: false },
    { l: "الوقائع", p: Number(oshPrev.kpis?.incidents || 0), c: Number(oshCur.kpis?.incidents || 0), hb: false },
    { l: "إصابات العمل", p: Number(oshPrev.kpis?.workInjuries || 0), c: Number(oshCur.kpis?.workInjuries || 0), hb: false },
    { l: "الاجتماعات", p: Number(oshPrev.kpis?.meetings || 0), c: Number(oshCur.kpis?.meetings || 0), hb: true }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;padding-right:12px;">${r.l}</td><td>${String(r.p).padStart(2,'0')}</td><td style="font-weight:bold;background:#f9fbfd;">${String(r.c).padStart(2,'0')}</td><td>${formatGrTrendBadge(r.c, r.p, r.hb, "", true)}</td></tr>`).join('');

  const pageOsh = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner" style="background:#fd7e14;"><span>3. قسم السلامة والصحة المهنية</span><span>Occupational Safety & Health</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:48%;padding-right:12px;">البيان (الشهر السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:20%;">الفرق والاتجاه</th></tr></thead>
        <tbody>${oshKpiRows}</tbody>
      </table>
      <div style="height:175px;background:#fafafa;border:1px solid #ddd;padding:6px;border-radius:6px;margin-bottom:12px;"><canvas id="grOshDeptChart"></canvas></div>
      <div style="font-weight:bold;color:#dc3545;margin-bottom:4px;font-size:11.5px;">حالات عدم المطابقة (المخاطر) المعلقة:</div>
      <ol style="line-height:1.6;font-size:11px;margin-bottom:8px;">${(oshCur.pendingList || []).length ? oshCur.pendingList.map(x => `<li>${x.text} <b>(${x.dept})</b></li>`).join('') : '<li>لا يوجد</li>'}</ol>
      <div style="font-weight:bold;color:#28a745;margin-bottom:4px;font-size:11.5px;">حالات عدم المطابقة (المخاطر) التي تم تلافيها:</div>
      <ol style="line-height:1.6;font-size:11px;margin-bottom:8px;">${(oshCur.rectifiedList || []).length ? oshCur.rectifiedList.map(x => `<li>${x.text} <b>(${x.dept})</b></li>`).join('') : '<li>لا يوجد</li>'}</ol>
      <div style="background:#f9fbfd;border:1px solid #ddd;padding:10px;border-radius:6px;font-size:11px;line-height:1.7;">
        <div><b>• الحوادث:</b> ${oshCur.accidentsText || 'لا يوجد'} | <b>إصابات العمل:</b> ${oshCur.injuriesText || 'لا يوجد'}</div>
        <div><b>• الوقائع:</b> ${oshCur.occurrencesText || 'لا يوجد'}</div>
        <div><b>• الاجتماعات:</b> ${oshCur.meetingsText || '-'}</div>
        <div><b>• نتائج الفحص والمرور الدوري:</b> ${oshCur.periodicText || '-'}</div>
      </div>
      </div>
      ${pageFooterBanner(8, 10)}
    </div>
  `;

  // =========================================================================
  // الصفحة 9: 4. قسم البيئة ومكافحة مخاطر الحياة البرية (الترتيب الرابع)
  // =========================================================================
  const envTotalPrev = Number(envPrev.kpis?.pendingEnv || 0) + Number(envPrev.kpis?.rectifiedEnv || 0);
  const envTotalCur = Number(envCur.kpis?.pendingEnv || 0) + Number(envCur.kpis?.rectifiedEnv || 0);

  const envKpiRows = [
    { l: "الحالات والمخاطر البيئية المعلقة", p: Number(envPrev.kpis?.pendingEnv || 0), c: Number(envCur.kpis?.pendingEnv || 0), hb: false },
    { l: "الحالات والمخاطر البيئية التي تم تلافيها", p: Number(envPrev.kpis?.rectifiedEnv || 0), c: Number(envCur.kpis?.rectifiedEnv || 0), hb: true },
    { l: "إجمالي الحالات والمخاطر البيئية", p: envTotalPrev, c: envTotalCur, hb: false },
    { l: "الاجتماعات", p: Number(envPrev.kpis?.meetingsEnv || 0), c: Number(envCur.kpis?.meetingsEnv || 0), hb: true }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;padding-right:12px;">${r.l}</td><td>${String(r.p).padStart(2,'0')}</td><td style="font-weight:bold;background:#f9fbfd;">${String(r.c).padStart(2,'0')}</td><td>${formatGrTrendBadge(r.c, r.p, r.hb, "", true)}</td></tr>`).join('');

  const pageEnv = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner" style="background:#28a745;"><span>4. قسم البيئة ومكافحة مخاطر الحياة البرية</span><span>Environment & Wildlife</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:48%;padding-right:12px;">البيان (الشهر السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:20%;">الفرق والاتجاه</th></tr></thead>
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
      <div style="font-weight:bold;color:#003366;margin-bottom:5px;font-size:11.5px;">نتائج المرور والملاحظات التي تم رصدها:</div>
      <ol style="line-height:1.6;font-size:10.5px;margin:0;">${(envCur.observations || []).length ? envCur.observations.map(o => `<li><b>${o.desc}</b> (${o.location}) - ${o.date} — <span style="color:#003366;">الإجراء التصحيحي:</span> ${o.action} <b>[${o.status}]</b></li>`).join('') : '<li>لا توجد ملاحظات مسجلة خلال الشهر.</li>'}</ol>
      </div>
      ${pageFooterBanner(9, 10)}
    </div>
  `;

  // =========================================================================
  // الصفحة 10: 5. الملاحظات العامة على الإدارة ككل (التفتيشات ودورات التوعية) + التوصيات الختامية
  // =========================================================================
  const genKpiRows = [
    { l: "تفتيشات السلامة والمراجعات العامة (Safety Audits & Inspections)", p: genAuditsPrev, c: genAuditsCur, hb: true },
    { l: "دورات التوعية والتدريب العام (Safety Awareness & Training Courses)", p: genCoursesPrev, c: genCoursesCur, hb: true },
    { l: "الاجتماعات التنسيقية للإدارة العامة (General Department Meetings)", p: genMeetingsPrev, c: genMeetingsCur, hb: true }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;padding-right:12px;">${r.l}</td><td>${String(r.p).padStart(2,'0')}</td><td style="font-weight:bold;background:#f9fbfd;">${String(r.c).padStart(2,'0')}</td><td>${formatGrTrendBadge(r.c, r.p, r.hb, "", true)}</td></tr>`).join('');

  const pageGenAndRecs = `
    <div class="gr-page">
      ${pageHeaderBanner()}
      <div class="gr-page-body">
      <div class="gr-hdr-banner" style="background:#17a2b8;"><span>5. الملاحظات العامة والأنشطة المشتركة للإدارة العامة للسلامة والمطابقة ككل</span><span>General Department Activities</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:48%;padding-right:12px;">البيان (الشهر السابق / الحالي)</th><th style="width:16%;">${pmAr}</th><th style="width:16%;">${mAr}</th><th style="width:20%;">الفرق والاتجاه</th></tr></thead>
        <tbody>${genKpiRows}</tbody>
      </table>
      ${genNotesText ? `<div style="background:#f0f8ff;border-right:4px solid #17a2b8;padding:10px 14px;border-radius:6px;font-size:11.5px;font-weight:bold;color:#003366;margin-bottom:18px;"><b>ملاحظات عامة على الإدارة:</b> ${genNotesText}</div>` : ''}

      <div class="gr-hdr-banner" style="background:#003366;margin-top:14px;"><span>6. توصيات الإدارة العامة للسلامة والمطابقة</span><span>General Department Recommendations</span></div>
      <ul style="line-height:2.0;font-size:12.5px;font-weight:bold;color:#222;margin:14px 0 28px 0;padding-right:24px;">
        ${recs.map(r => `<li>${r}</li>`).join('')}
      </ul>
      <div style="text-align:center;font-size:15px;font-weight:bold;margin:20px 0;">وتفضلوا بقبول فائق الاحترام ،،</div>
      <div style="text-align:left;padding-left:35px;margin-top:20px;">
        <div style="font-size:14px;color:#555;font-weight:bold;">مدير إدارة السلامة والمطابقة</div>
        <div style="font-size:18px;color:#003366;font-weight:900;margin-top:4px;">${mgrName}</div>
      </div>
      </div>
      ${pageFooterBanner(10, 10)}
    </div>
  `;

  const out = document.getElementById('printable-general-report');
  out.innerHTML = pageCover + pageAv1 + pageAv2 + pageAv3 + pageAv4 + pageAv5 + pageCd + pageOsh + pageEnv + pageGenAndRecs;
  out.style.display = 'block';

  // تدمير الرسوم القديمة ورسم الجديدة
  grChartInstances.forEach(c => { try { c.destroy(); } catch (e) {} });
  grChartInstances = [];

  const intTickOpts = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

  // 1. رسوم سلامة المطارات (الصفحة 2)
  const ctxAv1 = document.getElementById('grAvChart1')?.getContext('2d');
  if (ctxAv1) {
    const dKeys = Object.keys(afCur.deptOpenMap);
    grChartInstances.push(new Chart(ctxAv1, {
      type: 'bar',
      data: {
        labels: dKeys.length ? dKeys : ['لا توجد مخالفات معلقة'],
        datasets: [{ label: 'المخاطر طبقاً للإدارة', data: dKeys.length ? Object.values(afCur.deptOpenMap) : [0], backgroundColor: '#003366', borderRadius: 4 }]
      },
      options: intTickOpts
    }));
  }

  let iTC = {};
  incCurList.forEach(i => { let ct = i.Characterization ? i.Characterization.split('/')[0].trim() : 'أخرى'; iTC[ct] = (iTC[ct] || 0) + 1; });
  const ctxAv2 = document.getElementById('grAvChart2')?.getContext('2d');
  if (ctxAv2) {
    const iKeys = Object.keys(iTC);
    grChartInstances.push(new Chart(ctxAv2, {
      type: 'bar',
      data: {
        labels: iKeys.length ? iKeys : ['لا توجد وقائع'],
        datasets: [{ label: 'الوقائع', data: iKeys.length ? Object.values(iTC) : [0], backgroundColor: '#dc3545', borderRadius: 4 }]
      },
      options: intTickOpts
    }));
  }

  // 2. رسوم مؤشرات الأداء التشغيلية YTD (الصفحة 3)
  const mNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const ytdMonths = mNames.slice(0, mCurInt);
  const ytdMovData = ytdMonths.map((_, i) => lookupMovements(`${yCur}-${String(i + 1).padStart(2, '0')}`, spiCur, yCur, i + 1));

  const ctxSpiTrend = document.getElementById('grAvSpiTrendChart')?.getContext('2d');
  if (ctxSpiTrend) {
    grChartInstances.push(new Chart(ctxSpiTrend, {
      type: 'line',
      data: {
        labels: ytdMonths,
        datasets: [{ label: `Movements (${yCur})`, data: ytdMovData, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.12)', borderWidth: 2.5, pointBackgroundColor: '#28a745', pointBorderColor: '#fff', pointRadius: 4, tension: 0.35, fill: true }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    }));
  }

  const ytdCatTotals = {}, ytdItemTotals = {};
  SPI_CONFIG_GR.forEach(cO => {
    let cSum = 0;
    cO.items.forEach(itm => {
      let itmSum = 0;
      for (let m = 1; m <= mCurInt; m++) itmSum += ((spiCur?.events && spiCur.events[itm] && spiCur.events[itm][m]) ? Number(spiCur.events[itm][m]) : 0);
      ytdItemTotals[itm] = itmSum; cSum += itmSum;
    });
    ytdCatTotals[cO.category] = cSum;
  });

  const pal = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#34495e'];

  const ctxSpiCat = document.getElementById('grAvSpiCatChart')?.getContext('2d');
  if (ctxSpiCat) {
    let cLabels = SPI_CONFIG_GR.map(c => c.category);
    let cCounts = SPI_CONFIG_GR.map(c => ytdCatTotals[c.category] || 0);
    let hasC = cCounts.some(v => v > 0);
    grChartInstances.push(new Chart(ctxSpiCat, {
      type: 'doughnut',
      data: { labels: hasC ? cLabels : ['لا توجد وقائع مسجلة'], datasets: [{ data: hasC ? cCounts : [1], backgroundColor: hasC ? pal : ['#e0e0e0'], borderWidth: 1 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 7.5 } } } } }
    }));
  }

  const ctxSpiApron = document.getElementById('grAvSpiApronChart')?.getContext('2d');
  if (ctxSpiApron) {
    let aCat = SPI_CONFIG_GR.find(c => c.category.includes('Taxiway & Apron'));
    let aLabels = aCat ? aCat.items.map(i => i.replace(/^Reported\s+/i, '')) : [];
    let aCounts = aCat ? aCat.items.map(i => ytdItemTotals[i] || 0) : [];
    let hasA = aCounts.some(v => v > 0);
    grChartInstances.push(new Chart(ctxSpiApron, {
      type: 'pie',
      data: { labels: hasA ? aLabels : ['لا توجد ملاحظات على الممرات'], datasets: [{ data: hasA ? aCounts : [1], backgroundColor: hasA ? ['#2980b9', '#3498db', '#1abc9c', '#16a085', '#27ae60', '#2ecc71', '#f39c12', '#e67e22', '#d35400', '#c0392b', '#8e44ad'] : ['#e0e0e0'], borderWidth: 1 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 7, font: { size: 7 } } } } }
    }));
  }

  const ctxSpiWf = document.getElementById('grAvSpiWfChart')?.getContext('2d');
  if (ctxSpiWf) {
    let g3 = [...((SPI_CONFIG_GR.find(c => c.category.includes('Runway Incursion')) || {}).items || []), ...((SPI_CONFIG_GR.find(c => c.category.includes('Bird / Wildlife')) || {}).items || []), ...((SPI_CONFIG_GR.find(c => c.category.includes('FOD')) || {}).items || [])];
    let g3L = g3.map(i => i.replace(/^Reported\s+/i, '').replace(/^Inspections in which\s+/i, ''));
    let g3C = g3.map(i => ytdItemTotals[i] || 0);
    let hasG3 = g3C.some(v => v > 0);
    grChartInstances.push(new Chart(ctxSpiWf, {
      type: 'doughnut',
      data: { labels: hasG3 ? g3L.filter((_, idx) => g3C[idx] > 0) : ['لا توجد ملاحظات مهبط/حياة برية'], datasets: [{ data: hasG3 ? g3C.filter(v => v > 0) : [1], backgroundColor: hasG3 ? ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6'] : ['#e0e0e0'], borderWidth: 1 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 7, font: { size: 7 } } } } }
    }));
  }

  const ctxSpiRep = document.getElementById('grAvSpiReportsChart')?.getContext('2d');
  if (ctxSpiRep) {
    let recTot = ytdItemTotals["Number of received safety reports"] || 0;
    let clsTot = ytdItemTotals["Number of closed safety reports"] || 0;
    let openTot = Math.max(0, recTot - clsTot);
    let ratioPct = recTot > 0 ? ((clsTot / recTot) * 100).toFixed(1) : "0.0";
    let hasRep = (recTot > 0 || clsTot > 0);
    grChartInstances.push(new Chart(ctxSpiRep, {
      type: 'doughnut',
      data: {
        labels: hasRep ? [`مغلقة (${clsTot}) - ${ratioPct}%`, `مفتوحة (${openTot})`] : ['لا توجد تقارير سلامة'],
        datasets: [{ data: hasRep ? [clsTot, openTot] : [1], backgroundColor: hasRep ? ['#28a745', '#dc3545'] : ['#e0e0e0'], borderWidth: 1 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 7.5 } } } } }
    }));
  }

  // 3. رسوم استبيان الطيارين (الصفحة 5)
  const ctxSA = document.getElementById('grAvSurveyAirChart')?.getContext('2d');
  if (ctxSA) {
    grChartInstances.push(new Chart(ctxSA, {
      type: 'bar',
      data: { labels: Object.keys(aC), datasets: [{ label: 'الاستبيانات', data: Object.values(aC), backgroundColor: '#003366', borderRadius: 4 }] },
      options: intTickOpts
    }));
  }

  const ctxSE = document.getElementById('grAvSurveyEvalChart')?.getContext('2d');
  if (ctxSE) {
    grChartInstances.push(new Chart(ctxSE, {
      type: 'doughnut',
      data: { labels: ['ممتاز', 'جيد', 'ضعيف', 'غير منطبق', 'فارغ'], datasets: [{ data: Object.values(eTC), backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'] }] },
      options: { responsive: true, maintainAspectRatio: false }
    }));
  }

  // 4. رسم الحماية المدنية (الصفحة 7)
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

  // 5. رسم السلامة والصحة المهنية (الصفحة 8)
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

  // 6. رسوم البيئة والحياة البرية (الصفحة 9)
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

function withDesktopReportWidth(el, fn) {
  const prevWidth = el.style.width;
  const prevMaxWidth = el.style.maxWidth;
  const prevMargin = el.style.margin;
  el.style.width = '820px';
  el.style.maxWidth = '820px';
  el.style.margin = '0 auto';
  return Promise.resolve().then(fn).finally(() => {
    el.style.width = prevWidth;
    el.style.maxWidth = prevMaxWidth;
    el.style.margin = prevMargin;
  });
}

async function exportGrPagesAsImages(btn) {
  const el = document.getElementById('printable-general-report');
  const pages = document.querySelectorAll('#printable-general-report .gr-page');
  if (!el || el.style.display === 'none' || !pages.length) {
    return alert("اضغط على (تجميع وإصدار التقرير الشهري المجمع) أولاً!");
  }
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تصدير الصور...'; }
  const mStr = document.getElementById('grMonth')?.value || 'Report';

  try {
    const renderedPages = await withDesktopReportWidth(el, async () => {
      const arr = [];
      for (let i = 0; i < pages.length; i++) {
        if (btn) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> صفحة ${i + 1} / ${pages.length}...`;
        const cvs = await html2canvas(pages[i], { scale: 1.8, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
        arr.push({
          canvas: cvs,
          filename: `General_Safety_Report_${mStr}_Page_${String(i + 1).padStart(2, '0')}.png`
        });
      }
      return arr;
    });
    if (typeof window.rmfExportMultiPages === 'function') {
      await window.rmfExportMultiPages(renderedPages, `التقرير الشهري المجمع (${mStr})`);
    }
    if (!window.isMobileAppOrDevice || !window.isMobileAppOrDevice()) {
      alert(`✅ تم تصدير جميع صفحات التقرير المجمع (${pages.length} صفحات) كصور PNG عالية الدقة بنجاح!`);
    }
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء تصدير الصور.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}

async function exportGrPDF(btn) {
  const el = document.getElementById('printable-general-report');
  const pages = document.querySelectorAll('#printable-general-report .gr-page');
  if (!el || el.style.display === 'none' || !pages.length) {
    return alert("اضغط على (تجميع وإصدار التقرير الشهري المجمع) أولاً!");
  }
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تجهيز ملف PDF...'; }
  const mStr = document.getElementById('grMonth')?.value || 'Report';

  try {
    await withDesktopReportWidth(el, async () => {
      const JsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      let pdf = null;
      if (JsPDFCtor) {
        pdf = new JsPDFCtor({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      } else {
        pdf = await html2pdf().set({ jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' } }).from(document.createElement('div')).toPdf().get('pdf');
      }

      const pdfW = 210;
      const pdfH = 297;
      const margin = 6;
      const maxW = pdfW - margin * 2;
      const maxH = pdfH - margin * 2;

      for (let i = 0; i < pages.length; i++) {
        if (btn) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> تجهيز PDF (${i + 1} / ${pages.length})...`;
        const cvs = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        const imgData = cvs.toDataURL('image/jpeg', 0.96);

        let imgW = maxW;
        let imgH = (cvs.height * imgW) / cvs.width;
        if (imgH > maxH) {
          imgH = maxH;
          imgW = (cvs.width * imgH) / cvs.height;
        }
        const x = (pdfW - imgW) / 2;
        const y = margin;

        if (i > 0) pdf.addPage('a4', 'portrait');
        pdf.addImage(imgData, 'JPEG', x, y, imgW, imgH, undefined, 'FAST');
      }

      if (typeof window.rmfExportJsPdfInstance === 'function') {
        await window.rmfExportJsPdfInstance(pdf, `General_Department_Monthly_Report_${mStr}.pdf`, `التقرير الشهري المجمع (${mStr})`);
      } else {
        pdf.save(`General_Department_Monthly_Report_${mStr}.pdf`);
      }
    });
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء إنشاء ملف PDF، يرجى المحاولة مرة أخرى.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}

async function sendGrViaEmail(btn) {
  const mStr = document.getElementById('grMonth')?.value;
  const el = document.getElementById('printable-general-report');
  if (!el || el.style.display === 'none') {
    return alert("اضغط على (تجميع وإصدار التقرير الشهري المجمع) أولاً!");
  }
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إرسال التقرير بالإيميل...'; }
  const mgrName = document.getElementById('grManagerName')?.value || 'محمد محمد مرسي';

  try {
    await withDesktopReportWidth(el, async () => {
      const cvs = await html2canvas(el, { scale: 1.4, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
      const imgData = cvs.toDataURL('image/jpeg', 0.85);
      await fetch(window.API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sendReportEmail',
          performedBy: mgrName,
          subject: `التقرير الشهري المجمع لإدارة السلامة والمطابقة - ${mStr}`,
          htmlBody: `<div dir="rtl" style="font-family:Arial,sans-serif;color:#333;"><h2>التقرير الشهري المجمع للإدارة العامة للسلامة والمطابقة - ${mStr}</h2><p>إعداد واعتماد: <b>${mgrName}</b> - مدير إدارة السلامة والمطابقة</p><img src="cid:monthlyReportImage" style="max-width:100%;border:1px solid #ddd;border-radius:8px;"></div>`,
          imageData: imgData,
          imageName: `General_Safety_Report_${mStr}.jpg`
        })
      });
    });
    alert("✅ تم إرسال التقرير الشهري المجمع بالإيميل بنجاح!");
  } catch (err) {
    console.error(err);
    alert("❌ تعذر إرسال الإيميل، يرجى التحقق من الاتصال.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}
