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
  cdDaily: [],
  cdMonthly: {},
  oshDaily: [],
  oshMonthly: {},
  envDaily: [],
  envMonthly: {}
};

let grChartInstances = [];

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

function loadLocalCachesForGr() {
  try {
    grAppData.incidents = JSON.parse(localStorage.getItem('rmf_incidents') || '[]');
    grAppData.cdDaily = JSON.parse(localStorage.getItem('rmf_cd_daily') || '[]');
    grAppData.cdMonthly = JSON.parse(localStorage.getItem('rmf_cd_monthly') || '{}');
    grAppData.oshDaily = JSON.parse(localStorage.getItem('rmf_osh_daily') || '[]');
    grAppData.oshMonthly = JSON.parse(localStorage.getItem('rmf_osh_monthly') || '{}');
    grAppData.envDaily = JSON.parse(localStorage.getItem('rmf_env_daily') || '[]');
    grAppData.envMonthly = JSON.parse(localStorage.getItem('rmf_env_monthly') || '{}');
  } catch (e) {}
}

function fetchLiveAllDataForGr() {
  const cb = 'jsonpGr_' + Math.round(100000 * Math.random());
  window[cb] = function (d) {
    try {
      if (d && d.status === 'success') {
        if (d.surveys) grAppData.surveys = d.surveys;
        if (d.incidents) grAppData.incidents = d.incidents;
        if (d.fod) grAppData.fod = d.fod;
        if (d.daily) {
          let rMap = {};
          d.daily.forEach(row => {
            let repId = row.Report_ID;
            if (!rMap[repId]) {
              rMap[repId] = {
                id: repId,
                date: row.Date ? new Date(row.Date).toISOString().split('T')[0] : '',
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
        }
        if (d.cdDaily) grAppData.cdDaily = d.cdDaily;
        if (d.cdMonthly) grAppData.cdMonthly = d.cdMonthly;
        if (d.oshDaily) grAppData.oshDaily = d.oshDaily;
        if (d.oshMonthly) grAppData.oshMonthly = d.oshMonthly;
        if (d.envDaily) grAppData.envDaily = d.envDaily;
        if (d.envMonthly) grAppData.envMonthly = d.envMonthly;
      }
    } catch (err) {} finally { delete window[cb]; }
  };
  const s = document.createElement('script');
  s.src = API_URL + '?action=getAppData&_t=' + Date.now() + '&callback=' + cb;
  document.body.appendChild(s);
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

async function generateConsolidatedMonthlyReport() {
  const mStr = document.getElementById('grMonth')?.value;
  if (!mStr) return alert("اختر شهر التقرير أولاً!");

  const btn = document.getElementById('genGrBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تجميع بيانات الإدارات الأربع...'; }

  const pmStr = getPrevMonthStr(mStr);
  const yCur = mStr.split('-')[0], mCurInt = parseInt(mStr.split('-')[1]);
  const yPrev = pmStr.split('-')[0], mPrevInt = parseInt(pmStr.split('-')[1]);

  const spiCur = await fetchSpiForYearGr(yCur);
  const spiPrev = (yPrev === yCur) ? spiCur : await fetchSpiForYearGr(yPrev);

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-layer-group"></i> تجميع وإصدار التقرير الشهري المجمع'; }

  const mgrName = document.getElementById('grManagerName')?.value?.trim() || 'محمد محمد مرسي';
  const mAr = new Date(mStr + '-01').toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
  const pmAr = new Date(pmStr + '-01').toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
  const mOnlyAr = new Date(mStr + '-01').toLocaleString('ar-EG', { month: 'long' });
  const mEngShort = new Date(mStr + '-01').toLocaleString('en-US', { month: 'long' });

  // 1. بيانات قسم سلامة الطيران
  const movCur = Number(spiCur?.movements?.[mCurInt] || 0);
  const movPrev = Number(spiPrev?.movements?.[mPrevInt] || 0);

  const incCurList = (grAppData.incidents || []).filter(i => String(i.Date || '').startsWith(mStr));
  const incPrevList = (grAppData.incidents || []).filter(i => String(i.Date || '').startsWith(pmStr));
  const accCur = incCurList.filter(i => i.Risk_Severity === 'Catastrophic').length;
  const accPrev = incPrevList.filter(i => i.Risk_Severity === 'Catastrophic').length;
  const occCur = incCurList.length - accCur;
  const occPrev = incPrevList.length - accPrev;

  const getAirsideFindings = (monthKey) => {
    let map = {};
    (grAppData.daily || []).forEach(r => {
      if ((r.date || '').startsWith(monthKey)) {
        (r.findings || []).forEach(f => {
          let k = `${f.category}|${f.item}|${f.location}`;
          let isCl = f.status === 'مغلق';
          if (!map[k]) map[k] = { ...f, closed: isCl };
          else if (isCl) map[k].closed = true;
        });
      }
    });
    let list = Object.values(map);
    return {
      total: list.length,
      closed: list.filter(x => x.closed).length,
      open: list.filter(x => !x.closed).length,
      list: list
    };
  };

  const afCur = getAirsideFindings(mStr);
  const afPrev = getAirsideFindings(pmStr);

  const survCur = (grAppData.surveys || []).filter(s => String(s.Date || '').startsWith(mStr));
  const survPrev = (grAppData.surveys || []).filter(s => String(s.Date || '').startsWith(pmStr));

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

  // بيانات FOD للشهر الحالي
  const fodCurRows = (grAppData.fod || []).filter(f => String(f.Date || f.date || '').startsWith(mStr));
  let fodTotPlastic = 0, fodTotMetal = 0;
  const fodTableRowsHtml = FOD_LOCATIONS_GR.map(loc => {
    let rec = fodCurRows.find(f => (f.Location || f.location) === loc.loc);
    let p = rec ? parseFloat(rec.Plastic || rec.plastic || 0) : 0;
    let m = rec ? parseFloat(rec.Metal || rec.metal || 0) : 0;
    fodTotPlastic += p; fodTotMetal += m;
    let dStr = rec ? String(rec.Date || rec.date || '').split('T')[0] : '---';
    return `<tr><td dir="ltr">${dStr}</td><td style="text-align:left;font-weight:bold;">${loc.loc}</td><td>${loc.area}</td><td>${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td><td>${m > 0 ? m.toFixed(3) + ' kg' : '---'}</td><td>${(p + m) > 0 ? (p + m).toFixed(3) + ' kg' : '---'}</td></tr>`;
  }).join('');
  const fodCur = fodTotPlastic + fodTotMetal;

  let fodPrev = 0;
  (grAppData.fod || []).forEach(f => {
    if (String(f.Date || f.date || '').startsWith(pmStr)) {
      fodPrev += (parseFloat(f.Plastic || f.plastic || 0) + parseFloat(f.Metal || f.metal || 0));
    }
  });

  const avMeetings = Number(document.getElementById('grAvMeetings')?.value || 2);
  const avAudits = Number(document.getElementById('grAvAudits')?.value || 0);
  const avCourses = Number(document.getElementById('grAvCourses')?.value || 2);

  // 2. بيانات السلامة والصحة المهنية (OSH)
  const oshCur = grAppData.oshMonthly[mStr] || { kpis: { totalFindings: 0, rectifiedFindings: 0, pendingFindings: 0, incidents: 0, workInjuries: 0, meetings: 0 }, prevKpis: {}, pendingList: [], rectifiedList: [], accidentsText: 'لا يوجد', occurrencesText: 'لا يوجد', meetingsText: '-', periodicText: '-', injuriesText: 'لا يوجد' };
  const oshPrev = grAppData.oshMonthly[pmStr] || { kpis: oshCur.prevKpis || {} };

  // 3. بيانات الحماية المدنية (Civil Defense)
  const cdCur = grAppData.cdMonthly[mStr] || { kpis: { drills: 0, truckDefects: 0, equipDefects: 0, ppeDefects: 0, commDefects: 0, bldgDefects: 0, pendingTotal: 0, rectifiedTotal: 0, stockStatus: 'مطابق' }, prevKpis: {}, trainings: [], recordedObs: [], rectifiedObs: [], pendingObs: [] };
  const cdPrev = grAppData.cdMonthly[pmStr] || { kpis: cdCur.prevKpis || {} };

  // 4. بيانات البيئة والحياة البرية (ENV)
  const envCur = grAppData.envMonthly[mStr] || { kpis: { pendingEnv: 0, rectifiedEnv: 0, totalEnv: 0, meetingsEnv: 0 }, prevKpis: {}, observations: [], accidentsText: 'لا يوجد', fenceText: 'تم المرور الدوري', externalText: 'تم المرور الشهري', pestEval: '78.0%' };
  const envPrev = grAppData.envMonthly[pmStr] || { kpis: envCur.prevKpis || {} };

  // التوصيات الختامية
  let recs = [];
  document.querySelectorAll('#gr-recommendations-box .gr-rec-inp').forEach(inp => { if (inp.value.trim()) recs.push(inp.value.trim()); });

  const fmtDiff = (c, p) => String(Math.abs(Number(c) - Number(p))).padStart(2, '0');

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

  // الصفحة 2: 1. قسم سلامة الطيران (المؤشرات + المخاطر + الشارتات)
  const pageAv1 = `
    <div class="gr-page">
      ${pageHeaderBanner(2)}
      <p style="font-weight:bold;color:#003366;margin-bottom:10px;">أتشرف بالعرض على سيادتكم أهم مؤشرات الأداء لكل قسم بالإدارة كالتالي:</p>
      <div class="gr-hdr-banner"><span>1. قسم سلامة الطيران</span><span>Airport Safety Department</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:52%;">الشهر (السابق / الحالي)</th><th>${pmAr}</th><th>${mAr}</th><th>الفرق</th></tr></thead>
        <tbody>
          <tr><td style="text-align:right;font-weight:bold;">عدد التحركات الجوية</td><td>${movPrev}</td><td><b>${movCur}</b></td><td>${Math.abs(movCur - movPrev)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">عدد الحوادث</td><td>${String(accPrev).padStart(2,'0')}</td><td><b>${String(accCur).padStart(2,'0')}</b></td><td>${fmtDiff(accCur, accPrev)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">عدد الوقائع</td><td>${String(occPrev).padStart(2,'0')}</td><td><b>${String(occCur).padStart(2,'0')}</b></td><td>${fmtDiff(occCur, occPrev)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">إجمالي حالات عدم المطابقة</td><td>${String(afPrev.total).padStart(2,'0')}</td><td><b>${String(afCur.total).padStart(2,'0')}</b></td><td>${fmtDiff(afCur.total, afPrev.total)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">حالات عدم المطابقة المعلقة</td><td>${String(afPrev.open).padStart(2,'0')}</td><td><b>${String(afCur.open).padStart(2,'0')}</b></td><td>${fmtDiff(afCur.open, afPrev.open)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">حالات عدم المطابقة التي تم تلافيها</td><td>${String(afPrev.closed).padStart(2,'0')}</td><td><b>${String(afCur.closed).padStart(2,'0')}</b></td><td>${fmtDiff(afCur.closed, afPrev.closed)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">استبيان الطيارين</td><td>${survPrev.length}</td><td><b>${survCur.length}</b></td><td>${fmtDiff(survCur.length, survPrev.length)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">الاجتماعات</td><td>01</td><td><b>${String(avMeetings).padStart(2,'0')}</b></td><td>${fmtDiff(avMeetings, 1)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">تفتيشات السلامة</td><td>00</td><td><b>${String(avAudits).padStart(2,'0')}</b></td><td>${fmtDiff(avAudits, 0)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">دورات توعية</td><td>01</td><td><b>${String(avCourses).padStart(2,'0')}</b></td><td>${fmtDiff(avCourses, 1)}</td></tr>
          <tr><td style="text-align:right;font-weight:bold;">إجمالي كمية F.O.D التي تم التقاطها وتجميعها خلال الشهر</td><td>${fodPrev.toFixed(3)} KG</td><td><b>${fodCur.toFixed(3)} KG</b></td><td>${Math.abs(fodCur - fodPrev).toFixed(3)} KG</td></tr>
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

  // الصفحة 3: 1. قسم سلامة الطيران (الوقائع + مصفوفة استبيان الطيارين + FOD)
  const incRowsHtml = incCurList.length === 0
    ? '<tr><td colspan="4" style="color:#28a745;font-weight:bold;">لا توجد وقائع مسجلة خلال الشهر</td></tr>'
    : incCurList.map((i, idx) => `<tr><td>0${idx+1}</td><td>${i.Characterization || '-'}</td><td style="text-align:left;direction:ltr;font-size:9.5px;"><b>Description:</b> ${i.Description || '-'}<br><b>Action Taken:</b> ${i.Action_Taken || '-'}</td><td>${String(i.Date || '').split('T')[0]}<br><b>${i.CAR || '-'}</b></td></tr>`).join('');

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

  const pageAv2 = `
    <div class="gr-page">
      ${pageHeaderBanner(3)}
      <div style="font-weight:bold;color:#003366;margin-bottom:6px;">• الوقائع: تم حصر عدد (${String(occCur).padStart(2,'0')}) واقعة وتصنيفها كالتالي:</div>
      <table class="gr-tbl">
        <thead><tr><th style="width:7%;">م</th><th style="width:20%;">تصنيف الواقعة</th><th style="width:53%;">الوصف والإجراء المتخذ</th><th style="width:20%;">التاريخ / الشركة</th></tr></thead>
        <tbody>${incRowsHtml}</tbody>
      </table>

      <div style="font-weight:bold;color:#003366;margin:10px 0 6px 0;">• حصر استطلاع رأي الطيارين: تم عمل عدد (${survCur.length}) استعلام طيارين (Safety Captain Survey Report For ${mEngShort})</div>
      <table class="gr-tbl" style="direction:ltr;font-size:8.5px;margin-bottom:10px;">
        <thead><tr><th style="text-align:left;">Criteria</th><th>Excellent</th><th>Good</th><th>Poor</th><th>N/A</th><th>Blank</th></tr></thead>
        <tbody>${survMatrixRowsHtml}</tbody>
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

  // الصفحة 4: 2. السلامة والصحة المهنية (OSH)
  const oshKpiRows = [
    { l: "حالات عدم المطابقة", p: oshPrev.kpis?.totalFindings || 0, c: oshCur.kpis?.totalFindings || 0 },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: oshPrev.kpis?.rectifiedFindings || 0, c: oshCur.kpis?.rectifiedFindings || 0 },
    { l: "حالات عدم المطابقة المعلقة", p: oshPrev.kpis?.pendingFindings || 0, c: oshCur.kpis?.pendingFindings || 0 },
    { l: "الوقائع", p: oshPrev.kpis?.incidents || 0, c: oshCur.kpis?.incidents || 0 },
    { l: "إصابات العمل", p: oshPrev.kpis?.workInjuries || 0, c: oshCur.kpis?.workInjuries || 0 },
    { l: "الاجتماعات", p: oshPrev.kpis?.meetings || 0, c: oshCur.kpis?.meetings || 0 }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;">${r.l}</td><td>${r.p}</td><td><b>${r.c}</b></td><td>${fmtDiff(r.c, r.p)}</td></tr>`).join('');

  const pageOsh = `
    <div class="gr-page">
      ${pageHeaderBanner(4)}
      <div class="gr-hdr-banner" style="background:#fd7e14;"><span>2. قسم السلامة والصحة المهنية</span><span>Occupational Safety & Health</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:52%;">الشهر (السابق / الحالي)</th><th>${pmAr}</th><th>${mAr}</th><th>الفرق</th></tr></thead>
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

  // الصفحة 5: 3. قسم سلامة الحماية المدنية (Civil Defense)
  const cdKpiRows = [
    { l: "التدريبات", p: cdPrev.kpis?.drills || 0, c: cdCur.kpis?.drills || 0 },
    { l: "الأعطال والملاحظات التي تم تسجيلها بسيارات الإطفاء", p: cdPrev.kpis?.truckDefects || 0, c: cdCur.kpis?.truckDefects || 0 },
    { l: "حالات عدم المطابقة لمعدات الإنقاذ والإطفاء المحملة داخل السيارات", p: cdPrev.kpis?.equipDefects || 0, c: cdCur.kpis?.equipDefects || 0 },
    { l: "حالات عدم المطابقة لمهمات الوقاية الشخصية", p: cdPrev.kpis?.ppeDefects || 0, c: cdCur.kpis?.ppeDefects || 0 },
    { l: "حالات عدم المطابقة لتجهيزات غرفة عمليات الاتصالات", p: cdPrev.kpis?.commDefects || 0, c: cdCur.kpis?.commDefects || 0 },
    { l: "حالات عدم المطابقة لتجهيزات مبنى وحدة الإطفاء والإنقاذ", p: cdPrev.kpis?.bldgDefects || 0, c: cdCur.kpis?.bldgDefects || 0 },
    { l: "إجمالي حالات عدم المطابقة المعلقة", p: cdPrev.kpis?.pendingTotal || 0, c: cdCur.kpis?.pendingTotal || 0 },
    { l: "حالات عدم المطابقة التي تم تلافيها", p: cdPrev.kpis?.rectifiedTotal || 0, c: cdCur.kpis?.rectifiedTotal || 0 },
    { l: "حالة المطابقة للمخزون الاستراتيجي", p: cdPrev.kpis?.stockStatus || 'مطابق', c: cdCur.kpis?.stockStatus || 'مطابق', isText: true }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;">${r.l}</td><td>${r.isText ? r.p : String(r.p).padStart(2,'0')}</td><td><b>${r.isText ? r.c : String(r.c).padStart(2,'0')}</b></td><td>${r.isText ? (r.p === r.c ? '00' : r.c) : fmtDiff(r.c, r.p)}</td></tr>`).join('');

  const pageCd = `
    <div class="gr-page">
      ${pageHeaderBanner(5)}
      <div class="gr-hdr-banner" style="background:#dc3545;"><span>3. قسم سلامة الحماية المدنية</span><span>Civil Defense & ARFF</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:52%;">الشهر (السابق / الحالي)</th><th>${pmAr}</th><th>${mAr}</th><th>الفرق</th></tr></thead>
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

  // الصفحة 6: 4. قسم البيئة ومكافحة مخاطر الحياة البرية
  const envKpiRows = [
    { l: "الحالات والمخاطر البيئية المعلقة", p: envPrev.kpis?.pendingEnv || 0, c: envCur.kpis?.pendingEnv || 0 },
    { l: "الحالات والمخاطر البيئية التي تم تلافيها", p: envPrev.kpis?.rectifiedEnv || 0, c: envCur.kpis?.rectifiedEnv || 0 },
    { l: "إجمالي الحالات والمخاطر البيئية", p: envPrev.kpis?.totalEnv || 0, c: envCur.kpis?.totalEnv || 0 },
    { l: "الاجتماعات", p: envPrev.kpis?.meetingsEnv || 0, c: envCur.kpis?.meetingsEnv || 0 }
  ].map(r => `<tr><td style="text-align:right;font-weight:bold;">${r.l}</td><td>${String(r.p).padStart(2,'0')}</td><td><b>${String(r.c).padStart(2,'0')}</b></td><td>${fmtDiff(r.c, r.p)}</td></tr>`).join('');

  const pageEnv = `
    <div class="gr-page">
      ${pageHeaderBanner(6)}
      <div class="gr-hdr-banner" style="background:#28a745;"><span>4. قسم البيئة ومكافحة مخاطر الحياة البرية</span><span>Environment & Wildlife</span></div>
      <table class="gr-tbl">
        <thead><tr><th style="text-align:right;width:52%;">الشهر (السابق / الحالي)</th><th>${pmAr}</th><th>${mAr}</th><th>الفرق</th></tr></thead>
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

  // تدمير الرسوم البيانية القديمة ورسم الجديدة
  grChartInstances.forEach(c => { try { c.destroy(); } catch (e) {} });
  grChartInstances = [];

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
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'المخاطر طبقاً للإدارة / الجهة (سلامة الطيران)' } } }
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
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'إجمالي المخاطر المرصودة (سلامة الطيران)' } } }
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
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'حالات عدم المطابقة ما تم وما هو معلق طبقاً للإدارة / الجهة (OSH)' } } }
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
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'مقارنة مؤشرات الحماية المدنية بين الشهر السابق والحالي' } } }
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
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'الإدارة / الجهة المعنية بحالات عدم المطابقة البيئية' } } }
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
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'حصر وتصنيف حالات عدم المطابقة البيئية' } } }
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
