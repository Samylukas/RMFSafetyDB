/**
 * General Department of Safety and Compliance - Marsa Alam Airport
 * Main Application Logic (script.js)
 */

// =============================================================================
// 1. الثوابت والإعدادات العامة (Constants & Configurations)
// =============================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

// قائمة الـ 36 بنداً تشغيلياً لمؤشرات الأداء (SPI)
const SPI_CONFIG = [
  {
    category: "Post-crash fires",
    items: [
      "Airport firefighting services’ decreased (ICAO Airports firefighting categories)",
      "Reported inadequate equipment or resources (fire trucks, fire tools, etc.)",
      "Reported unqualified personnel (firefighters - Airport familiarization)",
      "Reported unqualified personnel (firefighters - Tactical training)"
    ]
  },
  {
    category: "Precursors to Runway Incursion (RI) (HRC)",
    items: [
      "Failures or defects regarding signage found during routine inspection affect operation",
      "Failures or defects regarding lighting found during routine inspection affect operation",
      "Reported traffic not comply with mandatory runway stop sign/ lights / markings",
      "Reported disturbed ground frequency between ATC & vehicles (Follow-me Cars)",
      "Unauthorized or uncoordinated movement of vehicles or personnel near runways"
    ]
  },
  {
    category: "Taxiway & Apron",
    items: [
      "Reported inadequate signage on TWY",
      "Reported inadequate signage on apron",
      "Reported inadequate lights on TWY",
      "Reported inadequate lights on apron",
      "Reported inadequate markings on TWY",
      "Reported inadequate markings on apron",
      "Reported lack of information signs",
      "Reported violating limited speed by vehicles on apron",
      "Reported walking across aprons",
      "Violations to low visibility procedures",
      "Unauthorized or uncoordinated movement of vehicles or personnel on aprons/ taxiways"
    ]
  },
  {
    category: "Airport Operation",
    items: [
      "Reported ground collision with equipment/ aircraft/ vehicle",
      "Reported airport ground equipment malfunctions",
      "Reported airport electricity malfunctions",
      "Reported failures of SMGCS “surface movement guidance and control systems”"
    ]
  },
  {
    category: "Bird / Wildlife",
    items: [
      "Reported birds strike",
      "Reported fencing openings",
      "Reported other defective protective devices",
      "Reported source of attraction such as (water, food, etc. ) in or around the airport",
      "Reported presence of weeds",
      "Observed birds /wildlife in or near airport"
    ]
  },
  {
    category: "Foreign object debris (FOD)",
    items: [
      "Inspections in which FOD was detected (RWY)",
      "Inspections in which FOD was detected ( Taxiway)",
      "Inspections in which FOD was detected(Apron)"
    ]
  },
  {
    category: "Emergency procedures",
    items: [
      "Carried out emergency procedures (fuel leak, engine fire, etc.)",
      "Delayed response to emergency (fuel leak, engine fire, etc.)"
    ]
  },
  {
    category: "Laser",
    items: [
      "Reported observed laser beam"
    ]
  }
];

// قائمة الفحص اليومية لمنطقة التحركات الجوية (ISO Format AS-F-01-01)
const dailyChecklistDataISO = {
  col1: { 
    title: "المناطق المرصوفة", 
    items: ["شروخ", "حفر(علي الأقل 5 بوصة عرض) (3بوصة عمق)", "هبوط", "تآكل", "مطاط", "نباتات", "أجسام غريبة FOD", "أخرى"], 
    title2: "المناطق الغير مرصوفة", 
    items2: ["غير مستوية", "نباتات", "عوائق", "أجسام غريبة FOD", "أخرى"], 
    title3: "المساعدات الملاحية", 
    items3: ["البيكون الدوار بالبرج لا يعمل", "كم الريح غير مطابق", "PAPI غير مطابق", "السارينة لاتعمل", "لمبات العوائق غير مضاءة", "أخرى"] 
  },
  col2: { 
    title: "التخطيط (Marking)", 
    items: ["غير مطابق / واضح والمدرج RWY", "محور المدرج مغطي بالمطاط", "غير مطابق / واضح في Holding Position", "غير مطابق / واضح في الـ TXY", "غير مطابق / واضح في الترمك"], 
    title2: "اللافتات الإرشادية", 
    items2: ["غير مطابقة .", "غير مضاءة", "محجوبة بواسطة النباتات.", "قاعدتها الخرسانية أعلي من مستوي الأرض", "القواعد الغير قابلة للكسر.", "أخرى"], 
    title3: "الإنارة", 
    items3: ["لمبات مكسورة/ تالفة علي المدرج RWY", "لمبات مكسورة/ تالفة علي الممرات TXY", "لمبات مكسورة/ تالفة على الترمك", "إنارة وحدات Floodlight غير مطابقة أو أقل من (20لاكس)", "اللمبات الغاطسة غير مضاءة", "لمبات وحدات الإقتراب غير مطابقة", "لمبات العوائق غير مضاءة", "لمبات مكسورة / تالفة لإنارة الطرق الخدمية داخل Airside", "أخرى"] 
  },
  col3: { 
    title: "عملية تموين الوقود", 
    items: ["وقوف غير سليم علي الطائرة", "الهروب السريع غير متوفر", "النظام الإطفائي غير مكتمل", "DEAD MAN غير مستعمل", "سلك التأريض غير موصل", "زر الطوارئ لايعمل", "عدد المشغلين غير كاف", "المشغل لا يرتدي مهمات السلامة", "أختبار العينة لا يتم إجراؤه", "منطقة العمل غير محددة", "حساسات المصعد لا تعمل", "ملصقات عدم التدخين والـ Jet A", "الـ Clear Exit غير متوفرة للسيارة", "البيكون لا يعمل", "السائبة العامة للسيارة غير لائقة", "عدم توافر المواد الماصة للوقود.", "إستخدام تليفون محمول في حدود 15 م أثناء التموين.", "أخرى"], 
    title2: "أخطار الحياة البرية", 
    items2: ["مشاهدة حيوانات برية / طيور مقيمة / نافقة", "وجود مصادر جذب للحياة البرية", "أخرى"] 
  },
  col4: { 
    title: "التحركات الأرضية ووقوف وإيواء الطائرات ومناولة الحقائب", 
    items: ["سائق المعدة لا يحمل تصريح قيادة على المهبط", "رخصة المعدة غير متوفرة.", "عدم الإلتزام بالسرعات المقررة", "عدم إستخدام طريق الخدمة .", "إستخدام أكثر من 3 مقطورة أثناء الخدمة", "عدم تجميع الـ FOD الناتج من تحميل الحقائب", "إرتفاع الحقائب يتعدي 3 صفوف", "الأقماع غير موضوعة علي حدود الطائرة", "المعدة الأرضية غير مجهزة بليكون.", "المعدة الأرضية غير مطابقة .", "طفايات الحريق غير سارية.", "عملية الدفع للخلف تتم بسرعة غير مناسبة", "عدم إتباع تعليمات سلامة التحركات علي المهبط", "وجود أشخاص غير مصرح لهم.", "وجود معدات غير مصرح بها.", "عدم إرتداء مهمات الوقاية الشخصية", "أخرى"], 
    title2: "الإنقاذ والإطفاء", 
    items2: ["عدم صلاحية الإتصالات", "عدم الإستجابة السريعة للأفراد.", "نقص في عدد مشغلي سيارة الإطفاء", "أخرى"] 
  }
};

// بنود تقييم استبيان الكابتن (Captain Survey)
const criteriaList = [
  "Communication Tower", "Communication Ground", "VOR-DME", "RNP APR 33_15", 
  "Aeronautical Beacon", "Approach Lighting System", "PAPI System", "Wind Cone", 
  "Apron Marking", "Apron Lighting", "Apron Signs", "APRON Stands Size", 
  "G.H Performance", "Fuelling Performance", "Marshall Services", "RFF Team performance", 
  "Runway Marking", "Runway Lighting", "Runway Signs", "RWY Brakes Action", 
  "RWY Evaluating Pavement", "Taxi Way Marking", "Taxi Way Lighting", "Taxi Way Signs", 
  "TWY Brakes Action", "TWY Evaluating Pavement", "Stop Bars", "Weather", 
  "Wildlife", "Bird Strike", "FOD"
];

// الجهات المسؤولة
const responsibleDepts = ["العمليات", "الهندسة المدنية", "الهندسة الكهربية", "الإنقاذ والإطفاء", "شركات الطيران / الوكالات", "الإرشاد", "أخرى"];

// مواقع جمع الأجسام الغريبة FOD
const fodLocations = [
  { loc: "Aircraft Stands Area", area: "53.125 M²" },
  { loc: "GSE Area", area: "4152 M²" },
  { loc: "Arrival & Departures Gates", area: "2420 M²" },
  { loc: "Around Aprons Gas station", area: "2539 M²" }
];

// =============================================================================
// 2. الحالة العامة للبيانات (Global State Variables)
// =============================================================================
var globalFleetData = [];
var globalSurveys = [];
var globalUsers = [];
var globalDailyInspections = [];
var globalIncidents = [];
var globalFod = [];
var globalSpiData = [];
var globalQuarterlyDocs = { ground: [], fuel: [] };
window.globalIncidents = globalIncidents;
window.globalSpiRecords = window.globalSpiRecords || {};

// مؤشرات التعديل والتنقل
let currentSurveyIndex = -1;
let currentDailyIndex = -1;
let currentIncidentIndex = -1;
let isSurveyEditMode = false;
let currentSurveyEditId = null;
let isDailyEditMode = false;
let currentDailyEditId = null;
let currentIncidentEditId = null;
let currentLoggedInUser = null;
let genericBackTarget = 'main-dashboard';

// كائنات الشارتس
let chartInstances = {};
let monthlyChart1 = null;
let monthlyChart2 = null;
let mrSurveyAirChartInstance = null;
let mrSurveyEvalChartInstance = null;

// المتغيرات الخاصة بجدول الرحلات
window.currentScheduleData = window.currentScheduleData || { english: null, arabic: null };
window.currentActiveDoc = null;
window.currentPdfBlobUrl = null;

// عداد الدخول السري للوحة الإدارة
let logoTripleClickCounter = 0;
let logoTripleClickTimer = null;

// =============================================================================
// 3. البداية والتحميل (Initialization & Auth)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  buildDailyChecklist();
  buildEvaluationForm();
  setupCustomDropdown();
  loadAppDataInit();
  startSplashScreen();

  // ضبط التواريخ التلقائية لتكون تاريخ اليوم الحالي
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('isoReportDate') && !document.getElementById('isoReportDate').value) {
    document.getElementById('isoReportDate').value = today;
  }
  if (document.getElementById('dailyDate') && !document.getElementById('dailyDate').value) {
    document.getElementById('dailyDate').value = today;
  }
});

function handleLogoTripleClick() {
  logoTripleClickCounter++;
  if (logoTripleClickCounter === 1) {
    logoTripleClickTimer = setTimeout(() => { logoTripleClickCounter = 0; }, 900);
  } else if (logoTripleClickCounter === 3) {
    clearTimeout(logoTripleClickTimer);
    logoTripleClickCounter = 0;
    openAdminSection('account-management-section');
  }
}

function startSplashScreen() {
  const vSplash = document.getElementById('video-splash-screen');
  const video = document.getElementById('introVideo');
  if (!vSplash) return showLoginScreen();
  if (video) {
    video.play().catch(() => {});
    video.onended = endVideoSplash;
  }
  setTimeout(endVideoSplash, 10000);
}

function endVideoSplash() {
  const vSplash = document.getElementById('video-splash-screen');
  if (!vSplash || vSplash.style.display === 'none') return;
  vSplash.style.opacity = '0';
  setTimeout(() => {
    vSplash.style.display = 'none';
    showLoginScreen();
  }, 800);
}

function showLoginScreen() {
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.style.display = 'flex';
  const passInp = document.getElementById('loginPass');
  if (passInp) passInp.focus();
}

function login() {
  const u = (document.getElementById('loginUser')?.value || '').trim();
  const p = (document.getElementById('loginPass')?.value || '').trim();
  const err = document.getElementById('loginError');

  let foundUser = globalUsers.find(user => user.Username === u && String(user.Password) === p);

  // مستخدمين افتراضيين للطوارئ
  if (!foundUser) {
    if (u.toLowerCase() === 'admin' && p === '1234') foundUser = { Role: 'Admin', Username: 'Admin' };
    else if ((u.toLowerCase() === 'safety' || u === 'سلامة المطارات') && p === '1234') foundUser = { Role: 'Airport Safety', Username: u };
    else if ((u.toLowerCase() === 'osh' || u === 'السلامة والصحة المهنية') && p === '1234') foundUser = { Role: 'OSH', Username: u };
    else if ((u.toLowerCase() === 'env' || u === 'البيئة والحياة البرية') && p === '1234') foundUser = { Role: 'Environment', Username: u };
    else if ((u.toLowerCase() === 'fire' || u === 'الحماية المدنية') && p === '1234') foundUser = { Role: 'Civil Defense', Username: u };
    else if (globalUsers.length === 0 && p === '1234') foundUser = { Role: 'Admin', Username: u };
  }

  if (foundUser) {
    currentLoggedInUser = foundUser;
    const lS = document.getElementById('login-screen');
    if (lS) lS.style.display = 'none';
    const hdr = document.getElementById('app-header');
    if (hdr) hdr.style.display = 'flex';
    if (err) err.style.display = 'none';

    const bBtn = document.getElementById('backToMainBtn');
    const r = (foundUser.Role || '').toLowerCase();

    if (r.includes('admin')) {
      if (bBtn) bBtn.style.display = 'inline-block';
      openSection('main-dashboard');
    } else if (r.includes('safety') || r.includes('مطارات')) {
      if (bBtn) bBtn.style.display = 'none';
      openSection('airport-safety-dashboard');
    } else if (r.includes('osh') || r.includes('صحة') || r.includes('مهنية')) {
      openGenericDoc('السلامة والصحة المهنية', 'main-dashboard');
    } else if (r.includes('env') || r.includes('بيئة') || r.includes('برية')) {
      openGenericDoc('البيئة والحياة البرية', 'main-dashboard');
    } else if (r.includes('fire') || r.includes('حماية') || r.includes('مدنية')) {
      openGenericDoc('الحماية المدنية', 'main-dashboard');
    } else {
      if (bBtn) bBtn.style.display = 'inline-block';
      openSection('main-dashboard');
    }
  } else {
    if (err) err.style.display = 'block';
    const pInp = document.getElementById('loginPass');
    if (pInp) { pInp.value = ''; pInp.focus(); }
  }
}

function logout() {
  currentLoggedInUser = null;
  document.querySelectorAll('.content-area').forEach(el => el.style.display = 'none');
  const hdr = document.getElementById('app-header');
  if (hdr) hdr.style.display = 'none';
  const pInp = document.getElementById('loginPass');
  if (pInp) pInp.value = '';
  const lS = document.getElementById('login-screen');
  if (lS) lS.style.display = 'flex';
}

function toggleLoginPassword() {
  const p = document.getElementById('loginPass');
  const i = document.getElementById('passToggleIcon');
  if (!p || !i) return;
  p.type = p.type === 'password' ? 'text' : 'password';
  i.classList.toggle('fa-eye');
  i.classList.toggle('fa-eye-slash');
}

function openSection(sId) {
  document.querySelectorAll('.content-area').forEach(el => el.style.display = 'none');
  const t = document.getElementById(sId);
  if (t) {
    t.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function openAdminSection(sId) { openSection(sId); }
function openGenericDoc(t, bT) {
  genericBackTarget = bT || 'main-dashboard';
  const el = document.getElementById('generic-doc-title');
  if (el) el.innerText = t;
  openSection('generic-doc-section');
}
function goBackFromGenericDoc() { openSection(genericBackTarget || 'main-dashboard'); }
function goBackToDashboard() {
  if (currentLoggedInUser && (currentLoggedInUser.Role || '').toLowerCase().includes('safety')) {
    openSection('airport-safety-dashboard');
  } else if (document.getElementById('airport-safety-dashboard') && document.getElementById('airport-safety-dashboard').style.display !== 'none') {
    openSection('airport-safety-dashboard');
  } else {
    openSection('main-dashboard');
  }
}

// =============================================================================
// 4. الاتصال بالسيرفر وجلب البيانات العامة (API / JSONP Loading)
// =============================================================================
function safePost(payload, btn, msgEl, successMsg, callback) {
  if (btn) {
    btn.disabled = true;
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
  }
  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }).then(() => {
    if (msgEl) {
      msgEl.innerText = successMsg || 'تم الحفظ بنجاح!';
      msgEl.style.color = '#28a745';
      msgEl.style.display = 'block';
      setTimeout(() => msgEl.style.display = 'none', 3000);
    }
    if (callback) callback();
  }).catch(err => {
    console.error(err);
    if (msgEl) {
      msgEl.innerText = 'حدث خطأ في الاتصال!';
      msgEl.style.color = '#dc3545';
      msgEl.style.display = 'block';
    }
  }).finally(() => {
    if (btn) {
      btn.disabled = false;
      if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
    }
  });
}

function loadAppDataInit() {
  // استرجاع الكاش المحلي مؤقتاً لسرعة التحميل
  try {
    const cInc = localStorage.getItem('rmf_incidents');
    if (cInc) {
      const p = JSON.parse(cInc);
      if (Array.isArray(p) && p.length > 0) {
        globalIncidents = p;
        window.globalIncidents = p;
        sortIncidentsByDate();
        renderSavedIncidents();
        updateIncidentNavCounter();
      }
    }
    const cQ = localStorage.getItem('rmf_quarterly_docs');
    if (cQ) globalQuarterlyDocs = JSON.parse(cQ);
  } catch (e) {}

  const cb = 'jsonpInit_' + Math.round(100000 * Math.random());
  window[cb] = function (d) {
    try {
      if (d && d.status === "success") {
        globalFleetData = d.fleet ? d.fleet.reverse() : [];
        globalSurveys = d.surveys ? d.surveys.reverse() : [];
        globalUsers = d.users || [];
        if (d.incidents && Array.isArray(d.incidents) && d.incidents.length > 0) {
          globalIncidents = d.incidents;
          window.globalIncidents = d.incidents;
          try { localStorage.setItem('rmf_incidents', JSON.stringify(globalIncidents)); } catch (e) {}
        }
        globalFod = d.fod || [];
        globalSpiData = d.spi || [];

        if (d.quarterly && Array.isArray(d.quarterly) && d.quarterly.length > 0) {
          let qObj = { ground: [], fuel: [] };
          d.quarterly.forEach(row => {
            let cT = (row.Company_Type || '').toLowerCase();
            let dItem = { date: row.Date, quarter: row.Quarter, inspector: row.Inspector, name: row.File_Name, url: row.File_URL };
            if (cT.includes('fuel')) qObj.fuel.push(dItem);
            else qObj.ground.push(dItem);
          });
          globalQuarterlyDocs = qObj;
          try { localStorage.setItem('rmf_quarterly_docs', JSON.stringify(globalQuarterlyDocs)); } catch (e) {}
        }

        sortIncidentsByDate();

        if (d.daily && d.daily.length > 0) {
          let rMap = {};
          d.daily.forEach(row => {
            let repId = row.Report_ID;
            let timeStr = row.Time;
            if (timeStr && typeof timeStr === 'string' && timeStr.includes('T')) {
              let dt = new Date(timeStr);
              if (!isNaN(dt)) timeStr = dt.toISOString().substring(11, 16);
            }
            if (!rMap[repId]) {
              rMap[repId] = {
                id: repId,
                date: row.Date ? new Date(row.Date).toISOString().split('T')[0] : '',
                time: timeStr,
                shift: row.Shift,
                inspector: row.Inspector,
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
                note: row.Corrective_Action || "",
                status: isCl ? 'مغلق' : 'مفتوح',
                Status: isCl ? 'مغلق' : 'مفتوح'
              });
            }
          });
          globalDailyInspections = Object.values(rMap).sort((a, b) => b.id - a.id);
        }

        populateUsersDropdown(globalUsers);
        updateSurveyNavCounter();
        renderSavedDaily();
        renderSavedIncidents();
        updateDailyNavCounter();
        updateIncidentNavCounter();
        populateFilterSelect('incFilterCar', globalIncidents, 'CAR', 'car');
        populateFilterSelect('incFilterReg', globalIncidents, 'REG', 'reg');
        populateFilterSelect('surveyFilterAirline', globalSurveys, 'CAR', 'car');
        populateFilterSelect('surveyFilterReg', globalSurveys, 'REG', 'reg');
      }
    } catch (e) {
      console.error(e);
    } finally {
      delete window[cb];
    }
  };

  const s = document.createElement('script');
  s.src = API_URL + "?action=getAppData&_t=" + Date.now() + "&callback=" + cb;
  document.body.appendChild(s);
}

function populateFilterSelect(elId, dataArray, key1, key2) {
  const el = document.getElementById(elId);
  if (!el || !dataArray) return;
  let vals = new Set();
  dataArray.forEach(item => {
    let v = (item[key1] || item[key2] || '').toString().trim();
    if (v && v !== '-') vals.add(v);
  });
  el.innerHTML = '<option value="ALL">الكل</option>';
  Array.from(vals).sort().forEach(v => {
    el.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

// =============================================================================
// 5. قسم جدول الرحلات اليومي (Flight Schedule Module)
// =============================================================================
function openFlightSchedule() {
  openSection('flight-schedule-section');
  loadFlightScheduleData();
}

async function loadFlightScheduleData() {
  const info = document.getElementById('schedule-info');
  const container = document.getElementById('pdf-viewer-container');
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استدعاء الجدول...';
  }
  if (info) info.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري سحب أحدث ملف PDF من الإيميل...';
  if (container) container.style.display = 'none';

  try {
    let res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "fetchFlightSchedule" }),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });
    let data = await res.json();

    if (data.status === "success") {
      window.currentScheduleData.english = data.english || null;
      window.currentScheduleData.arabic = data.arabic || null;
      let activeDoc = window.currentScheduleData.arabic || window.currentScheduleData.english;

      if (!activeDoc || !activeDoc.pdfBase64) {
        if (info) info.innerHTML = '❌ تم العثور على الإيميل ولكن تعذر استخراج ملف PDF.';
        return;
      }

      let fileDate = new Date(data.date).toLocaleString('ar-EG');
      let toggleBtns = '';
      if (window.currentScheduleData.arabic && window.currentScheduleData.english) {
        toggleBtns = '<div style="margin-top:10px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">' +
          '<button type="button" id="sch-btn-ar" onclick="switchScheduleLang(\'arabic\')" style="background:#003366; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; font-family:Cairo,sans-serif;"><i class="fa-solid fa-language"></i> الجدول العربي</button>' +
          '<button type="button" id="sch-btn-en" onclick="switchScheduleLang(\'english\')" style="background:#6c757d; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; font-family:Cairo,sans-serif;"><i class="fa-solid fa-plane"></i> English Schedule</button>' +
          '</div>';
      }

      let openExternalBtn = '<div style="margin-top:10px; text-align:center;">' +
        '<button type="button" onclick="openPdfInExternalViewer()" style="background:#28a745; color:#fff; border:none; padding:8px 18px; border-radius:6px; font-weight:bold; cursor:pointer; font-family:Cairo,sans-serif; font-size:0.9rem; box-shadow:0 3px 8px rgba(40,167,69,0.3);">' +
        '<i class="fa-solid fa-file-arrow-down"></i> فتح في قارئ الهاتف / تحميل PDF</button></div>';

      if (info) {
        info.innerHTML = '✅ تم سحب أحدث جدول بنجاح<br><span style="font-size:0.85rem; color:#555;">اسم الملف: <b id="sch-active-filename">' + activeDoc.fileName + '</b> | وقت الإرسال: ' + fileDate + '</span>' + toggleBtns + openExternalBtn;
      }

      if (container) container.style.display = 'block';
      await renderPdfSmart(activeDoc);
    } else {
      if (info) info.innerHTML = '❌ عذراً: ' + data.message;
    }
  } catch (err) {
    console.error(err);
    if (info) info.innerHTML = '❌ حدث خطأ في الاتصال بخادم الإيميل.';
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> تحديث الجدول الآن';
    }
  }
}

async function switchScheduleLang(lang) {
  if (!window.currentScheduleData) return;
  const targetDoc = window.currentScheduleData[lang];
  if (!targetDoc || !targetDoc.pdfBase64) {
    return alert(lang === 'arabic' ? 'النسخة العربية غير متوفرة في هذا الإيميل!' : 'النسخة الإنجليزية (RMF Weekly Schedule) غير متوفرة!');
  }

  const btnAr = document.getElementById('sch-btn-ar');
  const btnEn = document.getElementById('sch-btn-en');
  const activeFileNameEl = document.getElementById('sch-active-filename');

  if (activeFileNameEl && targetDoc.fileName) activeFileNameEl.innerText = targetDoc.fileName;

  if (btnAr && btnEn) {
    if (lang === 'arabic') {
      btnAr.style.backgroundColor = '#003366';
      btnEn.style.backgroundColor = '#6c757d';
    } else {
      btnEn.style.backgroundColor = '#003366';
      btnAr.style.backgroundColor = '#6c757d';
    }
  }
  await renderPdfSmart(targetDoc);
}

async function renderPdfSmart(targetDoc) {
  window.currentActiveDoc = targetDoc;
  const container = document.getElementById('pdf-viewer-container');
  const iframe = document.getElementById('schedule-iframe');
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const binaryStr = atob(targetDoc.pdfBase64);
  const byteNumbers = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    byteNumbers[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  window.currentPdfBlobUrl = blobUrl;
  window.currentPdfFileName = targetDoc.fileName || 'Flight_Schedule.pdf';

  if (!isMobile && iframe) {
    iframe.style.display = 'block';
    let oldCanvasBox = document.getElementById('pdf-canvas-viewer');
    if (oldCanvasBox) oldCanvasBox.style.display = 'none';
    iframe.src = blobUrl;
  } else {
    if (iframe) iframe.style.display = 'none';
    let canvasBox = document.getElementById('pdf-canvas-viewer');
    if (!canvasBox) {
      canvasBox = document.createElement('div');
      canvasBox.id = 'pdf-canvas-viewer';
      canvasBox.style.cssText = 'width:100%;height:100%;overflow-y:auto;padding:8px;box-sizing:border-box;background:#525659;text-align:center;-webkit-overflow-scrolling:touch;';
      container.appendChild(canvasBox);
    }
    canvasBox.style.display = 'block';
    canvasBox.innerHTML = '<div style="color:#fff;padding:25px;font-weight:bold;font-family:Cairo,sans-serif;"><i class="fa-solid fa-spinner fa-spin"></i> جاري إعداد صفحات الجدول للموبايل...</div>';

    try {
      if (typeof pdfjsLib === 'undefined') {
        await new Promise((resolve, reject) => {
          let s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      }

      const pdf = await pdfjsLib.getDocument({ data: byteNumbers }).promise;
      canvasBox.innerHTML = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        canvas.style.marginBottom = '12px';
        canvas.style.borderRadius = '6px';
        canvas.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)';
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvasBox.appendChild(canvas);

        await page.render({
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        }).promise;
      }
    } catch (err) {
      console.error('PDF.js render error:', err);
      canvasBox.innerHTML = '<div style="color:#fff;padding:20px;font-family:Cairo,sans-serif;"><p style="color:#ffcccc;">لم يتمكن الهاتف من عرض الملف داخلياً.</p><button type="button" onclick="openPdfInExternalViewer()" style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:bold;cursor:pointer;font-family:Cairo,sans-serif;"><i class="fa-solid fa-arrow-up-right-from-square"></i> اضغط هنا لفتح الجدول في تطبيق الهاتف</button></div>';
    }
  }
}

function openPdfInExternalViewer() {
  if (!window.currentPdfBlobUrl) return alert('يرجى الانتظار حتى اكتمال جلب الملف.');
  const a = document.createElement('a');
  a.href = window.currentPdfBlobUrl;
  a.download = window.currentPdfFileName || 'Flight_Schedule.pdf';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { document.body.removeChild(a); } catch (e) {}
  }, 1000);
}

// =============================================================================
// 6. قسم حركة الطائرات ومؤشرات الأداء (Movements & SPIs Module)
// =============================================================================
function populateSpiYears() {
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  const selMain = document.getElementById('spiReportYear');
  const selComp = document.getElementById('spiCompareYear');
  const selEntry = document.getElementById('spiYear');

  if (selEntry && selEntry.options.length <= 1) {
    const curE = selEntry.value || '2026';
    selEntry.innerHTML = '';
    years.forEach(y => {
      const o = document.createElement('option');
      o.value = y;
      o.text = y;
      if (String(y) === String(curE)) o.selected = true;
      selEntry.appendChild(o);
    });
  }
  if (selMain && selMain.options.length <= 1) {
    const curM = selMain.value || '2026';
    selMain.innerHTML = '';
    years.forEach(y => {
      const o = document.createElement('option');
      o.value = y;
      o.text = y;
      if (String(y) === String(curM)) o.selected = true;
      selMain.appendChild(o);
    });
  }
  if (selComp && selComp.options.length <= 1) {
    const curC = selComp.value || 'none';
    selComp.innerHTML = '<option value="none">-- بدون مقارنة --</option>';
    years.forEach(y => {
      const o = document.createElement('option');
      o.value = y;
      o.text = y;
      if (String(y) === String(curC)) o.selected = true;
      selComp.appendChild(o);
    });
  }
}

function renderSpiDynamicInputs() {
  populateSpiYears();
  const box = document.getElementById('spi-dynamic-inputs');
  if (!box) return;

  const year = document.getElementById('spiYear')?.value || '2026';
  const month = Number(document.getElementById('spiMonth')?.value || '1');
  const rec = (window.globalSpiRecords && window.globalSpiRecords[year]) ? window.globalSpiRecords[year] : { movements: {}, events: {} };

  if (document.getElementById('spiMovements') && rec.movements && rec.movements[month]) {
    document.getElementById('spiMovements').value = rec.movements[month];
  }

  let h = '<div style="margin-top:20px;"><h3 style="color:#003366;text-align:center;margin-bottom:15px;font-family:Cairo,sans-serif;">إدخال وتحديث البنود التشغيلية (Safety Issues / SPIs)</h3>';
  SPI_CONFIG.forEach((catObj, cIdx) => {
    h += `<div style="background:#fff;border:1px solid #17a2b8;border-radius:8px;margin-bottom:15px;overflow:hidden;">
            <div style="background:#003366;color:#fff;padding:10px 15px;font-weight:bold;font-size:0.95rem;display:flex;justify-content:space-between;align-items:center;">
              <span>*${catObj.category}</span>
              <span style="font-size:0.8rem;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:12px;">${catObj.items.length} بنود</span>
            </div>
            <div style="padding:15px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;background:#fbfcfe;">`;
    catObj.items.forEach((itm, iIdx) => {
      let id = `spi_inp_${cIdx}_${iIdx}`;
      let val = (rec.events && rec.events[itm] && rec.events[itm][month]) ? rec.events[itm][month] : 0;
      h += `<div style="display:flex;flex-direction:column;gap:4px;border-bottom:1px dashed #e0e0e0;padding-bottom:8px;">
              <label for="${id}" style="font-size:0.85rem;color:#333;font-weight:600;direction:ltr;text-align:left;">${itm}</label>
              <input type="number" min="0" value="${val}" id="${id}" data-item="${itm.replace(/"/g, '&quot;')}" style="width:100%;max-width:120px;padding:6px;border:1px solid #ccc;border-radius:4px;font-weight:bold;text-align:center;">
            </div>`;
    });
    h += '</div></div>';
  });
  box.innerHTML = h + '</div>';
}

async function submitSPI(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('submitSpiBtn');
  const year = document.getElementById('spiYear')?.value || '2026';
  const month = Number(document.getElementById('spiMonth')?.value || '1');
  const movements = Number(document.getElementById('spiMovements')?.value || 0);

  if (!movements || movements <= 0) return alert('يرجى إدخال حركة الطائرات الإجمالية للشهر!');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ في الشيت...';
  }

  window.globalSpiRecords = window.globalSpiRecords || {};
  window.globalSpiRecords[year] = window.globalSpiRecords[year] || { movements: {}, events: {} };
  window.globalSpiRecords[year].movements[month] = movements;

  document.querySelectorAll('#spi-dynamic-inputs input[type="number"]').forEach(inp => {
    let itm = inp.getAttribute('data-item');
    let val = Number(inp.value || 0);
    if (itm) {
      window.globalSpiRecords[year].events[itm] = window.globalSpiRecords[year].events[itm] || {};
      window.globalSpiRecords[year].events[itm][month] = val;
    }
  });

  try {
    if (typeof API_URL !== 'undefined') {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'submitSPI',
          year: year,
          month: month,
          movements: movements,
          spiData: window.globalSpiRecords[year]
        })
      });
    }
  } catch (err) {
    console.error(err);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الشهر';
  }
  alert('✅ تم حفظ البيانات بنجاح وتحديث خلايا الشيت!');
  switchSpiTab('report');
}

function switchSpiTab(tab) {
  const bE = document.getElementById('btn-spi-entry');
  const bR = document.getElementById('btn-spi-report');
  const tE = document.getElementById('tab-spi-entry');
  const tR = document.getElementById('tab-spi-report');

  if (tab === 'entry') {
    bE?.classList.add('active');
    bR?.classList.remove('active');
    tE?.classList.add('active');
    tR?.classList.remove('active');
    renderSpiDynamicInputs();
  } else {
    bR?.classList.add('active');
    bE?.classList.remove('active');
    tR?.classList.add('active');
    tE?.classList.remove('active');
    generateSpiReport();
  }
}

async function generateSpiReport() {
  populateSpiYears();
  const yMain = document.getElementById('spiReportYear')?.value || '2026';
  const yComp = document.getElementById('spiCompareYear')?.value || 'none';
  const isCompare = (yComp !== 'none' && yComp !== yMain);
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استدعاء البيانات...';
  }

  async function fetchYearData(y) {
    if (!y || y === 'none') return { movements: {}, events: {} };
    try {
      if (typeof API_URL !== 'undefined') {
        let res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: "getSPIData", year: String(y) })
        });
        let json = await res.json();
        if (json.status === "success" && json.data) {
          window.globalSpiRecords = window.globalSpiRecords || {};
          window.globalSpiRecords[y] = json.data;
          try { localStorage.setItem('spi_records_' + y, JSON.stringify(json.data)); } catch (e) {}
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Fallback to local for year ' + y, err);
    }
    return (window.globalSpiRecords && window.globalSpiRecords[y]) ? window.globalSpiRecords[y] : { movements: {}, events: {} };
  }

  let dataMain = await fetchYearData(yMain);
  let dataComp = isCompare ? await fetchYearData(yComp) : { movements: {}, events: {} };

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-code-compare"></i> تحديث وعرض المقارنة';
  }

  const mNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const movMain = mNames.map((_, i) => (dataMain?.movements && dataMain.movements[i + 1]) ? Number(dataMain.movements[i + 1]) : 0);
  const movComp = isCompare ? mNames.map((_, i) => (dataComp?.movements && dataComp.movements[i + 1]) ? Number(dataComp.movements[i + 1]) : 0) : [];
  const totMovMain = movMain.reduce((a, b) => a + b, 0);
  const totMovComp = isCompare ? movComp.reduce((a, b) => a + b, 0) : 0;

  // 1. رسم منحنى التحركات الجوية
  const trendCtx = document.getElementById('spiTrendChart')?.getContext('2d');
  if (trendCtx) {
    if (window.spiTrendChartInstance) window.spiTrendChartInstance.destroy();
    let datasets = [{
      label: 'Movements (' + yMain + ')',
      data: movMain,
      borderColor: '#28a745',
      backgroundColor: 'rgba(40,167,69,0.12)',
      borderWidth: 2.5,
      pointBackgroundColor: '#28a745',
      pointBorderColor: '#fff',
      pointRadius: 4,
      tension: 0.35,
      fill: true
    }];
    if (isCompare) {
      datasets.push({
        label: 'Movements (' + yComp + ')',
        data: movComp,
        borderColor: '#003366',
        backgroundColor: 'rgba(0,51,102,0.06)',
        borderWidth: 2.5,
        borderDash: [5, 5],
        pointBackgroundColor: '#003366',
        pointBorderColor: '#fff',
        pointRadius: 4,
        tension: 0.35,
        fill: true
      });
    }
    window.spiTrendChartInstance = new Chart(trendCtx, {
      type: 'line',
      data: { labels: mNames, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { family: 'Cairo,sans-serif', weight: 'bold' } } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
          x: { grid: { color: '#f9f9f9' } }
        }
      }
    });
  }

  // حساب إجماليات التصنيفات والبنود
  const catTotalsMain = {}, catTotalsComp = {}, itemTotalsMain = {}, itemTotalsComp = {};
  SPI_CONFIG.forEach(cO => {
    let cSumM = 0, cSumC = 0;
    cO.items.forEach(itm => {
      let itmSumM = 0, itmSumC = 0;
      for (let m = 1; m <= 12; m++) {
        itmSumM += ((dataMain?.events && dataMain.events[itm] && dataMain.events[itm][m]) ? Number(dataMain.events[itm][m]) : 0);
        if (isCompare) {
          itmSumC += ((dataComp?.events && dataComp.events[itm] && dataComp.events[itm][m]) ? Number(dataComp.events[itm][m]) : 0);
        }
      }
      itemTotalsMain[itm] = itmSumM;
      itemTotalsComp[itm] = itmSumC;
      cSumM += itmSumM;
      cSumC += itmSumC;
    });
    catTotalsMain[cO.category] = cSumM;
    catTotalsComp[cO.category] = cSumC;
  });

  const pal = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#34495e'];

  // 2. خريطة التوزيع الإجمالي لجميع التصنيفات
  const catCtx = document.getElementById('spiCategoryPieChart')?.getContext('2d');
  if (catCtx) {
    if (window.spiCategoryPieChartInstance) window.spiCategoryPieChartInstance.destroy();
    let cLabels = SPI_CONFIG.map(c => c.category);
    let cCounts = SPI_CONFIG.map(c => catTotalsMain[c.category] || 0);
    let hasC = cCounts.some(v => v > 0);
    window.spiCategoryPieChartInstance = new Chart(catCtx, {
      type: 'doughnut',
      data: {
        labels: hasC ? cLabels : ['لا توجد وقائع مسجلة'],
        datasets: [{ data: hasC ? cCounts : [1], backgroundColor: hasC ? pal : ['#e0e0e0'], borderWidth: 1.5 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'Cairo,sans-serif', size: 9 } } } }
      }
    });
  }

  // 3. خريطة مؤشرات الممرات والساحة Taxiway & Apron
  const apronCtx = document.getElementById('spiApronPieChart')?.getContext('2d');
  if (apronCtx) {
    if (window.spiApronPieChartInstance) window.spiApronPieChartInstance.destroy();
    let aCat = SPI_CONFIG.find(c => c.category.includes('Taxiway & Apron'));
    let aLabels = aCat ? aCat.items.map(i => i.replace(/^Reported\s+/i, '')) : [];
    let aCounts = aCat ? aCat.items.map(i => itemTotalsMain[i] || 0) : [];
    let hasA = aCounts.some(v => v > 0);
    window.spiApronPieChartInstance = new Chart(apronCtx, {
      type: 'pie',
      data: {
        labels: hasA ? aLabels : ['لا توجد ملاحظات على الممرات والساحة'],
        datasets: [{
          data: hasA ? aCounts : [1],
          backgroundColor: hasA ? ['#2980b9', '#3498db', '#1abc9c', '#16a085', '#27ae60', '#2ecc71', '#f39c12', '#e67e22', '#d35400', '#c0392b', '#8e44ad'] : ['#e0e0e0'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, font: { family: 'Cairo,sans-serif', size: 8.5 } } } }
      }
    });
  }

  // 4. خريطة مؤشرات الحياة البرية والأجسام الغريبة والمهبط
  const wfCtx = document.getElementById('spiWildlifeFodPieChart')?.getContext('2d');
  if (wfCtx) {
    if (window.spiWildlifeFodPieChartInstance) window.spiWildlifeFodPieChartInstance.destroy();
    let g3 = [
      ...((SPI_CONFIG.find(c => c.category.includes('Runway Incursion')) || {}).items || []),
      ...((SPI_CONFIG.find(c => c.category.includes('Bird / Wildlife')) || {}).items || []),
      ...((SPI_CONFIG.find(c => c.category.includes('FOD')) || {}).items || [])
    ];
    let g3L = g3.map(i => i.replace(/^Reported\s+/i, '').replace(/^Inspections in which\s+/i, ''));
    let g3C = g3.map(i => itemTotalsMain[i] || 0);
    let hasG3 = g3C.some(v => v > 0);
    window.spiWildlifeFodPieChartInstance = new Chart(wfCtx, {
      type: 'doughnut',
      data: {
        labels: hasG3 ? g3L.filter((_, idx) => g3C[idx] > 0) : ['لا توجد مؤشرات مسجلة بالمهبط والحياة البرية'],
        datasets: [{
          data: hasG3 ? g3C.filter(v => v > 0) : [1],
          backgroundColor: hasG3 ? ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6'] : ['#e0e0e0'],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, font: { family: 'Cairo,sans-serif', size: 8.5 } } } }
      }
    });
  }

  // 5. جدول الماتريكس المتكامل من اليسار إلى اليمين LTR
  const matrixBox = document.getElementById('spi-matrix-container');
  if (!matrixBox) return;

  let tbl = '<table class="report-table" style="width:100%;border-collapse:collapse;font-size:11px;font-family:Cairo,sans-serif;direction:ltr;text-align:left;border:1px solid #ccc;box-shadow:0 3px 12px rgba(0,0,0,0.06);">';
  tbl += '<thead><tr style="background:#003366;color:#ffffff;text-align:center;"><th style="padding:10px 8px;text-align:left;min-width:320px;border:1px solid #1a4a75;font-size:12px;">Safety issue / SPI</th>';
  mNames.forEach(m => {
    tbl += `<th style="padding:8px 4px;border:1px solid #1a4a75;min-width:42px;font-size:11px;">${m}</th>`;
  });
  tbl += `<th style="padding:8px 6px;border:1px solid #1a4a75;min-width:70px;background:#002244;font-size:11.5px;">${yMain} Total</th>`;

  if (isCompare) {
    tbl += `<th style="padding:8px 6px;border:1px solid #1a4a75;min-width:70px;background:#1a4a75;font-size:11.5px;">${yComp} Total</th>`;
    tbl += `<th style="padding:8px 6px;border:1px solid #1a4a75;min-width:75px;background:#001a33;font-size:11.5px;">Variance (الفرق)</th>`;
  }
  tbl += '</tr></thead><tbody>';

  // صف حركة الطائرات
  tbl += `<tr style="background:#003366;color:#ffffff;font-weight:bold;text-align:center;"><td style="text-align:left;padding:8px 10px;border:1px solid #1a4a75;">Number of aircraft movements</td>`;
  movMain.forEach(v => {
    tbl += `<td style="padding:8px 4px;border:1px solid #1a4a75;">${v > 0 ? v.toLocaleString() : '-'}</td>`;
  });
  tbl += `<td style="padding:8px 6px;border:1px solid #1a4a75;background:#002244;font-size:12px;">${totMovMain > 0 ? totMovMain.toLocaleString() : '-'}</td>`;

  if (isCompare) {
    let diffMov = totMovMain - totMovComp;
    let signM = diffMov > 0 ? `+${diffMov.toLocaleString()}` : diffMov.toLocaleString();
    let colM = diffMov >= 0 ? '#28a745' : '#dc3545';
    tbl += `<td style="padding:8px 6px;border:1px solid #1a4a75;background:#1a4a75;font-size:12px;">${totMovComp > 0 ? totMovComp.toLocaleString() : '-'}</td>`;
    tbl += `<td style="padding:8px 6px;border:1px solid #1a4a75;background:#001a33;font-weight:900;color:${colM};font-size:12px;">${diffMov !== 0 ? signM : '0'}</td>`;
  }
  tbl += '</tr>';

  const colSpanCount = isCompare ? 16 : 14;
  SPI_CONFIG.forEach(cO => {
    tbl += `<tr style="background:#d9ecf8;color:#003366;font-weight:900;border-top:2px solid #b8daff;"><td colspan="${colSpanCount}" style="padding:8px 10px;text-align:left;font-size:12px;">*${cO.category}</td></tr>`;
    cO.items.forEach((itm, idx) => {
      let rowBg = idx % 2 === 0 ? '#ffffff' : '#fcfcfc';
      let itmSumM = itemTotalsMain[itm] || 0;
      let itmSumC = itemTotalsComp[itm] || 0;
      tbl += `<tr style="background:${rowBg};text-align:center;" onmouseover="this.style.background='#f1f8ff'" onmouseout="this.style.background='${rowBg}'"><td style="text-align:left;padding:6px 10px;border:1px solid #e0e0e0;color:#333;font-weight:500;">${itm}</td>`;
      for (let m = 1; m <= 12; m++) {
        let cnt = (dataMain?.events && dataMain.events[itm] && dataMain.events[itm][m]) ? Number(dataMain.events[itm][m]) : 0;
        tbl += `<td style="padding:6px 2px;border:1px solid #e0e0e0;">${cnt > 0 ? `<span style="color:#d9534f;font-weight:bold;">${cnt}</span>` : '<span style="color:#bbb;">-</span>'}</td>`;
      }
      tbl += `<td style="padding:6px 4px;border:1px solid #e0e0e0;font-weight:bold;background:#fafafa;">${itmSumM > 0 ? `<span style="color:#003366;font-weight:900;background:#e8f4fd;padding:2px 8px;border-radius:4px;border:1px solid #b8daff;">${itmSumM}</span>` : '<span style="color:#bbb;">-</span>'}</td>`;

      if (isCompare) {
        let diff = itmSumM - itmSumC;
        let sign = diff > 0 ? `+${diff}` : diff;
        let col = diff > 0 ? '#dc3545' : (diff < 0 ? '#28a745' : '#777');
        tbl += `<td style="padding:6px 4px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f8fb;">${itmSumC > 0 ? itmSumC : '-'}</td>`;
        tbl += `<td style="padding:6px 4px;border:1px solid #e0e0e0;font-weight:900;color:${col};background:#fafafa;">${diff !== 0 ? sign : '-'}</td>`;
      }
      tbl += '</tr>';
    });
  });

  matrixBox.innerHTML = tbl + '</tbody></table>';
}

async function exportSpiPDF() {
  const el = document.getElementById('spi-dashboard-view');
  const yMain = document.getElementById('spiReportYear')?.value || '2026';
  const yComp = document.getElementById('spiCompareYear')?.value || 'none';
  const isComp = (yComp !== 'none' && yComp !== yMain);
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;

  if (!el) return alert('لا يوجد تقرير معروض للطباعة!');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التصدير...';
  }

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `SPI_Report_${yMain}${isComp ? '_vs_' + yComp : ''}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  try {
    await html2pdf().set(opt).from(el).save();
  } catch (err) {
    console.error('PDF export error:', err);
    window.print();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> تصدير (PDF)';
    }
  }
}

// =============================================================================
// 7. قسم استبيان الكابتن (Captain Survey Module)
// =============================================================================
function buildEvaluationForm() {
  const c = document.getElementById('criteria-container');
  if (!c) return;
  c.innerHTML = '';
  criteriaList.forEach((crit, idx) => {
    c.innerHTML += `<div class="eval-card">
      <div class="eval-title">${crit}</div>
      <div class="radio-group">
        <input type="radio" id="c${idx}_e" name="${crit}" value="Excellent" checked><label for="c${idx}_e" class="lbl-e">E</label>
        <input type="radio" id="c${idx}_g" name="${crit}" value="Good"><label for="c${idx}_g" class="lbl-g">G</label>
        <input type="radio" id="c${idx}_p" name="${crit}" value="Poor"><label for="c${idx}_p" class="lbl-p">P</label>
        <input type="radio" id="c${idx}_n" name="${crit}" value="N/A"><label for="c${idx}_n" class="lbl-n">N/A</label>
        <input type="radio" id="c${idx}_b" name="${crit}" value="Blank"><label for="c${idx}_b" class="lbl-b">B</label>
      </div>
    </div>`;
  });
}

function switchTab(t) {
  document.querySelectorAll('#captain-survey-section .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#captain-survey-section .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-' + t)?.classList.add('active');
  document.getElementById('tab-' + t)?.classList.add('active');
}

function updateSurveyNavCounter() {
  const el = document.getElementById('nav-counter');
  if (el) el.innerText = globalSurveys.length > 0 ? `${currentSurveyIndex + 1} / ${globalSurveys.length}` : `0 / 0`;
}

function navSurveys(dir) {
  if (!globalSurveys || globalSurveys.length === 0) return alert("لا توجد استبيانات مسجلة بعد.");
  if (dir === 'first') currentSurveyIndex = 0;
  else if (dir === 'last') currentSurveyIndex = globalSurveys.length - 1;
  else if (dir === 'next' && currentSurveyIndex < globalSurveys.length - 1) currentSurveyIndex++;
  else if (dir === 'prev' && currentSurveyIndex > 0) currentSurveyIndex--;

  if (currentSurveyIndex >= 0 && currentSurveyIndex < globalSurveys.length) {
    displaySurveyInForm(globalSurveys[currentSurveyIndex]);
    updateSurveyNavCounter();
    isSurveyEditMode = false;
    let b = document.getElementById('submitSurveyBtn');
    let eBtn = document.getElementById('editSurveyBtn');
    if (b) {
      b.disabled = true;
      b.innerHTML = '<i class="fa-solid fa-eye"></i> وضع العرض';
      b.style.backgroundColor = "#6c757d";
    }
    if (eBtn) eBtn.style.display = 'block';
  }
}

function displaySurveyInForm(s) {
  if (!s) return;
  currentSurveyEditId = s.ID || s.id || null;
  let dStr = (s.Date || '').toString().trim();
  if (dStr.includes('T')) dStr = dStr.split('T')[0];
  document.getElementById('capDate').value = dStr;

  let tStr = (s.Time || '').toString().trim();
  if (tStr.includes('T')) {
    let tPart = tStr.split('T')[1];
    tStr = tPart.substring(0, 5);
  } else if (tStr.includes(':')) {
    let tp = tStr.split(':');
    let hh = tp[0].trim();
    if (hh.length === 1) hh = '0' + hh;
    tStr = hh + ':' + tp[1].substring(0, 2);
  }
  document.getElementById('capTime').value = tStr;
  document.getElementById('fltNo').value = s.Flight_NO || '';
  document.getElementById('reg').value = s.REG || '';
  document.getElementById('airline').value = s.CAR || '';
  document.getElementById('acType').value = s.TYPE || '';
  document.getElementById('comments').value = s.Captain_Comments || '';

  criteriaList.forEach(c => {
    let v = s[c] || "Blank";
    let r = document.querySelector(`input[name="${c}"][value="${v}"]`);
    if (r) r.checked = true;
  });
}

function enableSurveyEdit() {
  isSurveyEditMode = true;
  let b = document.getElementById('submitSurveyBtn');
  let eBtn = document.getElementById('editSurveyBtn');
  if (b) {
    b.disabled = false;
    b.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تحديث بيانات الاستبيان';
    b.style.backgroundColor = "#e67e22";
  }
  if (eBtn) eBtn.style.display = 'none';
}

function clearFormForNew() {
  currentSurveyIndex = -1;
  isSurveyEditMode = false;
  currentSurveyEditId = null;
  document.getElementById('surveyForm').reset();
  updateSurveyNavCounter();
  let b = document.getElementById('submitSurveyBtn');
  let eBtn = document.getElementById('editSurveyBtn');
  if (b) {
    b.disabled = false;
    b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان';
    b.style.backgroundColor = "var(--primary)";
  }
  if (eBtn) eBtn.style.display = 'none';
  let now = new Date().toISOString();
  document.getElementById('capDate').value = now.split('T')[0];
  document.getElementById('capTime').value = now.split('T')[1].substring(0, 5);
}

function submitSurvey(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('submitSurveyBtn');
  const msg = document.getElementById('surveyMsg');
  const reg = document.getElementById('reg').value.toUpperCase().trim();
  const airline = document.getElementById('airline').value.toUpperCase().trim();
  const type = document.getElementById('acType').value.toUpperCase().trim();

  if (!reg || !airline) return alert("يرجى إدخال حروف التسجيل وشركة الطيران!");

  let sObj = {
    "id": isSurveyEditMode ? currentSurveyEditId : null,
    "Date": document.getElementById('capDate').value,
    "Time": document.getElementById('capTime').value,
    "Flight_NO": document.getElementById('fltNo').value,
    "REG": reg,
    "CAR": airline,
    "TYPE": type,
    "Captain_Comments": document.getElementById('comments').value
  };

  criteriaList.forEach(crit => {
    let sel = document.querySelector(`input[name="${crit}"]:checked`);
    sObj[crit] = sel ? sel.value : "Blank";
  });

  safePost({ action: isSurveyEditMode ? "updateSurvey" : "submitSurvey", surveyData: sObj }, btn, msg, "تم الحفظ وحفظ الطائرة بنجاح!", (res) => {
    if (isSurveyEditMode) {
      let exIdx = globalSurveys.findIndex(x => (x.ID || x.id) === currentSurveyEditId);
      if (exIdx > -1) globalSurveys[exIdx] = sObj;
    } else {
      sObj.ID = res ? res.id : ("S-" + Date.now());
      globalSurveys.unshift(sObj);
    }
    let exists = globalFleetData.some(a => (a.REG || '').toString().toUpperCase().trim() === reg);
    if (!exists) {
      globalFleetData.unshift({ REG: reg, TYPE: type, CAR: airline, Handling: 'EMAAS', Country: '-' });
      populateFilterSelect('surveyFilterReg', globalFleetData, 'REG', 'reg');
      populateFilterSelect('surveyFilterAirline', globalFleetData, 'CAR', 'car');
    }
    updateSurveyNavCounter();
    setTimeout(() => clearFormForNew(), 1500);
  });
}

function generateModernReport() {
  let fromD = document.getElementById('fromDate').value;
  let toD = document.getElementById('toDate').value;
  if (!fromD || !toD) return alert("اختر الفترة أولاً");

  let fd = new Date(fromD);
  let td = new Date(toD);
  td.setHours(23, 59, 59, 999);

  let selAir = document.getElementById('surveyFilterAirline')?.value || 'ALL';
  let selReg = document.getElementById('surveyFilterReg')?.value || 'ALL';
  document.getElementById('printable-report').style.display = 'block';

  let flt = globalSurveys.filter(s => {
    let sd = new Date(s.Date);
    let cAir = (selAir === 'ALL') || (s.CAR === selAir);
    let cReg = (selReg === 'ALL') || (s.REG === selReg);
    return sd >= fd && sd <= td && cAir && cReg;
  });

  document.getElementById('report-date-range').innerText = `الفترة من ${fromD} إلى ${toD}`;
  document.getElementById('stat-total').innerText = flt.length;

  let aC = {}, dC = {}, eC = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 }, cList = [];
  const tb = document.getElementById('flights-eval-tbody');
  tb.innerHTML = '';
  let mS = { "Excellent": {}, "Good": {}, "Poor": {}, "N/A": {}, "Blank": {} };

  criteriaList.forEach(crit => {
    mS["Excellent"][crit] = 0;
    mS["Good"][crit] = 0;
    mS["Poor"][crit] = 0;
    mS["N/A"][crit] = 0;
    mS["Blank"][crit] = 0;
  });

  flt.forEach(s => {
    if (s.CAR) aC[s.CAR] = (aC[s.CAR] || 0) + 1;
    let ds = s.Date ? String(s.Date).split('T')[0] : 'Unknown';
    dC[ds] = (dC[ds] || 0) + 1;
    let fC = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };
    criteriaList.forEach(crit => {
      let v = s[crit] || "Blank";
      if (fC[v] !== undefined) fC[v]++;
      if (eC[v] !== undefined) eC[v]++;
      if (mS[v]) mS[v][crit]++;
    });
    if (s.Captain_Comments && s.Captain_Comments.trim() !== "") cList.push(s);
    tb.innerHTML += `<tr>
      <td><b>${s.CAR || ''}</b></td>
      <td>${s.Flight_NO || ''}</td>
      <td>${ds}</td>
      <td>${s.REG || ''}</td>
      <td style="color:#28a745;font-weight:bold;">${fC["Excellent"]}</td>
      <td style="color:#ffc107;font-weight:bold;">${fC["Good"]}</td>
      <td style="color:#dc3545;font-weight:bold;">${fC["Poor"]}</td>
      <td>${fC["N/A"]}</td>
      <td>${fC["Blank"]}</td>
    </tr>`;
  });

  document.getElementById('stat-airlines').innerText = Object.keys(aC).length;
  let totE = Object.values(eC).reduce((a, b) => a + b, 0);
  document.getElementById('stat-excellent').innerText = `${totE > 0 ? Math.round((eC["Excellent"] / totE) * 100) : 0}%`;

  if (chartInstances.air) chartInstances.air.destroy();
  if (chartInstances.dates) chartInstances.dates.destroy();
  if (chartInstances.eval) chartInstances.eval.destroy();

  Chart.defaults.font.family = "'Cairo', sans-serif";
  let ctxEval = document.getElementById('evalChart')?.getContext('2d');
  if (ctxEval) {
    chartInstances.eval = new Chart(ctxEval, {
      type: 'doughnut',
      data: {
        labels: ['ممتاز', 'جيد', 'ضعيف', 'غير منطبق', 'فارغ'],
        datasets: [{
          data: [eC["Excellent"] || 0, eC["Good"] || 0, eC["Poor"] || 0, eC["N/A"] || 0, eC["Blank"] || 0],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'],
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } } }
    });
  }

  let ctxAir = document.getElementById('airlinesChart')?.getContext('2d');
  if (ctxAir) {
    chartInstances.air = new Chart(ctxAir, {
      type: 'bar',
      data: {
        labels: Object.keys(aC),
        datasets: [{ label: 'الاستبيانات', data: Object.values(aC), backgroundColor: '#003366', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  let ctxDates = document.getElementById('datesChart')?.getContext('2d');
  if (ctxDates) {
    chartInstances.dates = new Chart(ctxDates, {
      type: 'line',
      data: {
        labels: Object.keys(dC).sort(),
        datasets: [{ label: 'النشاط اليومي', data: Object.keys(dC).sort().map(d => dC[d]), borderColor: '#f39c12', tension: 0.3 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  let eH = `<div class="avoid-page-break" style="margin-top:35px;direction:ltr;"><h3 style="color:#003366;text-align:center;margin-bottom:12px;font-size:1.2rem;">Safety Captain Survey Report Evaluation Matrix</h3><table style="width:100%;border-collapse:collapse;border:1px solid #777;font-size:11px;text-align:center;"><thead><tr style="background:#003366;color:#fff;"><th style="padding:8px;border:1px solid #999;text-align:left;width:40%;">Evaluation Criteria</th><th style="padding:8px;border:1px solid #999;background:#28a745;">Excellent</th><th style="padding:8px;border:1px solid #999;background:#ffc107;color:#000;">Good</th><th style="padding:8px;border:1px solid #999;background:#dc3545;">Poor</th><th style="padding:8px;border:1px solid #999;background:#6c757d;">N/A</th><th style="padding:8px;border:1px solid #999;background:#1a2a6c;">Blank</th></tr></thead><tbody>`;
  criteriaList.forEach(crit => {
    eH += `<tr>
      <td style="padding:6px 10px;border:1px solid #ccc;text-align:left;font-weight:bold;background:#f9f9f9;">${crit}</td>
      <td style="padding:6px;border:1px solid #ccc;font-weight:bold;color:${mS["Excellent"][crit] > 0 ? '#28a745' : '#aaa'};">${mS["Excellent"][crit] || 0}</td>
      <td style="padding:6px;border:1px solid #ccc;font-weight:bold;color:${mS["Good"][crit] > 0 ? '#ffc107' : '#aaa'};">${mS["Good"][crit] || 0}</td>
      <td style="padding:6px;border:1px solid #ccc;font-weight:bold;color:${mS["Poor"][crit] > 0 ? '#dc3545' : '#bbb'};">${mS["Poor"][crit] || 0}</td>
      <td style="padding:6px;border:1px solid #ccc;color:#555;">${mS["N/A"][crit] || 0}</td>
      <td style="padding:6px;border:1px solid #ccc;color:#555;">${mS["Blank"][crit] || 0}</td>
    </tr>`;
  });
  eH += `</tbody></table></div>
  <div class="avoid-page-break" style="margin-top:35px;direction:ltr;text-align:left;">
    <h3 style="color:#003366;margin-bottom:10px;">Captain Comments & Observations:</h3>
    <table class="avoid-page-break" style="width:100%;border-collapse:collapse;border:1px solid #000;font-size:11px;">
      <thead style="background:#e6e6e6;">
        <tr>
          <th style="border:1px solid #000;padding:6px;">Airline</th>
          <th style="border:1px solid #000;padding:6px;">FLTNO</th>
          <th style="border:1px solid #000;padding:6px;">Type</th>
          <th style="border:1px solid #000;padding:6px;">Date</th>
          <th style="border:1px solid #000;padding:6px;">REG</th>
          <th style="border:1px solid #000;padding:6px;">Comments</th>
        </tr>
      </thead>
      <tbody>`;
  if (cList.length === 0) eH += `<tr><td colspan="6" style="text-align:center;">No comments.</td></tr>`;
  else cList.forEach(s => {
    eH += `<tr>
      <td style="border:1px solid #000;padding:6px;">${s.CAR || '-'}</td>
      <td style="border:1px solid #000;padding:6px;">${s.Flight_NO || '-'}</td>
      <td style="border:1px solid #000;padding:6px;">${s.TYPE || '-'}</td>
      <td style="border:1px solid #000;padding:6px;">${s.Date ? String(s.Date).split('T')[0] : ''}</td>
      <td style="border:1px solid #000;padding:6px;">${s.REG || '-'}</td>
      <td style="border:1px solid #000;padding:6px;">${s.Captain_Comments}</td>
    </tr>`;
  });
  eH += `</tbody></table></div>`;
  document.getElementById('additional-tables-container').innerHTML = eH;
}

function exportModernPDF() {
  html2pdf().set({
    margin: 0.3,
    filename: 'Captain_Surveys_Report.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'in', format: 'a4' },
    pagebreak: { mode: 'css', avoid: ['tr', 'table', '.avoid-page-break'] }
  }).from(document.getElementById('printable-report')).save();
}

function setupCustomDropdown() {
  const inp = document.getElementById('reg');
  const arr = document.getElementById('regArrowBtn');
  const lst = document.getElementById('regDropdownList');
  if (inp && arr && lst) {
    arr.addEventListener('click', e => {
      e.stopPropagation();
      lst.classList.toggle('show');
      filterRegOptions(true);
    });
    inp.addEventListener('input', () => {
      lst.classList.add('show');
      filterRegOptions(false);
      let val = inp.value.toUpperCase().trim();
      let f = globalFleetData.find(a => (a.REG || '').toString().toUpperCase().trim() === val);
      if (f) {
        document.getElementById('airline').value = f.CAR || '';
        document.getElementById('acType').value = f.TYPE || '';
      }
    });
    document.addEventListener('click', () => lst.classList.remove('show'));
  }
}

function filterRegOptions(all) {
  const inp = document.getElementById('reg');
  const lst = document.getElementById('regDropdownList');
  let val = inp.value.toUpperCase();
  lst.innerHTML = '';
  let m = all ? globalFleetData : globalFleetData.filter(a => String(a.REG).toUpperCase().includes(val));
  m.forEach(a => {
    let d = document.createElement('div');
    d.className = 'custom-dropdown-item';
    d.innerHTML = `${a.REG} <span style="font-size:0.75rem;color:#777;float:right;">${a.CAR}</span>`;
    d.onclick = () => {
      inp.value = a.REG;
      document.getElementById('airline').value = a.CAR || "";
      document.getElementById('acType').value = a.TYPE || "";
      lst.classList.remove('show');
    };
    lst.appendChild(d);
  });
}

// =============================================================================
// 8. قسم الفحص اليومي لمنطقة التحركات الجوية (Daily Inspection Module)
// =============================================================================
function buildDailyChecklist() {
  const g = document.getElementById('checklist-container');
  if (!g) return;
  g.innerHTML = "";
  let cI = 0;
  Object.keys(dailyChecklistDataISO).forEach(k => {
    let d = dailyChecklistDataISO[k];
    let h = `<div class="checklist-column">`;
    const rS = (t, items) => {
      h += `<div class="checklist-header">${t}</div>`;
      items.forEach(it => {
        let opts = responsibleDepts.map(dp => `<option value="${dp}">${dp}</option>`).join('');
        h += `<div class="check-item">
          <div class="check-item-row">
            <input type="checkbox" id="chk_${cI}" value="${t}|${it}" onchange="toggleInputs(${cI})">
            <label for="chk_${cI}">${it}</label>
          </div>
          <div id="inputs_${cI}" class="check-inputs" style="display:none;flex-direction:column;gap:8px;margin-top:8px;padding:10px;background:#fdfdfd;border-right:4px solid #dc3545;border-radius:4px;">
            <input type="text" id="note_${cI}" placeholder="تفاصيل الملاحظة..." style="width:100%;padding:7px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;">
            <div style="display:flex;gap:5px;">
              <input type="text" id="loc_${cI}" placeholder="المكان..." style="flex:1;padding:7px;border:1px solid #ccc;border-radius:4px;">
              <select id="resp_${cI}" style="flex:1;padding:7px;border:1px solid #ccc;border-radius:4px;"><option value="" disabled selected>الجهة...</option>${opts}</select>
            </div>
            <input type="hidden" id="actionTaken_${cI}" value="">
            <input type="hidden" id="status_${cI}" value="مفتوح">
            <button type="button" id="rectifyBtn_${cI}" onclick="toggleRectifyFinding(this, ${cI})" style="background:#28a745;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:bold;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;">
              <i class="fa-solid fa-circle-check"></i> إغلاق وتلافي هذه الملاحظة الآن
            </button>
          </div>
        </div>`;
        cI++;
      });
    };
    rS(d.title, d.items);
    if (d.title2) rS(d.title2, d.items2);
    if (d.title3) rS(d.title3, d.items3);
    h += `</div>`;
    g.innerHTML += h;
  });
}

window.toggleInputs = function (idx) {
  const chk = document.getElementById('chk_' + idx);
  const inps = document.getElementById('inputs_' + idx);
  if (chk && inps) inps.style.display = chk.checked ? 'flex' : 'none';
};

function toggleRectifyFinding(btn, idx) {
  let stInp = document.getElementById(`status_${idx}`);
  let actInp = document.getElementById(`actionTaken_${idx}`);
  let today = new Date().toISOString().split('T')[0];

  if (!stInp) {
    stInp = document.createElement('input');
    stInp.type = 'hidden';
    stInp.id = `status_${idx}`;
    stInp.value = 'مفتوح';
    btn.parentNode.appendChild(stInp);
  }
  if (stInp.value !== 'مغلق') {
    stInp.value = 'مغلق';
    btn.style.backgroundColor = '#155724';
    btn.innerHTML = `<i class="fa-solid fa-check-double"></i> تم تلافي وإغلاق الملاحظة بتاريـخ (${today})`;
    if (actInp) {
      let curr = actInp.value.replace(/\[تم تلافي الملحوظة بتاريخ.*?\]/g, '').trim();
      actInp.value = (curr ? curr + ' - ' : '') + `[تم تلافي الملحوظة بتاريخ ${today}]`;
    }
  } else {
    stInp.value = 'مفتوح';
    btn.style.backgroundColor = '#28a745';
    btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> إغلاق وتلافي هذه الملاحظة الآن`;
    if (actInp) {
      actInp.value = actInp.value.replace(/\[تم تلافي الملحوظة بتاريخ.*?\]/g, '').trim();
    }
  }
}

function switchDailyTab(tab) {
  document.querySelectorAll('#daily-inspection-section .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#daily-inspection-section .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-daily-' + tab)?.classList.add('active');
  document.getElementById('tab-daily-' + tab)?.classList.add('active');
}

function updateDailyNavCounter() {
  const el = document.getElementById('nav-daily-counter');
  if (el) el.innerText = globalDailyInspections.length > 0 ? `${currentDailyIndex + 1} / ${globalDailyInspections.length}` : `0 / 0`;
}

function clearDailyFormForNew() {
  currentDailyIndex = -1;
  isDailyEditMode = false;
  currentDailyEditId = null;
  document.getElementById('dailyForm').reset();
  document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach(c => c.checked = false);
  document.querySelectorAll('.check-inputs').forEach(el => el.style.display = 'none');
  let b = document.getElementById('submitDailyBtn');
  if (b) {
    b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الجولة';
    b.style.backgroundColor = "var(--primary)";
  }
  let now = new Date().toISOString();
  document.getElementById('dailyDate').value = now.split('T')[0];
  document.getElementById('dailyTime').value = now.split('T')[1].substring(0, 5);
  updateDailyNavCounter();
}

function navDaily(dir) {
  if (!globalDailyInspections || globalDailyInspections.length === 0) return alert("لا توجد فحوصات مسجلة.");
  if (dir === 'first') currentDailyIndex = 0;
  else if (dir === 'last') currentDailyIndex = globalDailyInspections.length - 1;
  else if (dir === 'next' && currentDailyIndex < globalDailyInspections.length - 1) currentDailyIndex++;
  else if (dir === 'prev' && currentDailyIndex > 0) currentDailyIndex--;
  if (currentDailyIndex >= 0 && currentDailyIndex < globalDailyInspections.length) loadDailyInspectionToForm(currentDailyIndex);
}

function loadDailyInspectionToForm(idx) {
  if (!globalDailyInspections || idx < 0 || idx >= globalDailyInspections.length) return;
  currentDailyIndex = idx;
  let rep = globalDailyInspections[currentDailyIndex];
  if (!rep) return;
  if (typeof switchDailyTab === 'function') switchDailyTab('entry');
  const f = document.getElementById('dailyForm');
  if (f) f.reset();
  document.querySelectorAll('.check-inputs').forEach(el => el.style.display = 'none');

  const dD = document.getElementById('dailyDate'), dT = document.getElementById('dailyTime'), dS = document.getElementById('dailyShift'), dI = document.getElementById('dailyInspector');
  if (dD) dD.value = rep.date || '';
  if (dT) dT.value = rep.time || '';
  if (dS) dS.value = rep.shift || 'صباحي';
  if (dI) dI.value = rep.inspector || '';

  if (rep.findings && rep.findings.length > 0) {
    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, chkIdx) => {
      let parts = chk.value.split('|');
      let cat = parts[0].trim(), itm = parts[1].trim();
      let found = rep.findings.find(x => (x.category || '').trim() === cat && (x.item || '').trim() === itm);
      if (found) {
        chk.checked = true;
        let inDiv = document.getElementById(`inputs_${chkIdx}`);
        if (inDiv) inDiv.style.display = 'flex';
        let fn = found.note || "", nT = "تم الرصد", aT = "";
        try {
          let m = fn.match(/الملاحظة: (.*?) - الإجراء: (.*?) - تاريخ التلافي: (.*)/);
          if (m) { nT = m[1]; aT = m[2]; } else { nT = fn; }
        } catch (e) {}

        if (document.getElementById(`note_${chkIdx}`)) document.getElementById(`note_${chkIdx}`).value = nT;
        if (document.getElementById(`actionTaken_${chkIdx}`)) document.getElementById(`actionTaken_${chkIdx}`).value = aT;
        if (document.getElementById(`loc_${chkIdx}`)) document.getElementById(`loc_${chkIdx}`).value = found.location || "";
        if (document.getElementById(`resp_${chkIdx}`)) document.getElementById(`resp_${chkIdx}`).value = found.responsible || "";

        let isClosed = (found.status === 'مغلق' || found.status === 'Closed' || fn.includes('تم تلافي') || aT.includes('تم تلافي'));
        let st = document.getElementById(`status_${chkIdx}`);
        let btn = document.getElementById(`rectifyBtn_${chkIdx}`);
        if (st) st.value = isClosed ? "مغلق" : "مفتوح";
        if (btn) {
          if (isClosed) {
            btn.style.backgroundColor = '#155724';
            btn.innerHTML = `<i class="fa-solid fa-check-double"></i> تم تلافي وإغلاق الملاحظة`;
          } else {
            btn.style.backgroundColor = '#28a745';
            btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> إغلاق وتلافي هذه الملاحظة الآن`;
          }
        }
      }
    });
  }
  if (typeof updateDailyNavCounter === 'function') updateDailyNavCounter();
  isDailyEditMode = true;
  currentDailyEditId = rep.id;
  let btn = document.getElementById('submitDailyBtn');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> حفظ التعديلات وتحديث الحالة';
    btn.style.backgroundColor = "#ffc107";
    btn.style.color = "#000";
  }
  if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function submitDailyInspection(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('submitDailyBtn');
  const msg = document.getElementById('dailyMsg');
  const dD = document.getElementById('dailyDate')?.value || '';
  const dT = document.getElementById('dailyTime')?.value || '';
  const dS = document.getElementById('dailyShift')?.value || 'صباحي';
  const dI = document.getElementById('dailyInspector')?.value || '';

  if (!dD) return alert('يرجى تحديد تاريخ الفحص');

  let fList = [];
  document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, chkIdx) => {
    if (chk.checked) {
      let p = chk.value.split('|');
      let cat = p[0].trim(), itm = p[1] ? p[1].trim() : '';
      let noteVal = document.getElementById(`note_${chkIdx}`)?.value || '';
      let locVal = document.getElementById(`loc_${chkIdx}`)?.value || '';
      let respVal = document.getElementById(`resp_${chkIdx}`)?.value || '';
      let actVal = document.getElementById(`actionTaken_${chkIdx}`)?.value || '';
      let tDateVal = document.getElementById(`targetDate_${chkIdx}`)?.value || '';
      let stVal = document.getElementById(`status_${chkIdx}`)?.value || 'مفتوح';

      if (stVal === 'مغلق' || actVal.includes('تم تلافي')) {
        stVal = 'مغلق';
        if (!actVal.includes('تم تلافي')) {
          let todayStr = new Date().toISOString().split('T')[0];
          actVal += (actVal ? ' - ' : '') + `[تم تلافي الملحوظة بتاريخ ${tDateVal || todayStr}]`;
        }
      }
      let fullNote = `الملاحظة: ${noteVal} - الإجراء: ${actVal || 'لم يحدد'} - تاريخ التلافي: ${tDateVal || (stVal === 'مغلق' ? new Date().toISOString().split('T')[0] : 'غير محدد')}`;
      fList.push({ category: cat, item: itm, location: locVal, responsible: respVal, note: fullNote, status: stVal });
    }
  });

  let reportId = isDailyEditMode ? (currentDailyEditId || Date.now()) : Date.now();
  let repObj = { id: reportId, date: dD, time: dT, shift: dS, inspector: dI, findings: fList };

  if (isDailyEditMode && typeof currentDailyIndex === 'number' && currentDailyIndex >= 0 && currentDailyIndex < globalDailyInspections.length) {
    globalDailyInspections[currentDailyIndex] = repObj;
  } else {
    globalDailyInspections.unshift(repObj);
    currentDailyIndex = 0;
  }

  renderSavedDaily();
  if (typeof updateDailyNavCounter === 'function') updateDailyNavCounter();

  let act = isDailyEditMode ? 'updateDailyInspection' : 'submitDailyInspection';
  safePost({ action: act, reportData: repObj }, btn, msg, 'تم الحفظ في جوجل شيت بنجاح!', () => {
    alert('✅ تم تثبيت الفحص في جوجل شيت بنجاح!');
    isDailyEditMode = false;
    currentDailyEditId = null;
    if (typeof generateIsoDailyReport === 'function') generateIsoDailyReport(repObj);
  });
}

function renderSavedDaily() {
  const tb = document.getElementById('saved-daily-tbody');
  if (!tb) return;
  tb.innerHTML = "";
  if (typeof updateDailyNavCounter === 'function') updateDailyNavCounter();
  if (!globalDailyInspections || globalDailyInspections.length === 0) {
    tb.innerHTML = "<tr><td colspan='6' style='color:#777; font-weight:bold; text-align:center;'>لا توجد فحوصات محفوظة.</td></tr>";
    return;
  }
  globalDailyInspections.forEach((rep, idx) => {
    if (!rep || !rep.date || rep.date === '-' || rep.date.trim() === '') return;
    let cnt = rep.findings ? rep.findings.length : 0;
    let clCnt = 0;
    if (cnt > 0) {
      rep.findings.forEach(f => {
        let st = String(f.status || f.Status || '').trim().toLowerCase();
        let nt = String(f.note || ''), ac = String(f.actionTaken || f.action || '');
        if (st === 'مغلق' || st === 'closed' || nt.includes('تم تلافي') || ac.includes('تم تلافي')) clCnt++;
      });
    }
    let openCnt = cnt - clCnt;
    let badge = '';
    if (cnt === 0) {
      badge = `<span style="background:#28a745; color:white; padding:3px 10px; border-radius:12px; font-weight:bold; font-size:11px;">سليم 100%</span>`;
    } else {
      let redB = openCnt > 0 ? `<span style="background:#dc3545; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px; white-space:nowrap;">${openCnt} مخالفة مفتوحة</span>` : '';
      let grnB = clCnt > 0 ? `<span style="background:#28a745; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px; white-space:nowrap;"><i class="fa-solid fa-check"></i> ${clCnt} تم الإغلاق</span>` : '';
      badge = `<div style="display:flex; justify-content:center; align-items:center; gap:5px; flex-wrap:nowrap;">${redB}${grnB}</div>`;
    }
    tb.innerHTML += `<tr>
      <td dir="ltr" style="font-weight:bold;">${rep.date}</td>
      <td dir="ltr">${rep.time || '-'}</td>
      <td>${rep.shift || '-'}</td>
      <td>${rep.inspector || '-'}</td>
      <td>${badge}</td>
      <td style="white-space: nowrap;">
        <button type="button" onclick="previewDailyReport(${idx})" style="background:#003366; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:3px;" title="عرض وطباعة النموذج"><i class="fa-solid fa-eye"></i> النموذج</button>
        <button type="button" onclick="loadDailyInspectionToForm(${idx})" style="background:#ffc107; color:#000; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; font-weight:bold; margin-left:3px;" title="تعديل هذا الفحص"><i class="fa-solid fa-pen"></i> تعديل</button>
        <button type="button" onclick="deleteDailyInspectionRecord(${idx})" style="background:#dc3545; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; font-weight:bold; margin-left:3px;" title="إلغاء وحذف هذه الجولة"><i class="fa-solid fa-trash"></i> إلغاء</button>
        <button type="button" onclick="copyDailyInspection(${idx})" style="background:#17a2b8; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:3px;" title="نسخ ملاحظات هذا اليوم إلى فحص جديد اليوم"><i class="fa-solid fa-copy"></i> نسخ لليوم</button>
      </td>
    </tr>`;
  });
}

function previewDailyReport(idx) {
  if (!globalDailyInspections || !globalDailyInspections[idx]) return;
  generateIsoDailyReport(globalDailyInspections[idx]);
}

function deleteDailyInspectionRecord(idx) {
  if (!globalDailyInspections || !globalDailyInspections[idx]) return;
  let rep = globalDailyInspections[idx];
  if (!confirm(`⚠️ هل أنت متأكد من إلغاء وحذف جولة يوم (${rep.date} - وردية ${rep.shift}) نهائياً؟`)) return;
  let repId = rep.id;
  globalDailyInspections.splice(idx, 1);
  renderSavedDaily();
  if (typeof updateDailyNavCounter === 'function') updateDailyNavCounter();
  safePost({ action: "updateDailyInspection", reportData: { id: repId, findings: [] } });
}

function copyDailyInspection(idx) {
  let rep = globalDailyInspections[idx];
  if (!rep) return;
  if (!confirm(`هل تريد نسخ ملاحظات جولة يوم (${rep.date}) إلى جولة فحص جديدة بتاريخ اليوم؟`)) return;
  clearDailyFormForNew();
  switchDailyTab('entry');
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now - offset)).toISOString().slice(0, -1);
  if (document.getElementById('dailyDate')) document.getElementById('dailyDate').value = localISOTime.split('T')[0];
  if (document.getElementById('dailyTime')) document.getElementById('dailyTime').value = localISOTime.split('T')[1].substring(0, 5);
  const dS = document.getElementById('dailyShift'), dI = document.getElementById('dailyInspector');
  if (dS) dS.value = rep.shift || 'صباحي';
  if (dI) dI.value = rep.inspector || '';

  let count = 0;
  if (rep.findings && rep.findings.length > 0) {
    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, chkIdx) => {
      let parts = chk.value.split('|');
      let cat = parts[0].trim(), itm = parts[1].trim();
      let found = rep.findings.find(x => (x.category || '').trim() === cat && (x.item || '').trim() === itm);
      let isClosed = found && (found.status === 'مغلق' || found.status === 'Closed' || String(found.note || '').includes('تم تلافي'));
      if (found && !isClosed) {
        chk.checked = true;
        let inDiv = document.getElementById(`inputs_${chkIdx}`);
        if (inDiv) inDiv.style.display = 'flex';
        if (document.getElementById(`note_${chkIdx}`)) document.getElementById(`note_${chkIdx}`).value = found.note || "";
        if (document.getElementById(`loc_${chkIdx}`)) document.getElementById(`loc_${chkIdx}`).value = found.location || "";
        if (document.getElementById(`resp_${chkIdx}`)) document.getElementById(`resp_${chkIdx}`).value = found.responsible || "";
        count++;
      }
    });
  }
  isDailyEditMode = false;
  currentDailyEditId = null;
  alert(`✅ تم نسخ (${count}) مخالفة مفتوحة بنجاح وتجاهل المخالفات المتلافية.`);
}

function generateIsoDailyReport(specificRep) {
  let rep = specificRep, targetD = '', targetS = 'صباحي';
  let todayStr = new Date().toISOString().split('T')[0];
  if (!rep) {
    targetD = document.getElementById('isoReportDate')?.value || '';
    targetS = document.getElementById('isoReportShift')?.value || 'صباحي';
    if (!targetD) {
      targetD = todayStr;
      if (document.getElementById('isoReportDate')) document.getElementById('isoReportDate').value = targetD;
    }
    if (typeof globalDailyInspections !== 'undefined' && globalDailyInspections.length > 0) {
      rep = globalDailyInspections.find(r => r && r.date === targetD && r.shift === targetS) || globalDailyInspections.find(r => r && r.date === targetD);
    }
    if (!rep) {
      rep = { date: targetD, shift: targetS, inspector: document.getElementById('dailyInspector')?.value || '', findings: [] };
    }
  }
  if (!rep) return;

  let container = document.getElementById('printable-daily-report') || document.getElementById('printable-checklist-report') || document.querySelector('.iso-report-container');
  if (container) container.style.display = 'block';

  let dParts = (rep.date || targetD || todayStr).split('-');
  let dispDate = dParts.length === 3 ? `${dParts[0]} / ${dParts[1]} / ${dParts[2]}` : rep.date;
  let isMorn = (String(rep.shift || targetS || '').trim() === 'صباحي');
  let dateSpan = document.getElementById('iso-date-val');
  if (dateSpan) dateSpan.innerText = dispDate;

  let sAm = document.getElementById('iso-shift-am'), sPm = document.getElementById('iso-shift-pm');
  if (sAm && sPm) {
    sAm.innerHTML = isMorn ? '✔' : '';
    sPm.innerHTML = !isMorn ? '✔' : '';
  }

  let targetArea = container || document;
  targetArea.querySelectorAll('*').forEach(el => {
    if (el.children.length <= 1 && el.id !== 'iso-date-val') {
      let txt = (el.innerText || '').trim();
      if (txt.includes('التاريخ') || txt.includes('28 / 10 / 2026') || /28\s*[\/\-]\s*10\s*[\/\-]\s*2026/.test(txt)) {
        if (!txt.includes('AS-') && !txt.includes('تلافي')) el.innerText = `التاريخ: ${dispDate}`;
      }
      if (txt.includes('توقيع القائم بالتفتيش:')) {
        el.innerHTML = `توقيع القائم بالتفتيش: <b style="color:#003366;">${rep.inspector || '............................'}</b>`;
      }
    }
  });

  let tb = document.getElementById('iso-findings-tbody');
  if (tb) {
    tb.innerHTML = '';
    if (!rep.findings || rep.findings.length === 0) {
      tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:12px;font-weight:bold;color:#28a745;font-size:11px;">سليم 100% ولا توجد ملاحظات عدم مطابقة</td></tr>';
    } else {
      let seq = 1;
      rep.findings.forEach(f => {
        let fn = f.note || '', nT = fn, aT = 'لم يحدد', tD = '';
        try {
          let m = fn.match(/الملاحظة: (.*?) - الإجراء: (.*?) - تاريخ التلافي: (.*)/);
          if (m) { nT = m[1]; aT = m[2]; tD = (m[3] !== 'غير محدد') ? m[3] : ''; }
        } catch (e) {}

        let stStr = String(f.status || f.Status || '').trim().toLowerCase();
        let isCl = (stStr === 'مغلق' || stStr === 'closed' || fn.includes('تم تلافي') || aT.includes('تم تلافي'));
        let stBadge = isCl ? '<span style="color:#28a745;font-weight:900;font-size:11px;background:#e8f5e9;padding:2px 6px;border-radius:4px;border:1px solid #28a745;">مغلق</span>' : '<span style="color:#dc3545;font-weight:900;font-size:11px;background:#ffebee;padding:2px 6px;border-radius:4px;border:1px solid #dc3545;">مفتوح</span>';

        tb.innerHTML += `<tr>
          <td style="text-align:center;width:5%;padding:6px;border:1px solid #000;font-weight:bold;">${seq++}</td>
          <td style="text-align:center;width:15%;padding:6px;border:1px solid #000;font-weight:bold;">${f.location || '-'}</td>
          <td style="text-align:right;width:45%;padding:6px;border:1px solid #000;line-height:1.4;">
            <span style="color:#dc3545;font-weight:bold;font-size:10px;">${f.category} - ${f.item}</span><br>
            <span style="color:#333;font-size:9.5px;">(${nT})</span>
          </td>
          <td style="text-align:center;width:15%;padding:6px;border:1px solid #000;">${f.responsible || '-'}</td>
          <td style="text-align:center;width:20%;padding:6px;border:1px solid #000;">${stBadge}</td>
        </tr>`;
      });
    }
  }
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function exportDailyPNG() {
  const btn = event?.target?.closest('button');
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> استخراج...';
  }
  let target = document.getElementById('printable-daily-report') || document.getElementById('as-f-01-01-container');
  if (!target || target.style.display === 'none') {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
    return alert("يرجى الضغط على زر (عرض النموذج) أولاً!");
  }
  let dt = (document.getElementById('isoReportDate')?.value || new Date().toISOString().split('T')[0]);

  const doCapture = () => {
    html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false }).then(cvs => {
      cvs.toBlob(blob => {
        if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
        if (!blob) return alert("تعذر استخراج الصورة.");
        let u = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.download = `Daily_Inspection_AS_F_01_01_${dt}.png`;
        a.href = u;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(u); }, 1000);
      }, 'image/png');
    }).catch(err => {
      if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
      alert("خطأ أثناء إنشاء الصورة!");
    });
  };

  if (typeof html2canvas === 'undefined') {
    let s = document.createElement('script');
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload = doCapture;
    document.head.appendChild(s);
  } else {
    doCapture();
  }
}

// =============================================================================
// 9. قسم سجل الحوادث والوقائع (Incidents & Accidents Module)
// =============================================================================
function sortIncidentsByDate() {
  if (!globalIncidents) return;
  globalIncidents.sort((a, b) => {
    let da = new Date(a.Date || a.date || 0).getTime();
    let db = new Date(b.Date || b.date || 0).getTime();
    return db - da;
  });
  window.globalIncidents = globalIncidents;
}

function updateIncidentNavCounter() {
  const el = document.getElementById('nav-incident-counter');
  const len = (globalIncidents && globalIncidents.length) ? globalIncidents.length : 0;
  if (el) el.innerText = len > 0 ? (currentIncidentIndex >= 0 ? `${currentIncidentIndex + 1} / ${len}` : `0 / ${len}`) : `0 / 0`;
}

function switchIncidentTab(t) {
  document.querySelectorAll('#incident-section .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#incident-section .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-inc-' + t)?.classList.add('active');
  document.getElementById('tab-inc-' + t)?.classList.add('active');
  if (t === 'monthly') renderSavedIncidents();
}

function navIncidents(dir) {
  const list = globalIncidents || [];
  if (!list || list.length === 0) return alert("لا توجد وقائع مسجلة بعد.");
  if (dir === 'first') currentIncidentIndex = 0;
  else if (dir === 'last') currentIncidentIndex = list.length - 1;
  else if (dir === 'next' && currentIncidentIndex < list.length - 1) currentIncidentIndex++;
  else if (dir === 'prev' && currentIncidentIndex > 0) currentIncidentIndex--;
  if (currentIncidentIndex >= 0 && currentIncidentIndex < list.length) {
    loadIncidentToForm(currentIncidentIndex);
    switchIncidentTab('entry');
  }
}

function loadIncidentToForm(idx) {
  if (idx < 0 || !globalIncidents || idx >= globalIncidents.length) return;
  currentIncidentIndex = idx;
  let inc = globalIncidents[idx];
  currentIncidentEditId = inc.ID || inc.id;

  const s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  s('incId', inc.ID || inc.id);
  s('incDate', (inc.Date || inc.date || '').toString().split('T')[0]);
  s('incTime', inc.Time || inc.time);
  s('incLocation', inc.Location || inc.location);
  s('incPersonnel', inc.Personnel_Involved || inc.personnel);
  s('incPosition', inc.Position || inc.position);
  s('incInjuryType', inc.Injury_Type || inc.injuryType);
  s('incAcType', inc.TYPE || inc.type);
  s('incFlightNo', inc.Flight_No || inc.flightNo);
  s('incReg', inc.REG || inc.reg);
  s('incCar', inc.CAR || inc.car);
  s('incEquipmentNo', inc.Equipment_No || inc.equipmentNo);
  s('incDriver', inc.Driver_Name || inc.driver);
  s('incEqOwner', inc.Equipment_Owned || inc.eqOwner);
  s('incStatus', inc.Status || inc.status);
  s('incPreparedBy', inc.Prepared_By || inc.preparedBy);
  s('incChar', inc.Characterization || inc.charaterization);
  s('incCauses', inc.Occurrence_Causes || inc.causes);
  s('incRiskSev', inc.Risk_Severity || inc.riskSeverity);
  s('incRiskProb', inc.Risk_Probability || inc.riskProb);

  const attUrl = inc.Attachment_URL || inc.attachment_URL || '';
  s('incAttach', attUrl);
  s('incDesc', inc.Description || inc.description);
  s('incHazardDesc', inc.Hazard_Description || inc.hazardDesc);
  s('incCausesDetails', inc.Causes_Details || inc.causesDetails);
  s('incAction', inc.Action_Taken || inc.actionTaken);
  s('incRecommendation', inc.Recommendation || inc.recommendation);

  const prevEl = document.getElementById('incAttachmentPreview');
  if (prevEl) {
    if (attUrl && attUrl.length > 5) {
      prevEl.innerHTML = `<a href="${attUrl}" target="_blank" style="color:#003366;font-weight:bold;text-decoration:underline;"><i class="fa-solid fa-eye"></i> معاينة المرفق الحالي 👁️</a>`;
    } else {
      prevEl.innerHTML = `<span style="color:#888;">لا يوجد مرفق محفوظ لهذه الواقعة</span>`;
    }
  }

  const btn = document.getElementById('submitIncBtn');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تحديث الواقعة';
    btn.style.backgroundColor = '#17a2b8';
  }
  updateIncidentNavCounter();
}

function clearIncidentForm() {
  currentIncidentIndex = -1;
  currentIncidentEditId = null;
  const f = document.getElementById('incidentForm');
  if (f) f.reset();
  const idF = document.getElementById('incId');
  if (idF) idF.value = '';
  const dtF = document.getElementById('incDate');
  if (dtF) dtF.value = new Date().toISOString().split('T')[0];
  const prevEl = document.getElementById('incAttachmentPreview');
  if (prevEl) prevEl.innerHTML = '';
  const b = document.getElementById('submitIncBtn');
  if (b) {
    b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الواقعة وتحديث السجل';
    b.style.backgroundColor = '#dc3545';
  }
  updateIncidentNavCounter();
  switchIncidentTab('entry');
}

function handleIncidentFileSelect(input) {
  const prevEl = document.getElementById('incAttachmentPreview');
  if (!prevEl) return;
  if (input.files && input.files[0]) {
    prevEl.innerHTML = `<span style="color:#e67e22;font-weight:bold;"><i class="fa-solid fa-file-arrow-up"></i> تم اختيار ملف: ${input.files[0].name} (سيتم رفعه عند الحفظ)</span>`;
  }
}

function processFileForUpload(file) {
  return new Promise(res => {
    if (!file.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = () => res({ data: r.result, name: file.name, type: file.type });
      r.onerror = () => res(null);
      r.readAsDataURL(file);
      return;
    }
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => {
        const maxD = 1600;
        let w = img.width, h = img.height;
        if (w > maxD || h > maxD) {
          if (w > h) { h = Math.round(h * maxD / w); w = maxD; }
          else { w = Math.round(w * maxD / h); h = maxD; }
        }
        const cvs = document.createElement('canvas');
        cvs.width = w; cvs.height = h;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        res({ data: cvs.toDataURL('image/jpeg', 0.85), name: file.name.replace(/\.[^/.]+$/, "") + ".jpg", type: "image/jpeg" });
      };
      img.onerror = () => res({ data: e.target.result, name: file.name, type: file.type });
      img.src = e.target.result;
    };
    r.readAsDataURL(file);
  });
}

async function saveIncident(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const btn = document.getElementById('submitIncBtn') || event?.target?.closest('button');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري حفظ الواقعة والمرفقات...';
  }

  const g = (id) => document.getElementById(id)?.value?.trim() || '';
  const date = g('incDate') || new Date().toISOString().split('T')[0];
  const desc = g('incDesc') || '-';
  const incId = currentIncidentEditId || g('incId') || ("INC-" + Date.now());

  let fileData = null, fileName = '', mimeType = '';
  const fileInp = document.getElementById('incFileInp');
  if (fileInp && fileInp.files && fileInp.files[0]) {
    const upObj = await processFileForUpload(fileInp.files[0]);
    if (upObj) {
      fileData = upObj.data;
      fileName = upObj.name;
      mimeType = upObj.type;
    }
  }

  const finalAttachment = fileData || g('incAttach') || '';
  const incObj = {
    id: incId, date: date, time: g('incTime') || '', location: g('incLocation') || 'Apron',
    personnel: g('incPersonnel') || 'Nil', equipmentNo: g('incEquipmentNo') || 'Nil',
    driver: g('incDriver') || 'Nil', eqOwner: g('incEqOwner') || 'EMAAS handling company',
    status: g('incStatus') || 'In service', causes: g('incCauses') || 'Human Causes',
    charaterization: g('incChar') || 'Equipment Accident', riskSeverity: g('incRiskSev') || 'Minor',
    riskProb: g('incRiskProb') || 'Remote', checkboxes: '', car: g('incCar') || '-',
    flightNo: g('incFlightNo') || '-', reg: g('incReg') || '-', orgVia: '-', viaDst: '-',
    preparedBy: g('incPreparedBy') || 'إدارة سلامة المطارات', hazardDesc: g('incHazardDesc') || '-',
    description: desc, actionTaken: g('incAction') || '-', recommendation: g('incRecommendation') || '-',
    attachment_URL: finalAttachment, position: g('incPosition') || 'Nil', injuryType: g('incInjuryType') || 'Nil',
    causesDetails: g('incCausesDetails') || '-', type: g('incAcType') || '-'
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: currentIncidentEditId ? "updateIncident" : "submitIncident",
        incidentData: incObj,
        fileData: fileData,
        fileName: fileName,
        mimeType: mimeType
      })
    });

    if (!globalIncidents) globalIncidents = [];
    let exIdx = globalIncidents.findIndex(x => (x.ID || x.id) === incId);
    let mapped = {
      ID: incObj.id, Date: incObj.date, Time: incObj.time, Location: incObj.location,
      Personnel_Involved: incObj.personnel, Equipment_No: incObj.equipmentNo,
      Driver_Name: incObj.driver, Equipment_Owned: incObj.eqOwner, Status: incObj.status,
      Occurrence_Causes: incObj.causes, Characterization: incObj.charaterization,
      Risk_Severity: incObj.riskSeverity, Risk_Probability: incObj.riskProb,
      CAR: incObj.car, Flight_No: incObj.flightNo, REG: incObj.reg,
      Prepared_By: incObj.preparedBy, Hazard_Description: incObj.hazardDesc,
      Description: incObj.description, Action_Taken: incObj.actionTaken,
      Recommendation: incObj.recommendation, Attachment_URL: finalAttachment,
      Position: incObj.position, Injury_Type: incObj.injuryType, Causes_Details: incObj.causesDetails,
      TYPE: incObj.type
    };

    if (exIdx > -1) globalIncidents[exIdx] = mapped;
    else globalIncidents.unshift(mapped);

    window.globalIncidents = globalIncidents;
    try { localStorage.setItem('rmf_incidents', JSON.stringify(globalIncidents)); } catch (e) {}
    sortIncidentsByDate();
    alert('✅ تم حفظ الواقعة وتحديث السجل وقاعدة البيانات بنجاح!');
    clearIncidentForm();
    renderSavedIncidents();
    switchIncidentTab('monthly');
  } catch (err) {
    console.error(err);
    alert('❌ حدث خطأ أثناء الاتصال بالسيرفر لحفظ الواقعة.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderSavedIncidents() {
  const tb = document.getElementById('saved-inc-tbody');
  sortIncidentsByDate();
  let list = globalIncidents || [];

  const fChar = document.getElementById('incFilterChar')?.value || 'ALL';
  const fCau = document.getElementById('incFilterCauses')?.value || 'ALL';
  const fSev = document.getElementById('incFilterSev')?.value || 'ALL';
  const fProb = document.getElementById('incFilterProb')?.value || 'ALL';
  const fCar = document.getElementById('incFilterCar')?.value || 'ALL';
  const fReg = document.getElementById('incFilterReg')?.value || 'ALL';

  list = list.filter(i => {
    let cChar = fChar === 'ALL' || (i.Characterization || i.charaterization) === fChar;
    let cCau = fCau === 'ALL' || (i.Occurrence_Causes || i.causes) === fCau;
    let cSev = fSev === 'ALL' || (i.Risk_Severity || i.riskSeverity) === fSev;
    let cProb = fProb === 'ALL' || (i.Risk_Probability || i.riskProb) === fProb;
    let cCar = fCar === 'ALL' || (i.CAR || i.car) === fCar;
    let cReg = fReg === 'ALL' || (i.REG || i.reg) === fReg;
    return cChar && cCau && cSev && cProb && cCar && cReg;
  });

  updateIncidentNavCounter();
  if (!tb) return;
  tb.innerHTML = '';

  if (!list || list.length === 0) {
    tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:15px;color:#777;">لا توجد وقائع مطابقة للبحث</td></tr>';
    return;
  }

  list.forEach((item, idx) => {
    const id = item.ID || item.id || `INC-${idx}`;
    const dt = (item.Date || item.date || '').toString().split('T')[0];
    const loc = item.Location || item.location || '-';
    const flt = item.Flight_No || item.flightNo || item.CAR || '';
    const locFlt = flt ? `${loc} / ${flt}` : loc;
    const char = item.Characterization || item.charaterization || '-';
    const sev = item.Risk_Severity || item.riskSeverity || '-';
    const loss = item.Prepared_By || item.preparedBy || item.Personnel_Involved || '-';
    const sClr = sev === 'Catastrophic' || sev === 'Critical' ? '#dc3545' : (sev === 'Major' ? '#ffc107' : '#28a745');

    tb.innerHTML += `<tr style="border-bottom:1px solid #ddd;text-align:center;">
      <td style="padding:8px;" dir="ltr">${dt}</td>
      <td style="padding:8px;font-weight:bold;">${locFlt}</td>
      <td style="padding:8px;">${char}</td>
      <td style="padding:8px;"><span style="background:${sClr};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${sev}</span></td>
      <td style="padding:8px;">${loss}</td>
      <td style="padding:6px;display:flex;gap:4px;justify-content:center;align-items:center;">
        <button type="button" onclick="loadIncidentToForm(${idx});switchIncidentTab('entry');" title="عرض وتعديل الواقعة" style="background:#17a2b8;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
        <button type="button" onclick="printIsoIncidentReport('${id}')" title="طباعة تقرير ISO" style="background:#003366;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-print"></i></button>
        <button type="button" onclick="exportIsoIncidentImage('${id}')" title="تصدير كصورة PNG" style="background:#28a745;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-file-image"></i></button>
        <button type="button" onclick="deleteIncident('${id}')" title="حذف الواقعة" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
  });
}

async function deleteIncident(incId) {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذه الواقعة نهائياً من قاعدة البيانات؟")) return;
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: "deleteIncident", id: incId })
    });
    if (globalIncidents) {
      globalIncidents = globalIncidents.filter(x => (x.ID || x.id) !== incId);
      window.globalIncidents = globalIncidents;
      try { localStorage.setItem('rmf_incidents', JSON.stringify(globalIncidents)); } catch (e) {}
    }
    alert("✅ تم حذف الواقعة بنجاح!");
    renderSavedIncidents();
    updateIncidentNavCounter();
  } catch (e) {
    alert("❌ فشل الاتصال بالسيرفر لحذف الواقعة.");
  }
}

function generateIsoPagesHtml(inc) {
  const dt = (inc.Date || inc.date || '').toString().split('T')[0];
  const tm = inc.Time || inc.time || '';
  const loc = inc.Location || inc.location || 'Apron';
  const pInv = inc.Personnel_Involved || inc.personnel || 'Nil';
  const pos = inc.Position || inc.position || 'Nil';
  const injType = inc.Injury_Type || inc.injuryType || 'Nil';
  const car = inc.CAR || inc.car || '-';
  const flt = inc.Flight_No || inc.flightNo || '-';
  const reg = inc.REG || inc.reg || '-';
  const type = inc.TYPE || inc.type || '-';
  const eqNo = inc.Equipment_No || inc.equipmentNo || 'Nil';
  const eqOwn = inc.Equipment_Owned || inc.eqOwner || 'EMAAS handling company';
  const desc = (inc.Description || inc.description || '-').replace(/\n/g, '<br>');
  const haz = (inc.Hazard_Description || inc.hazardDesc || '-').replace(/\n/g, '<br>');
  const causes = (inc.Causes_Details || inc.causesDetails || inc.Occurrence_Causes || '-').replace(/\n/g, '<br>');
  const act = (inc.Action_Taken || inc.actionTaken || '-').replace(/\n/g, '<br>');
  const rec = (inc.Recommendation || inc.recommendation || '-').replace(/\n/g, '<br>');
  const charStr = inc.Characterization || inc.charaterization || '';
  const causesStr = inc.Occurrence_Causes || inc.causes || '';
  const attUrl = inc.Attachment_URL || inc.attachment_URL || '';
  const prepBy = inc.Prepared_By || inc.preparedBy || 'إدارة سلامة المطارات';

  const isEqAcc = charStr.includes('Equipment') ? '☑' : '☐';
  const isLeak = charStr.includes('Leakage') ? '☑' : '☐';
  const isPass = charStr.includes('Passenger') ? '☑' : '☐';
  const isFire = charStr.includes('Fire') ? '☑' : '☐';
  const isOthChar = (!isEqAcc.includes('☑') && !isLeak.includes('☑') && !isPass.includes('☑') && !isFire.includes('☑')) || charStr.includes('Other') ? '☑' : '☐';

  const isHum = causesStr.includes('Human') ? '☑' : '☐';
  const isNat = causesStr.includes('Natural') ? '☑' : '☐';
  const isTech = causesStr.includes('Technical') ? '☑' : '☐';
  const isLeg = causesStr.includes('Legal') ? '☑' : '☐';
  const isOrg = causesStr.includes('Organizational') ? '☑' : '☐';

  let attViewer = '';
  if (attUrl && attUrl.length > 10) {
    if (attUrl.includes('application/pdf') || attUrl.toLowerCase().endsWith('.pdf') || attUrl.includes('drive.google.com/file')) {
      attViewer = `<div style="text-align:center;padding:25px;background:#f8f9fa;border:1px dashed #003366;border-radius:6px;">
        <i class="fa-solid fa-file-pdf" style="font-size:3.5rem;color:#dc3545;margin-bottom:10px;"></i><br>
        <b style="font-size:12px;color:#003366;">مستند مرفق (PDF Document)</b><br>
        <a href="${attUrl}" target="_blank" style="display:inline-block;margin-top:10px;background:#003366;color:#fff;padding:6px 16px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:11px;">📄 استعراض المستند المرفق</a>
      </div>`;
    } else {
      attViewer = `<div style="text-align:center;padding:5px;"><img src="${attUrl}" style="max-width:98%;max-height:480px;object-fit:contain;border:1px solid #ccc;border-radius:6px;box-shadow:0 3px 10px rgba(0,0,0,0.1);"></div>`;
    }
  } else {
    attViewer = `<div style="text-align:center;color:#888;padding:25px;font-size:11px;background:#fafafa;border:1px dashed #ccc;border-radius:6px;">لا توجد مرفقات مسجلة لهذه الواقعة</div>`;
  }

  let p1 = `<div style="border:2px solid #000;padding:12px;box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif;font-size:10px;direction:rtl;color:#000;background:#fff;margin-bottom:20px;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:5px;font-weight:bold;font-size:12px;">
      <div>الإدارة العامة للمطابقة والسلامة</div>
      <div style="text-align:center;"><span>Mandatory reporting system</span></div>
      <div>مطار مرسى علم الدولي</div>
    </div>
    <div style="border:1.5px solid #000;text-align:center;margin:6px 0;padding:4px;background:#f5f5f5;">
      <h3 style="margin:2px 0;font-size:13px;">نموذج تقرير حادثة / واقعة</h3>
      <h4 style="margin:2px 0;font-size:11px;">Accident / Incident Safety Report Form</h4>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:6px;font-size:10px;" border="1" cellpadding="3">
      <tr><td style="width:13%;background:#f9f9f9;font-weight:bold;">التاريخ / Date</td><td style="width:20%;text-align:center;">${dt}</td><td style="width:13%;background:#f9f9f9;font-weight:bold;">الوقت / Time</td><td style="width:20%;text-align:center;">${tm}</td><td style="width:14%;background:#f9f9f9;font-weight:bold;">الموقع / Location</td><td style="width:20%;text-align:center;">${loc}</td></tr>
      <tr><td style="background:#f9f9f9;font-weight:bold;">اسم المصاب / Name</td><td colspan="3">${pInv}</td><td style="background:#f9f9f9;font-weight:bold;">عدد الإصابات</td><td style="text-align:center;">Nil</td></tr>
      <tr><td style="background:#f9f9f9;font-weight:bold;">الوظيفة / Position</td><td colspan="3">${pos}</td><td style="background:#f9f9f9;font-weight:bold;">نوع الإصابة</td><td style="text-align:center;">${injType}</td></tr>
      <tr><td style="background:#f9f9f9;font-weight:bold;">طراز الطائرة</td><td colspan="3">${type}</td><td style="background:#f9f9f9;font-weight:bold;">رقم الرحلة / Flight</td><td style="text-align:center;">${flt} / ${reg}</td></tr>
      <tr><td style="background:#f9f9f9;font-weight:bold;">الشركة / Agent</td><td colspan="3">${car} / ${eqOwn}</td><td style="background:#f9f9f9;font-weight:bold;">المعدة / Equipment</td><td style="text-align:center;">${eqNo}</td></tr>
    </table>
    <div style="display:flex;gap:6px;margin-bottom:6px;">
      <div style="flex:1;border:1px solid #000;padding:4px;font-size:9.5px;line-height:1.4;">
        <b>توصيف الحادث / Occurrence Characterization:</b><br>${isEqAcc} Equipment Accident<br>${isLeak} Leakage / Spill<br>${isPass} Passengers<br>${isFire} Fire Alarm<br>${isOthChar} Others
      </div>
      <div style="flex:1;border:1px solid #000;padding:4px;font-size:9.5px;line-height:1.4;">
        <b>مسببات الحادث / Occurrence Causes:</b><br>${isHum} Human Causes<br>${isNat} Natural Causes<br>${isTech} Technical Causes<br>${isLeg} Legal Causes<br>${isOrg} Organizational Causes
      </div>
    </div>
    <div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">الوصف / Description</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${desc}</div></div>
    <div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">المخاطر / Hazards</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${haz}</div></div>
    <div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">أوجه القصور / Causes</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${causes}</div></div>
    <div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">الإجراء المتخذ / Action Taken</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${act}</div></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px;border-top:1px solid #000;padding-top:4px;">
      <div><b>AS -F-01-05</b></div><div style="text-align:center;color:#28a745;font-weight:bold;">🛡️ SAFETY FIRST</div><div>Page 1</div>
    </div>
  </div>`;

  let p2 = `<div style="border:2px solid #000;padding:12px;box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif;font-size:10px;direction:rtl;color:#000;background:#fff;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:5px;font-weight:bold;font-size:12px;">
      <div>الإدارة العامة للمطابقة والسلامة</div>
      <div style="text-align:center;"><span>Mandatory reporting system</span></div>
      <div>مطار مرسى علم الدولي</div>
    </div>
    <div style="border:1.5px solid #000;margin:12px 0 10px 0;">
      <div style="background:#f0f0f0;font-weight:bold;padding:4px 8px;border-bottom:1.5px solid #000;font-size:11px;">التوصيات / Recommendation</div>
      <div style="padding:8px;min-height:90px;direction:ltr;text-align:left;font-size:10px;line-height:1.4;">${rec}</div>
    </div>
    <div style="border:1.5px solid #000;padding:10px;margin-bottom:15px;background:#fff;">
      <div style="font-weight:bold;font-size:11px;border-bottom:1.5px solid #000;padding-bottom:4px;margin-bottom:10px;">المرفقات / Attached Documentations</div>
      ${attViewer}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1.5px solid #000;padding-top:8px;">
      <div><b>AS -F-01-05</b><br><span style="font-size:8.5px;color:#555;">Page 2</span></div>
      <div style="text-align:center;color:#28a745;font-weight:bold;font-size:11px;">🛡️ SAFETY FIRST</div>
      <div style="text-align:left;direction:ltr;"><b>Prepared By</b><br>Airport Safety Manager<br><i style="font-family:cursive;font-size:14px;color:#003366;">${prepBy}</i></div>
    </div>
  </div>`;
  return p1 + p2;
}

function printIsoIncidentReport(incId) {
  const list = globalIncidents || [];
  const inc = list.find(x => (x.ID || x.id) === incId) || list[0];
  if (!inc) return alert("الواقعة غير موجودة!");
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html dir="rtl"><head><title>Incident Report AS-F-01-05</title><style>@page{size:A4 portrait;margin:8mm;}body{margin:0;padding:10px;font-family:'Segoe UI',Arial,sans-serif;}</style></head><body>${generateIsoPagesHtml(inc)}</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); }, 600);
}

function exportIsoIncidentImage(incId) {
  const list = globalIncidents || [];
  const inc = list.find(x => (x.ID || x.id) === incId) || list[0];
  if (!inc) return alert("الواقعة غير موجودة!");
  const dt = (inc.Date || inc.date || '').toString().split('T')[0];
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = "position:absolute;left:-9999px;top:-9999px;width:820px;background:#fff;padding:15px;";
  tempDiv.innerHTML = generateIsoPagesHtml(inc);
  document.body.appendChild(tempDiv);

  html2canvas(tempDiv, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false }).then(cvs => {
    cvs.toBlob(blob => {
      document.body.removeChild(tempDiv);
      if (!blob) return printIsoIncidentReport(incId);
      let u = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.download = `Incident_Report_AS_F_01_05_${dt}_${incId}.png`;
      a.href = u;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(u); }, 1000);
    }, 'image/png');
  }).catch(e => {
    document.body.removeChild(tempDiv);
    printIsoIncidentReport(incId);
  });
}

// =============================================================================
// 10. قسم الأجسام الغريبة (FOD Module)
// =============================================================================
function switchFodTab(t) {
  document.querySelectorAll('#fod-section .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#fod-section .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-fod-' + t)?.classList.add('active');
  document.getElementById('tab-fod-' + t)?.classList.add('active');
}

function generateFodInputRows() {
  const m = document.getElementById('fodInputMonth').value;
  if (!m) return alert("برجاء اختيار الشهر أولاً");
  document.getElementById('fodForm').style.display = 'block';
  const tb = document.getElementById('fod-input-tbody');
  tb.innerHTML = '';
  fodLocations.forEach((item, idx) => {
    tb.innerHTML += `<tr>
      <td><input type="date" id="fod_date_${idx}" required style="width:100%;"></td>
      <td><b>${item.loc}</b></td>
      <td>${item.area}</td>
      <td><input type="number" step="0.001" id="fod_p_${idx}" required style="width:100%;"></td>
      <td><input type="number" step="0.001" id="fod_m_${idx}" required style="width:100%;"></td>
    </tr>`;
  });
}

async function submitFOD(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('submitFodBtn');
  const msg = document.getElementById('fodMsg');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';
  }
  let arr = [], lArr = [];
  fodLocations.forEach((item, idx) => {
    let d = document.getElementById(`fod_date_${idx}`)?.value || new Date().toISOString().split('T')[0];
    let p = parseFloat(document.getElementById(`fod_p_${idx}`)?.value) || 0;
    let m = parseFloat(document.getElementById(`fod_m_${idx}`)?.value) || 0;
    let nId = "FOD-" + Date.now() + "-" + idx;
    arr.push({ id: nId, date: d, location: item.loc, area: item.area, plastic: p, metal: m });
    lArr.push({ ID: nId, Date: d, Location: item.loc, Area: item.area, Plastic: p, Metal: m });
  });

  safePost({ action: "submitBulkFOD", fodDataArray: arr }, btn, msg, "تم الحفظ بنجاح!", () => {
    globalFod = [...globalFod, ...lArr];
    setTimeout(() => { document.getElementById('fodForm').style.display = 'none'; }, 1500);
  });
}

function generateFodPrintReport() {
  const m = document.getElementById('fodReportMonth').value;
  if (!m) return alert("برجاء اختيار الشهر أولاً لعرض التقرير");
  let flt = globalFod.filter(f => {
    let rd = f.Date || f.date || '';
    if (!rd) return false;
    return (typeof rd === 'string' ? rd : new Date(rd).toISOString()).split('T')[0].startsWith(m);
  });
  const tb = document.getElementById('fod-print-tbody');
  if (!tb) return;
  tb.innerHTML = '';
  let tp = 0, tm = 0;
  fodLocations.forEach(loc => {
    let rc = flt.find(f => (f.Location || f.location) === loc.loc);
    let p = rc ? parseFloat(rc.Plastic || rc.plastic || 0) : 0;
    let met = rc ? parseFloat(rc.Metal || rc.metal || 0) : 0;
    tp += p; tm += met;
    let dD = rc && (rc.Date || rc.date) ? String(rc.Date || rc.date).split('T')[0] : '---';
    tb.innerHTML += `<tr>
      <td style="border:1px solid #777;padding:12px;">${dD}</td>
      <td style="border:1px solid #777;padding:12px;font-weight:bold;">${loc.loc}</td>
      <td style="border:1px solid #777;padding:12px;">${loc.area}</td>
      <td style="border:1px solid #777;padding:12px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td>
      <td style="border:1px solid #777;padding:12px;">${met > 0 ? met.toFixed(3) + ' kg' : '---'}</td>
      <td style="border:1px solid #777;padding:12px;">---</td>
    </tr>`;
  });
  tb.innerHTML += `<tr style="background:#fafafa;font-weight:bold;">
    <td colspan="3" style="border:1px solid #777;padding:12px;">الإجمالي</td>
    <td style="border:1px solid #777;padding:12px;">${tp.toFixed(3)} kg</td>
    <td style="border:1px solid #777;padding:12px;">${tm.toFixed(3)} kg</td>
    <td style="border:1px solid #777;padding:12px;color:#003366;">${(tp + tm).toFixed(3)} kg</td>
  </tr>`;
  document.getElementById('printable-fod-report').style.display = 'block';
}

function exportFodPDF() {
  html2pdf().set({
    margin: 0.2,
    filename: 'FOD_Report.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape' },
    pagebreak: { avoid: ['tr', 'table'] }
  }).from(document.getElementById('printable-fod-report')).save();
}

// =============================================================================
// 11. قسم التفتيش الربع سنوي (Quarterly Inspections Module)
// =============================================================================
function openQuarterlyCompany(cType) {
  document.getElementById('quarterlyCompanyType').value = cType;
  const titleEl = document.getElementById('quarterlyCompanyTitle');
  if (titleEl) titleEl.innerText = cType === 'ground' ? 'تقارير التفتيش الربع سنوي - شركة الخدمات الأرضية' : 'تقارير التفتيش الربع سنوي - شركة تموين الوقود';
  renderQuarterlyReports(cType);
  const box = document.getElementById('quarterly-company-box');
  if (box) {
    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth' });
  }
}

function viewQuarterlyPdf(url, fileName) {
  if (!url) return alert('رابط المستند غير صالح!');
  if (url.startsWith('http')) {
    window.open(url, '_blank');
    return;
  }
  try {
    let base64Parts = url.split(',');
    let base64Str = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    let byteCharacters = atob(base64Str);
    let byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    let byteArray = new Uint8Array(byteNumbers);
    let blob = new Blob([byteArray], { type: 'application/pdf' });
    let blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (e) {
    console.error(e);
    alert('تعذر فتح المستند.');
  }
}

function renderQuarterlyReports(cType) {
  const tb = document.getElementById('quarterly-reports-tbody');
  if (!tb) return;
  tb.innerHTML = '';
  const list = globalQuarterlyDocs[cType] || [];
  if (list.length === 0) {
    tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:12px;color:#777;">لا توجد تقارير PDF محفوظة لهذه الشركة بعد</td></tr>';
    return;
  }
  list.forEach((doc, idx) => {
    tb.innerHTML += `<tr style="text-align:center;border-bottom:1px solid #eee;">
      <td style="padding:6px;" dir="ltr">${doc.date || '-'}</td>
      <td style="padding:6px;font-weight:bold;color:#003366;">${doc.quarter || '-'}</td>
      <td style="padding:6px;">${doc.inspector || '-'}</td>
      <td style="padding:6px;">
        <button type="button" onclick="viewQuarterlyPdf(globalQuarterlyDocs['${cType}'][${idx}].url, '${doc.name || 'Report'}')" style="background:#dc3545;color:#fff;border:none;padding:5px 12px;border-radius:4px;font-weight:bold;font-size:10.5px;cursor:pointer;"><i class="fa-solid fa-file-pdf"></i> فتح PDF</button>
      </td>
      <td style="padding:6px;">
        <button type="button" onclick="deleteQuarterlyDoc('${cType}', ${idx})" style="background:#888;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
  });
}

async function uploadQuarterlyPdf() {
  const cType = document.getElementById('quarterlyCompanyType').value;
  const dateVal = document.getElementById('quarterlyDate').value;
  const qVal = document.getElementById('quarterlyQuarter').value;
  const inspVal = document.getElementById('quarterlyInspector').value;
  const fileInp = document.getElementById('quarterlyPdfFile');
  const btn = document.getElementById('uploadQuarterlyBtn');
  const msg = document.getElementById('quarterlyUploadMsg');

  if (!fileInp.files || !fileInp.files[0]) return alert("يرجى اختيار ملف PDF للتقرير!");
  const file = fileInp.files[0];
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري رفع التقرير وحفظه...';

  const reader = new FileReader();
  reader.onload = async e => {
    const base64Data = e.target.result;
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: "uploadQuarterlyDoc",
          companyType: cType,
          date: dateVal,
          quarter: qVal,
          inspector: inspVal,
          fileName: file.name,
          fileData: base64Data,
          mimeType: "application/pdf"
        })
      });
      const newDoc = { date: dateVal, quarter: qVal, inspector: inspVal, name: file.name, url: base64Data };
      if (!globalQuarterlyDocs[cType]) globalQuarterlyDocs[cType] = [];
      globalQuarterlyDocs[cType].unshift(newDoc);
      try { localStorage.setItem('rmf_quarterly_docs', JSON.stringify(globalQuarterlyDocs)); } catch (err) {}
      renderQuarterlyReports(cType);
      fileInp.value = '';
      msg.innerText = "✅ تم حفظ التقرير بنجاح!";
      msg.style.color = "#28a745";
      setTimeout(() => msg.innerText = "", 3500);
    } catch (err) {
      alert("❌ فشل رفع التقرير!");
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> رفع وحفظ تقرير التفتيش (PDF)';
    }
  };
  reader.readAsDataURL(file);
}

function deleteQuarterlyDoc(cType, idx) {
  if (!confirm("تأكيد حذف تقرير التفتيش هذا؟")) return;
  globalQuarterlyDocs[cType].splice(idx, 1);
  try { localStorage.setItem('rmf_quarterly_docs', JSON.stringify(globalQuarterlyDocs)); } catch (e) {}
  renderQuarterlyReports(cType);
}

// =============================================================================
// 12. قسم التقرير الشهري الشامل (مربوط بحركة التحركات الحية وتصدير كصورة PNG)
// =============================================================================
function formatTrendDifference(dV, iHb, un = "") {
  let n = parseFloat(dV);
  if (isNaN(n) || n === 0) return `<span style="color:#6c757d;font-weight:bold;">0 ${un} <i class="fa-solid fa-arrows-left-right"></i></span>`;
  let iP = n > 0, fV = Math.abs(n).toFixed(un.includes("كجم") ? 3 : 0);
  let iG = iHb ? iP : !iP;
  let clr = iG ? "#28a745" : "#dc3545";
  let aI = iP ? "fa-arrow-up" : "fa-arrow-down";
  return `<span style="color:${clr};font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">${fV} ${un} <i class="fa-solid ${aI}"></i></span>`;
}

function getPreviousMonthStr(ms) {
  if (!ms) return '';
  let p = ms.split('-');
  let y = parseInt(p[0]), m = parseInt(p[1]);
  let d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// دالة مساعدة لضمان توافر بيانات سنة التحركات في الذاكرة
async function ensureSpiYearData(year) {
  const yStr = String(year || '2026');
  if (window.globalSpiRecords && window.globalSpiRecords[yStr] && window.globalSpiRecords[yStr].movements) {
    return window.globalSpiRecords[yStr];
  }
  try {
    let ls = localStorage.getItem('spi_records_' + yStr);
    if (ls) {
      let pLs = JSON.parse(ls);
      if (pLs && pLs.movements) {
        window.globalSpiRecords = window.globalSpiRecords || {};
        window.globalSpiRecords[yStr] = pLs;
        return pLs;
      }
    }
  } catch(e) {}
  try {
    if (typeof API_URL !== 'undefined') {
      let res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "getSPIData", year: yStr })
      });
      let json = await res.json();
      if (json.status === "success" && json.data) {
        window.globalSpiRecords = window.globalSpiRecords || {};
        window.globalSpiRecords[yStr] = json.data;
        try { localStorage.setItem('spi_records_' + yStr, JSON.stringify(json.data)); } catch(e) {}
        return json.data;
      }
    }
  } catch(err) {
    console.warn("Could not fetch SPI for monthly report:", err);
  }
  return null;
}

function getMonthlyDetailedStats(ms) {
  let p = (ms || '').split('-'), y = p[0] || '2026', m = p[1] || '1';
  let mN = parseInt(m || '0').toString();
  let mInt = parseInt(mN);
  let s = { ms: ms, mov: 0, acc: 0, inc: 0, fT: 0, fO: 0, fC: 0, surv: [], fTot: 0, incList: [], fDept: {} };

  // 1. استخراج حركة الطائرات المعتمدة
  let movFound = 0;
  if (window.globalSpiRecords && window.globalSpiRecords[y] && window.globalSpiRecords[y].movements) {
    movFound = Number(window.globalSpiRecords[y].movements[mInt]) || 0;
  }
  // قاعدة أرقام 2026 الثابتة كخط أمان بديل
  if (!movFound && y === '2026') {
    const base2026 = { 1: 1333, 2: 1314, 3: 1620, 4: 1509, 5: 1534, 6: 1415, 7: 1571, 8: 1689, 9: 1662, 10: 1804, 11: 0, 12: 0 };
    movFound = base2026[mInt] || 0;
  }
  s.mov = movFound;

  // 2. الحوادث والوقائع
  if (globalIncidents) {
    globalIncidents.forEach(i => {
      let idt = i.Date ? String(i.Date).split('T')[0] : '';
      if (idt.startsWith(ms)) {
        if (i.Risk_Severity === 'Catastrophic') s.acc++;
        else s.inc++;
        s.incList.push(i);
      }
    });
  }

  // 3. الفحص اليومي
  if (globalDailyInspections) {
    globalDailyInspections.forEach(d => {
      let ddt = d.date ? String(d.date).split('T')[0] : '';
      if (ddt.startsWith(ms) && d.findings) {
        d.findings.forEach(f => {
          s.fT++;
          let isCl = (String(f.status || f.Status || '').trim() === 'مغلق' || String(f.status || f.Status || '').trim().toLowerCase() === 'closed' || String(f.note || '').includes('تم تلافي') || String(f.actionTaken || f.action || '').includes('تم تلافي'));
          if (isCl) s.fC++;
          else s.fO++;
          let resp = f.responsible || f.Responsible || 'أخرى';
          s.fDept[resp] = (s.fDept[resp] || 0) + 1;
        });
      }
    });
  }

  // 4. استبيانات الطيارين
  if (globalSurveys) {
    globalSurveys.forEach(sv => {
      let sdt = sv.Date ? String(sv.Date).split('T')[0] : '';
      if (sdt.startsWith(ms)) s.surv.push(sv);
    });
  }

  // 5. الأجسام الغريبة FOD
  if (globalFod) {
    globalFod.forEach(f => {
      let rd = f.Date || f.date || '';
      let fdt = (typeof rd === 'string' ? rd : new Date(rd).toISOString()).split('T')[0];
      if (fdt.startsWith(ms)) {
        s.fTot += (parseFloat(f.Plastic || f.plastic || 0) + parseFloat(f.Metal || f.metal || 0));
      }
    });
  }

  return s;
}

async function generateFullMonthlyReport() {
  const cm = document.getElementById('mainReportMonth')?.value;
  if (!cm) return alert("اختر الشهر أولاً لإصدار التقرير!");
  
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استدعاء البيانات...';
  }

  const prepBy = document.getElementById('mainReportPreparedBy')?.value?.trim() || 'سامي لوكاس';
  const pm = getPreviousMonthStr(cm);
  const curYear = cm.split('-')[0];
  const prevYear = pm.split('-')[0];

  // مزامنة أرقام التحركات الحية للسنة الحالية والسابقة
  await ensureSpiYearData(curYear);
  if (prevYear !== curYear) await ensureSpiYearData(prevYear);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-sync"></i> تجهيز التقرير الشامل';
  }

  const cDO = new Date(cm + "-01");
  let cS = getMonthlyDetailedStats(cm);
  let pS = getMonthlyDetailedStats(pm);

  const getUniqF = (mStr) => {
    let uM = {};
    if (globalDailyInspections) {
      globalDailyInspections.forEach(r => {
        let d = r.date ? String(r.date).split('T')[0] : '';
        if (d.startsWith(mStr) && r.findings) {
          r.findings.forEach(f => {
            let k = ((f.category || '').trim() + '___' + (f.item || '').trim() + '___' + (f.location || '').trim()).toLowerCase();
            let st = String(f.status || f.Status || '').trim().toLowerCase();
            let nt = String(f.note || '');
            let ac = String(f.actionTaken || f.action || '');
            let cl = (st === 'مغلق' || st === 'closed' || nt.includes('تم تلافي') || ac.includes('تم تلافي'));
            if (!uM[k]) {
              uM[k] = { c: cl, dept: f.responsible || 'أخرى' };
            } else if (cl) {
              uM[k].c = true;
            }
          });
        }
      });
    }
    let t = 0, c = 0, o = 0, dp = {};
    Object.keys(uM).forEach(k => {
      t++;
      if (uM[k].c) c++;
      else {
        o++;
        let d = uM[k].dept;
        dp[d] = (dp[d] || 0) + 1;
      }
    });
    return { t, c, o, dp };
  };

  let cUF = getUniqF(cm);
  let pUF = getUniqF(pm);
  cS.fT = cUF.t;
  cS.fO = cUF.o;
  cS.fC = cUF.c;
  if (Object.keys(cUF.dp).length > 0) cS.fDept = cUF.dp;
  pS.fT = pUF.t;
  pS.fO = pUF.o;
  pS.fC = pUF.c;

  const mEngName = cDO.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const mArabicName = cDO.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

  let oldFix = document.getElementById('mr-page-rules-style');
  if (oldFix) oldFix.remove();
  let st = document.createElement('style');
  st.id = 'mr-page-rules-style';
  st.innerHTML = `
    #printable-main-report {
      font-family: 'Cairo', sans-serif !important;
      direction: rtl !important;
      box-sizing: border-box !important;
      width: 100% !important;
      max-width: 860px !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background: #ffffff !important;
    }
    #printable-main-report * { box-sizing: border-box !important; }
    .mr-page {
      padding: 30px 25px !important;
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;
      margin-bottom: 25px !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.04) !important;
      box-sizing: border-box !important;
    }
    .mr-section-header {
      background: #003366 !important;
      color: #ffffff !important;
      padding: 8px 14px !important;
      border-radius: 6px !important;
      font-size: 13px !important;
      font-weight: bold !important;
      margin-bottom: 15px !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
    }
    .mr-table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 10px !important;
      margin-bottom: 15px !important;
    }
    .mr-table th {
      background: #f0f4f8 !important;
      color: #003366 !important;
      font-weight: bold !important;
      border: 1px solid #b0c4de !important;
      padding: 7px 6px !important;
      text-align: center !important;
    }
    .mr-table td {
      border: 1px solid #dcdcdc !important;
      padding: 6px 8px !important;
      text-align: center !important;
    }
    canvas#mrChart1, canvas#mrChart2, canvas#mrSurveyAirChart, canvas#mrSurveyEvalChart {
      width: 100% !important;
      height: 190px !important;
      max-height: 190px !important;
      display: block !important;
    }
  `;
  document.head.appendChild(st);

  // 1. صفحة الغلاف
  let p1Html = `
    <div class="mr-page" style="text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #003366; padding-bottom: 12px;">
        <div style="text-align: right;">
          <h2 style="color: #003366; font-size: 17px; font-weight: 900; margin: 0;">مطار مرسى علم الدولي</h2>
          <h3 style="color: #003366; font-size: 15px; font-weight: bold; margin: 4px 0 0 0;">الإدارة العامة للسلامة والمطابقة</h3>
          <h4 style="color: #555; font-size: 13px; margin: 3px 0 0 0;">إدارة سلامة المطارات</h4>
        </div>
        <div>
          <img src="LOGO-removebg-preview (1).png" alt="Logo" style="height: 65px; object-fit: contain;">
        </div>
      </div>

      <div style="margin: 25px auto; width: 100%;">
        <img src="Gemini_Generated_Image_vgja40vgja.jpg.jpg" 
             onerror="this.onerror=null; this.src='Gemini_Generated_Image_vgja40vgja.jpg';" 
             alt="Airport Safety" 
             style="width: 100%; max-width: 660px; max-height: 380px; object-fit: contain; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,51,102,0.12); border: 1px solid #e0e0e0; display: block; margin: 0 auto;">
      </div>

      <div style="margin: 20px auto;">
        <h1 style="color: #003366; font-size: 26px; font-weight: 900; margin: 0 0 6px 0;">التقرير الشهري لمنطقة التحركات الجوية</h1>
        <h2 style="color: #777; font-size: 17px; font-weight: bold; margin: 0 0 14px 0; font-family: sans-serif;">Airside Safety Monthly Report</h2>
        <div style="display: inline-block; background: #003366; color: #ffffff; padding: 7px 28px; border-radius: 25px; font-weight: bold; font-size: 14px; box-shadow: 0 3px 10px rgba(0,51,102,0.25);">
          ${mArabicName} - ${mEngName}
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1.5px solid #003366; padding-top: 15px; font-size: 12px; color: #333; margin-top: 30px;">
        <div style="text-align: right;">
          <span style="color: #777;">الجهة المصدرة:</span><br>
          <strong style="color: #003366; font-size: 13px;">الإدارة العامة للسلامة والمطابقة</strong>
        </div>
        <div style="text-align: left; direction: ltr;">
          <span style="color: #777;">Prepared By:</span><br>
          <strong style="color: #003366; font-size: 14px;">${prepBy}</strong>
        </div>
      </div>
    </div>
  `;

  // 2. الصفحة الثانية: مؤشرات الأداء والتحليل البياني
  let kpRows = '';
  const kp = [
    { l: "عدد التحركات الجوية", p: pS.mov, c: cS.mov, h: true, u: "" },
    { l: "عدد الحوادث", p: pS.acc, c: cS.acc, h: false, u: "" },
    { l: "عدد الوقائع", p: pS.inc, c: cS.inc, h: false, u: "" },
    { l: "حالات عدم المطابقة (الإجمالي)", p: pS.fT, c: cS.fT, h: false, u: "" },
    { l: "حالات عدم المطابقة المعلقة", p: pS.fO, c: cS.fO, h: false, u: "" },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: pS.fC, c: cS.fC, h: true, u: "" },
    { l: "استبيان الطيارين", p: pS.surv.length, c: cS.surv.length, h: true, u: "" },
    { l: "كمية الأجسام الغريبة FOD (بلاستيك + معدن)", p: pS.fTot, c: cS.fTot, h: false, u: "كجم", isF: true }
  ];

  kp.forEach(i => {
    let d = i.c - i.p;
    let tH = formatTrendDifference(d, i.h, i.u);
    let cD = i.isF ? i.c.toFixed(3) + " " + i.u : (i.c > 0 ? i.c.toLocaleString() : '0');
    let pD = i.isF ? i.p.toFixed(3) + " " + i.u : (i.p > 0 ? i.p.toLocaleString() : '0');
    kpRows += `<tr>
      <td style="border: 1px solid #dcdcdc; padding: 7px 10px; text-align: right; font-weight: bold; font-size: 11px;">${i.l}</td>
      <td style="border: 1px solid #dcdcdc; padding: 7px; direction: ltr; font-size: 11px;">${pD}</td>
      <td style="border: 1px solid #dcdcdc; padding: 7px; direction: ltr; font-weight: bold; background: #f9fbfd; font-size: 11px;">${cD}</td>
      <td style="border: 1px solid #dcdcdc; padding: 7px; text-align: center; font-size: 11px;">${tH}</td>
    </tr>`;
  });

  let p2Html = `
    <div class="mr-page">
      <div class="mr-section-header">
        <span>أولاً: مؤشرات الأداء العامة لمنطقة التحركات الجوية</span>
        <span style="font-size: 10.5px; opacity: 0.9;">مقارنة مع الشهر السابق</span>
      </div>
      <table class="mr-table">
        <thead>
          <tr>
            <th style="width: 42%; text-align: right; padding-right: 12px;">البيان</th>
            <th style="width: 18%;">الشهر السابق</th>
            <th style="width: 18%;">الشهر الحالي</th>
            <th style="width: 22%;">الفرق والاتجاه</th>
          </tr>
        </thead>
        <tbody>${kpRows}</tbody>
      </table>

      <div class="mr-section-header" style="margin-top: 25px;">
        <span>ثانياً: الحصر والتحليل البياني للمخالفات والوقائع</span>
        <span style="font-size: 10.5px; opacity: 0.9;">الرصد والإدارات المسؤولة</span>
      </div>
      <div style="display: flex; gap: 15px; margin-top: 10px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;">
          <h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">المخالفات المرصودة طبقاً للإدارة المسؤولة</h5>
          <canvas id="mrChart1"></canvas>
        </div>
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;">
          <h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">تصنيف الوقائع والحوادث المسجلة</h5>
          <canvas id="mrChart2"></canvas>
        </div>
      </div>
    </div>
  `;

  // 3. الصفحة الثالثة: حصر الوقائع والحوادث
  let iLHtml = '';
  let gI = {};
  cS.incList.forEach(i => {
    let ct = i.Characterization ? i.Characterization.split('/')[0].trim() : 'Others';
    if (!gI[ct]) gI[ct] = [];
    gI[ct].push(i);
  });

  if (Object.keys(gI).length === 0) {
    iLHtml = `
      <div style="background: #e8f5e9; border: 1.5px solid #28a745; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <i class="fa-solid fa-shield-halved" style="color: #28a745; font-size: 3rem; margin-bottom: 10px;"></i>
        <h3 style="color: #155724; margin: 0 0 6px 0;">سجل آمن 100%</h3>
        <p style="color: #28a745; margin: 0; font-weight: bold; font-size: 12px;">لم يتم تسجيل أي حوادث أو وقائع في منطقة التحركات الجوية خلال شهر ${mArabicName}.</p>
      </div>
    `;
  } else {
    let cIdx = 1;
    for (let ct in gI) {
      iLHtml += `
        <div style="background: #003366; color: #fff; font-weight: bold; padding: 6px 12px; margin-top: 12px; border-radius: 4px; display: flex; justify-content: space-between; font-size: 11px; direction: ltr;">
          <span>${ct} (${cIdx})</span>
          <span>Count: ${gI[ct].length}</span>
        </div>
        <table class="mr-table" style="direction: ltr; text-align: left; margin-bottom: 12px;">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">Seq</th>
              <th style="width: 55%; text-align: center;">Description / Action Taken</th>
              <th style="width: 15%; text-align: center;">Date</th>
              <th style="width: 25%; text-align: center;">Flight Information</th>
            </tr>
          </thead>
          <tbody>
      `;
      gI[ct].forEach((i, x) => {
        let dt = i.Date ? String(i.Date).split('T')[0] : '';
        let ds = i.Description ? i.Description.replace(/\n/g, '<br>') : '-';
        let ac = i.Action_Taken ? i.Action_Taken.replace(/\n/g, '<br>') : '-';
        let dsDir = /[\u0600-\u06FF]/.test(ds) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
        let acDir = /[\u0600-\u06FF]/.test(ac) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
        let fInfo = `<b>Airline:</b> ${i.CAR || '-'}<br><b>Local Agent:</b> ${i.Equipment_Owned || '-'}<br><b>FLT NO:</b> ${i.Flight_No || '-'}<br><b>REG:</b> ${i.REG || '-'}`;

        iLHtml += `
          <tr>
            <td style="text-align: center; font-weight: bold; vertical-align: middle; font-size: 11px;">0${x + 1}</td>
            <td style="padding: 8px 10px; vertical-align: middle;">
              <div style="text-align: center; margin-bottom: 3px;"><strong style="color: #003366; text-decoration: underline; font-size: 10px;">الوصف / Description</strong></div>
              <div style="${dsDir} margin-bottom: 10px; line-height: 1.4; font-size: 9.5px;">${ds}</div>
              <div style="text-align: center; margin-bottom: 3px;"><strong style="color: #28a745; text-decoration: underline; font-size: 10px;">الإجراء المتخذ / Action Taken</strong></div>
              <div style="${acDir} line-height: 1.4; font-size: 9.5px; color: #155724;">${ac}</div>
            </td>
            <td style="text-align: center; vertical-align: middle; font-weight: bold;">${dt}</td>
            <td style="text-align: left; vertical-align: middle; line-height: 1.5; font-size: 9px;">${fInfo}</td>
          </tr>
        `;
      });
      iLHtml += `</tbody></table>`;
      cIdx++;
    }
  }

  let p3Html = `
    <div class="mr-page">
      <div class="mr-section-header">
        <span>ثالثاً: حصر وسجل الوقائع والحوادث المسجلة خلال الشهر</span>
        <span style="font-size: 10.5px; opacity: 0.9;">إجمالي الوقائع: ${cS.inc + cS.acc}</span>
      </div>
      ${iLHtml}
    </div>
  `;

  // 4. الصفحة الرابعة: استبيان الطيارين
  let mS = { "Excellent": {}, "Good": {}, "Poor": {}, "N/A": {}, "Blank": {} };
  criteriaList.forEach(c => {
    mS["Excellent"][c] = 0; mS["Good"][c] = 0; mS["Poor"][c] = 0; mS["N/A"][c] = 0; mS["Blank"][c] = 0;
  });
  let aC = {}, eTC = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 }, cL = [];
  cS.surv.forEach(s => {
    if (s.CAR) aC[s.CAR] = (aC[s.CAR] || 0) + 1;
    criteriaList.forEach(c => {
      let v = s[c] || "Blank";
      if (mS[v]) mS[v][c]++;
      if (eTC[v] !== undefined) eTC[v]++;
    });
    if (s.Captain_Comments && s.Captain_Comments.trim() !== "") cL.push(s);
  });

  let mH = `
    <table class="mr-table" style="direction: ltr; text-align: center; font-size: 8.5px;">
      <thead>
        <tr style="background: #003366; color: #fff;">
          <th style="padding: 4px 6px; text-align: left; width: 40%; background: #003366; color: #fff;">Evaluation Criteria</th>
          <th style="padding: 4px; background: #28a745; color: #fff; width: 12%;">Excellent</th>
          <th style="padding: 4px; background: #ffc107; color: #000; width: 12%;">Good</th>
          <th style="padding: 4px; background: #dc3545; color: #fff; width: 12%;">Poor</th>
          <th style="padding: 4px; background: #6c757d; color: #fff; width: 12%;">N/A</th>
          <th style="padding: 4px; background: #1a2a6c; color: #fff; width: 12%;">Blank</th>
        </tr>
      </thead>
      <tbody>
  `;
  criteriaList.forEach(c => {
    mH += `
      <tr>
        <td style="padding: 3px 6px; text-align: left; font-weight: bold; background: #fbfbfb;">${c}</td>
        <td style="padding: 3px; color: ${mS["Excellent"][c] > 0 ? '#28a745' : '#bbb'}; font-weight: bold;">${mS["Excellent"][c] || 0}</td>
        <td style="padding: 3px; color: ${mS["Good"][c] > 0 ? '#ffc107' : '#bbb'}; font-weight: bold;">${mS["Good"][c] || 0}</td>
        <td style="padding: 3px; color: ${mS["Poor"][c] > 0 ? '#dc3545' : '#bbb'}; font-weight: bold;">${mS["Poor"][c] || 0}</td>
        <td style="padding: 3px; color: #777;">${mS["N/A"][c] || 0}</td>
        <td style="padding: 3px; color: #777;">${mS["Blank"][c] || 0}</td>
      </tr>
    `;
  });
  mH += `</tbody></table>`;

  let cH = `
    <div style="direction: ltr; text-align: left; margin-top: 15px;">
      <h5 style="color: #003366; margin-bottom: 6px; font-size: 11px;">Captain Comments & Observations:</h5>
      <table class="mr-table" style="direction: ltr; text-align: left; font-size: 9px;">
        <thead>
          <tr>
            <th style="width: 15%;">Airline</th>
            <th style="width: 12%; text-align: center;">FLT NO</th>
            <th style="width: 12%; text-align: center;">Type</th>
            <th style="width: 12%; text-align: center;">Date</th>
            <th style="width: 12%; text-align: center;">REG</th>
            <th style="width: 37%;">Comments</th>
          </tr>
        </thead>
        <tbody>
  `;
  if (cL.length === 0) {
    cH += `<tr><td colspan="6" style="padding: 8px; text-align: center; color: #777;">No comments recorded for this month.</td></tr>`;
  } else {
    cL.forEach(s => {
      let cmt = s.Captain_Comments || '-';
      let cmtDir = /[\u0600-\u06FF]/.test(cmt) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
      cH += `
        <tr>
          <td style="font-weight: bold;">${s.CAR || '-'}</td>
          <td style="text-align: center;">${s.Flight_NO || '-'}</td>
          <td style="text-align: center;">${s.TYPE || '-'}</td>
          <td style="text-align: center;" dir="ltr">${s.Date ? String(s.Date).split('T')[0] : ''}</td>
          <td style="text-align: center;">${s.REG || '-'}</td>
          <td style="${cmtDir}">${cmt}</td>
        </tr>
      `;
    });
  }
  cH += `</tbody></table></div>`;

  let p4Html = `
    <div class="mr-page">
      <div class="mr-section-header">
        <span>رابعاً: استبيان الطيارين (Pilot Safety Surveys)</span>
        <span style="font-size: 10.5px; opacity: 0.9;">إجمالي الاستبيانات: ${cS.surv.length}</span>
      </div>
      <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;">
          <h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">مشاركات شركات الطيران</h5>
          <canvas id="mrSurveyAirChart"></canvas>
        </div>
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;">
          <h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">توزيع التقييم العام للخدمات</h5>
          <canvas id="mrSurveyEvalChart"></canvas>
        </div>
      </div>
      <div style="text-align: center; margin-bottom: 8px;">
        <h5 style="color: #003366; margin: 0; font-size: 12px; font-weight: bold;">مصفوفة تقييم بنود السلامة (Safety Evaluation Matrix)</h5>
      </div>
      ${mH}
      ${cH}
    </div>
  `;

  // 5. الصفحة الخامسة: حصر وتصنيف FOD والتوقيعات
  let fF = globalFod.filter(f => {
    let rd = f.Date || f.date || '';
    return (typeof rd === 'string' ? rd : new Date(rd).toISOString()).split('T')[0].startsWith(cm);
  });
  let tp = 0, tm = 0, fR = '';
  fodLocations.forEach(loc => {
    let rc = fF.find(f => (f.Location || f.location) === loc.loc);
    let p = rc ? parseFloat(rc.Plastic || rc.plastic || 0) : 0;
    let met = rc ? parseFloat(rc.Metal || rc.metal || 0) : 0;
    tp += p; tm += met;
    let dD = rc && (rc.Date || rc.date) ? String(rc.Date || rc.date).split('T')[0] : '---';
    fR += `
      <tr>
        <td style="padding: 8px;" dir="ltr">${dD}</td>
        <td style="padding: 8px; text-align: left; font-weight: bold;">${loc.loc}</td>
        <td style="padding: 8px;">${loc.area}</td>
        <td style="padding: 8px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td>
        <td style="padding: 8px;">${met > 0 ? met.toFixed(3) + ' kg' : '---'}</td>
        <td style="padding: 8px; font-weight: bold;">${(p + met) > 0 ? (p + met).toFixed(3) + ' kg' : '---'}</td>
      </tr>
    `;
  });

  let p5Html = `
    <div class="mr-page">
      <div class="mr-section-header">
        <span>خامساً: حصر وتصنيف الأجسام الغريبة (F.O.D Collected)</span>
        <span style="font-size: 10.5px; opacity: 0.9;">شهر ${mArabicName}</span>
      </div>
      <table class="mr-table" style="direction: ltr; text-align: center; font-size: 10px;">
        <thead>
          <tr>
            <th rowspan="2" style="width: 15%;">Date</th>
            <th rowspan="2" style="width: 32%; text-align: left;">Location</th>
            <th rowspan="2" style="width: 15%;">Area</th>
            <th colspan="2" style="width: 24%;">FOD Quantity</th>
            <th rowspan="2" style="width: 14%;">Total</th>
          </tr>
          <tr>
            <th>Plastic (kg)</th>
            <th>Metal (kg)</th>
          </tr>
        </thead>
        <tbody>
          ${fR}
          <tr style="background: #f0f4f8; font-weight: bold;">
            <td colspan="3" style="text-align: left; padding: 10px;">Total Weight</td>
            <td style="padding: 10px; color: #003366;">${tp.toFixed(3)} kg</td>
            <td style="padding: 10px; color: #003366;">${tm.toFixed(3)} kg</td>
            <td style="padding: 10px; color: #28a745; font-size: 12px;">${(tp + tm).toFixed(3)} kg</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 40px;">
        <div style="text-align: center; font-size: 20px; font-weight: bold; color: #003366; font-family: cursive; margin-bottom: 25px;">
          Best Regards
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 20px;">
          <div style="text-align: center; min-width: 200px;">
            <div style="font-size: 14px; font-weight: bold; color: #003366; margin-bottom: 5px;">مُعِد التقرير</div>
            <div style="font-size: 14px; font-weight: 900; color: #222;">${prepBy}</div>
            <div style="font-size: 11px; color: #666; margin-top: 3px;">مدير سلامة المطارات</div>
          </div>
          <div style="text-align: center; min-width: 200px;">
            <div style="font-size: 14px; font-weight: bold; color: #003366; margin-bottom: 5px;">اعتماد</div>
            <div style="font-size: 14px; font-weight: 900; color: #222;">الإدارة العامة للسلامة والمطابقة</div>
            <div style="font-size: 11px; color: #666; margin-top: 3px;">مطار مرسى علم الدولي</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const repMain = document.getElementById('printable-main-report');
  if (repMain) {
    repMain.innerHTML = p1Html + p2Html + p3Html + p4Html + p5Html;
    repMain.style.display = 'block';
  }

  // رسم المخططات البيانية
  if (monthlyChart1) monthlyChart1.destroy();
  if (monthlyChart2) monthlyChart2.destroy();
  Chart.defaults.font.family = "'Cairo', sans-serif";

  let c1El = document.getElementById('mrChart1');
  if (c1El) {
    monthlyChart1 = new Chart(c1El.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(cS.fDept),
        datasets: [{ label: 'المخاطر طبقاً للإدارة', data: Object.values(cS.fDept), backgroundColor: '#003366', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  let iTC = {};
  cS.incList.forEach(i => {
    let ct = i.Characterization ? i.Characterization.split('/')[0].trim() : 'أخرى';
    iTC[ct] = (iTC[ct] || 0) + 1;
  });

  let c2El = document.getElementById('mrChart2');
  if (c2El) {
    monthlyChart2 = new Chart(c2El.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(iTC),
        datasets: [{ label: 'الوقائع', data: Object.values(iTC), backgroundColor: '#dc3545', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  if (mrSurveyAirChartInstance) mrSurveyAirChartInstance.destroy();
  let saEl = document.getElementById('mrSurveyAirChart');
  if (saEl) {
    mrSurveyAirChartInstance = new Chart(saEl.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(aC),
        datasets: [{ label: 'الاستبيانات', data: Object.values(aC), backgroundColor: '#003366', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  if (mrSurveyEvalChartInstance) mrSurveyEvalChartInstance.destroy();
  let seEl = document.getElementById('mrSurveyEvalChart');
  if (seEl) {
    mrSurveyEvalChartInstance = new Chart(seEl.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['ممتاز', 'جيد', 'ضعيف', 'غير منطبق', 'فارغ'],
        datasets: [{ data: Object.values(eTC), backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  repMain.scrollIntoView({ behavior: 'smooth' });
}

// -------------------------------------------------------------
// دالة تصدير التقرير كاملاً كصورة عالية الدقة PNG (تحل محل PDF تلقائياً)
// -------------------------------------------------------------
async function exportMainReportImage(format = 'png') {
  const el = document.getElementById('printable-main-report');
  if (!el || el.style.display === 'none') {
    return alert("يرجى الضغط على زر (تجهيز التقرير الشامل) أولاً!");
  }
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استخراج الصورة...';
  }

  const monthName = document.getElementById('mainReportMonth')?.value || 'Report';

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    canvas.toBlob(blob => {
      if (!blob) throw new Error("Blob creation failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Airside_Safety_Monthly_Report_${monthName}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }, 'image/png');
  } catch (err) {
    console.error("Export Image error:", err);
    alert("حدث خطأ أثناء استخراج الصورة، يرجى المحاولة مرة أخرى.");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

// تصدير كل صفحة من صفحات التقرير الـ 5 كصورة PNG مستقلة
async function exportMainReportPagesAsImages() {
  const el = document.getElementById('printable-main-report');
  if (!el || el.style.display === 'none') {
    return alert("يرجى الضغط على زر (تجهيز التقرير الشامل) أولاً!");
  }
  const pages = el.querySelectorAll('.mr-page');
  if (!pages || pages.length === 0) {
    return exportMainReportImage('png');
  }

  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استخراج الصفحات...';
  }

  const monthName = document.getElementById('mainReportMonth')?.value || 'Report';
  const pageTitles = [
    "01_Cover",
    "02_General_KPIs",
    "03_Incidents_Log",
    "04_Pilot_Surveys",
    "05_FOD_Collected"
  ];

  try {
    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      await new Promise(resolve => {
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const title = pageTitles[i] || `Page_${i + 1}`;
            a.download = `Monthly_Report_${monthName}_${title}.png`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              resolve();
            }, 600);
          } else {
            resolve();
          }
        }, 'image/png');
      });
    }

    alert("✅ تم استخراج صفحات التقرير الـ 5 بنجاح كصور PNG عالية الدقة!");
  } catch (err) {
    console.error("Export Pages error:", err);
    alert("حدث خطأ أثناء استخراج صفحات التقرير.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

// تحويل الزر القديم exportMainReportPDF ليعمل مباشرة كصورة PNG لمنع خروج ملف PDF مشوه
async function exportMainReportPDF() {
  return exportMainReportImage('png');
}
window.exportMainReportPDF = exportMainReportImage;

async function sendReportViaEmail() {
  const m = document.getElementById('mainReportMonth')?.value;
  if (!m) return alert("اختر الشهر أولاً لتجهيز التقرير!");
  const prepBy = document.getElementById('mainReportPreparedBy')?.value?.trim() || 'سامي لوكاس';
  let s = getMonthlyDetailedStats(m);

  let hB = `<div dir="rtl" style="font-family:Arial,sans-serif;color:#333;line-height:1.6;">
    <h2 style="color:#003366;border-bottom:2px solid #003366;padding-bottom:8px;">التقرير الشهري لمنطقة التحركات الجوية - ${m}</h2>
    <p><b>السادة / إدارة السلامة والمطابقة المحترمين،</b><br>تحية طيبة وبعد،،<br><br>نرفق لسيادتكم ملخص مؤشرات السلامة لمنطقة التحركات الجوية لشهر (${m}):</p>
    <table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:13px;" border="1" cellpadding="8">
      <tr style="background:#003366;color:#fff;"><th>مؤشر الأداء</th><th>القيمة</th></tr>
      <tr><td>عدد التحركات الجوية</td><td>${s.mov}</td></tr>
      <tr><td>عدد الحوادث</td><td>${s.acc}</td></tr>
      <tr><td>عدد الوقائع</td><td>${s.inc}</td></tr>
      <tr><td>إجمالي حالات عدم المطابقة</td><td>${s.fT} (المغلقة: ${s.fC} | المعلقة: ${s.fO})</td></tr>
      <tr><td>استبيانات الطيارين</td><td>${s.surv.length}</td></tr>
      <tr><td>إجمالي كميات FOD</td><td>${s.fTot.toFixed(3)} KG</td></tr>
    </table>
    <p><b>مُعِد التقرير:</b> ${prepBy}</p>
  </div>`;

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: "sendReportEmail",
        subject: `التقرير الشهري لمنطقة التحركات الجوية - ${m}`,
        htmlBody: hB
      })
    });
    alert("✅ تم إرسال التقرير بنجاح إلى إدارة السلامة والمطابقة!");
  } catch (err) {
    alert("❌ تعذر الاتصال بالسيرفر لإرسال الإيميل.");
  }
}
// -------------------------------------------------------------
// دالة تصدير التقرير كاملاً كصورة عريضة ونقية (Full PNG Image)
// -------------------------------------------------------------
async function exportMainReportImage(format = 'png') {
  const el = document.getElementById('printable-main-report');
  if (!el || el.style.display === 'none') {
    return alert("يرجى الضغط على زر (تجهيز التقرير الشامل) أولاً!");
  }
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استخراج الصورة...';
  }

  const monthName = document.getElementById('mainReportMonth')?.value || 'Report';

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    canvas.toBlob(blob => {
      if (!blob) throw new Error("Blob creation failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Airside_Safety_Monthly_Report_${monthName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }, mime, 0.95);
  } catch (err) {
    console.error("Export Image error:", err);
    alert("حدث خطأ أثناء استخراج الصورة، يرجى المحاولة مرة أخرى.");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

// -------------------------------------------------------------
// دالة تصدير صفحات التقرير منفصلة (5 صور PNG مستقلة عالية الدقة)
// -------------------------------------------------------------
async function exportMainReportPagesAsImages() {
  const el = document.getElementById('printable-main-report');
  if (!el || el.style.display === 'none') {
    return alert("يرجى الضغط على زر (تجهيز التقرير الشامل) أولاً!");
  }
  const pages = el.querySelectorAll('.mr-page');
  if (!pages || pages.length === 0) {
    return exportMainReportImage('png');
  }

  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استخراج الصفحات...';
  }

  const monthName = document.getElementById('mainReportMonth')?.value || 'Report';
  const pageTitles = [
    "01_Cover",
    "02_General_KPIs",
    "03_Incidents_Log",
    "04_Pilot_Surveys",
    "05_FOD_Collected"
  ];

  try {
    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      await new Promise(resolve => {
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const title = pageTitles[i] || `Page_${i + 1}`;
            a.download = `Monthly_Report_${monthName}_${title}.png`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              resolve();
            }, 600);
          } else {
            resolve();
          }
        }, 'image/png');
      });
    }

    alert("✅ تم استخراج جميع صفحات التقرير كصور PNG عالية الدقة بنجاح!");
  } catch (err) {
    console.error("Export Pages error:", err);
    alert("حدث خطأ أثناء استخراج صفحات التقرير.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

async function sendReportViaEmail() {
  const m = document.getElementById('mainReportMonth')?.value;
  if (!m) return alert("اختر الشهر أولاً لتجهيز التقرير!");
  const prepBy = document.getElementById('mainReportPreparedBy')?.value?.trim() || 'سامي لوكاس';
  let s = getMonthlyDetailedStats(m);

  let hB = `<div dir="rtl" style="font-family:Arial,sans-serif;color:#333;line-height:1.6;">
    <h2 style="color:#003366;border-bottom:2px solid #003366;padding-bottom:8px;">التقرير الشهري لمنطقة التحركات الجوية - ${m}</h2>
    <p><b>السادة / إدارة السلامة والمطابقة المحترمين،</b><br>تحية طيبة وبعد،،<br><br>نرفق لسيادتكم ملخص مؤشرات السلامة لمنطقة التحركات الجوية لشهر (${m}):</p>
    <table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:13px;" border="1" cellpadding="8">
      <tr style="background:#003366;color:#fff;"><th>مؤشر الأداء</th><th>القيمة</th></tr>
      <tr><td>عدد التحركات الجوية</td><td>${s.mov}</td></tr>
      <tr><td>عدد الحوادث</td><td>${s.acc}</td></tr>
      <tr><td>عدد الوقائع</td><td>${s.inc}</td></tr>
      <tr><td>إجمالي حالات عدم المطابقة</td><td>${s.fT} (المغلقة: ${s.fC} | المعلقة: ${s.fO})</td></tr>
      <tr><td>استبيانات الطيارين</td><td>${s.surv.length}</td></tr>
      <tr><td>إجمالي كميات FOD</td><td>${s.fTot.toFixed(3)} KG</td></tr>
    </table>
    <p><b>مُعِد التقرير:</b> ${prepBy}</p>
  </div>`;

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: "sendReportEmail",
        subject: `التقرير الشهري لمنطقة التحركات الجوية - ${m}`,
        htmlBody: hB
      })
    });
    alert("✅ تم إرسال التقرير بنجاح إلى إدارة السلامة والمطابقة!");
  } catch (err) {
    alert("❌ تعذر الاتصال بالسيرفر لإرسال الإيميل.");
  }
}
// =============================================================================
// 13. إدارة الحسابات والأسطول (Users & Fleet Registry Helpers)
// =============================================================================
function populateUsersDropdown(arr) {
  const datalist = document.getElementById('usersList');
  const userInp = document.getElementById('loginUser');
  if (!datalist) return;
  datalist.innerHTML = '';
  arr.forEach(u => {
    let opt = document.createElement('option');
    opt.value = u.Username;
    datalist.appendChild(opt);
  });
  if (userInp) userInp.value = "Admin";
}

function openFleetModal() { document.getElementById('addModal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('addModal').style.display = 'none'; }

function saveNewAircraft() {
  let reg = document.getElementById('newReg').value.toUpperCase();
  let type = document.getElementById('newType').value.toUpperCase();
  let airline = document.getElementById('newAirline').value.toUpperCase();

  safePost({
    action: "addNewAircraft",
    reg: reg,
    acType: type,
    airline: airline,
    handling: document.getElementById('newHandling').value,
    country: document.getElementById('newCountry').value
  }, document.querySelector('#addModal .submit-btn'), document.getElementById('modalMsg'), "تم!", () => {
    globalFleetData.unshift({ REG: reg, TYPE: type, CAR: airline });
    setTimeout(() => {
      closeAddModal();
      document.getElementById('newReg').value = "";
    }, 1000);
  });
}

function addUser(e) {
  e.preventDefault();
  let role = document.getElementById('newUserRole').value;
  let user = document.getElementById('newUsername').value;
  let pass = document.getElementById('newUserPass').value;

  safePost({
    action: "addUser",
    role: role,
    username: user,
    password: pass
  }, document.querySelector('#account-management-section .submit-btn'), document.getElementById('userMsg'), "تم!", () => {
    globalUsers.push({ Role: role, Username: user, Password: pass });
    document.getElementById('users-tbody').innerHTML += `<tr><td>#</td><td>${role}</td><td>${user}</td><td>${pass}</td></tr>`;
  });
}
