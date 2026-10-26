const API_URL = "https://script.google.com/macros/s/AKfycbzPecq0b8ryKc8N2CqC8N46LBgG-lWzczxHiPOKAOtNgpwAjz8Ro284t2ice8vt1HQY/exec";

const criteriaList = [
    "Communication Tower", "Communication Ground", "VOR-DME", "RNP APR 33_15", "Aeronautical Beacon", 
    "Approach Lighting System", "PAPI System", "Wind Cone", "Apron Marking", "Apron Lighting", 
    "Apron Signs", "APRON Stands Size", "G.H Performance", "Fuelling Performance", "Marshall Services", 
    "RFF Team performance", "Runway Marking", "Runway Lighting", "Runway Signs", "RWY Brakes Action", 
    "RWY Evaluating Pavement", "Taxi Way Marking", "Taxi Way Lighting", "Taxi Way Signs", 
    "TWY Brakes Action", "TWY Evaluating Pavement", "Stop Bars", "Weather", "Wildlife", "Bird Strike", "FOD"
];

const dailyChecklistData = {
    col1: { 
        title: "المناطق المرصوفة", 
        items: ["شروخ", "حفر(علي الأقل 5 بوصة عرض)", "هبوط", "تآكل", "مطاط", "نباتات", "أجسام غريبة FOD", "أخري"], 
        title2: "المناطق الغير مرصوفة", 
        items2: ["غير مستوية", "نباتات", "عوائق", "أجسام غريبة FOD", "أخري"], 
        title3: "المساعدات الملاحية", 
        items3: ["البيكون الدوار بالبرج لا يعمل", "كم الريح غير مطابق", "PAPI غير مطابق", "السارينة لاتعمل", "لمبات العوائق غير مضاءة", "أخري"] 
    },
    col2: { 
        title: "التخطيط (Marking)", 
        items: ["غير مطابق / واضح بالمدرج RWY", "محور المدرج مغطي بالمطاط", "غيرمطابق/ واضح في Holding Position", "غير مطابق / واضح في الـ TXY", "غير مطابق / واضح في الترمك"], 
        title2: "اللافتات الإرشادية", 
        items2: ["غير مطابقة.", "غير مضاءة", "محجوبة بواسطة النباتات.", "قاعدتها الخرسانية أعلي من مستوي الأرض", "القواعد الغير قابلة للكسر.", "أخرى"], 
        title3: "الإنارة", 
        items3: ["لمبات مكسورة/ تالفة علي المدرج RWY", "لمبات مكسورة/ تالفة علي الممرات TXY", "لمبات مكسورة/ تالفة على الترمك", "إنارة وحدات Floodlight غير مطابقة", "اللمبات الغاطسة غير مضاءة", "أخرى"] 
    },
    col3: { 
        title: "عملية تموين الوقود", 
        items: ["وقوف غير سليم علي الطائرة", "الهروب السريع غير متوفر", "النظام الإطفائي غير مكتمل", "الـDEAD MAN غير مستعمل", "سلك التأريض غير موصل", "زر الطوارئ لايعمل", "عدد المشغلين غير كاف", "أخرى"], 
        title2: "أخطار الحياة البرية", 
        items2: ["مشاهدة حيوانات برية /طيور مقيمة / نافقة", "وجود مصادر جذب للحياة البرية", "أخرى"] 
    },
    col4: { 
        title: "التحركات ووقوف الطائرات", 
        items: ["سائق المعدة لا يحمل تصريح قيادة على المهبط", "رخصة المعدة غير متوفرة.", "عدم الإلتزام بالسرعات المقررة", "عدم إستخدام طريق الخدمة .", "عدم تجميع الFOD", "أخرى"], 
        title2: "الإنقاذ والإطفاء", 
        items2: ["عدم صلاحية الإتصالات", "عدم الإستجابة السريعة للأفراد.", "أخرى"] 
    }
};

const responsibleDepts = ["العمليات", "الهندسة المدنية", "الهندسة الكهربية", "الإنقاذ والإطفاء", "شركات الطيران / الوكالات", "الإرشاد", "أخرى"];

const fodLocations = [
    { loc: "Aircraft Stands Area", area: "53.125 M²" },
    { loc: "GSE Area", area: "4152 M²" },
    { loc: "Arrival & Departures Gates", area: "2420 M²" },
    { loc: "Around Aprons Gas station", area: "2539 M²" }
];

// المتغيرات العامة
let globalFleetData = []; 
let globalSurveys = []; 
let globalUsers = []; 
let globalDailyInspections = []; 
let globalIncidents = [];
let globalDirectory = [];
let globalFod = [];
let globalMovements = [];

let currentSurveyIndex = -1; 
let currentDailyIndex = -1; 
let currentIncidentIndex = -1;
let isDailyEditMode = false; 
let currentDailyEditId = null;
let isIncidentEditMode = false; 
let currentIncidentEditId = null;

let chartInstances = {}; 
let chartInstancesDaily = {};
let monthlyChart1 = null;
let monthlyChart2 = null;
let mrSurveyAirChartInstance = null;
let mrSurveyEvalChartInstance = null;

// تشغيل النظام وإنهاء شاشة البداية
function finishLoading() {
    try {
        const splash = document.getElementById('splash-screen');
        const loginScreen = document.getElementById('login-screen');
        const passInp = document.getElementById('loginPass');
        
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                    if (passInp) passInp.focus();
                }
            }, 400);
        }
    } catch (e) {
        console.error(e);
    }
}

// تسجيل الدخول
function login() {
    const userField = document.getElementById('loginUser').value.trim();
    const passField = document.getElementById('loginPass').value.trim();
    const errorMsg = document.getElementById('loginError');

    let validUser = globalUsers.find(u => u.Username === userField && String(u.Password) === passField);
    
    if (validUser || (globalUsers.length === 0 && passField === "1234") || (userField.toLowerCase() === "admin" && passField === "1234")) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-header').style.display = 'flex';
        openSection('main-dashboard');
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('loginPass').value = "";
    }
}

function openSection(sectionId) {
    document.querySelectorAll('.content-area').forEach(el => el.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function openAdminSection(sectionId) {
    let pass = prompt("🔒 هذه الصفحة مخصصة لمدير النظام فقط.\nبرجاء إدخال كلمة المرور:");
    if (pass === "1234") { 
        openSection(sectionId);
    } else if (pass !== null) {
        alert("❌ كلمة المرور غير صحيحة!");
    }
}

function openGenericDoc(title) {
    document.getElementById('generic-doc-title').innerText = title;
    openSection('generic-doc-section');
}

// جلب البيانات من السيرفر بالكامل
function loadAppDataInit() {
    const callbackName = 'jsonpInit_' + Math.round(100000 * Math.random());
    window[callbackName] = function (data) {
        try {
            if (data && data.status === "success") {
                globalFleetData = data.fleet ? data.fleet.reverse() : [];
                globalSurveys = data.surveys ? data.surveys.reverse() : [];
                globalUsers = data.users || [];
                globalIncidents = data.incidents ? data.incidents.reverse() : [];
                globalDirectory = data.directory || [];
                globalFod = data.fod || [];
                globalMovements = data.movements || [];

                populateUsersDropdown(globalUsers);
                renderDirectory(globalDirectory);

                // معالجة الفحص اليومي
                if (data.daily && data.daily.length > 0) {
                    let reportsMap = {};
                    data.daily.forEach(row => {
                        let repId = row.Report_ID;
                        let timeStr = row.Time;
                        if (timeStr && typeof timeStr === 'string' && timeStr.includes('T')) {
                            let d = new Date(timeStr);
                            if (!isNaN(d)) timeStr = d.toISOString().substring(11, 16);
                        }
                        if (!reportsMap[repId]) {
                            reportsMap[repId] = {
                                id: repId,
                                date: row.Date ? new Date(row.Date).toISOString().split('T')[0] : '',
                                time: timeStr,
                                shift: row.Shift,
                                inspector: row.Inspector,
                                findings: []
                            };
                        }
                        if (row.Category && row.Category !== "لا توجد ملاحظات") {
                            reportsMap[repId].findings.push({
                                category: row.Category,
                                item: row.Finding_Item,
                                location: row.Location,
                                responsible: row.Responsible,
                                note: row.Corrective_Action || "",
                                status: row.Status || "مفتوح"
                            });
                        }
                    });
                    globalDailyInspections = Object.values(reportsMap).sort((a, b) => b.id - a.id);
                }

                renderSavedDaily();
                renderSavedIncidents();
                updateDailyNavCounter();
                updateIncidentNavCounter();
                
                finishLoading(); 
            }
        } catch (e) { 
            console.error(e); 
            finishLoading();
        }
        delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = API_URL + "?action=getAppData&callback=" + callbackName;
    document.body.appendChild(script);
}

loadAppDataInit();

// ==========================================
// وحدة FOD
// ==========================================
function switchFodTab(tab) {
    document.querySelectorAll('#fod-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#fod-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-fod-' + tab).classList.add('active');
    document.getElementById('tab-fod-' + tab).classList.add('active');
}

function generateFodInputRows() {
    const month = document.getElementById('fodInputMonth').value;
    if(!month) return alert("برجاء اختيار الشهر أولاً!");
    
    document.getElementById('fodForm').style.display = 'block';
    const tbody = document.getElementById('fod-input-tbody');
    tbody.innerHTML = '';
    
    fodLocations.forEach((item, index) => {
        tbody.innerHTML += `
            <tr style="background: #fff;">
                <td><input type="date" id="fod_date_${index}" required style="width: 100%; padding: 6px;"></td>
                <td style="font-weight: bold;">${item.loc}</td>
                <td style="text-align: center;">${item.area}</td>
                <td><input type="number" step="0.001" id="fod_p_${index}" required placeholder="0.000" style="width: 100%; padding: 6px;"></td>
                <td><input type="number" step="0.001" id="fod_m_${index}" required placeholder="0.000" style="width: 100%; padding: 6px;"></td>
            </tr>
        `;
    });
}

async function submitFOD(e) {
    e.preventDefault();
    const btn = document.getElementById('submitFodBtn');
    const msg = document.getElementById('fodMsg');
    btn.disabled = true; 
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ في الشيت...';
    msg.innerText = "";
    
    let fodDataArray = [];
    let localFodArray = [];
    
    fodLocations.forEach((item, index) => {
        let p = parseFloat(document.getElementById(`fod_p_${index}`).value) || 0;
        let m = parseFloat(document.getElementById(`fod_m_${index}`).value) || 0;
        let d = document.getElementById(`fod_date_${index}`).value;
        let newId = "FOD-" + Date.now() + "-" + index;
        
        fodDataArray.push({
            id: newId, 
            date: d, 
            location: item.loc, 
            area: item.area, 
            plastic: p, 
            metal: m
        });
        
        localFodArray.push({
            ID: newId, 
            Date: d, 
            Location: item.loc, 
            Area: item.area, 
            Plastic: p, 
            Metal: m
        });
    });

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ 
                action: "submitBulkFOD", 
                fodDataArray: fodDataArray 
            })
        });

        msg.style.color = "green"; 
        msg.innerText = "✅ تم حفظ بيانات FOD بنجاح وتحديث قاعدة البيانات!";
        globalFod = [...globalFod, ...localFodArray]; 

        setTimeout(() => { 
            document.getElementById('fodForm').reset(); 
            msg.innerText = ''; 
            btn.disabled = false; 
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الشهر'; 
            document.getElementById('fodForm').style.display = 'none'; 
        }, 1500);

    } catch(err) {
        console.error(err);
        msg.style.color = "red"; 
        msg.innerText = "حدث خطأ أثناء الإرسال!";
        btn.disabled = false; 
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الشهر';
    }
}

function generateFodPrintReport() {
    const monthVal = document.getElementById('fodReportMonth').value;
    if(!monthVal) return alert("اختر الشهر أولاً لعرض التقرير");
    
    const dateObj = new Date(monthVal + "-01");
    const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('fod-report-title').innerText = `F.O.D Collected and Classifications for ${monthName}`;
    
    let filtered = globalFod.filter(f => {
        let fDate = f.Date || f.date;
        return fDate && String(fDate).startsWith(monthVal);
    });
    
    const tbody = document.getElementById('fod-print-tbody');
    tbody.innerHTML = '';
    
    let totalP = 0, totalM = 0;
    
    fodLocations.forEach(locItem => {
        let record = filtered.find(f => (f.Location || f.location) === locItem.loc);
        let d = '---';
        if(record && (record.Date || record.date)) {
            let rawDate = record.Date || record.date;
            d = String(rawDate).split('T')[0].split('-').reverse().join('/');
        }
        
        let p = record ? parseFloat(record.Plastic || record.plastic || 0) : 0;
        let m = record ? parseFloat(record.Metal || record.metal || 0) : 0;
        totalP += p; totalM += m;
        
        tbody.innerHTML += `
            <tr>
                <td style="border: 1px solid #777; padding: 12px;">${d}</td>
                <td style="border: 1px solid #777; padding: 12px; text-align: left;">${locItem.loc}</td>
                <td style="border: 1px solid #777; padding: 12px;">${locItem.area}</td>
                <td style="border: 1px solid #777; padding: 12px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td>
                <td style="border: 1px solid #777; padding: 12px;">${m > 0 ? m.toFixed(3) + ' kg' : '---'}</td>
                <td style="border: 1px solid #777; padding: 12px;">---</td>
            </tr>
        `;
    });
    
    let grossTotal = totalP + totalM;
    tbody.innerHTML += `
        <tr style="background: #fafafa; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #777; padding: 12px;">Total</td>
            <td style="border: 1px solid #777; padding: 12px;">${totalP.toFixed(3)} kg</td>
            <td style="border: 1px solid #777; padding: 12px;">${totalM.toFixed(3)} kg</td>
            <td style="border: 1px solid #777; padding: 12px; color:#000;">${grossTotal.toFixed(3)} kg</td>
        </tr>
    `;
    
    document.getElementById('printable-fod-report').style.display = 'block';
}

function exportFodPDF() {
    const el = document.getElementById('printable-fod-report');
    if(el.style.display === 'none') return alert("قم بعرض التقرير أولاً قبل التصدير!");
    html2pdf().set({
        margin: 0.4, filename: 'FOD_Report.pdf', image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    }).from(el).save();
}

// ==========================================
// التقرير الشهري المجمع
// ==========================================
function formatTrendDifference(diffVal, isHigherBetter, unit = "") {
    let num = parseFloat(diffVal);
    if (isNaN(num) || num === 0) {
        return `<span style="color: #6c757d; font-weight: bold;">0 ${unit} <i class="fa-solid fa-arrows-left-right"></i></span>`;
    }

    let isPositiveDiff = num > 0;
    let formattedVal = Math.abs(num).toFixed(unit.includes("KG") ? 3 : 0);
    let isGoodOutcome = isHigherBetter ? isPositiveDiff : !isPositiveDiff;
    let color = isGoodOutcome ? "#28a745" : "#dc3545";
    let arrowIcon = isPositiveDiff ? "fa-arrow-up" : "fa-arrow-down";

    return `<span style="color: ${color}; font-weight: bold; direction: ltr; display: inline-flex; align-items: center; gap: 4px;">
        ${formattedVal} ${unit} <i class="fa-solid ${arrowIcon}"></i>
    </span>`;
}

function getPreviousMonthStr(monthStr) {
    let [year, month] = monthStr.split('-');
    let d = new Date(year, parseInt(month) - 2);
    let pYear = d.getFullYear();
    let pMonth = String(d.getMonth() + 1).padStart(2, '0');
    return `${pYear}-${pMonth}`;
}

function getMonthlyDetailedStats(monthStr) {
    let stats = {
        monthStr: monthStr, movements: 0, accidents: 0, incidents: 0,
        findingsTotal: 0, findingsOpen: 0, findingsClosed: 0, surveys: [],
        fodPlastic: 0, fodMetal: 0, fodTotal: 0, incidentsList: [], findingsByDept: {}
    };

    let movRow = globalMovements.find(m => String(m.YearMonth || "").trim() === monthStr);
    if (movRow && movRow.Movements) stats.movements = parseInt(movRow.Movements) || 0;

    globalIncidents.forEach(inc => {
        if (inc.Date && String(inc.Date).startsWith(monthStr)) {
            if (inc.Risk_Severity === 'Catastrophic') stats.accidents++;
            else stats.incidents++;
            stats.incidentsList.push(inc);
        }
    });

    globalDailyInspections.forEach(d => {
        if (d.date && String(d.date).startsWith(monthStr)) {
            d.findings.forEach(f => {
                stats.findingsTotal++;
                if (f.status === 'مغلق') stats.findingsClosed++;
                else stats.findingsOpen++;
                stats.findingsByDept[f.responsible] = (stats.findingsByDept[f.responsible] || 0) + 1;
            });
        }
    });

    globalSurveys.forEach(s => {
        if (s.Date && String(s.Date).startsWith(monthStr)) stats.surveys.push(s);
    });

    globalFod.forEach(f => {
        let fDate = f.Date || f.date;
        if (fDate && String(fDate).startsWith(monthStr)) {
            let p = parseFloat(f.Plastic || f.plastic || 0);
            let m = parseFloat(f.Metal || f.metal || 0);
            stats.fodPlastic += p;
            stats.fodMetal += m;
            stats.fodTotal += (p + m);
        }
    });

    return stats;
}

function generateFullMonthlyReport() {
    const currMonthStr = document.getElementById('mainReportMonth').value;
    if (!currMonthStr) return alert("برجاء اختيار الشهر أولاً!");

    const prevMonthStr = getPreviousMonthStr(currMonthStr);
    const currDateObj = new Date(currMonthStr + "-01");
    const prevDateObj = new Date(prevMonthStr + "-01");

    const currMonthNameEn = currDateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const currMonthNameAr = currDateObj.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
    const prevMonthNameAr = prevDateObj.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

    document.getElementById('mr-title-date').innerText = currMonthNameEn;
    document.getElementById('th-curr-month').innerText = currMonthNameAr;
    document.getElementById('th-prev-month').innerText = prevMonthNameAr;

    let currStats = getMonthlyDetailedStats(currMonthStr);
    let prevStats = getMonthlyDetailedStats(prevMonthStr);

    // 1. جدول المقارنة العام
    const tbody = document.getElementById('mr-general-tbody');
    tbody.innerHTML = '';
    const kpiComparisonList = [
        { label: "1- عدد التحركات الجوية", prev: prevStats.movements, curr: currStats.movements, higherBetter: true, unit: "" },
        { label: "2- عدد الحوادث", prev: prevStats.accidents, curr: currStats.accidents, higherBetter: false, unit: "" },
        { label: "3- عدد الوقائع", prev: prevStats.incidents, curr: currStats.incidents, higherBetter: false, unit: "" },
        { label: "4- حالات عدم المطابقة (الإجمالي)", prev: prevStats.findingsTotal, curr: currStats.findingsTotal, higherBetter: false, unit: "" },
        { label: "5- حالات عدم المطابقة المعلقة", prev: prevStats.findingsOpen, curr: currStats.findingsOpen, higherBetter: false, unit: "" },
        { label: "6- حالات عدم المطابقة التي تم تلافيها", prev: prevStats.findingsClosed, curr: currStats.findingsClosed, higherBetter: true, unit: "" },
        { label: "7- استبيان الطيارين", prev: prevStats.surveys.length, curr: currStats.surveys.length, higherBetter: true, unit: "" },
        { label: "8- كمية F.O.D (بلاستيك + معدن)", prev: prevStats.fodTotal, curr: currStats.fodTotal, higherBetter: false, unit: "KG", isFloat: true }
    ];

    kpiComparisonList.forEach(item => {
        let diff = item.curr - item.prev;
        let trendHtml = formatTrendDifference(diff, item.higherBetter, item.unit);
        let currDisplay = item.isFloat ? item.curr.toFixed(3) + " " + item.unit : item.curr;
        let prevDisplay = item.isFloat ? item.prev.toFixed(3) + " " + item.unit : item.prev;

        tbody.innerHTML += `
            <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${item.label}</td>
                <td style="border: 1px solid #000; padding: 8px; direction: ltr;">${prevDisplay}</td>
                <td style="border: 1px solid #000; padding: 8px; direction: ltr; font-weight: bold; background: #fdfdfd;">${currDisplay}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${trendHtml}</td>
            </tr>
        `;
    });

    // 2. رسوم المخاطر والوقائع
    if (monthlyChart1) monthlyChart1.destroy();
    if (monthlyChart2) monthlyChart2.destroy();
    Chart.defaults.font.family = "'Cairo', sans-serif";

    let depts = Object.keys(currStats.findingsByDept);
    let deptsData = Object.values(currStats.findingsByDept);
    monthlyChart1 = new Chart(document.getElementById('mrChart1').getContext('2d'), {
        type: 'bar',
        data: { labels: depts, datasets: [{ label: 'المخاطر طبقاً للإدارة', data: deptsData, backgroundColor: '#003366', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'المخاطر طبقاً للإدارة / الجهة' } } }
    });

    let incTypesCount = {};
    currStats.incidentsList.forEach(inc => {
        let cat = inc.Characterization ? inc.Characterization.split('/')[0].trim() : 'Other';
        incTypesCount[cat] = (incTypesCount[cat] || 0) + 1;
    });
    monthlyChart2 = new Chart(document.getElementById('mrChart2').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(incTypesCount), datasets: [{ label: 'الوقائع', data: Object.values(incTypesCount), backgroundColor: '#dc3545', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'تصنيف الوقائع' } } }
    });

    // 3. حصر الوقائع
    document.getElementById('mr-incidents-count-text').innerText = `تم حصر عدد (${currStats.incidents + currStats.accidents}) وقائع/حوادث كالتالي :`;
    const incList = document.getElementById('mr-incidents-list');
    incList.innerHTML = "";

    let groupedInc = {};
    currStats.incidentsList.forEach(inc => {
        let cat = inc.Characterization ? inc.Characterization.split('/')[0].trim() : 'Other Incident';
        if (!groupedInc[cat]) groupedInc[cat] = [];
        groupedInc[cat].push(inc);
    });

    let catChar = 'A';
    for (let cat in groupedInc) {
        incList.innerHTML += `<div style="background: #eef2f7; color: #003366; font-weight: bold; padding: 6px 12px; margin-top: 15px; border-left: 4px solid #003366; display: flex; justify-content: space-between;"><span>${catChar}) ${cat}.</span><span>Total: ${groupedInc[cat].length}</span></div>`;

        let tbl = `<table style="width:100%; border-collapse:collapse; border: 1px solid #000; margin-bottom:15px; font-size:12px;">`;
        groupedInc[cat].forEach((inc, idx) => {
            let d = inc.Date ? String(inc.Date).split('T')[0] : '';
            let desc = inc.Description ? inc.Description.replace(/\n/g, '<br>') : '-';
            let action = inc.Action_Taken ? inc.Action_Taken.replace(/\n/g, '<br>') : '-';
            let airlineInfo = `<b>Airline:</b> ${inc.CAR || '-'}<br><b>Local Agent:</b> ${inc.Equipment_Owned || '-'}`;

            tbl += `
                <tr>
                    <td style="border: 1px solid #000; padding:8px; width:5%; text-align:center; font-weight:bold; vertical-align:top;">0${idx+1}</td>
                    <td style="border: 1px solid #000; padding:8px; width:65%; vertical-align:top;">
                        <strong style="color:#003366;">Description:</strong><div style="color:#333; margin-top:3px;">${desc}</div>
                        <strong style="color:#28a745; display:block; margin-top:8px;">Action Taken:</strong><div style="color:#333; margin-top:3px;">${action}</div>
                    </td>
                    <td style="border: 1px solid #000; padding:8px; width:15%; text-align:center; vertical-align:top;">${d}</td>
                    <td style="border: 1px solid #000; padding:8px; width:15%; vertical-align:top; font-size:11px;">${airlineInfo}</td>
                </tr>
            `;
        });
        tbl += `</table>`;
        incList.innerHTML += tbl;
        catChar = String.fromCharCode(catChar.charCodeAt(0) + 1);
    }

    // 4. Captain Survey بالمصفوفة والرسوم
    document.getElementById('mr-survey-summary-text').innerText = `تم عمل عدد (${currStats.surveys.length}) استعلام طيارين خلال شهر ${currMonthNameAr}.`;

    let matrixScores = { "Excellent": {}, "Good": {}, "Poor": {}, "N/A": {}, "Blank": {} };
    criteriaList.forEach(crit => {
        matrixScores["Excellent"][crit] = 0;
        matrixScores["Good"][crit] = 0;
        matrixScores["Poor"][crit] = 0;
        matrixScores["N/A"][crit] = 0;
        matrixScores["Blank"][crit] = 0;
    });

    let airlinesCount = {};
    let evalsTotalCount = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };
    let commentsList = [];

    currStats.surveys.forEach(s => {
        if (s.CAR) airlinesCount[s.CAR] = (airlinesCount[s.CAR] || 0) + 1;
        criteriaList.forEach(crit => {
            let val = s[crit] || "Blank";
            if (matrixScores[val]) matrixScores[val][crit]++;
            if (evalsTotalCount[val] !== undefined) evalsTotalCount[val]++;
        });
        if (s.Captain_Comments && s.Captain_Comments.trim() !== "") commentsList.push(s);
    });

    if (mrSurveyAirChartInstance) mrSurveyAirChartInstance.destroy();
    mrSurveyAirChartInstance = new Chart(document.getElementById('mrSurveyAirChart').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(airlinesCount), datasets: [{ label: 'عدد الاستبيانات', data: Object.values(airlinesCount), backgroundColor: '#003366', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Airlines Participation' } } }
    });

    if (mrSurveyEvalChartInstance) mrSurveyEvalChartInstance.destroy();
    mrSurveyEvalChartInstance = new Chart(document.getElementById('mrSurveyEvalChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Excellent', 'Good', 'Poor', 'N/A', 'Blank'],
            datasets: [{ data: Object.values(evalsTotalCount), backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Overall Rating' } } }
    });

    // مصفوفة الـ 31 بند
    let matrixHtml = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #777; font-size: 10px; text-align: center;"><thead><tr style="background:#f2f4f8;">`;
    matrixHtml += `<th style="border: 1px solid #999; padding: 4px; width: 70px;">Rating</th>`;
    criteriaList.forEach(crit => {
        matrixHtml += `<th style="border: 1px solid #999; padding: 3px; writing-mode: vertical-lr; transform: rotate(180deg); height: 110px; font-size: 9px;">${crit}</th>`;
    });
    matrixHtml += `</tr></thead><tbody>`;

    const rowStyles = {
        "Excellent": "background:#28a745; color:white; font-weight:bold;",
        "Good": "background:#ffc107; color:black; font-weight:bold;",
        "Poor": "background:#dc3545; color:white; font-weight:bold;",
        "N/A": "background:#6c757d; color:white; font-weight:bold;",
        "Blank": "background:#003366; color:white; font-weight:bold;"
    };

    ["Excellent", "Good", "Poor", "N/A", "Blank"].forEach(rating => {
        matrixHtml += `<tr><td style="${rowStyles[rating]} border: 1px solid #999; padding: 4px;">${rating}</td>`;
        criteriaList.forEach(crit => {
            let score = matrixScores[rating][crit];
            matrixHtml += `<td style="border: 1px solid #ccc; padding: 4px; background: ${score > 0 ? '#fff' : '#fafafa'}; color: ${rating === 'Poor' && score > 0 ? '#dc3545' : '#000'}; font-weight:${score > 0 ? 'bold' : 'normal'};">${score}</td>`;
        });
        matrixHtml += `</tr>`;
    });
    matrixHtml += `</tbody></table>`;
    document.getElementById('mr-survey-matrix-container').innerHTML = matrixHtml;

    // جدول ملاحظات الكباتن
    let commentsHtml = `<table style="width:100%; border-collapse: collapse; border: 1px solid #000; font-size: 11px;">
        <thead style="background: #e6e6e6;">
            <tr>
                <th style="border: 1px solid #000; padding: 6px;">Airline NAME</th>
                <th style="border: 1px solid #000; padding: 6px;">FLTNO</th>
                <th style="border: 1px solid #000; padding: 6px;">Type</th>
                <th style="border: 1px solid #000; padding: 6px;">DateTime</th>
                <th style="border: 1px solid #000; padding: 6px;">REG</th>
                <th style="border: 1px solid #000; padding: 6px; width: 45%;">Captain Comments</th>
            </tr>
        </thead><tbody>`;

    if (commentsList.length === 0) {
        commentsHtml += `<tr><td colspan="6" style="border: 1px solid #000; padding: 12px; text-align: center; color: #777;">No captain comments recorded for this period.</td></tr>`;
    } else {
        commentsList.forEach(s => {
            let dStr = s.Date ? String(s.Date).split('T')[0] : '';
            commentsHtml += `
                <tr>
                    <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${s.CAR || '-'}</td>
                    <td style="border: 1px solid #000; padding: 6px;">${s.Flight_NO || '-'}</td>
                    <td style="border: 1px solid #000; padding: 6px;">${s.TYPE || '-'}</td>
                    <td style="border: 1px solid #000; padding: 6px;">${dStr} ${s.Time || ''}</td>
                    <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${s.REG || '-'}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: justify;">${s.Captain_Comments}</td>
                </tr>
            `;
        });
    }
    commentsHtml += `</tbody></table>`;
    document.getElementById('mr-survey-comments-container').innerHTML = commentsHtml;

    // 5. FOD
    const fodDiv = document.getElementById('mr-fod-details');
    if (currStats.fodTotal === 0) {
        fodDiv.innerHTML = "<p style='color: #777;'>No F.O.D records for this month.</p>";
    } else {
        fodDiv.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; text-align: center; font-size: 12px;">
                <thead style="background:#f9f9f9;">
                    <tr>
                        <th style="border: 1px solid #ccc; padding: 8px;">Month</th>
                        <th style="border: 1px solid #ccc; padding: 8px;">Plastic</th>
                        <th style="border: 1px solid #ccc; padding: 8px;">Metal</th>
                        <th style="border: 1px solid #ccc; padding: 8px; background: #003366; color: #fff;">Gross Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">${currMonthNameEn}</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">${currStats.fodPlastic.toFixed(3)} KG</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">${currStats.fodMetal.toFixed(3)} KG</td>
                        <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold; color: #003366;">${currStats.fodTotal.toFixed(3)} KG</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    document.getElementById('printable-main-report').style.display = 'block';
    window.scrollTo({ top: document.getElementById('printable-main-report').offsetTop - 30, behavior: 'smooth' });
}

function exportMainReportPDF() {
    const el = document.getElementById('printable-main-report');
    if(el.style.display === 'none') return alert("قم بتجهيز التقرير أولاً قبل التصدير!");
    window.scrollTo(0, 0);
    html2pdf().set({
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: 'Air_Side_Monthly_Report.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.avoid-page-break', 'tr', 'h3', 'h4'] }
    }).from(el).save();
}

// ==========================================
// باقي دوال النظام (الدليل، الأسطول، الفحص، إلخ)
// ==========================================
function populateUsersDropdown(usersArray) {
    const datalist = document.getElementById('usersList');
    const userInp = document.getElementById('loginUser');
    if (!datalist) return;
    datalist.innerHTML = ''; 
    let defaultUser = "Admin";
    usersArray.forEach(user => {
        let option = document.createElement('option');
        option.value = user.Username; 
        datalist.appendChild(option);
    });
    if (userInp) userInp.value = defaultUser;
}

function renderDirectory(dataList) {
    const tbody = document.getElementById('directory-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:15px; color:#999;'>لا توجد بيانات</td></tr>";
        return;
    }
    let counter = 1;
    dataList.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td style="text-align:center;">${counter++}</td>
                <td style="font-weight:bold; color:#003366;">${item.Name || '-'}</td>
                <td>${item.Role || '-'}</td>
                <td style="text-align:center; direction:ltr; color:#dc3545; font-weight:bold;">${item.Ext || '-'}</td>
                <td style="text-align:center; direction:ltr;">${item.Mobile || '-'}</td>
                <td style="text-align:center;" class="dir-actions">
                    <button onclick="openDirModal('${item.ID}')" style="background:#ffc107; border:none; padding:4px 8px; border-radius:4px;"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteDirEntry('${item.ID}')" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; border-radius:4px;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterDirectory() {
    let q = document.getElementById('dirSearch').value.toLowerCase();
    let f = globalDirectory.filter(i => (i.Name && i.Name.toLowerCase().includes(q)) || (i.Role && i.Role.toLowerCase().includes(q)));
    renderDirectory(f);
}

function openDirModal(id) {
    document.getElementById('dirMsg').innerText = "";
    if (id && id !== 'undefined') {
        let item = globalDirectory.find(g => String(g.ID) === String(id));
        if (item) {
            document.getElementById('dirId').value = item.ID || "";
            document.getElementById('dirDept').value = item.Department || "";
            document.getElementById('dirName').value = item.Name || "";
            document.getElementById('dirRole').value = item.Role || "";
            document.getElementById('dirExt').value = item.Ext || "";
            document.getElementById('dirMobile').value = item.Mobile || "";
        }
    } else {
        document.getElementById('dirForm').reset();
        document.getElementById('dirId').value = "";
    }
    document.getElementById('dirModal').style.display = 'flex';
}
function closeDirModal() { document.getElementById('dirModal').style.display = 'none'; }

async function saveDirEntry(e) {
    e.preventDefault();
    let id = document.getElementById('dirId').value || "DIR-" + Date.now();
    let isEdit = document.getElementById('dirId').value !== "";
    let payload = {
        id: id, dept: document.getElementById('dirDept').value, name: document.getElementById('dirName').value,
        role: document.getElementById('dirRole').value, ext: document.getElementById('dirExt').value, mobile: document.getElementById('dirMobile').value
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "manageDirectory", subAction: isEdit ? "edit" : "add", dirData: payload })
    });
    let newObj = { ID: payload.id, Department: payload.dept, Name: payload.name, Role: payload.role, Ext: payload.ext, Mobile: payload.mobile };
    if (isEdit) {
        let idx = globalDirectory.findIndex(g => String(g.ID) === String(payload.id));
        if (idx !== -1) globalDirectory[idx] = newObj;
    } else {
        globalDirectory.push(newObj);
    }
    renderDirectory(globalDirectory);
    closeDirModal();
}

async function deleteDirEntry(id) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "manageDirectory", subAction: "delete", dirData: { id: id } })
    });
    globalDirectory = globalDirectory.filter(g => String(g.ID) !== String(id));
    renderDirectory(globalDirectory);
}

function exportDirectoryPDF() {
    html2pdf().set({ margin: 0.3, filename: 'Phone_Directory.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(document.getElementById('printable-directory')).save();
}

// إدخال الاستبيانات
function buildEvaluationForm() {
    const container = document.getElementById('criteria-container');
    if (!container) return;
    criteriaList.forEach((crit, index) => {
        container.innerHTML += `
            <div class="eval-card">
                <div class="eval-title">${crit}</div>
                <div class="radio-group">
                    <input type="radio" id="c${index}_e" name="${crit}" value="Excellent" checked><label for="c${index}_e" class="lbl-e">E</label>
                    <input type="radio" id="c${index}_g" name="${crit}" value="Good"><label for="c${index}_g" class="lbl-g">G</label>
                    <input type="radio" id="c${index}_p" name="${crit}" value="Poor"><label for="c${index}_p" class="lbl-p">P</label>
                    <input type="radio" id="c${index}_n" name="${crit}" value="N/A"><label for="c${index}_n" class="lbl-n">N/A</label>
                    <input type="radio" id="c${index}_b" name="${crit}" value="Blank"><label for="c${index}_b" class="lbl-b">B</label>
                </div>
            </div>`;
    });
}
buildEvaluationForm();

function switchTab(tab) {
    document.querySelectorAll('#captain-survey-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#captain-survey-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

function setupCustomDropdown() {
    const input = document.getElementById('reg');
    const arrow = document.getElementById('regArrowBtn');
    const list = document.getElementById('regDropdownList');
    if(input && arrow && list) {
        arrow.addEventListener('click', (e) => { e.stopPropagation(); list.classList.toggle('show'); filterRegOptions(true); });
        input.addEventListener('input', () => { list.classList.add('show'); filterRegOptions(false); });
        document.addEventListener('click', () => list.classList.remove('show'));
    }
}
setupCustomDropdown();

function filterRegOptions(showAll) {
    const input = document.getElementById('reg');
    const list = document.getElementById('regDropdownList');
    let val = input.value.toUpperCase();
    list.innerHTML = '';
    let matched = showAll ? globalFleetData : globalFleetData.filter(a => String(a.REG).toUpperCase().includes(val));
    matched.forEach(a => {
        let div = document.createElement('div');
        div.className = 'custom-dropdown-item';
        div.innerHTML = `${a.REG} <span style="font-size:0.75rem; color:#777; float:right;">${a.CAR}</span>`;
        div.onclick = () => {
            input.value = a.REG;
            document.getElementById('airline').value = a.CAR || "";
            document.getElementById('acType').value = a.TYPE || "";
            list.classList.remove('show');
        };
        list.appendChild(div);
    });
}

function clearFormForNew() {
    document.getElementById('surveyForm').reset();
    document.getElementById('submitSurveyBtn').disabled = false;
    document.getElementById('submitSurveyBtn').innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان';
}

async function submitSurvey(e) {
    e.preventDefault();
    const btn = document.getElementById('submitSurveyBtn');
    btn.disabled = true; btn.innerHTML = 'جاري الإرسال...';
    let sObj = {
        "Date": document.getElementById('capDate').value,
        "Time": document.getElementById('capTime').value,
        "Flight_NO": document.getElementById('fltNo').value,
        "REG": document.getElementById('reg').value.toUpperCase(),
        "CAR": document.getElementById('airline').value,
        "TYPE": document.getElementById('acType').value,
        "Captain_Comments": document.getElementById('comments').value
    };
    criteriaList.forEach(crit => {
        let sel = document.querySelector(`input[name="${crit}"]:checked`);
        sObj[crit] = sel ? sel.value : "Blank";
    });
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "submitSurvey", surveyData: sObj })
    });
    globalSurveys.unshift(sObj);
    document.getElementById('surveyMsg').innerText = "✅ تم الحفظ بنجاح!";
    setTimeout(() => { btn.disabled = false; btn.innerHTML = 'حفظ بيانات الاستبيان'; document.getElementById('surveyMsg').innerText = ""; clearFormForNew(); }, 1500);
}

function openFleetModal() { document.getElementById('addModal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('addModal').style.display = 'none'; }
async function saveNewAircraft() {
    let r = document.getElementById('newReg').value.toUpperCase();
    let t = document.getElementById('newType').value.toUpperCase();
    let a = document.getElementById('newAirline').value.toUpperCase();
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "addNewAircraft", reg: r, acType: t, airline: a })
    });
    globalFleetData.unshift({ REG: r, TYPE: t, CAR: a });
    closeAddModal();
}

function switchDailyTab(tab) {
    document.querySelectorAll('#daily-inspection-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#daily-inspection-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-daily-' + tab).classList.add('active');
    document.getElementById('tab-daily-' + tab).classList.add('active');
}

function switchIncidentTab(tab) {
    document.querySelectorAll('#incident-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#incident-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-inc-' + tab).classList.add('active');
    document.getElementById('tab-inc-' + tab).classList.add('active');
}

function updateDailyNavCounter() {
    const el = document.getElementById('nav-daily-counter');
    if(el) el.innerText = `${currentDailyIndex + 1} / ${globalDailyInspections.length}`;
}

function updateIncidentNavCounter() {
    const el = document.getElementById('nav-incident-counter');
    if(el) el.innerText = `${currentIncidentIndex + 1} / ${globalIncidents.length}`;
}

function clearDailyFormForNew() {
    document.getElementById('dailyForm').reset();
    isDailyEditMode = false;
    currentDailyEditId = null;
    let now = new Date().toISOString();
    document.getElementById('dailyDate').value = now.split('T')[0];
    document.getElementById('dailyTime').value = now.split('T')[1].substring(0, 5);
}

function clearIncidentForm() {
    document.getElementById('incidentForm').reset();
    isIncidentEditMode = false;
    currentIncidentEditId = null;
    let now = new Date().toISOString();
    document.getElementById('incDate').value = now.split('T')[0];
    document.getElementById('incTime').value = now.split('T')[1].substring(0, 5);
}

async function submitIncident(e) {
    e.preventDefault();
    const btn = document.getElementById('submitIncBtn');
    btn.disabled = true; btn.innerHTML = 'جاري الحفظ...';
    let incObj = {
        id: isIncidentEditMode ? currentIncidentEditId : "INC-" + Date.now(),
        date: document.getElementById('incDate').value,
        time: document.getElementById('incTime').value,
        location: document.getElementById('incLocation').value,
        car: document.getElementById('incCar').value,
        flightNo: document.getElementById('incFlightNo').value,
        reg: document.getElementById('incReg').value,
        preparedBy: document.getElementById('incPreparedBy').value,
        charaterization: document.getElementById('incChar').value,
        riskSeverity: document.getElementById('incRiskSev').value,
        description: document.getElementById('incDesc').value,
        actionTaken: document.getElementById('incAction').value,
        status: "In service"
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: isIncidentEditMode ? "updateIncident" : "submitIncident", incidentData: incObj })
    });
    if(!isIncidentEditMode) globalIncidents.unshift(incObj);
    renderSavedIncidents();
    document.getElementById('incMsg').innerText = "✅ تم حفظ الواقعة بنجاح!";
    setTimeout(() => { btn.disabled = false; btn.innerHTML = 'حفظ الواقعة'; document.getElementById('incMsg').innerText = ""; clearIncidentForm(); }, 1500);
}

function renderSavedIncidents() {
    const tbody = document.getElementById('saved-inc-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    globalIncidents.forEach((inc, idx) => {
        tbody.innerHTML += `
            <tr>
                <td dir="ltr">${inc.Date || inc.date || '-'}</td>
                <td>${inc.Location || inc.location || inc.Flight_No || '-'}</td>
                <td>${inc.Characterization || inc.charaterization || '-'}</td>
                <td>${inc.Prepared_By || inc.preparedBy || '-'}</td>
                <td><button type="button" onclick="deleteIncidentRecord(${idx})" style="background:#dc3545; color:white; border:none; padding:4px 8px; border-radius:4px;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
    });
}

async function deleteIncidentRecord(idx) {
    if(!confirm("هل تريد حذف الواقعة؟")) return;
    let item = globalIncidents[idx];
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "deleteIncident", id: item.ID || item.id })
    });
    globalIncidents.splice(idx, 1);
    renderSavedIncidents();
}

function renderSavedDaily() {
    const tbody = document.getElementById('saved-daily-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    globalDailyInspections.forEach(rep => {
        tbody.innerHTML += `<tr><td dir="ltr">${rep.date}</td><td>${rep.time}</td><td>${rep.shift}</td><td>${rep.inspector}</td><td>${rep.findings.length} ملاحظة</td><td>عرض</td></tr>`;
    });
}

async function addUser(e) {
    e.preventDefault();
    let r = document.getElementById('newUserRole').value;
    let u = document.getElementById('newUsername').value;
    let p = document.getElementById('newUserPass').value;
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "addUser", role: r, username: u, password: p })
    });
    globalUsers.push({ Role: r, Username: u, Password: p });
    document.getElementById('userMsg').innerText = "تمت إضافة المستخدم بنجاح!";
}
