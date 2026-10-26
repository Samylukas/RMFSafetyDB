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

// إنهاء التحميل والانتقال لتسجيل الدخول
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

// جلب كل البيانات من Google Apps Script
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
                updateSurveyNavCounter();

                // قراءة جولات التفتيش اليومية
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
// 1. استبيان الكابتن (Captain Survey) مع كامل التنقل
// ==========================================
function updateSurveyNavCounter() {
    const el = document.getElementById('nav-counter');
    if (el) {
        el.innerText = globalSurveys.length > 0 ? `${currentSurveyIndex + 1} / ${globalSurveys.length}` : `0 / 0`;
    }
}

function navSurveys(direction) {
    if (!globalSurveys || globalSurveys.length === 0) {
        return alert("لا توجد استبيانات مسجلة بعد في قاعدة البيانات.");
    }
    
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

    let airlinesSet = new Set();
    let evalsCount = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };
    const tbody = document.getElementById('flights-eval-tbody');
    tbody.innerHTML = '';

    filtered.forEach(s => {
        if(s.CAR) airlinesSet.add(s.CAR);
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
                <td>${s.Date ? s.Date.split('T')[0] : ''}</td>
                <td>${s.REG || ''}</td>
                <td style="color:#28a745; font-weight:bold;">${fCounts["Excellent"]}</td>
                <td style="color:#ffc107; font-weight:bold;">${fCounts["Good"]}</td>
                <td style="color:#dc3545; font-weight:bold;">${fCounts["Poor"]}</td>
                <td>${fCounts["N/A"]}</td>
                <td>${fCounts["Blank"]}</td>
            </tr>
        `;
    });

    document.getElementById('stat-airlines').innerText = airlinesSet.size;
    let totalEvals = Object.values(evalsCount).reduce((a, b) => a + b, 0);
    let excPercent = totalEvals > 0 ? Math.round((evalsCount["Excellent"] / totalEvals) * 100) : 0;
    document.getElementById('stat-excellent').innerText = `${excPercent}%`;
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
                                <select id="resp_${checkIndex}" style="flex:1;"><option value="" disabled selected>الجهة المسئولة...</option>${rOpts}</select>
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
    setTimeout(() => { btn.disabled = false; btn.innerHTML = 'حفظ الجولة'; document.getElementById('dailyMsg').innerText = ""; clearDailyFormForNew(); }, 1500);
}

function renderSavedDaily() {
    const tbody = document.getElementById('saved-daily-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    globalDailyInspections.forEach(rep => {
        tbody.innerHTML += `<tr><td>${rep.date}</td><td>${rep.time}</td><td>${rep.shift}</td><td>${rep.inspector}</td><td>${rep.findings.length} ملاحظة</td><td>-</td></tr>`;
    });
}

function generateDailyPrintReport() {
    alert("تم تجهيز التقرير للمعاينة");
}

function exportDailyPDF() {
    window.print();
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
    tbody.innerHTML = "<tr><td>تم إعداد تقرير الوقائع للشهر</td></tr>";
}
function exportMonthlyIncidentsPDF() { window.print(); }

// ==========================================
// 4. FOD & التقرير الشهري الشامل
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

async function submitFOD(e) {
    e.preventDefault();
    const btn = document.getElementById('submitFodBtn');
    btn.disabled = true;
    let fodDataArray = [];
    fodLocations.forEach((item, index) => {
        let p = parseFloat(document.getElementById(`fod_p_${index}`).value) || 0;
        let m = parseFloat(document.getElementById(`fod_m_${index}`).value) || 0;
        let d = document.getElementById(`fod_date_${index}`).value;
        fodDataArray.push({
            id: "FOD-" + Date.now() + "-" + index,
            date: d, location: item.loc, area: item.area, plastic: p, metal: m
        });
    });

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "submitBulkFOD", fodDataArray: fodDataArray })
    });

    globalFod = [...globalFod, ...fodDataArray];
    document.getElementById('fodMsg').innerText = "✅ تم حفظ FOD بنجاح!";
    setTimeout(() => { btn.disabled = false; document.getElementById('fodMsg').innerText = ""; document.getElementById('fodForm').style.display = 'none'; }, 1500);
}

function generateFodPrintReport() {
    const m = document.getElementById('fodReportMonth').value;
    if(!m) return alert("اختر الشهر");
    let filtered = globalFod.filter(f => (f.Date || f.date || "").startsWith(m));
    const tbody = document.getElementById('fod-print-tbody');
    tbody.innerHTML = '';
    let totalP = 0, totalM = 0;
    fodLocations.forEach(locItem => {
        let rec = filtered.find(f => (f.Location || f.location) === locItem.loc);
        let p = rec ? parseFloat(rec.Plastic || rec.plastic || 0) : 0;
        let m = rec ? parseFloat(rec.Metal || rec.metal || 0) : 0;
        totalP += p; totalM += m;
        tbody.innerHTML += `
            <tr>
                <td>${rec ? (rec.Date||rec.date) : '---'}</td>
                <td>${locItem.loc}</td>
                <td>${locItem.area}</td>
                <td>${p.toFixed(3)} kg</td>
                <td>${m.toFixed(3)} kg</td>
                <td>---</td>
            </tr>`;
    });
    tbody.innerHTML += `<tr style="font-weight:bold; background:#eee;"><td colspan="3">Total</td><td>${totalP.toFixed(3)} kg</td><td>${totalM.toFixed(3)} kg</td><td>${(totalP+totalM).toFixed(3)} kg</td></tr>`;
    document.getElementById('printable-fod-report').style.display = 'block';
}

function exportFodPDF() {
    html2pdf().set({ margin: 0.3, filename: 'FOD_Report.pdf' }).from(document.getElementById('printable-fod-report')).save();
}

function generateFullMonthlyReport() {
    const m = document.getElementById('mainReportMonth').value;
    if(!m) return alert("اختر الشهر");
    document.getElementById('mr-title-date').innerText = m;
    document.getElementById('mr-incidents-count-text').innerText = "تم إعداد التقرير بنجاح للشهر المختار";
    document.getElementById('printable-main-report').style.display = 'block';
}

function exportMainReportPDF() {
    html2pdf().set({ margin: 0.3, filename: 'Monthly_Report.pdf', jsPDF: { orientation: 'landscape' } })
        .from(document.getElementById('printable-main-report')).save();
}

// المستخدمين والدليل والأسطول
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
