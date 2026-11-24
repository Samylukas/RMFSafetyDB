/**
 * General Department of Safety and Compliance - Marsa Alam Airport
 * Main Application Logic (script.js)
 */

// =============================================================================
// 0. محرك التصدير والمشاركة الذكي للموبايل آب والويب (Universal Mobile & Web Export)
// =============================================================================
window.isMobileAppOrDevice = function () {
  const ua = navigator.userAgent || '';
  const isTouchMobile = /Android|iPhone|iPad|iPod|WebView|wv|Capacitor|Cordova|Mobile/i.test(ua);
  const isLocalhostApp = (window.location && window.location.hostname === 'localhost');
  return isTouchMobile || isLocalhostApp;
};

window.rmfWithDesktopWidth = async function (el, fn, targetWidth = '820px') {
  if (!el) return await fn();
  const prevWidth = el.style.width;
  const prevMaxWidth = el.style.maxWidth;
  const prevMinWidth = el.style.minWidth;
  const prevMargin = el.style.margin;
  el.style.width = targetWidth;
  el.style.maxWidth = targetWidth;
  el.style.minWidth = targetWidth;
  el.style.margin = '0 auto';
  await new Promise(r => setTimeout(r, 80));
  try {
    return await fn();
  } finally {
    el.style.width = prevWidth;
    el.style.maxWidth = prevMaxWidth;
    el.style.minWidth = prevMinWidth;
    el.style.margin = prevMargin;
  }
};

window.rmfDataUrlToFile = function (dataUrl, filename, mimeType) {
  try {
    const parts = dataUrl.split(',');
    const mime = mimeType || (parts[0].match(/:(.*?);/) || [])[1] || 'application/octet-stream';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    return null;
  }
};

window.rmfShareFilesNative = async function (files, titleText) {
  try {
    if (navigator.canShare && navigator.canShare({ files: files })) {
      await navigator.share({
        files: files,
        title: titleText || 'تقرير إدارة السلامة والمطابقة',
        text: titleText || 'مرفق التقرير الصادر من نظام إدارة السلامة والمطابقة بمطار مرسى علم الدولي'
      });
      return true;
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return true;
  }
  return false;
};

window.rmfShowExportModal = function (items, modalTitle) {
  let old = document.getElementById('rmf-mobile-export-modal');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'rmf-mobile-export-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,15,35,0.82);z-index:999999;display:flex;justify-content:center;align-items:center;padding:12px;direction:rtl;font-family:Cairo,sans-serif;';

  const isMulti = items.length > 1;
  const isPdf = items.length === 1 && items[0].mimeType === 'application/pdf';

  let cardsHtml = items.map((it, idx) => {
    const previewHtml = it.mimeType === 'application/pdf'
      ? `<div style="padding:25px;background:#fff5f5;border:1.5px dashed #dc3545;border-radius:8px;text-align:center;margin:10px 0;">
           <i class="fa-solid fa-file-pdf" style="font-size:3.2rem;color:#dc3545;margin-bottom:8px;"></i>
           <div style="font-weight:900;color:#003366;font-size:0.95rem;direction:ltr;">${it.filename}</div>
           <div style="font-size:0.8rem;color:#555;margin-top:4px;">ملف PDF جاهز للحفظ أو المشاركة على الهاتف</div>
         </div>`
      : `<div style="margin:8px 0;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#f8fafc;text-align:center;">
           <img src="${it.dataUrl}" alt="${it.filename}" style="max-width:100%;max-height:${isMulti ? '260px' : '52vh'};object-fit:contain;display:block;margin:0 auto;">
         </div>`;

    return `
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-bottom:12px;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="font-weight:bold;color:#003366;font-size:0.85rem;direction:ltr;">${it.filename}</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="rmf-exp-share-one" data-idx="${idx}" style="background:#28a745;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-weight:bold;font-size:0.82rem;cursor:pointer;font-family:Cairo,sans-serif;">
              <i class="fa-solid fa-share-nodes"></i> مشاركة / حفظ
            </button>
            <a href="${it.dataUrl}" download="${it.filename}" style="background:#003366;color:#fff;text-decoration:none;padding:6px 12px;border-radius:6px;font-weight:bold;font-size:0.82rem;display:inline-flex;align-items:center;gap:5px;">
              <i class="fa-solid fa-download"></i> تنزيل
            </a>
          </div>
        </div>
        ${previewHtml}
      </div>
    `;
  }).join('');

  overlay.innerHTML = `
    <div style="background:#f8fafc;width:100%;max-width:640px;max-height:92vh;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,0.4);">
      <div style="background:#003366;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
        <h3 style="margin:0;font-size:1rem;font-weight:900;"><i class="fa-solid fa-file-export"></i> ${modalTitle || 'تصدير وحفظ التقرير'}</h3>
        <button type="button" id="rmf-exp-close-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:none;width:32px;height:32px;border-radius:50%;font-size:1.2rem;cursor:pointer;">&times;</button>
      </div>
      <div style="padding:12px 14px;overflow-y:auto;flex:1;">
        <div style="background:#e8f4fd;border-right:4px solid #003366;padding:8px 12px;border-radius:6px;font-size:0.82rem;color:#003366;font-weight:bold;margin-bottom:10px;">
          ${isPdf
            ? 'اضغط على (مشاركة / حفظ) لإرسال الملف أو حفظه في مدير الملفات، أو اضغط (تنزيل).'
            : 'اضغط على (مشاركة / حفظ) لحفظ الصورة في الهاتف أو إرسالها عبر واتساب، أو اضغط مطولاً على الصورة واختر (حفظ الصورة).'}
        </div>
        ${isMulti ? `<div style="margin-bottom:12px;text-align:center;">
          <button type="button" id="rmf-exp-share-all" style="background:#e67e22;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:900;font-size:0.92rem;cursor:pointer;width:100%;font-family:Cairo,sans-serif;">
            <i class="fa-solid fa-share-from-square"></i> مشاركة وحفظ جميع الصفحات (${items.length} صفحات) دفعة واحدة
          </button>
        </div>` : ''}
        ${cardsHtml}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('rmf-exp-close-btn').onclick = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelectorAll('.rmf-exp-share-one').forEach(btn => {
    btn.addEventListener('click', async () => {
      const i = Number(btn.getAttribute('data-idx'));
      const it = items[i];
      const f = window.rmfDataUrlToFile(it.dataUrl, it.filename, it.mimeType);
      if (f) {
        const ok = await window.rmfShareFilesNative([f], it.filename);
        if (!ok) alert('اضغط على زر (تنزيل) الأزرق أو اضغط مطولاً على الصورة لحفظها في الاستوديو.');
      }
    });
  });

  const shareAllBtn = document.getElementById('rmf-exp-share-all');
  if (shareAllBtn) {
    shareAllBtn.addEventListener('click', async () => {
      const allFiles = items.map(it => window.rmfDataUrlToFile(it.dataUrl, it.filename, it.mimeType)).filter(Boolean);
      if (allFiles.length > 0) {
        const ok = await window.rmfShareFilesNative(allFiles, modalTitle || 'صفحات التقرير');
        if (!ok) alert('يمكنك مشاركة أو تنزيل كل صفحة من الأزرار أدناه.');
      }
    });
  }
};

window.rmfUploadAndDownloadOnMobile = async function (dataUrl, filename, mimeType) {
  if (!navigator.onLine) return false;
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveExportedFile',
        performedBy: getCurrentActorName(),
        fileName: filename,
        mimeType: mimeType,
        fileData: dataUrl
      })
    });
    const json = await res.json();
    if (json && json.status === 'success' && json.downloadUrl) {
      window.location.href = json.downloadUrl;
      return true;
    }
  } catch (e) {
    console.warn('Mobile Drive export fallback:', e);
  }
  return false;
};

window.rmfExportCanvas = async function (canvas, filename, titleAr) {
  const dataUrl = canvas.toDataURL('image/png');
  if (!window.isMobileAppOrDevice()) {
    await new Promise(resolve => {
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); resolve(); }, 800);
        } else {
          resolve();
        }
      }, 'image/png');
    });
    return;
  }
  const okDrive = await window.rmfUploadAndDownloadOnMobile(dataUrl, filename, 'image/png');
  if (!okDrive) {
    const file = window.rmfDataUrlToFile(dataUrl, filename, 'image/png');
    if (file) await window.rmfShareFilesNative([file], titleAr || filename);
    window.rmfShowExportModal([{ dataUrl: dataUrl, filename: filename, mimeType: 'image/png' }], titleAr || filename);
  }
};

window.rmfExportMultiPages = async function (pageItems, titleAr) {
  if (!window.isMobileAppOrDevice()) {
    for (let i = 0; i < pageItems.length; i++) {
      const it = pageItems[i];
      await new Promise(resolve => {
        it.canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = it.filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); resolve(); }, 500);
          } else {
            resolve();
          }
        }, 'image/png');
      });
    }
    return;
  }
  const modalItems = pageItems.map(it => ({
    dataUrl: it.canvas.toDataURL('image/png'),
    filename: it.filename,
    mimeType: 'image/png'
  }));
  window.rmfShowExportModal(modalItems, titleAr || 'صفحات التقرير');
};

window.rmfExportElementToPdf = async function (element, filename, opt, titleAr) {
  if (!window.isMobileAppOrDevice()) {
    await html2pdf().set(opt).from(element).save();
    return;
  }
  const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
  const dataUrl = await new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(pdfBlob);
  });
  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
  await window.rmfShareFilesNative([pdfFile], titleAr || filename);
  window.rmfShowExportModal([{ dataUrl: dataUrl, filename: filename, mimeType: 'application/pdf' }], titleAr || filename);
};

window.rmfExportJsPdfInstance = async function (pdfInstance, filename, titleAr) {
  if (!window.isMobileAppOrDevice()) {
    pdfInstance.save(filename);
    return;
  }
  const pdfBlob = pdfInstance.output('blob');
  const dataUrl = await new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(pdfBlob);
  });
  const okDrive = await window.rmfUploadAndDownloadOnMobile(dataUrl, filename, 'application/pdf');
  if (!okDrive) {
    const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
    await window.rmfShareFilesNative([pdfFile], titleAr || filename);
    window.rmfShowExportModal([{ dataUrl: dataUrl, filename: filename, mimeType: 'application/pdf' }], titleAr || filename);
  }
};

window.rmfExportPdfBytes = async function (byteNumbers, filename, titleAr) {
  const blob = new Blob([byteNumbers], { type: 'application/pdf' });
  if (!window.isMobileAppOrDevice()) {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { document.body.removeChild(a); URL.revokeObjectURL(blobUrl); } catch (e) {} }, 1000);
    return;
  }
  const dataUrl = await new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(blob);
  });
  const pdfFile = new File([blob], filename, { type: 'application/pdf' });
  await window.rmfShareFilesNative([pdfFile], titleAr || filename);
  window.rmfShowExportModal([{ dataUrl: dataUrl, filename: filename, mimeType: 'application/pdf' }], titleAr || filename);
};

// =============================================================================
// 1. الثوابت والإعدادات العامة (Constants & Configurations)
// =============================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

const SPI_CONFIG = [
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

const dailyChecklistDataISO = {
  col1: { title: "المناطق المرصوفة", items: ["شروخ", "حفر(علي الأقل 5 بوصة عرض) (3بوصة عمق)", "هبوط", "تآكل", "مطاط", "نباتات", "أجسام غريبة FOD", "أخرى"], title2: "المناطق الغير مرصوفة", items2: ["غير مستوية", "نباتات", "عوائق", "أجسام غريبة FOD", "أخرى"], title3: "المساعدات الملاحية", items3: ["البيكون الدوار بالبرج لا يعمل", "كم الريح غير مطابق", "PAPI غير مطابق", "السارينة لاتعمل", "لمبات العوائق غير مضاءة", "أخرى"] },
  col2: { title: "التخطيط (Marking)", items: ["غير مطابق / واضح والمدرج RWY", "محور المدرج مغطي بالمطاط", "غير مطابق / واضح في Holding Position", "غير مطابق / واضح في الـ TXY", "غير مطابق / واضح في الترمك"], title2: "اللافتات الإرشادية", items2: ["غير مطابقة .", "غير مضاءة", "محجوبة بواسطة النباتات.", "قاعدتها الخرسانية أعلي من مستوي الأرض", "القواعد الغير قابلة للكسر.", "أخرى"], title3: "الإنارة", items3: ["لمبات مكسورة/ تالفة علي المدرج RWY", "لمبات مكسورة/ تالفة علي الممرات TXY", "لمبات مكسورة/ تالفة على الترمك", "إنارة وحدات Floodlight غير مطابقة أو أقل من (20لاكس)", "اللمبات الغاطسة غير مضاءة", "لمبات وحدات الإقتراب غير مطابقة", "لمبات العوائق غير مضاءة", "لمبات مكسورة / تالفة لإنارة الطرق الخدمية داخل Airside", "أخرى"] },
  col3: { title: "عملية تموين الوقود", items: ["وقوف غير سليم علي الطائرة", "الهروب السريع غير متوفر", "النظام الإطفائي غير مكتمل", "DEAD MAN غير مستعمل", "سلك التأريض غير موصل", "زر الطوارئ لايعمل", "عدد المشغلين غير كاف", "المشغل لا يرتدي مهمات السلامة", "أختبار العينة لا يتم إجراؤه", "منطقة العمل غير محددة", "حساسات المصعد لا تعمل", "ملصقات عدم التدخين والـ Jet A", "الـ Clear Exit غير متوفرة للسيارة", "البيكون لا يعمل", "السائبة العامة للسيارة غير لائقة", "عدم توافر المواد الماصة للوقود.", "إستخدام تليفون محمول في حدود 15 م أثناء التموين.", "أخرى"], title2: "أخطار الحياة البرية", items2: ["مشاهدة حيوانات برية / طيور مقيمة / نافقة", "وجود مصادر جذب للحياة البرية", "أخرى"] },
  col4: { title: "التحركات الأرضية ووقوف وإيواء الطائرات ومناولة الحقائب", items: ["سائق المعدة لا يحمل تصريح قيادة على المهبط", "رخصة المعدة غير متوفرة.", "عدم الإلتزام بالسرعات المقررة", "عدم إستخدام طريق الخدمة .", "إستخدام أكثر من 3 مقطورة أثناء الخدمة", "عدم تجميع الـ FOD الناتج من تحميل الحقائب", "إرتفاع الحقائب يتعدي 3 صفوف", "الأقماع غير موضوعة علي حدود الطائرة", "المعدة الأرضية غير مجهزة بليكون.", "المعدة الأرضية غير مطابقة .", "طفايات الحريق غير سارية.", "عملية الدفع للخلف تتم بسرعة غير مناسبة", "عدم إتباع تعليمات سلامة التحركات علي المهبط", "وجود أشخاص غير مصرح لهم.", "وجود معدات غير مصرح بها.", "عدم إرتداء مهمات الوقاية الشخصية", "أخرى"], title2: "الإنقاذ والإطفاء", items2: ["عدم صلاحية الإتصالات", "عدم الإستجابة السريعة للأفراد.", "نقص في عدد مشغلي سيارة الإطفاء", "أخرى"] }
};

const criteriaList = ["Communication Tower", "Communication Ground", "VOR-DME", "RNP APR 33_15", "Aeronautical Beacon", "Approach Lighting System", "PAPI System", "Wind Cone", "Apron Marking", "Apron Lighting", "Apron Signs", "APRON Stands Size", "G.H Performance", "Fuelling Performance", "Marshall Services", "RFF Team performance", "Runway Marking", "Runway Lighting", "Runway Signs", "RWY Brakes Action", "RWY Evaluating Pavement", "Taxi Way Marking", "Taxi Way Lighting", "Taxi Way Signs", "TWY Brakes Action", "TWY Evaluating Pavement", "Stop Bars", "Weather", "Wildlife", "Bird Strike", "FOD"];
const responsibleDepts = ["العمليات", "الهندسة المدنية", "الهندسة الكهربية", "الإنقاذ والإطفاء", "شركات الطيران / الوكالات", "الإرشاد", "أخرى"];
const fodLocations = [{ loc: "Aircraft Stands Area", area: "53.125 M²" }, { loc: "GSE Area", area: "4152 M²" }, { loc: "Arrival & Departures Gates", area: "2420 M²" }, { loc: "Around Aprons Gas station", area: "2539 M²" }];

var globalFleetData = [];
var globalSurveys = [];
var globalUsers = [];
var globalDailyInspections = [];
var globalIncidents = [];
var globalFod = [];
var globalSpiData = [];
var globalQuarterlyDocs = { ground: [], fuel: [] };
var globalAppLogs = [];
window.globalIncidents = globalIncidents;
window.globalSpiRecords = window.globalSpiRecords || {};

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

let chartInstances = {};
let monthlyChart1 = null;
let monthlyChart2 = null;
let mrSurveyAirChartInstance = null;
let mrSurveyEvalChartInstance = null;
let mrSpiTrendInstance = null;
let mrSpiCatInstance = null;
let mrSpiApronInstance = null;
let mrSpiWfInstance = null;
let mrSpiReportsInstance = null;

window.currentScheduleData = window.currentScheduleData || { english: null, arabic: null };
window.currentActiveDoc = null;
window.currentPdfBlobUrl = null;

let logoTripleClickCounter = 0;
let logoTripleClickTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  try {
    const cachedUsers = JSON.parse(localStorage.getItem('rmf_users_cache') || '[]');
    if (Array.isArray(cachedUsers) && cachedUsers.length > 0) globalUsers = cachedUsers;
  } catch (e) {}
  buildDailyChecklist();
  buildEvaluationForm();
  setupCustomDropdown();
  setupLoginUserDropdown();
  loadAppDataInit();
  try {
    const savedSess = sessionStorage.getItem('rmf_user');
    if (savedSess) {
      const uObj = JSON.parse(savedSess);
      if (uObj && uObj.Username) {
        currentLoggedInUser = uObj;
        const vSplash = document.getElementById('video-splash-screen');
        if (vSplash) vSplash.style.display = 'none';
        const lS = document.getElementById('login-screen');
        if (lS) lS.style.display = 'none';
        const hdr = document.getElementById('app-header');
        if (hdr) hdr.style.display = 'flex';
        const bBtn = document.getElementById('backToMainBtn');
        const r = (uObj.Role || '').toLowerCase();
        if (r.includes('safety') || r.includes('مطارات')) {
          if (bBtn) bBtn.style.display = 'none';
          openSection('airport-safety-dashboard');
        } else if (r.includes('osh') || r.includes('صحة') || r.includes('مهنية')) {
          openOshSection();
        } else if (r.includes('env') || r.includes('بيئة') || r.includes('برية')) {
          openEnvSection();
        } else if (r.includes('fire') || r.includes('حماية') || r.includes('مدنية')) {
          openCivilDefenseSection();
        } else {
          if (bBtn) bBtn.style.display = 'inline-block';
          openSection('main-dashboard');
        }
      } else {
        startSplashScreen();
      }
    } else {
      startSplashScreen();
    }
  } catch (e) {
    startSplashScreen();
  }
  
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('isoReportDate') && !document.getElementById('isoReportDate').value) document.getElementById('isoReportDate').value = today;
  if (document.getElementById('dailyDate') && !document.getElementById('dailyDate').value) document.getElementById('dailyDate').value = today;
});
function isCurrentUserAdmin() {
  const r = (currentLoggedInUser && currentLoggedInUser.Role ? currentLoggedInUser.Role : '').toLowerCase();
  return r.includes('admin');
}

function getCurrentActorName() {
  if (currentLoggedInUser && currentLoggedInUser.Username) return currentLoggedInUser.Username;
  try {
    const u = JSON.parse(sessionStorage.getItem('rmf_user') || 'null');
    if (u && u.Username) return u.Username;
  } catch (e) {}
  return 'Admin';
}

function handleLogoTripleClick() {
  logoTripleClickCounter++;
  if (logoTripleClickCounter === 1) {
    logoTripleClickTimer = setTimeout(() => { logoTripleClickCounter = 0; }, 900);
  } else if (logoTripleClickCounter === 3) {
    clearTimeout(logoTripleClickTimer);
    logoTripleClickCounter = 0;
    if (!isCurrentUserAdmin()) {
      alert('⚠️ هذه الصلاحية مخصصة لمدير النظام (Admin) فقط!');
      return;
    }
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
  let foundUser = globalUsers.find(user => String(user.Username).trim().toLowerCase() === u.toLowerCase() && String(user.Password).trim() === p);

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
    try { sessionStorage.setItem('rmf_user', JSON.stringify(foundUser)); } catch (e) {}
    try {
      const logEntry = {
        Timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'Africa/Cairo' }),
        Action: 'تسجيل دخول للنظام',
        Status: 'نجاح',
        Details: `المستخدم: ${foundUser.Username} | الصلاحية: ${foundUser.Role}`
      };
      globalAppLogs.unshift(logEntry);
      try { localStorage.setItem('rmf_app_logs', JSON.stringify(globalAppLogs)); } catch (e) {}
      fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'logLogin',
          performedBy: foundUser.Username,
          username: foundUser.Username,
          role: foundUser.Role
        })
      });
    } catch (e) {}
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
      openOshSection();
    } else if (r.includes('env') || r.includes('بيئة') || r.includes('برية')) {
      openEnvSection();
    } else if (r.includes('fire') || r.includes('حماية') || r.includes('مدنية')) {
      openCivilDefenseSection();
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
  try { sessionStorage.removeItem('rmf_user'); } catch (e) {}
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
  const subEl = document.getElementById('headerDeptSubtitle');
  const homeBtn = document.getElementById('headerHomeBtn');
  const hdrEl = document.getElementById('app-header');
  const r = (currentLoggedInUser && currentLoggedInUser.Role ? currentLoggedInUser.Role : '').toLowerCase();
  const isAdmin = r.includes('admin') || r === '';

  if (subEl && hdrEl) {
    if (sId === 'main-dashboard') {
      subEl.innerText = 'الإدارة العامة للسلامة والمطابقة';
      subEl.style.color = '#555';
      hdrEl.style.borderBottomColor = '#003366';
      if (homeBtn) homeBtn.style.display = 'none';
    } else if (sId === 'osh-section') {
      subEl.innerText = 'قسم السلامة والصحة المهنية (OSH)';
      subEl.style.color = '#fd7e14';
      hdrEl.style.borderBottomColor = '#fd7e14';
      if (homeBtn) homeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    } else if (sId === 'env-section') {
      subEl.innerText = 'قسم البيئة ومكافحة مخاطر الحياة البرية (ENV)';
      subEl.style.color = '#28a745';
      hdrEl.style.borderBottomColor = '#28a745';
      if (homeBtn) homeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    } else if (sId === 'civil-defense-section') {
      subEl.innerText = 'قسم سلامة الحماية المدنية (Civil Defense & ARFF)';
      subEl.style.color = '#dc3545';
      hdrEl.style.borderBottomColor = '#dc3545';
      if (homeBtn) homeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    } else if (sId === 'general-report-section') {
      subEl.innerText = 'التقرير الشهري المجمع للإدارة العامة للسلامة والمطابقة';
      subEl.style.color = '#e67e22';
      hdrEl.style.borderBottomColor = '#e67e22';
      if (homeBtn) homeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    } else if (sId === 'directory-section') {
      subEl.innerText = 'دليل هاتف مطار مرسى علم الدولي (Airport Phone Directory)';
      subEl.style.color = '#6f42c1';
      hdrEl.style.borderBottomColor = '#6f42c1';
      if (homeBtn) homeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    } else if (sId === 'flight-schedule-section') {
      subEl.innerText = 'جدول الرحلات اليومي (Flight Schedule)';
      subEl.style.color = '#003366';
      hdrEl.style.borderBottomColor = '#003366';
      if (homeBtn) homeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    } else {
      subEl.innerText = 'إدارة سلامة المطارات (Airport Safety Department)';
      subEl.style.color = '#003366';
      hdrEl.style.borderBottomColor = '#003366';
      if (homeBtn) homeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
  }
}

function openOshSection() {
  openSection('osh-section');
  if (typeof initOshSection === 'function') initOshSection();
}

function openEnvSection() {
  openSection('env-section');
  if (typeof initEnvSection === 'function') initEnvSection();
}

function openGeneralReportSection() {
  openSection('general-report-section');
  if (typeof initGeneralReportSection === 'function') initGeneralReportSection();
}

function openDirectorySection() {
  openSection('directory-section');
  if (typeof initDirectorySection === 'function') initDirectorySection();
}

function openAdminSection(sId) {
  if (!isCurrentUserAdmin()) {
    alert('⚠️ صلاحية مرفوضة: إدارة الحسابات وسجل المراقبة لمدير النظام (Admin) فقط!');
    return;
  }
  openSection(sId);
  renderUsersTable();
  renderAppLogs();
  refreshAppLogs();
}
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

function safePost(payload, btn, msgEl, successMsg, callback) {
  if (btn) {
    btn.disabled = true;
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
  }
  if (payload && typeof payload === 'object' && !payload.performedBy) {
    payload.performedBy = getCurrentActorName();
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
        globalSurveys = d.surveys ? [...d.surveys] : [];
        sortSurveysByDate();
        globalUsers = d.users || [];
        if (globalUsers.length > 0) {
          try { localStorage.setItem('rmf_users_cache', JSON.stringify(globalUsers)); } catch (e) {}
        }
        if (d.incidents && Array.isArray(d.incidents) && d.incidents.length > 0) {
          globalIncidents = d.incidents;
          window.globalIncidents = d.incidents;
          try { localStorage.setItem('rmf_incidents', JSON.stringify(globalIncidents)); } catch (e) {}
        }
        globalFod = d.fod || [];
        if (Array.isArray(d.directory) && d.directory.length > 0) {
          window.globalDirectoryData = d.directory;
          try { localStorage.setItem('rmf_phone_directory_cache', JSON.stringify(d.directory)); } catch (e) {}
          if (typeof receiveDirectoryFromAppData === 'function') receiveDirectoryFromAppData(d.directory);
        }
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

        if (d.cdDaily && Array.isArray(d.cdDaily) && d.cdDaily.length > 0) {
          globalCivilDefenseDaily = d.cdDaily;
          sortCdDailyByDate();
          try { localStorage.setItem('rmf_cd_daily', JSON.stringify(globalCivilDefenseDaily)); } catch (e) {}
        }
        if (d.cdMonthly && typeof d.cdMonthly === 'object' && Object.keys(d.cdMonthly).length > 0) {
          globalCivilDefenseMonthly = d.cdMonthly;
          try { localStorage.setItem('rmf_cd_monthly', JSON.stringify(globalCivilDefenseMonthly)); } catch (e) {}
        }
        try {
          localStorage.setItem('rmf_surveys', JSON.stringify(globalSurveys || []));
          localStorage.setItem('rmf_fod', JSON.stringify(globalFod || []));
          localStorage.setItem('rmf_movements', JSON.stringify(d.movements || []));
        } catch (e) {}

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
          globalDailyInspections = Object.values(rMap);
          sortDailyInspectionsByDate();
          try { localStorage.setItem('rmf_daily_inspections', JSON.stringify(globalDailyInspections)); } catch (e) {}
        }

        if (Array.isArray(d.logs)) {
          globalAppLogs = d.logs;
          try { localStorage.setItem('rmf_app_logs', JSON.stringify(globalAppLogs)); } catch (e) {}
        }
        populateUsersDropdown(globalUsers);
        renderUsersTable();
        renderAppLogs();
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
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
      }
    } catch (err) {
      canvasBox.innerHTML = '<div style="color:#fff;padding:20px;font-family:Cairo,sans-serif;"><p style="color:#ffcccc;">لم يتمكن الهاتف من عرض الملف داخلياً.</p><button type="button" onclick="openPdfInExternalViewer()" style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:bold;cursor:pointer;font-family:Cairo,sans-serif;"><i class="fa-solid fa-arrow-up-right-from-square"></i> اضغط هنا لفتح الجدول في تطبيق الهاتف</button></div>';
    }
  }
}

async function openPdfInExternalViewer() {
  if (!window.currentActiveDoc || !window.currentActiveDoc.pdfBase64) return alert('يرجى الانتظار حتى اكتمال جلب الملف.');
  const binaryStr = atob(window.currentActiveDoc.pdfBase64);
  const byteNumbers = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) byteNumbers[i] = binaryStr.charCodeAt(i);
  const fname = window.currentPdfFileName || window.currentActiveDoc.fileName || 'Flight_Schedule.pdf';
  await window.rmfExportPdfBytes(byteNumbers, fname, 'جدول الرحلات اليومي (PDF)');
}


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
      o.value = y; o.text = y;
      if (String(y) === String(curE)) o.selected = true;
      selEntry.appendChild(o);
    });
  }
  if (selMain && selMain.options.length <= 1) {
    const curM = selMain.value || '2026';
    selMain.innerHTML = '';
    years.forEach(y => {
      const o = document.createElement('option');
      o.value = y; o.text = y;
      if (String(y) === String(curM)) o.selected = true;
      selMain.appendChild(o);
    });
  }
  if (selComp && selComp.options.length <= 1) {
    const curC = selComp.value || 'none';
    selComp.innerHTML = '<option value="none">-- بدون مقارنة --</option>';
    years.forEach(y => {
      const o = document.createElement('option');
      o.value = y; o.text = y;
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
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ في الشيت...'; }

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
        body: JSON.stringify({ action: 'submitSPI', performedBy: getCurrentActorName(), year: year, month: month, movements: movements, spiData: window.globalSpiRecords[year] })
      });
    }
  } catch (err) { console.error(err); }

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الشهر'; }
  alert('✅ تم حفظ البيانات بنجاح وتحديث خلايا الشيت!');
  switchSpiTab('report');
}

function switchSpiTab(tab) {
  const bE = document.getElementById('btn-spi-entry');
  const bR = document.getElementById('btn-spi-report');
  const tE = document.getElementById('tab-spi-entry');
  const tR = document.getElementById('tab-spi-report');
  if (tab === 'entry') {
    bE?.classList.add('active'); bR?.classList.remove('active');
    tE?.classList.add('active'); tR?.classList.remove('active');
    renderSpiDynamicInputs();
  } else {
    bR?.classList.add('active'); bE?.classList.remove('active');
    tR?.classList.add('active'); tE?.classList.remove('active');
    generateSpiReport();
  }
}

async function generateSpiReport() {
  populateSpiYears();
  const yMain = document.getElementById('spiReportYear')?.value || '2026';
  const yComp = document.getElementById('spiCompareYear')?.value || 'none';
  const isCompare = (yComp !== 'none' && yComp !== yMain);
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استدعاء البيانات...'; }

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
    } catch (err) {}
    return (window.globalSpiRecords && window.globalSpiRecords[y]) ? window.globalSpiRecords[y] : { movements: {}, events: {} };
  }

  let dataMain = await fetchYearData(yMain);
  let dataComp = isCompare ? await fetchYearData(yComp) : { movements: {}, events: {} };

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-code-compare"></i> تحديث وعرض المقارنة'; }

  const mNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const movMain = mNames.map((_, i) => (dataMain?.movements && dataMain.movements[i + 1]) ? Number(dataMain.movements[i + 1]) : 0);
  const movComp = isCompare ? mNames.map((_, i) => (dataComp?.movements && dataComp.movements[i + 1]) ? Number(dataComp.movements[i + 1]) : 0) : [];
  const totMovMain = movMain.reduce((a, b) => a + b, 0);
  const totMovComp = isCompare ? movComp.reduce((a, b) => a + b, 0) : 0;

  const trendCtx = document.getElementById('spiTrendChart')?.getContext('2d');
  if (trendCtx) {
    if (window.spiTrendChartInstance) window.spiTrendChartInstance.destroy();
    let datasets = [{ label: 'Movements (' + yMain + ')', data: movMain, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.12)', borderWidth: 2.5, pointBackgroundColor: '#28a745', pointBorderColor: '#fff', pointRadius: 4, tension: 0.35, fill: true }];
    if (isCompare) datasets.push({ label: 'Movements (' + yComp + ')', data: movComp, borderColor: '#003366', backgroundColor: 'rgba(0,51,102,0.06)', borderWidth: 2.5, borderDash: [5, 5], pointBackgroundColor: '#003366', pointBorderColor: '#fff', pointRadius: 4, tension: 0.35, fill: true });
    window.spiTrendChartInstance = new Chart(trendCtx, { type: 'line', data: { labels: mNames, datasets: datasets }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top', labels: { font: { family: 'Cairo,sans-serif', weight: 'bold' } } } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { color: '#f9f9f9' } } } } });
  }

  const catTotalsMain = {}, catTotalsComp = {}, itemTotalsMain = {}, itemTotalsComp = {};
  SPI_CONFIG.forEach(cO => {
    let cSumM = 0, cSumC = 0;
    cO.items.forEach(itm => {
      let itmSumM = 0, itmSumC = 0;
      for (let m = 1; m <= 12; m++) {
        itmSumM += ((dataMain?.events && dataMain.events[itm] && dataMain.events[itm][m]) ? Number(dataMain.events[itm][m]) : 0);
        if (isCompare) itmSumC += ((dataComp?.events && dataComp.events[itm] && dataComp.events[itm][m]) ? Number(dataComp.events[itm][m]) : 0);
      }
      itemTotalsMain[itm] = itmSumM; itemTotalsComp[itm] = itmSumC;
      cSumM += itmSumM; cSumC += itmSumC;
    });
    catTotalsMain[cO.category] = cSumM; catTotalsComp[cO.category] = cSumC;
  });

  const pal = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#34495e'];

  const catCtx = document.getElementById('spiCategoryPieChart')?.getContext('2d');
  if (catCtx) {
    if (window.spiCategoryPieChartInstance) window.spiCategoryPieChartInstance.destroy();
    let cLabels = SPI_CONFIG.map(c => c.category);
    let cCounts = SPI_CONFIG.map(c => catTotalsMain[c.category] || 0);
    let hasC = cCounts.some(v => v > 0);
    window.spiCategoryPieChartInstance = new Chart(catCtx, { type: 'doughnut', data: { labels: hasC ? cLabels : ['لا توجد وقائع مسجلة'], datasets: [{ data: hasC ? cCounts : [1], backgroundColor: hasC ? pal : ['#e0e0e0'], borderWidth: 1.5 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'Cairo,sans-serif', size: 9 } } } } } });
  }

  const apronCtx = document.getElementById('spiApronPieChart')?.getContext('2d');
  if (apronCtx) {
    if (window.spiApronPieChartInstance) window.spiApronPieChartInstance.destroy();
    let aCat = SPI_CONFIG.find(c => c.category.includes('Taxiway & Apron'));
    let aLabels = aCat ? aCat.items.map(i => i.replace(/^Reported\s+/i, '')) : [];
    let aCounts = aCat ? aCat.items.map(i => itemTotalsMain[i] || 0) : [];
    let hasA = aCounts.some(v => v > 0);
    window.spiApronPieChartInstance = new Chart(apronCtx, { type: 'pie', data: { labels: hasA ? aLabels : ['لا توجد ملاحظات على الممرات والساحة'], datasets: [{ data: hasA ? aCounts : [1], backgroundColor: hasA ? ['#2980b9', '#3498db', '#1abc9c', '#16a085', '#27ae60', '#2ecc71', '#f39c12', '#e67e22', '#d35400', '#c0392b', '#8e44ad'] : ['#e0e0e0'], borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, font: { family: 'Cairo,sans-serif', size: 8.5 } } } } } });
  }

  const wfCtx = document.getElementById('spiWildlifeFodPieChart')?.getContext('2d');
  if (wfCtx) {
    if (window.spiWildlifeFodPieChartInstance) window.spiWildlifeFodPieChartInstance.destroy();
    let g3 = [...((SPI_CONFIG.find(c => c.category.includes('Runway Incursion')) || {}).items || []), ...((SPI_CONFIG.find(c => c.category.includes('Bird / Wildlife')) || {}).items || []), ...((SPI_CONFIG.find(c => c.category.includes('FOD')) || {}).items || [])];
    let g3L = g3.map(i => i.replace(/^Reported\s+/i, '').replace(/^Inspections in which\s+/i, ''));
    let g3C = g3.map(i => itemTotalsMain[i] || 0);
    let hasG3 = g3C.some(v => v > 0);
    window.spiWildlifeFodPieChartInstance = new Chart(wfCtx, { type: 'doughnut', data: { labels: hasG3 ? g3L.filter((_, idx) => g3C[idx] > 0) : ['لا توجد مؤشرات مسجلة بالمهبط والحياة البرية'], datasets: [{ data: hasG3 ? g3C.filter(v => v > 0) : [1], backgroundColor: hasG3 ? ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6'] : ['#e0e0e0'], borderWidth: 1.5 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, font: { family: 'Cairo,sans-serif', size: 8.5 } } } } } });
  }

  const repCtx = document.getElementById('spiSafetyReportsPieChart')?.getContext('2d');
  if (repCtx) {
    if (window.spiSafetyReportsPieChartInstance) window.spiSafetyReportsPieChartInstance.destroy();
    let recTot = itemTotalsMain["Number of received safety reports"] || 0;
    let clsTot = itemTotalsMain["Number of closed safety reports"] || 0;
    let openTot = Math.max(0, recTot - clsTot);
    let ratioPct = recTot > 0 ? ((clsTot / recTot) * 100).toFixed(1) : "0.0";
    let hasRep = (recTot > 0 || clsTot > 0);
    window.spiSafetyReportsPieChartInstance = new Chart(repCtx, {
      type: 'doughnut',
      data: {
        labels: hasRep ? [`مغلقة (Closed: ${clsTot}) - ${ratioPct}%`, `مفتوحة / قيد المتابعة (Open: ${openTot})`] : ['لا توجد تقارير سلامة مسجلة'],
        datasets: [{
          data: hasRep ? [clsTot, openTot] : [1],
          backgroundColor: hasRep ? ['#28a745', '#dc3545'] : ['#e0e0e0'],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'Cairo,sans-serif', size: 9, weight: 'bold' } } }
        }
      }
    });
  }

  const matrixBox = document.getElementById('spi-matrix-container');
  if (!matrixBox) return;

  let tbl = '<table class="report-table" style="width:100%; min-width:850px; border-collapse:collapse; font-size:11px; font-family:Cairo,sans-serif; direction:ltr; text-align:left; border:1px solid #ccc; box-shadow:0 3px 12px rgba(0,0,0,0.06);">';
  tbl += '<thead><tr style="background:#003366;color:#ffffff;text-align:center;"><th style="padding:10px 8px;text-align:left;min-width:320px;border:1px solid #1a4a75;font-size:12px;">Safety issue / SPI</th>';
  mNames.forEach(m => { tbl += `<th style="padding:8px 4px;border:1px solid #1a4a75;min-width:42px;font-size:11px;">${m}</th>`; });
  tbl += `<th style="padding:8px 6px;border:1px solid #1a4a75;min-width:70px;background:#002244;font-size:11.5px;">${yMain} Total</th>`;
  if (isCompare) { tbl += `<th style="padding:8px 6px;border:1px solid #1a4a75;min-width:70px;background:#1a4a75;font-size:11.5px;">${yComp} Total</th><th style="padding:8px 6px;border:1px solid #1a4a75;min-width:75px;background:#001a33;font-size:11.5px;">Variance (الفرق)</th>`; }
  tbl += '</tr></thead><tbody>';

  tbl += `<tr style="background:#003366;color:#ffffff;font-weight:bold;text-align:center;"><td style="text-align:left;padding:8px 10px;border:1px solid #1a4a75;">Number of aircraft movements</td>`;
  movMain.forEach(v => { tbl += `<td style="padding:8px 4px;border:1px solid #1a4a75;">${v > 0 ? v.toLocaleString() : '-'}</td>`; });
  tbl += `<td style="padding:8px 6px;border:1px solid #1a4a75;background:#002244;font-size:12px;">${totMovMain > 0 ? totMovMain.toLocaleString() : '-'}</td>`;
  if (isCompare) {
    let diffMov = totMovMain - totMovComp;
    let signM = diffMov > 0 ? `+${diffMov.toLocaleString()}` : diffMov.toLocaleString();
    let colM = diffMov >= 0 ? '#28a745' : '#dc3545';
    tbl += `<td style="padding:8px 6px;border:1px solid #1a4a75;background:#1a4a75;font-size:12px;">${totMovComp > 0 ? totMovComp.toLocaleString() : '-'}</td><td style="padding:8px 6px;border:1px solid #1a4a75;background:#001a33;font-weight:900;color:${colM};font-size:12px;">${diffMov !== 0 ? signM : '0'}</td>`;
  }
  tbl += '</tr>';

  const colSpanCount = isCompare ? 16 : 14;
  SPI_CONFIG.forEach(cO => {
    tbl += `<tr style="background:#d9ecf8;color:#003366;font-weight:900;border-top:2px solid #b8daff;"><td colspan="${colSpanCount}" style="padding:8px 10px;text-align:left;font-size:12px;">*${cO.category}</td></tr>`;
    cO.items.forEach((itm, idx) => {
      let rowBg = idx % 2 === 0 ? '#ffffff' : '#fcfcfc';
      let itmSumM = itemTotalsMain[itm] || 0, itmSumC = itemTotalsComp[itm] || 0;
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
        tbl += `<td style="padding:6px 4px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f8fb;">${itmSumC > 0 ? itmSumC : '-'}</td><td style="padding:6px 4px;border:1px solid #e0e0e0;font-weight:900;color:${col};background:#fafafa;">${diff !== 0 ? sign : '-'}</td>`;
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
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التصدير...'; }
  const opt = { margin: [8, 8, 8, 8], filename: `SPI_Report_${yMain}${isComp ? '_vs_' + yComp : ''}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, logging: false }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } };
  try { await window.rmfExportElementToPdf(el, opt.filename, opt, 'مؤشرات الأداء والحركة (SPI)'); } catch (err) { console.error(err); } finally { if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> تصدير (PDF)'; } }
}

function buildEvaluationForm() {
  const c = document.getElementById('criteria-container');
  if (!c) return;
  c.innerHTML = '';
  criteriaList.forEach((crit, idx) => {
    c.innerHTML += `<div class="eval-card"><div class="eval-title">${crit}</div><div class="radio-group"><input type="radio" id="c${idx}_e" name="${crit}" value="Excellent" checked><label for="c${idx}_e" class="lbl-e">E</label><input type="radio" id="c${idx}_g" name="${crit}" value="Good"><label for="c${idx}_g" class="lbl-g">G</label><input type="radio" id="c${idx}_p" name="${crit}" value="Poor"><label for="c${idx}_p" class="lbl-p">P</label><input type="radio" id="c${idx}_n" name="${crit}" value="N/A"><label for="c${idx}_n" class="lbl-n">N/A</label><input type="radio" id="c${idx}_b" name="${crit}" value="Blank"><label for="c${idx}_b" class="lbl-b">B</label></div></div>`;
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
  else if (dir === 'next') {
    if (currentSurveyIndex === -1) currentSurveyIndex = globalSurveys.length - 1;
    else if (currentSurveyIndex < globalSurveys.length - 1) currentSurveyIndex++;
  } else if (dir === 'prev') {
    if (currentSurveyIndex === -1) currentSurveyIndex = globalSurveys.length - 1;
    else if (currentSurveyIndex > 0) currentSurveyIndex--;
  }
  if (currentSurveyIndex >= 0 && currentSurveyIndex < globalSurveys.length) {
    displaySurveyInForm(globalSurveys[currentSurveyIndex]);
    updateSurveyNavCounter();
    isSurveyEditMode = false;
    let b = document.getElementById('submitSurveyBtn');
    let eBtn = document.getElementById('editSurveyBtn');
    if (b) { b.disabled = true; b.innerHTML = '<i class="fa-solid fa-eye"></i> وضع العرض'; b.style.backgroundColor = "#6c757d"; }
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
  if (b) { b.disabled = false; b.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تحديث بيانات الاستبيان'; b.style.backgroundColor = "#e67e22"; }
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
  if (b) { b.disabled = false; b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان'; b.style.backgroundColor = "var(--primary)"; }
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
    sortSurveysByDate();
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
  criteriaList.forEach(crit => { mS["Excellent"][crit] = 0; mS["Good"][crit] = 0; mS["Poor"][crit] = 0; mS["N/A"][crit] = 0; mS["Blank"][crit] = 0; });

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
    tb.innerHTML += `<tr><td><b>${s.CAR || ''}</b></td><td>${s.Flight_NO || ''}</td><td>${ds}</td><td>${s.REG || ''}</td><td style="color:#28a745;font-weight:bold;">${fC["Excellent"]}</td><td style="color:#ffc107;font-weight:bold;">${fC["Good"]}</td><td style="color:#dc3545;font-weight:bold;">${fC["Poor"]}</td><td>${fC["N/A"]}</td><td>${fC["Blank"]}</td></tr>`;
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
    chartInstances.eval = new Chart(ctxEval, { type: 'doughnut', data: { labels: ['ممتاز', 'جيد', 'ضعيف', 'غير منطبق', 'فارغ'], datasets: [{ data: [eC["Excellent"] || 0, eC["Good"] || 0, eC["Poor"] || 0, eC["N/A"] || 0, eC["Blank"] || 0], backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'], borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } } } });
  }

  let ctxAir = document.getElementById('airlinesChart')?.getContext('2d');
  if (ctxAir) {
    chartInstances.air = new Chart(ctxAir, { type: 'bar', data: { labels: Object.keys(aC), datasets: [{ label: 'الاستبيانات', data: Object.values(aC), backgroundColor: '#003366', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false } });
  }

  let ctxDates = document.getElementById('datesChart')?.getContext('2d');
  if (ctxDates) {
    chartInstances.dates = new Chart(ctxDates, { type: 'line', data: { labels: Object.keys(dC).sort(), datasets: [{ label: 'النشاط اليومي', data: Object.keys(dC).sort().map(d => dC[d]), borderColor: '#f39c12', tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false } });
  }

  let eH = `<div class="avoid-page-break" style="margin-top:35px;direction:ltr;"><h3 style="color:#003366;text-align:center;margin-bottom:12px;font-size:1.2rem;">Safety Captain Survey Report Evaluation Matrix</h3><div style="width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; margin-bottom:15px; border:1px solid #ccc; border-radius:6px;"><table style="width:100%; min-width:650px; border-collapse:collapse; font-size:11px; text-align:center;"><thead><tr style="background:#003366;color:#fff;"><th style="padding:8px;text-align:left;width:40%;">Evaluation Criteria</th><th style="padding:8px;background:#28a745;">Excellent</th><th style="padding:8px;background:#ffc107;color:#000;">Good</th><th style="padding:8px;background:#dc3545;">Poor</th><th style="padding:8px;background:#6c757d;">N/A</th><th style="padding:8px;background:#1a2a6c;">Blank</th></tr></thead><tbody>`;
  criteriaList.forEach(crit => {
    eH += `<tr><td style="padding:6px 10px;border:1px solid #ccc;text-align:left;font-weight:bold;background:#f9f9f9;">${crit}</td><td style="padding:6px;border:1px solid #ccc;font-weight:bold;color:${mS["Excellent"][crit] > 0 ? '#28a745' : '#aaa'};">${mS["Excellent"][crit] || 0}</td><td style="padding:6px;border:1px solid #ccc;font-weight:bold;color:${mS["Good"][crit] > 0 ? '#ffc107' : '#aaa'};">${mS["Good"][crit] || 0}</td><td style="padding:6px;border:1px solid #ccc;font-weight:bold;color:${mS["Poor"][crit] > 0 ? '#dc3545' : '#bbb'};">${mS["Poor"][crit] || 0}</td><td style="padding:6px;border:1px solid #ccc;color:#555;">${mS["N/A"][crit] || 0}</td><td style="padding:6px;border:1px solid #ccc;color:#555;">${mS["Blank"][crit] || 0}</td></tr>`;
  });
  eH += `</tbody></table></div></div>
  <div class="avoid-page-break" style="margin-top:35px;direction:ltr;text-align:left;"><h3 style="color:#003366;margin-bottom:10px;">Captain Comments & Observations:</h3><div style="width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; margin-bottom:15px; border:1px solid #000; border-radius:6px;"><table class="avoid-page-break" style="width:100%; min-width:650px; border-collapse:collapse; font-size:11px;"><thead style="background:#e6e6e6;"><tr><th style="padding:6px;border:1px solid #000;">Airline</th><th style="padding:6px;border:1px solid #000;">FLTNO</th><th style="padding:6px;border:1px solid #000;">Type</th><th style="padding:6px;border:1px solid #000;">Date</th><th style="padding:6px;border:1px solid #000;">REG</th><th style="padding:6px;border:1px solid #000;">Comments</th></tr></thead><tbody>`;
  if (cList.length === 0) eH += `<tr><td colspan="6" style="text-align:center;padding:10px;">No comments.</td></tr>`;
  else cList.forEach(s => { eH += `<tr><td style="border:1px solid #000;padding:6px;">${s.CAR || '-'}</td><td style="border:1px solid #000;padding:6px;">${s.Flight_NO || '-'}</td><td style="border:1px solid #000;padding:6px;">${s.TYPE || '-'}</td><td style="border:1px solid #000;padding:6px;">${s.Date ? String(s.Date).split('T')[0] : ''}</td><td style="border:1px solid #000;padding:6px;">${s.REG || '-'}</td><td style="border:1px solid #000;padding:6px;">${s.Captain_Comments}</td></tr>`; });
  eH += `</tbody></table></div></div>`;
  document.getElementById('additional-tables-container').innerHTML = eH;
}

function exportModernPDF() {
  window.rmfExportElementToPdf(document.getElementById('printable-report'), 'Captain_Surveys_Report.pdf', { margin: 0.3, filename: 'Captain_Surveys_Report.pdf', image: { type: 'jpeg', quality: 0.96 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'portrait', unit: 'in', format: 'a4' }, pagebreak: { mode: 'css', avoid: ['tr', 'table', '.avoid-page-break'] } }, 'تقرير استبيان الكابتن (PDF)');
}

function setupCustomDropdown() {
  const inp = document.getElementById('reg');
  const arr = document.getElementById('regArrowBtn');
  const lst = document.getElementById('regDropdownList');
  if (inp && arr && lst) {
    arr.addEventListener('click', e => { e.stopPropagation(); lst.classList.toggle('show'); filterRegOptions(true); });
    inp.addEventListener('input', () => { lst.classList.add('show'); filterRegOptions(false); let val = inp.value.toUpperCase().trim(); let f = globalFleetData.find(a => (a.REG || '').toString().toUpperCase().trim() === val); if (f) { document.getElementById('airline').value = f.CAR || ''; document.getElementById('acType').value = f.TYPE || ''; } });
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
    d.onclick = () => { inp.value = a.REG; document.getElementById('airline').value = a.CAR || ""; document.getElementById('acType').value = a.TYPE || ""; lst.classList.remove('show'); };
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
        h += `<div class="check-item"><div class="check-item-row"><input type="checkbox" id="chk_${cI}" value="${t}|${it}" onchange="toggleInputs(${cI})"><label for="chk_${cI}">${it}</label></div><div id="inputs_${cI}" class="check-inputs" style="display:none;flex-direction:column;gap:8px;margin-top:8px;padding:10px;background:#fdfdfd;border-right:4px solid #dc3545;border-radius:4px;"><input type="text" id="note_${cI}" placeholder="تفاصيل الملاحظة..." style="width:100%;padding:7px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;"><div style="display:flex;gap:5px;"><input type="text" id="loc_${cI}" placeholder="المكان..." style="flex:1;padding:7px;border:1px solid #ccc;border-radius:4px;"><select id="resp_${cI}" style="flex:1;padding:7px;border:1px solid #ccc;border-radius:4px;"><option value="" disabled selected>الجهة...</option>${opts}</select></div><input type="hidden" id="actionTaken_${cI}" value=""><input type="hidden" id="status_${cI}" value="مفتوح"><button type="button" id="rectifyBtn_${cI}" onclick="toggleRectifyFinding(this, ${cI})" style="background:#28a745;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:bold;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;"><i class="fa-solid fa-circle-check"></i> إغلاق وتلافي هذه الملاحظة الآن</button></div></div>`;
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
    stInp = document.createElement('input'); stInp.type = 'hidden'; stInp.id = `status_${idx}`; stInp.value = 'مفتوح'; btn.parentNode.appendChild(stInp);
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
    if (actInp) actInp.value = actInp.value.replace(/\[تم تلافي الملحوظة بتاريخ.*?\]/g, '').trim();
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
  currentDailyIndex = -1; isDailyEditMode = false; currentDailyEditId = null;
  document.getElementById('dailyForm').reset();
  document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach(c => c.checked = false);
  document.querySelectorAll('.check-inputs').forEach(el => el.style.display = 'none');
  let b = document.getElementById('submitDailyBtn');
  if (b) { b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الجولة'; b.style.backgroundColor = "var(--primary)"; }
  let now = new Date().toISOString();
  document.getElementById('dailyDate').value = now.split('T')[0];
  document.getElementById('dailyTime').value = now.split('T')[1].substring(0, 5);
  updateDailyNavCounter();
}

function navDaily(dir) {
  if (!globalDailyInspections || globalDailyInspections.length === 0) return alert("لا توجد فحوصات مسجلة.");
  if (dir === 'first') currentDailyIndex = 0;
  else if (dir === 'last') currentDailyIndex = globalDailyInspections.length - 1;
  else if (dir === 'next') {
    if (currentDailyIndex === -1) currentDailyIndex = globalDailyInspections.length - 1;
    else if (currentDailyIndex < globalDailyInspections.length - 1) currentDailyIndex++;
  } else if (dir === 'prev') {
    if (currentDailyIndex === -1) currentDailyIndex = globalDailyInspections.length - 1;
    else if (currentDailyIndex > 0) currentDailyIndex--;
  }
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
      let parts = chk.value.split('|'), cat = parts[0].trim(), itm = parts[1].trim();
      let found = rep.findings.find(x => (x.category || '').trim() === cat && (x.item || '').trim() === itm);
      if (found) {
        chk.checked = true;
        let inDiv = document.getElementById(`inputs_${chkIdx}`);
        if (inDiv) inDiv.style.display = 'flex';
        let fn = found.note || "", nT = "تم الرصد", aT = "";
        try { let m = fn.match(/الملاحظة: (.*?) - الإجراء: (.*?) - تاريخ التلافي: (.*)/); if (m) { nT = m[1]; aT = m[2]; } else { nT = fn; } } catch (e) {}
        if (document.getElementById(`note_${chkIdx}`)) document.getElementById(`note_${chkIdx}`).value = nT;
        if (document.getElementById(`actionTaken_${chkIdx}`)) document.getElementById(`actionTaken_${chkIdx}`).value = aT;
        if (document.getElementById(`loc_${chkIdx}`)) document.getElementById(`loc_${chkIdx}`).value = found.location || "";
        if (document.getElementById(`resp_${chkIdx}`)) document.getElementById(`resp_${chkIdx}`).value = found.responsible || "";

        let isClosed = (found.status === 'مغلق' || found.status === 'Closed' || fn.includes('تم تلافي') || aT.includes('تم تلافي'));
        let st = document.getElementById(`status_${chkIdx}`);
        let btn = document.getElementById(`rectifyBtn_${chkIdx}`);
        if (st) st.value = isClosed ? "مغلق" : "مفتوح";
        if (btn) {
          if (isClosed) { btn.style.backgroundColor = '#155724'; btn.innerHTML = `<i class="fa-solid fa-check-double"></i> تم تلافي وإغلاق الملاحظة`; }
          else { btn.style.backgroundColor = '#28a745'; btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> إغلاق وتلافي هذه الملاحظة الآن`; }
        }
      }
    });
  }
  if (typeof updateDailyNavCounter === 'function') updateDailyNavCounter();
  isDailyEditMode = true; currentDailyEditId = rep.id;
  let btn = document.getElementById('submitDailyBtn');
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> حفظ التعديلات وتحديث الحالة'; btn.style.backgroundColor = "#ffc107"; btn.style.color = "#000"; }
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
      let p = chk.value.split('|'), cat = p[0].trim(), itm = p[1] ? p[1].trim() : '';
      let noteVal = document.getElementById(`note_${chkIdx}`)?.value || '';
      let locVal = document.getElementById(`loc_${chkIdx}`)?.value || '';
      let respVal = document.getElementById(`resp_${chkIdx}`)?.value || '';
      let actVal = document.getElementById(`actionTaken_${chkIdx}`)?.value || '';
      let tDateVal = document.getElementById(`targetDate_${chkIdx}`)?.value || '';
      let stVal = document.getElementById(`status_${chkIdx}`)?.value || 'مفتوح';

      if (stVal === 'مغلق' || actVal.includes('تم تلافي')) {
        stVal = 'مغلق';
        if (!actVal.includes('تم تلافي')) { let todayStr = new Date().toISOString().split('T')[0]; actVal += (actVal ? ' - ' : '') + `[تم تلافي الملحوظة بتاريخ ${tDateVal || todayStr}]`; }
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
  }
  sortDailyInspectionsByDate();
  currentDailyIndex = globalDailyInspections.findIndex(x => x.id === repObj.id);
  if (currentDailyIndex < 0) currentDailyIndex = 0;
  renderSavedDaily();
  if (typeof updateDailyNavCounter === 'function') updateDailyNavCounter();

  let act = isDailyEditMode ? 'updateDailyInspection' : 'submitDailyInspection';
  safePost({ action: act, reportData: repObj }, btn, msg, 'تم الحفظ في جوجل شيت بنجاح!', () => {
    alert('✅ تم تثبيت الفحص في جوجل شيت بنجاح!');
    isDailyEditMode = false; currentDailyEditId = null;
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
  for (let idx = globalDailyInspections.length - 1; idx >= 0; idx--) {
    const rep = globalDailyInspections[idx];
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
    if (cnt === 0) badge = `<span style="background:#28a745; color:white; padding:3px 10px; border-radius:12px; font-weight:bold; font-size:11px;">سليم 100%</span>`;
    else {
      let redB = openCnt > 0 ? `<span style="background:#dc3545; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px; white-space:nowrap;">${openCnt} مخالفة مفتوحة</span>` : '';
      let grnB = clCnt > 0 ? `<span style="background:#28a745; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px; white-space:nowrap;"><i class="fa-solid fa-check"></i> ${clCnt} تم الإغلاق</span>` : '';
      badge = `<div style="display:flex; justify-content:center; align-items:center; gap:5px; flex-wrap:nowrap;">${redB}${grnB}</div>`;
    }
    tb.innerHTML += `<tr><td dir="ltr" style="font-weight:bold;"><span style="background:#003366;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-right:4px;">#${idx + 1}</span> ${rep.date}</td><td dir="ltr">${rep.time || '-'}</td><td>${rep.shift || '-'}</td><td>${rep.inspector || '-'}</td><td>${badge}</td><td style="white-space: nowrap;"><button type="button" onclick="previewDailyReport(${idx})" style="background:#003366; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:3px;" title="عرض وطباعة النموذج"><i class="fa-solid fa-eye"></i> النموذج</button><button type="button" onclick="loadDailyInspectionToForm(${idx})" style="background:#ffc107; color:#000; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; font-weight:bold; margin-left:3px;" title="تعديل هذا الفحص"><i class="fa-solid fa-pen"></i> تعديل</button><button type="button" onclick="deleteDailyInspectionRecord(${idx})" style="background:#dc3545; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; font-weight:bold; margin-left:3px;" title="إلغاء وحذف هذه الجولة"><i class="fa-solid fa-trash"></i> إلغاء</button><button type="button" onclick="copyDailyInspection(${idx})" style="background:#17a2b8; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:3px;" title="نسخ ملاحظات هذا اليوم إلى فحص جديد اليوم"><i class="fa-solid fa-copy"></i> نسخ لليوم</button></td></tr>`;
  }
}

function previewDailyReport(idx) { if (!globalDailyInspections || !globalDailyInspections[idx]) return; generateIsoDailyReport(globalDailyInspections[idx]); }
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
      let parts = chk.value.split('|'), cat = parts[0].trim(), itm = parts[1].trim();
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
  isDailyEditMode = false; currentDailyEditId = null;
  alert(`✅ تم نسخ (${count}) مخالفة مفتوحة بنجاح وتجاهل المخالفات المتلافية.`);
}

function generateIsoDailyReport(specificRep) {
  let rep = specificRep, targetD = '', targetS = 'صباحي';
  let todayStr = new Date().toISOString().split('T')[0];
  if (!rep) {
    targetD = document.getElementById('isoReportDate')?.value || '';
    targetS = document.getElementById('isoReportShift')?.value || 'صباحي';
    if (!targetD) { targetD = todayStr; if (document.getElementById('isoReportDate')) document.getElementById('isoReportDate').value = targetD; }
    if (typeof globalDailyInspections !== 'undefined' && globalDailyInspections.length > 0) {
      rep = globalDailyInspections.find(r => r && r.date === targetD && r.shift === targetS) || globalDailyInspections.find(r => r && r.date === targetD);
    }
    if (!rep) { rep = { date: targetD, shift: targetS, inspector: document.getElementById('dailyInspector')?.value || '', findings: [] }; }
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
  if (sAm && sPm) { sAm.innerHTML = isMorn ? '✔' : ''; sPm.innerHTML = !isMorn ? '✔' : ''; }
  let targetArea = container || document;
  targetArea.querySelectorAll('*').forEach(el => {
    if (el.children.length <= 1 && el.id !== 'iso-date-val') {
      let txt = (el.innerText || '').trim();
      if (txt.includes('التاريخ') || txt.includes('28 / 10 / 2026') || /28\s*[\/\-]\s*10\s*[\/\-]\s*2026/.test(txt)) {
        if (!txt.includes('AS-') && !txt.includes('تلافي')) el.innerText = `التاريخ: ${dispDate}`;
      }
      if (txt.includes('توقيع القائم بالتفتيش:')) { el.innerHTML = `توقيع القائم بالتفتيش: <b style="color:#003366;">${rep.inspector || 'مدير سلامة المطارات/ سامي لوكاس'}</b>`; }
    }
  });

  const isoColumns = [
    { title: "المناطق المرصوفة", items: dailyChecklistDataISO.col1.items },
    { title: "المناطق الغير مرصوفة", items: dailyChecklistDataISO.col1.items2 },
    { title: "المساعدات الملاحية", items: dailyChecklistDataISO.col1.items3 },
    { title: "التخطيط (Marking)", items: dailyChecklistDataISO.col2.items },
    { title: "اللافتات الإرشادية", items: dailyChecklistDataISO.col2.items2 },
    { title: "الإنارة", items: dailyChecklistDataISO.col2.items3 },
    { title: "عملية تموين الوقود", items: dailyChecklistDataISO.col3.items },
    { title: "أخطار الحياة البرية", items: dailyChecklistDataISO.col3.items2 },
    { title: "التحركات الأرضية ووقوف وإيواء الطائرات ومناولة الحقائب", items: dailyChecklistDataISO.col4.items },
    { title: "الإنقاذ والإطفاء", items: dailyChecklistDataISO.col4.items2 }
  ];

  let matrixBox = document.getElementById('iso-matrix-container');
  if (matrixBox) {
    matrixBox.style.display = 'block'; matrixBox.style.border = 'none'; matrixBox.style.marginBottom = '8px';
    let tblHtml = '<div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table style="width:100%; min-width:750px; border-collapse:collapse; border:1.5px solid #000; font-size:7.5px; direction:rtl; text-align:right;"><thead><tr style="background:#f2f2f2;">';
    isoColumns.forEach(col => { tblHtml += `<th style="border:1px solid #000; padding:4px 2px; text-align:center; font-size:8px; font-weight:bold; vertical-align:middle; width:10%;">${col.title}</th>`; });
    tblHtml += '</tr></thead><tbody><tr>';
    isoColumns.forEach(col => {
      tblHtml += '<td style="border:1px solid #000; vertical-align:top; padding:2px;">';
      col.items.forEach(itm => {
        let isFinding = rep.findings && rep.findings.some(f => {
          let fCat = (f.category || '').trim();
          let fItm = (f.item || f.Finding_Item || '').trim();
          return fCat === col.title.trim() && fItm === itm.trim();
        });
        let bg = isFinding ? 'background:#ffebee;' : '';
        let colStyle = isFinding ? 'color:#dc3545; font-weight:bold;' : 'color:#000;';
        let markIcon = isFinding ? '<span style="font-size:8.5px; margin-right:2px; display:inline-block; width:10px; height:10px; border:1px solid #dc3545; text-align:center; line-height:9px; background:#fff; color:#dc3545; font-weight:900;">✖</span>' : '<span style="font-size:8px; margin-right:2px; display:inline-block; width:10px; height:10px; border:1px solid #000; text-align:center; line-height:9px; background:#fff; color:#000;">✔</span>';
        tblHtml += `<div style="display:flex; justify-content:space-between; align-items:center; padding:1.5px 2px; border-bottom:1px solid #eee; font-size:7.5px; line-height:1.2; ${bg}"><span style="${colStyle}">${itm}</span>${markIcon}</div>`;
      });
      tblHtml += '</td>';
    });
    tblHtml += '</tr></tbody></table></div>';
    matrixBox.innerHTML = tblHtml;
  }

  let tb = document.getElementById('iso-findings-tbody');
  if (tb) {
    tb.innerHTML = '';
    if (!rep.findings || rep.findings.length === 0) {
      tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:12px;font-weight:bold;color:#28a745;font-size:11px;">سليم 100% ولا توجد ملاحظات عدم مطابقة</td></tr>';
    } else {
      let seq = 1;
      rep.findings.forEach(f => {
        let fn = f.note || '', nT = fn, aT = 'لم يحدد', tD = '';
        try { let m = fn.match(/الملاحظة: (.*?) - الإجراء: (.*?) - تاريخ التلافي: (.*)/); if (m) { nT = m[1]; aT = m[2]; tD = (m[3] !== 'غير محدد') ? m[3] : ''; } } catch (e) {}
        let stStr = String(f.status || f.Status || '').trim().toLowerCase();
        let isCl = (stStr === 'مغلق' || stStr === 'closed' || fn.includes('تم تلافي') || aT.includes('تم تلافي'));
        let stBadge = isCl ? '<span style="color:#28a745;font-weight:900;font-size:11px;background:#e8f5e9;padding:2px 6px;border-radius:4px;border:1px solid #28a745;">مغلق</span>' : '<span style="color:#dc3545;font-weight:900;font-size:11px;background:#ffebee;padding:2px 6px;border-radius:4px;border:1px solid #dc3545;">مفتوح</span>';
        let clMatch = aT.match(/\[تم تلافي الملحوظة بتاريخ (.*?)\]/) || fn.match(/\[تم تلافي الملحوظة بتاريخ (.*?)\]/);
        let rawClDate = clMatch ? clMatch[1] : (tD && tD !== '' ? tD : rep.date);
        let clNoteHtml = isCl ? `<div style="color:#155724;background:#d4edda;border:1px solid #c3e6cb;font-weight:bold;font-size:9px;margin-top:4px;padding:2px 6px;border-radius:4px;display:inline-block;"><i class="fa-solid fa-check-double"></i> تم تلافي الملحوظة بتاريخ ${rawClDate}</div>` : '';
        let cleanAct = aT.replace(/\[تم تلافي الملحوظة بتاريخ.*?\]/g, '').trim();
        let actText = (cleanAct !== 'لم يحدد' && cleanAct !== '') ? `<br><span style="color:#555;font-size:8.5px;">${cleanAct}</span>` : '';
        tb.innerHTML += `<tr><td style="text-align:center;width:5%;padding:6px;border:1px solid #000;font-weight:bold;">${seq++}</td><td style="text-align:center;width:15%;padding:6px;border:1px solid #000;font-weight:bold;">${f.location || '-'}</td><td style="text-align:right;width:45%;padding:6px;border:1px solid #000;line-height:1.4;"><span style="color:#dc3545;font-weight:bold;font-size:10px;">${f.category} - ${f.item}</span><br><span style="color:#333;font-size:9.5px;">(${nT})</span>${clNoteHtml ? '<br>' + clNoteHtml : ''}</td><td style="text-align:center;width:15%;padding:6px;border:1px solid #000;">${f.responsible || '-'}</td><td style="text-align:center;width:20%;padding:6px;border:1px solid #000;">${stBadge}${actText}</td></tr>`;
      });
    }
  }
}

function exportDailyPNG() {
  const btn = event?.target?.closest('button');
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> استخراج...'; }
  let target = document.getElementById('printable-daily-report') || document.getElementById('as-f-01-01-container');
  if (!target || target.style.display === 'none') { if (btn) { btn.disabled = false; btn.innerHTML = origHtml; } return alert("يرجى الضغط على زر (عرض النموذج) أولاً!"); }
  let dt = (document.getElementById('isoReportDate')?.value || new Date().toISOString().split('T')[0]);
  const doCapture = async () => {
    try {
      const cvs = await window.rmfWithDesktopWidth(target, () => html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false }), '860px');
      await window.rmfExportCanvas(cvs, `Daily_Inspection_AS_F_01_01_${dt}.png`, `نموذج الفحص اليومي (${dt})`);
    } catch (err) {
      alert("خطأ أثناء إنشاء الصورة!");
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
    }
  };
  if (typeof html2canvas === 'undefined') { let s = document.createElement('script'); s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload = doCapture; document.head.appendChild(s); } else { doCapture(); }
}

// =============================================================================
// 9. قسم سجل الحوادث والوقائع (Incidents & Accidents Module)
// =============================================================================
function parseRecordDateTime(dateVal, timeVal) {
  let dStr = dateVal ? String(dateVal).trim() : '';
  if (dStr.includes('T')) {
    let dtIso = new Date(dStr);
    if (!isNaN(dtIso.getTime())) {
      dStr = dtIso.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
    } else {
      dStr = dStr.split('T')[0];
    }
  }
  let mDmy = dStr.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (mDmy) {
    dStr = `${mDmy[3]}-${String(mDmy[2]).padStart(2, '0')}-${String(mDmy[1]).padStart(2, '0')}`;
  }
  let mYmd = dStr.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (mYmd) {
    dStr = `${mYmd[1]}-${String(mYmd[2]).padStart(2, '0')}-${String(mYmd[3]).padStart(2, '0')}`;
  }
  if (!dStr) return 0;
  let tStr = timeVal ? String(timeVal).trim() : '00:00';
  if (tStr.includes('T')) {
    let dt = new Date(tStr);
    if (!isNaN(dt.getTime())) tStr = dt.toISOString().substring(11, 16);
  }
  if (!/^\d{1,2}:\d{2}/.test(tStr)) tStr = '00:00';
  else if (tStr.indexOf(':') === 1) tStr = '0' + tStr;
  let ts = Date.parse(`${dStr}T${tStr.substring(0, 5)}:00`);
  if (isNaN(ts)) ts = Date.parse(dStr);
  return isNaN(ts) ? 0 : ts;
}

function sortSurveysByDate() {
  if (!Array.isArray(globalSurveys)) return;
  globalSurveys.sort((a, b) => parseRecordDateTime(a.Date, a.Time) - parseRecordDateTime(b.Date, b.Time));
}

function sortDailyInspectionsByDate() {
  if (!Array.isArray(globalDailyInspections)) return;
  globalDailyInspections.sort((a, b) => parseRecordDateTime(a.date, a.time) - parseRecordDateTime(b.date, b.time));
}

function sortCdDailyByDate() {
  if (!Array.isArray(globalCivilDefenseDaily)) return;
  globalCivilDefenseDaily.sort((a, b) => parseRecordDateTime(a.date, a.time) - parseRecordDateTime(b.date, b.time));
}

function sortIncidentsByDate() {
  if (!globalIncidents) return;
  globalIncidents.sort((a, b) => parseRecordDateTime(a.Date || a.date, a.Time || a.time) - parseRecordDateTime(b.Date || b.date, b.Time || b.time));
  window.globalIncidents = globalIncidents;
}

function loadIncidentById(incId) {
  const list = globalIncidents || [];
  const realIdx = list.findIndex(x => String(x.ID || x.id) === String(incId));
  if (realIdx >= 0) loadIncidentToForm(realIdx);
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
  else if (dir === 'next') {
    if (currentIncidentIndex === -1) currentIncidentIndex = list.length - 1;
    else if (currentIncidentIndex < list.length - 1) currentIncidentIndex++;
  } else if (dir === 'prev') {
    if (currentIncidentIndex === -1) currentIncidentIndex = list.length - 1;
    else if (currentIncidentIndex > 0) currentIncidentIndex--;
  }
  if (currentIncidentIndex >= 0 && currentIncidentIndex < list.length) { loadIncidentToForm(currentIncidentIndex); switchIncidentTab('entry'); }
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
    if (attUrl && attUrl.length > 5) prevEl.innerHTML = `<a href="${attUrl}" target="_blank" style="color:#003366;font-weight:bold;text-decoration:underline;"><i class="fa-solid fa-eye"></i> معاينة المرفق الحالي 👁️</a>`;
    else prevEl.innerHTML = `<span style="color:#888;">لا يوجد مرفق محفوظ لهذه الواقعة</span>`;
  }
  const btn = document.getElementById('submitIncBtn');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تحديث الواقعة'; btn.style.backgroundColor = '#17a2b8'; }
  updateIncidentNavCounter();
}

function clearIncidentForm() {
  currentIncidentIndex = -1; currentIncidentEditId = null;
  const f = document.getElementById('incidentForm'); if (f) f.reset();
  const idF = document.getElementById('incId'); if (idF) idF.value = '';
  const dtF = document.getElementById('incDate'); if (dtF) dtF.value = new Date().toISOString().split('T')[0];
  const prevEl = document.getElementById('incAttachmentPreview'); if (prevEl) prevEl.innerHTML = '';
  const b = document.getElementById('submitIncBtn');
  if (b) { b.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الواقعة وتحديث السجل'; b.style.backgroundColor = '#dc3545'; }
  updateIncidentNavCounter();
  switchIncidentTab('entry');
}

function handleIncidentFileSelect(input) {
  const prevEl = document.getElementById('incAttachmentPreview');
  if (!prevEl) return;
  if (input.files && input.files[0]) prevEl.innerHTML = `<span style="color:#e67e22;font-weight:bold;"><i class="fa-solid fa-file-arrow-up"></i> تم اختيار ملف: ${input.files[0].name} (سيتم رفعه عند الحفظ)</span>`;
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
        const maxD = 1600; let w = img.width, h = img.height;
        if (w > maxD || h > maxD) { if (w > h) { h = Math.round(h * maxD / w); w = maxD; } else { w = Math.round(w * maxD / h); h = maxD; } }
        const cvs = document.createElement('canvas'); cvs.width = w; cvs.height = h;
        const ctx = cvs.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
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
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري حفظ الواقعة والمرفقات...'; }

  const g = (id) => document.getElementById(id)?.value?.trim() || '';
  const date = g('incDate') || new Date().toISOString().split('T')[0];
  const desc = g('incDesc') || '-';
  const incId = currentIncidentEditId || g('incId') || ("INC-" + Date.now());

  let fileData = null, fileName = '', mimeType = '';
  const fileInp = document.getElementById('incFileInp');
  if (fileInp && fileInp.files && fileInp.files[0]) {
    const upObj = await processFileForUpload(fileInp.files[0]);
    if (upObj) { fileData = upObj.data; fileName = upObj.name; mimeType = upObj.type; }
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
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: currentIncidentEditId ? "updateIncident" : "submitIncident", performedBy: getCurrentActorName(), incidentData: incObj, fileData: fileData, fileName: fileName, mimeType: mimeType })
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
    if (exIdx > -1) globalIncidents[exIdx] = mapped; else globalIncidents.unshift(mapped);
    window.globalIncidents = globalIncidents;
    try { localStorage.setItem('rmf_incidents', JSON.stringify(globalIncidents)); } catch (e) {}
    sortIncidentsByDate();
    alert('✅ تم حفظ الواقعة وتحديث السجل وقاعدة البيانات بنجاح!');
    clearIncidentForm(); renderSavedIncidents(); switchIncidentTab('monthly');
  } catch (err) { alert('❌ حدث خطأ أثناء الاتصال بالسيرفر لحفظ الواقعة.'); } finally { if (btn) btn.disabled = false; }
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
  if (!list || list.length === 0) { tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:15px;color:#777;">لا توجد وقائع مطابقة للبحث</td></tr>'; return; }

  for (let idx = list.length - 1; idx >= 0; idx--) {
    const item = list[idx];
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
      <td style="padding:8px;" dir="ltr"><span style="background:#dc3545;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-right:4px;">#${idx + 1}</span> ${dt}</td>
      <td style="padding:8px;font-weight:bold;">${locFlt}</td>
      <td style="padding:8px;">${char}</td>
      <td style="padding:8px;"><span style="background:${sClr};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${sev}</span></td>
      <td style="padding:8px;">${loss}</td>
      <td style="padding:6px;display:flex;gap:4px;justify-content:center;align-items:center;">
        <button type="button" onclick="loadIncidentById('${id}');switchIncidentTab('entry');" title="عرض وتعديل الواقعة" style="background:#17a2b8;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
        <button type="button" onclick="printIsoIncidentReport('${id}')" title="طباعة تقرير ISO" style="background:#003366;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-print"></i></button>
        <button type="button" onclick="exportIsoIncidentImage('${id}')" title="تصدير كصورة PNG" style="background:#28a745;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-file-image"></i></button>
        <button type="button" onclick="deleteIncident('${id}')" title="حذف الواقعة" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
  }
}

async function deleteIncident(incId) {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذه الواقعة نهائياً من قاعدة البيانات؟")) return;
  try {
    await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: "deleteIncident", performedBy: getCurrentActorName(), id: incId }) });
    if (globalIncidents) {
      globalIncidents = globalIncidents.filter(x => (x.ID || x.id) !== incId);
      window.globalIncidents = globalIncidents;
      try { localStorage.setItem('rmf_incidents', JSON.stringify(globalIncidents)); } catch (e) {}
    }
    alert("✅ تم حذف الواقعة بنجاح!");
    renderSavedIncidents(); updateIncidentNavCounter();
  } catch (e) { alert("❌ فشل الاتصال بالسيرفر لحذف الواقعة."); }
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
      attViewer = `<div style="text-align:center;padding:25px;background:#f8f9fa;border:1px dashed #003366;border-radius:6px;"><i class="fa-solid fa-file-pdf" style="font-size:3.5rem;color:#dc3545;margin-bottom:10px;"></i><br><b style="font-size:12px;color:#003366;">مستند مرفق (PDF Document)</b><br><a href="${attUrl}" target="_blank" style="display:inline-block;margin-top:10px;background:#003366;color:#fff;padding:6px 16px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:11px;">📄 استعراض المستند المرفق</a></div>`;
    } else {
      attViewer = `<div style="text-align:center;padding:5px;"><img src="${attUrl}" style="max-width:98%;max-height:480px;object-fit:contain;border:1px solid #ccc;border-radius:6px;box-shadow:0 3px 10px rgba(0,0,0,0.1);"></div>`;
    }
  } else { attViewer = `<div style="text-align:center;color:#888;padding:25px;font-size:11px;background:#fafafa;border:1px dashed #ccc;border-radius:6px;">لا توجد مرفقات مسجلة لهذه الواقعة</div>`; }

  let p1 = `<div style="border:2px solid #000;padding:12px;box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif;font-size:10px;direction:rtl;color:#000;background:#fff;margin-bottom:20px;"><div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:5px;font-weight:bold;font-size:12px;"><div>الإدارة العامة للمطابقة والسلامة</div><div style="text-align:center;"><span>Mandatory reporting system</span></div><div>مطار مرسى علم الدولي</div></div><div style="border:1.5px solid #000;text-align:center;margin:6px 0;padding:4px;background:#f5f5f5;"><h3 style="margin:2px 0;font-size:13px;">نموذج تقرير حادثة / واقعة</h3><h4 style="margin:2px 0;font-size:11px;">Accident / Incident Safety Report Form</h4></div><table style="width:100%;border-collapse:collapse;margin-bottom:6px;font-size:10px;" border="1" cellpadding="3"><tr><td style="width:13%;background:#f9f9f9;font-weight:bold;">التاريخ / Date</td><td style="width:20%;text-align:center;">${dt}</td><td style="width:13%;background:#f9f9f9;font-weight:bold;">الوقت / Time</td><td style="width:20%;text-align:center;">${tm}</td><td style="width:14%;background:#f9f9f9;font-weight:bold;">الموقع / Location</td><td style="width:20%;text-align:center;">${loc}</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">اسم المصاب / Name</td><td colspan="3">${pInv}</td><td style="background:#f9f9f9;font-weight:bold;">عدد الإصابات</td><td style="text-align:center;">Nil</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">الوظيفة / Position</td><td colspan="3">${pos}</td><td style="background:#f9f9f9;font-weight:bold;">نوع الإصابة</td><td style="text-align:center;">${injType}</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">طراز الطائرة</td><td colspan="3">${type}</td><td style="background:#f9f9f9;font-weight:bold;">رقم الرحلة / Flight</td><td style="text-align:center;">${flt} / ${reg}</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">الشركة / Agent</td><td colspan="3">${car} / ${eqOwn}</td><td style="background:#f9f9f9;font-weight:bold;">المعدة / Equipment</td><td style="text-align:center;">${eqNo}</td></tr></table><div style="display:flex;gap:6px;margin-bottom:6px;"><div style="flex:1;border:1px solid #000;padding:4px;font-size:9.5px;line-height:1.4;"><b>توصيف الحادث / Occurrence Characterization:</b><br>${isEqAcc} Equipment Accident<br>${isLeak} Leakage / Spill<br>${isPass} Passengers<br>${isFire} Fire Alarm<br>${isOthChar} Others</div><div style="flex:1;border:1px solid #000;padding:4px;font-size:9.5px;line-height:1.4;"><b>مسببات الحادث / Occurrence Causes:</b><br>${isHum} Human Causes<br>${isNat} Natural Causes<br>${isTech} Technical Causes<br>${isLeg} Legal Causes<br>${isOrg} Organizational Causes</div></div><div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">الوصف / Description</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${desc}</div></div><div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">المخاطر / Hazards</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${haz}</div></div><div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">أوجه القصور / Causes</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${causes}</div></div><div style="border:1px solid #000;margin-bottom:4px;"><div style="background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;">الإجراء المتخذ / Action Taken</div><div style="padding:4px 6px;min-height:35px;direction:ltr;text-align:left;">${act}</div></div><div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px;border-top:1px solid #000;padding-top:4px;"><div><b>AS -F-01-05</b></div><div style="text-align:center;color:#28a745;font-weight:bold;">🛡️ SAFETY FIRST</div><div>Page 1</div></div></div>`;

  let p2 = `<div style="border:2px solid #000;padding:12px;box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif;font-size:10px;direction:rtl;color:#000;background:#fff;"><div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:5px;font-weight:bold;font-size:12px;"><div>الإدارة العامة للمطابقة والسلامة</div><div style="text-align:center;"><span>Mandatory reporting system</span></div><div>مطار مرسى علم الدولي</div></div><div style="border:1.5px solid #000;margin:12px 0 10px 0;"><div style="background:#f0f0f0;font-weight:bold;padding:4px 8px;border-bottom:1.5px solid #000;font-size:11px;">التوصيات / Recommendation</div><div style="padding:8px;min-height:90px;direction:ltr;text-align:left;font-size:10px;line-height:1.4;">${rec}</div></div><div style="border:1.5px solid #000;padding:10px;margin-bottom:15px;background:#fff;"><div style="font-weight:bold;font-size:11px;border-bottom:1.5px solid #000;padding-bottom:4px;margin-bottom:10px;">المرفقات / Attached Documentations</div>${attViewer}</div><div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1.5px solid #000;padding-top:8px;"><div><b>AS -F-01-05</b><br><span style="font-size:8.5px;color:#555;">Page 2</span></div><div style="text-align:center;color:#28a745;font-weight:bold;font-size:11px;">🛡️ SAFETY FIRST</div><div style="text-align:left;direction:ltr;"><b>Prepared By</b><br>Airport Safety Manager<br><i style="font-family:cursive;font-size:14px;color:#003366;">${prepBy}</i></div></div></div>`;
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
  html2canvas(tempDiv, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false }).then(async cvs => {
    document.body.removeChild(tempDiv);
    await window.rmfExportCanvas(cvs, `Incident_Report_AS_F_01_05_${dt}_${incId}.png`, `تقرير واقعة (${dt})`);
  }).catch(e => { document.body.removeChild(tempDiv); printIsoIncidentReport(incId); });
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
    tb.innerHTML += `<tr><td><input type="date" id="fod_date_${idx}" required style="width:100%;"></td><td><b>${item.loc}</b></td><td>${item.area}</td><td><input type="number" step="0.001" id="fod_p_${idx}" required style="width:100%;"></td><td><input type="number" step="0.001" id="fod_m_${idx}" required style="width:100%;"></td></tr>`;
  });
}

async function submitFOD(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('submitFodBtn');
  const msg = document.getElementById('fodMsg');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...'; }
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
    tb.innerHTML += `<tr><td style="border:1px solid #777;padding:12px;">${dD}</td><td style="border:1px solid #777;padding:12px;font-weight:bold;">${loc.loc}</td><td style="border:1px solid #777;padding:12px;">${loc.area}</td><td style="border:1px solid #777;padding:12px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td><td style="border:1px solid #777;padding:12px;">${met > 0 ? met.toFixed(3) + ' kg' : '---'}</td><td style="border:1px solid #777;padding:12px;">---</td></tr>`;
  });
  tb.innerHTML += `<tr style="background:#fafafa;font-weight:bold;"><td colspan="3" style="border:1px solid #777;padding:12px;">الإجمالي</td><td style="border:1px solid #777;padding:12px;">${tp.toFixed(3)} kg</td><td style="border:1px solid #777;padding:12px;">${tm.toFixed(3)} kg</td><td style="border:1px solid #777;padding:12px;color:#003366;">${(tp + tm).toFixed(3)} kg</td></tr>`;
  document.getElementById('printable-fod-report').style.display = 'block';
}

function exportFodPDF() {
  window.rmfExportElementToPdf(document.getElementById('printable-fod-report'), 'FOD_Report.pdf', { margin: 0.2, filename: 'FOD_Report.pdf', image: { type: 'jpeg', quality: 0.96 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' }, pagebreak: { avoid: ['tr', 'table'] } }, 'تقرير الأجسام الغريبة FOD (PDF)');
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
  if (box) { box.style.display = 'block'; box.scrollIntoView({ behavior: 'smooth' }); }
}

async function viewQuarterlyPdf(url, fileName) {
  if (!url) return alert('رابط المستند غير صالح!');
  if (url.startsWith('http')) { window.open(url, '_blank'); return; }
  try {
    let base64Parts = url.split(','); let base64Str = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    let byteCharacters = atob(base64Str); let byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    await window.rmfExportPdfBytes(byteNumbers, fileName || 'Quarterly_Inspection.pdf', fileName || 'تقرير التفتيش الربع سنوي');
  } catch (e) { alert('تعذر فتح المستند.'); }
}

function renderQuarterlyReports(cType) {
  const tb = document.getElementById('quarterly-reports-tbody');
  if (!tb) return;
  tb.innerHTML = '';
  const list = globalQuarterlyDocs[cType] || [];
  if (list.length === 0) { tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:12px;color:#777;">لا توجد تقارير PDF محفوظة لهذه الشركة بعد</td></tr>'; return; }
  list.forEach((doc, idx) => {
    tb.innerHTML += `<tr style="text-align:center;border-bottom:1px solid #eee;"><td style="padding:6px;" dir="ltr">${doc.date || '-'}</td><td style="padding:6px;font-weight:bold;color:#003366;">${doc.quarter || '-'}</td><td style="padding:6px;">${doc.inspector || '-'}</td><td style="padding:6px;"><button type="button" onclick="viewQuarterlyPdf(globalQuarterlyDocs['${cType}'][${idx}].url, '${doc.name || 'Report'}')" style="background:#dc3545;color:#fff;border:none;padding:5px 12px;border-radius:4px;font-weight:bold;font-size:10.5px;cursor:pointer;"><i class="fa-solid fa-file-pdf"></i> فتح PDF</button></td><td style="padding:6px;"><button type="button" onclick="deleteQuarterlyDoc('${cType}', ${idx})" style="background:#888;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`;
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
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري رفع التقرير وحفظه...';

  const reader = new FileReader();
  reader.onload = async e => {
    const base64Data = e.target.result;
    try {
      await fetch(API_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "uploadQuarterlyDoc", performedBy: getCurrentActorName(), companyType: cType, date: dateVal, quarter: qVal, inspector: inspVal, fileName: file.name, fileData: base64Data, mimeType: "application/pdf" })
      });
      const newDoc = { date: dateVal, quarter: qVal, inspector: inspVal, name: file.name, url: base64Data };
      if (!globalQuarterlyDocs[cType]) globalQuarterlyDocs[cType] = [];
      globalQuarterlyDocs[cType].unshift(newDoc);
      try { localStorage.setItem('rmf_quarterly_docs', JSON.stringify(globalQuarterlyDocs)); } catch (err) {}
      renderQuarterlyReports(cType); fileInp.value = ''; msg.innerText = "✅ تم حفظ التقرير بنجاح!"; msg.style.color = "#28a745"; setTimeout(() => msg.innerText = "", 3500);
    } catch (err) { alert("❌ فشل رفع التقرير!"); } finally { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> رفع وحفظ تقرير التفتيش (PDF)'; }
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
// 12. قسم التقرير الشهري الشامل (مدمج بمؤشرات SPI التراكمية YTD والتوقيع الجديد)
// =============================================================================
function formatTrendDifference(dV, iHb, un = "") {
  let n = parseFloat(dV);
  let isFloat = un.includes("كجم") || un.toLowerCase().includes("kg");
  if (isNaN(n) || Math.abs(n) < 0.0001) {
    let zeroTxt = isFloat ? `0.000 ${un}`.trim() : `00 ${un}`.trim();
    return `<span style="color:#0d6efd;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">${zeroTxt} <i class="fa-solid fa-arrow-right"></i></span>`;
  }
  let iP = n > 0;
  let fV = isFloat ? Math.abs(n).toFixed(3) : String(Math.abs(Math.round(n))).padStart(2, '0');
  let isGood = iHb ? iP : !iP;
  let clr = isGood ? "#28a745" : "#dc3545";
  let aI = iP ? "fa-arrow-up" : "fa-arrow-down";
  return `<span style="color:${clr};font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:5px;">${fV} ${un} <i class="fa-solid ${aI}"></i></span>`;
}

function getPreviousMonthStr(ms) {
  if (!ms) return '';
  let p = ms.split('-');
  let y = parseInt(p[0]), m = parseInt(p[1]);
  let d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

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
  } catch(err) {}
  return null;
}

function getMonthlyDetailedStats(ms) {
  let p = (ms || '').split('-'), y = p[0] || '2026', m = p[1] || '1';
  let mN = parseInt(m || '0').toString();
  let mInt = parseInt(mN);
  let s = { ms: ms, mov: 0, acc: 0, inc: 0, fT: 0, fO: 0, fC: 0, surv: [], fTot: 0, incList: [], fDept: {}, recRep: 0, clsRep: 0 };

  let movFound = 0;
  if (window.globalSpiRecords && window.globalSpiRecords[y] && window.globalSpiRecords[y].movements) {
    movFound = Number(window.globalSpiRecords[y].movements[mInt]) || 0;
  }
  if (!movFound && y === '2026') {
    const base2026 = { 1: 1333, 2: 1314, 3: 1620, 4: 1509, 5: 1534, 6: 1415, 7: 1571, 8: 1689, 9: 1662, 10: 1804, 11: 0, 12: 0 };
    movFound = base2026[mInt] || 0;
  }
  s.mov = movFound;

  let recFound = 0, clsFound = 0;
  if (window.globalSpiRecords && window.globalSpiRecords[y] && window.globalSpiRecords[y].events) {
    let evs = window.globalSpiRecords[y].events;
    if (evs["Number of received safety reports"]) recFound = Number(evs["Number of received safety reports"][mInt]) || 0;
    if (evs["Number of closed safety reports"]) clsFound = Number(evs["Number of closed safety reports"][mInt]) || 0;
  }
  if (!recFound && !clsFound && y === '2026') {
    const baseRep2026 = { 1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 1, 7: 5, 8: 2, 9: 5, 10: 1, 11: 0, 12: 0 };
    recFound = baseRep2026[mInt] || 0;
    clsFound = baseRep2026[mInt] || 0;
  }
  s.recRep = recFound;
  s.clsRep = clsFound;

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

  if (globalSurveys) {
    globalSurveys.forEach(sv => {
      let sdt = sv.Date ? String(sv.Date).split('T')[0] : '';
      if (sdt.startsWith(ms)) s.surv.push(sv);
    });
  }

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
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استدعاء البيانات...'; }

  const prepBy = document.getElementById('mainReportPreparedBy')?.value?.trim() || 'سامي لوكاس';
  const pm = getPreviousMonthStr(cm);
  const curYear = cm.split('-')[0];
  const prevYear = pm.split('-')[0];
  const mInt = parseInt(cm.split('-')[1]);

  await ensureSpiYearData(curYear);
  if (prevYear !== curYear) await ensureSpiYearData(prevYear);

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-sync"></i> تجهيز التقرير الشامل'; }

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
            if (!uM[k]) uM[k] = { c: cl, dept: f.responsible || 'أخرى' };
            else if (cl) uM[k].c = true;
          });
        }
      });
    }
    let t = 0, c = 0, o = 0, dp = {};
    Object.keys(uM).forEach(k => {
      t++;
      if (uM[k].c) c++;
      else { o++; let d = uM[k].dept; dp[d] = (dp[d] || 0) + 1; }
    });
    return { t, c, o, dp };
  };

  let cUF = getUniqF(cm);
  let pUF = getUniqF(pm);
  cS.fT = cUF.t; cS.fO = cUF.o; cS.fC = cUF.c;
  if (Object.keys(cUF.dp).length > 0) cS.fDept = cUF.dp;
  pS.fT = pUF.t; pS.fO = pUF.o; pS.fC = pUF.c;

  const mEngName = cDO.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const mArabicName = cDO.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

  let oldFix = document.getElementById('mr-page-rules-style');
  if (oldFix) oldFix.remove();
  let st = document.createElement('style');
  st.id = 'mr-page-rules-style';
  st.innerHTML = `
    #printable-main-report { font-family: 'Cairo', sans-serif !important; direction: rtl !important; box-sizing: border-box !important; width: 100% !important; max-width: 860px !important; margin: 0 auto !important; padding: 0 !important; background: #ffffff !important; }
    #printable-main-report * { box-sizing: border-box !important; }
    .mr-page { padding: 30px 25px !important; background: #ffffff !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; margin-bottom: 25px !important; box-shadow: 0 4px 15px rgba(0,0,0,0.04) !important; box-sizing: border-box !important; }
    .mr-section-header { background: #003366 !important; color: #ffffff !important; padding: 8px 14px !important; border-radius: 6px !important; font-size: 13px !important; font-weight: bold !important; margin-bottom: 15px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
    .mr-table { width: 100% !important; border-collapse: collapse !important; font-size: 10px !important; margin-bottom: 15px !important; }
    .mr-table th { background: #f0f4f8 !important; color: #003366 !important; font-weight: bold !important; border: 1px solid #b0c4de !important; padding: 7px 6px !important; text-align: center !important; }
    .mr-table td { border: 1px solid #dcdcdc !important; padding: 6px 8px !important; text-align: center !important; }
    canvas#mrChart1, canvas#mrChart2, canvas#mrSurveyAirChart, canvas#mrSurveyEvalChart { width: 100% !important; height: 190px !important; max-height: 190px !important; display: block !important; }
    canvas#mrSpiTrendChart { width: 100% !important; height: 175px !important; max-height: 175px !important; display: block !important; }
    canvas#mrSpiCatChart, canvas#mrSpiApronChart, canvas#mrSpiWfChart, canvas#mrSpiReportsChart { width: 100% !important; height: 165px !important; max-height: 165px !important; display: block !important; }
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
        <div><img src="LOGO-removebg-preview (1).png" alt="Logo" style="height: 65px; object-fit: contain;"></div>
      </div>

      <div style="margin: 30px auto 20px auto; width: 100%;">
        <img src="report cover.jpg" onerror="this.onerror=null; this.src='Gemini_Generated_Image_vgja40vgja.jpg.jpg';" alt="Airport Safety" style="width: 100%; max-width: 680px; max-height: 400px; object-fit: contain; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,51,102,0.12); border: 1px solid #e0e0e0; display: block; margin: 0 auto;">
      </div>

      <div style="margin: 20px auto 10px auto;">
        <div style="display: inline-block; background: #003366; color: #ffffff; padding: 8px 34px; border-radius: 25px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(0,51,102,0.25); font-family: sans-serif; letter-spacing: 0.5px;">
          ${mEngName}
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1.5px solid #003366; padding-top: 15px; font-size: 12px; color: #333; margin-top: 40px;">
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

  // 2. الصفحة الثانية: مؤشرات الأداء العامة
  let kpRows = '';
  const kp = [
    { l: "عدد التحركات الجوية", p: pS.mov, c: cS.mov, h: true, u: "" },
    { l: "عدد الحوادث", p: pS.acc, c: cS.acc, h: false, u: "" },
    { l: "عدد الوقائع", p: pS.inc, c: cS.inc, h: false, u: "" },
    { l: "حالات عدم المطابقة (الإجمالي)", p: pS.fT, c: cS.fT, h: false, u: "" },
    { l: "حالات عدم المطابقة المعلقة", p: pS.fO, c: cS.fO, h: false, u: "" },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: pS.fC, c: cS.fC, h: true, u: "" },
    { l: "استبيان الطيارين", p: pS.surv.length, c: cS.surv.length, h: true, u: "" },
    { l: "تقارير السلامة المستلمة (Received Safety Reports)", p: pS.recRep, c: cS.recRep, h: true, u: "" },
    { l: "تقارير السلامة المغلقة (Closed Safety Reports)", p: pS.clsRep, c: cS.clsRep, h: true, u: "" },
    { l: "كمية الأجسام الغريبة FOD (بلاستيك + معدن)", p: pS.fTot, c: cS.fTot, h: false, u: "كجم", isF: true }
  ];

  kp.forEach(i => {
    let d = i.c - i.p;
    let tH = formatTrendDifference(d, i.h, i.u);
    let cD = i.isF ? i.c.toFixed(3) + " " + i.u : (i.c > 0 ? i.c.toLocaleString() : '0');
    let pD = i.isF ? i.p.toFixed(3) + " " + i.u : (i.p > 0 ? i.p.toLocaleString() : '0');
    kpRows += `<tr><td style="border: 1px solid #dcdcdc; padding: 7px 10px; text-align: right; font-weight: bold; font-size: 11px;">${i.l}</td><td style="border: 1px solid #dcdcdc; padding: 7px; direction: ltr; font-size: 11px;">${pD}</td><td style="border: 1px solid #dcdcdc; padding: 7px; direction: ltr; font-weight: bold; background: #f9fbfd; font-size: 11px;">${cD}</td><td style="border: 1px solid #dcdcdc; padding: 7px; text-align: center; font-size: 11px;">${tH}</td></tr>`;
  });

  let p2Html = `
    <div class="mr-page">
      <div class="mr-section-header"><span>أولاً: مؤشرات الأداء العامة لمنطقة التحركات الجوية</span><span style="font-size: 10.5px; opacity: 0.9;">مقارنة مع الشهر السابق</span></div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="mr-table"><thead><tr><th style="width: 42%; text-align: right; padding-right: 12px;">البيان</th><th style="width: 18%;">الشهر السابق</th><th style="width: 18%;">الشهر الحالي</th><th style="width: 22%;">الفرق والاتجاه</th></tr></thead><tbody>${kpRows}</tbody></table></div>
      <div class="mr-section-header" style="margin-top: 25px;"><span>ثانياً: الحصر والتحليل البياني للمخالفات والوقائع</span><span style="font-size: 10.5px; opacity: 0.9;">الرصد والإدارات المسؤولة</span></div>
      <div style="display: flex; gap: 15px; margin-top: 10px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;"><h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">المخالفات المرصودة طبقاً للإدارة المسؤولة</h5><canvas id="mrChart1"></canvas></div>
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;"><h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">تصنيف الوقائع والحوادث المسجلة</h5><canvas id="mrChart2"></canvas></div>
      </div>
    </div>
  `;

  // 3. الصفحة الثالثة: مؤشرات الأداء التشغيلية YTD
  let p3SpiHtml = `
    <div class="mr-page">
      <div class="mr-section-header"><span>ثالثاً: مؤشرات السلامة التشغيلية وحركة الطائرات (تراكمي للسنة الحالية حتى شهر التقرير)</span><span style="font-size: 10.5px; opacity: 0.9;">Year-to-Date (YTD)</span></div>
      <div style="background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; margin-bottom: 15px;"><h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px; text-align: center;">منحنى حركة الطائرات التراكمي (${curYear}) حتى شهر ${mArabicName}</h5><canvas id="mrSpiTrendChart"></canvas></div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
        <div style="background: #fafafa; border: 1px solid #ddd; padding: 8px; border-radius: 6px; text-align: center;"><h6 style="color: #003366; margin: 0 0 6px 0; font-size: 9.5px; font-weight: bold;">توزيع المؤشرات حسب التصنيف</h6><canvas id="mrSpiCatChart"></canvas></div>
        <div style="background: #fafafa; border: 1px solid #ddd; padding: 8px; border-radius: 6px; text-align: center;"><h6 style="color: #003366; margin: 0 0 6px 0; font-size: 9.5px; font-weight: bold;">مؤشرات الممرات والساحة</h6><canvas id="mrSpiApronChart"></canvas></div>
        <div style="background: #fafafa; border: 1px solid #ddd; padding: 8px; border-radius: 6px; text-align: center;"><h6 style="color: #003366; margin: 0 0 6px 0; font-size: 9.5px; font-weight: bold;">المهبط، الحياة البرية والأجسام الغريبة</h6><canvas id="mrSpiWfChart"></canvas></div>
        <div style="background: #fafafa; border: 1px solid #ddd; padding: 8px; border-radius: 6px; text-align: center;"><h6 style="color: #003366; margin: 0 0 6px 0; font-size: 9.5px; font-weight: bold;">تقارير السلامة المستلمة والمغلقة (YTD)</h6><canvas id="mrSpiReportsChart"></canvas></div>
      </div>
    </div>
  `;

  // 4. الصفحة الرابعة: حصر وسجل الوقائع والحوادث
  let iLHtml = '';
  let gI = {};
  cS.incList.forEach(i => { let ct = i.Characterization ? i.Characterization.split('/')[0].trim() : 'Others'; if (!gI[ct]) gI[ct] = []; gI[ct].push(i); });

  if (Object.keys(gI).length === 0) {
    iLHtml = `<div style="background: #e8f5e9; border: 1.5px solid #28a745; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;"><i class="fa-solid fa-shield-halved" style="color: #28a745; font-size: 3rem; margin-bottom: 10px;"></i><h3 style="color: #155724; margin: 0 0 6px 0;">سجل آمن 100%</h3><p style="color: #28a745; margin: 0; font-weight: bold; font-size: 12px;">لم يتم تسجيل أي حوادث أو وقائع في منطقة التحركات الجوية خلال شهر ${mArabicName}.</p></div>`;
  } else {
    let cIdx = 1;
    for (let ct in gI) {
      iLHtml += `<div style="background: #003366; color: #fff; font-weight: bold; padding: 6px 12px; margin-top: 12px; border-radius: 4px; display: flex; justify-content: space-between; font-size: 11px; direction: ltr;"><span>${ct} (${cIdx})</span><span>Count: ${gI[ct].length}</span></div><div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="mr-table" style="direction: ltr; text-align: left; margin-bottom: 12px;"><thead><tr><th style="width: 5%; text-align: center;">Seq</th><th style="width: 55%; text-align: center;">Description / Action Taken</th><th style="width: 15%; text-align: center;">Date</th><th style="width: 25%; text-align: center;">Flight Information</th></tr></thead><tbody>`;
      gI[ct].forEach((i, x) => {
        let dt = i.Date ? String(i.Date).split('T')[0] : '';
        let ds = i.Description ? i.Description.replace(/\n/g, '<br>') : '-';
        let ac = i.Action_Taken ? i.Action_Taken.replace(/\n/g, '<br>') : '-';
        let dsDir = /[\u0600-\u06FF]/.test(ds) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
        let acDir = /[\u0600-\u06FF]/.test(ac) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
        let fInfo = `<b>Airline:</b> ${i.CAR || '-'}<br><b>Local Agent:</b> ${i.Equipment_Owned || '-'}<br><b>FLT NO:</b> ${i.Flight_No || '-'}<br><b>REG:</b> ${i.REG || '-'}`;
        iLHtml += `<tr><td style="text-align: center; font-weight: bold; vertical-align: middle; font-size: 11px;">0${x + 1}</td><td style="padding: 8px 10px; vertical-align: middle;"><div style="text-align: center; margin-bottom: 3px;"><strong style="color: #003366; text-decoration: underline; font-size: 10px;">الوصف / Description</strong></div><div style="${dsDir} margin-bottom: 10px; line-height: 1.4; font-size: 9.5px;">${ds}</div><div style="text-align: center; margin-bottom: 3px;"><strong style="color: #28a745; text-decoration: underline; font-size: 10px;">الإجراء المتخذ / Action Taken</strong></div><div style="${acDir} line-height: 1.4; font-size: 9.5px; color: #155724;">${ac}</div></td><td style="text-align: center; vertical-align: middle; font-weight: bold;">${dt}</td><td style="text-align: left; vertical-align: middle; line-height: 1.5; font-size: 9px;">${fInfo}</td></tr>`;
      });
      iLHtml += `</tbody></table></div>`;
      cIdx++;
    }
  }

  let p4Html = `<div class="mr-page"><div class="mr-section-header"><span>رابعاً: حصر وسجل الوقائع والحوادث المسجلة خلال الشهر</span><span style="font-size: 10.5px; opacity: 0.9;">إجمالي الوقائع: ${cS.inc + cS.acc}</span></div>${iLHtml}</div>`;

  // 5. الصفحة الخامسة: استبيان الطيارين
  let mS = { "Excellent": {}, "Good": {}, "Poor": {}, "N/A": {}, "Blank": {} };
  criteriaList.forEach(c => { mS["Excellent"][c] = 0; mS["Good"][c] = 0; mS["Poor"][c] = 0; mS["N/A"][c] = 0; mS["Blank"][c] = 0; });
  let aC = {}, eTC = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 }, cL = [];
  cS.surv.forEach(s => {
    if (s.CAR) aC[s.CAR] = (aC[s.CAR] || 0) + 1;
    criteriaList.forEach(c => { let v = s[c] || "Blank"; if (mS[v]) mS[v][c]++; if (eTC[v] !== undefined) eTC[v]++; });
    if (s.Captain_Comments && s.Captain_Comments.trim() !== "") cL.push(s);
  });

  let mH = `<div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="mr-table" style="direction: ltr; text-align: center; font-size: 8.5px;"><thead><tr style="background: #003366; color: #fff;"><th style="padding: 4px 6px; text-align: left; width: 40%; background: #003366; color: #fff;">Evaluation Criteria</th><th style="padding: 4px; background: #28a745; color: #fff; width: 12%;">Excellent</th><th style="padding: 4px; background: #ffc107; color: #000; width: 12%;">Good</th><th style="padding: 4px; background: #dc3545; color: #fff; width: 12%;">Poor</th><th style="padding: 4px; background: #6c757d; color: #fff; width: 12%;">N/A</th><th style="padding: 4px; background: #1a2a6c; color: #fff; width: 12%;">Blank</th></tr></thead><tbody>`;
  criteriaList.forEach(c => {
    mH += `<tr><td style="padding: 3px 6px; text-align: left; font-weight: bold; background: #fbfbfb;">${c}</td><td style="padding: 3px; color: ${mS["Excellent"][c] > 0 ? '#28a745' : '#bbb'}; font-weight: bold;">${mS["Excellent"][c] || 0}</td><td style="padding: 3px; color: ${mS["Good"][c] > 0 ? '#ffc107' : '#bbb'}; font-weight: bold;">${mS["Good"][c] || 0}</td><td style="padding: 3px; color: ${mS["Poor"][c] > 0 ? '#dc3545' : '#bbb'}; font-weight: bold;">${mS["Poor"][c] || 0}</td><td style="padding: 3px; color: #777;">${mS["N/A"][c] || 0}</td><td style="padding: 3px; color: #777;">${mS["Blank"][c] || 0}</td></tr>`;
  });
  mH += `</tbody></table></div>`;

  let cH = `<div style="direction: ltr; text-align: left; margin-top: 15px;"><h5 style="color: #003366; margin-bottom: 6px; font-size: 11px;">Captain Comments & Observations:</h5><div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="mr-table" style="direction: ltr; text-align: left; font-size: 9px;"><thead><tr><th style="width: 15%;">Airline</th><th style="width: 12%; text-align: center;">FLT NO</th><th style="width: 12%; text-align: center;">Type</th><th style="width: 12%; text-align: center;">Date</th><th style="width: 12%; text-align: center;">REG</th><th style="width: 37%;">Comments</th></tr></thead><tbody>`;
  if (cL.length === 0) cH += `<tr><td colspan="6" style="padding: 8px; text-align: center; color: #777;">No comments recorded for this month.</td></tr>`;
  else cL.forEach(s => {
    let cmt = s.Captain_Comments || '-';
    let cmtDir = /[\u0600-\u06FF]/.test(cmt) ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;';
    cH += `<tr><td style="font-weight: bold;">${s.CAR || '-'}</td><td style="text-align: center;">${s.Flight_NO || '-'}</td><td style="text-align: center;">${s.TYPE || '-'}</td><td style="text-align: center;" dir="ltr">${s.Date ? String(s.Date).split('T')[0] : ''}</td><td style="text-align: center;">${s.REG || '-'}</td><td style="${cmtDir}">${cmt}</td></tr>`;
  });
  cH += `</tbody></table></div></div>`;

  let p5Html = `
    <div class="mr-page">
      <div class="mr-section-header"><span>خامساً: استبيان الطيارين (Pilot Safety Surveys)</span><span style="font-size: 10.5px; opacity: 0.9;">إجمالي الاستبيانات: ${cS.surv.length}</span></div>
      <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;"><h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">مشاركات شركات الطيران</h5><canvas id="mrSurveyAirChart"></canvas></div>
        <div style="flex: 1; min-width: 280px; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center;"><h5 style="color: #003366; margin: 0 0 8px 0; font-size: 11px;">توزيع التقييم العام للخدمات</h5><canvas id="mrSurveyEvalChart"></canvas></div>
      </div>
      <div style="text-align: center; margin-bottom: 8px;"><h5 style="color: #003366; margin: 0; font-size: 12px; font-weight: bold;">مصفوفة تقييم بنود السلامة (Safety Evaluation Matrix)</h5></div>
      ${mH}${cH}
    </div>
  `;

  // 6. الصفحة السادسة: حصر وتصنيف FOD والتوقيع الأخير
  let fF = globalFod.filter(f => { let rd = f.Date || f.date || ''; return (typeof rd === 'string' ? rd : new Date(rd).toISOString()).split('T')[0].startsWith(cm); });
  let tp = 0, tm = 0, fR = '';
  fodLocations.forEach(loc => {
    let matching = fF.filter(f => String(f.Location || f.location || '').trim().toLowerCase() === loc.loc.toLowerCase());
    let p = matching.reduce((acc, r) => acc + (parseFloat(r.Plastic || r.plastic || 0) || 0), 0);
    let met = matching.reduce((acc, r) => acc + (parseFloat(r.Metal || r.metal || 0) || 0), 0);
    tp += p; tm += met;
    let lastRec = matching.length > 0 ? matching[matching.length - 1] : null;
    let dD = lastRec && (lastRec.Date || lastRec.date) ? String(lastRec.Date || lastRec.date).split('T')[0] : '---';
    fR += `<tr><td style="padding: 8px;" dir="ltr">${dD}</td><td style="padding: 8px; text-align: left; font-weight: bold;">${loc.loc}</td><td style="padding: 8px;">${loc.area}</td><td style="padding: 8px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td><td style="padding: 8px;">${met > 0 ? met.toFixed(3) + ' kg' : '---'}</td><td style="padding: 8px; font-weight: bold;">${(p + met) > 0 ? (p + met).toFixed(3) + ' kg' : '---'}</td></tr>`;
  });

  let p6Html = `
    <div class="mr-page">
      <div class="mr-section-header"><span>سادساً: حصر وتصنيف الأجسام الغريبة (F.O.D Collected)</span><span style="font-size: 10.5px; opacity: 0.9;">شهر ${mArabicName}</span></div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="mr-table" style="direction: ltr; text-align: center; font-size: 10px;"><thead><tr><th rowspan="2" style="width: 15%;">Date</th><th rowspan="2" style="width: 32%; text-align: left;">Location</th><th rowspan="2" style="width: 15%;">Area</th><th colspan="2" style="width: 24%;">FOD Quantity</th><th rowspan="2" style="width: 14%;">Total</th></tr><tr><th>Plastic (kg)</th><th>Metal (kg)</th></tr></thead><tbody>${fR}<tr style="background: #f0f4f8; font-weight: bold;"><td colspan="3" style="text-align: left; padding: 10px;">Total Weight</td><td style="padding: 10px; color: #003366;">${tp.toFixed(3)} kg</td><td style="padding: 10px; color: #003366;">${tm.toFixed(3)} kg</td><td style="padding: 10px; color: #28a745; font-size: 12px;">${(tp + tm).toFixed(3)} kg</td></tr></tbody></table></div>
      <div style="margin-top: 50px;">
        <div style="text-align: left; direction: ltr; padding-left: 15px;">
          <div style="font-size: 13px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Prepared By:</div>
          <div style="font-size: 16px; font-weight: 900; color: #003366; margin: 4px 0 2px 0;">${prepBy}</div>
          <div style="font-size: 13px; font-weight: 700; color: #333;">Airport Safety Department</div>
        </div>
      </div>
    </div>
  `;

  const repMain = document.getElementById('printable-main-report');
  if (repMain) { repMain.innerHTML = p1Html + p2Html + p3SpiHtml + p4Html + p5Html + p6Html; repMain.style.display = 'block'; }

  if (monthlyChart1) monthlyChart1.destroy();
  if (monthlyChart2) monthlyChart2.destroy();
  Chart.defaults.font.family = "'Cairo', sans-serif";

  let c1El = document.getElementById('mrChart1');
  if (c1El) { monthlyChart1 = new Chart(c1El.getContext('2d'), { type: 'bar', data: { labels: Object.keys(cS.fDept), datasets: [{ label: 'المخاطر طبقاً للإدارة', data: Object.values(cS.fDept), backgroundColor: '#003366', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false } }); }

  let iTC = {};
  cS.incList.forEach(i => { let ct = i.Characterization ? i.Characterization.split('/')[0].trim() : 'أخرى'; iTC[ct] = (iTC[ct] || 0) + 1; });

  let c2El = document.getElementById('mrChart2');
  if (c2El) { monthlyChart2 = new Chart(c2El.getContext('2d'), { type: 'bar', data: { labels: Object.keys(iTC), datasets: [{ label: 'الوقائع', data: Object.values(iTC), backgroundColor: '#dc3545', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false } }); }

  const mNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const ytdMonths = mNames.slice(0, mInt);
  const spiRec = (window.globalSpiRecords && window.globalSpiRecords[curYear]) ? window.globalSpiRecords[curYear] : { movements: {}, events: {} };
  const ytdMovData = ytdMonths.map((_, i) => (spiRec.movements && spiRec.movements[i + 1]) ? Number(spiRec.movements[i + 1]) : 0);

  if (mrSpiTrendInstance) mrSpiTrendInstance.destroy();
  let spiTrendEl = document.getElementById('mrSpiTrendChart');
  if (spiTrendEl) {
    mrSpiTrendInstance = new Chart(spiTrendEl.getContext('2d'), { type: 'line', data: { labels: ytdMonths, datasets: [{ label: `Movements (${curYear})`, data: ytdMovData, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.12)', borderWidth: 2.5, pointBackgroundColor: '#28a745', pointBorderColor: '#fff', pointRadius: 4, tension: 0.35, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top', labels: { font: { family: 'Cairo,sans-serif', weight: 'bold' } } } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { color: '#f9f9f9' } } } } });
  }

  const ytdCatTotals = {}, ytdItemTotals = {};
  SPI_CONFIG.forEach(cO => {
    let cSum = 0;
    cO.items.forEach(itm => {
      let itmSum = 0;
      for (let m = 1; m <= mInt; m++) itmSum += ((spiRec.events && spiRec.events[itm] && spiRec.events[itm][m]) ? Number(spiRec.events[itm][m]) : 0);
      ytdItemTotals[itm] = itmSum; cSum += itmSum;
    });
    ytdCatTotals[cO.category] = cSum;
  });

  const pal = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#34495e'];

  if (mrSpiCatInstance) mrSpiCatInstance.destroy();
  let spiCatEl = document.getElementById('mrSpiCatChart');
  if (spiCatEl) {
    let cLabels = SPI_CONFIG.map(c => c.category);
    let cCounts = SPI_CONFIG.map(c => ytdCatTotals[c.category] || 0);
    let hasC = cCounts.some(v => v > 0);
    mrSpiCatInstance = new Chart(spiCatEl.getContext('2d'), { type: 'doughnut', data: { labels: hasC ? cLabels : ['لا توجد وقائع مسجلة'], datasets: [{ data: hasC ? cCounts : [1], backgroundColor: hasC ? pal : ['#e0e0e0'], borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { family: 'Cairo,sans-serif', size: 7.5 } } } } } });
  }

  if (mrSpiApronInstance) mrSpiApronInstance.destroy();
  let spiApronEl = document.getElementById('mrSpiApronChart');
  if (spiApronEl) {
    let aCat = SPI_CONFIG.find(c => c.category.includes('Taxiway & Apron'));
    let aLabels = aCat ? aCat.items.map(i => i.replace(/^Reported\s+/i, '')) : [];
    let aCounts = aCat ? aCat.items.map(i => ytdItemTotals[i] || 0) : [];
    let hasA = aCounts.some(v => v > 0);
    mrSpiApronInstance = new Chart(spiApronEl.getContext('2d'), { type: 'pie', data: { labels: hasA ? aLabels : ['لا توجد ملاحظات على الممرات'], datasets: [{ data: hasA ? aCounts : [1], backgroundColor: hasA ? ['#2980b9', '#3498db', '#1abc9c', '#16a085', '#27ae60', '#2ecc71', '#f39c12', '#e67e22', '#d35400', '#c0392b', '#8e44ad'] : ['#e0e0e0'], borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 7, font: { family: 'Cairo,sans-serif', size: 7 } } } } } });
  }

  if (mrSpiWfInstance) mrSpiWfInstance.destroy();
  let spiWfEl = document.getElementById('mrSpiWfChart');
  if (spiWfEl) {
    let g3 = [...((SPI_CONFIG.find(c => c.category.includes('Runway Incursion')) || {}).items || []), ...((SPI_CONFIG.find(c => c.category.includes('Bird / Wildlife')) || {}).items || []), ...((SPI_CONFIG.find(c => c.category.includes('FOD')) || {}).items || [])];
    let g3L = g3.map(i => i.replace(/^Reported\s+/i, '').replace(/^Inspections in which\s+/i, ''));
    let g3C = g3.map(i => ytdItemTotals[i] || 0);
    let hasG3 = g3C.some(v => v > 0);
    mrSpiWfInstance = new Chart(spiWfEl.getContext('2d'), { type: 'doughnut', data: { labels: hasG3 ? g3L.filter((_, idx) => g3C[idx] > 0) : ['لا توجد ملاحظات مهبط/حياة برية'], datasets: [{ data: hasG3 ? g3C.filter(v => v > 0) : [1], backgroundColor: hasG3 ? ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6'] : ['#e0e0e0'], borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 7, font: { family: 'Cairo,sans-serif', size: 7 } } } } } });
  }

  if (mrSpiReportsInstance) mrSpiReportsInstance.destroy();
  let spiRepEl = document.getElementById('mrSpiReportsChart');
  if (spiRepEl) {
    let recTot = ytdItemTotals["Number of received safety reports"] || 0;
    let clsTot = ytdItemTotals["Number of closed safety reports"] || 0;
    let openTot = Math.max(0, recTot - clsTot);
    let ratioPct = recTot > 0 ? ((clsTot / recTot) * 100).toFixed(1) : "0.0";
    let hasRep = (recTot > 0 || clsTot > 0);
    mrSpiReportsInstance = new Chart(spiRepEl.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: hasRep ? [`مغلقة (${clsTot}) - ${ratioPct}%`, `مفتوحة (${openTot})`] : ['لا توجد تقارير سلامة'],
        datasets: [{ data: hasRep ? [clsTot, openTot] : [1], backgroundColor: hasRep ? ['#28a745', '#dc3545'] : ['#e0e0e0'], borderWidth: 1 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { family: 'Cairo,sans-serif', size: 7.5 } } } } }
    });
  }

  if (mrSurveyAirChartInstance) mrSurveyAirChartInstance.destroy();
  let saEl = document.getElementById('mrSurveyAirChart');
  if (saEl) { mrSurveyAirChartInstance = new Chart(saEl.getContext('2d'), { type: 'bar', data: { labels: Object.keys(aC), datasets: [{ label: 'الاستبيانات', data: Object.values(aC), backgroundColor: '#003366', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false } }); }

  if (mrSurveyEvalChartInstance) mrSurveyEvalChartInstance.destroy();
  let seEl = document.getElementById('mrSurveyEvalChart');
  if (seEl) { mrSurveyEvalChartInstance = new Chart(seEl.getContext('2d'), { type: 'doughnut', data: { labels: ['ممتاز', 'جيد', 'ضعيف', 'غير منطبق', 'فارغ'], datasets: [{ data: Object.values(eTC), backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'] }] }, options: { responsive: true, maintainAspectRatio: false } }); }

  repMain.scrollIntoView({ behavior: 'smooth' });
}

async function exportMainReportImage(format = 'png') {
  const el = document.getElementById('printable-main-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على زر (تجهيز التقرير الشامل) أولاً!");
  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استخراج الصورة...'; }
  const monthName = document.getElementById('mainReportMonth')?.value || 'Report';
  try {
    const scaleVal = window.isMobileAppOrDevice() ? 1.5 : 2;
    const canvas = await window.rmfWithDesktopWidth(el, () => html2canvas(el, { scale: scaleVal, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false }), '820px');
    await window.rmfExportCanvas(canvas, `Airside_Safety_Monthly_Report_${monthName}.png`, `التقرير الشهري لمنطقة التحركات الجوية (${monthName})`);
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء استخراج الصورة، يرجى المحاولة مرة أخرى.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}

async function exportMainReportPagesAsImages() {
  const el = document.getElementById('printable-main-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على زر (تجهيز التقرير الشامل) أولاً!");
  const pages = el.querySelectorAll('.mr-page');
  if (!pages || pages.length === 0) return exportMainReportImage('png');

  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استخراج الصفحات...'; }
  const monthName = document.getElementById('mainReportMonth')?.value || 'Report';
  const pageTitles = ["01_Cover", "02_General_KPIs", "03_SPIs_YTD", "04_Incidents_Log", "05_Pilot_Surveys", "06_FOD_Collected"];

  try {
    const renderedPages = await window.rmfWithDesktopWidth(el, async () => {
      const arr = [];
      for (let i = 0; i < pages.length; i++) {
        if (btn) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> صفحة ${i + 1} / ${pages.length}...`;
        const canvas = await html2canvas(pages[i], { scale: 1.8, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
        arr.push({
          canvas: canvas,
          filename: `Monthly_Report_${monthName}_${pageTitles[i] || ('Page_' + (i + 1))}.png`
        });
      }
      return arr;
    }, '820px');

    await window.rmfExportMultiPages(renderedPages, `صفحات التقرير الشهري (${monthName})`);
    if (!window.isMobileAppOrDevice()) {
      alert("✅ تم استخراج صفحات التقرير الـ 6 كصور PNG عالية الدقة بنجاح!");
    }
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء استخراج صفحات التقرير.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}

async function exportMainReportPDF() { return exportMainReportImage('png'); }
window.exportMainReportPDF = exportMainReportImage;

async function sendReportViaEmail() {
  const m = document.getElementById('mainReportMonth')?.value;
  if (!m) return alert("اختر الشهر أولاً لتجهيز التقرير!");
  const el = document.getElementById('printable-main-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على زر (تجهيز التقرير الشامل) أولاً!");

  const btn = (typeof event !== 'undefined' && event) ? event.target?.closest('button') : null;
  let origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إرسال التقرير...'; }
  const prepBy = document.getElementById('mainReportPreparedBy')?.value?.trim() || 'سامي لوكاس';

  try {
    const imgData = await window.rmfWithDesktopWidth(el, async () => {
      const canvas = await html2canvas(el, { scale: 1.25, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
      return canvas.toDataURL('image/jpeg', 0.80);
    }, '820px');
    let hB = `<div dir="rtl" style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto;"><h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 8px;">التقرير الشهري لمنطقة التحركات الجوية - ${m}</h2><p><b>السادة / إدارة السلامة والمطابقة المحترمين،</b><br>تحية طيبة وبعد،،<br><br>نرفق لسيادتكم التقرير الشهري الشامل لمؤشرات السلامة لمنطقة التحركات الجوية لشهر (${m}).</p><p>يرجى الاطلاع على صورة التقرير المرفقة أدناه.</p><div style="text-align: center; margin: 20px 0;"><img src="cid:monthlyReportImage" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" alt="التقرير الشهري"></div><p>وتفضلوا بقبول فائق الاحترام والتقدير،،<br><b>مُعِد التقرير:</b> ${prepBy}<br><b>إدارة سلامة المطارات</b><br><b>مطار مرسى علم الدولي</b></p></div>`;
    await fetch(API_URL, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: "sendReportEmail", performedBy: getCurrentActorName(), subject: `التقرير الشهري لمنطقة التحركات الجوية - ${m}`, htmlBody: hB, imageData: imgData, imageName: `Airside_Safety_Report_${m}.jpg` })
    });
    alert("✅ تم إرسال التقرير الشامل بنجاح إلى إدارة السلامة والمطابقة!");
  } catch (err) {
    console.error(err);
    alert("❌ تعذر الاتصال بالسيرفر لإرسال الإيميل أو فشل معالجة الصورة.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}

// =============================================================================
// 13. إدارة الحسابات والأسطول (Users & Fleet Registry Helpers)
// =============================================================================
function getLoginUsersCatalog() {
  const map = new Map();
  let sourceList = Array.isArray(globalUsers) ? globalUsers : [];
  if (sourceList.length === 0) {
    try {
      const cached = JSON.parse(localStorage.getItem('rmf_users_cache') || '[]');
      if (Array.isArray(cached) && cached.length > 0) sourceList = cached;
    } catch (e) {}
  }

  if (sourceList.length > 0) {
    sourceList.forEach(u => {
      if (u && u.Username) {
        const cleanU = String(u.Username).trim();
        const key = cleanU.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { Username: cleanU, Role: String(u.Role || '').trim() });
        }
      }
    });
    return Array.from(map.values());
  }

  return [
    { Username: "Admin", Role: "Admin" },
    { Username: "safety", Role: "Airport Safety" },
    { Username: "osh", Role: "OSH" },
    { Username: "env", Role: "Environment" },
    { Username: "fire", Role: "Civil Defense" }
  ];
}

function renderLoginUsersDropdown(filterText = "") {
  const lst = document.getElementById('loginUserDropdownList');
  const inp = document.getElementById('loginUser');
  const passInp = document.getElementById('loginPass');
  if (!lst || !inp) return;
  const q = String(filterText || "").toLowerCase().trim();
  const users = getLoginUsersCatalog().filter(u => !q || u.Username.toLowerCase().includes(q) || (u.Role && u.Role.toLowerCase().includes(q)));
  if (users.length === 0) {
    lst.innerHTML = '<div style="padding:10px;color:#777;font-size:0.85rem;text-align:center;">لا توجد حسابات مطابقة</div>';
    return;
  }
  lst.innerHTML = users.map(u => `
    <div class="login-user-opt" data-username="${u.Username.replace(/"/g, '&quot;')}" style="padding:8px 12px;border-bottom:1px solid #eef2f6;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px;white-space:nowrap;transition:background 0.15s;" onmouseover="this.style.background='#f0f6ff'" onmouseout="this.style.background='#fff'">
      <span style="font-weight:800;color:#003366;font-size:0.9rem;white-space:nowrap;"><i class="fa-solid fa-user-check" style="color:#17a2b8;margin-left:5px;"></i>${u.Username}</span>
      <span style="font-size:0.74rem;color:#475569;background:#f1f5f9;padding:2px 8px;border-radius:10px;font-weight:bold;white-space:nowrap;">${u.Role || ''}</span>
    </div>
  `).join('');

  lst.querySelectorAll('.login-user-opt').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      inp.value = el.getAttribute('data-username') || '';
      lst.style.display = 'none';
      if (passInp) passInp.focus();
    });
  });
}

function setupLoginUserDropdown() {
  const inp = document.getElementById('loginUser');
  const arrow = document.getElementById('loginUserArrowBtn');
  const lst = document.getElementById('loginUserDropdownList');
  const wrap = document.getElementById('loginUserDropdownWrap');
  if (!inp || !arrow || !lst || !wrap) return;

  renderLoginUsersDropdown("");

  arrow.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    inp.blur();
    const isOpen = lst.style.display === 'block';
    if (isOpen) {
      lst.style.display = 'none';
    } else {
      renderLoginUsersDropdown("");
      lst.style.display = 'block';
    }
  });

  inp.addEventListener('focus', () => {
    renderLoginUsersDropdown("");
    lst.style.display = 'block';
  });

  inp.addEventListener('input', () => {
    renderLoginUsersDropdown(inp.value);
    lst.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      lst.style.display = 'none';
    }
  });
}

function populateUsersDropdown(arr) {
  const userInp = document.getElementById('loginUser');
  if (userInp && !userInp.value) userInp.value = "Admin";
  renderLoginUsersDropdown("");
}

function openFleetModal() { document.getElementById('addModal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('addModal').style.display = 'none'; }

function saveNewAircraft() {
  let reg = document.getElementById('newReg').value.toUpperCase();
  let type = document.getElementById('newType').value.toUpperCase();
  let airline = document.getElementById('newAirline').value.toUpperCase();
  safePost({ action: "addNewAircraft", reg: reg, acType: type, airline: airline, handling: document.getElementById('newHandling').value, country: document.getElementById('newCountry').value }, document.querySelector('#addModal .submit-btn'), document.getElementById('modalMsg'), "تم!", () => {
    globalFleetData.unshift({ REG: reg, TYPE: type, CAR: airline });
    setTimeout(() => { closeAddModal(); document.getElementById('newReg').value = ""; }, 1000);
  });
}

function escapeSingleQuote(str) {
  return String(str || '').split("'").join("\\'");
}

function addUser(e) {
  e.preventDefault();
  if (!isCurrentUserAdmin()) return alert('⚠️ للمدير فقط!');
  let role = document.getElementById('newUserRole').value;
  let user = document.getElementById('newUsername').value.trim();
  let pass = document.getElementById('newUserPass').value.trim();
  if (!user || !pass) return alert('يرجى إدخال اسم المستخدم وكلمة المرور!');
  safePost({ action: "addUser", performedBy: getCurrentActorName(), role: role, username: user, password: pass }, document.querySelector('#account-management-section .submit-btn'), document.getElementById('userMsg'), "تم إضافة الحساب بنجاح!", () => {
    globalUsers.push({ Role: role, Username: user, Password: pass });
    try { localStorage.setItem('rmf_users_cache', JSON.stringify(globalUsers)); } catch (e) {}
    populateUsersDropdown(globalUsers);
    renderUsersTable();
    document.getElementById('newUsername').value = '';
    document.getElementById('newUserPass').value = '';
    setTimeout(() => refreshAppLogs(), 1200);
  });
}

function renderUsersTable() {
  const tb = document.getElementById('users-tbody');
  if (!tb) return;
  if (!globalUsers || globalUsers.length === 0) {
    tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#777;">لا توجد حسابات مسجلة في الشيت</td></tr>';
    return;
  }
  tb.innerHTML = globalUsers.map((u, idx) => {
    const safeU = escapeSingleQuote(u.Username);
    const safeR = escapeSingleQuote(u.Role);
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${u.Role || '-'}</b></td>
        <td style="font-weight:bold;color:#003366;">${u.Username || '-'}</td>
        <td dir="ltr" style="font-family:monospace;font-weight:bold;">${u.Password || '****'}</td>
        <td style="white-space:nowrap;">
          <button type="button" onclick="editUserPassword('${safeU}', '${safeR}')" style="background:#ffc107;color:#000;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px;margin-left:4px;">
            <i class="fa-solid fa-key"></i> تعديل كلمة السر
          </button>
          ${String(u.Username).toLowerCase() !== 'admin' ? `<button type="button" onclick="deleteUserAccount('${safeU}')" style="background:#dc3545;color:#fff;border:none;padding:5px 9px;border-radius:4px;cursor:pointer;font-size:11px;"><i class="fa-solid fa-trash"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

function editUserPassword(username, role) {
  if (!isCurrentUserAdmin()) return alert('⚠️ للمدير فقط!');
  const newPass = prompt(`أدخل كلمة المرور الجديدة للمستخدم (${username}):`);
  if (!newPass || !newPass.trim()) return;
  const cleanPass = newPass.trim();
  const uObj = globalUsers.find(u => u.Username === username);
  if (uObj) uObj.Password = cleanPass;
  renderUsersTable();
  safePost({
    action: "updateUserPassword",
    performedBy: getCurrentActorName(),
    username: username,
    role: role,
    newPassword: cleanPass
  }, null, document.getElementById('userMsg'), `تم تحديث كلمة مرور (${username}) بنجاح!`, () => {
    setTimeout(() => refreshAppLogs(), 1200);
  });
}

function deleteUserAccount(username) {
  if (!isCurrentUserAdmin()) return alert('⚠️ للمدير فقط!');
  if (!confirm(`⚠️ هل أنت متأكد من حذف حساب (${username}) نهائياً؟`)) return;
  globalUsers = globalUsers.filter(u => u.Username !== username);
  try { localStorage.setItem('rmf_users_cache', JSON.stringify(globalUsers)); } catch (e) {}
  populateUsersDropdown(globalUsers);
  renderUsersTable();
  safePost({
    action: "deleteUser",
    performedBy: getCurrentActorName(),
    username: username
  }, null, document.getElementById('userMsg'), `تم حذف حساب (${username}) بنجاح!`, () => {
    setTimeout(() => refreshAppLogs(), 1200);
  });
}

function renderAppLogs() {
  const tb = document.getElementById('app-logs-tbody');
  if (!tb) return;
  if (!globalAppLogs || globalAppLogs.length === 0) {
    try {
      const cached = JSON.parse(localStorage.getItem('rmf_app_logs') || '[]');
      if (Array.isArray(cached) && cached.length > 0) globalAppLogs = cached;
    } catch (e) {}
  }

  const q = (document.getElementById('logSearchInput')?.value || '').toLowerCase().trim();
  const typeF = document.getElementById('logTypeFilter')?.value || 'ALL';

  const filtered = (globalAppLogs || []).filter(row => {
    const act = String(row.Action || '');
    const det = String(row.Details || '');
    const ts = String(row.Timestamp || '');
    const matchText = !q || act.toLowerCase().includes(q) || det.toLowerCase().includes(q) || ts.toLowerCase().includes(q);
    let matchType = true;
    if (typeF === 'دخول') matchType = act.includes('دخول');
    else if (typeF === 'تعديل') matchType = !act.includes('دخول') && !act.includes('حذف');
    else if (typeF === 'حذف') matchType = act.includes('حذف');
    return matchText && matchType;
  });

  if (filtered.length === 0) {
    tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:15px;color:#777;font-weight:bold;">لا توجد سجلات مسجلة في APP_LOGS حتى الآن. اضغط على (تحديث السجل الآن) بعد تنفيذ أي حركة.</td></tr>';
    return;
  }

  tb.innerHTML = filtered.map((row, idx) => {
    const act = String(row.Action || '-');
    const st = String(row.Status || 'تم');
    let badgeBg = '#17a2b8';
    if (act.includes('دخول')) badgeBg = '#003366';
    else if (act.includes('حذف')) badgeBg = '#dc3545';
    else if (act.includes('تعديل') || act.includes('تحديث')) badgeBg = '#e67e22';
    else if (act.includes('إضافة') || act.includes('حفظ') || act.includes('إرسال') || act.includes('تسجيل') || act.includes('إدخال') || act.includes('رفع')) badgeBg = '#28a745';

    return `
      <tr>
        <td>${idx + 1}</td>
        <td dir="ltr" style="font-weight:bold;white-space:nowrap;">${row.Timestamp || '-'}</td>
        <td><span style="background:${badgeBg};color:#fff;padding:3px 9px;border-radius:12px;font-weight:bold;font-size:10.5px;display:inline-block;">${act}</span></td>
        <td style="color:#28a745;font-weight:bold;">${st}</td>
        <td style="text-align:right;line-height:1.5;font-weight:600;">${row.Details || '-'}</td>
      </tr>
    `;
  }).join('');
}

function refreshAppLogs() {
  const btn = document.getElementById('refreshLogsBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحديث...'; }
  const cb = 'jsonpLogs_' + Math.round(100000 * Math.random());
  const timer = setTimeout(() => {
    delete window[cb];
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-rotate"></i> تحديث السجل الآن'; }
    renderAppLogs();
  }, 8000);
  window[cb] = function (d) {
    clearTimeout(timer);
    try {
      if (d && d.status === 'success') {
        if (Array.isArray(d.logs)) {
          globalAppLogs = d.logs;
          try { localStorage.setItem('rmf_app_logs', JSON.stringify(globalAppLogs)); } catch (e) {}
        }
        if (Array.isArray(d.users) && d.users.length > 0) {
          globalUsers = d.users;
          renderUsersTable();
        }
        renderAppLogs();
      }
    } catch (e) {} finally {
      delete window[cb];
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-rotate"></i> تحديث السجل الآن'; }
    }
  };
  const s = document.createElement('script');
  s.src = API_URL + '?action=getAppData&_t=' + Date.now() + '&callback=' + cb;
  s.onerror = () => {
    clearTimeout(timer);
    delete window[cb];
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-rotate"></i> تحديث السجل الآن'; }
    renderAppLogs();
  };
  document.body.appendChild(s);
}


// =============================================================================
// 14. قسم سلامة الحماية المدنية (Civil Defense Daily & Monthly Module)
// =============================================================================
const CD_RESPONSIBLE_DEPTS = ["الإدارة الهندسية", "الهندسة المدنية", "الهندسة الميكانيكية", "تكنولوجيا المعلومات", "ARFF", "العمليات", "أخرى"];

const CD_DEFAULT_TRUCKS = [
  { id: 1, model: "اوشكاش", type: "متعددة الأغراض", water: 12500, foam: 1750, discharge: 6000, powder: 250, status: "صالح", note: "" },
  { id: 2, model: "فاركو 4*4", type: "متعددة الأغراض", water: 5750, foam: 570, discharge: 5700, powder: 250, status: "صالح", note: "" },
  { id: 3, model: "فاركو 4*4", type: "متعددة الأغراض", water: 5750, foam: 570, discharge: 5700, powder: 250, status: "صالح", note: "" },
  { id: 4, model: "فاركو 6*6", type: "متعددة الأغراض", water: 10000, foam: 1000, discharge: 5900, powder: 250, status: "صالح", note: "بالصيانة منذ 3 نوفمبر" },
  { id: 5, model: "فاركو 6*6", type: "متعددة الأغراض", water: 10000, foam: 1000, discharge: 5900, powder: 250, status: "صالح", note: "" },
  { id: 6, model: "فاركو 6*6", type: "خزان مياه", water: 10000, foam: 0, discharge: 0, powder: 0, status: "صالح", note: "دعم إعادة التعبئة" }
];

const CD_BUILDING_ROOMS = [
  "غرفة عمليات الاتصالات",
  "مكتب ضابط منوب الوحدة",
  "إعاشة الضباط",
  "إعاشة الأفراد",
  "المخازن",
  "الحمامات",
  "مطبخ الأفراد"
];

const CD_COMM_EQUIPMENT = [
  "أجهزة اللاسلكي",
  "تليفون الخط الساخن (طوارئ)",
  "لوحة تحكم جهاز الإنذار الذاتي",
  "السارينة الداخلية"
];

const CD_TRUCK_EQUIPMENT = [
  { name: "سُلم الإنقاذ", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "البلطة", def: ["3", "2", "3", "3", "4", "u"], status: "صالح", note: "" },
  { name: "العتلة", def: ["2", "2", "2", "2", "2", "u"], status: "صالح", note: "" },
  { name: "الخراطيم (طرد)", def: ["6", "6", "6", "6", "6", "3"], status: "صيانة", note: "عدد 7 خرطوم يحتاج صيانة" },
  { name: "قاذف متعدد", def: ["2", "2", "1", "2", "2", "u"], status: "صالح", note: "" },
  { name: "أجهزة التنفس", def: ["4", "3", "3", "3", "3", "u"], status: "صيانة", note: "يوجد تسريب بصمام جهاز تنفس" },
  { name: "احتياطي اسطوانات تنفس", def: ["4", "3", "3", "3", "3", "u"], status: "صالح", note: "" },
  { name: "ماكينة شفط الدخان", def: ["1", "1", "1", "1", "1", "u"], status: "صيانة", note: "بالصيانة" },
  { name: "النقالات", def: ["2", "6", "6", "6", "6", "u"], status: "صالح", note: "" },
  { name: "مثلث التوزيع", def: ["u", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "مثلث التجميع", def: ["u", "1", "1", "1", "u", "u"], status: "صالح", note: "" },
  { name: "خلاط رغوي", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "بطانية ضد الحريق", def: ["4", "3", "3", "3", "3", "u"], status: "صالح", note: "" },
  { name: "أسطوانات النيتروجين", def: ["1", "2", "2", "2", "2", "u"], status: "صالح", note: "" },
  { name: "ماكينة كهرباء / بالكشاف", def: ["u", "1", "1", "u", "u", "u"], status: "صالح", note: "" },
  { name: "شوكة", def: ["3", "2", "2", "2", "2", "u"], status: "صالح", note: "" },
  { name: "مقص يدوي حديد", def: ["1", "1", "1", "1", "u", "u"], status: "صالح", note: "" },
  { name: "كوريك", def: ["3", "3", "2", "2", "2", "u"], status: "صالح", note: "" },
  { name: "خراطيم منيئه", def: ["2", "4", "4", "4", "4", "5"], status: "صالح", note: "" },
  { name: "مطرقة", def: ["1", "u", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "مصفاة", def: ["1", "1", "1", "u", "u", "1"], status: "صالح", note: "" },
  { name: "اسطوانة بودرة 6 كجم", def: ["2", "2", "2", "2", "2", "1"], status: "صالح", note: "" },
  { name: "أجهزة اللاسلكي", def: ["2", "1", "1", "1", "1", "1"], status: "صالح", note: "" },
  { name: "المقص الهيدروليكي", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "مباعد هيدروليكي", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "مولد كهربائي", def: ["1", "1", "1", "u", "u", "u"], status: "صيانة", note: "البطارية تحتاج شحن" },
  { name: "صاروخ قطعية", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "حبل إنقاذ 100م - 50م", def: ["1 - 1", "1", "1", "u", "u", "u"], status: "صالح", note: "" },
  { name: "شنطة إسعاف أولية", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "حزام إنقاذ", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "مثلث مروري عاكس", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "قمع مروري عاكس", def: ["1", "1", "1", "1", "1", "u"], status: "صالح", note: "" },
  { name: "كشاف يدوي", def: ["3", "2", "2", "2", "3", "u"], status: "صالح", note: "" }
];

const CD_TRUCK_TECHNICAL = [
  { name: "خزان الرغوي", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "خزان البودرة", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "لوحة التحكم", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "اللوحة الجانبية", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "المدفع العلوي", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "المدفع الأمامي", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "المكرات الجانبية", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "المكرات الخلفية", def: ["لا يوجد", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "المداخل - المخارج الجانبية للسيارة", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "البيكون العلوي (الفنار)", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "كشافات الإضاءة الأمامية – الخلفية", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "السارينة", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "أجهزة الاتصال اللاسلكي بالسيارات", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "الطلمبة", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "محابس", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "إسطوانة نيتروجين", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "رشاشات التبريد الذاتي", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "صالح"] },
  { name: "بودرة كيميائية جافة", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] },
  { name: "الرغوي AFFF 3%", def: ["صالح", "صالح", "صالح", "صالح", "صالح", "لا يوجد"] }
];

const CD_MONTHLY_KPI_DEFS = [
  { key: "drills", label: "التدريبات وفقاً للخطة المخططة", isText: false, higherBetter: true },
  { key: "truckDefects", label: "الأعطال والملاحظات التي تم تسجيلها بسيارات الإطفاء", isText: false, higherBetter: false },
  { key: "equipDefects", label: "حالات عدم المطابقة لمعدات الإنقاذ والإطفاء المحملة داخل السيارات", isText: false, higherBetter: false },
  { key: "ppeDefects", label: "حالات عدم المطابقة لمهمات الوقاية الشخصية", isText: false, higherBetter: false },
  { key: "commDefects", label: "حالات عدم المطابقة لتجهيزات غرفة عمليات الاتصالات", isText: false, higherBetter: false },
  { key: "bldgDefects", label: "حالات عدم المطابقة لتجهيزات مبنى وحدة الإطفاء والإنقاذ", isText: false, higherBetter: false },
  { key: "pendingTotal", label: "إجمالي حالات عدم المطابقة المعلقة", isText: false, higherBetter: false },
  { key: "rectifiedTotal", label: "حالات عدم المطابقة التي تم تلافيها", isText: false, higherBetter: true },
  { key: "stockStatus", label: "حالة المطابقة للمخزون الاستراتيجي", isText: true, higherBetter: true }
];

var globalCivilDefenseDaily = [];
var globalCivilDefenseMonthly = {};
let currentCdDailyIndex = -1;
let isCdDailyEditMode = false;
let currentCdDailyEditId = null;
let cdCurrentUploadedPhotos = [];
let cdMonthlyChartInstance = null;

function initCivilDefenseStorage() {
  try {
    let dCache = localStorage.getItem('rmf_cd_daily');
    if (dCache) globalCivilDefenseDaily = JSON.parse(dCache) || [];
    let mCache = localStorage.getItem('rmf_cd_monthly');
    if (mCache) globalCivilDefenseMonthly = JSON.parse(mCache) || {};
  } catch (e) {}
}

function openCivilDefenseSection() {
  initCivilDefenseStorage();
  openSection('civil-defense-section');
  const backBtn = document.getElementById('backFromCdBtn');
  if (backBtn) {
    const r = (currentLoggedInUser && currentLoggedInUser.Role ? currentLoggedInUser.Role : '').toLowerCase();
    backBtn.style.display = (r.includes('fire') || r.includes('حماية') || r.includes('مدنية')) ? 'none' : 'inline-block';
  }
  buildCdDailyFormSections();
  renderSavedCdDaily();
  updateCdDailyNavCounter();

  const today = new Date().toISOString().split('T')[0];
  const curMonth = today.slice(0, 7);
  if (document.getElementById('cdDailyDate') && !document.getElementById('cdDailyDate').value) document.getElementById('cdDailyDate').value = today;
  if (document.getElementById('cdPrintDate') && !document.getElementById('cdPrintDate').value) document.getElementById('cdPrintDate').value = today;
  if (document.getElementById('cdMonthlyMonth') && !document.getElementById('cdMonthlyMonth').value) document.getElementById('cdMonthlyMonth').value = curMonth;
  if (document.getElementById('cdExtractMonth') && !document.getElementById('cdExtractMonth').value) document.getElementById('cdExtractMonth').value = curMonth;
  loadCdMonthlyDataForm();
}

function switchCdMainTab(tab) {
  const bDaily = document.getElementById('cd-main-tab-daily');
  const bMonthly = document.getElementById('cd-main-tab-monthly');
  const vDaily = document.getElementById('cd-view-daily');
  const vMonthly = document.getElementById('cd-view-monthly');
  if (tab === 'daily') {
    if (vDaily) vDaily.style.display = 'block';
    if (vMonthly) vMonthly.style.display = 'none';
    if (bDaily) { bDaily.style.background = '#dc3545'; bDaily.style.boxShadow = '0 4px 12px rgba(220,53,69,0.3)'; }
    if (bMonthly) { bMonthly.style.background = '#6c757d'; bMonthly.style.boxShadow = 'none'; }
  } else {
    if (vDaily) vDaily.style.display = 'none';
    if (vMonthly) vMonthly.style.display = 'block';
    if (bMonthly) { bMonthly.style.background = '#003366'; bMonthly.style.boxShadow = '0 4px 12px rgba(0,51,102,0.3)'; }
    if (bDaily) { bDaily.style.background = '#6c757d'; bDaily.style.boxShadow = 'none'; }
    loadCdMonthlyDataForm();
  }
}

function switchCdDailySubTab(tab) {
  document.querySelectorAll('#cd-view-daily .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#cd-view-daily .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-cd-daily-' + tab)?.classList.add('active');
  document.getElementById('tab-cd-daily-' + tab)?.classList.add('active');
  if (tab === 'report') renderSavedCdDaily();
}

function switchCdMonthlySubTab(tab) {
  document.querySelectorAll('#cd-view-monthly .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#cd-view-monthly .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('btn-cd-monthly-' + tab)?.classList.add('active');
  document.getElementById('tab-cd-monthly-' + tab)?.classList.add('active');
}

function buildCdDailyFormSections(existingData) {
  const container = document.getElementById('cd-daily-dynamic-sections');
  if (!container) return;

  const d = existingData || {};
  const trucks = d.trucks || JSON.parse(JSON.stringify(CD_DEFAULT_TRUCKS));
  const stock = d.stock || { foam: 3243, powder: 2427, waterNote: "خزان مياه سعة 50 م³ مقسمة على 2 طلمبة رفع بقوة تصريف 1000 جالون / دقيقة + 1 سيارة دعم إضافي حمولة 10 طن عهدة الإدارة الهندسية", status: "مطابق" };
  const personnel = d.personnel || { officers: { base: 3, req: 2, day: 1, night: 1, standby: 0, note: "" }, drivers: { base: 7, req: 4, day: 2, night: 1, standby: 1, note: "" }, firefighters: { base: 15, req: 9, day: 3, night: 3, standby: 3, note: "" } };
  const rooms = d.rooms || CD_BUILDING_ROOMS.map(r => ({ room: r, hazard: "لا يوجد", responsible: "الهندسة المدنية", note: "", status: "مغلق", rectDate: "" }));
  const comm = d.comm || CD_COMM_EQUIPMENT.map(c => ({ item: c, condition: "صالح", responsible: "تكنولوجيا المعلومات", note: "", status: "مغلق", rectDate: "" }));
  const equip = d.equip || CD_TRUCK_EQUIPMENT.map(eq => ({ name: eq.name, cars: [...eq.def], condition: eq.status, responsible: "الهندسة الميكانيكية", note: eq.note, status: eq.note ? "مفتوح" : "مغلق", rectDate: "" }));
  const tech = d.tech || CD_TRUCK_TECHNICAL.map(t => ({ name: t.name, cars: [...t.def], note: "", responsible: "الهندسة الميكانيكية", status: "مغلق", rectDate: "" }));
  const pendingList = d.pendingNotes || [
    { note: "جسم سيارة الإطفاء رقم (5) به تآكل وصدأ ويحتاج لسمكرة وإعادة دهان", dept: "الإدارة الهندسية", status: "مفتوح", obsDate: d.date || new Date().toISOString().split('T')[0], rectDate: "" },
    { note: "جسم سيارة إطفاء رقم (4) به تآكل وصدأ ويحتاج لسمكرة وإعادة دهان", dept: "الإدارة الهندسية", status: "مفتوح", obsDate: d.date || new Date().toISOString().split('T')[0], rectDate: "" }
  ];

  const deptOptionsHtml = (sel) => CD_RESPONSIBLE_DEPTS.map(dp => `<option value="${dp}" ${dp === sel ? 'selected' : ''}>${dp}</option>`).join('');

  let html = `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;">
        <span>أولاً: متطلبات سلطة الطيران المدني المصري EAC 139-18</span>
        <span>درجة المطار طبقاً للتشريع: <input type="number" id="cdAirportCat" value="${d.airportCat || 7}" style="width:55px;text-align:center;font-weight:bold;border-radius:4px;border:none;padding:2px;"></span>
      </div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;">
        <table class="report-table" style="width:100%;min-width:520px;margin:0;font-size:12px;">
          <thead><tr><th>البند</th><th>متطلبات EAC 139-18</th><th>المتوفر بالخدمة حالياً (يحسب تلقائياً)</th><th>ملاحظات المطابقة</th></tr></thead>
          <tbody>
            <tr><td style="font-weight:bold;text-align:right;">عدد السيارات</td><td dir="ltr">2</td><td dir="ltr" id="cd-eac-trucks" style="font-weight:900;color:#28a745;font-size:13px;">6</td><td><input type="text" id="cdEacNote1" value="${d.eacNote1 || 'مطابق'}" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:4px;"></td></tr>
            <tr><td style="font-weight:bold;text-align:right;">حمولة المياه (لتر)</td><td dir="ltr">12,100</td><td dir="ltr" id="cd-eac-water" style="font-weight:900;color:#28a745;font-size:13px;">54,000</td><td><input type="text" id="cdEacNote2" value="${d.eacNote2 || 'مطابق'}" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:4px;"></td></tr>
            <tr><td style="font-weight:bold;text-align:right;">حمولة الرغوى AFFF 3% (لتر)</td><td dir="ltr">363</td><td dir="ltr" id="cd-eac-foam" style="font-weight:900;color:#28a745;font-size:13px;">4,890</td><td><input type="text" id="cdEacNote3" value="${d.eacNote3 || 'مطابق'}" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:4px;"></td></tr>
            <tr><td style="font-weight:bold;text-align:right;">حمولة البودرة (كجم)</td><td dir="ltr">225</td><td dir="ltr" id="cd-eac-powder" style="font-weight:900;color:#28a745;font-size:13px;">1,250</td><td><input type="text" id="cdEacNote4" value="${d.eacNote4 || 'مطابق'}" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:4px;"></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  let truckRows = trucks.map((tr, idx) => `
    <tr>
      <td style="font-weight:bold;">${tr.id}</td>
      <td><input type="text" id="cd_tr_model_${idx}" value="${tr.model}" style="width:100px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;font-weight:bold;"></td>
      <td><input type="text" id="cd_tr_type_${idx}" value="${tr.type}" style="width:110px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;"></td>
      <td><input type="number" id="cd_tr_water_${idx}" value="${tr.water}" oninput="recalcCdDailyTotals()" style="width:80px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;"></td>
      <td><input type="number" id="cd_tr_foam_${idx}" value="${tr.foam}" oninput="recalcCdDailyTotals()" style="width:75px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;"></td>
      <td><input type="number" id="cd_tr_dis_${idx}" value="${tr.discharge}" style="width:75px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;"></td>
      <td><input type="number" id="cd_tr_pow_${idx}" value="${tr.powder}" oninput="recalcCdDailyTotals()" style="width:70px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;"></td>
      <td><select id="cd_tr_st_${idx}" onchange="recalcCdDailyTotals()" style="padding:4px;border-radius:4px;font-weight:bold;border:1px solid #888;"><option value="صالح" ${tr.status === 'صالح' ? 'selected' : ''}>صالح ✅</option><option value="صيانة" ${tr.status === 'صيانة' ? 'selected' : ''}>صيانة ⚠️</option><option value="غير صالح" ${tr.status === 'غير صالح' ? 'selected' : ''}>غير صالح ❌</option></select></td>
      <td><input type="text" id="cd_tr_note_${idx}" value="${tr.note || ''}" placeholder="ملاحظات السيارة..." style="width:160px;padding:4px;border:1px solid #ccc;border-radius:4px;"></td>
    </tr>
  `).join('');

  html += `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">ثانياً: بيان بسيارات الوحدة والحمولة الفعلية (سيارات الإطفاء 1 - 6)</div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;">
        <table class="report-table" style="width:100%;min-width:820px;margin:0;font-size:11.5px;">
          <thead><tr><th>رقم</th><th>موديل السيارة</th><th>النوع</th><th>المياه (لتر)</th><th>الرغوى (لتر)</th><th>معدل التصريف</th><th>البودرة (كجم)</th><th>الحالة</th><th>ملاحظات</th></tr></thead>
          <tbody>${truckRows}</tbody>
        </table>
      </div>
    </div>
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">ثالثاً: المخزون الاستراتيجي بمخازن الوحدة</div>
      <div style="padding:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
        <div class="inc-grid-field"><label>الرغـوى AFFF 3% (لتر):</label><input type="number" id="cdStockFoam" value="${stock.foam}"></div>
        <div class="inc-grid-field"><label>البودرة الكيماوية الجافة (كجم):</label><input type="number" id="cdStockPowder" value="${stock.powder}"></div>
        <div class="inc-grid-field"><label>حالة مطابقة المخزون الاستراتيجي:</label><select id="cdStockStatus"><option value="مطابق" ${stock.status === 'مطابق' ? 'selected' : ''}>مطابق ✅</option><option value="غير مطابق" ${stock.status === 'غير مطابق' ? 'selected' : ''}>غير مطابق ❌</option></select></div>
        <div class="inc-grid-field" style="grid-column:1 / -1;"><label>المياه الخاصة بإعادة التعبئة والدعم:</label><input type="text" id="cdStockWaterNote" value="${stock.waterNote}"></div>
      </div>
    </div>
  `;

  const pKeys = [{ key: "officers", label: "الضباط" }, { key: "drivers", label: "السائقين" }, { key: "firefighters", label: "الأفراد" }];
  let pRows = pKeys.map(pk => {
    let pv = personnel[pk.key] || { base: 0, req: 0, day: 0, night: 0, standby: 0, note: "" };
    return `<tr><td style="font-weight:bold;">${pk.label}</td><td><input type="number" id="cd_p_${pk.key}_base" value="${pv.base}" oninput="recalcCdDailyTotals()" style="width:65px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="number" id="cd_p_${pk.key}_req" value="${pv.req}" oninput="recalcCdDailyTotals()" style="width:65px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="number" id="cd_p_${pk.key}_day" value="${pv.day}" oninput="recalcCdDailyTotals()" style="width:65px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="number" id="cd_p_${pk.key}_night" value="${pv.night}" oninput="recalcCdDailyTotals()" style="width:65px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="number" id="cd_p_${pk.key}_standby" value="${pv.standby}" oninput="recalcCdDailyTotals()" style="width:65px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td id="cd_p_${pk.key}_tot" style="font-weight:bold;color:#003366;">0</td><td><input type="text" id="cd_p_${pk.key}_note" value="${pv.note || ''}" placeholder="ملاحظات..." style="width:140px;padding:4px;border:1px solid #ccc;border-radius:4px;"></td></tr>`;
  }).join('');

  html += `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">رابعاً: بيان حالة بقوة وحدة الإطفاء بالمطار</div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;">
        <table class="report-table" style="width:100%;min-width:680px;margin:0;font-size:11.5px;">
          <thead><tr><th>الوظيفة</th><th>القوة الأساسية</th><th>المطلوب باليوم</th><th>نهاري</th><th>ليلي</th><th>الاحتياطي</th><th>الإجمالي المتواجد</th><th>ملاحظات</th></tr></thead>
          <tbody>${pRows}<tr style="background:#e8f4fd;font-weight:bold;"><td>الإجمالي (بدون الضباط)</td><td id="cd_p_sum_base">22</td><td id="cd_p_sum_req">13</td><td id="cd_p_sum_day">5</td><td id="cd_p_sum_night">4</td><td id="cd_p_sum_standby">4</td><td id="cd_p_sum_total" style="color:#28a745;font-size:13px;">13</td><td>تمام الأفراد المتواجدين بالخدمة بدون الضباط</td></tr></tbody>
        </table>
      </div>
    </div>
  `;

  let roomRows = rooms.map((rm, idx) => {
    let isCl = rm.status === 'مغلق';
    return `<tr><td style="font-weight:bold;text-align:right;">${rm.room}</td><td><select id="cd_rm_haz_${idx}" style="padding:4px;border-radius:4px;border:1px solid #ccc;"><option value="لا يوجد" ${rm.hazard === 'لا يوجد' ? 'selected' : ''}>لا يوجد ✅</option><option value="يوجد ملاحظة" ${rm.hazard !== 'لا يوجد' ? 'selected' : ''}>يوجد ملاحظة ⚠️</option></select></td><td><input type="text" id="cd_rm_note_${idx}" value="${rm.note || ''}" placeholder="تفاصيل الملاحظة إن وجدت..." style="width:100%;min-width:150px;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><select id="cd_rm_resp_${idx}" style="padding:4px;border-radius:4px;border:1px solid #ccc;">${deptOptionsHtml(rm.responsible)}</select></td><td><input type="hidden" id="cd_rm_st_${idx}" value="${isCl ? 'مغلق' : 'مفتوح'}"><input type="hidden" id="cd_rm_rdate_${idx}" value="${rm.rectDate || ''}"><button type="button" onclick="toggleCdRowStatus('cd_rm', ${idx}, this)" style="background:${isCl ? '#28a745' : '#dc3545'};color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px;white-space:nowrap;">${isCl ? 'مغلق ✔' : 'مفتوح (إغلاق الآن)'}</button></td></tr>`;
  }).join('');

  let commRows = comm.map((cm, idx) => {
    let isCl = cm.status === 'مغلق';
    return `<tr><td style="font-weight:bold;text-align:right;">${cm.item}</td><td><select id="cd_cm_cond_${idx}" style="padding:4px;border-radius:4px;border:1px solid #ccc;font-weight:bold;"><option value="صالح" ${cm.condition === 'صالح' ? 'selected' : ''}>صالح ✅</option><option value="معطل" ${cm.condition === 'معطل' ? 'selected' : ''}>معطل ❌</option></select></td><td><input type="text" id="cd_cm_note_${idx}" value="${cm.note || ''}" placeholder="ملاحظات..." style="width:100%;min-width:150px;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><select id="cd_cm_resp_${idx}" style="padding:4px;border-radius:4px;border:1px solid #ccc;">${deptOptionsHtml(cm.responsible)}</select></td><td><input type="hidden" id="cd_cm_st_${idx}" value="${isCl ? 'مغلق' : 'مفتوح'}"><input type="hidden" id="cd_cm_rdate_${idx}" value="${cm.rectDate || ''}"><button type="button" onclick="toggleCdRowStatus('cd_cm', ${idx}, this)" style="background:${isCl ? '#28a745' : '#dc3545'};color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px;white-space:nowrap;">${isCl ? 'مغلق ✔' : 'مفتوح (إغلاق الآن)'}</button></td></tr>`;
  }).join('');

  html += `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">خامساً: قائمة تفتيش السلامة لمبنى الحماية المدنية وتجهيزات غرفة عمليات الاتصالات</div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="report-table" style="width:100%;min-width:650px;margin:0;font-size:11.5px;"><thead><tr><th>المكان بالمبنى</th><th>وصف الخطر</th><th>ملاحظات</th><th>الجهة المسئولة</th><th>حالة الملاحظة</th></tr></thead><tbody>${roomRows}</tbody></table></div>
      <div style="background:#e8f4fd;color:#003366;padding:8px 14px;font-weight:bold;border-top:1px solid #b8daff;border-bottom:1px solid #b8daff;">تجهيزات غرفة عمليات الاتصالات:</div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="report-table" style="width:100%;min-width:650px;margin:0;font-size:11.5px;"><thead><tr><th>التجهيز</th><th>الصلاحية والأعطال</th><th>ملاحظات</th><th>الجهة المسئولة</th><th>حالة الملاحظة</th></tr></thead><tbody>${commRows}</tbody></table></div>
    </div>
  `;

  let eqRows = equip.map((eq, idx) => {
    let isCl = eq.status === 'مغلق';
    let carInputs = [0,1,2,3,4,5].map(c => `<td><input type="text" id="cd_eq_${idx}_c${c}" value="${eq.cars[c] !== undefined ? eq.cars[c] : ''}" style="width:42px;text-align:center;padding:3px;border:1px solid #ccc;border-radius:3px;"></td>`).join('');
    return `<tr><td style="font-weight:bold;">${idx + 1}</td><td style="font-weight:bold;text-align:right;min-width:140px;">${eq.name}</td>${carInputs}<td><select id="cd_eq_cond_${idx}" style="padding:3px;border-radius:4px;border:1px solid #ccc;font-weight:bold;"><option value="صالح" ${eq.condition === 'صالح' ? 'selected' : ''}>صالح ✅</option><option value="صيانة" ${eq.condition === 'صيانة' ? 'selected' : ''}>صيانة ⚠️</option><option value="غير صالح" ${eq.condition === 'غير صالح' ? 'selected' : ''}>غير صالح ❌</option></select></td><td><input type="text" id="cd_eq_note_${idx}" value="${eq.note || ''}" placeholder="ملاحظات..." style="width:140px;padding:3px;border:1px solid #ccc;border-radius:3px;"></td><td><select id="cd_eq_resp_${idx}" style="padding:3px;border-radius:4px;border:1px solid #ccc;">${deptOptionsHtml(eq.responsible)}</select></td><td><input type="hidden" id="cd_eq_st_${idx}" value="${isCl ? 'مغلق' : 'مفتوح'}"><input type="hidden" id="cd_eq_rdate_${idx}" value="${eq.rectDate || ''}"><button type="button" onclick="toggleCdRowStatus('cd_eq', ${idx}, this)" style="background:${isCl ? '#28a745' : '#dc3545'};color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:10.5px;white-space:nowrap;">${isCl ? 'مغلق ✔' : 'مفتوح'}</button></td></tr>`;
  }).join('');

  let techRows = tech.map((tc, idx) => {
    let isCl = tc.status === 'مغلق';
    let carSelects = [0,1,2,3,4,5].map(c => {
      let val = tc.cars[c] || 'صالح';
      return `<td><select id="cd_tc_${idx}_c${c}" style="padding:3px;border-radius:3px;border:1px solid #ccc;font-size:11px;"><option value="صالح" ${val === 'صالح' ? 'selected' : ''}>صالح ☑</option><option value="صيانة" ${val === 'صيانة' ? 'selected' : ''}>صيانة ◈</option><option value="لا يوجد" ${val === 'لا يوجد' ? 'selected' : ''}>لا يوجد ☐</option></select></td>`;
    }).join('');
    return `<tr><td style="font-weight:bold;">${idx + 1}</td><td style="font-weight:bold;text-align:right;min-width:150px;">${tc.name}</td>${carSelects}<td><input type="text" id="cd_tc_note_${idx}" value="${tc.note || ''}" placeholder="ملاحظات..." style="width:130px;padding:3px;border:1px solid #ccc;border-radius:3px;"></td><td><select id="cd_tc_resp_${idx}" style="padding:3px;border-radius:4px;border:1px solid #ccc;">${deptOptionsHtml(tc.responsible)}</select></td><td><input type="hidden" id="cd_tc_st_${idx}" value="${isCl ? 'مغلق' : 'مفتوح'}"><input type="hidden" id="cd_tc_rdate_${idx}" value="${tc.rectDate || ''}"><button type="button" onclick="toggleCdRowStatus('cd_tc', ${idx}, this)" style="background:${isCl ? '#28a745' : '#dc3545'};color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:10.5px;white-space:nowrap;">${isCl ? 'مغلق ✔' : 'مفتوح'}</button></td></tr>`;
  }).join('');

  let pendRows = pendingList.map((pn, idx) => buildCdPendingRowHtml(pn, idx)).join('');

  html += `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;"><span>سادساً: 1- بيان مُعدات الإطفاء والإنقاذ الخاصة بعربات الإطفاء (33 بنداً)</span><span style="font-size:11px;opacity:0.9;">(الرمز u يعني لا يوجد بالسيارة)</span></div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;max-height:460px;"><table class="report-table" style="width:100%;min-width:920px;margin:0;font-size:11px;"><thead style="position:sticky;top:0;z-index:5;"><tr><th>م</th><th>المعدات</th><th>سيارة 1</th><th>سيارة 2</th><th>سيارة 3</th><th>سيارة 4</th><th>سيارة 5</th><th>سيارة 6</th><th>الحالة</th><th>ملاحظات</th><th>الجهة</th><th>الإجراء</th></tr></thead><tbody>${eqRows}</tbody></table></div>
    </div>
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;">
      <div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">سادساً: 2- الحالة الفنية لسيارات الإطفاء (19 بنداً فنياً)</div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;max-height:460px;"><table class="report-table" style="width:100%;min-width:920px;margin:0;font-size:11px;"><thead style="position:sticky;top:0;z-index:5;"><tr><th>م</th><th>البيان الفني</th><th>سيارة 1</th><th>سيارة 2</th><th>سيارة 3</th><th>سيارة 4</th><th>سيارة 5</th><th>سيارة 6</th><th>ملاحظات</th><th>الجهة</th><th>الإجراء</th></tr></thead><tbody>${techRows}</tbody></table></div>
    </div>
    <div style="border:1.5px solid #dc3545;border-radius:8px;overflow:hidden;margin-bottom:15px;background:#fff;">
      <div style="background:#dc3545;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;"><span>سابعاً: الملحوظات المعلقة العامة والمتابعة</span><button type="button" onclick="addCdPendingRow()" style="background:#fff;color:#dc3545;border:none;padding:4px 12px;border-radius:5px;font-weight:bold;cursor:pointer;font-size:12px;"><i class="fa-solid fa-plus"></i> إضافة ملحوظة جديدة</button></div>
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="report-table" style="width:100%;min-width:650px;margin:0;font-size:11.5px;"><thead><tr><th>بيان الملحوظة</th><th>الإدارة المعنية</th><th>تاريخ الرصد</th><th>الحالة</th><th>حذف</th></tr></thead><tbody id="cd-pending-notes-tbody">${pendRows}</tbody></table></div>
    </div>
  `;

  container.innerHTML = html;
  recalcCdDailyTotals();
}

function buildCdPendingRowHtml(pn, idx) {
  const deptOptionsHtml = CD_RESPONSIBLE_DEPTS.map(dp => `<option value="${dp}" ${dp === (pn.dept || 'الإدارة الهندسية') ? 'selected' : ''}>${dp}</option>`).join('');
  const isCl = pn.status === 'مغلق';
  return `<tr class="cd-pending-row"><td><input type="text" class="cd-pn-text" value="${(pn.note || '').replace(/"/g, '&quot;')}" placeholder="اكتب نص الملاحظة..." style="width:100%;min-width:240px;padding:5px;border:1px solid #ccc;border-radius:4px;"></td><td><select class="cd-pn-dept" style="padding:5px;border-radius:4px;border:1px solid #ccc;">${deptOptionsHtml}</select></td><td><input type="date" class="cd-pn-obsdate" value="${pn.obsDate || new Date().toISOString().split('T')[0]}" style="padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="hidden" class="cd-pn-status" value="${isCl ? 'مغلق' : 'مفتوح'}"><input type="hidden" class="cd-pn-rectdate" value="${pn.rectDate || ''}"><button type="button" onclick="toggleCdPendingRowBtn(this)" style="background:${isCl ? '#28a745' : '#dc3545'};color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px;white-space:nowrap;">${isCl ? 'مغلق ✔' : 'مفتوح (إغلاق الآن)'}</button></td><td><button type="button" onclick="this.closest('tr').remove()" style="background:#888;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`;
}

function addCdPendingRow() {
  const tb = document.getElementById('cd-pending-notes-tbody');
  if (!tb) return;
  const dt = document.getElementById('cdDailyDate')?.value || new Date().toISOString().split('T')[0];
  tb.insertAdjacentHTML('beforeend', buildCdPendingRowHtml({ note: "", dept: "الإدارة الهندسية", status: "مفتوح", obsDate: dt, rectDate: "" }, tb.children.length));
}

function toggleCdRowStatus(prefix, idx, btn) {
  const stInp = document.getElementById(`${prefix}_st_${idx}`);
  const rdInp = document.getElementById(`${prefix}_rdate_${idx}`);
  const today = new Date().toISOString().split('T')[0];
  if (!stInp) return;
  if (stInp.value !== 'مغلق') { stInp.value = 'مغلق'; if (rdInp) rdInp.value = today; btn.style.background = '#28a745'; btn.innerHTML = 'مغلق ✔'; }
  else { stInp.value = 'مفتوح'; if (rdInp) rdInp.value = ''; btn.style.background = '#dc3545'; btn.innerHTML = 'مفتوح (إغلاق الآن)'; }
}

function toggleCdPendingRowBtn(btn) {
  const tr = btn.closest('tr');
  const stInp = tr.querySelector('.cd-pn-status');
  const rdInp = tr.querySelector('.cd-pn-rectdate');
  const today = new Date().toISOString().split('T')[0];
  if (stInp.value !== 'مغلق') { stInp.value = 'مغلق'; rdInp.value = today; btn.style.background = '#28a745'; btn.innerHTML = 'مغلق ✔'; }
  else { stInp.value = 'مفتوح'; rdInp.value = ''; btn.style.background = '#dc3545'; btn.innerHTML = 'مفتوح (إغلاق الآن)'; }
}

function recalcCdDailyTotals() {
  let activeTrucks = 0, totWater = 0, totFoam = 0, totPowder = 0;
  for (let i = 0; i < 6; i++) {
    let st = document.getElementById(`cd_tr_st_${i}`)?.value || 'صالح';
    let w = Number(document.getElementById(`cd_tr_water_${i}`)?.value || 0);
    let f = Number(document.getElementById(`cd_tr_foam_${i}`)?.value || 0);
    let p = Number(document.getElementById(`cd_tr_pow_${i}`)?.value || 0);
    if (st === 'صالح') { activeTrucks++; totWater += w; totFoam += f; totPowder += p; }
  }
  const elT = document.getElementById('cd-eac-trucks'), elW = document.getElementById('cd-eac-water'), elF = document.getElementById('cd-eac-foam'), elP = document.getElementById('cd-eac-powder');
  if (elT) { elT.innerText = activeTrucks; elT.style.color = activeTrucks >= 2 ? '#28a745' : '#dc3545'; }
  if (elW) { elW.innerText = totWater.toLocaleString(); elW.style.color = totWater >= 12100 ? '#28a745' : '#dc3545'; }
  if (elF) { elF.innerText = totFoam.toLocaleString(); elF.style.color = totFoam >= 363 ? '#28a745' : '#dc3545'; }
  if (elP) { elP.innerText = totPowder.toLocaleString(); elP.style.color = totPowder >= 225 ? '#28a745' : '#dc3545'; }

  ["officers", "drivers", "firefighters"].forEach(k => {
    let d = Number(document.getElementById(`cd_p_${k}_day`)?.value || 0);
    let n = Number(document.getElementById(`cd_p_${k}_night`)?.value || 0);
    let s = Number(document.getElementById(`cd_p_${k}_standby`)?.value || 0);
    let totEl = document.getElementById(`cd_p_${k}_tot`);
    if (totEl) totEl.innerText = (d + n + s);
  });

  let bSum = Number(document.getElementById('cd_p_drivers_base')?.value || 0) + Number(document.getElementById('cd_p_firefighters_base')?.value || 0);
  let rSum = Number(document.getElementById('cd_p_drivers_req')?.value || 0) + Number(document.getElementById('cd_p_firefighters_req')?.value || 0);
  let dSum = Number(document.getElementById('cd_p_drivers_day')?.value || 0) + Number(document.getElementById('cd_p_firefighters_day')?.value || 0);
  let nSum = Number(document.getElementById('cd_p_drivers_night')?.value || 0) + Number(document.getElementById('cd_p_firefighters_night')?.value || 0);
  let sSum = Number(document.getElementById('cd_p_drivers_standby')?.value || 0) + Number(document.getElementById('cd_p_firefighters_standby')?.value || 0);

  if (document.getElementById('cd_p_sum_base')) document.getElementById('cd_p_sum_base').innerText = bSum;
  if (document.getElementById('cd_p_sum_req')) document.getElementById('cd_p_sum_req').innerText = rSum;
  if (document.getElementById('cd_p_sum_day')) document.getElementById('cd_p_sum_day').innerText = dSum;
  if (document.getElementById('cd_p_sum_night')) document.getElementById('cd_p_sum_night').innerText = nSum;
  if (document.getElementById('cd_p_sum_standby')) document.getElementById('cd_p_sum_standby').innerText = sSum;
  if (document.getElementById('cd_p_sum_total')) document.getElementById('cd_p_sum_total').innerText = (dSum + nSum + sSum);
}

function collectCdDailyFormData() {
  const dt = document.getElementById('cdDailyDate')?.value || new Date().toISOString().split('T')[0];
  const tm = document.getElementById('cdDailyTime')?.value || '08:00';
  const sh = document.getElementById('cdDailyShift')?.value || 'صباحي';
  const insp = document.getElementById('cdDailyInspector')?.value?.trim() || 'إسلام خالد';

  let trucks = [];
  for (let i = 0; i < 6; i++) {
    trucks.push({ id: i + 1, model: document.getElementById(`cd_tr_model_${i}`)?.value || '', type: document.getElementById(`cd_tr_type_${i}`)?.value || '', water: Number(document.getElementById(`cd_tr_water_${i}`)?.value || 0), foam: Number(document.getElementById(`cd_tr_foam_${i}`)?.value || 0), discharge: Number(document.getElementById(`cd_tr_dis_${i}`)?.value || 0), powder: Number(document.getElementById(`cd_tr_pow_${i}`)?.value || 0), status: document.getElementById(`cd_tr_st_${i}`)?.value || 'صالح', note: document.getElementById(`cd_tr_note_${i}`)?.value || '' });
  }

  let stock = { foam: Number(document.getElementById('cdStockFoam')?.value || 0), powder: Number(document.getElementById('cdStockPowder')?.value || 0), status: document.getElementById('cdStockStatus')?.value || 'مطابق', waterNote: document.getElementById('cdStockWaterNote')?.value || '' };
  let personnel = {};
  ["officers", "drivers", "firefighters"].forEach(k => { personnel[k] = { base: Number(document.getElementById(`cd_p_${k}_base`)?.value || 0), req: Number(document.getElementById(`cd_p_${k}_req`)?.value || 0), day: Number(document.getElementById(`cd_p_${k}_day`)?.value || 0), night: Number(document.getElementById(`cd_p_${k}_night`)?.value || 0), standby: Number(document.getElementById(`cd_p_${k}_standby`)?.value || 0), note: document.getElementById(`cd_p_${k}_note`)?.value || '' }; });
  let rooms = CD_BUILDING_ROOMS.map((r, idx) => ({ room: r, hazard: document.getElementById(`cd_rm_haz_${idx}`)?.value || 'لا يوجد', note: document.getElementById(`cd_rm_note_${idx}`)?.value || '', responsible: document.getElementById(`cd_rm_resp_${idx}`)?.value || 'الهندسة المدنية', status: document.getElementById(`cd_rm_st_${idx}`)?.value || 'مغلق', rectDate: document.getElementById(`cd_rm_rdate_${idx}`)?.value || '' }));
  let comm = CD_COMM_EQUIPMENT.map((c, idx) => ({ item: c, condition: document.getElementById(`cd_cm_cond_${idx}`)?.value || 'صالح', note: document.getElementById(`cd_cm_note_${idx}`)?.value || '', responsible: document.getElementById(`cd_cm_resp_${idx}`)?.value || 'تكنولوجيا المعلومات', status: document.getElementById(`cd_cm_st_${idx}`)?.value || 'مغلق', rectDate: document.getElementById(`cd_cm_rdate_${idx}`)?.value || '' }));
  let equip = CD_TRUCK_EQUIPMENT.map((eq, idx) => { let cars = []; for (let c = 0; c < 6; c++) cars.push(document.getElementById(`cd_eq_${idx}_c${c}`)?.value || ''); return { name: eq.name, cars: cars, condition: document.getElementById(`cd_eq_cond_${idx}`)?.value || 'صالح', note: document.getElementById(`cd_eq_note_${idx}`)?.value || '', responsible: document.getElementById(`cd_eq_resp_${idx}`)?.value || 'الهندسة الميكانيكية', status: document.getElementById(`cd_eq_st_${idx}`)?.value || 'مغلق', rectDate: document.getElementById(`cd_eq_rdate_${idx}`)?.value || '' }; });
  let tech = CD_TRUCK_TECHNICAL.map((tc, idx) => { let cars = []; for (let c = 0; c < 6; c++) cars.push(document.getElementById(`cd_tc_${idx}_c${c}`)?.value || 'صالح'); return { name: tc.name, cars: cars, note: document.getElementById(`cd_tc_note_${idx}`)?.value || '', responsible: document.getElementById(`cd_tc_resp_${idx}`)?.value || 'الهندسة الميكانيكية', status: document.getElementById(`cd_tc_st_${idx}`)?.value || 'مغلق', rectDate: document.getElementById(`cd_tc_rdate_${idx}`)?.value || '' }; });

  let pendingNotes = [];
  document.querySelectorAll('#cd-pending-notes-tbody .cd-pending-row').forEach(tr => {
    let txt = tr.querySelector('.cd-pn-text')?.value?.trim() || '';
    if (txt) pendingNotes.push({ note: txt, dept: tr.querySelector('.cd-pn-dept')?.value || 'الإدارة الهندسية', obsDate: tr.querySelector('.cd-pn-obsdate')?.value || dt, status: tr.querySelector('.cd-pn-status')?.value || 'مفتوح', rectDate: tr.querySelector('.cd-pn-rectdate')?.value || '' });
  });

  return { id: isCdDailyEditMode ? (currentCdDailyEditId || Date.now()) : Date.now(), date: dt, time: tm, shift: sh, inspector: insp, airportCat: Number(document.getElementById('cdAirportCat')?.value || 7), eacNote1: document.getElementById('cdEacNote1')?.value || 'مطابق', eacNote2: document.getElementById('cdEacNote2')?.value || 'مطابق', eacNote3: document.getElementById('cdEacNote3')?.value || 'مطابق', eacNote4: document.getElementById('cdEacNote4')?.value || 'مطابق', trucks: trucks, stock: stock, personnel: personnel, rooms: rooms, comm: comm, equip: equip, tech: tech, pendingNotes: pendingNotes };
}

function submitCdDailyInspection(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('submitCdDailyBtn');
  const msg = document.getElementById('cdDailyMsg');
  const repObj = collectCdDailyFormData();
  if (isCdDailyEditMode && currentCdDailyIndex >= 0 && currentCdDailyIndex < globalCivilDefenseDaily.length) globalCivilDefenseDaily[currentCdDailyIndex] = repObj;
  else { globalCivilDefenseDaily.unshift(repObj); }
  sortCdDailyByDate();
  currentCdDailyIndex = globalCivilDefenseDaily.findIndex(x => x.id === repObj.id);
  if (currentCdDailyIndex < 0) currentCdDailyIndex = 0;
  try { localStorage.setItem('rmf_cd_daily', JSON.stringify(globalCivilDefenseDaily)); } catch (err) {}
  renderSavedCdDaily(); updateCdDailyNavCounter();

  safePost({ action: isCdDailyEditMode ? "updateCivilDefenseDaily" : "submitCivilDefenseDaily", reportData: repObj }, btn, msg, "تم حفظ بيان الحالة اليومية للحماية المدنية بنجاح!", () => {
    alert("✅ تم حفظ بيان الحالة اليومية للحماية المدنية وتحديث السجل بنجاح!");
    isCdDailyEditMode = false; currentCdDailyEditId = null;
    if (document.getElementById('cdPrintDate')) document.getElementById('cdPrintDate').value = repObj.date;
    switchCdDailySubTab('report'); generateCdDailyPrintView(repObj);
  });
}

function countCdFindings(rep) {
  let openCnt = 0, closedCnt = 0;
  if (!rep) return { openCnt, closedCnt };
  (rep.trucks || []).forEach(t => { if (t.status !== 'صالح' || (t.note && t.note.trim() !== '')) openCnt++; });
  (rep.rooms || []).forEach(r => { if (r.hazard !== 'لا يوجد' || (r.note && r.note.trim() !== '')) { if (r.status === 'مغلق') closedCnt++; else openCnt++; } });
  (rep.comm || []).forEach(c => { if (c.condition !== 'صالح' || (c.note && c.note.trim() !== '')) { if (c.status === 'مغلق') closedCnt++; else openCnt++; } });
  (rep.equip || []).forEach(eq => { if (eq.condition !== 'صالح' || (eq.note && eq.note.trim() !== '')) { if (eq.status === 'مغلق') closedCnt++; else openCnt++; } });
  (rep.tech || []).forEach(tc => { let hasDef = (tc.cars || []).some(v => v === 'صيانة') || (tc.note && tc.note.trim() !== ''); if (hasDef) { if (tc.status === 'مغلق') closedCnt++; else openCnt++; } });
  (rep.pendingNotes || []).forEach(pn => { if (pn.status === 'مغلق') closedCnt++; else openCnt++; });
  return { openCnt, closedCnt };
}

function renderSavedCdDaily() {
  const tb = document.getElementById('saved-cd-daily-tbody');
  if (!tb) return;
  tb.innerHTML = ''; updateCdDailyNavCounter();
  if (!globalCivilDefenseDaily || globalCivilDefenseDaily.length === 0) { tb.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:15px;color:#777;font-weight:bold;">لا توجد بيانات فحص يومي مسجلة للحماية المدنية بعد.</td></tr>'; return; }

  for (let idx = globalCivilDefenseDaily.length - 1; idx >= 0; idx--) {
    const rep = globalCivilDefenseDaily[idx];
    let activeTrucks = (rep.trucks || []).filter(t => t.status === 'صالح').length;
    let counts = countCdFindings(rep);
    let badge = '';
    if (counts.openCnt === 0 && counts.closedCnt === 0) badge = '<span style="background:#28a745;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold;font-size:11px;">سليم 100%</span>';
    else {
      let rB = counts.openCnt > 0 ? `<span style="background:#dc3545;color:#fff;padding:3px 8px;border-radius:12px;font-weight:bold;font-size:11px;">${counts.openCnt} مفتوح</span>` : '';
      let gB = counts.closedCnt > 0 ? `<span style="background:#28a745;color:#fff;padding:3px 8px;border-radius:12px;font-weight:bold;font-size:11px;">${counts.closedCnt} مغلق</span>` : '';
      badge = `<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">${rB}${gB}</div>`;
    }
    tb.innerHTML += `<tr><td dir="ltr" style="font-weight:bold;"><span style="background:#dc3545;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-right:4px;">#${idx + 1}</span> ${rep.date}</td><td dir="ltr">${rep.time || '-'}</td><td>${rep.shift || '-'}</td><td>${rep.inspector || '-'}</td><td style="font-weight:bold;color:#003366;">${activeTrucks} / 6</td><td>${badge}</td><td style="white-space:nowrap;"><button type="button" onclick="generateCdDailyPrintView(globalCivilDefenseDaily[${idx}])" style="background:#003366;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;margin-left:3px;" title="عرض البيان"><i class="fa-solid fa-eye"></i> البيان</button><button type="button" onclick="loadCdDailyToForm(${idx})" style="background:#ffc107;color:#000;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;font-weight:bold;margin-left:3px;" title="تعديل"><i class="fa-solid fa-pen"></i> تعديل</button><button type="button" onclick="copyCdDailyToToday(${idx})" style="background:#17a2b8;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;margin-left:3px;" title="نسخ لليوم"><i class="fa-solid fa-copy"></i> نسخ لليوم</button><button type="button" onclick="deleteCdDailyRecord(${idx})" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;" title="حذف"><i class="fa-solid fa-trash"></i></button></td></tr>`;
  }
}

function updateCdDailyNavCounter() { const el = document.getElementById('nav-cd-daily-counter'); if (el) el.innerText = globalCivilDefenseDaily.length > 0 ? `${currentCdDailyIndex + 1} / ${globalCivilDefenseDaily.length}` : '0 / 0'; }
function navCdDaily(dir) {
  if (!globalCivilDefenseDaily || globalCivilDefenseDaily.length === 0) return alert("لا توجد جولات مسجلة بعد.");
  if (dir === 'first') currentCdDailyIndex = 0;
  else if (dir === 'last') currentCdDailyIndex = globalCivilDefenseDaily.length - 1;
  else if (dir === 'next') {
    if (currentCdDailyIndex === -1) currentCdDailyIndex = globalCivilDefenseDaily.length - 1;
    else if (currentCdDailyIndex < globalCivilDefenseDaily.length - 1) currentCdDailyIndex++;
  } else if (dir === 'prev') {
    if (currentCdDailyIndex === -1) currentCdDailyIndex = globalCivilDefenseDaily.length - 1;
    else if (currentCdDailyIndex > 0) currentCdDailyIndex--;
  }
  if (currentCdDailyIndex >= 0 && currentCdDailyIndex < globalCivilDefenseDaily.length) loadCdDailyToForm(currentCdDailyIndex);
}

function loadCdDailyToForm(idx) {
  if (!globalCivilDefenseDaily || idx < 0 || idx >= globalCivilDefenseDaily.length) return;
  currentCdDailyIndex = idx;
  const rep = globalCivilDefenseDaily[idx];
  switchCdDailySubTab('entry');
  if (document.getElementById('cdDailyDate')) document.getElementById('cdDailyDate').value = rep.date || '';
  if (document.getElementById('cdDailyTime')) document.getElementById('cdDailyTime').value = rep.time || '';
  if (document.getElementById('cdDailyShift')) document.getElementById('cdDailyShift').value = rep.shift || 'صباحي';
  if (document.getElementById('cdDailyInspector')) document.getElementById('cdDailyInspector').value = rep.inspector || '';
  buildCdDailyFormSections(rep); updateCdDailyNavCounter();
  isCdDailyEditMode = true; currentCdDailyEditId = rep.id;
  const btn = document.getElementById('submitCdDailyBtn');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> حفظ التعديلات وتحديث البيان اليومي'; btn.style.backgroundColor = '#ffc107'; btn.style.color = '#000'; }
}

function clearCdDailyFormForNew() {
  currentCdDailyIndex = -1; isCdDailyEditMode = false; currentCdDailyEditId = null;
  const now = new Date().toISOString();
  if (document.getElementById('cdDailyDate')) document.getElementById('cdDailyDate').value = now.split('T')[0];
  if (document.getElementById('cdDailyTime')) document.getElementById('cdDailyTime').value = now.split('T')[1].substring(0, 5);
  buildCdDailyFormSections(null); updateCdDailyNavCounter();
  const btn = document.getElementById('submitCdDailyBtn');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيان الحالة اليومية للحماية المدنية'; btn.style.backgroundColor = '#dc3545'; btn.style.color = '#fff'; }
}

function copyCdDailyToToday(idx) {
  const rep = globalCivilDefenseDaily[idx];
  if (!rep) return;
  if (!confirm(`هل تريد نسخ بيانات جولة يوم (${rep.date}) إلى جولة جديدة بتاريخ اليوم؟`)) return;
  const cloned = JSON.parse(JSON.stringify(rep));
  cloned.id = Date.now(); cloned.date = new Date().toISOString().split('T')[0]; cloned.time = new Date().toTimeString().slice(0, 5);
  switchCdDailySubTab('entry');
  if (document.getElementById('cdDailyDate')) document.getElementById('cdDailyDate').value = cloned.date;
  if (document.getElementById('cdDailyTime')) document.getElementById('cdDailyTime').value = cloned.time;
  if (document.getElementById('cdDailyShift')) document.getElementById('cdDailyShift').value = cloned.shift || 'صباحي';
  if (document.getElementById('cdDailyInspector')) document.getElementById('cdDailyInspector').value = cloned.inspector || '';
  buildCdDailyFormSections(cloned); isCdDailyEditMode = false; currentCdDailyEditId = null;
  const btn = document.getElementById('submitCdDailyBtn');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيان الحالة اليومية للحماية المدنية'; btn.style.backgroundColor = '#dc3545'; btn.style.color = '#fff'; }
  alert("✅ تم نسخ بيانات الجولة بنجاح إلى نموذج اليوم.");
}

function deleteCdDailyRecord(idx) {
  if (!globalCivilDefenseDaily || !globalCivilDefenseDaily[idx]) return;
  const rep = globalCivilDefenseDaily[idx];
  if (!confirm(`⚠️ هل أنت متأكد من حذف بيان يوم (${rep.date})؟`)) return;
  const delId = rep.id;
  globalCivilDefenseDaily.splice(idx, 1);
  try { localStorage.setItem('rmf_cd_daily', JSON.stringify(globalCivilDefenseDaily)); } catch (e) {}
  renderSavedCdDaily(); safePost({ action: "deleteCivilDefenseDaily", id: delId });
}

function generateCdDailyPrintView(specificRep) {
  let rep = specificRep;
  if (!rep) {
    let targetDate = document.getElementById('cdPrintDate')?.value || '';
    if (!targetDate) return alert("يرجى اختيار تاريخ البيان أولاً!");
    rep = globalCivilDefenseDaily.find(r => r.date === targetDate);
    if (!rep) return alert("لا يوجد بيان يومي مسجل لهذا التاريخ! يرجى إدخاله وحفظه أولاً.");
  }

  const box = document.getElementById('printable-cd-daily-report');
  if (!box) return;

  let activeTrucks = 0, totWater = 0, totFoam = 0, totPowder = 0;
  (rep.trucks || []).forEach(t => { if (t.status === 'صالح') { activeTrucks++; totWater += Number(t.water || 0); totFoam += Number(t.foam || 0); totPowder += Number(t.powder || 0); } });

  const dParts = (rep.date || '').split('-');
  const dispDate = dParts.length === 3 ? `${dParts[2]} / ${dParts[1]} / ${dParts[0]}` : rep.date;

  let tRows = (rep.trucks || []).map(t => `<tr><td><b>${t.model}</b></td><td><b>${t.id}</b></td><td>${t.type}</td><td dir="ltr">${Number(t.water || 0).toLocaleString()}</td><td dir="ltr">${t.foam ? Number(t.foam).toLocaleString() : '-'}</td><td dir="ltr">${t.discharge ? Number(t.discharge).toLocaleString() : '-'}</td><td dir="ltr">${t.powder ? Number(t.powder).toLocaleString() : '-'}</td><td style="font-weight:bold;color:${t.status === 'صالح' ? '#28a745' : '#dc3545'};">${t.status === 'صالح' ? '✔' : ''}</td><td style="font-weight:bold;color:#dc3545;">${t.status !== 'صالح' ? t.status : ''}</td><td>${t.note || '-'}</td></tr>`).join('');
  const p = rep.personnel || { officers: {}, drivers: {}, firefighters: {} };
  const pLabels = [{ k: 'officers', l: 'الضباط' }, { k: 'drivers', l: 'السائقين' }, { k: 'firefighters', l: 'الأفراد' }];
  let pHtmlRows = pLabels.map(item => { let v = p[item.k] || {}; let tot = Number(v.day || 0) + Number(v.night || 0) + Number(v.standby || 0); return `<tr><td><b>${item.l}</b></td><td>${v.base || 0}</td><td>${v.req || 0}</td><td>${v.day || 0}</td><td>${v.night || 0}</td><td>${v.standby || 0}</td><td><b>${tot}</b></td><td>${v.note || '-'}</td></tr>`; }).join('');
  let bSum = Number(p.drivers?.base || 0) + Number(p.firefighters?.base || 0), rSum = Number(p.drivers?.req || 0) + Number(p.firefighters?.req || 0), dSum = Number(p.drivers?.day || 0) + Number(p.firefighters?.day || 0), nSum = Number(p.drivers?.night || 0) + Number(p.firefighters?.night || 0), sSum = Number(p.drivers?.standby || 0) + Number(p.firefighters?.standby || 0);
  let rmRows = (rep.rooms || []).map(r => `<tr><td style="text-align:right;font-weight:bold;">${r.room}</td><td style="color:${r.hazard === 'لا يوجد' ? '#28a745' : '#dc3545'};font-weight:bold;">${r.hazard}</td><td>${r.note || '-'}</td><td>${r.note ? (r.status === 'مغلق' ? 'مغلق ✔' : 'مفتوح') : '-'}</td></tr>`).join('');
  let cmRows = (rep.comm || []).map(c => `<tr><td style="text-align:right;font-weight:bold;">${c.item}</td><td>${c.condition === 'صالح' ? '✔' : ''}</td><td style="color:#dc3545;font-weight:bold;">${c.condition !== 'صالح' ? '✖' : ''}</td><td>${c.note || '-'}</td></tr>`).join('');
  let eqRows = (rep.equip || []).map((eq, i) => `<tr><td>${i + 1}</td><td style="text-align:right;font-weight:bold;">${eq.name}</td><td>${eq.cars[0] || '-'}</td><td>${eq.cars[1] || '-'}</td><td>${eq.cars[2] || '-'}</td><td>${eq.cars[3] || '-'}</td><td>${eq.cars[4] || '-'}</td><td>${eq.cars[5] || '-'}</td><td>${eq.condition === 'صالح' ? '✔' : ''}</td><td style="color:#dc3545;font-weight:bold;">${eq.condition !== 'صالح' ? eq.condition : ''}</td><td>${eq.note || '-'}</td></tr>`).join('');
  let tcRows = (rep.tech || []).map((tc, i) => { const sym = (v) => v === 'صالح' ? '☑' : (v === 'صيانة' ? '◈' : '☐'); return `<tr><td>${i + 1}</td><td style="text-align:right;font-weight:bold;">${tc.name}</td><td>${sym(tc.cars[0])}</td><td>${sym(tc.cars[1])}</td><td>${sym(tc.cars[2])}</td><td>${sym(tc.cars[3])}</td><td>${sym(tc.cars[4])}</td><td>${sym(tc.cars[5])}</td><td>${tc.note || '-'}</td></tr>`; }).join('');
  let pnRows = (rep.pendingNotes || []).length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#28a745;font-weight:bold;">لا توجد ملحوظات معلقة</td></tr>' : (rep.pendingNotes || []).map((pn, i) => `<tr><td>${i + 1}</td><td style="text-align:right;">${pn.note}</td><td>${pn.dept} (${pn.status})</td></tr>`).join('');

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:12px;">
      <div style="text-align:right;font-weight:bold;font-size:12px;">مطار مرسى علم الدولي<br>الإدارة العامة للسلامة والمطابقة<br>قسم سلامة الحماية المدنية</div>
      <div style="text-align:center;"><h2 style="margin:0;font-size:16px;font-weight:900;text-decoration:underline;">بيان الحالة اليومية للحماية المدنية بمطار مرسى علم الدولي</h2><div style="margin-top:4px;font-weight:bold;font-size:12px;">التاريخ: ${dispDate} | الوردية: ${rep.shift || 'صباحي'}</div></div>
      <div><img src="LOGO-removebg-preview (1).png" style="height:50px;"></div>
    </div>
    <div style="font-weight:bold;background:#003366;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">أولاً: متطلبات سلطة الطيران المدني المصري EAC 139-18 (درجة المطار: ${rep.airportCat || 7})</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;margin-bottom:10px;" border="1" cellpadding="4"><tr style="background:#f0f4f8;font-weight:bold;"><th>البند</th><th>EAC 139-18</th><th>بالخدمة</th><th>ملاحظات</th></tr><tr><td><b>السيارات</b></td><td>2</td><td><b>${activeTrucks}</b></td><td>${rep.eacNote1 || 'مطابق'}</td></tr><tr><td><b>حمولة المياه (لتر)</b></td><td>12,100</td><td><b>${totWater.toLocaleString()}</b></td><td>${rep.eacNote2 || 'مطابق'}</td></tr><tr><td><b>حمولة الرغوى AFFF 3% (لتر)</b></td><td>363</td><td><b>${totFoam.toLocaleString()}</b></td><td>${rep.eacNote3 || 'مطابق'}</td></tr><tr><td><b>حمولة البودرة (كجم)</b></td><td>225</td><td><b>${totPowder.toLocaleString()}</b></td><td>${rep.eacNote4 || 'مطابق'}</td></tr></table>
    <div style="font-weight:bold;background:#003366;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">ثانياً: بيان بسيارات الوحدة والحمولة الفعلية</div>
    <table style="width:100%;border-collapse:collapse;font-size:9.5px;text-align:center;margin-bottom:10px;" border="1" cellpadding="3"><tr style="background:#f0f4f8;font-weight:bold;"><th>موديل السيارة</th><th>رقم السيارة</th><th>النوع</th><th>المياه (لتر)</th><th>الرغوى (لتر)</th><th>معدل التصريف</th><th>البودرة (كجم)</th><th>صالح</th><th>غير صالح</th><th>ملاحظات</th></tr>${tRows}</table>
    <div style="font-weight:bold;background:#003366;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">ثالثاً: المخزون الاستراتيجي بمخازن الوحدة (${rep.stock?.status || 'مطابق'})</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;margin-bottom:10px;" border="1" cellpadding="4"><tr><td style="font-weight:bold;background:#f9f9f9;width:35%;">الرغوى AFFF 3% (لتر)</td><td><b>${Number(rep.stock?.foam || 0).toLocaleString()}</b></td></tr><tr><td style="font-weight:bold;background:#f9f9f9;">البودرة الكيماوية الجافة (كجم)</td><td><b>${Number(rep.stock?.powder || 0).toLocaleString()}</b></td></tr><tr><td style="font-weight:bold;background:#f9f9f9;">المياه الخاصة بإعادة التعبئة</td><td>${rep.stock?.waterNote || '-'}</td></tr></table>
    <div style="font-weight:bold;background:#003366;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">رابعاً: بيان حالة بقوة وحدة الإطفاء بالمطار</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;margin-bottom:10px;" border="1" cellpadding="3"><tr style="background:#f0f4f8;font-weight:bold;"><th>الوظيفة</th><th>القوة الأساسية</th><th>المطلوب</th><th>نهاري</th><th>ليلي</th><th>الاحتياطي</th><th>الإجمالي</th><th>ملاحظات</th></tr>${pHtmlRows}<tr style="background:#e8f4fd;font-weight:bold;"><td>الإجمالي (بدون الضباط)</td><td>${bSum}</td><td>${rSum}</td><td>${dSum}</td><td>${nSum}</td><td>${sSum}</td><td>${dSum + nSum + sSum}</td><td>تمام الأفراد المتواجدين اليوم بالخدمة بدون الضباط</td></tr></table>
    <div style="font-weight:bold;background:#003366;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">خامساً: قائمة تفتيش السلامة لمبنى الحماية المدنية وتجهيزات غرفة العمليات</div>
    <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;"><table style="flex:1;min-width:280px;border-collapse:collapse;font-size:9.5px;text-align:center;" border="1" cellpadding="3"><tr style="background:#f0f4f8;font-weight:bold;"><th>المكان</th><th>وصف الخطر</th><th>ملاحظات</th><th>الحالة</th></tr>${rmRows}</table><table style="flex:1;min-width:280px;border-collapse:collapse;font-size:9.5px;text-align:center;" border="1" cellpadding="3"><tr style="background:#f0f4f8;font-weight:bold;"><th>تجهيزات غرفة العمليات</th><th>صالح</th><th>معطل</th><th>ملاحظات</th></tr>${cmRows}</table></div>
    <div style="font-weight:bold;background:#003366;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">سادساً: 1- بيان معدات الإطفاء والإنقاذ الخاصة بعربات الإطفاء</div>
    <table style="width:100%;border-collapse:collapse;font-size:8.5px;text-align:center;margin-bottom:10px;" border="1" cellpadding="2"><tr style="background:#f0f4f8;font-weight:bold;"><th>م</th><th>المعدات</th><th>س1</th><th>س2</th><th>س3</th><th>س4</th><th>س5</th><th>س6</th><th>صالح</th><th>غير صالح</th><th>ملاحظات</th></tr>${eqRows}</table>
    <div style="font-weight:bold;background:#003366;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">سادساً: 2- الحالة الفنية لسيارات الإطفاء (☑ صالح | ◈ صيانة | ☐ لا يوجد)</div>
    <table style="width:100%;border-collapse:collapse;font-size:8.5px;text-align:center;margin-bottom:10px;" border="1" cellpadding="2"><tr style="background:#f0f4f8;font-weight:bold;"><th>م</th><th>البيان</th><th>سيارة 1</th><th>سيارة 2</th><th>سيارة 3</th><th>سيارة 4</th><th>سيارة 5</th><th>سيارة 6</th><th>ملاحظات</th></tr>${tcRows}</table>
    <div style="font-weight:bold;background:#dc3545;color:#fff;padding:4px 10px;font-size:11.5px;margin-bottom:4px;">سابعاً: الملحوظات المعلقة</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;margin-bottom:15px;" border="1" cellpadding="4"><tr style="background:#f8d7da;font-weight:bold;"><th style="width:8%;">م</th><th>الملحوظة</th><th style="width:28%;">الإدارة المعنية / الحالة</th></tr>${pnRows}</table>
    <div style="display:flex;justify-content:flex-end;padding-left:20px;font-weight:bold;font-size:12px;"><div>مسئول سلامة الحماية المدنية: <span style="color:#003366;">${rep.inspector || 'إسلام خالد'}</span></div></div>
  `;
  box.style.display = 'block'; box.scrollIntoView({ behavior: 'smooth' });
}

async function exportCdDailyPNG() {
  const el = document.getElementById('printable-cd-daily-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على زر (عرض البيان الرسمي) أولاً!");
  const dt = document.getElementById('cdPrintDate')?.value || new Date().toISOString().split('T')[0];
  const cvs = await window.rmfWithDesktopWidth(el, () => html2canvas(el, { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' }), '840px');
  await window.rmfExportCanvas(cvs, `Civil_Defense_Daily_${dt}.png`, `بيان الحماية المدنية اليومي (${dt})`);
}

async function exportCdDailyPDF() {
  const el = document.getElementById('printable-cd-daily-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على زر (عرض البيان الرسمي) أولاً!");
  const dt = document.getElementById('cdPrintDate')?.value || new Date().toISOString().split('T')[0];
  await window.rmfExportElementToPdf(el, `Civil_Defense_Daily_${dt}.pdf`, { margin: 0.25, filename: `Civil_Defense_Daily_${dt}.pdf`, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }, `بيان الحماية المدنية اليومي (${dt})`);
}

function loadCdMonthlyDataForm() {
  const mStr = document.getElementById('cdMonthlyMonth')?.value || new Date().toISOString().slice(0, 7);
  const pmStr = getPreviousMonthStr(mStr);
  const savedCur = globalCivilDefenseMonthly[mStr] || {};
  const savedPrev = globalCivilDefenseMonthly[pmStr] || {};
  if (savedCur.preparedBy && document.getElementById('cdMonthlyPreparedBy')) document.getElementById('cdMonthlyPreparedBy').value = savedCur.preparedBy;
  cdCurrentUploadedPhotos = savedCur.photos ? [...savedCur.photos] : [];

  const curKpis = savedCur.kpis || { drills: 3, truckDefects: 2, equipDefects: 0, ppeDefects: 0, commDefects: 0, bldgDefects: 0, pendingTotal: 8, rectifiedTotal: 1, stockStatus: "مطابق" };
  const prevKpis = savedCur.prevKpis || savedPrev.kpis || { drills: 4, truckDefects: 1, equipDefects: 0, ppeDefects: 0, commDefects: 0, bldgDefects: 0, pendingTotal: 7, rectifiedTotal: 3, stockStatus: "مطابق" };
  const trainings = savedCur.trainings || ["سلامة أفراد فريق الإنقاذ والإطفاء.", "اختبار سارينة وحدة الإطفاء.", "قياس زمن ارتداء المهمات."];
  const recordedObs = savedCur.recordedObs || [], rectifiedObs = savedCur.rectifiedObs || [], pendingObs = savedCur.pendingObs || [];

  const container = document.getElementById('cd-monthly-form-container');
  if (!container) return;

  let kpiRows = CD_MONTHLY_KPI_DEFS.map(def => {
    let pVal = prevKpis[def.key] !== undefined ? prevKpis[def.key] : (def.isText ? 'مطابق' : 0);
    let cVal = curKpis[def.key] !== undefined ? curKpis[def.key] : (def.isText ? 'مطابق' : 0);
    if (def.isText) return `<tr><td style="text-align:right;font-weight:bold;">${def.label}</td><td><select id="cd_mkpi_prev_${def.key}" onchange="recalcCdMonthlyDiffs()" style="padding:4px;border-radius:4px;border:1px solid #ccc;"><option value="مطابق" ${pVal === 'مطابق' ? 'selected' : ''}>مطابق</option><option value="غير مطابق" ${pVal === 'غير مطابق' ? 'selected' : ''}>غير مطابق</option></select></td><td><select id="cd_mkpi_cur_${def.key}" onchange="recalcCdMonthlyDiffs()" style="padding:4px;border-radius:4px;border:1px solid #ccc;"><option value="مطابق" ${cVal === 'مطابق' ? 'selected' : ''}>مطابق</option><option value="غير مطابق" ${cVal === 'غير مطابق' ? 'selected' : ''}>غير مطابق</option></select></td><td id="cd_mkpi_diff_${def.key}" style="font-weight:bold;">00</td></tr>`;
    return `<tr><td style="text-align:right;font-weight:bold;">${def.label}</td><td><input type="number" id="cd_mkpi_prev_${def.key}" value="${pVal}" oninput="recalcCdMonthlyDiffs()" style="width:70px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="number" id="cd_mkpi_cur_${def.key}" value="${cVal}" oninput="recalcCdMonthlyDiffs()" style="width:70px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;"></td><td id="cd_mkpi_diff_${def.key}" style="font-weight:bold;">00</td></tr>`;
  }).join('');

  container.innerHTML = `
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;"><div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;">الجدول الإحصائي للمؤشرات الشهرية (الشهر السابق: ${pmStr} | الشهر الحالي: ${mStr})</div><div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="report-table" style="width:100%;min-width:580px;margin:0;font-size:12px;"><thead><tr><th style="width:52%;">البيان</th><th style="width:16%;">الشهر السابق</th><th style="width:16%;">الشهر الحالي</th><th style="width:16%;">الفرق</th></tr></thead><tbody>${kpiRows}</tbody></table></div></div>
    <div style="border:1.5px solid #28a745;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;"><div style="background:#28a745;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;"><span>أولاً: التدريبات المنفذة خلال الشهر</span><button type="button" onclick="addCdMonthlyTrainingRow()" style="background:#fff;color:#28a745;border:none;padding:4px 12px;border-radius:4px;font-weight:bold;cursor:pointer;font-size:12px;"><i class="fa-solid fa-plus"></i> إضافة تدريب</button></div><div style="padding:12px;" id="cd-m-trainings-box">${trainings.map(t => buildCdMonthlyTrainingRow(t)).join('')}</div></div>
    <div style="border:1.5px solid #003366;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;"><div style="background:#003366;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;"><span>ثانياً: الملاحظات التي تم رصدها خلال الشهر</span><button type="button" onclick="addCdMonthlyRecordedRow()" style="background:#fff;color:#003366;border:none;padding:4px 12px;border-radius:4px;font-weight:bold;cursor:pointer;font-size:12px;"><i class="fa-solid fa-plus"></i> إضافة ملاحظة مرصودة</button></div><div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="report-table" style="width:100%;min-width:520px;margin:0;font-size:12px;"><thead><tr><th>الملاحظات التي تم رصدها</th><th style="width:150px;">تاريخ الرصد</th><th style="width:60px;">حذف</th></tr></thead><tbody id="cd-m-recorded-tbody">${recordedObs.map(r => buildCdMonthlyRecordedRow(r)).join('')}</tbody></table></div></div>
    <div style="border:1.5px solid #17a2b8;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;"><div style="background:#17a2b8;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;"><span>ثالثاً: الملاحظات التي تم تلافيها خلال الشهر</span><button type="button" onclick="addCdMonthlyRectifiedRow()" style="background:#fff;color:#17a2b8;border:none;padding:4px 12px;border-radius:4px;font-weight:bold;cursor:pointer;font-size:12px;"><i class="fa-solid fa-plus"></i> إضافة ملاحظة متلافية</button></div><div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="report-table" style="width:100%;min-width:580px;margin:0;font-size:12px;"><thead><tr><th>الملاحظات التي تم تلافيها</th><th style="width:140px;">تاريخ الرصد</th><th style="width:140px;">تاريخ تلافي الملحوظة</th><th style="width:60px;">حذف</th></tr></thead><tbody id="cd-m-rectified-tbody">${rectifiedObs.map(r => buildCdMonthlyRectifiedRow(r)).join('')}</tbody></table></div></div>
    <div style="border:1.5px solid #dc3545;border-radius:8px;overflow:hidden;margin-bottom:18px;background:#fff;"><div style="background:#dc3545;color:#fff;padding:10px 14px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;"><span>رابعاً: الملاحظات المعلقة</span><button type="button" onclick="addCdMonthlyPendingRow()" style="background:#fff;color:#dc3545;border:none;padding:4px 12px;border-radius:4px;font-weight:bold;cursor:pointer;font-size:12px;"><i class="fa-solid fa-plus"></i> إضافة ملاحظة معلقة</button></div><div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table class="report-table" style="width:100%;min-width:540px;margin:0;font-size:12px;"><thead><tr><th>الملاحظات المعلقة</th><th style="width:180px;">الإدارة المعنية</th><th style="width:60px;">حذف</th></tr></thead><tbody id="cd-m-pending-tbody">${pendingObs.map(p => buildCdMonthlyPendingRow(p)).join('')}</tbody></table></div></div>
    <div style="border:1.5px solid #6f42c1;border-radius:8px;overflow:hidden;margin-bottom:15px;background:#fff;"><div style="background:#6f42c1;color:#fff;padding:10px 14px;font-weight:bold;">خامساً: صور الأنشطة والتدريبات والبيانات خلال الشهر (تُعرض داخل التقرير الشهري)</div><div style="padding:14px;"><input type="file" id="cdMonthlyPhotosInput" accept="image/*" multiple onchange="handleCdMonthlyPhotosUpload(this)" style="margin-bottom:12px;"><div id="cd-monthly-photos-preview" style="display:flex;gap:10px;flex-wrap:wrap;"></div></div></div>
  `;
  recalcCdMonthlyDiffs(); renderCdMonthlyPhotosPreview();
}

function buildCdMonthlyTrainingRow(text) { return `<div class="cd-m-tr-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:center;"><input type="text" class="cd-m-tr-inp" value="${(text || '').replace(/"/g, '&quot;')}" placeholder="اكتب بند التدريب..." style="flex:1;padding:7px 10px;border:1px solid #ccc;border-radius:5px;font-weight:bold;"><button type="button" onclick="this.closest('.cd-m-tr-row').remove()" style="background:#dc3545;color:#fff;border:none;padding:7px 10px;border-radius:5px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></div>`; }
function addCdMonthlyTrainingRow() { document.getElementById('cd-m-trainings-box')?.insertAdjacentHTML('beforeend', buildCdMonthlyTrainingRow('')); }
function buildCdMonthlyRecordedRow(r) { return `<tr class="cd-m-rec-row"><td><input type="text" class="cd-m-rec-text" value="${(r.text || '').replace(/"/g, '&quot;')}" placeholder="وصف الملاحظة..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="date" class="cd-m-rec-date" value="${r.date || ''}" style="padding:5px;border:1px solid #ccc;border-radius:4px;"></td><td><button type="button" onclick="this.closest('tr').remove()" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`; }
function addCdMonthlyRecordedRow() { document.getElementById('cd-m-recorded-tbody')?.insertAdjacentHTML('beforeend', buildCdMonthlyRecordedRow({ text: '', date: '' })); }
function buildCdMonthlyRectifiedRow(r) { return `<tr class="cd-m-rect-row"><td><input type="text" class="cd-m-rect-text" value="${(r.text || '').replace(/"/g, '&quot;')}" placeholder="الملاحظة التي تم تلافيها..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="date" class="cd-m-rect-obsdate" value="${r.obsDate || ''}" style="padding:5px;border:1px solid #ccc;border-radius:4px;"></td><td><input type="date" class="cd-m-rect-date" value="${r.rectDate || ''}" style="padding:5px;border:1px solid #ccc;border-radius:4px;"></td><td><button type="button" onclick="this.closest('tr').remove()" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`; }
function addCdMonthlyRectifiedRow() { document.getElementById('cd-m-rectified-tbody')?.insertAdjacentHTML('beforeend', buildCdMonthlyRectifiedRow({ text: '', obsDate: '', rectDate: '' })); }
function buildCdMonthlyPendingRow(p) { const opts = CD_RESPONSIBLE_DEPTS.map(dp => `<option value="${dp}" ${dp === (p.dept || 'الإدارة الهندسية') ? 'selected' : ''}>${dp}</option>`).join(''); return `<tr class="cd-m-pend-row"><td><input type="text" class="cd-m-pend-text" value="${(p.text || '').replace(/"/g, '&quot;')}" placeholder="الملاحظة المعلقة..." style="width:100%;padding:5px;border:1px solid #ccc;border-radius:4px;"></td><td><select class="cd-m-pend-dept" style="padding:5px;border:1px solid #ccc;border-radius:4px;">${opts}</select></td><td><button type="button" onclick="this.closest('tr').remove()" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`; }
function addCdMonthlyPendingRow() { document.getElementById('cd-m-pending-tbody')?.insertAdjacentHTML('beforeend', buildCdMonthlyPendingRow({ text: '', dept: 'الإدارة الهندسية' })); }

function recalcCdMonthlyDiffs() {
  CD_MONTHLY_KPI_DEFS.forEach(def => {
    const diffEl = document.getElementById(`cd_mkpi_diff_${def.key}`);
    if (!diffEl) return;
    if (def.isText) {
      let p = document.getElementById(`cd_mkpi_prev_${def.key}`)?.value || 'مطابق';
      let c = document.getElementById(`cd_mkpi_cur_${def.key}`)?.value || 'مطابق';
      if (p === c) diffEl.innerHTML = `<span style="color:#0d6efd;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">00 <i class="fa-solid fa-arrow-right"></i></span>`;
      else if (c === 'مطابق') diffEl.innerHTML = `<span style="color:#28a745;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">${c} <i class="fa-solid fa-arrow-up"></i></span>`;
      else diffEl.innerHTML = `<span style="color:#dc3545;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">${c} <i class="fa-solid fa-arrow-down"></i></span>`;
    } else {
      let p = Number(document.getElementById(`cd_mkpi_prev_${def.key}`)?.value || 0);
      let c = Number(document.getElementById(`cd_mkpi_cur_${def.key}`)?.value || 0);
      diffEl.innerHTML = formatTrendDifference(c - p, def.higherBetter, "");
    }
  });
}

async function handleCdMonthlyPhotosUpload(input) {
  if (!input.files || input.files.length === 0) return;
  for (let i = 0; i < input.files.length; i++) { let processed = await processFileForUpload(input.files[i]); if (processed && processed.data) cdCurrentUploadedPhotos.push(processed.data); }
  input.value = ''; renderCdMonthlyPhotosPreview();
}

function renderCdMonthlyPhotosPreview() {
  const box = document.getElementById('cd-monthly-photos-preview');
  if (!box) return;
  box.innerHTML = cdCurrentUploadedPhotos.map((src, idx) => `<div style="position:relative;width:130px;height:100px;border:1px solid #ccc;border-radius:6px;overflow:hidden;"><img src="${src}" style="width:100%;height:100%;object-fit:cover;"><button type="button" onclick="cdCurrentUploadedPhotos.splice(${idx},1);renderCdMonthlyPhotosPreview();" style="position:absolute;top:3px;left:3px;background:#dc3545;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:11px;">&times;</button></div>`).join('');
}

function autoPopulateCdMonthlyFromDaily() {
  const mStr = document.getElementById('cdMonthlyMonth')?.value;
  if (!mStr) return alert("اختر الشهر أولاً!");
  const monthReps = (globalCivilDefenseDaily || []).filter(r => r.date && r.date.startsWith(mStr));
  if (monthReps.length === 0) return alert(`لا توجد جولات فحص يومي للحماية المدنية مسجلة خلال شهر (${mStr})!`);

  monthReps.sort((a, b) => a.date.localeCompare(b.date));
  const latestRep = monthReps[monthReps.length - 1];
  let truckDefects = 0, equipDefects = 0, commDefects = 0, bldgDefects = 0, recMap = {}, rectMap = {}, pendMap = {};

  monthReps.forEach(rep => {
    (rep.trucks || []).forEach(t => { if (t.status !== 'صالح' || (t.note && t.note.trim())) { let key = `سيارة (${t.id}): ${t.note || t.status}`; if (!recMap[key]) recMap[key] = { text: key, date: rep.date }; truckDefects++; } });
    (rep.rooms || []).forEach(r => { if (r.hazard !== 'لا يوجد' || (r.note && r.note.trim())) { let key = `${r.room}: ${r.note || r.hazard}`; if (!recMap[key]) recMap[key] = { text: key, date: rep.date }; if (r.status === 'مغلق') rectMap[key] = { text: key, obsDate: rep.date, rectDate: r.rectDate || rep.date }; else pendMap[key] = { text: key, dept: r.responsible || 'الهندسة المدنية' }; bldgDefects++; } });
    (rep.comm || []).forEach(c => { if (c.condition !== 'صالح' || (c.note && c.note.trim())) { let key = `${c.item}: ${c.note || c.condition}`; if (!recMap[key]) recMap[key] = { text: key, date: rep.date }; if (c.status === 'مغلق') rectMap[key] = { text: key, obsDate: rep.date, rectDate: c.rectDate || rep.date }; else pendMap[key] = { text: key, dept: c.responsible || 'تكنولوجيا المعلومات' }; commDefects++; } });
    (rep.equip || []).forEach(eq => { if (eq.condition !== 'صالح' || (eq.note && eq.note.trim())) { let key = `${eq.name}: ${eq.note || eq.condition}`; if (!recMap[key]) recMap[key] = { text: key, date: rep.date }; if (eq.status === 'مغلق') rectMap[key] = { text: key, obsDate: rep.date, rectDate: eq.rectDate || rep.date }; else pendMap[key] = { text: key, dept: eq.responsible || 'الهندسة الميكانيكية' }; equipDefects++; } });
    (rep.pendingNotes || []).forEach(pn => { let key = pn.note; if (!recMap[key]) recMap[key] = { text: key, date: pn.obsDate || rep.date }; if (pn.status === 'مغلق') rectMap[key] = { text: key, obsDate: pn.obsDate || rep.date, rectDate: pn.rectDate || rep.date }; else pendMap[key] = { text: key, dept: pn.dept || 'الإدارة الهندسية' }; });
  });

  const pendList = Object.values(pendMap), rectList = Object.values(rectMap), recList = Object.values(recMap);
  const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setV('cd_mkpi_cur_truckDefects', Object.keys(recMap).filter(k => k.includes('سيارة')).length || truckDefects);
  setV('cd_mkpi_cur_equipDefects', Object.keys(recMap).filter(k => !k.includes('سيارة')).length);
  setV('cd_mkpi_cur_commDefects', commDefects); setV('cd_mkpi_cur_bldgDefects', bldgDefects);
  setV('cd_mkpi_cur_pendingTotal', pendList.length); setV('cd_mkpi_cur_rectifiedTotal', rectList.length);
  setV('cd_mkpi_cur_stockStatus', latestRep.stock?.status || 'مطابق');

  document.getElementById('cd-m-recorded-tbody').innerHTML = recList.map(r => buildCdMonthlyRecordedRow(r)).join('');
  document.getElementById('cd-m-rectified-tbody').innerHTML = rectList.map(r => buildCdMonthlyRectifiedRow(r)).join('');
  document.getElementById('cd-m-pending-tbody').innerHTML = pendList.map(p => buildCdMonthlyPendingRow(p)).join('');
  recalcCdMonthlyDiffs(); alert(`✅ تم تجميع البيانات تلقائياً من (${monthReps.length}) جولة فحص يومي خلال شهر ${mStr}!`);
}

function saveCdMonthlyReport() {
  const mStr = document.getElementById('cdMonthlyMonth')?.value;
  if (!mStr) return alert("يرجى اختيار شهر التقرير أولاً!");
  const prepBy = document.getElementById('cdMonthlyPreparedBy')?.value?.trim() || 'إسلام خالد';

  let kpis = {}, prevKpis = {};
  CD_MONTHLY_KPI_DEFS.forEach(def => {
    let pEl = document.getElementById(`cd_mkpi_prev_${def.key}`), cEl = document.getElementById(`cd_mkpi_cur_${def.key}`);
    prevKpis[def.key] = def.isText ? (pEl?.value || 'مطابق') : Number(pEl?.value || 0);
    kpis[def.key] = def.isText ? (cEl?.value || 'مطابق') : Number(cEl?.value || 0);
  });

  let trainings = []; document.querySelectorAll('#cd-m-trainings-box .cd-m-tr-inp').forEach(inp => { if (inp.value.trim()) trainings.push(inp.value.trim()); });
  let recordedObs = []; document.querySelectorAll('#cd-m-recorded-tbody .cd-m-rec-row').forEach(tr => { let t = tr.querySelector('.cd-m-rec-text')?.value?.trim() || '', d = tr.querySelector('.cd-m-rec-date')?.value || ''; if (t) recordedObs.push({ text: t, date: d }); });
  let rectifiedObs = []; document.querySelectorAll('#cd-m-rectified-tbody .cd-m-rect-row').forEach(tr => { let t = tr.querySelector('.cd-m-rect-text')?.value?.trim() || '', od = tr.querySelector('.cd-m-rect-obsdate')?.value || '', rd = tr.querySelector('.cd-m-rect-date')?.value || ''; if (t) rectifiedObs.push({ text: t, obsDate: od, rectDate: rd }); });
  let pendingObs = []; document.querySelectorAll('#cd-m-pending-tbody .cd-m-pend-row').forEach(tr => { let t = tr.querySelector('.cd-m-pend-text')?.value?.trim() || '', dp = tr.querySelector('.cd-m-pend-dept')?.value || 'الإدارة الهندسية'; if (t) pendingObs.push({ text: t, dept: dp }); });

  const payloadObj = { month: mStr, preparedBy: prepBy, kpis: kpis, prevKpis: prevKpis, trainings: trainings, recordedObs: recordedObs, rectifiedObs: rectifiedObs, pendingObs: pendingObs, photos: cdCurrentUploadedPhotos };
  globalCivilDefenseMonthly[mStr] = payloadObj;
  try { localStorage.setItem('rmf_cd_monthly', JSON.stringify(globalCivilDefenseMonthly)); } catch (e) {}

  const btn = document.getElementById('saveCdMonthlyBtn'), msg = document.getElementById('cdMonthlyMsg');
  const sheetPayload = Object.assign({}, payloadObj, { photos: [] });
  safePost({ action: "saveCivilDefenseMonthly", monthlyData: sheetPayload }, btn, msg, "تم حفظ وإثبات بيانات التقرير الشهري للحماية المدنية بنجاح!", () => {
    alert("✅ تم حفظ بيانات التقرير الشهري بنجاح!");
    if (document.getElementById('cdExtractMonth')) document.getElementById('cdExtractMonth').value = mStr;
    switchCdMonthlySubTab('extract'); generateCdMonthlyReportPreview();
  });
}

function generateCdMonthlyReportPreview() {
  const mStr = document.getElementById('cdExtractMonth')?.value;
  if (!mStr) return alert("اختر الشهر لاستخراج التقرير!");
  const rep = globalCivilDefenseMonthly[mStr];
  if (!rep) return alert(`لا توجد بيانات محفوظة للتقرير الشهري عن (${mStr}). يرجى إدخال البيانات وحفظها في تبويب (1- بيانات التقرير الشهري) أولاً!`);

  const pmStr = getPreviousMonthStr(mStr);
  const cDateObj = new Date(mStr + '-01'), pDateObj = new Date(pmStr + '-01');
  const mAr = cDateObj.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
  const pmAr = pDateObj.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

  const kpiTableRows = CD_MONTHLY_KPI_DEFS.map(def => {
    let pVal = rep.prevKpis && rep.prevKpis[def.key] !== undefined ? rep.prevKpis[def.key] : (def.isText ? 'مطابق' : 0);
    let cVal = rep.kpis && rep.kpis[def.key] !== undefined ? rep.kpis[def.key] : (def.isText ? 'مطابق' : 0);
    let diffHtml = '';
    if (def.isText) {
      if (pVal === cVal) diffHtml = `<span style="color:#0d6efd;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">00 <i class="fa-solid fa-arrow-right"></i></span>`;
      else if (cVal === 'مطابق') diffHtml = `<span style="color:#28a745;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">${cVal} <i class="fa-solid fa-arrow-up"></i></span>`;
      else diffHtml = `<span style="color:#dc3545;font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">${cVal} <i class="fa-solid fa-arrow-down"></i></span>`;
    } else {
      diffHtml = formatTrendDifference(Number(cVal) - Number(pVal), def.higherBetter, "");
      pVal = String(pVal).padStart(2, '0');
      cVal = String(cVal).padStart(2, '0');
    }
    return `<tr><td style="border:1px solid #888;padding:7px 10px;text-align:right;font-weight:bold;">${def.label}</td><td style="border:1px solid #888;padding:7px;text-align:center;">${pVal}</td><td style="border:1px solid #888;padding:7px;text-align:center;font-weight:bold;background:#f8fbfd;">${cVal}</td><td style="border:1px solid #888;padding:7px;text-align:center;font-weight:bold;">${diffHtml}</td></tr>`;
  }).join('');

  const trainingHtml = (rep.trainings || []).length === 0 ? '<p style="color:#777;">لا توجد تدريبات مسجلة.</p>' : `<ul style="margin:6px 0 12px 0;padding-right:22px;line-height:1.8;font-weight:bold;color:#222;">${rep.trainings.map(t => `<li>${t}</li>`).join('')}</ul>`;
  const recHtml = (rep.recordedObs || []).length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:8px;color:#28a745;font-weight:bold;">لا توجد ملاحظات مرصودة خلال الشهر</td></tr>' : rep.recordedObs.map((r, i) => `<tr><td style="border:1px solid #888;padding:6px;text-align:center;font-weight:bold;">${i + 1}</td><td style="border:1px solid #888;padding:6px;text-align:right;">${r.text}</td><td style="border:1px solid #888;padding:6px;text-align:center;" dir="ltr">${r.date || '-'}</td></tr>`).join('');
  const rectHtml = (rep.rectifiedObs || []).length === 0 ? '<tr><td colspan="4" style="text-align:center;padding:8px;color:#777;">لا توجد ملاحظات متلافية مسجلة</td></tr>' : rep.rectifiedObs.map((r, i) => `<tr><td style="border:1px solid #888;padding:6px;text-align:center;font-weight:bold;">${i + 1}</td><td style="border:1px solid #888;padding:6px;text-align:right;">${r.text}</td><td style="border:1px solid #888;padding:6px;text-align:center;" dir="ltr">${r.obsDate || '-'}</td><td style="border:1px solid #888;padding:6px;text-align:center;color:#28a745;font-weight:bold;" dir="ltr">${r.rectDate || '-'}</td></tr>`).join('');
  const pendHtml = (rep.pendingObs || []).length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:8px;color:#28a745;font-weight:bold;">لا توجد ملاحظات معلقة</td></tr>' : rep.pendingObs.map((p, i) => `<tr><td style="border:1px solid #888;padding:6px;text-align:center;font-weight:bold;">${i + 1}</td><td style="border:1px solid #888;padding:6px;text-align:right;">${p.text}</td><td style="border:1px solid #888;padding:6px;text-align:center;font-weight:bold;color:#003366;">${p.dept}</td></tr>`).join('');
  const photosGallery = (rep.photos && rep.photos.length > 0) ? `<div style="margin-top:18px;"><div style="background:#003366;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;margin-bottom:10px;">خامساً: التوثيق المصور للأنشطة والتدريبات</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">${rep.photos.map(src => `<div style="border:1px solid #ddd;border-radius:6px;overflow:hidden;text-align:center;background:#fafafa;"><img src="${src}" style="width:100%;max-height:220px;object-fit:cover;"></div>`).join('')}</div></div>` : '';

  const previewEl = document.getElementById('printable-cd-monthly-report');
  if (!previewEl) return;
  previewEl.innerHTML = `
    <div style="max-width:850px;margin:0 auto;padding:28px 24px;background:#fff;border:1.5px solid #cbd5e1;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.05);font-family:'Cairo',sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #dc3545;padding-bottom:12px;margin-bottom:18px;">
        <div style="text-align:right;"><h2 style="color:#003366;margin:0;font-size:16px;font-weight:900;">مطار مرسى علم الدولي</h2><h3 style="color:#003366;margin:3px 0 0 0;font-size:14px;font-weight:bold;">الإدارة العامة للسلامة والمطابقة</h3><h4 style="color:#dc3545;margin:3px 0 0 0;font-size:13px;font-weight:bold;">قسم سلامة الحماية المدنية</h4></div>
        <div><img src="LOGO-removebg-preview (1).png" style="height:60px;"></div>
      </div>
      <div style="text-align:center;background:#f8f9fa;border:1.5px solid #003366;padding:10px;border-radius:8px;margin-bottom:18px;"><h2 style="margin:0;color:#003366;font-size:17px;font-weight:900;">بيان الحالة الشهرية لقسم سلامة الحماية المدنية بمطار مرسى علم الدولي</h2><div style="margin-top:6px;display:inline-block;background:#dc3545;color:#fff;padding:4px 22px;border-radius:20px;font-weight:bold;font-size:13px;">عن شهر ${mAr}</div></div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px;"><thead><tr style="background:#003366;color:#fff;"><th style="border:1px solid #003366;padding:8px;text-align:right;width:52%;">البيان</th><th style="border:1px solid #003366;padding:8px;width:16%;">${pmAr}</th><th style="border:1px solid #003366;padding:8px;width:16%;">${mAr}</th><th style="border:1px solid #003366;padding:8px;width:16%;">الفرق</th></tr></thead><tbody>${kpiTableRows}</tbody></table>
      <div style="background:#fafafa;border:1px solid #ddd;padding:10px;border-radius:6px;margin-bottom:18px;height:210px;"><canvas id="cdMonthlyCompareChart"></canvas></div>
      <h3 style="text-align:center;color:#003366;text-decoration:underline;margin:18px 0 12px 0;font-size:15px;">التقرير الشهري لقسم سلامة الحماية المدنية بمطار مرسى علم الدولي</h3>
      <div style="background:#003366;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;">أولاً: التدريب</div>${trainingHtml}
      <div style="background:#003366;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;margin-top:12px;margin-bottom:6px;">ثانياً: الملاحظات التي تم رصدها</div><table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:14px;"><thead><tr style="background:#f0f4f8;"><th style="border:1px solid #888;padding:6px;width:8%;">م</th><th style="border:1px solid #888;padding:6px;">الملاحظات التي تم رصدها</th><th style="border:1px solid #888;padding:6px;width:20%;">تاريخ الرصد</th></tr></thead><tbody>${recHtml}</tbody></table>
      <div style="background:#003366;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;margin-top:12px;margin-bottom:6px;">ثالثاً: الملاحظات التي تم تلافيها</div><table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:14px;"><thead><tr style="background:#f0f4f8;"><th style="border:1px solid #888;padding:6px;width:8%;">م</th><th style="border:1px solid #888;padding:6px;">الملاحظات التي تم تلافيها</th><th style="border:1px solid #888;padding:6px;width:18%;">تاريخ الرصد</th><th style="border:1px solid #888;padding:6px;width:18%;">تاريخ تلافي الملحوظة</th></tr></thead><tbody>${rectHtml}</tbody></table>
      <div style="background:#dc3545;color:#fff;padding:6px 12px;border-radius:5px;font-weight:bold;font-size:12px;margin-top:12px;margin-bottom:6px;">رابعاً: الملاحظات المعلقة</div><table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:14px;"><thead><tr style="background:#f8d7da;"><th style="border:1px solid #888;padding:6px;width:8%;">م</th><th style="border:1px solid #888;padding:6px;">الملاحظات المعلقة</th><th style="border:1px solid #888;padding:6px;width:25%;">الإدارة المعنية</th></tr></thead><tbody>${pendHtml}</tbody></table>
      ${photosGallery}
      <div style="margin-top:30px;border-top:1.5px solid #003366;padding-top:12px;display:flex;justify-content:flex-end;padding-left:20px;"><div style="text-align:center;font-weight:bold;font-size:13px;"><div style="color:#555;">إعداد: ${rep.preparedBy || 'إسلام خالد'}</div><div style="color:#003366;margin-top:3px;">مسئول سلامة الحماية المدنية</div></div></div>
    </div>
  `;
  previewEl.style.display = 'block';

  if (cdMonthlyChartInstance) cdMonthlyChartInstance.destroy();
  const chartCtx = document.getElementById('cdMonthlyCompareChart')?.getContext('2d');
  if (chartCtx) {
    const numDefs = CD_MONTHLY_KPI_DEFS.filter(d => !d.isText);
    const shortLabels = ["التدريبات", "أعطال السيارات", "المعدات", "مهمات الوقاية", "غرفة العمليات", "مبنى الوحدة", "المعلقة", "المتلافية"];
    cdMonthlyChartInstance = new Chart(chartCtx, { type: 'bar', data: { labels: shortLabels, datasets: [{ label: pmAr, data: numDefs.map(d => Number(rep.prevKpis?.[d.key] || 0)), backgroundColor: '#6c757d', borderRadius: 4 }, { label: mAr, data: numDefs.map(d => Number(rep.kpis?.[d.key] || 0)), backgroundColor: '#dc3545', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { family: 'Cairo,sans-serif', weight: 'bold' } } } } } });
  }
  previewEl.scrollIntoView({ behavior: 'smooth' });
}

async function exportCdMonthlyImage() {
  const el = document.getElementById('printable-cd-monthly-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على (عرض التقرير الشهري) أولاً!");
  const mStr = document.getElementById('cdExtractMonth')?.value || 'Report';
  const cvs = await window.rmfWithDesktopWidth(el, () => html2canvas(el, { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' }), '840px');
  await window.rmfExportCanvas(cvs, `Civil_Defense_Monthly_Report_${mStr}.png`, `التقرير الشهري للحماية المدنية (${mStr})`);
}

async function exportCdMonthlyPDF() {
  const el = document.getElementById('printable-cd-monthly-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على (عرض التقرير الشهري) أولاً!");
  const mStr = document.getElementById('cdExtractMonth')?.value || 'Report';
  await window.rmfExportElementToPdf(el, `Civil_Defense_Monthly_Report_${mStr}.pdf`, { margin: 0.25, filename: `Civil_Defense_Monthly_Report_${mStr}.pdf`, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }, `التقرير الشهري للحماية المدنية (${mStr})`);
}

async function sendCdMonthlyEmail() {
  const mStr = document.getElementById('cdExtractMonth')?.value;
  if (!mStr) return alert("اختر الشهر أولاً!");
  const el = document.getElementById('printable-cd-monthly-report');
  if (!el || el.style.display === 'none') return alert("يرجى الضغط على (عرض التقرير الشهري) أولاً!");
  const rep = globalCivilDefenseMonthly[mStr];
  const prepBy = rep?.preparedBy || 'إسلام خالد';
  try {
    const cvs = await html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = cvs.toDataURL('image/jpeg', 0.85);
    const hB = `<div dir="rtl" style="font-family:Arial,sans-serif;color:#333;line-height:1.6;"><h2 style="color:#dc3545;border-bottom:2px solid #dc3545;padding-bottom:8px;">التقرير الشهري لقسم سلامة الحماية المدنية - ${mStr}</h2><p><b>السادة / الإدارة العامة للسلامة والمطابقة المحترمين،</b><br>تحية طيبة وبعد،،<br><br>نرفق لسيادتكم التقرير الشهري لحالة السلامة والمعدات بقسم الحماية المدنية بمطار مرسى علم الدولي عن شهر (${mStr}).</p><div style="text-align:center;margin:20px 0;"><img src="cid:monthlyReportImage" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:8px;"></div><p><b>إعداد:</b> ${prepBy} - مسئول سلامة الحماية المدنية</p></div>`;
    await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: "sendReportEmail", performedBy: getCurrentActorName(), subject: `التقرير الشهري لقسم سلامة الحماية المدنية - ${mStr}`, htmlBody: hB, imageData: imgData, imageName: `Civil_Defense_Report_${mStr}.jpg` }) });
    alert("✅ تم إرسال التقرير الشهري للحماية المدنية بالإيميل بنجاح!");
  } catch (err) { alert("❌ تعذر إرسال الإيميل."); }
}


// =============================================================================
// 15. مؤشر حالة الاتصال الفعلي بالإنترنت على الداشبورد الرئيسية (Real Network Probe)
// =============================================================================
window.rmfIsOnline = navigator.onLine !== false;

function renderMainConnectionBadge(isOnline) {
  window.rmfIsOnline = !!isOnline;
  const dot = document.getElementById('main-status-dot');
  const txt = document.getElementById('main-status-text');
  const box = document.getElementById('main-connection-status');
  if (!dot || !txt) return;
  if (isOnline) {
    dot.style.backgroundColor = '#28A745';
    txt.style.color = '#28A745';
    txt.innerText = 'متصل (Online)';
    if (box) box.style.borderColor = '#b7eb8f';
  } else {
    dot.style.backgroundColor = '#DC3545';
    txt.style.color = '#DC3545';
    txt.innerText = 'غير متصل (Offline)';
    if (box) box.style.borderColor = '#ffa39e';
  }
}

let rmfPingInFlight = false;
async function checkRealInternetConnection() {
  if (navigator.onLine === false) {
    renderMainConnectionBadge(false);
    return false;
  }
  if (rmfPingInFlight) return window.rmfIsOnline;
  rmfPingInFlight = true;
  try {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 2500) : null;
    await fetch('https://www.google.com/favicon.ico?_t=' + Date.now(), {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined
    });
    if (timer) clearTimeout(timer);
    renderMainConnectionBadge(true);
    return true;
  } catch (err) {
    renderMainConnectionBadge(false);
    return false;
  } finally {
    rmfPingInFlight = false;
  }
}

window.addEventListener('online', () => checkRealInternetConnection());
window.addEventListener('offline', () => renderMainConnectionBadge(false));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkRealInternetConnection();
});
document.addEventListener('DOMContentLoaded', () => {
  renderMainConnectionBadge(navigator.onLine !== false);
  checkRealInternetConnection();
  setInterval(checkRealInternetConnection, 3000);
});
