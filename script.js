const API_URL = "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";
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
let currentSurveyIndex = -1, currentDailyIndex = -1, currentIncidentIndex = -1, isDailyEditMode = false, currentDailyEditId = null, currentIncidentEditId = null;
let chartInstances = {}, monthlyChart1 = null, monthlyChart2 = null, mrSurveyAirChartInstance = null, mrSurveyEvalChartInstance = null;

// ==========================================
// 1. شاشة البداية والدخول
// ==========================================
let isAppLoaded = false;
// دالة عرض شاشة الدخول ومنع ظهور لوحة التحكم بعد السبلاش سكرين
function finishLoading(){if(isAppLoaded)return;isAppLoaded=true;try{const splash=document.getElementById('splash-screen'),loginScreen=document.getElementById('login-screen'),passInp=document.getElementById('loginPass'),header=document.getElementById('app-header');if(header)header.style.display='none';if(loginScreen)loginScreen.style.display='flex';if(splash){splash.classList.add('smoke-out');setTimeout(()=>{splash.style.display='none';if(passInp)passInp.focus();},800);}else if(passInp){passInp.focus();}}catch(e){console.error(e);}}

// دالة إظهار وإخفاء كلمة المرور في نافذة الدخول
function toggleLoginPassword(){const p=document.getElementById('loginPass'),i=document.getElementById('passToggleIcon');if(!p||!i)return;if(p.type==='password'){p.type='text';i.classList.remove('fa-eye');i.classList.add('fa-eye-slash');}else{p.type='password';i.classList.remove('fa-eye-slash');i.classList.add('fa-eye');}}

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
function openAdminSection(sectionId) { let pass = prompt("🔒 برجاء إدخال كلمة المرور:"); if (pass === "1234") openSection(sectionId); else if (pass !== null) alert("❌ كلمة المرور غير صحيحة!"); }
function openGenericDoc(title) { document.getElementById('generic-doc-title').innerText = title; openSection('generic-doc-section'); }

// ==========================================
// 2. تحميل البيانات
// ==========================================
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
                globalSpiData = data.spi || [];
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
        } catch (e) { console.error(e); } 
        delete window[callbackName];
    };
    const script = document.createElement('script'); script.src = API_URL + "?action=getAppData&_t=" + Date.now() + "&callback=" + callbackName; document.body.appendChild(script);
}
loadAppDataInit();

// ==========================================
// 3. استبيان الكابتن
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
    criteriaList.forEach((crit, index) => { container.innerHTML += `<div class="eval-card"><div class="eval-title">${crit}</div><div class="radio-group"><input type="radio" id="c${index}_e" name="${crit}" value="Excellent" checked><label for="c${index}_e" class="lbl-e">E</label><input type="radio" id="c${index}_g" name="${crit}" value="Good"><label for="c${index}_g" class="lbl-g">G</label><input type="radio" id="c${index}_p" name="${crit}" value="Poor"><label for="c${index}_p" class="lbl-p">P</label><input type="radio" id="c${index}_n" name="${crit}" value="N/A"><label for="c${index}_n" class="lbl-n">N/A</label><input type="radio" id="c${index}_b" name="${crit}" value="Blank"><label for="c${index}_b" class="lbl-b">B</label></div></div>`; });
}
buildEvaluationForm();
function switchTab(tab) { document.querySelectorAll('#captain-survey-section .tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('#captain-survey-section .tab-content').forEach(c => c.classList.remove('active')); document.getElementById('btn-' + tab).classList.add('active'); document.getElementById('tab-' + tab).classList.add('active'); }
function setupCustomDropdown() {
    const input = document.getElementById('reg'), arrow = document.getElementById('regArrowBtn'), list = document.getElementById('regDropdownList');
    if (input && arrow && list) { arrow.addEventListener('click', (e) => { e.stopPropagation(); list.classList.toggle('show'); filterRegOptions(true); }); input.addEventListener('input', () => { list.classList.add('show'); filterRegOptions(false); }); document.addEventListener('click', () => list.classList.remove('show')); }
}
setupCustomDropdown();
function filterRegOptions(showAll) {
    const input = document.getElementById('reg'), list = document.getElementById('regDropdownList'); let val = input.value.toUpperCase(); list.innerHTML = '';
    let matched = showAll ? globalFleetData : globalFleetData.filter(a => String(a.REG).toUpperCase().includes(val));
    matched.forEach(a => { let div = document.createElement('div'); div.className = 'custom-dropdown-item'; div.innerHTML = `${a.REG} <span style="font-size:0.75rem; color:#777; float:right;">${a.CAR}</span>`; div.onclick = () => { input.value = a.REG; document.getElementById('airline').value = a.CAR || ""; document.getElementById('acType').value = a.TYPE || ""; list.classList.remove('show'); }; list.appendChild(div); });
}

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
    
    let extraHtml = `<div class="avoid-page-break" style="margin-top: 35px; direction: ltr;"><h3 style="color:#003366; text-align:center; margin-bottom:12px; font-size:1.2rem;">Safety Captain Survey Report Evaluation Matrix</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #777; font-size: 11px; text-align: center;">
            <thead><tr style="background:#003366; color:#fff;"><th style="padding: 8px; border: 1px solid #999; text-align:left; width: 40%;">Evaluation Criteria (عناصر التقييم)</th><th style="padding: 8px; border: 1px solid #999; background:#28a745;">Excellent</th><th style="padding: 8px; border: 1px solid #999; background:#ffc107; color:#000;">Good</th><th style="padding: 8px; border: 1px solid #999; background:#dc3545;">Poor</th><th style="padding: 8px; border: 1px solid #999; background:#6c757d;">N/A</th><th style="padding: 8px; border: 1px solid #999; background:#1a2a6c;">Blank</th></tr></thead><tbody>`;
    criteriaList.forEach(crit => {
        extraHtml += `<tr><td style="padding: 6px 10px; border: 1px solid #ccc; text-align: left; font-weight: bold; background:#f9f9f9;">${crit}</td><td style="padding: 6px; border: 1px solid #ccc; font-weight: bold; color: ${matrixScores["Excellent"][crit] > 0 ? '#28a745' : '#aaa'};">${matrixScores["Excellent"][crit] || 0}</td><td style="padding: 6px; border: 1px solid #ccc; font-weight: bold; color: ${matrixScores["Good"][crit] > 0 ? '#ffc107' : '#aaa'};">${matrixScores["Good"][crit] || 0}</td><td style="padding: 6px; border: 1px solid #ccc; font-weight: bold; color: ${matrixScores["Poor"][crit] > 0 ? '#dc3545' : '#aaa'};">${matrixScores["Poor"][crit] || 0}</td><td style="padding: 6px; border: 1px solid #ccc; color: #555;">${matrixScores["N/A"][crit] || 0}</td><td style="padding: 6px; border: 1px solid #ccc; color: #555;">${matrixScores["Blank"][crit] || 0}</td></tr>`;
    });
    extraHtml += `</tbody></table></div>`;
    
    extraHtml += `<div class="avoid-page-break" style="margin-top: 35px; direction: ltr; text-align: left;"><h3 style="color:#003366; margin-bottom:10px;">Captain Comments & Observations:</h3><table class="avoid-page-break" style="width:100%; border-collapse: collapse; border: 1px solid #000; font-size: 11px;"><thead style="background: #e6e6e6;"><tr><th style="border: 1px solid #000; padding: 6px;">Airline</th><th style="border: 1px solid #000; padding: 6px;">FLTNO</th><th style="border: 1px solid #000; padding: 6px;">Type</th><th style="border: 1px solid #000; padding: 6px;">Date</th><th style="border: 1px solid #000; padding: 6px;">REG</th><th style="border: 1px solid #000; padding: 6px;">Comments</th></tr></thead><tbody>`;
    if (commentsList.length === 0) extraHtml += `<tr><td colspan="6" style="text-align: center;">No comments.</td></tr>`;
    else commentsList.forEach(s => { extraHtml += `<tr><td style="border: 1px solid #000; padding: 6px;">${s.CAR || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.Flight_NO || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.TYPE || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.Date ? String(s.Date).split('T')[0] : ''}</td><td style="border: 1px solid #000; padding: 6px;">${s.REG || '-'}</td><td style="border: 1px solid #000; padding: 6px;">${s.Captain_Comments}</td></tr>`; });
    extraHtml += `</tbody></table></div>`; 
    document.getElementById('additional-tables-container').innerHTML = extraHtml;
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

function updateDailyNavCounter() { const el = document.getElementById('nav-daily-counter'); if (el) el.innerText = globalDailyInspections.length > 0 ? `${currentDailyIndex + 1} / ${globalDailyInspections.length}` : `0 / 0`; }

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
    let targetD = document.getElementById('isoReportDate').value;
    let targetS = document.getElementById('isoReportShift').value; 
    
    if (!targetD) return alert("اختر تاريخ اليوم أولاً لإصدار التقرير.");

    let rep = globalDailyInspections.find(r => {
        let rDateStr = String(r.date).split('T')[0]; 
        return rDateStr === targetD && r.shift === targetS;
    });

    if (!rep) {
        alert("لا توجد جولة تفتيش محفوظة بهذا التاريخ وهذه الوردية! تأكد من حفظ الجولة في قاعدة البيانات أولاً.");
        document.getElementById('printable-daily-report').style.display = 'none';
        return;
    }

    document.getElementById('iso-date-val').innerText = targetD.split('-').reverse().join(' / ');
    
    if (targetS === 'صباحي') { 
        document.getElementById('iso-shift-am').innerHTML = '✔'; 
        document.getElementById('iso-shift-pm').innerHTML = ''; 
    } else { 
        document.getElementById('iso-shift-am').innerHTML = ''; 
        document.getElementById('iso-shift-pm').innerHTML = '✔'; 
    }

    let findingList = rep.findings || [];
    const matrix = document.getElementById('iso-matrix-container'); 
    matrix.innerHTML = "";
    
    let maxItemsCount = 0; 
    Object.keys(dailyChecklistDataISO).forEach(colKey => { 
        let count = 0, c = dailyChecklistDataISO[colKey]; 
        count += (c.items ? c.items.length : 0) + (c.items2 ? c.items2.length : 0) + (c.items3 ? c.items3.length : 0); 
        count += 1; if(c.title2) count += 1; if(c.title3) count += 1; 
        if (count > maxItemsCount) maxItemsCount = count; 
    });

    const flatLists = {}; 
    Object.keys(dailyChecklistDataISO).forEach(colKey => { 
        let c = dailyChecklistDataISO[colKey], arr = []; 
        const injectSection = (title, items) => { 
            arr.push({ isHeader: true, text: title }); 
            items.forEach(it => { 
                let hasFinding = findingList.some(f => (f.category || "").trim() === title.trim() && (f.item || "").trim() === it.trim());
                arr.push({ isHeader: false, text: it, isSafe: !hasFinding }); 
            }); 
        }; 
        injectSection(c.title, c.items); 
        if (c.title2) injectSection(c.title2, c.items2); 
        if (c.title3) injectSection(c.title3, c.items3); 
        flatLists[colKey] = arr; 
    });

    let matrixHtml = ""; 
    for (let rowIdx = 0; rowIdx < maxItemsCount; rowIdx++) { 
        Object.keys(dailyChecklistDataISO).forEach(colKey => { 
            let cellData = flatLists[colKey][rowIdx]; 
            if (cellData) { 
                if (cellData.isHeader) { 
                    matrixHtml += `<div style="border: 1px solid #000; background:#e6e6e6; padding: 4px; font-weight: bold; text-align: center;">${cellData.text}</div>`; 
                } else { 
                    let boxSign = cellData.isSafe ? "✔" : "✘"; 
                    let boxColor = cellData.isSafe ? "#000" : "#dc3545";
                    let textColor = cellData.isSafe ? "#000" : "#dc3545";
                    let textDecor = cellData.isSafe ? "none" : "line-through";
                    matrixHtml += `<div style="border: 1px solid #000; padding: 3px 5px; display: flex; justify-content: space-between; align-items: center; background: #fff;"><span style="color: ${textColor}; text-decoration: ${textDecor}; font-weight: ${cellData.isSafe ? 'normal' : 'bold'};">${cellData.text}</span><span style="display:inline-block; width:12px; height:12px; border:1px solid #000; text-align:center; line-height:10px; font-size:10px; font-weight:bold; color: ${boxColor};">${boxSign}</span></div>`; 
                } 
            } else { matrixHtml += `<div style="border: 1px solid #000; background: #fff;"></div>`; } 
        }); 
    }
    
    matrix.innerHTML = matrixHtml; 
    
    const isoFindingsThead = document.getElementById('iso-findings-tbody'); 
    isoFindingsThead.innerHTML = "";
    
    if (findingList.length === 0) { 
        isoFindingsThead.innerHTML = `<tr><td colspan="5" style="border: 1px solid #000; padding: 12px; text-align: center; color: green; font-weight: bold; font-size: 1.1rem;">المنطقة مطابقة وسليمة (لا توجد ملاحظات)</td></tr>`; 
    } else { 
        findingList.forEach((f, index) => { 
            isoFindingsThead.innerHTML += `<tr><td style="border: 1px solid #000; padding: 6px;">${index + 1}</td><td style="border: 1px solid #000; padding: 6px;">${f.location || '-'}</td><td style="border: 1px solid #000; padding: 6px; text-align: right; color:#dc3545; font-weight: bold;">${f.category} - ${f.item} <br> <span style="color:#333; font-weight:normal;">(${f.note || 'ملاحظة عدم مطابقة'})</span></td><td style="border: 1px solid #000; padding: 6px;">${f.responsible || '-'}</td><td style="border: 1px solid #000; padding: 6px; color:#dc3545; font-weight: bold;">مفتوح</td></tr>`; 
        }); 
    }
    
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
// 6. مؤشرات الـ SPI
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
function switchFodTab(tab) {
    document.querySelectorAll('#fod-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#fod-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-fod-' + tab).classList.add('active');
    document.getElementById('tab-fod-' + tab).classList.add('active');
}

function generateFodInputRows() {
    const month = document.getElementById('fodInputMonth').value;
    if (!month) return alert("برجاء اختيار الشهر أولاً");
    document.getElementById('fodForm').style.display = 'block';
    const tbody = document.getElementById('fod-input-tbody');
    tbody.innerHTML = '';
    fodLocations.forEach((item, index) => {
        tbody.innerHTML += `<tr>
            <td><input type="date" id="fod_date_${index}" required style="width:100%;"></td>
            <td><b>${item.loc}</b></td>
            <td>${item.area}</td>
            <td><input type="number" step="0.001" id="fod_p_${index}" required style="width:100%;"></td>
            <td><input type="number" step="0.001" id="fod_m_${index}" required style="width:100%;"></td>
        </tr>`;
    });
}

async function submitFOD(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('submitFodBtn');
    const msg = document.getElementById('fodMsg');
    if(btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...'; }

    let fodDataArray = [];
    let localFodArray = [];

    fodLocations.forEach((item, index) => {
        let d = document.getElementById(`fod_date_${index}`)?.value || new Date().toISOString().split('T')[0];
        let p = parseFloat(document.getElementById(`fod_p_${index}`)?.value) || 0;
        let m = parseFloat(document.getElementById(`fod_m_${index}`)?.value) || 0;
        let newId = "FOD-" + Date.now() + "-" + index;

        fodDataArray.push({ id: newId, date: d, location: item.loc, area: item.area, plastic: p, metal: m });
        localFodArray.push({ ID: newId, Date: d, Location: item.loc, Area: item.area, Plastic: p, Metal: m });
    });

    safePost({ action: "submitBulkFOD", fodDataArray: fodDataArray }, btn, msg, "تم الحفظ بنجاح!", () => {
        globalFod = [...globalFod, ...localFodArray];
        setTimeout(() => { document.getElementById('fodForm').style.display = 'none'; }, 1500);
    });
}

function generateFodPrintReport() {
    const m = document.getElementById('fodReportMonth').value;
    if (!m) return alert("برجاء اختيار الشهر أولاً لعرض التقرير");
    
    let filtered = globalFod.filter(f => {
        let rd = f.Date || f.date || '';
        if (!rd) return false;
        let strDate = typeof rd === 'string' ? rd : new Date(rd).toISOString();
        return strDate.split('T')[0].startsWith(m);
    });

    const tb = document.getElementById('fod-print-tbody');
    if(!tb) return;
    tb.innerHTML = '';
    
    let tp = 0, tm = 0;
    fodLocations.forEach(loc => {
        let rc = filtered.find(f => (f.Location || f.location) === loc.loc);
        let p = rc ? parseFloat(rc.Plastic || rc.plastic || 0) : 0;
        let met = rc ? parseFloat(rc.Metal || rc.metal || 0) : 0;
        tp += p; tm += met;
        
        let dateDisplay = rc ? String(rc.Date || rc.date).split('T')[0] : '---';
        tb.innerHTML += `<tr><td style="border:1px solid #777;padding:12px;">${dateDisplay}</td><td style="border:1px solid #777;padding:12px;font-weight:bold;">${loc.loc}</td><td style="border:1px solid #777;padding:12px;">${loc.area}</td><td style="border:1px solid #777;padding:12px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td><td style="border:1px solid #777;padding:12px;">${met > 0 ? met.toFixed(3) + ' kg' : '---'}</td><td style="border:1px solid #777;padding:12px;">---</td></tr>`;
    });

    tb.innerHTML += `<tr style="background:#fafafa;font-weight:bold;"><td colspan="3" style="border:1px solid #777;padding:12px;">الإجمالي</td><td style="border:1px solid #777;padding:12px;">${tp.toFixed(3)} kg</td><td style="border:1px solid #777;padding:12px;">${tm.toFixed(3)} kg</td><td style="border:1px solid #777;padding:12px;color:#003366;">${(tp + tm).toFixed(3)} kg</td></tr>`;
    document.getElementById('printable-fod-report').style.display = 'block';
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
// دالة تنسيق فروق مؤشرات الأداء والأسهم
function formatTrendDifference(dV,iHb,un=""){let n=parseFloat(dV);if(isNaN(n)||n===0)return`<span style="color:#6c757d;font-weight:bold;">0 ${un} <i class="fa-solid fa-arrows-left-right"></i></span>`;let iP=n>0,fV=Math.abs(n).toFixed(un.includes("KG")?3:0),iG=iHb?iP:!iP,clr=iG?"#28a745":"#dc3545",aI=iP?"fa-arrow-up":"fa-arrow-down";return`<span style="color:${clr};font-weight:bold;direction:ltr;display:inline-flex;align-items:center;gap:4px;">${fV} ${un} <i class="fa-solid ${aI}"></i></span>`;}

// دالة حساب الشهر السابق المصححة تماما لمنع توقف التقرير
function getPreviousMonthStr(ms){if(!ms)return'';let p=ms.split('-');let y=parseInt(p[0]),m=parseInt(p[1]);let d=new Date(y,m-2,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}

// دالة تجميع إحصائيات الشهر الشاملة
function getMonthlyDetailedStats(ms){let p=(ms||'').split('-'),y=p[0]||'',m=p[1]||'',mN=parseInt(m||'0').toString(),s={ms:ms,mov:0,acc:0,inc:0,fT:0,fO:0,fC:0,surv:[],fTot:0,incList:[],fDept:{}};if(globalSpiData){let sR=globalSpiData.find(r=>String(r.Year)===String(y)&&String(r.Month)===mN&&r.Indicator_Name==="OperationalSPI");if(sR){try{s.mov=parseInt(JSON.parse(sR.Actual_Value).Movements)||0;}catch(e){}}}if(globalIncidents){globalIncidents.forEach(i=>{let idt=i.Date?String(i.Date).split('T')[0]:'';if(idt.startsWith(ms)){if(i.Risk_Severity==='Catastrophic')s.acc++;else s.inc++;s.incList.push(i);}});}if(globalDailyInspections){globalDailyInspections.forEach(d=>{let ddt=d.date?String(d.date).split('T')[0]:'';if(ddt.startsWith(ms)&&d.findings){d.findings.forEach(f=>{s.fT++;if(f.status==='مغلق')s.fC++;else s.fO++;let resp=f.responsible||f.Responsible||'أخرى';s.fDept[resp]=(s.fDept[resp]||0)+1;});}});}if(globalSurveys){globalSurveys.forEach(sv=>{let sdt=sv.Date?String(sv.Date).split('T')[0]:'';if(sdt.startsWith(ms))s.surv.push(sv);});}if(globalFod){globalFod.forEach(f=>{let rd=f.Date||f.date||'',fdt=(typeof rd==='string')?rd.split('T')[0]:new Date(rd).toISOString().split('T')[0];if(fdt.startsWith(ms)){s.fTot+=(parseFloat(f.Plastic||f.plastic||0)+parseFloat(f.Metal||f.metal||0));}});}return s;}

// دالة إعداد التقرير الشهري الشامل (الغلاف برأسه وصورته وبدء صفحة 2 من عام)
function generateFullMonthlyReport(){const cm=document.getElementById('mainReportMonth')?.value;if(!cm)return alert("اختر الشهر أولاً لإصدار التقرير!");const pm=getPreviousMonthStr(cm),cDO=new Date(cm+"-01"),pDO=new Date(pm+"-01");let cS=getMonthlyDetailedStats(cm),pS=getMonthlyDetailedStats(pm);let oldFix=document.getElementById('mr-page-rules-style');if(oldFix)oldFix.remove();let st=document.createElement('style');st.id='mr-page-rules-style';st.innerHTML=`#printable-main-report{font-family:'Cairo',sans-serif!important;direction:rtl!important;box-sizing:border-box!important;width:95%!important;max-width:860px!important;margin:0 auto!important;padding:15px 20px!important;background:#fff!important;border:2px solid #003366!important;}#printable-main-report *{box-sizing:border-box!important;}#printable-main-report h1,#printable-main-report h2,#printable-main-report h3,#printable-main-report h4,#printable-main-report h5,#printable-main-report .report-header,#printable-main-report .section-title{text-align:center!important;margin:6px auto!important;}#printable-main-report table{font-size:8px!important;margin:0 auto!important;width:100%!important;border-collapse:collapse!important;}#printable-main-report th,#printable-main-report td{padding:2.5px 4px!important;text-align:center;}.chart-container,.chart-box,.charts-row,.chart-row,.chart-grid{display:flex!important;flex-direction:column!important;align-items:center!important;width:100%!important;}canvas#mrChart1,canvas#mrChart2,canvas#mrSurveyAirChart,canvas#mrSurveyEvalChart{width:90%!important;max-width:480px!important;max-height:120px!important;height:120px!important;display:block!important;margin:6px auto!important;}.mr-break-page{page-break-before:always!important;break-before:page!important;margin-top:0!important;padding-top:15px!important;}`;document.head.appendChild(st);let dEl=document.getElementById('mr-title-date');if(dEl)dEl.style.display='none';document.querySelectorAll('#printable-main-report p, #printable-main-report h3, #printable-main-report h4').forEach(el=>{let t=(el.innerText||'').trim();if(el.id==='mr-title-date'||t.includes('التحركات الجوية')||t.includes('Prepared by')||t.includes('Samy')||t.includes('سامي')||t.includes('October')||t.includes('الخاص بمنطقة'))el.style.display='none';});let mainTitle=document.querySelector('#printable-main-report h1,#printable-main-report h2');if(mainTitle){mainTitle.innerText="الإدارة العامة للسلامة والمطابقة";mainTitle.style.cssText="color:#003366!important;font-size:24px!important;font-weight:900!important;text-align:center!important;margin:15px auto 10px auto!important;display:block!important;";}let cBox=document.getElementById('mr-cover-image-container');if(!cBox){cBox=document.createElement('div');cBox.id='mr-cover-image-container';let refEl=mainTitle||document.querySelector('#printable-main-report .report-header');if(refEl&&refEl.parentNode)refEl.parentNode.insertBefore(cBox,refEl.nextSibling);}if(cBox){cBox.innerHTML=`<div style="text-align:center;margin:15px auto;width:100%;"><img src="Gemini_Generated_Image_vgja40vgja40vgja.jpg.jpg" onerror="this.src='Gemini_Generated_Image_vgja40vgja40vgja.jpg'" style="width:100%;max-width:720px;height:auto;max-height:680px;object-fit:contain;border-radius:10px;border:2px solid #003366;box-shadow:0 4px 15px rgba(0,51,102,0.15);display:block;margin:0 auto;"></div><div style="page-break-after:always;break-after:page;height:1px;"></div>`;}const tb=document.getElementById('mr-general-tbody');if(tb){tb.innerHTML='';const kp=[{l:"عدد التحركات الجوية",p:pS.mov,c:cS.mov,h:true,u:""},{l:"عدد الحوادث",p:pS.acc,c:cS.acc,h:false,u:""},{l:"عدد الوقائع",p:pS.inc,c:cS.inc,h:false,u:""},{l:"حالات عدم المطابقة (الإجمالي)",p:pS.fT,c:cS.fT,h:false,u:""},{l:"حالات عدم المطابقة المعلقة",p:pS.fO,c:cS.fO,h:false,u:""},{l:"حالات عدم المطابقة التي تم تلافيها",p:pS.fC,c:cS.fC,h:true,u:""},{l:"استبيان الطيارين",p:pS.surv.length,c:cS.surv.length,h:true,u:""},{l:"كمية F.O.D (بلاستيك + معدن)",p:pS.fTot,c:cS.fTot,h:false,u:"KG",isF:true}];kp.forEach(i=>{let d=i.c-i.p,tH=formatTrendDifference(d,i.h,i.u),cD=i.isF?i.c.toFixed(3)+" "+i.u:i.c,pD=i.isF?i.p.toFixed(3)+" "+i.u:i.p;tb.innerHTML+=`<tr><td style="border:1px solid #000;padding:5px 8px;text-align:right;font-weight:bold;">${i.l}</td><td style="border:1px solid #000;padding:5px 8px;direction:ltr;">${pD}</td><td style="border:1px solid #000;padding:5px 8px;direction:ltr;font-weight:bold;background:#fdfdfd;">${cD}</td><td style="border:1px solid #000;padding:5px 8px;text-align:center;">${tH}</td></tr>`;});}document.querySelectorAll('#printable-main-report h1,#printable-main-report h2,#printable-main-report h3,#printable-main-report h4,#printable-main-report h5').forEach(h=>{let t=(h.innerText||'').trim();if(t.includes('Captain Survey')||t.includes('ثالثاً')||t.includes('استبيان الطيارين')||t.includes('F.O.D')||t.includes('رابعاً'))h.classList.add('mr-break-page');});if(monthlyChart1)monthlyChart1.destroy();if(monthlyChart2)monthlyChart2.destroy();Chart.defaults.font.family="'Cairo', sans-serif";let c1El=document.getElementById('mrChart1');if(c1El){monthlyChart1=new Chart(c1El.getContext('2d'),{type:'bar',data:{labels:Object.keys(cS.fDept),datasets:[{label:'المخاطر طبقاً للإدارة',data:Object.values(cS.fDept),backgroundColor:'#003366',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false}});}let iTC={};cS.incList.forEach(i=>{let ct=i.Characterization?i.Characterization.split('/')[0].trim():'Other';iTC[ct]=(iTC[ct]||0)+1;});let c2El=document.getElementById('mrChart2');if(c2El){monthlyChart2=new Chart(c2El.getContext('2d'),{type:'bar',data:{labels:Object.keys(iTC),datasets:[{label:'الوقائع',data:Object.values(iTC),backgroundColor:'#dc3545',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false}});}let incTextEl=document.getElementById('mr-incidents-count-text');if(incTextEl)incTextEl.innerText=`تم حصر عدد (${cS.inc+cS.acc}) وقائع/حوادث كالتالي :`;const iL=document.getElementById('mr-incidents-list');if(iL){iL.innerHTML="";let gI={};cS.incList.forEach(i=>{let ct=i.Characterization?i.Characterization.split('/')[0].trim():'Other Incident';if(!gI[ct])gI[ct]=[];gI[ct].push(i);});let cC='A';for(let ct in gI){iL.innerHTML+=`<div style="page-break-inside:avoid;background:#eef2f7;color:#003366;font-weight:bold;padding:4px 8px;margin-top:6px;border-left:3px solid #003366;display:flex;justify-content:space-between;font-size:10.5px;"><span>${cC}) ${ct}.</span><span>Total: ${gI[ct].length}</span></div>`;let t=`<table style="page-break-inside:avoid;width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:6px;font-size:9.5px;">`;gI[ct].forEach((i,x)=>{let dt=i.Date?String(i.Date).split('T')[0]:'',ds=i.Description?i.Description.replace(/\n/g,'<br>'):'-',ac=i.Action_Taken?i.Action_Taken.replace(/\n/g,'<br>'):'-';t+=`<tr><td style="border:1px solid #000;padding:3px;width:5%;text-align:center;font-weight:bold;vertical-align:top;">0${x+1}</td><td style="border:1px solid #000;padding:3px;width:65%;vertical-align:top;text-align:right;"><strong style="color:#003366;">Desc:</strong> <span>${ds}</span><br><strong style="color:#28a745;">Action:</strong> <span>${ac}</span></td><td style="border:1px solid #000;padding:3px;width:15%;text-align:center;vertical-align:top;">${dt}</td><td style="border:1px solid #000;padding:3px;width:15%;vertical-align:top;font-size:8.5px;text-align:right;"><b>Air:</b> ${i.CAR||'-'}<br><b>Agent:</b> ${i.Equipment_Owned||'-'}</td></tr>`;});t+=`</table>`;iL.innerHTML+=t;cC=String.fromCharCode(cC.charCodeAt(0)+1);}}let sTextEl=document.getElementById('mr-survey-summary-text');if(sTextEl)sTextEl.innerText=`تم عمل عدد (${cS.surv.length}) استعلام طيارين خلال شهر ${cDO.toLocaleString('ar-EG',{month:'long'})}.`;let mS={"Excellent":{},"Good":{},"Poor":{},"N/A":{},"Blank":{}};criteriaList.forEach(c=>{mS["Excellent"][c]=0;mS["Good"][c]=0;mS["Poor"][c]=0;mS["N/A"][c]=0;mS["Blank"][c]=0;});let aC={},eTC={"Excellent":0,"Good":0,"Poor":0,"N/A":0,"Blank":0},cL=[],pEL=[];cS.surv.forEach(s=>{if(s.CAR)aC[s.CAR]=(aC[s.CAR]||0)+1;let sP=[];criteriaList.forEach(c=>{let v=s[c]||"Blank";if(mS[v])mS[v][c]++;if(eTC[v]!==undefined)eTC[v]++;if(v==="Poor")sP.push(c);});if(s.Captain_Comments&&s.Captain_Comments.trim()!=="")cL.push(s);if(sP.length>0)pEL.push({flight:s,criteria:sP});});if(mrSurveyAirChartInstance)mrSurveyAirChartInstance.destroy();let saEl=document.getElementById('mrSurveyAirChart');if(saEl){mrSurveyAirChartInstance=new Chart(saEl.getContext('2d'),{type:'bar',data:{labels:Object.keys(aC),datasets:[{label:'الاستبيانات',data:Object.values(aC),backgroundColor:'#003366',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false}});}if(mrSurveyEvalChartInstance)mrSurveyEvalChartInstance.destroy();let seEl=document.getElementById('mrSurveyEvalChart');if(seEl){mrSurveyEvalChartInstance=new Chart(seEl.getContext('2d'),{type:'doughnut',data:{labels:['Excellent','Good','Poor','N/A','Blank'],datasets:[{data:Object.values(eTC),backgroundColor:['#28a745','#ffc107','#dc3545','#6c757d','#003366']}]},options:{responsive:true,maintainAspectRatio:false}});}let mH=`<table style="page-break-inside:avoid;width:100%;border-collapse:collapse;border:1px solid #777;font-size:7.5px;text-align:center;direction:ltr;margin-top:4px;"><thead><tr style="background:#003366;color:#fff;line-height:9px;"><th style="padding:1.5px 3px;border:1px solid #999;text-align:left;width:45%;">Evaluation Criteria</th><th style="padding:1.5px;border:1px solid #999;background:#28a745;width:11%;">Excellent</th><th style="padding:1.5px;border:1px solid #999;background:#ffc107;color:#000;width:11%;">Good</th><th style="padding:1.5px;border:1px solid #999;background:#dc3545;width:11%;">Poor</th><th style="padding:1.5px;border:1px solid #999;background:#6c757d;width:11%;">N/A</th><th style="padding:1.5px;border:1px solid #999;background:#1a2a6c;width:11%;">Blank</th></tr></thead><tbody>`;criteriaList.forEach(c=>{mH+=`<tr style="line-height:8.5px;"><td style="padding:1px 3px;border:1px solid #ccc;text-align:left;font-weight:bold;background:#f9f9f9;">${c}</td><td style="padding:1px;border:1px solid #ccc;font-weight:bold;color:${mS["Excellent"][c]>0?'#28a745':'#bbb'};">${mS["Excellent"][c]||0}</td><td style="padding:1px;border:1px solid #ccc;font-weight:bold;color:${mS["Good"][c]>0?'#ffc107':'#bbb'};">${mS["Good"][c]||0}</td><td style="padding:1px;border:1px solid #ccc;font-weight:bold;color:${mS["Poor"][c]>0?'#dc3545':'#bbb'};">${mS["Poor"][c]||0}</td><td style="padding:1px;border:1px solid #ccc;color:#777;">${mS["N/A"][c]||0}</td><td style="padding:1px;border:1px solid #ccc;color:#777;">${mS["Blank"][c]||0}</td></tr>`;});mH+=`</tbody></table>`;let smEl=document.getElementById('mr-survey-matrix-container');if(smEl)smEl.innerHTML=mH;let sP4H=`<div class="mr-break-page" style="width:100%;">`;if(pEL.length>0){sP4H+=`<div style="page-break-inside:avoid;margin-top:5px;direction:ltr;text-align:center;"><h4 style="color:#dc3545;margin-bottom:4px;font-size:11px;text-align:center;">⚠️ Poor Evaluations Recorded:</h4><table style="width:100%;border-collapse:collapse;border:1px solid #dc3545;font-size:9px;margin:0 auto;"><thead style="background:#f8d7da;color:#721c24;"><tr><th style="padding:3px;">Airline</th><th style="padding:3px;">FLTNO</th><th style="padding:3px;">Date</th><th style="padding:3px;">REG</th><th style="padding:3px;width:45%;">Deficient Areas</th></tr></thead><tbody>`;pEL.forEach(p=>{let dStr=p.flight.Date?String(p.flight.Date).split('T')[0]:'';sP4H+=`<tr><td style="padding:2px 4px;border:1px solid #dc3545;">${p.flight.CAR||'-'}</td><td style="padding:2px 4px;border:1px solid #dc3545;">${p.flight.Flight_NO||'-'}</td><td style="padding:2px 4px;border:1px solid #dc3545;">${dStr}</td><td style="padding:2px 4px;border:1px solid #dc3545;">${p.flight.REG||'-'}</td><td style="padding:2px 4px;border:1px solid #dc3545;color:#dc3545;font-weight:bold;">${p.criteria.join(', ')}</td></tr>`;});sP4H+=`</tbody></table></div>`;}let cH=`<div style="page-break-inside:avoid;margin-top:8px;direction:ltr;text-align:center;"><h4 style="color:#003366;font-size:11px;text-align:center;margin-bottom:4px;">Captain Comments:</h4><table style="width:100%;border-collapse:collapse;border:1px solid #000;font-size:9px;margin:0 auto;"><thead style="background:#e6e6e6;"><tr><th style="padding:3px;">Airline</th><th style="padding:3px;">FLTNO</th><th style="padding:3px;">Type</th><th style="padding:3px;">Date</th><th style="padding:3px;">REG</th><th style="padding:3px;width:45%;">Comments</th></tr></thead><tbody>`;if(cL.length===0)cH+=`<tr><td colspan="6" style="padding:4px;text-align:center;color:#777;">No captain comments.</td></tr>`;else cL.forEach(s=>{cH+=`<tr><td style="padding:2px 4px;border:1px solid #000;">${s.CAR||'-'}</td><td style="padding:2px 4px;border:1px solid #000;">${s.Flight_NO||'-'}</td><td style="padding:2px 4px;border:1px solid #000;">${s.TYPE||'-'}</td><td style="padding:2px 4px;border:1px solid #000;">${s.Date?String(s.Date).split('T')[0]:''}</td><td style="padding:2px 4px;border:1px solid #000;">${s.REG||'-'}</td><td style="padding:2px 4px;border:1px solid #000;text-align:left;">${s.Captain_Comments}</td></tr>`;});cH+=`</tbody></table></div></div>`;let scEl=document.getElementById('mr-survey-comments-container');if(scEl)scEl.innerHTML=sP4H+cH;const fD=document.getElementById('mr-fod-details');if(fD){let fF=globalFod.filter(f=>{let rd=f.Date||f.date||'';return(typeof rd==='string'?rd:new Date(rd).toISOString()).split('T')[0].startsWith(cm);});let tp=0,tm=0,fR='';fodLocations.forEach(loc=>{let rc=fF.find(f=>(f.Location||f.location)===loc.loc),p=rc?parseFloat(rc.Plastic||rc.plastic||0):0,m=rc?parseFloat(rc.Metal||rc.metal||0):0;tp+=p;tm+=m;let dD=rc&&(rc.Date||rc.date)?String(rc.Date||rc.date).split('T')[0].split('-').reverse().join('/'):'---';fR+=`<tr><td style="border:1px solid #777;padding:3px;">${dD}</td><td style="border:1px solid #777;padding:3px;font-weight:bold;">${loc.loc}</td><td style="border:1px solid #777;padding:3px;">${loc.area}</td><td style="border:1px solid #777;padding:3px;">${p>0?p.toFixed(3)+' kg':'---'}</td><td style="border:1px solid #777;padding:3px;">${m>0?m.toFixed(3)+' kg':'---'}</td><td style="border:1px solid #777;padding:3px;">---</td></tr>`;});fD.innerHTML=`<div style="page-break-inside:avoid;margin-top:10px;"><table style="width:100%;border-collapse:collapse;text-align:center;border:1px solid #777;font-size:9px;margin:0 auto;"><thead><tr style="background:#e6e6e6;"><th rowspan="2" style="border:1px solid #777;padding:3px;">Day</th><th rowspan="2" style="border:1px solid #777;padding:3px;">Location</th><th rowspan="2" style="border:1px solid #777;padding:3px;">Area</th><th colspan="2" style="border:1px solid #777;padding:3px;">FOD</th><th rowspan="2" style="border:1px solid #777;padding:3px;">Total</th></tr><tr style="background:#e6e6e6;"><th style="border:1px solid #777;padding:2px;">Plastic</th><th style="border:1px solid #777;padding:2px;">Metal</th></tr></thead><tbody>${fR}<tr style="background:#fafafa;font-weight:bold;"><td colspan="3" style="border:1px solid #777;padding:3px;">Total</td><td style="border:1px solid #777;padding:3px;">${tp.toFixed(3)} kg</td><td style="border:1px solid #777;padding:3px;">${tm.toFixed(3)} kg</td><td style="border:1px solid #777;padding:3px;color:#003366;">${(tp+tm).toFixed(3)} kg</td></tr></tbody></table></div>`;}let repMain=document.getElementById('printable-main-report');if(repMain)repMain.style.display='block';}

// دالة تصدير التقرير وتحميله كصورة أو فتح نافذة الطباعة
function exportMainReportPDF(){const el=document.getElementById('printable-main-report');if(!el||el.style.display==='none')return alert("قم بتجهيز التقرير أولاً!");window.scrollTo(0,0);if(typeof html2canvas!=='undefined'){html2canvas(el,{scale:2,useCORS:true,allowTaint:true,backgroundColor:'#ffffff'}).then(cvs=>{let a=document.createElement('a');a.download=`Airside_Safety_Report_${document.getElementById('mainReportMonth')?.value||'HD'}.png`;a.href=cvs.toDataURL('image/png',1.0);a.click();}).catch(e=>{window.print();});}else{window.print();}}

// دالة إرسال ملخص التقرير المعتمد إلى إدارة السلامة ومطابقة الراسل مباشرة بدون أوتلوك
async function sendReportViaEmail(){const m=document.getElementById('mainReportMonth')?.value;if(!m)return alert("اختر الشهر أولاً لتجهيز التقرير!");let s=getMonthlyDetailedStats(m);let hB=`<div dir="rtl" style="font-family:Arial,sans-serif;color:#333;line-height:1.6;"><h2 style="color:#003366;border-bottom:2px solid #003366;padding-bottom:8px;">التقرير الشهري لمنطقة التحركات الجوية - ${m}</h2><p><b>السادة / إدارة السلامة والمطابقة المحترمين،</b><br>تحية طيبة وبعد،،<br><br>نرفق لسيادتكم ملخص مؤشرات السلامة لمنطقة التحركات الجوية لشهر (${m}):</p><table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:13px;" border="1" cellpadding="8"><tr style="background:#003366;color:#fff;"><th>مؤشر الأداء</th><th>القيمة</th></tr><tr><td>عدد التحركات الجوية</td><td>${s.mov}</td></tr><tr><td>عدد الحوادث</td><td>${s.acc}</td></tr><tr><td>عدد الوقائع</td><td>${s.inc}</td></tr><tr><td>إجمالي حالات عدم المطابقة</td><td>${s.fT} (المغلقة: ${s.fC} | المعلقة: ${s.fO})</td></tr><tr><td>استبيانات الطيارين</td><td>${s.surv.length}</td></tr><tr><td>إجمالي كميات FOD (بلاستيك + معدن)</td><td>${s.fTot.toFixed(3)} KG</td></tr></table><p style="margin-top:20px;">وتفضلوا بقبول فائق الاحترام والتقدير،،<br><b>مُعِد التقرير:</b> سامي لوكاس<br><b>البريد:</b> s.lukas@marsa-alam-airport.com</p></div>`;try{await fetch(API_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:"sendReportEmail",subject:`التقرير الشهري لمنطقة التحركات الجوية - ${m}`,htmlBody:hB})});alert("✅ تم إرسال التقرير بنجاح إلى إدارة السلامة والمطابقة!");}catch(err){alert("❌ تعذر الاتصال بالسيرفر لإرسال الإيميل.");}}function populateUsersDropdown(arr) { const datalist = document.getElementById('usersList'), userInp = document.getElementById('loginUser'); if (!datalist) return; datalist.innerHTML = ''; arr.forEach(u => { let opt = document.createElement('option'); opt.value = u.Username; datalist.appendChild(opt); }); if (userInp) userInp.value = "Admin"; }
function renderDirectory() { const tbody = document.getElementById('directory-tbody'); if (!tbody) return; tbody.innerHTML = ""; globalDirectory.forEach((item, i) => { tbody.innerHTML += `<tr><td>${i+1}</td><td>${item.Name||'-'}</td><td>${item.Role||'-'}</td><td dir="ltr">${item.Ext||'-'}</td><td dir="ltr">${item.Mobile||'-'}</td><td>-</td></tr>`; }); }
function filterDirectory() { let val = document.getElementById('dirSearch').value.toLowerCase(), tbody = document.getElementById('directory-tbody'); tbody.innerHTML = ''; globalDirectory.forEach((item, i) => { if((item.Name||'').toLowerCase().includes(val) || (item.Role||'').toLowerCase().includes(val)) tbody.innerHTML += `<tr><td>${i+1}</td><td>${item.Name||'-'}</td><td>${item.Role||'-'}</td><td dir="ltr">${item.Ext||'-'}</td><td dir="ltr">${item.Mobile||'-'}</td><td>-</td></tr>`; }); }
function openDirModal() { document.getElementById('dirModal').style.display = 'flex'; } function closeDirModal() { document.getElementById('dirModal').style.display = 'none'; }
function saveDirEntry(e) { e.preventDefault(); let obj = { id: "DIR-"+Date.now(), dept: document.getElementById('dirDept').value, name: document.getElementById('dirName').value, role: document.getElementById('dirRole').value, ext: document.getElementById('dirExt').value, mobile: document.getElementById('dirMobile').value }; safePost({ action: "manageDirectory", subAction: "add", dirData: obj }, document.getElementById('dirSubmitBtn'), document.getElementById('dirMsg'), "تم الحفظ!", () => { globalDirectory.push(obj); renderDirectory(); document.getElementById('dirForm').reset(); setTimeout(() => closeDirModal(), 1000); }); }
function openFleetModal() { document.getElementById('addModal').style.display = 'flex'; } function closeAddModal() { document.getElementById('addModal').style.display = 'none'; }
function saveNewAircraft() { let reg = document.getElementById('newReg').value.toUpperCase(), type = document.getElementById('newType').value.toUpperCase(), airline = document.getElementById('newAirline').value.toUpperCase(); safePost({ action: "addNewAircraft", reg: reg, acType: type, airline: airline, handling: document.getElementById('newHandling').value, country: document.getElementById('newCountry').value }, document.querySelector('#addModal .submit-btn'), document.getElementById('modalMsg'), "تم!", () => { globalFleetData.unshift({REG: reg, TYPE: type, CAR: airline}); setTimeout(() => { closeAddModal(); document.getElementById('newReg').value=""; }, 1000); }); }
function addUser(e) { e.preventDefault(); let role = document.getElementById('newUserRole').value, user = document.getElementById('newUsername').value, pass = document.getElementById('newUserPass').value; safePost({ action: "addUser", role: role, username: user, password: pass }, document.querySelector('#account-management-section .submit-btn'), document.getElementById('userMsg'), "تم!", () => { globalUsers.push({Role: role, Username: user, Password: pass}); document.getElementById('users-tbody').innerHTML += `<tr><td>#</td><td>${role}</td><td>${user}</td><td>${pass}</td></tr>`; }); }
// دالة حفظ وتحديث الواقعة الآمنة تماما بدون أخطاء انقطاع الاتصال وتحديث الجدول والنافيجيشن فورا
async function saveIncident(e){if(e){e.preventDefault();e.stopPropagation();}const btn=document.getElementById('submitIncBtn')||document.querySelector('#incidentForm button[type="submit"]')||event?.target?.closest('button');if(btn){btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';}const g=(id)=>document.getElementById(id)?.value?.trim()||'';const date=g('incDate')||g('incidentDate')||new Date().toISOString().split('T')[0];const chks=[];document.querySelectorAll('input[name="incCheckboxes"]:checked, .inc-checkbox:checked').forEach(c=>chks.push(c.value));const desc=g('incDesc')||g('incidentDesc')||g('description')||'-';const incObj={id:g('incId')||("INC-"+Date.now()),date:date,time:g('incTime')||'',location:g('incLocation')||'Apron',personnel:g('incPersonnel')||'NIL',equipmentNo:g('incEqNo')||'NIL',driver:g('incDriver')||'NIL',eqOwner:g('incEqOwner')||'NIL',status:g('incStatus')||'In service',causes:g('incCauses')||'',charaterization:g('incChar')||'',riskSeverity:g('incRiskSev')||'Minor',riskProb:g('incRiskProb')||'Frequent',checkboxes:chks.join(', '),car:g('incCar')||'',flightNo:g('incFlightNo')||'',reg:g('incReg')||'',orgVia:g('incOrgVia')||'',viaDst:g('incViaDst')||'',preparedBy:g('incPreparedBy')||'Admin',hazardDesc:g('incHazardDesc')||'-',description:desc,actionTaken:g('incAction')||'-',recommendation:g('incRecommendation')||'-',attachment_URL:g('incAttach')||'',position:g('incPosition')||'NIL',injuryType:g('incInjury')||'NIL',causesDetails:g('incCausesDetails')||'-'};try{await fetch(API_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:"submitIncident",incidentData:incObj})});if(!window.globalIncidents)window.globalIncidents=[];const exIdx=window.globalIncidents.findIndex(x=>(x.ID||x.id)===incObj.id);if(exIdx>-1)window.globalIncidents[exIdx]=incObj;else window.globalIncidents.push(incObj);alert('✅ تم حفظ الواقعة بنجاح وتحديث قاعدة البيانات!');const form=document.getElementById('incidentForm')||btn?.closest('form');if(form){form.reset();const idField=document.getElementById('incId');if(idField)idField.value='';}if(btn){btn.innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الواقعة';btn.style.backgroundColor='#dc3545';}renderIncidentsTable();const incListTab=document.querySelectorAll('.tab, .nav-tabs button, .nav-link, button');incListTab.forEach(t=>{if(t.innerText&&t.innerText.includes('الوقائع المسجلة'))t.click();});}catch(err){console.error(err);alert('❌ حدث خطأ أثناء الاتصال بالسيرفر لحفظ الواقعة.');}finally{if(btn)btn.disabled=false;}}

// دالة رسم الجدول وتفعيل أزرار النافيجيشن تلقائياً
let incCurrentPage=1,incPageSize=5;function renderIncidentsTable(){const tb=document.querySelector('#incidentsTable tbody')||document.querySelector('table tbody');const list=window.globalIncidents||[];const totalPages=Math.ceil(list.length/incPageSize)||1;if(incCurrentPage>totalPages)incCurrentPage=totalPages;if(incCurrentPage<1)incCurrentPage=1;const indEls=document.querySelectorAll('.pagination span, div[class*="pagination"] span, #incPageIndicator');indEls.forEach(el=>{el.innerText=`${incCurrentPage} / ${totalPages}`;});bindIncPaginationButtons();if(!tb)return;const start=(incCurrentPage-1)*incPageSize,paged=list.slice().reverse().slice(start,start+incPageSize);tb.innerHTML='';if(paged.length===0){tb.innerHTML='<tr><td colspan="6" style="text-align:center;padding:15px;color:#777;">لا توجد وقائع مسجلة حالياً</td></tr>';return;}paged.forEach((item,idx)=>{const id=item.ID||item.id||`INC-${idx}`;const dt=(item.Date||item.date||'').toString().split('T')[0];const loc=item.Location||item.location||'-';const flt=item.Flight_No||item.flightNo||item.CAR||'';const locFlt=flt?`${loc} / ${flt}`:loc;const char=item.Characterization||item.charaterization||item.characterization||'-';const sev=item.Risk_Severity||item.riskSeverity||'-';const loss=item.Personnel_Involved||item.Equipment_Owned||item.status||'-';const sClr=sev==='Catastrophic'||sev==='Critical'?'#dc3545':(sev==='Major'?'#ffc107':'#28a745');tb.innerHTML+=`<tr style="border-bottom:1px solid #ddd;text-align:center;"><td style="padding:8px;">${dt}</td><td style="padding:8px;font-weight:bold;">${locFlt}</td><td style="padding:8px;">${char}</td><td style="padding:8px;"><span style="background:${sClr};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${sev}</span></td><td style="padding:8px;">${loss}</td><td style="padding:6px;display:flex;gap:4px;justify-content:center;align-items:center;"><button type="button" onclick="editIncident('${id}')" title="عرض وتعديل" style="background:#17a2b8;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button><button type="button" onclick="printIsoIncidentReport('${id}')" title="طباعة ISO" style="background:#003366;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-print"></i></button><button type="button" onclick="exportIsoIncidentPDF('${id}')" title="تصدير PDF" style="background:#28a745;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-file-pdf"></i></button><button type="button" onclick="deleteIncident('${id}')" title="حذف" style="background:#dc3545;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td></tr>`;});}

// دالة الربط البرمجي التلقائي لأزرار التنقل « ‹ › » لمنع أي تعطيل في الواجهة
function bindIncPaginationButtons(){const navBtns=document.querySelectorAll('.pagination button, div[class*="pagination"] button, .nav-btn');if(navBtns.length>=4){navBtns[0].onclick=()=>changeIncPage('first');navBtns[1].onclick=()=>changeIncPage('prev');navBtns[2].onclick=()=>changeIncPage('next');navBtns[3].onclick=()=>changeIncPage('last');}}function changeIncPage(dir){const list=window.globalIncidents||[];const totalPages=Math.ceil(list.length/incPageSize)||1;if(dir==='first')incCurrentPage=1;else if(dir==='prev'&&incCurrentPage>1)incCurrentPage--;else if(dir==='next'&&incCurrentPage<totalPages)incCurrentPage++;else if(dir==='last')incCurrentPage=totalPages;renderIncidentsTable();}

// دالة طباعة تقرير الحادثة المعتمد المطابق للأيزو AS-F-01-05 بالمللي
function printIsoIncidentReport(incId){const list=window.globalIncidents||[];const inc=list.find(x=>(x.ID||x.id)===incId)||list[0];if(!inc)return alert("الواقعة غير موجودة!");const w=window.open('','_blank');w.document.write(`<!DOCTYPE html><html dir="rtl"><head><title>Incident Report AS-F-01-05</title><style>@page{size:A4 portrait;margin:8mm;}body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:5px;font-size:10px;direction:rtl;color:#000;}.page{border:2px solid #000;padding:10px;box-sizing:border-box;min-height:97vh;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always;}.page:last-child{page-break-after:auto;}.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:4px;font-weight:bold;font-size:12px;}.tbl-meta{width:100%;border-collapse:collapse;margin:6px 0;font-size:10px;}table.tbl-meta td{border:1px solid #000;padding:3px 5px;}.sec-split{display:flex;gap:6px;margin-bottom:6px;}.sec-box{flex:1;border:1px solid #000;padding:4px;font-size:9.5px;line-height:1.4;}.content-block{border:1px solid #000;margin-bottom:5px;}.block-title{background:#f0f0f0;font-weight:bold;padding:2px 6px;border-bottom:1px solid #000;font-size:10px;}.block-body{padding:4px 6px;min-height:40px;font-size:9.5px;line-height:1.35;direction:ltr;text-align:left;}.ftr-zone{display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px;padding-top:4px;border-top:1px solid #000;font-size:10px;}</style></head><body>${generateIsoPagesHtml(inc)}</body></html>`);w.document.close();setTimeout(()=>{w.print();},600);}

// دالة توليد صفحات نموذج التقرير AS-F-01-05 المتعددة بدقة تامة
function generateIsoPagesHtml(inc){const dt=(inc.Date||inc.date||'').toString().split('T')[0],tm=inc.Time||inc.time||'',loc=inc.Location||inc.location||'Apron',pInv=inc.Personnel_Involved||inc.personnel||'Nil',pos=inc.Position||inc.position||'Nil',car=inc.CAR||inc.car||'-',flt=inc.Flight_No||inc.flightNo||'-',reg=inc.REG||inc.reg||'-',type=inc.TYPE||inc.type||'-',eqOwn=inc.Equipment_Owned||inc.eqOwner||'EMAAS handling company',desc=(inc.Description||inc.description||'-').replace(/\n/g,'<br>'),haz=(inc.Hazard_Description||inc.hazardDesc||'-').replace(/\n/g,'<br>'),causes=(inc.Causes_Details||inc.causesDetails||inc.Occurrence_Causes||'-').replace(/\n/g,'<br>'),act=(inc.Action_Taken||inc.actionTaken||'-').replace(/\n/g,'<br>'),rec=(inc.Recommendation||inc.recommendation||'-').replace(/\n/g,'<br>'),charStr=inc.Characterization||inc.charaterization||'',causesStr=inc.Occurrence_Causes||inc.causes||'';const isEqAcc=charStr.includes('Equipment')?'☑':'☐',isLeak=charStr.includes('Leakage')?'☑':'☐',isPass=charStr.includes('Passenger')?'☑':'☐',isFire=charStr.includes('Fire')?'☑':'☐',isOthChar=charStr.includes('Other')||(!isEqAcc&&!isLeak&&!isPass&&!isFire)?'☑':'☐';const isHum=causesStr.includes('Human')?'☑':'☐',isNat=causesStr.includes('Natural')?'☑':'☐',isTech=causesStr.includes('Technical')?'☑':'☐',isLeg=causesStr.includes('Legal')?'☑':'☐',isOrg=causesStr.includes('Organizational')?'☑':'☐';let p1=`<div class="page"><div class="hdr"><div>الإدارة العامة للمطابقة والسلامة</div><div style="text-align:center;"><img src="LOGO-removebg-preview (1).png" onerror="this.style.display='none'" style="height:32px;display:block;margin:0 auto;"><span>Mandatory reporting system</span></div><div>مطار مرسى علم الدولي</div></div><div style="border:1.5px solid #000;text-align:center;margin:4px 0;padding:3px;background:#f5f5f5;"><h3 style="margin:1px 0;font-size:13px;">نموذج تقرير حادثة / واقعة</h3><h4 style="margin:1px 0;font-size:11px;">Accident / Incident Safety Report Form</h4></div><table class="tbl-meta"><tr><td style="width:13%;background:#f9f9f9;font-weight:bold;">التاريخ / Date</td><td style="width:20%;text-align:center;">${dt}</td><td style="width:13%;background:#f9f9f9;font-weight:bold;">الوقت / Time</td><td style="width:20%;text-align:center;">${tm}</td><td style="width:14%;background:#f9f9f9;font-weight:bold;">الموقع / Location</td><td style="width:20%;text-align:center;">${loc}</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">اسم المصاب / Name</td><td colspan="3">${pInv}</td><td style="background:#f9f9f9;font-weight:bold;">عدد الإصابات / Number</td><td style="text-align:center;">Nil</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">الوظيفة / Position</td><td colspan="3">${pos}</td><td style="background:#f9f9f9;font-weight:bold;">نوع الإصابة / Type</td><td style="text-align:center;">Nil</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">طراز الطائرة / Type</td><td colspan="3">${type}</td><td style="background:#f9f9f9;font-weight:bold;">المصابين / Personnel</td><td style="text-align:center;">Nil</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">رقم الرحلة / Flight</td><td colspan="3">${flt} / ${reg}</td><td style="background:#f9f9f9;font-weight:bold;">المعدة / Equipment</td><td style="text-align:center;">${inc.Equipment_No||'Nil'}</td></tr><tr><td style="background:#f9f9f9;font-weight:bold;">الشركة / Agent</td><td colspan="5">${car} / ${eqOwn}</td></tr></table><div class="sec-split"><div class="sec-box"><b>توصيف الحادث / Occurrence Characterization:</b><br>${isEqAcc} Equipment Accident / حادث معدة<br>${isLeak} Leakage / Spill / تسريب / انسكاب<br>${isPass} Passengers / ركاب<br>${isFire} Fire Alarm / إنذار حريق<br>${isOthChar} Others / أخرى</div><div class="sec-box"><b>مسببات الحادث / Occurrence Causes:</b><br>${isHum} Human Causes / أسباب بشرية<br>${isNat} Natural Causes / أسباب طبيعية<br>${isTech} Technical Causes / أسباب فنية<br>${isLeg} Legal Causes / أسباب قانونية<br>${isOrg} Organizational Causes / أسباب تنظيمية</div></div><div class="content-block"><div class="block-title">الوصف / Description</div><div class="block-body">${desc}</div></div><div class="content-block"><div class="block-title">المخاطر / Hazards</div><div class="block-body">${haz}</div></div><div class="content-block"><div class="block-title">أوجه القصور / Causes</div><div class="block-body">${causes}</div></div><div class="content-block"><div class="block-title">الإجراء المتخذ / Action Taken</div><div class="block-body">${act}</div></div><div class="ftr-zone"><div><b>AS -F-01-05</b></div><div style="text-align:center;color:#28a745;font-weight:bold;">🛡️ SAFETY FIRST</div><div>Page 1</div></div></div>`;let p2=`<div class="page"><div class="hdr"><div>الإدارة العامة للمطابقة والسلامة</div><div style="text-align:center;"><img src="LOGO-removebg-preview (1).png" onerror="this.style.display='none'" style="height:32px;display:block;margin:0 auto;"><span>Mandatory reporting system</span></div><div>مطار مرسى علم الدولي</div></div><div class="content-block" style="margin-top:10px;"><div class="block-title">التوصيات / Recommendation</div><div class="block-body" style="min-height:80px;">${rec}</div></div><div style="border:1.5px solid #000;padding:8px;margin-top:10px;background:#fafafa;"><h4 style="margin:2px 0 8px 0;font-size:11px;border-bottom:1px solid #ccc;padding-bottom:3px;">Attached Documentations.</h4>${inc.attachment_URL?`<div style="text-align:center;"><img src="${inc.attachment_URL}" style="max-width:90%;max-height:350px;border:1px solid #ddd;border-radius:4px;"></div>`:`<div style="display:flex;gap:15px;justify-content:center;padding:15px;"><div style="border:1.5px solid #333;background:#e9ecef;width:150px;height:80px;padding:4px;font-size:8.5px;text-align:center;border-radius:4px;"><b>مطار مرسى علم الدولي</b><br>تصريح قيادة على المهبط<br><span style="color:#003366;font-weight:bold;">2026</span><br>السائق: مصرح له بالقيادة</div><div style="border:1.5px solid #333;background:#e9ecef;width:150px;height:80px;padding:4px;font-size:8.5px;text-align:center;border-radius:4px;"><b>مطار مرسى علم الدولي</b><br>تصريح قيادة على المهبط<br><span style="color:#003366;font-weight:bold;">2026</span><br>المعدة: صالحة للخدمة</div></div>`}</div><div class="ftr-zone"><div style="text-align:right;"><b>Prepared By</b><br>Airport Safety Manager<br>Samy Lukas<br><i style="font-family:cursive;font-size:14px;color:#003366;">Samy Lukas</i></div><div style="text-align:center;color:#28a745;font-weight:bold;">🛡️ SAFETY FIRST</div><div style="text-align:left;direction:ltr;"><b>AS -F-01-05</b><br><span style="font-size:9px;color:#555;">Page 2</span></div></div></div>`;return p1+p2;}

// دالة تصدير نموذج الواقعة ISO كملف PDF
function exportIsoIncidentPDF(incId){const list=window.globalIncidents||[];const inc=list.find(x=>(x.ID||x.id)===incId);if(!inc)return alert("الواقعة غير موجودة!");const dt=(inc.Date||inc.date||'').toString().split('T')[0];const tempDiv=document.createElement('div');tempDiv.style.cssText="position:absolute;left:-9999px;top:-9999px;width:800px;background:#fff;";tempDiv.innerHTML=generateIsoPagesHtml(inc);document.body.appendChild(tempDiv);if(typeof html2pdf!=='undefined'){html2pdf().set({margin:[4,4,4,4],filename:`Incident_Report_${dt}_${incId}.pdf`,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}}).from(tempDiv).save().then(()=>{document.body.removeChild(tempDiv);}).catch(e=>{document.body.removeChild(tempDiv);printIsoIncidentReport(incId);});}else{document.body.removeChild(tempDiv);printIsoIncidentReport(incId);}}
// دالة حذف واقعة من جدول الوقائع وشيت جوجل مباشرة
async function deleteIncident(incId){if(!confirm("⚠️ هل أنت متأكد من حذف هذه الواقعة نهائياً من قاعدة البيانات؟"))return;try{await fetch(API_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:"deleteIncident",id:incId})});if(window.globalIncidents){window.globalIncidents=window.globalIncidents.filter(x=>(x.ID||x.id)!==incId);}alert("✅ تم حذف الواقعة بنجاح!");renderIncidentsTable();}catch(e){alert("❌ فشل الاتصال بالسيرفر لحذف الواقعة.");}}
