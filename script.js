const API_URL = "https://script.google.com/macros/s/AKfycbzPecq0b8ryKc8N2CqC8N46LBgG-lWzczxHiPOKAOtNgpwAjz8Ro284t2ice8vt1HQY/exec";

const dailyChecklistDataISO = {
    col1: { title: "المناطق المرصوفة", items: ["شروخ", "حفر(علي الأقل 5 بوصة عرض) (3بوصة عمق)", "هبوط", "تآكل", "مطاط", "نباتات", "أجسام غريبة FOD", "أخرى"], title2: "المناطق الغير مرصوفة", items2: ["غير مستوية", "نباتات", "عوائق", "أجسام غريبة FOD", "أخرى"], title3: "المساعدات الملاحية", items3: ["البيكون الدوار بالبرج لا يعمل", "كم الريح غير مطابق", "PAPI غير مطابق", "السارينة لاتعمل", "لمبات العوائق غير مضاءة", "أخرى"] },
    col2: { title: "التخطيط (Marking)", items: ["غير مطابق / واضح والمدرج RWY", "محور المدرج مغطي بالمطاط", "غير مطابق / واضح في Holding Position", "غير مطابق / واضح في الـ TXY", "غير مطابق / واضح في الترمك"], title2: "اللافتات الإرشادية", items2: ["غير مطابقة .", "غير مضاءة", "محجوبة بواسطة النباتات.", "قاعدتها الخرسانية أعلي من مستوي الأرض", "القواعد الغير قابلة للكسر.", "أخرى"], title3: "الإنارة", items3: ["لمبات مكسورة/ تالفة علي المدرج RWY", "لمبات مكسورة/ تالفة علي الممرات TXY", "لمبات مكسورة/ تالفة على الترمك", "إنارة وحدات Floodlight غير مطابقة أو أقل من (20لاكس)", "اللمبات الغاطسة غير مضاءة", "لمبات وحدات الإقتراب غير مطابقة", "لمبات العوائق غير مضاءة", "لمبات مكسورة / تالفة لإنارة الطرق الخدمية داخل Airside", "أخرى"] },
    col3: { title: "عملية تموين الوقود", items: ["وقوف غير سليم علي الطائرة", "الهروب السريع غير متوفر", "النظام الإطفائي غير مكتمل", "DEAD MAN غير مستعمل", "سلك التأريض غير موصل", "زر الطوارئ لايعمل", "عدد المشغلين غير كاف", "المشغل لا يرتدي مهمات السلامة", "أختبار العينة لا يتم إجراؤه", "منطقة العمل غير محددة", "حساسات المصعد لا تعمل", "ملصقات عدم التدخين والـ Jet A", "الـ Clear Exit غير متوفرة للسيارة", "البيكون لا يعمل", "السائبة العامة للسيارة غير لائقة", "عدم توافر المواد الماصة للوقود.", "إستخدام تليفون محمول في حدود 15 م أثناء التموين.", "أخرى"], title2: "أخطار الحياة البرية", items2: ["مشاهدة حيوانات برية / طيور مقيمة / نافقة", "وجود مصادر جذب للحياة البرية", "أخرى"] },
    col4: { title: "التحركات الأرضية ووقوف وإيواء الطائرات ومناولة الحقائب", items: ["سائق المعدة لا يحمل تصريح قيادة على المهبط", "رخصة المعدة غير متوفرة.", "عدم الإلتزام بالسرعات المقررة", "عدم إستخدام طريق الخدمة .", "إستخدام أكثر من 3 مقطورة أثناء الخدمة", "عدم تجميع الـ FOD الناتج من تحميل الحقائب", "إرتفاع الحقائب يتعدي 3 صفوف", "الأقماع غير موضوعة علي حدود الطائرة", "المعدة الأرضية غير مجهزة بليكون.", "المعدة الأرضية غير مطابقة .", "طفايات الحريق غير سارية.", "عملية الدفع للخلف تتم بسرعة غير مناسبة", "عدم إتباع تعليمات سلامة التحركات علي المهبط", "وجود أشخاص غير مصرح لهم.", "وجود معدات غير مصرح بها.", "عدم إرتداء مهمات الوقاية الشخصية", "أخرى"], title2: "الإنقاذ والإطفاء", items2: ["عدم صلاحية الإتصالات", "عدم الإستجابة السريعة للأفراد.", "نقص في عدد مشغلي سيارة الإطفاء", "أخرى"] }
};

const criteriaList = ["Communication Tower", "Communication Ground", "VOR-DME", "RNP APR 33_15", "Aeronautical Beacon", "Approach Lighting System", "PAPI System", "Wind Cone", "Apron Marking", "Apron Lighting", "Apron Signs", "APRON Stands Size", "G.H Performance", "Fuelling Performance", "Marshall Services", "RFF Team performance", "Runway Marking", "Runway Lighting", "Runway Signs", "RWY Brakes Action", "RWY Evaluating Pavement", "Taxi Way Marking", "Taxi Way Lighting", "Taxi Way Signs", "TWY Brakes Action", "TWY Evaluating Pavement", "Stop Bars", "Weather", "Wildlife", "Bird Strike", "FOD"];
const spiCategories = [{ name: "Safety Operational Issues", items: ["Bird Strike", "Wildlife Strike", "FOD Occurrence", "Runway Incursion", "Exceeding Speed"] }, { name: "Technical & Ground Issues", items: ["Fuel Spill/Leakage", "Equipment Breakdown", "Navigation Aids Failure", "Lighting System Fault"] }];
const responsibleDepts = ["العمليات", "الهندسة المدنية", "الهندسة الكهربية", "الإنقاذ والإطفاء", "شركات الطيران / الوكالات", "الإرشاد", "أخرى"];
const fodLocations = [{ loc: "Aircraft Stands Area", area: "53.125 M²" }, { loc: "GSE Area", area: "4152 M²" }, { loc: "Arrival & Departures Gates", area: "2420 M²" }, { loc: "Around Aprons Gas station", area: "2539 M²" }];

let globalFleetData = [], globalSurveys = [], globalUsers = [], globalDailyInspections = [], globalIncidents = [], globalDirectory = [], globalFod = [], globalSpiData = [];
let currentSurveyIndex = -1, currentDailyIndex = -1, currentIncidentIndex = -1;
let isDailyEditMode = false, currentDailyEditId = null, currentIncidentEditId = null;
let chartInstances = {}, monthlyChart1 = null, monthlyChart2 = null;

// ==========================================
// 1. شاشة التحميل والدخول
// ==========================================
let isAppLoaded = false;
function finishLoading() {
    if (isAppLoaded) return;
    isAppLoaded = true;
    try {
        const splash = document.getElementById('splash-screen');
        const loginScreen = document.getElementById('login-screen');
        const passInp = document.getElementById('loginPass');
        
        if (splash) {
            splash.classList.add('smoke-out');
            setTimeout(() => {
                splash.style.display = 'none';
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                    if (passInp) passInp.focus();
                }
            }, 800);
        } else if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
    } catch (e) { console.error(e); }
}
setTimeout(finishLoading, 3800);

async function safePost(payload, btnElement, msgElement, successText, onSuccessCallback) {
    if(btnElement) { btnElement.disabled = true; btnElement.dataset.origText = btnElement.innerHTML; btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...'; }
    if(msgElement) { msgElement.style.color = "#003366"; msgElement.innerText = "جاري الاتصال..."; }
    try {
        await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
        if(onSuccessCallback) onSuccessCallback();
        if(msgElement && successText) { msgElement.style.color = "green"; msgElement.innerText = "✅ " + successText; }
    } catch (err) {
        if(msgElement) { msgElement.style.color = "red"; msgElement.innerText = "❌ تعذر الاتصال بالسيرفر!"; }
    }
    setTimeout(() => { if(btnElement) { btnElement.disabled = false; btnElement.innerHTML = btnElement.dataset.origText; } if(msgElement) msgElement.innerText = ""; }, 2000);
}

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
        errorMsg.style.display = 'block'; document.getElementById('loginPass').value = "";
    }
}

function openSection(sectionId) { document.querySelectorAll('.content-area').forEach(el => el.style.display = 'none'); const target = document.getElementById(sectionId); if (target) { target.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); } }
function openAdminSection(sectionId) { let pass = prompt("🔒 هذه الصفحة مخصصة لمدير النظام فقط.\nبرجاء إدخال كلمة المرور:"); if (pass === "1234") openSection(sectionId); else if (pass !== null) alert("❌ كلمة المرور غير صحيحة!"); }
function openGenericDoc(title) { document.getElementById('generic-doc-title').innerText = title; openSection('generic-doc-section'); }

// ==========================================
// 2. تحميل البيانات
// ==========================================
function loadAppDataInit() {
    const callbackName = 'jsonpInit_' + Math.round(100000 * Math.random());
    window[callbackName] = function (data) {
        try {
            if (data && data.status === "success") {
                globalFleetData = data.fleet ? data.fleet.reverse() : []; globalSurveys = data.surveys ? data.surveys.reverse() : [];
                globalUsers = data.users || []; globalIncidents = data.incidents ? data.incidents.reverse() : [];
                globalDirectory = data.directory || []; globalFod = data.fod || []; globalSpiData = data.spi || [];
                populateUsersDropdown(globalUsers); renderDirectory(); updateSurveyNavCounter(); buildSpiEntryForm();
                if (data.daily && data.daily.length > 0) {
                    let reportsMap = {};
                    data.daily.forEach(row => {
                        let repId = row.Report_ID; let timeStr = row.Time;
                        if (timeStr && typeof timeStr === 'string' && timeStr.includes('T')) { let d = new Date(timeStr); if (!isNaN(d)) timeStr = d.toISOString().substring(11, 16); }
                        if (!reportsMap[repId]) reportsMap[repId] = { id: repId, date: row.Date ? new Date(row.Date).toISOString().split('T')[0] : '', time: timeStr, shift: row.Shift, inspector: row.Inspector, findings: [] };
                        if (row.Category && row.Category !== "لا توجد ملاحظات") reportsMap[repId].findings.push({ category: row.Category, item: row.Finding_Item, location: row.Location, responsible: row.Responsible, note: row.Corrective_Action || "", status: row.Status || "مفتوح" });
                    });
                    globalDailyInspections = Object.values(reportsMap).sort((a, b) => b.id - a.id);
                }
                renderSavedDaily(); renderSavedIncidents(); updateDailyNavCounter(); updateIncidentNavCounter();
            }
        } catch (e) {} delete window[callbackName];
    };
    const script = document.createElement('script'); script.src = API_URL + "?action=getAppData&_t=" + Date.now() + "&callback=" + callbackName; document.body.appendChild(script);
}
loadAppDataInit();

// ==========================================
// 3. استبيان الكابتن (مصفوفة أفقية للـ PDF)
// ==========================================
function updateSurveyNavCounter() { const el = document.getElementById('nav-counter'); if (el) el.innerText = globalSurveys.length > 0 ? `${currentSurveyIndex + 1} / ${globalSurveys.length}` : `0 / 0`; }
function navSurveys(direction) {
    if (!globalSurveys || globalSurveys.length === 0) return alert("لا توجد استبيانات مسجلة بعد.");
    if (direction === 'first') currentSurveyIndex = 0; else if (direction === 'last') currentSurveyIndex = globalSurveys.length - 1; else if (direction === 'next' && currentSurveyIndex < globalSurveys.length - 1) currentSurveyIndex++; else if (direction === 'prev' && currentSurveyIndex > 0) currentSurveyIndex--;
    if (currentSurveyIndex >= 0 && currentSurveyIndex < globalSurveys.length) { displaySurveyInForm(globalSurveys[currentSurveyIndex]); updateSurveyNavCounter(); let btn = document.getElementById('submitSurveyBtn'); if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-eye"></i> وضع العرض'; btn.style.backgroundColor = "#6c757d"; } }
}
function displaySurveyInForm(survey) {
    if (!survey) return;
    document.getElementById('capDate').value = survey.Date ? new Date(survey.Date).toISOString().split('T')[0] : '';
    let timeVal = survey.Time || ''; document.getElementById('capTime').value = timeVal.includes('T') ? new Date(timeVal).toTimeString().substring(0, 5) : timeVal;
    document.getElementById('fltNo').value = survey.Flight_NO || ''; document.getElementById('reg').value = survey.REG || ''; document.getElementById('airline').value = survey.CAR || ''; document.getElementById('acType').value = survey.TYPE || ''; document.getElementById('comments').value = survey.Captain_Comments || '';
    criteriaList.forEach(crit => { let val = survey[crit] || "Blank"; let radio = document.querySelector(`input[name="${crit}"][value="${val}"]`); if (radio) radio.checked = true; });
}
function clearFormForNew() {
    currentSurveyIndex = -1; document.getElementById('surveyForm').reset(); updateSurveyNavCounter();
    let btn = document.getElementById('submitSurveyBtn'); if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان'; btn.style.backgroundColor = "var(--primary)"; }
    let now = new Date().toISOString(); document.getElementById('capDate').value = now.split('T')[0]; document.getElementById('capTime').value = now.split('T')[1].substring(0, 5);
}
function submitSurvey(e) {
    e.preventDefault(); const btn = document.getElementById('submitSurveyBtn'), msg = document.getElementById('surveyMsg'), airline = document.getElementById('airline').value;
    if (!airline) return;
    let sObj = { "Date": document.getElementById('capDate').value, "Time": document.getElementById('capTime').value, "Flight_NO": document.getElementById('fltNo').value, "REG": document.getElementById('reg').value.toUpperCase(), "CAR": airline, "TYPE": document.getElementById('acType').value, "Captain_Comments": document.getElementById('comments').value };
    criteriaList.forEach(crit => { let sel = document.querySelector(`input[name="${crit}"]:checked`); sObj[crit] = sel ? sel.value : "Blank"; });
    safePost({ action: "submitSurvey", surveyData: sObj }, btn, msg, "تم الحفظ بنجاح!", () => { globalSurveys.unshift(sObj); updateSurveyNavCounter(); setTimeout(() => clearFormForNew(), 1500); });
}
function buildEvaluationForm() {
    const container = document.getElementById('criteria-container'); if (!container) return; container.innerHTML = '';
    criteriaList.forEach((crit, index) => {
        container.innerHTML += `<div class="eval-card"><div class="eval-title">${crit}</div><div class="radio-group"><input type="radio" id="c${index}_e" name="${crit}" value="Excellent" checked><label for="c${index}_e" class="lbl-e">E</label><input type="radio" id="c${index}_g" name="${crit}" value="Good"><label for="c${index}_g" class="lbl-g">G</label><input type="radio" id="c${index}_p" name="${crit}" value="Poor"><label for="c${index}_p" class="lbl-p">P</label><input type="radio" id="c${index}_n" name="${crit}" value="N/A"><label for="c${index}_n" class="lbl-n">N/A</label><input type="radio" id="c${index}_b" name="${crit}" value="Blank"><label for="c${index}_b" class="lbl-b">B</label></div></div>`;
    });
}
buildEvaluationForm();
function switchTab(tab) { document.querySelectorAll('#captain-survey-section .tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('#captain-survey-section .tab-content').forEach(c => c.classList.remove('active')); document.getElementById('btn-' + tab).classList.add('active'); document.getElementById('tab-' + tab).classList.add('active'); }
function setupCustomDropdown() {
    const input = document.getElementById('reg'), arrow = document.getElementById('regArrowBtn'), list = document.getElementById('regDropdownList');
    if(input && arrow && list) { arrow.addEventListener('click', (e) => { e.stopPropagation(); list.classList.toggle('show'); filterRegOptions(true); }); input.addEventListener('input', () => { list.classList.add('show'); filterRegOptions(false); }); document.addEventListener('click', () => list.classList.remove('show')); }
}
setupCustomDropdown();
function filterRegOptions(showAll) {
    const input = document.getElementById('reg'), list = document.getElementById('regDropdownList'); let val = input.value.toUpperCase(); list.innerHTML = '';
    let matched = showAll ? globalFleetData : globalFleetData.filter(a => String(a.REG).toUpperCase().includes(val));
    matched.forEach(a => { let div = document.createElement('div'); div.className = 'custom-dropdown-item'; div.innerHTML = `${a.REG} <span style="font-size:0.75rem; color:#777; float:right;">${a.CAR}</span>`; div.onclick = () => { input.value = a.REG; document.getElementById('airline').value = a.CAR || ""; document.getElementById('acType').value = a.TYPE || ""; list.classList.remove('show'); }; list.appendChild(div); });
}

// ** حل مشكلة المصفوفة في الـ PDF (Transpose Matrix) **
function generateModernReport() {
    let fromD = document.getElementById('fromDate').value, toD = document.getElementById('toDate').value; if (!fromD || !toD) return alert("اختر الفترة أولاً");
    let fd = new Date(fromD), td = new Date(toD); td.setHours(23, 59, 59, 999); document.getElementById('printable-report').style.display = 'block';
    let filtered = globalSurveys.filter(s => { let sd = new Date(s.Date); return sd >= fd && sd <= td; });
    document.getElementById('report-date-range').innerText = `الفترة من ${fromD} إلى ${toD}`; document.getElementById('stat-total').innerText = filtered.length;
    
    let airlinesCount = {}, datesCount = {}, evalsCount = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 }, commentsList = [];
    const tbody = document.getElementById('flights-eval-tbody'); tbody.innerHTML = '';
    let matrixScores = { "Excellent": {}, "Good": {}, "Poor": {}, "N/A": {}, "Blank": {} }; criteriaList.forEach(crit => { matrixScores["Excellent"][crit] = 0; matrixScores["Good"][crit] = 0; matrixScores["Poor"][crit] = 0; matrixScores["N/A"][crit] = 0; matrixScores["Blank"][crit] = 0; });
    
    filtered.forEach(s => {
        if (s.CAR) airlinesCount[s.CAR] = (airlinesCount[s.CAR] || 0) + 1; let dStr = s.Date ? String(s.Date).split('T')[0] : 'Unknown'; datesCount[dStr] = (datesCount[dStr] || 0) + 1;
        let fCounts = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };
        criteriaList.forEach(crit => { let val = s[crit] || "Blank"; if(fCounts[val] !== undefined) fCounts[val]++; if(evalsCount[val] !== undefined) evalsCount[val]++; if(matrixScores[val]) matrixScores[val][crit]++; });
        if (s.Captain_Comments && s.Captain_Comments.trim() !== "") commentsList.push(s);
        tbody.innerHTML += `<tr><td><b>${s.CAR || ''}</b></td><td>${s.Flight_NO || ''}</td><td>${dStr}</td><td>${s.REG || ''}</td><td style="color:#28a745; font-weight:bold;">${fCounts["Excellent"]}</td><td style="color:#ffc107; font-weight:bold;">${fCounts["Good"]}</td><td style="color:#dc3545; font-weight:bold;">${fCounts["Poor"]}</td><td>${fCounts["N/A"]}</td><td>${fCounts["Blank"]}</td></tr>`;
    });
    
    document.getElementById('stat-airlines').innerText = Object.keys(airlinesCount).length; let totalEvals = Object.values(evalsCount).reduce((a, b) => a + b, 0); document.getElementById('stat-excellent').innerText = `${totalEvals > 0 ? Math.round((evalsCount["Excellent"] / totalEvals) * 100) : 0}%`;
    
    if (chartInstances.air) chartInstances.air.destroy(); if (chartInstances.dates) chartInstances.dates.destroy(); if (chartInstances.eval) chartInstances.eval.destroy();
    Chart.defaults.font.family = "'Cairo', sans-serif";
    chartInstances.air = new Chart(document.getElementById('airlinesChart').getContext('2d'), { type: 'bar', data: { labels: Object.keys(airlinesCount), datasets: [{ label: 'الاستبيانات', data: Object.values(airlinesCount), backgroundColor: '#003366', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false } });
    chartInstances.dates = new Chart(document.getElementById('datesChart').getContext('2d'), { type: 'line', data: { labels: Object.keys(datesCount).sort(), datasets: [{ label: 'النشاط اليومي', data: Object.keys(datesCount).sort().map(d => datesCount[d]), borderColor: '#f39c12', tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false } });
    chartInstances.eval = new Chart(document.getElementById('evalChart').getContext('2d'), { type: 'doughnut', data: { labels: ['Excellent', 'Good', 'Poor', 'N/A', 'Blank'], datasets: [{ data: Object.values(evalsCount), backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'] }] }, options: { responsive: true, maintainAspectRatio: false } });
    
    const addContainer = document.getElementById('additional-tables-container');
    
    // قلب المصفوفة (العناصر صفوف والتقييمات أعمدة) لمنع التشوه في الـ PDF
    let extraHtml = `<div class="avoid-page-break" style="margin-top: 35px; direction: ltr;">
        <h3 style="color:#003366; text-align:center; margin-bottom:12px; font-size:1.2rem;">Safety Captain Survey Report Evaluation Matrix</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #777; font-size: 11px; text-align: center;">
            <thead>
                <tr style="background:#003366; color:#fff;">
                    <th style="padding: 8px; border: 1px solid #999; text-align:left; width: 40%;">Evaluation Criteria (عناصر التقييم)</th>
                    <th style="padding: 8px; border: 1px solid #999; background:#28a745;">Excellent</th>
                    <th style="padding: 8px; border: 1px solid #999; background:#ffc107; color:#000;">Good</th>
                    <th style="padding: 8px; border: 1px solid #999; background:#dc3545;">Poor</th>
                    <th style="padding: 8px; border: 1px solid #999; background:#6c757d;">N/A</th>
                    <th style="padding: 8px; border: 1px solid #999; background:#1a2a6c;">Blank</th>
                </tr>
            </thead><tbody>`;
            
    criteriaList.forEach(crit => {
        extraHtml += `<tr>
            <td style="padding: 6px 10px; border: 1px solid #ccc; text-align: left; font-weight: bold; background:#f9f9f9;">${crit}</td>
            <td style="padding: 6px; border: 1px solid #ccc; font-weight: bold; color: ${matrixScores["Excellent"][crit] > 0 ? '#28a745' : '#aaa'};">${matrixScores["Excellent"][crit] || 0}</td>
            <td style="padding: 6px; border: 1px solid #ccc; font-weight: bold; color: ${matrixScores["Good"][crit] > 0 ? '#ffc107' : '#aaa'};">${matrixScores["Good"][crit] || 0}</td>
            <td style="padding: 6px; border: 1px solid #ccc; font-weight: bold; color: ${matrixScores["Poor"][crit] > 0 ? '#dc3545' : '#aaa'};">${matrixScores["Poor"][crit] || 0}</td>
            <td style="padding: 6px; border: 1px solid #ccc; color: #555;">${matrixScores["N/A"][crit] || 0}</td>
            <td style="padding: 6px; border: 1px solid #ccc; color: #555;">${matrixScores["Blank"][crit] || 0}</td>
        </tr>`;
    });
    extraHtml += `</tbody></table></div>`;
    
    // الملاحظات
    extraHtml += `<div class="avoid-page-break" style="margin-top: 35px; direction: ltr; text-align: left;">
        <h3 style="color:#003366; margin-bottom:10px;">Captain Comments & Observations:</h3>
        <table class="avoid-page-break" style="width:100%; border-collapse: collapse; border: 1px solid #000; font-size: 11px;">
            <thead style="background: #e6e6e6;">
                <tr>
                    <th style="border: 1px solid #000; padding: 6px;">Airline</th>
                    <th style="border: 1px solid #000; padding: 6px;">FLTNO</th>
                    <th style="border: 1px solid #000; padding: 6px;">Type</th>
                    <th style="border: 1px solid #000; padding: 6px;">Date</th>
                    <th style="border: 1px solid #000; padding: 6px;">REG</th>
                    <th style="border: 1px solid #000; padding: 6px;">Comments</th>
                </tr>
            </thead><tbody>`;
            
    if (commentsList.length === 0) extraHtml += `<tr><td colspan="6" style="text-align: center;">No comments.</td></tr>`;
    else commentsList.forEach(s => { extraHtml += `<tr><td style="border: 1px solid #000; padding: 6px;">${s.CAR || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.Flight_NO || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.TYPE || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.Date ? String(s.Date).split('T')[0] : ''}</td><td style="border: 1px solid #000; padding: 6px;">${s.REG || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.Captain_Comments}</td></tr>`; });
    
    extraHtml += `</tbody></table></div>`; 
    addContainer.innerHTML = extraHtml;
}

function exportModernPDF() { html2pdf().set({ margin: 0.3, filename: 'Captain_Surveys_Report.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'portrait', unit: 'in', format: 'a4' }, pagebreak: { mode: 'css', avoid: ['tr', 'table', '.avoid-page-break'] } }).from(document.getElementById('printable-report')).save(); }

// ==========================================
// 4. الفحص اليومي الأيزو
// ==========================================
function buildDailyChecklist() {
    const grid = document.getElementById('checklist-container'); if (!grid) return; grid.innerHTML = ""; let checkIndex = 0;
    Object.keys(dailyChecklistDataISO).forEach(colKey => {
        let colData = dailyChecklistDataISO[colKey]; let colHTML = `<div class="checklist-column">`;
        const renderSection = (title, items) => {
            colHTML += `<div class="checklist-header">${title}</div>`;
            items.forEach(item => { let rOpts = responsibleDepts.map(d => `<option value="${d}">${d}</option>`).join(''); colHTML += `<div class="check-item"><div class="check-item-row"><input type="checkbox" id="chk_${checkIndex}" value="${title}|${item}" onchange="toggleInputs(${checkIndex})"><label for="chk_${checkIndex}">${item}</label></div><div id="inputs_${checkIndex}" class="check-inputs"><input type="text" id="note_${checkIndex}" placeholder="تفاصيل الملاحظة..."><div style="display:flex; gap:5px;"><input type="text" id="loc_${checkIndex}" placeholder="المكان..." style="flex:1;"><select id="resp_${checkIndex}" style="flex:1;"><option value="" disabled selected>الجهة...</option>${rOpts}</select></div></div></div>`; checkIndex++; });
        };
        renderSection(colData.title, colData.items); if (colData.title2) renderSection(colData.title2, colData.items2); if (colData.title3) renderSection(colData.title3, colData.items3);
        colHTML += `</div>`; grid.innerHTML += colHTML;
    });
}
buildDailyChecklist();
window.toggleInputs = function(idx) { const chk = document.getElementById('chk_' + idx), inputs = document.getElementById('inputs_' + idx); if (chk && inputs) inputs.style.display = chk.checked ? 'flex' : 'none'; };
function switchDailyTab(tab) { document.querySelectorAll('#daily-inspection-section .tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('#daily-inspection-section .tab-content').forEach(c => c.classList.remove('active')); document.getElementById('btn-daily-' + tab).classList.add('active'); document.getElementById('tab-daily-' + tab).classList.add('active'); }
function updateDailyNavCounter() { const el = document.getElementById('nav-daily-counter'); if(el) el.innerText = globalDailyInspections.length > 0 ? `${currentDailyIndex + 1} / ${globalDailyInspections.length}` : `0 / 0`; }
function clearDailyFormForNew() {
    currentDailyIndex = -1; isDailyEditMode = false; currentDailyEditId = null; document.getElementById('dailyForm').reset();
    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach(chk => chk.checked = false); document.querySelectorAll('.check-inputs').forEach(el => el.style.display = 'none');
    let btn = document.getElementById('submitDailyBtn'); if (btn) { btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الجولة'; btn.style.backgroundColor = "var(--primary)"; }
    let now = new Date().toISOString(); document.getElementById('dailyDate').value = now.split('T')[0]; document.getElementById('dailyTime').value = now.split('T')[1].substring(0, 5); updateDailyNavCounter();
}
function navDaily(direction) {
    if (!globalDailyInspections || globalDailyInspections.length === 0) return alert("لا توجد فحوصات مسجلة.");
    if (direction === 'first') currentDailyIndex = 0; else if (direction === 'last') currentDailyIndex = globalDailyInspections.length - 1;
    else if (direction === 'next' && currentDailyIndex < globalDailyInspections.length - 1) currentDailyIndex++; else if (direction === 'prev' && currentDailyIndex > 0) currentDailyIndex--;
    if (currentDailyIndex >= 0 && currentDailyIndex < globalDailyInspections.length) loadDailyInspectionToForm(currentDailyIndex);
}
function loadDailyInspectionToForm(idx) {
    if (idx < 0 || idx >= globalDailyInspections.length) return;
    currentDailyIndex = idx; isDailyEditMode = true; let rep = globalDailyInspections[idx]; currentDailyEditId = rep.id;
    document.getElementById('dailyDate').value = rep.date || ''; document.getElementById('dailyTime').value = rep.time || ''; document.getElementById('dailyShift').value = rep.shift || 'صباحي'; document.getElementById('dailyInspector').value = rep.inspector || '';
    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach(chk => chk.checked = false); document.querySelectorAll('.check-inputs').forEach(el => { el.style.display = 'none'; el.querySelectorAll('input').forEach(inp => inp.value = ''); });
    if (rep.findings && rep.findings.length > 0) {
        rep.findings.forEach(f => {
            document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, cIdx) => {
                let parts = chk.value.split('|'); if (parts[0] === f.category && parts[1] === f.item) {
                    chk.checked = true; toggleInputs(cIdx);
                    let noteEl = document.getElementById(`note_${cIdx}`), locEl = document.getElementById(`loc_${cIdx}`), respEl = document.getElementById(`resp_${cIdx}`);
                    if (noteEl) noteEl.value = f.note || f.Corrective_Action || ''; if (locEl) locEl.value = f.location || f.Location || ''; if (respEl) respEl.value = f.responsible || f.Responsible || '';
                }
            });
        });
    }
    let btn = document.getElementById('submitDailyBtn'); if (btn) { btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تحديث'; btn.style.backgroundColor = "#e67e22"; } updateDailyNavCounter(); window.scrollTo({ top: document.getElementById('dailyForm').offsetTop - 30, behavior: 'smooth' });
}
function submitDailyInspection(e) {
    if (e) e.preventDefault(); const btn = document.getElementById('submitDailyBtn'), msg = document.getElementById('dailyMsg'); let findings = [];
    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, idx) => { if (chk.checked) { let parts = chk.value.split('|'); findings.push({ category: parts[0], item: parts[1], location: document.getElementById(`loc_${idx}`).value || "-", responsible: document.getElementById(`resp_${idx}`).value || "-", note: document.getElementById(`note_${idx}`).value || "تالف", status: "مفتوح" }); } });
    let reportId = isDailyEditMode && currentDailyEditId ? currentDailyEditId : Date.now();
    let rep = { id: reportId, date: document.getElementById('dailyDate').value, time: document.getElementById('dailyTime').value, shift: document.getElementById('dailyShift').value, inspector: document.getElementById('dailyInspector').value, findings: findings };
    safePost({ action: isDailyEditMode ? "updateDailyInspection" : "submitDailyInspection", reportData: rep }, btn, msg, "تم الحفظ بنجاح!", () => {
        if (isDailyEditMode) { let existingIdx = globalDailyInspections.findIndex(r => String(r.id) === String(reportId)); if (existingIdx !== -1) globalDailyInspections[existingIdx] = rep; } else { globalDailyInspections.unshift(rep); } renderSavedDaily(); setTimeout(() => clearDailyFormForNew(), 1500);
    });
}
function renderSavedDaily() {
    const tbody = document.getElementById('saved-daily-tbody'); if (!tbody) return; tbody.innerHTML = "";
    globalDailyInspections.forEach((rep, idx) => { let fCount = rep.findings ? rep.findings.length : 0; let countBadge = fCount > 0 ? `<span style="color:#dc3545; font-weight:bold;">${fCount} ملاحظة</span>` : `<span style="color:#28a745; font-weight:bold;">سليم</span>`; tbody.innerHTML += `<tr><td dir="ltr">${rep.date || '-'}</td><td>${rep.time || '-'}</td><td>${rep.shift || '-'}</td><td>${rep.inspector || '-'}</td><td>${countBadge}</td><td><button type="button" onclick="loadDailyInspectionToForm(${idx})" style="background:#003366; color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">تعديل</button> <button type="button" onclick="deleteDailyInspectionRecord(${idx})" style="background:#dc3545; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`; });
}
function deleteDailyInspectionRecord(idx) { if (!confirm("تأكيد الحذف؟")) return; let repId = globalDailyInspections[idx].id; globalDailyInspections.splice(idx, 1); renderSavedDaily(); updateDailyNavCounter(); safePost({ action: "updateDailyInspection", reportData: { id: repId, findings: [] } }); }
function generateIsoDailyReport() {
    let targetD = document.getElementById('isoReportDate').value, targetS = document.getElementById('isoReportShift').value; if (!targetD) return alert("اختر تاريخ اليوم.");
    document.getElementById('iso-date-val').innerText = targetD.split('-').reverse().join(' / ');
    if (targetS === 'صباحي') { document.getElementById('iso-shift-am').innerHTML = '✔'; document.getElementById('iso-shift-pm').innerHTML = ''; } else { document.getElementById('iso-shift-am').innerHTML = ''; document.getElementById('iso-shift-pm').innerHTML = '✔'; }
    let rep = globalDailyInspections.find(r => String(r.date).split('T')[0] === targetD && r.shift === targetS); let findingList = rep && rep.findings ? rep.findings : [];
    const matrix = document.getElementById('iso-matrix-container'); matrix.innerHTML = "";
    let maxItemsCount = 0; Object.keys(dailyChecklistDataISO).forEach(colKey => { let count = 0, c = dailyChecklistDataISO[colKey]; count += (c.items ? c.items.length : 0) + (c.items2 ? c.items2.length : 0) + (c.items3 ? c.items3.length : 0); count += 1; if(c.title2) count += 1; if(c.title3) count += 1; if (count > maxItemsCount) maxItemsCount = count; });
    const flatLists = {}; Object.keys(dailyChecklistDataISO).forEach(colKey => { let c = dailyChecklistDataISO[colKey], arr = []; const injectSection = (title, items) => { arr.push({ isHeader: true, text: title }); items.forEach(it => { let cleanTitle = title.trim().replace(/\s+/g, ' '); let cleanItem = it.trim().replace(/\s+/g, ' '); let hasFinding = findingList.some(f => { let fCat = (f.category || "").trim().replace(/\s+/g, ' '); let fIt = (f.item || "").trim().replace(/\s+/g, ' '); return fCat === cleanTitle && fIt === cleanItem; }); arr.push({ isHeader: false, text: it, checked: !hasFinding }); }); }; injectSection(c.title, c.items); if (c.title2) injectSection(c.title2, c.items2); if (c.title3) injectSection(c.title3, c.items3); flatLists[colKey] = arr; });
    let matrixHtml = ""; for (let rowIdx = 0; rowIdx < maxItemsCount; rowIdx++) { Object.keys(dailyChecklistDataISO).forEach(colKey => { let cellData = flatLists[colKey][rowIdx]; if (cellData) { if (cellData.isHeader) { matrixHtml += `<div style="border: 0.5px solid #000; background:#e6e6e6; padding: 4px; font-weight: bold; text-align: center;">${cellData.text}</div>`; } else { let boxSign = cellData.checked ? "✔" : ""; let crossClass = cellData.checked ? "" : "text-decoration: line-through; color: #dc3545; font-weight: bold;"; matrixHtml += `<div style="border: 0.5px solid #000; padding: 3px 5px; display: flex; justify-content: space-between; align-items: center; background: #fff;"><span style="${crossClass}">${cellData.text}</span><span style="display:inline-block; width:12px; height:12px; border:1px solid #000; text-align:center; line-height:10px; font-size:9px; font-weight:bold; color: ${cellData.checked ? '#000' : '#dc3545'};">${boxSign}</span></div>`; } } else { matrixHtml += `<div style="border: 0.5px solid #000; background: #fff;"></div>`; } }); }
    matrix.innerHTML = matrixHtml; const isoFindingsThead = document.getElementById('iso-findings-tbody'); isoFindingsThead.innerHTML = "";
    if (findingList.length === 0) { isoFindingsThead.innerHTML = `<tr><td colspan="5" style="border: 1px solid #000; padding: 8px; text-align: center; color: green; font-weight: bold;">سليم 100% (لا توجد ملاحظات)</td></tr>`; } else { findingList.forEach((f, index) => { isoFindingsThead.innerHTML += `<tr><td style="border: 1px solid #000; padding: 4px;">0${index+1}</td><td style="border: 1px solid #000; padding: 4px;">${f.location || '-'}</td><td style="border: 1px solid #000; padding: 4px; text-align: right; color:#dc3545; font-weight: bold;">${f.category} - ${f.item} <br> <span style="color:#000; font-weight:normal;">(${f.note || 'ملاحظة عدم مطابقة'})</span></td><td style="border: 1px solid #000; padding: 4px;">${f.responsible || '-'}</td><td style="border: 1px solid #000; padding: 4px; color:#dc3545; font-weight: bold;">مفتوح</td></tr>`; }); }
    document.getElementById('printable-daily-report').style.display = 'block';
}
function exportIsoDailyPDF() { let el = document.getElementById('printable-daily-report'); if (el.style.display === 'none') return alert("قم بعرض النموذج أولاً"); let reportDate = document.getElementById('isoReportDate').value; html2pdf().set({ margin: 0.3, filename: `AS_F_01_01_${reportDate}.pdf`, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, pagebreak: { mode: 'css', avoid: ['tr', 'table', '#iso-matrix-container'] } }).from(el).save(); }

// ==========================================
// 5. سجل الحوادث
// ==========================================
function switchIncidentTab(tab) { document.querySelectorAll('#incident-section .tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('#incident-section .tab-content').forEach(c => c.classList.remove('active')); document.getElementById('btn-inc-' + tab).classList.add('active'); document.getElementById('tab-inc-' + tab).classList.add('active'); }
function updateIncidentNavCounter() { const el = document.getElementById('nav-incident-counter'); if(el) el.innerText = globalIncidents.length > 0 ? `${currentIncidentIndex + 1} / ${globalIncidents.length}` : `0 / 0`; }
function clearIncidentForm() { currentIncidentIndex = -1; currentIncidentEditId = null; document.getElementById('incidentForm').reset(); document.getElementById('incDate').value = new Date().toISOString().split('T')[0]; document.getElementById('submitIncBtn').innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الواقعة'; updateIncidentNavCounter(); }
function navIncidents(direction) {
    if (!globalIncidents || globalIncidents.length === 0) return alert("لا توجد وقائع مسجلة.");
    if (direction === 'first') currentIncidentIndex = 0; else if (direction === 'last') currentIncidentIndex = globalIncidents.length - 1; else if (direction === 'next' && currentIncidentIndex < globalIncidents.length - 1) currentIncidentIndex++; else if (direction === 'prev' && currentIncidentIndex > 0) currentIncidentIndex--;
    if (currentIncidentIndex >= 0 && currentIncidentIndex < globalIncidents.length) {
        let inc = globalIncidents[currentIncidentIndex]; currentIncidentEditId = inc.ID || inc.id;
        document.getElementById('incDate').value = inc.Date ? String(inc.Date).split('T')[0] : ''; document.getElementById('incTime').value = inc.Time || ''; document.getElementById('incLocation').value = inc.Location || ''; document.getElementById('incCar').value = inc.CAR || ''; document.getElementById('incFlightNo').value = inc.Flight_No || ''; document.getElementById('incReg').value = inc.REG || ''; document.getElementById('incChar').value = inc.Characterization || 'Equipment Accident'; document.getElementById('incRiskSev').value = inc.Risk_Severity || 'Minor'; document.getElementById('incDesc').value = inc.Description || ''; document.getElementById('submitIncBtn').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تعديل الواقعة'; updateIncidentNavCounter();
    }
}
function submitIncident(e) {
    e.preventDefault(); const btn = document.getElementById('submitIncBtn'), msg = document.getElementById('incMsg'); let isEdit = currentIncidentEditId !== null, newId = isEdit ? currentIncidentEditId : "INC-" + Date.now();
    let incObj = { id: newId, date: document.getElementById('incDate').value, time: document.getElementById('incTime').value, location: document.getElementById('incLocation').value, personnel: document.getElementById('incPersonnel').value, equipmentNo: document.getElementById('incEquipmentNo').value, driver: document.getElementById('incDriver').value, eqOwner: document.getElementById('incEqOwner').value, status: document.getElementById('incStatus').value, causes: document.getElementById('incCauses').value, charaterization: document.getElementById('incChar').value, riskSeverity: document.getElementById('incRiskSev').value, riskProb: document.getElementById('incRiskProb').value, car: document.getElementById('incCar').value, flightNo: document.getElementById('incFlightNo').value, reg: document.getElementById('incReg').value, orgVia: document.getElementById('incOrgVia').value, viaDst: document.getElementById('incViaDst').value, preparedBy: document.getElementById('incPreparedBy').value, hazardDesc: document.getElementById('incHazardDesc').value, description: document.getElementById('incDesc').value, actionTaken: document.getElementById('incAction').value, recommendation: document.getElementById('incRecommendation').value, position: document.getElementById('incPosition').value, injuryType: document.getElementById('incInjuryType').value, causesDetails: "" };
    safePost({ action: isEdit ? "updateIncident" : "submitIncident", incidentData: incObj }, btn, msg, "تم الحفظ بنجاح!", () => {
        let mapped = { ID: incObj.id, Date: incObj.date, Time: incObj.time, Location: incObj.location, Characterization: incObj.charaterization, Risk_Severity: incObj.riskSeverity, Prepared_By: incObj.preparedBy };
        if (isEdit) { let idx = globalIncidents.findIndex(i => (i.ID || i.id) === newId); if (idx !== -1) globalIncidents[idx] = mapped; } else { globalIncidents.unshift(mapped); }
        renderSavedIncidents(); setTimeout(() => clearIncidentForm(), 1500);
    });
}
function renderSavedIncidents() { const tbody = document.getElementById('saved-inc-tbody'); if (!tbody) return; tbody.innerHTML = ""; globalIncidents.forEach((inc, idx) => { tbody.innerHTML += `<tr><td dir="ltr">${inc.Date ? String(inc.Date).split('T')[0] : '-'}</td><td>${inc.Location || '-'}</td><td>${inc.Characterization || '-'}</td><td>${inc.Risk_Severity || '-'}</td><td>${inc.Prepared_By || '-'}</td><td><button onclick="deleteIncidentRecord(${idx})" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; border-radius:4px;"><i class="fa-solid fa-trash"></i></button></td></tr>`; }); }
function deleteIncidentRecord(idx) { if(!confirm("تأكيد الحذف؟")) return; let item = globalIncidents[idx]; globalIncidents.splice(idx, 1); renderSavedIncidents(); safePost({ action: "deleteIncident", id: item.ID || item.id }); }

// ==========================================
// 6. الـ SPI
// ==========================================
function switchSpiTab(tab) { document.querySelectorAll('#spi-section .tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('#spi-section .tab-content').forEach(c => c.classList.remove('active')); document.getElementById('btn-spi-' + tab).classList.add('active'); document.getElementById('tab-spi-' + tab).classList.add('active'); }
function buildSpiEntryForm() { const container = document.getElementById('spi-dynamic-inputs'); if(!container) return; container.innerHTML = ''; spiCategories.forEach(cat => { let catHtml = `<h4 style="color:#28a745; margin-top:20px; border-bottom:2px solid #eee;">${cat.name}</h4><div class="form-grid">`; cat.items.forEach((spi) => { let safeId = "spi_" + spi.replace(/[^a-zA-Z0-9]/g, ''); catHtml += `<div class="form-group"><label style="font-size:0.8rem; direction:ltr;">${spi}</label><input type="number" id="${safeId}" data-spi="${spi}" value="0" min="0" required></div>`; }); catHtml += `</div>`; container.innerHTML += catHtml; }); }
function submitSPI(e) {
    e.preventDefault(); const btn = document.getElementById('submitSpiBtn'), msg = document.getElementById('spiMsg'); let movementsVal = parseInt(document.getElementById('spiMovements').value) || 0, monthData = { "Movements": movementsVal };
    document.querySelectorAll('#spi-dynamic-inputs input[type="number"]').forEach(input => { monthData[input.getAttribute('data-spi')] = parseInt(input.value) || 0; });
    let spiDataObj = { id: "SPI-" + Date.now(), year: document.getElementById('spiYear').value, month: document.getElementById('spiMonth').value, group: "ECAA_SPI_Matrix", name: "OperationalSPI", target: "0", actual: JSON.stringify(monthData), status: "Submitted", actionPlan: movementsVal.toString(), preparedBy: "Safety Officer" };
    safePost({ action: "submitSPI", spiData: spiDataObj }, btn, msg, "تم الحفظ!", () => { globalSpiData.push({ Year: spiDataObj.year, Month: spiDataObj.month, Indicator_Name: spiDataObj.name, Actual_Value: spiDataObj.actual }); document.getElementById('spiForm').reset(); });
}
function generateSpiReport() {
    const container = document.getElementById('spi-matrix-container'); let selectedYear = document.getElementById('spiReportYear').value, monthlySpiParsed = {};
    globalSpiData.forEach(row => { if (row.Indicator_Name === "OperationalSPI" && String(row.Year) === selectedYear) { try { monthlySpiParsed[row.Month] = JSON.parse(row.Actual_Value); } catch (e) {} } });
    let tableHtml = `<table class="report-table spi-matrix-table" style="min-width: 800px; font-size:12px;"><thead><tr><th>Safety issue / SPI</th><th>JAN</th><th>FEB</th><th>MAR</th><th>APR</th><th>MAY</th><th>JUN</th><th>JUL</th><th>AUG</th><th>SEP</th><th>OCT</th><th>NOV</th><th>DEC</th><th style="background:#003366; color:#fff;">Total Events</th></tr></thead><tbody><tr><td>Number of aircraft movements</td>`;
    let totalMov = 0, movDataForChart = []; for (let i = 1; i <= 12; i++) { let m = monthlySpiParsed[i] ? monthlySpiParsed[i].Movements || 0 : 0; totalMov += m; movDataForChart.push(m); tableHtml += `<td style="font-weight:bold; background:#e8f5e9;">${m || '-'}</td>`; } tableHtml += `<td style="font-weight:bold; background:#003366; color:#fff;">${totalMov}</td></tr>`;
    spiCategories.forEach(cat => { tableHtml += `<tr><td colspan="14" style="background:#f4fcf6; color:#28a745; font-weight:bold; text-align:right;">${cat.name}</td></tr>`; cat.items.forEach(spi => { let totalSpi = 0; let rowHtml = `<tr><td>${spi}</td>`; for (let i = 1; i <= 12; i++) { let val = monthlySpiParsed[i] ? monthlySpiParsed[i][spi] || 0 : 0; totalSpi += val; rowHtml += `<td>${val || '-'}</td>`; } rowHtml += `<td style="font-weight:bold; color:#003366;">${totalSpi}</td></tr>`; tableHtml += rowHtml; }); });
    tableHtml += `</tbody></table>`; container.innerHTML = tableHtml;
    if(window.spiChartInstance) window.spiChartInstance.destroy(); window.spiChartInstance = new Chart(document.getElementById('spiTrendChart').getContext('2d'), { type: 'line', data: { labels: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"], datasets: [{ label: 'Aircraft Movements', data: movDataForChart, borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.2)', tension: 0.3, fill: true }] }, options: { responsive: true, maintainAspectRatio: false } });
}

// ==========================================
// 7. الـ FOD
// ==========================================
function switchFodTab(tab) { document.querySelectorAll('#fod-section .tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('#fod-section .tab-content').forEach(c => c.classList.remove('active')); document.getElementById('btn-fod-' + tab).classList.add('active'); document.getElementById('tab-fod-' + tab).classList.add('active'); }
function generateFodInputRows() { const month = document.getElementById('fodInputMonth').value; if(!month) return alert("اختر الشهر"); document.getElementById('fodForm').style.display = 'block'; const tbody = document.getElementById('fod-input-tbody'); tbody.innerHTML = ''; fodLocations.forEach((item, index) => { tbody.innerHTML += `<tr><td><input type="date" id="fod_date_${index}" required style="width:100%;"></td><td><b>${item.loc}</b></td><td>${item.area}</td><td><input type="number" step="0.001" id="fod_p_${index}" required style="width:100%;"></td><td><input type="number" step="0.001" id="fod_m_${index}" required style="width:100%;"></td></tr>`; }); }
function submitFOD(e) {
    if (e) e.preventDefault(); const btn = document.getElementById('submitFodBtn'), msg = document.getElementById('fodMsg'); let fodDataArray = [], localFodArray = [];
    fodLocations.forEach((item, index) => { let d = document.getElementById(`fod_date_${index}`).value, p = parseFloat(document.getElementById(`fod_p_${index}`).value) || 0, m = parseFloat(document.getElementById(`fod_m_${index}`).value) || 0, newId = "FOD-" + Date.now() + "-" + index; fodDataArray.push({ id: newId, date: d, location: item.loc, area: item.area, plastic: p, metal: m }); localFodArray.push({ ID: newId, Date: d, Location: item.loc, Area: item.area, Plastic: p, Metal: m }); });
    safePost({ action: "submitBulkFOD", fodDataArray: fodDataArray }, btn, msg, "تم الحفظ!", () => { globalFod = [...globalFod, ...localFodArray]; setTimeout(() => { document.getElementById('fodForm').style.display = 'none'; }, 1500); });
}
function generateFodPrintReport() {
    const m = document.getElementById('fodReportMonth').value; if (!m) return alert("اختر الشهر");
    let filtered = globalFod.filter(f => { let rawDate = f.Date || f.date || ''; return (typeof rawDate === 'string' ? rawDate : new Date(rawDate).toISOString()).split('T')[0].startsWith(m); });
    const tbody = document.getElementById('fod-print-tbody'); tbody.innerHTML = ''; let totalP = 0, totalM = 0;
    fodLocations.forEach(locItem => { let rec = filtered.find(f => (f.Location || f.location) === locItem.loc), p = rec ? parseFloat(rec.Plastic || rec.plastic || 0) : 0, met = rec ? parseFloat(rec.Metal || rec.metal || 0) : 0; totalP += p; totalM += met; tbody.innerHTML += `<tr><td style="border:1px solid #777; padding:12px;">${rec ? String(rec.Date||rec.date).split('T')[0] : '---'}</td><td style="border:1px solid #777; padding:12px;">${locItem.loc}</td><td style="border:1px solid #777; padding:12px;">${locItem.area}</td><td style="border:1px solid #777; padding:12px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td><td style="border:1px solid #777; padding:12px;">${met > 0 ? met.toFixed(3) + ' kg' : '---'}</td><td style="border:1px solid #777; padding:12px;">---</td></tr>`; });
    tbody.innerHTML += `<tr style="background:#fafafa; font-weight:bold;"><td colspan="3" style="border:1px solid #777; padding:12px;">Total</td><td style="border:1px solid #777; padding:12px;">${totalP.toFixed(3)} kg</td><td style="border:1px solid #777; padding:12px;">${totalM.toFixed(3)} kg</td><td style="border:1px solid #777; padding:12px;">${(totalP+totalM).toFixed(3)} kg</td></tr>`; document.getElementById('printable-fod-report').style.display = 'block';
}
function exportFodPDF() { html2pdf().set({ margin: 0.2, filename: 'FOD_Report.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' }, pagebreak: { avoid: ['tr', 'table'] } }).from(document.getElementById('printable-fod-report')).save(); }

// ==========================================
// 8. التقرير الشهري المجمع
// ==========================================
function formatTrendDifference(diffVal, isHigherBetter, unit = "") {
    let num = parseFloat(diffVal); if (isNaN(num) || num === 0) return `<span style="color: #6c757d; font-weight: bold;">0 ${unit} <i class="fa-solid fa-arrows-left-right"></i></span>`;
    let isPositiveDiff = num > 0, formattedVal = Math.abs(num).toFixed(unit.includes("KG") ? 3 : 0), isGoodOutcome = isHigherBetter ? isPositiveDiff : !isPositiveDiff, color = isGoodOutcome ? "#28a745" : "#dc3545", arrowIcon = isPositiveDiff ? "fa-arrow-up" : "fa-arrow-down";
    return `<span style="color: ${color}; font-weight: bold; direction: ltr; display: inline-flex; align-items: center; gap: 4px;">${formattedVal} ${unit} <i class="fa-solid ${arrowIcon}"></i></span>`;
}
function getPreviousMonthStr(monthStr) { let [year, month] = monthStr.split('-'); let d = new Date(year, parseInt(month) - 2); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function getMonthlyDetailedStats(monthStr) {
    let [y, m] = monthStr.split('-'), mNum = parseInt(m).toString(), stats = { monthStr: monthStr, movements: 0, accidents: 0, incidents: 0, findingsTotal: 0, findingsOpen: 0, findingsClosed: 0, surveys: [], fodTotal: 0, incidentsList: [], findingsByDept: {} };
    let spiRow = globalSpiData.find(r => String(r.Year) === String(y) && String(r.Month) === mNum && r.Indicator_Name === "OperationalSPI"); if (spiRow) { try { let parsed = JSON.parse(spiRow.Actual_Value); stats.movements = parseInt(parsed.Movements) || 0; } catch(e){} }
    globalIncidents.forEach(inc => { let iDate = inc.Date ? String(inc.Date).split('T')[0] : ''; if (iDate.startsWith(monthStr)) { if (inc.Risk_Severity === 'Catastrophic') stats.accidents++; else stats.incidents++; stats.incidentsList.push(inc); } });
    globalDailyInspections.forEach(d => { let dDate = d.date ? String(d.date).split('T')[0] : ''; if (dDate.startsWith(monthStr)) { d.findings.forEach(f => { stats.findingsTotal++; if (f.status === 'مغلق') stats.findingsClosed++; else stats.findingsOpen++; stats.findingsByDept[f.responsible || f.Responsible] = (stats.findingsByDept[f.responsible || f.Responsible] || 0) + 1; }); } });
    globalSurveys.forEach(s => { let sDate = s.Date ? String(s.Date).split('T')[0] : ''; if (sDate.startsWith(monthStr)) stats.surveys.push(s); });
    globalFod.forEach(f => { let rawDate = f.Date || f.date || '', fDate = (typeof rawDate === 'string') ? rawDate.split('T')[0] : new Date(rawDate).toISOString().split('T')[0]; if (fDate.startsWith(monthStr)) { let p = parseFloat(f.Plastic || f.plastic || 0), met = parseFloat(f.Metal || f.metal || 0); stats.fodTotal += (p + met); } });
    return stats;
}
function generateFullMonthlyReport() {
    const currMonthStr = document.getElementById('mainReportMonth').value; if (!currMonthStr) return alert("اختر الشهر أولاً!");
    const prevMonthStr = getPreviousMonthStr(currMonthStr), currDateObj = new Date(currMonthStr + "-01"), prevDateObj = new Date(prevMonthStr + "-01");
    document.getElementById('mr-title-date').innerText = currDateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('th-curr-month').innerText = currDateObj.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
    document.getElementById('th-prev-month').innerText = prevDateObj.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
    let currStats = getMonthlyDetailedStats(currMonthStr), prevStats = getMonthlyDetailedStats(prevMonthStr);
    const tbody = document.getElementById('mr-general-tbody'); tbody.innerHTML = '';
    const kpiComparisonList = [ { label: "1- عدد التحركات الجوية", prev: prevStats.movements, curr: currStats.movements, higherBetter: true, unit: "" }, { label: "2- عدد الحوادث", prev: prevStats.accidents, curr: currStats.accidents, higherBetter: false, unit: "" }, { label: "3- عدد الوقائع", prev: prevStats.incidents, curr: currStats.incidents, higherBetter: false, unit: "" }, { label: "4- حالات عدم المطابقة (الإجمالي)", prev: prevStats.findingsTotal, curr: currStats.findingsTotal, higherBetter: false, unit: "" }, { label: "5- حالات عدم المطابقة المعلقة", prev: prevStats.findingsOpen, curr: currStats.findingsOpen, higherBetter: false, unit: "" }, { label: "6- حالات عدم المطابقة التي تم تلافيها", prev: prevStats.findingsClosed, curr: currStats.findingsClosed, higherBetter: true, unit: "" }, { label: "7- استبيان الطيارين", prev: prevStats.surveys.length, curr: currStats.surveys.length, higherBetter: true, unit: "" }, { label: "8- كمية F.O.D (بلاستيك + معدن)", prev: prevStats.fodTotal, curr: currStats.fodTotal, higherBetter: false, unit: "KG", isFloat: true } ];
    kpiComparisonList.forEach(item => { let diff = item.curr - item.prev, trendHtml = formatTrendDifference(diff, item.higherBetter, item.unit), currDisplay = item.isFloat ? item.curr.toFixed(3) + " " + item.unit : item.curr, prevDisplay = item.isFloat ? item.prev.toFixed(3) + " " + item.unit : item.prev; tbody.innerHTML += `<tr><td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${item.label}</td><td style="border: 1px solid #000; padding: 8px; direction: ltr;">${prevDisplay}</td><td style="border: 1px solid #000; padding: 8px; direction: ltr; font-weight: bold; background: #fdfdfd;">${currDisplay}</td><td style="border: 1px solid #000; padding: 8px; text-align: center;">${trendHtml}</td></tr>`; });
    if (monthlyChart1) monthlyChart1.destroy(); if (monthlyChart2) monthlyChart2.destroy(); Chart.defaults.font.family = "'Cairo', sans-serif";
    monthlyChart1 = new Chart(document.getElementById('mrChart1').getContext('2d'), { type: 'bar', data: { labels: Object.keys(currStats.findingsByDept), datasets: [{ label: 'المخاطر طبقاً للإدارة', data: Object.values(currStats.findingsByDept), backgroundColor: '#003366', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false } });
    let incTypesCount = {}; currStats.incidentsList.forEach(inc => { let cat = inc.Characterization ? inc.Characterization.split('/')[0].trim() : 'Other'; incTypesCount[cat] = (incTypesCount[cat] || 0) + 1; });
    monthlyChart2 = new Chart(document.getElementById('mrChart2').getContext('2d'), { type: 'bar', data: { labels: Object.keys(incTypesCount), datasets: [{ label: 'الوقائع', data: Object.values(incTypesCount), backgroundColor: '#dc3545', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false } });
    
    document.getElementById('printable-main-report').style.display = 'block';
}
function exportMainReportPDF() { const el = document.getElementById('printable-main-report'); if(el.style.display === 'none') return alert("قم بتجهيز التقرير أولاً!"); window.scrollTo(0, 0); html2pdf().set({ margin: 0.3, filename: 'Monthly_Report.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(el).save(); }

// ==========================================
// 9. الدليل والمستخدمين والأسطول
// ==========================================
function populateUsersDropdown(arr) { const datalist = document.getElementById('usersList'), userInp = document.getElementById('loginUser'); if (!datalist) return; datalist.innerHTML = ''; arr.forEach(u => { let opt = document.createElement('option'); opt.value = u.Username; datalist.appendChild(opt); }); if (userInp) userInp.value = "Admin"; }
function renderDirectory() { const tbody = document.getElementById('directory-tbody'); if (!tbody) return; tbody.innerHTML = ""; globalDirectory.forEach((item, i) => { tbody.innerHTML += `<tr><td>${i+1}</td><td>${item.Name||'-'}</td><td>${item.Role||'-'}</td><td dir="ltr">${item.Ext||'-'}</td><td dir="ltr">${item.Mobile||'-'}</td><td>-</td></tr>`; }); }
function filterDirectory() { let val = document.getElementById('dirSearch').value.toLowerCase(), tbody = document.getElementById('directory-tbody'); tbody.innerHTML = ''; globalDirectory.forEach((item, i) => { if((item.Name||'').toLowerCase().includes(val) || (item.Role||'').toLowerCase().includes(val)) tbody.innerHTML += `<tr><td>${i+1}</td><td>${item.Name||'-'}</td><td>${item.Role||'-'}</td><td dir="ltr">${item.Ext||'-'}</td><td dir="ltr">${item.Mobile||'-'}</td><td>-</td></tr>`; }); }
function openDirModal() { document.getElementById('dirModal').style.display = 'flex'; } function closeDirModal() { document.getElementById('dirModal').style.display = 'none'; }
function saveDirEntry(e) { e.preventDefault(); let obj = { id: "DIR-"+Date.now(), dept: document.getElementById('dirDept').value, name: document.getElementById('dirName').value, role: document.getElementById('dirRole').value, ext: document.getElementById('dirExt').value, mobile: document.getElementById('dirMobile').value }; safePost({ action: "manageDirectory", subAction: "add", dirData: obj }, document.getElementById('dirSubmitBtn'), document.getElementById('dirMsg'), "تم الحفظ!", () => { globalDirectory.push(obj); renderDirectory(); document.getElementById('dirForm').reset(); setTimeout(() => closeDirModal(), 1000); }); }
function openFleetModal() { document.getElementById('addModal').style.display = 'flex'; } function closeAddModal() { document.getElementById('addModal').style.display = 'none'; }
function saveNewAircraft() { let reg = document.getElementById('newReg').value.toUpperCase(), type = document.getElementById('newType').value.toUpperCase(), airline = document.getElementById('newAirline').value.toUpperCase(); safePost({ action: "addNewAircraft", reg: reg, acType: type, airline: airline, handling: document.getElementById('newHandling').value, country: document.getElementById('newCountry').value }, document.querySelector('#addModal .submit-btn'), document.getElementById('modalMsg'), "تم!", () => { globalFleetData.unshift({REG: reg, TYPE: type, CAR: airline}); setTimeout(() => { closeAddModal(); document.getElementById('newReg').value=""; }, 1000); }); }
function addUser(e) { e.preventDefault(); let role = document.getElementById('newUserRole').value, user = document.getElementById('newUsername').value, pass = document.getElementById('newUserPass').value; safePost({ action: "addUser", role: role, username: user, password: pass }, document.querySelector('#account-management-section .submit-btn'), document.getElementById('userMsg'), "تم!", () => { globalUsers.push({Role: role, Username: user, Password: pass}); document.getElementById('users-tbody').innerHTML += `<tr><td>#</td><td>${role}</td><td>${user}</td><td>${pass}</td></tr>`; }); }
