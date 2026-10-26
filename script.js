const API_URL = "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

const criteriaList = [
    "Communication Tower", "Communication Ground", "VOR-DME", "RNP APR 33_15", "Aeronautical Beacon", 
    "Approach Lighting System", "PAPI System", "Wind Cone", "Apron Marking", "Apron Lighting", 
    "Apron Signs", "APRON Stands Size", "G.H Performance", "Fuelling Performance", "Marshall Services", 
    "RFF Team performance", "Runway Marking", "Runway Lighting", "Runway Signs", "RWY Brakes Action", 
    "RWY Evaluating Pavement", "Taxi Way Marking", "Taxi Way Lighting", "Taxi Way Signs", 
    "TWY Brakes Action", "TWY Evaluating Pavement", "Stop Bars", "Weather", "Wildlife", "Bird Strike", "FOD"
];

const spiCategories = [
    { name: "Safety Operational Issues", items: ["Bird Strike", "Wildlife Strike", "FOD Occurrence", "Runway Incursion", "Exceeding Speed"] },
    { name: "Technical & Ground Issues", items: ["Fuel Spill/Leakage", "Equipment Breakdown", "Navigation Aids Failure", "Lighting System Fault"] }
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

let globalFleetData = []; 
let globalSurveys = []; 
let globalUsers = []; 
let globalDailyInspections = []; 
let globalIncidents = [];
let globalDirectory = [];
let globalFod = [];
let globalMovements = [];
let globalSpiData = [];

let currentSurveyIndex = -1; 
let currentDailyIndex = -1; 
let currentIncidentIndex = -1;
let isDailyEditMode = false; 
let currentDailyEditId = null;

let chartInstances = {}; 
let monthlyChart1 = null;
let monthlyChart2 = null;
let mrSurveyAirChartInstance = null;
let mrSurveyEvalChartInstance = null;

// ==========================================
// شاشة البداية والدخول
// ==========================================
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
            }, 300);
        }
    } catch (e) {
        console.error(e);
    }
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

// ==========================================
// تهيئة وجلب البيانات
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
                globalMovements = data.movements || [];
                globalSpiData = data.spi || [];

                populateUsersDropdown(globalUsers);
                renderDirectory(globalDirectory);
                updateSurveyNavCounter();
                buildSpiEntryForm();

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
// 1. استبيان الكابتن (Captain Survey)
// ==========================================
function updateSurveyNavCounter() {
    const el = document.getElementById('nav-counter');
    if (el) el.innerText = globalSurveys.length > 0 ? `${currentSurveyIndex + 1} / ${globalSurveys.length}` : `0 / 0`;
}

function navSurveys(direction) {
    if (!globalSurveys || globalSurveys.length === 0) return alert("لا توجد استبيانات مسجلة بعد.");
    if (direction === 'first') currentSurveyIndex = 0;
    else if (direction === 'last') currentSurveyIndex = globalSurveys.length - 1;
    else if (direction === 'next' && currentSurveyIndex < globalSurveys.length - 1) currentSurveyIndex++;
    else if (direction === 'prev' && currentSurveyIndex > 0) currentSurveyIndex--;

    if (currentSurveyIndex >= 0 && currentSurveyIndex < globalSurveys.length) {
        displaySurveyInForm(globalSurveys[currentSurveyIndex]);
        updateSurveyNavCounter();
        let btn = document.getElementById('submitSurveyBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-eye"></i> وضع العرض (Read-Only)';
            btn.style.backgroundColor = "#6c757d";
        }
    }
}

function displaySurveyInForm(survey) {
    if (!survey) return;
    document.getElementById('capDate').value = survey.Date ? new Date(survey.Date).toISOString().split('T')[0] : '';
    let timeVal = survey.Time || '';
    if (timeVal.includes('T')) {
        let t = new Date(timeVal);
        document.getElementById('capTime').value = t.toTimeString().substring(0, 5);
    } else {
        document.getElementById('capTime').value = timeVal;
    }
    document.getElementById('fltNo').value = survey.Flight_NO || '';
    document.getElementById('reg').value = survey.REG || '';
    document.getElementById('airline').value = survey.CAR || '';
    document.getElementById('acType').value = survey.TYPE || '';
    document.getElementById('comments').value = survey.Captain_Comments || '';
    document.getElementById('airline').style.backgroundColor = "#e8f5e9";
    document.getElementById('acType').style.backgroundColor = "#e8f5e9";

    criteriaList.forEach(crit => {
        let val = survey[crit] || "Blank";
        let radio = document.querySelector(`input[name="${crit}"][value="${val}"]`);
        if (radio) radio.checked = true;
    });
}

function clearFormForNew() {
    currentSurveyIndex = -1;
    document.getElementById('surveyForm').reset();
    updateSurveyNavCounter();
    let btn = document.getElementById('submitSurveyBtn');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان';
        btn.style.backgroundColor = "var(--primary)";
    }
    document.getElementById('airline').style.backgroundColor = "#f0f0f0";
    document.getElementById('acType').style.backgroundColor = "#f0f0f0";
    let now = new Date().toISOString();
    document.getElementById('capDate').value = now.split('T')[0];
    document.getElementById('capTime').value = now.split('T')[1].substring(0, 5);
}

async function submitSurvey(e) {
    e.preventDefault();
    const btn = document.getElementById('submitSurveyBtn');
    const msg = document.getElementById('surveyMsg');
    const airline = document.getElementById('airline').value;

    if (!airline) {
        msg.style.color = "red";
        msg.innerText = "برجاء اختيار تسجيل طائرة مسجل بالأسطول!";
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';

    let sObj = {
        "Date": document.getElementById('capDate').value,
        "Time": document.getElementById('capTime').value,
        "Flight_NO": document.getElementById('fltNo').value,
        "REG": document.getElementById('reg').value.toUpperCase(),
        "CAR": airline,
        "TYPE": document.getElementById('acType').value,
        "Captain_Comments": document.getElementById('comments').value
    };

    criteriaList.forEach(crit => {
        let sel = document.querySelector(`input[name="${crit}"]:checked`);
        sObj[crit] = sel ? sel.value : "Blank";
    });

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "submitSurvey", surveyData: sObj })
        });
        msg.style.color = "green";
        msg.innerText = "✅ تم حفظ الاستبيان بنجاح!";
        globalSurveys.unshift(sObj);
        updateSurveyNavCounter();
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان';
            msg.innerText = "";
            clearFormForNew();
        }, 1500);
    } catch (err) {
        btn.disabled = false;
        msg.style.color = "red";
        msg.innerText = "حدث خطأ أثناء الاتصال!";
    }
}

function buildEvaluationForm() {
    const container = document.getElementById('criteria-container');
    if (!container) return;
    container.innerHTML = '';
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
            document.getElementById('airline').style.backgroundColor = "#e8f5e9";
            document.getElementById('acType').style.backgroundColor = "#e8f5e9";
            list.classList.remove('show');
        };
        list.appendChild(div);
    });
}

function destroyCaptainCharts() {
    if (chartInstances.air) chartInstances.air.destroy();
    if (chartInstances.dates) chartInstances.dates.destroy();
    if (chartInstances.eval) chartInstances.eval.destroy();
}

function generateModernReport() {
    let fromD = document.getElementById('fromDate').value;
    let toD = document.getElementById('toDate').value;
    if (!fromD || !toD) return alert("اختر الفترة أولاً");

    let fd = new Date(fromD);
    let td = new Date(toD);
    td.setHours(23, 59, 59, 999);

    document.getElementById('printable-report').style.display = 'block';
    let filtered = globalSurveys.filter(s => {
        let sd = new Date(s.Date);
        return sd >= fd && sd <= td;
    });

    document.getElementById('report-date-range').innerText = `الفترة من ${fromD} إلى ${toD}`;
    document.getElementById('stat-total').innerText = filtered.length;

    let airlinesCount = {};
    let datesCount = {};
    let evalsCount = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };
    const tbody = document.getElementById('flights-eval-tbody');
    tbody.innerHTML = '';

    filtered.forEach(s => {
        if (s.CAR) airlinesCount[s.CAR] = (airlinesCount[s.CAR] || 0) + 1;
        let dStr = s.Date ? String(s.Date).split('T')[0] : 'Unknown';
        datesCount[dStr] = (datesCount[dStr] || 0) + 1;

        let fCounts = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };
        criteriaList.forEach(crit => {
            let val = s[crit] || "Blank";
            if(fCounts[val] !== undefined) fCounts[val]++;
            if(evalsCount[val] !== undefined) evalsCount[val]++;
        });

        tbody.innerHTML += `
            <tr>
                <td><b>${s.CAR || ''}</b></td>
                <td>${s.Flight_NO || ''}</td>
                <td>${dStr}</td>
                <td>${s.REG || ''}</td>
                <td style="color:#28a745; font-weight:bold;">${fCounts["Excellent"]}</td>
                <td style="color:#ffc107; font-weight:bold;">${fCounts["Good"]}</td>
                <td style="color:#dc3545; font-weight:bold;">${fCounts["Poor"]}</td>
                <td>${fCounts["N/A"]}</td>
                <td>${fCounts["Blank"]}</td>
            </tr>
        `;
    });

    document.getElementById('stat-airlines').innerText = Object.keys(airlinesCount).length;
    let totalEvals = Object.values(evalsCount).reduce((a, b) => a + b, 0);
    let excPercent = totalEvals > 0 ? Math.round((evalsCount["Excellent"] / totalEvals) * 100) : 0;
    document.getElementById('stat-excellent').innerText = `${excPercent}%`;

    destroyCaptainCharts();
    Chart.defaults.font.family = "'Cairo', sans-serif";

    chartInstances.air = new Chart(document.getElementById('airlinesChart').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(airlinesCount), datasets: [{ label: 'الاستبيانات', data: Object.values(airlinesCount), backgroundColor: '#003366', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Top Airlines' } } }
    });

    let sortedDates = Object.keys(datesCount).sort();
    chartInstances.dates = new Chart(document.getElementById('datesChart').getContext('2d'), {
        type: 'line',
        data: { labels: sortedDates, datasets: [{ label: 'النشاط اليومي', data: sortedDates.map(d => datesCount[d]), borderColor: '#f39c12', tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Surveys Over Time' } } }
    });

    chartInstances.eval = new Chart(document.getElementById('evalChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Excellent', 'Good', 'Poor', 'N/A', 'Blank'],
            datasets: [{ data: Object.values(evalsCount), backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d', '#003366'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Performance' } } }
    });
}

function exportModernPDF() {
    html2pdf().set({ margin: 0.2, filename: 'Captain_Surveys_Report.pdf', jsPDF: { orientation: 'landscape' } })
        .from(document.getElementById('printable-report')).save();
}

// ==========================================
// 2. الفحص اليومي (Daily Inspections)
// ==========================================
function buildDailyChecklist() {
    const grid = document.getElementById('checklist-container');
    if (!grid) return;
    grid.innerHTML = "";
    let checkIndex = 0;

    Object.keys(dailyChecklistData).forEach(colKey => {
        let colData = dailyChecklistData[colKey];
        let colHTML = `<div class="checklist-column">`;

        const renderSection = (title, items) => {
            colHTML += `<div class="checklist-header">${title}</div>`;
            items.forEach(item => {
                let rOpts = responsibleDepts.map(d => `<option value="${d}">${d}</option>`).join('');
                colHTML += `
                    <div class="check-item">
                        <div class="check-item-row">
                            <input type="checkbox" id="chk_${checkIndex}" value="${title}|${item}" onchange="toggleInputs(${checkIndex})">
                            <label for="chk_${checkIndex}">${item}</label>
                        </div>
                        <div id="inputs_${checkIndex}" class="check-inputs">
                            <input type="text" id="note_${checkIndex}" placeholder="تفاصيل الملاحظة...">
                            <div style="display:flex; gap:5px;">
                                <input type="text" id="loc_${checkIndex}" placeholder="المكان..." style="flex:1;">
                                <select id="resp_${checkIndex}" style="flex:1;"><option value="" disabled selected>الجهة...</option>${rOpts}</select>
                            </div>
                        </div>
                    </div>`;
                checkIndex++;
            });
        };

        renderSection(colData.title, colData.items);
        if (colData.title2) renderSection(colData.title2, colData.items2);
        if (colData.title3) renderSection(colData.title3, colData.items3);
        colHTML += `</div>`;
        grid.innerHTML += colHTML;
    });
}
buildDailyChecklist();

window.toggleInputs = function(idx) {
    const chk = document.getElementById('chk_' + idx);
    const inputs = document.getElementById('inputs_' + idx);
    if (chk && inputs) inputs.style.display = chk.checked ? 'flex' : 'none';
};

function switchDailyTab(tab) {
    document.querySelectorAll('#daily-inspection-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#daily-inspection-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-daily-' + tab).classList.add('active');
    document.getElementById('tab-daily-' + tab).classList.add('active');
}

function updateDailyNavCounter() {
    const el = document.getElementById('nav-daily-counter');
    if(el) el.innerText = `${currentDailyIndex + 1} / ${globalDailyInspections.length}`;
}

function navDaily(direction) {
    if (!globalDailyInspections || globalDailyInspections.length === 0) return alert("لا توجد فحوصات مسجلة.");
    if (direction === 'first') currentDailyIndex = 0;
    else if (direction === 'last') currentDailyIndex = globalDailyInspections.length - 1;
    else if (direction === 'next' && currentDailyIndex < globalDailyInspections.length - 1) currentDailyIndex++;
    else if (direction === 'prev' && currentDailyIndex > 0) currentDailyIndex--;

    if (currentDailyIndex >= 0 && currentDailyIndex < globalDailyInspections.length) {
        navDailyTo(currentDailyIndex);
    }
}

function navDailyTo(idx) {
    currentDailyIndex = idx;
    let rep = globalDailyInspections[idx];
    document.getElementById('dailyDate').value = rep.date || '';
    document.getElementById('dailyTime').value = rep.time || '';
    document.getElementById('dailyShift').value = rep.shift || 'صباحي';
    document.getElementById('dailyInspector').value = rep.inspector || '';
    updateDailyNavCounter();
}

function clearDailyFormForNew() {
    currentDailyIndex = -1;
    document.getElementById('dailyForm').reset();
    document.querySelectorAll('.check-inputs').forEach(el => el.style.display = 'none');
    let now = new Date().toISOString();
    document.getElementById('dailyDate').value = now.split('T')[0];
    document.getElementById('dailyTime').value = now.split('T')[1].substring(0, 5);
    updateDailyNavCounter();
}

async function submitDailyInspection(e) {
    e.preventDefault();
    const btn = document.getElementById('submitDailyBtn');
    btn.disabled = true;
    btn.innerHTML = 'جاري الحفظ...';

    let findings = [];
    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, idx) => {
        if (chk.checked) {
            let parts = chk.value.split('|');
            findings.push({
                category: parts[0],
                item: parts[1],
                location: document.getElementById(`loc_${idx}`).value || "-",
                responsible: document.getElementById(`resp_${idx}`).value || "-",
                note: document.getElementById(`note_${idx}`).value || "تم الرصد",
                status: "مفتوح"
            });
        }
    });

    let rep = {
        id: Date.now(),
        date: document.getElementById('dailyDate').value,
        time: document.getElementById('dailyTime').value,
        shift: document.getElementById('dailyShift').value,
        inspector: document.getElementById('dailyInspector').value,
        findings: findings
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "submitDailyInspection", reportData: rep })
    });

    globalDailyInspections.unshift(rep);
    renderSavedDaily();
    document.getElementById('dailyMsg').innerText = "✅ تم حفظ الجولة!";
    setTimeout(() => { btn.disabled = false; btn.innerHTML = 'حفظ الجولة التفتيشية'; document.getElementById('dailyMsg').innerText = ""; clearDailyFormForNew(); }, 1500);
}

function renderSavedDaily() {
    const tbody = document.getElementById('saved-daily-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    globalDailyInspections.forEach(rep => {
        tbody.innerHTML += `<tr><td>${rep.date}</td><td>${rep.time}</td><td>${rep.shift}</td><td>${rep.inspector}</td><td>${rep.findings.length} ملاحظة</td><td>عرض</td></tr>`;
    });
}

function generateDailyPrintReport() {
    let fromD = document.getElementById('dailyFromDate').value;
    let toD = document.getElementById('dailyToDate').value;
    if(!fromD || !toD) return alert("اختر الفترة أولاً");

    let fd = new Date(fromD);
    let td = new Date(toD);
    td.setHours(23, 59, 59, 999);

    let filtered = globalDailyInspections.filter(r => {
        let sd = new Date(r.date);
        return sd >= fd && sd <= td;
    });

    const cTbody = document.getElementById('corrective-tbody');
    cTbody.innerHTML = '';
    let counter = 1;

    filtered.forEach(rep => {
        rep.findings.forEach(f => {
            cTbody.innerHTML += `
                <tr>
                    <td style="text-align:center;">${counter++}</td>
                    <td style="direction:ltr;">${rep.date}</td>
                    <td>${f.location}</td>
                    <td>${f.item} - ${f.note}</td>
                    <td>${f.responsible}</td>
                    <td>-</td>
                    <td style="color:${f.status === 'مغلق' ? 'green' : 'red'}; font-weight:bold;">${f.status}</td>
                </tr>
            `;
        });
    });

    if(counter === 1) cTbody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>سليم 100% ولا توجد ملاحظات</td></tr>";
    document.getElementById('printable-daily-report').style.display = 'block';
}

function exportDailyPDF() {
    html2pdf().set({ margin: 0.3, filename: 'Daily_Inspection_Report.pdf', jsPDF: { orientation: 'landscape' } })
        .from(document.getElementById('printable-daily-report')).save();
}

// ==========================================
// 3. الحوادث والوقائع
// ==========================================
function switchIncidentTab(tab) {
    document.querySelectorAll('#incident-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#incident-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-inc-' + tab).classList.add('active');
    document.getElementById('tab-inc-' + tab).classList.add('active');
}

function updateIncidentNavCounter() {
    const el = document.getElementById('nav-incident-counter');
    if(el) el.innerText = `${currentIncidentIndex + 1} / ${globalIncidents.length}`;
}

function navIncidents(direction) {
    if (!globalIncidents || globalIncidents.length === 0) return alert("لا توجد وقائع مسجلة.");
    if (direction === 'first') currentIncidentIndex = 0;
    else if (direction === 'last') currentIncidentIndex = globalIncidents.length - 1;
    else if (direction === 'next' && currentIncidentIndex < globalIncidents.length - 1) currentIncidentIndex++;
    else if (direction === 'prev' && currentIncidentIndex > 0) currentIncidentIndex--;

    if (currentIncidentIndex >= 0 && currentIncidentIndex < globalIncidents.length) {
        let inc = globalIncidents[currentIncidentIndex];
        document.getElementById('incDate').value = inc.Date ? inc.Date.split('T')[0] : '';
        document.getElementById('incTime').value = inc.Time || '';
        document.getElementById('incLocation').value = inc.Location || '';
        document.getElementById('incCar').value = inc.CAR || '';
        document.getElementById('incFlightNo').value = inc.Flight_No || '';
        document.getElementById('incReg').value = inc.REG || '';
        document.getElementById('incPreparedBy').value = inc.Prepared_By || '';
        document.getElementById('incDesc').value = inc.Description || '';
        document.getElementById('incAction').value = inc.Action_Taken || '';
        updateIncidentNavCounter();
    }
}

function clearIncidentForm() {
    currentIncidentIndex = -1;
    document.getElementById('incidentForm').reset();
    let now = new Date().toISOString();
    document.getElementById('incDate').value = now.split('T')[0];
    document.getElementById('incTime').value = now.split('T')[1].substring(0, 5);
    updateIncidentNavCounter();
}

async function submitIncident(e) {
    e.preventDefault();
    const btn = document.getElementById('submitIncBtn');
    btn.disabled = true;
    let incObj = {
        id: "INC-" + Date.now(),
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
        body: JSON.stringify({ action: "submitIncident", incidentData: incObj })
    });
    globalIncidents.unshift(incObj);
    renderSavedIncidents();
    document.getElementById('incMsg').innerText = "✅ تم حفظ الواقعة بنجاح!";
    setTimeout(() => { btn.disabled = false; document.getElementById('incMsg').innerText = ""; clearIncidentForm(); }, 1500);
}

function renderSavedIncidents() {
    const tbody = document.getElementById('saved-inc-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    globalIncidents.forEach((inc, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${inc.Date ? String(inc.Date).split('T')[0] : '-'}</td>
                <td>${inc.Location || inc.Flight_No || '-'}</td>
                <td>${inc.Characterization || inc.charaterization || '-'}</td>
                <td>${inc.Prepared_By || inc.preparedBy || '-'}</td>
                <td><button onclick="deleteIncidentRecord(${idx})" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; border-radius:4px;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
    });
}

async function deleteIncidentRecord(idx) {
    if(!confirm("تأكيد الحذف؟")) return;
    let item = globalIncidents[idx];
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "deleteIncident", id: item.ID || item.id })
    });
    globalIncidents.splice(idx, 1);
    renderSavedIncidents();
}

function generateMonthlyIncidents() {
    let tbody = document.getElementById('inc-monthly-table');
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>تم إنشاء تقرير الوقائع</td></tr>";
}
function exportMonthlyIncidentsPDF() { window.print(); }

// ==========================================
// 4. مؤشرات الأداء ECAA SPI
// ==========================================
function switchSpiTab(tab) {
    document.querySelectorAll('#spi-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#spi-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-spi-' + tab).classList.add('active');
    document.getElementById('tab-spi-' + tab).classList.add('active');
}

function buildSpiEntryForm() {
    const container = document.getElementById('spi-dynamic-inputs');
    if(!container) return;
    container.innerHTML = '';
    spiCategories.forEach(cat => {
        let catHtml = `<h4 style="color: #28a745; margin-top: 20px; border-bottom: 2px solid #eee; padding-bottom: 5px;">${cat.name}</h4><div class="form-grid">`;
        cat.items.forEach((spi) => {
            let safeId = "spi_" + spi.replace(/[^a-zA-Z0-9]/g, '');
            catHtml += `<div class="form-group"><label style="font-size:0.8rem; direction:ltr; text-align:left;">${spi}</label><input type="number" id="${safeId}" data-spi="${spi}" value="0" min="0" required></div>`;
        });
        catHtml += `</div>`;
        container.innerHTML += catHtml;
    });
}

async function submitSPI(e) {
    e.preventDefault();
    const btn = document.getElementById('submitSpiBtn');
    btn.disabled = true;
    let movementsVal = parseInt(document.getElementById('spiMovements').value) || 0;
    let monthData = { "Movements": movementsVal };

    document.querySelectorAll('#spi-dynamic-inputs input[type="number"]').forEach(input => {
        monthData[input.getAttribute('data-spi')] = parseInt(input.value) || 0;
    });

    let spiDataObj = {
        id: "SPI-" + Date.now(),
        year: document.getElementById('spiYear').value,
        month: document.getElementById('spiMonth').value,
        group: "ECAA_SPI_Matrix",
        name: "OperationalSPI",
        target: "0",
        actual: JSON.stringify(monthData),
        status: "Submitted",
        actionPlan: movementsVal.toString(),
        preparedBy: "Safety Officer"
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "submitSPI", spiData: spiDataObj })
    });

    globalSpiData.push({ Year: spiDataObj.year, Month: spiDataObj.month, Indicator_Name: spiDataObj.name, Actual_Value: spiDataObj.actual });
    document.getElementById('spiMsg').innerText = "✅ تم حفظ المؤشرات بنجاح!";
    setTimeout(() => { btn.disabled = false; document.getElementById('spiMsg').innerText = ""; }, 1500);
}

function generateSpiReport() {
    const container = document.getElementById('spi-matrix-container');
    let selectedYear = document.getElementById('spiReportYear').value;
    let monthlySpiParsed = {};

    globalSpiData.forEach(row => {
        if (row.Indicator_Name === "OperationalSPI" && String(row.Year) === selectedYear) {
            try { monthlySpiParsed[row.Month] = JSON.parse(row.Actual_Value); } catch (e) {}
        }
    });

    let tableHtml = `<table class="report-table spi-matrix-table"><thead><tr><th>Safety issue / SPI</th><th>JAN</th><th>FEB</th><th>MAR</th><th>APR</th><th>MAY</th><th>JUN</th><th>JUL</th><th>AUG</th><th>SEP</th><th>OCT</th><th>NOV</th><th>DEC</th><th style="background:#003366; color:#fff;">Total Events</th></tr></thead><tbody>`;
    let totalMov = 0;
    
    tableHtml += `<tr><td>Number of aircraft movements</td>`;
    for (let i = 1; i <= 12; i++) {
        let m = monthlySpiParsed[i] ? monthlySpiParsed[i].Movements || 0 : 0;
        totalMov += m;
        tableHtml += `<td style="font-weight:bold; background:#e8f5e9;">${m || '-'}</td>`;
    }
    tableHtml += `<td style="font-weight:bold; background:#003366; color:#fff;">${totalMov}</td></tr>`;

    spiCategories.forEach(cat => {
        tableHtml += `<tr><td colspan="14" style="background:#f4fcf6; color:#28a745; font-weight:bold; text-align:right;">${cat.name}</td></tr>`;
        cat.items.forEach(spi => {
            let totalSpi = 0;
            let rowHtml = `<tr><td>${spi}</td>`;
            for (let i = 1; i <= 12; i++) {
                let val = monthlySpiParsed[i] ? monthlySpiParsed[i][spi] || 0 : 0;
                totalSpi += val;
                rowHtml += `<td>${val || '-'}</td>`;
            }
            rowHtml += `<td style="font-weight:bold; color:#003366;">${totalSpi}</td></tr>`;
            tableHtml += rowHtml;
        });
    });

    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
}

// ==========================================
// 5. التقرير الشهري المجمع
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
        let iDate = inc.Date ? String(inc.Date).split('T')[0] : '';
        if (iDate.startsWith(monthStr)) {
            if (inc.Risk_Severity === 'Catastrophic') stats.accidents++;
            else stats.incidents++;
            stats.incidentsList.push(inc);
        }
    });

    globalDailyInspections.forEach(d => {
        let dDate = d.date ? String(d.date).split('T')[0] : '';
        if (dDate.startsWith(monthStr)) {
            d.findings.forEach(f => {
                stats.findingsTotal++;
                if (f.status === 'مغلق') stats.findingsClosed++;
                else stats.findingsOpen++;
                stats.findingsByDept[f.responsible] = (stats.findingsByDept[f.responsible] || 0) + 1;
            });
        }
    });

    globalSurveys.forEach(s => {
        let sDate = s.Date ? String(s.Date).split('T')[0] : '';
        if (sDate.startsWith(monthStr)) stats.surveys.push(s);
    });

    globalFod.forEach(f => {
        let rawDate = f.Date || f.date || '';
        let fDate = String(rawDate).split('T')[0];
        if (fDate.startsWith(monthStr)) {
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
    if (!currMonthStr) return alert("اختر الشهر أولاً!");

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
// 6. وحدة FOD
// ==========================================
function switchFodTab(tab) {
    document.querySelectorAll('#fod-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#fod-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-fod-' + tab).classList.add('active');
    document.getElementById('tab-fod-' + tab).classList.add('active');
}

function generateFodInputRows() {
    const month = document.getElementById('fodInputMonth').value;
    if(!month) return alert("اختر الشهر");
    document.getElementById('fodForm').style.display = 'block';
    const tbody = document.getElementById('fod-input-tbody');
    tbody.innerHTML = '';
    fodLocations.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td><input type="date" id="fod_date_${index}" required style="width:100%;"></td>
                <td><b>${item.loc}</b></td>
                <td>${item.area}</td>
                <td><input type="number" step="0.001" id="fod_p_${index}" required placeholder="0.000" style="width:100%;"></td>
                <td><input type="number" step="0.001" id="fod_m_${index}" required placeholder="0.000" style="width:100%;"></td>
            </tr>`;
    });
}

function submitFOD(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('submitFodBtn');
    const msg = document.getElementById('fodMsg');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ في الشيت...';
    msg.style.color = "#003366";
    msg.innerText = "جاري الاتصال بالسيرفر...";

    let fodDataArray = [];
    let localFodArray = [];

    fodLocations.forEach((item, index) => {
        let dateEl = document.getElementById(`fod_date_${index}`);
        let pEl = document.getElementById(`fod_p_${index}`);
        let mEl = document.getElementById(`fod_m_${index}`);

        let d = dateEl ? dateEl.value : "";
        let p = pEl ? parseFloat(pEl.value) || 0 : 0;
        let m = mEl ? parseFloat(mEl.value) || 0 : 0;
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

    const callbackName = 'jsonpFodSave_' + Math.round(100000 * Math.random());
    
    window[callbackName] = function(res) {
        delete window[callbackName];
        const s = document.getElementById('fod-jsonp-script');
        if (s && s.parentNode) s.parentNode.removeChild(s);

        if (res && res.status === "success") {
            globalFod = [...globalFod, ...localFodArray];
            msg.style.color = "green";
            msg.innerText = "✅ تم حفظ البيانات وتحديث الشيت بنجاح!";

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الشهر';
                msg.innerText = "";
                let form = document.getElementById('fodForm');
                if (form) form.style.display = 'none';
            }, 1800);
        } else {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الشهر';
            msg.style.color = "red";
            msg.innerText = "❌ حدث خطأ من السيرفر: " + (res ? res.message : "رد غير معروف");
        }
    };

    const encodedData = encodeURIComponent(JSON.stringify(fodDataArray));
    const scriptTag = document.createElement('script');
    scriptTag.id = 'fod-jsonp-script';
    scriptTag.src = `${API_URL}?action=submitFOD_GET&data=${encodedData}&callback=${callbackName}`;
    
    scriptTag.onerror = function() {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الشهر';
        msg.style.color = "red";
        msg.innerText = "❌ لم يتم النشر كـ Anyone أو New Version في Google Script!";
    };

    document.body.appendChild(scriptTag);
}
function generateFodPrintReport() {
    const m = document.getElementById('fodReportMonth').value;
    if (!m) return alert("اختر الشهر أولاً لعرض التقرير");

    let filtered = globalFod.filter(f => {
        let rawDate = f.Date || f.date || '';
        let dStr = "";
        if (typeof rawDate === 'string') {
            dStr = rawDate.split('T')[0];
        } else if (rawDate instanceof Date) {
            dStr = rawDate.toISOString().split('T')[0];
        }
        return dStr.startsWith(m);
    });

    const tbody = document.getElementById('fod-print-tbody');
    tbody.innerHTML = '';
    let totalP = 0, totalM = 0;

    fodLocations.forEach(locItem => {
        let rec = filtered.find(f => (f.Location || f.location) === locItem.loc);
        let p = rec ? parseFloat(rec.Plastic || rec.plastic || 0) : 0;
        let m = rec ? parseFloat(rec.Metal || rec.metal || 0) : 0;
        totalP += p; 
        totalM += m;

        let dDisplay = '---';
        if (rec && (rec.Date || rec.date)) {
            let rDate = rec.Date || rec.date;
            let dStr = (typeof rDate === 'string') ? rDate.split('T')[0] : new Date(rDate).toISOString().split('T')[0];
            dDisplay = dStr.split('-').reverse().join('/');
        }

        tbody.innerHTML += `
            <tr>
                <td style="border: 1px solid #777; padding: 12px;">${dDisplay}</td>
                <td style="border: 1px solid #777; padding: 12px; text-align: left;">${locItem.loc}</td>
                <td style="border: 1px solid #777; padding: 12px;">${locItem.area}</td>
                <td style="border: 1px solid #777; padding: 12px;">${p > 0 ? p.toFixed(3) + ' kg' : '---'}</td>
                <td style="border: 1px solid #777; padding: 12px;">${m > 0 ? m.toFixed(3) + ' kg' : '---'}</td>
                <td style="border: 1px solid #777; padding: 12px;">---</td>
            </tr>`;
    });

    let grossTotal = totalP + totalM;
    tbody.innerHTML += `
        <tr style="background: #fafafa; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #777; padding: 12px;">Total</td>
            <td style="border: 1px solid #777; padding: 12px;">${totalP.toFixed(3)} kg</td>
            <td style="border: 1px solid #777; padding: 12px;">${totalM.toFixed(3)} kg</td>
            <td style="border: 1px solid #777; padding: 12px; color:#000;">${grossTotal.toFixed(3)} kg</td>
        </tr>`;

    document.getElementById('printable-fod-report').style.display = 'block';
}

function exportFodPDF() {
    html2pdf().set({ margin: 0.3, filename: 'FOD_Report.pdf', jsPDF: { orientation: 'landscape' } })
        .from(document.getElementById('printable-fod-report')).save();
}

// ==========================================
// 7. المستخدمين والدليل والأسطول
// ==========================================
function populateUsersDropdown(usersArray) {
    const datalist = document.getElementById('usersList');
    const userInp = document.getElementById('loginUser');
    if (!datalist) return;
    datalist.innerHTML = ''; 
    usersArray.forEach(user => {
        let option = document.createElement('option');
        option.value = user.Username; 
        datalist.appendChild(option);
    });
    if (userInp) userInp.value = "Admin";
}

function renderDirectory(dataList) {
    const tbody = document.getElementById('directory-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    let counter = 1;
    dataList.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${counter++}</td>
                <td>${item.Name || '-'}</td>
                <td>${item.Role || '-'}</td>
                <td>${item.Ext || '-'}</td>
                <td>${item.Mobile || '-'}</td>
                <td>-</td>
            </tr>`;
    });
}
function filterDirectory() {}
function openDirModal() { document.getElementById('dirModal').style.display = 'flex'; }
function closeDirModal() { document.getElementById('dirModal').style.display = 'none'; }
async function saveDirEntry(e) { e.preventDefault(); closeDirModal(); }
function exportDirectoryPDF() { window.print(); }
function openFleetModal() { document.getElementById('addModal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('addModal').style.display = 'none'; }
async function saveNewAircraft() { closeAddModal(); }
async function addUser(e) { e.preventDefault(); }
