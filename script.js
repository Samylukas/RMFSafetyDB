const API_URL = "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";

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
        items3: ["لمبات مكسورة/ تالفة علي المدرج RWY", "لمبات مكسورة/ تالفة علي الممرات TXY", "لمبات مكسورة/ تالفة على الترمك", "إنارة وحدات Floodlight غير مطابقة أو أقل من (20لاكس)", "اللمبات الغاطسة غير مضاءة", "لمبات وحدات الإقتراب غير مطابقة", "لمبات العوائق غير مضاءة", "لمبات مكسورة/ تالفة لإنارة الطرق الخدمية داخل Airside", "أخرى"] 
    },
    col3: { 
        title: "عملية تموين الوقود", 
        items: ["وقوف غير سليم علي الطائرة", "الهروب السريع غير متوفر", "النظام الإطفائي غير مكتمل", "الـDEAD MAN غير مستعمل", "سلك التأريض غير موصل", "زر الطوارئ لايعمل", "عدد المشغلين غير كاف", "المشغل لا يرتدي مهمات السلامة", "أختبار العينة لا يتم إجراؤه", "منطقة العمل غير محددة", "حساسات المصعد لاتعمل", "ملصقات عدم التدخين والـ Jet A", "البيكون لايعمل", "السلامة العامة للسيارة غير لائقة", "عدم توافر المواد الماصة للوقود.", "إستخدام تليفون محمول في حدود 15 م أثناء التموين.", "أخرى"], 
        title2: "أخطار الحياة البرية", 
        items2: ["مشاهدة حيوانات برية /طيور مقيمة / نافقة", "وجود مصادر جذب للحياة البرية", "أخرى"] 
    },
    col4: { 
        title: "التحركات ووقوف الطائرات", 
        items: ["سائق المعدة لا يحمل تصريح قيادة على المهبط", "رخصة المعدة غير متوفرة.", "عدم الإلتزام بالسرعات المقررة", "عدم إستخدام طريق الخدمة .", "إستخدام أكثر من 3مقطورة أثناء الخدمة", "عدم تجميع الFOD الناتج من تحميل الحقائب", "إرتفاع الحقائب يتعدى 3 صفوف", "الأقماع غير موضوعة علي حدود الطائرة", "المعدة الأرضية غير مجهزة بالبيكون.", "المعدة الأرضية غير مطابقة .", "طفايات الحريق غير سارية.", "عملية الدفع الخلفي تتم بسرعة غير مناسبة", "عدم إتباع تعليمات سلامة التحركات علي المهبط", "وجود أشخاص غير مصرح بهم.", "وجود معدات غير مصرح بها.", "عدم إرتداء مهمات الوقاية الشخصية", "أخرى"], 
        title2: "الإنقاذ والإطفاء", 
        items2: ["عدم صلاحية الإتصالات", "عدم الإستجابة السريعة للأفراد.", "نقص فى عدد مشغلى سيارة الإطفاء", "أخرى"] 
    }
};

const responsibleDepts = ["العمليات", "الهندسة المدنية", "الهندسة الكهربية", "الإنقاذ والإطفاء", "شركات الطيران / الوكالات", "الإرشاد", "أخرى"];

let globalFleetData = []; 
let globalSurveys = []; 
let globalUsers = []; 
let globalSpiData = []; 
let globalDailyInspections = []; 
let globalIncidents = [];
let globalDirectory = [];
let currentSurveyIndex = -1; 
let currentDailyIndex = -1; 
let currentIncidentIndex = -1;

let isDailyEditMode = false; 
let currentDailyEditId = null;
let isIncidentEditMode = false; 
let currentIncidentEditId = null;

let chartInstances = {}; 
let chartInstancesDaily = {};
let globalFodData = [];

function finishLoading() {
    try {
        const splash = document.getElementById('splash-screen');
        const loginScreen = document.getElementById('login-screen');
        
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                }
            }, 500);
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// توقيت شاشة البداية والانتقال لتسجيل الدخول
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    loadAppDataInit();  // <--- حط السطر ده هناااااا 
    setupCustomDropdown();
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const loginScreen = document.getElementById('login-screen');
        
        if (splash) {
            splash.style.opacity = '0'; // بدء التلاشي
            setTimeout(() => {
                splash.style.display = 'none'; // إخفاء السبلاش
                if (loginScreen) {
                    loginScreen.style.display = 'flex'; // إظهار شاشة الدخول
                }
            }, 3500); // 3.5 ثانية تتطابق مع وقت تبخر اللوجو
        }
    }, 3500);
});

function handleLogin(e) {
    e.preventDefault();
    const userField = document.getElementById('username').value;
    const passField = document.getElementById('password').value;
    let validUser = globalUsers.find(u => u.Username === userField && String(u.Password) === passField);
    if (validUser || (globalUsers.length === 0 && passField === "1234")) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-header').style.display = 'flex';
        openSection('main-dashboard');
    } else {
        alert("كلمة المرور غير صحيحة!");
        document.getElementById('password').value = "";
    }
}

function openSection(sectionId) {
    document.querySelectorAll('.content-area').forEach(el => el.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

function loadAppDataInit() {
    const callbackName = 'jsonpInit_' + Math.round(100000 * Math.random());
    window[callbackName] = function (data) {
        try {
            if (data && data.status === "success") {
                globalFleetData = data.fleet ? data.fleet.reverse() : [];
                globalSurveys = data.surveys ? data.surveys.reverse() : [];
                globalUsers = data.users || [];
                globalSpiData = data.spi || [];
                globalIncidents = data.incidents ? data.incidents.reverse() : [];
                globalFodData = data.fod ? data.fod.reverse() : [];
                if(data.directory) globalDirectory = data.directory;
                
                renderDirectory(globalDirectory);
                renderSavedFOD();

                if (data.daily && data.daily.length > 0) {
                    let reportsMap = {};
                    data.daily.forEach(row => {
                        let repId = row.Report_ID;
                        let timeStr = row.Time || "";
                        if (timeStr && typeof timeStr === 'string' && timeStr.includes('T')) {
                            try {
                                let d = new Date(timeStr);
                                if (!isNaN(d)) timeStr = d.toISOString().substring(11, 16);
                            } catch(e) {}
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
updateFodNav();
                if (globalSurveys.length > 0) {
                    navSurveys('first');
                }
            }
        } catch (e) { console.error("Error parsing API data:", e); }
        delete window[callbackName];
        
    };

    const script = document.createElement('script');
    script.src = API_URL + "?action=getAppData&callback=" + callbackName;
    document.body.appendChild(script);
}

/* --- عرض دليل الهواتف المصلح بتنسيق الإكسل --- */
function renderDirectory(dataList) {
    const tbody = document.getElementById('directory-tbody');
    if (!tbody) return;
    
    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:20px; font-weight:bold; color:#dc3545;'>لا توجد بيانات مسجلة في الدليل</td></tr>";
        return;
    }

    dataList.sort((a, b) => {
        let numA = parseInt(String(a.ID || "0").replace("DIR-", "")) || 0;
        let numB = parseInt(String(b.ID || "0").replace("DIR-", "")) || 0;
        return numA - numB;
    });

    let currentDept = "";
    let counter = 1;
    let tableHTML = "";

    dataList.forEach((item) => {
        let deptName = item.Department || "أخرى";
        
        if (deptName !== currentDept) {
            tableHTML += `
                <tr class="dept-header-row">
                    <td colspan="6" style="background: #e9ecef; color: #003366; font-weight: 900; text-align: center; padding: 10px; border-top: 3px solid #003366; font-size: 1rem;">
                        ${deptName}
                    </td>
                </tr>`;
            currentDept = deptName;
        }

        let safeID = item.ID ? String(item.ID) : "";

        tableHTML += `
            <tr style="background: #fff;">
                <td style="text-align: center; font-weight: bold;">${counter++}</td>
                <td style="font-weight: bold; color: #003366;">${item.Name || '-'}</td>
                <td>${item.Role || '-'}</td>
                <td style="text-align: center; font-weight: 900; direction: ltr; color: #dc3545;">${item.Ext || '-'}</td>
                <td style="text-align: center; font-weight: bold; direction: ltr;">${item.Mobile || '-'}</td>
                <td style="text-align: center;" class="dir-actions">
                    <button type="button" onclick="openDirModal('${safeID}')" style="background:#ffc107; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" onclick="deleteDirEntry('${safeID}')" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;" title="حذف"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHTML;
}

function filterDirectory() {
    let query = document.getElementById('dirSearch').value.toLowerCase();
    let filtered = globalDirectory.filter(item => {
        return (item.Name && item.Name.toLowerCase().includes(query)) || 
               (item.Role && item.Role.toLowerCase().includes(query)) || 
               (item.Department && item.Department.toLowerCase().includes(query)) || 
               (item.Ext && String(item.Ext).includes(query)) || 
               (item.Mobile && String(item.Mobile).includes(query));
    });
    renderDirectory(filtered);
}

function openDirModal(id) {
    document.getElementById('dirMsg').innerText = "";
    if (id && id !== 'undefined' && id !== '') {
        let item = globalDirectory.find(g => String(g.ID) === String(id));
        if (item) {
            document.getElementById('dirId').value = item.ID || "";
            document.getElementById('dirDept').value = item.Department || "";
            document.getElementById('dirName').value = item.Name || "";
            document.getElementById('dirRole').value = item.Role || "";
            document.getElementById('dirExt').value = item.Ext || "";
            document.getElementById('dirMobile').value = item.Mobile || "";
            document.getElementById('dirModalTitle').innerText = "تعديل بيانات جهة الاتصال";
        }
    } else {
        document.getElementById('dirForm').reset();
        document.getElementById('dirId').value = "";
        document.getElementById('dirModalTitle').innerText = "إضافة جهة اتصال جديدة";
    }
    document.getElementById('dirModal').style.display = 'flex';
}

function closeDirModal() { document.getElementById('dirModal').style.display = 'none'; }

async function saveDirEntry(e) {
    e.preventDefault();
    const btn = document.getElementById('dirSubmitBtn');
    const msg = document.getElementById('dirMsg');
    btn.disabled = true; btn.innerHTML = 'جاري الحفظ...';

    let id = document.getElementById('dirId').value || "DIR-" + Date.now();
    let isEdit = document.getElementById('dirId').value !== "";

    let payload = {
        id: id, dept: document.getElementById('dirDept').value, name: document.getElementById('dirName').value,
        role: document.getElementById('dirRole').value, ext: document.getElementById('dirExt').value, mobile: document.getElementById('dirMobile').value
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "manageDirectory", subAction: isEdit ? "edit" : "add", dirData: payload }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });

        let newObj = { ID: payload.id, Department: payload.dept, Name: payload.name, Role: payload.role, Ext: payload.ext, Mobile: payload.mobile };
        if (isEdit) {
            let idx = globalDirectory.findIndex(g => String(g.ID) === String(payload.id));
            if (idx !== -1) globalDirectory[idx] = newObj;
        } else {
            globalDirectory.push(newObj);
        }
        
        renderDirectory(globalDirectory);
        msg.style.color = "green"; msg.innerText = "تم الحفظ بنجاح!";
        setTimeout(() => { closeDirModal(); btn.disabled = false; btn.innerHTML = 'حفظ في الدليل'; }, 1000);
    } catch (err) {
        msg.style.color = "red"; msg.innerText = "فشل الاتصال!";
        btn.disabled = false; btn.innerHTML = 'حفظ في الدليل';
    }
}

async function deleteDirEntry(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الرقم؟")) return;
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "manageDirectory", subAction: "delete", dirData: { id: id } }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        globalDirectory = globalDirectory.filter(g => String(g.ID) !== String(id));
        renderDirectory(globalDirectory);
    } catch(err) { alert("فشل الحذف!"); }
}

function exportDirectoryPDF() {
    document.getElementById('dirSearch').style.display = 'none';
    document.querySelectorAll('.dir-actions').forEach(el => el.style.display = 'none'); 

    const el = document.getElementById('printable-directory');
    window.scrollTo(0, 0);

    html2pdf().set({
        margin: [0.3, 0.2, 0.3, 0.2],
        filename: 'Marsa_Alam_Airport_Directory.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.dept-header-row'] }
    }).from(el).save().then(() => {
        document.getElementById('dirSearch').style.display = 'block';
        document.querySelectorAll('.dir-actions').forEach(el => el.style.display = ''); 
    });
}

function switchTab(tab) {
    document.querySelectorAll('#captain-survey-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#captain-survey-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

function buildEvaluationForm() {
    const container = document.getElementById('criteria-container');
    if (!container) return;
    criteriaList.forEach((crit, index) => {
        let html = `<div class="eval-card">
                        <div class="eval-title">${crit}</div>
                        <div class="radio-group">
                            <input type="radio" id="c${index}_e" name="${crit}" value="Excellent" checked><label for="c${index}_e" class="lbl-e">E</label>
                            <input type="radio" id="c${index}_g" name="${crit}" value="Good"><label for="c${index}_g" class="lbl-g">G</label>
                            <input type="radio" id="c${index}_p" name="${crit}" value="Poor"><label for="c${index}_p" class="lbl-p">P</label>
                            <input type="radio" id="c${index}_n" name="${crit}" value="N/A"><label for="c${index}_n" class="lbl-n">N/A</label>
                            <input type="radio" id="c${index}_b" name="${crit}" value="Blank"><label for="c${index}_b" class="lbl-b">B</label>
                        </div>
                    </div>`;
        container.innerHTML += html;
    });
}

function setupCustomDropdown() {
    const input = document.getElementById('reg');
    const arrow = document.getElementById('regArrowBtn');
    const list = document.getElementById('regDropdownList');

    arrow.addEventListener('click', function(e) {
        e.stopPropagation();
        list.classList.toggle('show');
        if (list.classList.contains('show')) {
            input.focus();
            filterRegOptions(true);
        }
    });

    input.addEventListener('input', function() {
        list.classList.add('show');
        filterRegOptions(false);
    });

    input.addEventListener('click', function(e) {
        e.stopPropagation();
        list.classList.add('show');
        filterRegOptions(false);
    });

    document.addEventListener('click', function() {
        list.classList.remove('show');
    });
}

function filterRegOptions(showAll = false) {
    const input = document.getElementById('reg');
    const list = document.getElementById('regDropdownList');
    const airlineInput = document.getElementById('airline');
    const typeInput = document.getElementById('acType');
    
    let rawInput = input.value;
    const filter = rawInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    list.innerHTML = '';
    
    let matched = showAll ? globalFleetData : globalFleetData.filter(a => String(a.REG).toUpperCase().replace(/[^A-Z0-9]/g, '').includes(filter));
    let exactMatch = globalFleetData.find(a => String(a.REG).toUpperCase().replace(/[^A-Z0-9]/g, '') === filter);

    if (exactMatch) {
        airlineInput.value = exactMatch.CAR || "";
        typeInput.value = exactMatch.TYPE || "";
        airlineInput.style.backgroundColor = "#e8f5e9";
        typeInput.style.backgroundColor = "#e8f5e9";
        list.innerHTML = `<div class="custom-dropdown-item" onclick="selectReg('${exactMatch.REG}')">${exactMatch.REG} <span style="font-size: 0.75rem; color: #777; float: right;">${exactMatch.CAR}</span></div>`;
    } else {
        airlineInput.value = "";
        typeInput.value = "";
        airlineInput.style.backgroundColor = "#f0f0f0";
        typeInput.style.backgroundColor = "#f0f0f0";

        if (globalFleetData.length === 0) {
            list.innerHTML = `<div class="custom-dropdown-empty" style="color: #666;">جاري تحميل البيانات من السيرفر...</div>`;
        } else if (matched.length === 0) {
            list.innerHTML = `<div class="custom-dropdown-empty">لا توجد طائرة بهذا التسجيل. يمكنك الضغط على (+) لإضافتها.</div>`;
        } else {
            matched.forEach(a => {
                let div = document.createElement('div');
                div.className = 'custom-dropdown-item';
                div.innerHTML = `${a.REG} <span style="font-size: 0.75rem; color: #777; float: right;">${a.CAR}</span>`;
                div.onclick = function(e) { e.stopPropagation(); selectReg(a.REG); };
                list.appendChild(div);
            });
        }
    }
}

function selectReg(selectedReg) {
    const input = document.getElementById('reg');
    const list = document.getElementById('regDropdownList');
    input.value = selectedReg;
    list.classList.remove('show');
    
    let exactMatch = globalFleetData.find(a => String(a.REG) === selectedReg);
    if (exactMatch) {
        document.getElementById('airline').value = exactMatch.CAR || "";
        document.getElementById('acType').value = exactMatch.TYPE || "";
        document.getElementById('airline').style.backgroundColor = "#e8f5e9";
        document.getElementById('acType').style.backgroundColor = "#e8f5e9";
    }
}

function navSurveys(direction) {
    if (globalSurveys.length === 0) return alert("لا توجد استبيانات مسجلة بعد.");
    if (direction === 'first') currentSurveyIndex = 0;
    else if (direction === 'last') currentSurveyIndex = globalSurveys.length - 1;
    else if (direction === 'next' && currentSurveyIndex < globalSurveys.length - 1) currentSurveyIndex++;
    else if (direction === 'prev' && currentSurveyIndex > 0) currentSurveyIndex--;

    if (currentSurveyIndex >= 0 && currentSurveyIndex < globalSurveys.length) {
        displaySurveyInForm(globalSurveys[currentSurveyIndex]);
        document.getElementById('nav-counter').innerText = `${currentSurveyIndex + 1} / ${globalSurveys.length}`;
        document.getElementById('submitSurveyBtn').disabled = true;
        document.getElementById('submitSurveyBtn').innerHTML = '<i class="fa-solid fa-eye"></i> وضع العرض (Read-Only)';
    }
}

function displaySurveyInForm(survey) {
    document.getElementById('date').value = survey.Date ? new Date(survey.Date).toISOString().split('T')[0] : '';
    let timeVal = survey.Time;
    if (timeVal && timeVal.includes('T')) {
        let t = new Date(timeVal);
        document.getElementById('time').value = t.toTimeString().substring(0, 5);
    } else {
        document.getElementById('time').value = timeVal || '';
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
    document.getElementById('nav-counter').innerText = `0 / ${globalSurveys.length}`;
    let btn = document.getElementById('submitSurveyBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان';
    document.getElementById('reg').value = "";
    document.getElementById('airline').value = "";
    document.getElementById('acType').value = "";
    document.getElementById('airline').style.backgroundColor = "#f0f0f0";
    document.getElementById('acType').style.backgroundColor = "#f0f0f0";
}

function openFleetModal() {
    document.getElementById('newReg').value = "";
    document.getElementById('newType').value = "";
    document.getElementById('newAirline').value = "";
    document.getElementById('newHandling').value = "";
    document.getElementById('newCountry').value = "";
    document.getElementById('modalMsg').innerText = "";
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

async function saveNewAircraft() {
    const reg = document.getElementById('newReg').value.toUpperCase();
    const type = document.getElementById('newType').value.toUpperCase();
    const airline = document.getElementById('newAirline').value.toUpperCase();
    const handling = document.getElementById('newHandling').value;
    const country = document.getElementById('newCountry').value;
    const msg = document.getElementById('modalMsg');

    if (!reg || !type || !airline) {
        msg.style.color = "red";
        msg.innerText = "برجاء ملء البيانات الأساسية!";
        return;
    }

    if (globalFleetData.some(a => String(a.REG).toUpperCase() === reg)) {
        msg.style.color = "red";
        msg.innerText = "هذا التسجيل موجود بالفعل!";
        return;
    }

    msg.style.color = "blue";
    msg.innerText = "جاري الحفظ...";

    const payload = {
        action: "addNewAircraft",
        reg: reg,
        acType: type,
        airline: airline,
        handling: handling,
        country: country
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        msg.style.color = "green";
        msg.innerText = "تم الحفظ بنجاح!";
        globalFleetData.unshift({ "REG": reg, "TYPE": type, "CAR": airline });
        selectReg(reg);
        setTimeout(closeAddModal, 1500);
    } catch (error) {
        msg.style.color = "red";
        msg.innerText = "فشل الاتصال بالسيرفر!";
    }
}

async function submitSurvey(e) {
    e.preventDefault();
    const airline = document.getElementById('airline').value;
    const msg = document.getElementById('surveyMsg');

    if (!airline) {
        msg.style.color = "red";
        msg.innerText = "برجاء التأكد من تسجيل الطائرة (غير موجود في قاعدة البيانات)!";
        return;
    }

    const btn = document.getElementById('submitSurveyBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';

    let surveyDataObj = {
        "Date": document.getElementById('date').value,
        "Time": document.getElementById('time').value,
        "Flight_NO": document.getElementById('fltNo').value,
        "REG": document.getElementById('reg').value.toUpperCase(),
        "CAR": airline,
        "TYPE": document.getElementById('acType').value,
        "Captain_Comments": document.getElementById('comments').value
    };

    criteriaList.forEach(crit => {
        let selectedOption = document.querySelector(`input[name="${crit}"]:checked`);
        surveyDataObj[crit] = selectedOption ? selectedOption.value : "Blank";
    });

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "submitSurvey", surveyData: surveyDataObj }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        msg.style.color = "green";
        msg.innerText = "✅ تم الحفظ بنجاح!";
        globalSurveys.unshift(surveyDataObj);
        document.getElementById('nav-counter').innerText = `0 / ${globalSurveys.length}`;
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان';
            btn.disabled = false;
            msg.innerText = "";
            clearFormForNew();
        }, 1500);
    } catch (error) {
        msg.style.color = "red";
        msg.innerText = "❌ حدث خطأ أثناء الإرسال.";
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ بيانات الاستبيان';
        btn.disabled = false;
    }
}

function generateModernReport() {
    let fromD = document.getElementById('fromDate').value;
    let toD = document.getElementById('toDate').value;

    if (!fromD || !toD) return alert("برجاء اختيار فترة التاريخ أولاً.");

    let fd = new Date(fromD);
    let td = new Date(toD);
    td.setHours(23, 59, 59, 999);

    if (fd > td) return alert("التاريخ 'إلى' يجب أن يكون أكبر من أو يساوي التاريخ 'من'");

    document.getElementById('printable-report').style.display = 'block';
    
    let filteredSurveys = globalSurveys.filter(s => {
        let sd = new Date(s.Date);
        return sd >= fd && sd <= td;
    });

    document.getElementById('report-date-range').innerHTML = `الفترة: <span style="display:inline-block; direction:ltr;">${fromD}</span> إلى <span style="display:inline-block; direction:ltr;">${toD}</span>`;

    let airlinesSet = new Set();
    let airlinesCount = {};
    let datesCount = {};
    let evalsCount = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };

    const flightsTbody = document.getElementById('flights-eval-tbody');
    flightsTbody.innerHTML = "";

    const extraContainer = document.getElementById('additional-tables-container');
    extraContainer.innerHTML = "";

    if (filteredSurveys.length === 0) {
        flightsTbody.innerHTML = "<tr><td colspan='9' style='padding: 20px; font-weight: bold; text-align:center;'>لا توجد بيانات مسجلة في هذه الفترة</td></tr>";
        document.getElementById('stat-total').innerText = "0";
        document.getElementById('stat-airlines').innerText = "0";
        document.getElementById('stat-excellent').innerText = "0%";
        destroyCharts();
        return;
    }

    let commentsHTML = ''; let hasComments = false;
    let poorEvaluationsHTML = ''; let hasPoor = false;

    filteredSurveys.forEach(survey => {
        if (survey.CAR) {
            airlinesSet.add(survey.CAR);
            airlinesCount[survey.CAR] = (airlinesCount[survey.CAR] || 0) + 1;
        }
        let dStr = survey.Date ? survey.Date.split('T')[0] : 'Unknown';
        datesCount[dStr] = (datesCount[dStr] || 0) + 1;

        let fCounts = { "Excellent": 0, "Good": 0, "Poor": 0, "N/A": 0, "Blank": 0 };
        let poorCriteriaForThisFlight = [];

        criteriaList.forEach(crit => {
            let val = survey[crit] || "Blank";
            if (fCounts[val] !== undefined) fCounts[val]++;
            if (evalsCount[val] !== undefined) evalsCount[val]++;
            if (val === "Poor") { poorCriteriaForThisFlight.push(crit); }
        });

        let dateDisplay = survey.Date ? new Date(survey.Date).toLocaleDateString('en-GB') : "";

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${survey.CAR || ''}</b></td>
            <td dir="ltr" style="text-align: right;">${survey.Flight_NO || ''}</td>
            <td dir="ltr" style="text-align: right;">${dateDisplay}</td>
            <td dir="ltr" style="text-align: right;">${survey.REG || ''}</td>
            <td style="font-weight:bold; color:#28a745;">${fCounts["Excellent"]}</td>
            <td style="font-weight:bold; color:#ffc107;">${fCounts["Good"]}</td>
            <td style="font-weight:bold; color:#dc3545;">${fCounts["Poor"]}</td>
            <td style="font-weight:bold; color:#6c757d;">${fCounts["N/A"]}</td>
            <td style="font-weight:bold; color:#1a2a6c;">${fCounts["Blank"]}</td>
        `;
        flightsTbody.appendChild(tr);

        if (survey.Captain_Comments && survey.Captain_Comments.trim() !== "") {
            hasComments = true;
            commentsHTML += `
                <tr>
                    <td><b>${survey.CAR || ''}</b></td>
                    <td dir="ltr" style="text-align: right; font-weight: bold;">${survey.Flight_NO || ''}</td>
                    <td dir="ltr" style="text-align: right;">${dateDisplay}</td>
                    <td dir="ltr" style="text-align: left; color:#333; font-weight:600;">${survey.Captain_Comments}</td>
                </tr>
            `;
        }

        if (poorCriteriaForThisFlight.length > 0) {
            hasPoor = true;
            poorEvaluationsHTML += `
                <tr>
                    <td><b>${survey.CAR || ''}</b></td>
                    <td dir="ltr" style="text-align: right; font-weight: bold;">${survey.Flight_NO || ''}</td>
                    <td dir="ltr" style="text-align: right;">${dateDisplay}</td>
                    <td dir="ltr" style="text-align: right;">${survey.REG || ''}</td>
                    <td style="color: #dc3545; font-weight: bold; text-align: right; direction: ltr;">${poorCriteriaForThisFlight.join(' <span style="color:#ccc;">|</span> ')}</td>
                </tr>
            `;
        }
    });

    let additionalTables = "";

    if (hasPoor) {
        additionalTables += `
            <div class="report-wrapper avoid-page-break" style="margin-top: 30px; background: #fffafb; border-right: 5px solid #dc3545; padding: 15px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <h4 style="color: #dc3545; margin-top:0; margin-bottom: 15px; border-bottom: 2px solid #f5c6cb; padding-bottom: 5px; text-align: right;"><i class="fa-solid fa-triangle-exclamation"></i> تفاصيل التقييمات الضعيفة</h4>
                <table class="report-table rtl-table" dir="rtl" style="margin-bottom: 0;">
                    <thead><tr style="background-color: #fceceb;"><th>الشركة</th><th>الرحلة</th><th>التاريخ</th><th>التسجيل</th><th>الخانات التي حصلت على (Poor)</th></tr></thead>
                    <tbody>${poorEvaluationsHTML}</tbody>
                </table>
            </div>
        `;
    }

    additionalTables += `
        <div class="comments-section avoid-page-break" style="background: #f0f8ff; border-right: 5px solid var(--primary); padding: 15px; border-radius: 8px; margin-top: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h4 style="color: var(--primary); margin-top:0; margin-bottom: 15px; border-bottom: 2px solid #cce5ff; padding-bottom: 5px; text-align: right;"><i class="fa-solid fa-comments"></i> ملاحظات الكابتن</h4>
            <table class="report-table rtl-table" dir="rtl" style="margin-bottom: 0;">
                <thead><tr style="background-color: #e6f2ff;"><th>الشركة</th><th>الرحلة</th><th>التاريخ</th><th style="width: 50%;">الملاحظة</th></tr></thead>
                <tbody>`;

    if (hasComments) {
        additionalTables += commentsHTML;
    } else {
        additionalTables += `<tr><td colspan="4" style="text-align:center; color: #777; font-weight:bold;">لا توجد ملاحظات مسجلة في هذه الفترة</td></tr>`;
    }

    additionalTables += `</tbody></table></div>`;
    extraContainer.innerHTML = additionalTables;

    document.getElementById('stat-total').innerText = filteredSurveys.length;
    document.getElementById('stat-airlines').innerText = airlinesSet.size;
    let totalEvals = Object.values(evalsCount).reduce((a, b) => a + b, 0);
    let excPercent = totalEvals > 0 ? Math.round((evalsCount["Excellent"] / totalEvals) * 100) : 0;
    document.getElementById('stat-excellent').innerText = `${excPercent}%`;

    drawCharts(airlinesCount, datesCount, evalsCount);
}

function destroyCharts() {
    if (chartInstances.air) chartInstances.air.destroy();
    if (chartInstances.dates) chartInstances.dates.destroy();
    if (chartInstances.eval) chartInstances.eval.destroy();
}

function drawCharts(airlines, dates, evals) {
    destroyCharts();
    Chart.defaults.font.family = "'Cairo', sans-serif";
    Chart.register(ChartDataLabels);

    const ctxAir = document.getElementById('airlinesChart').getContext('2d');
    chartInstances.air = new Chart(ctxAir, {
        type: 'bar',
        data: { labels: Object.keys(airlines), datasets: [{ label: 'Surveys', data: Object.values(airlines), backgroundColor: '#003366', borderRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, title: { display: true, text: 'Top Airlines' } } }
    });

    const ctxDates = document.getElementById('datesChart').getContext('2d');
    let sortedDates = Object.keys(dates).sort();
    let sortedData = sortedDates.map(d => dates[d]);
    chartInstances.dates = new Chart(ctxDates, {
        type: 'line',
        data: { labels: sortedDates, datasets: [{ label: 'Activity', data: sortedData, borderColor: '#f39c12', backgroundColor: 'rgba(243, 156, 18, 0.2)', fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, title: { display: true, text: 'Surveys Over Time' } } }
    });

    const ctxEval = document.getElementById('evalChart').getContext('2d');
    chartInstances.eval = new Chart(ctxEval, {
        type: 'doughnut',
        data: {
            labels: ['Excellent', 'Good', 'Poor', 'N/A', 'Blank'],
            datasets: [{ data: [evals["Excellent"], evals["Good"], evals["Poor"], evals["N/A"], evals["Blank"]], backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#a9a9a9', '#1a2a6c'] }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Overall Performance' },
                datallabels: {
                    color: '#fff', font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        let sum = 0;
                        ctx.chart.data.datasets[0].data.map(data => { sum += data; });
                        if (sum === 0 || value === 0) return '';
                        return (value * 100 / sum).toFixed(0) + "%";
                    }
                }
            }
        }
    });
}

function exportModernPDF() {
    const element = document.getElementById('printable-report');
    const wrappers = document.querySelectorAll('.report-wrapper, .comments-section');
    wrappers.forEach(w => w.style.overflowX = 'visible');
    window.scrollTo(0, 0);

    html2pdf().set({
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: 'Safety_Dashboard_Report.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 4, useCORS: true, scrollY: 0, y: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'] }
    }).from(element).save().then(() => {
        wrappers.forEach(w => w.style.overflowX = 'auto');
    });
}

function switchDailyTab(tab) {
    document.querySelectorAll('#daily-inspection-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#daily-inspection-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-daily-' + tab).classList.add('active');
    document.getElementById('tab-daily-' + tab).classList.add('active');
}

function updateStatusColor(sel) {
    if (sel.value === 'مغلق') {
        sel.style.backgroundColor = '#28a745';
        sel.style.color = '#fff';
    } else {
        sel.style.backgroundColor = '#dc3545';
        sel.style.color = '#fff';
    }
}

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
                            <div style="display:flex; gap:5px;">
                                <input type="text" id="actionTaken_${checkIndex}" placeholder="الإجراء المتخذ..." style="flex:2;">
                                <input type="date" id="targetDate_${checkIndex}" title="تاريخ التلافي" style="flex:1;">
                                <select id="status_${checkIndex}" class="status-select" style="flex:1; background:#dc3545; color:white;" onchange="updateStatusColor(this)">
                                    <option value="مفتوح" selected>مفتوح</option>
                                    <option value="مغلق">مغلق</option>
                                </select>
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

window.toggleInputs = function(idx) {
    const chk = document.getElementById('chk_' + idx);
    const inputs = document.getElementById('inputs_' + idx);
    if (chk && chk.checked) {
        inputs.style.display = 'flex';
    } else {
        inputs.style.display = 'none';
    }
}

function autoFillDailyDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, -1);
    const dField = document.getElementById('dailyDate');
    const tField = document.getElementById('dailyTime');
    if (dField) dField.value = localISOTime.split('T')[0];
    if (tField) tField.value = localISOTime.split('T')[1].substring(0, 5);
}

function updateDailyNavCounter() {
    const ctr = document.getElementById('nav-daily-counter');
    if (ctr) ctr.innerText = globalDailyInspections.length > 0 ? `${currentDailyIndex + 1} / ${globalDailyInspections.length}` : `0 / 0`;
}

function navDaily(direction) {
    if (globalDailyInspections.length === 0) return alert("لا توجد فحوصات مسجلة بعد.");
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
    let rep = globalDailyInspections[currentDailyIndex];

    document.getElementById('dailyForm').reset();
    document.querySelectorAll('.check-inputs').forEach(el => el.style.display = 'none');

    document.getElementById('dailyDate').value = rep.date || '';
    document.getElementById('dailyTime').value = rep.time || '';
    document.getElementById('dailyShift').value = rep.shift || 'صباحي';
    document.getElementById('dailyInspector').value = rep.inspector || '';

    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, idx) => {
        let parts = chk.value.split('|');
        let found = rep.findings.find(f => f.category === parts[0] && f.item === parts[1]);
        if (found) {
            chk.checked = true;
            document.getElementById(`inputs_${idx}`).style.display = 'flex';

            let fullNote = found.note || "";
            let nText = "تم الرصد";
            let aText = "لم يحدد";
            let tDate = "غير محدد";

            try {
                let match = fullNote.match(/الملاحظة: (.*?) - الإجراء: (.*?) - تاريخ التلافي: (.*)/);
                if (match) {
                    nText = match[1];
                    aText = match[2];
                    tDate = match[3];
                } else {
                    nText = fullNote;
                }
            } catch (e) {}

            document.getElementById(`note_${idx}`).value = nText;
            document.getElementById(`actionTaken_${idx}`).value = aText !== "لم يحدد" ? aText.replace(/\[تم تلافي الملحوظة بتاريخ.*?\]/g, '').trim() : "";

            let dField = document.getElementById(`targetDate_${idx}`);
            dField.value = (tDate !== "غير محدد" && tDate.trim() !== "") ? tDate : "";

            document.getElementById(`loc_${idx}`).value = found.location || "";
            document.getElementById(`resp_${idx}`).value = found.responsible || "";

            let statusSel = document.getElementById(`status_${idx}`);
            statusSel.value = found.status || "مفتوح";
            updateStatusColor(statusSel);
        }
    });

    updateDailyNavCounter();

    isDailyEditMode = true;
    currentDailyEditId = rep.id;

    let btn = document.getElementById('submitDailyBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> حفظ التعديلات وتحديث الحالة';
    btn.style.backgroundColor = "#ffc107";
    btn.style.color = "#000";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearDailyFormForNew() {
    currentDailyIndex = -1;
    isDailyEditMode = false;
    currentDailyEditId = null;

    document.getElementById('dailyForm').reset();
    document.querySelectorAll('.check-inputs').forEach(el => el.style.display = 'none');

    document.querySelectorAll('.status-select').forEach(sel => {
        sel.style.backgroundColor = '#dc3545';
        sel.style.color = '#fff';
    });

    autoFillDailyDateTime();
    updateDailyNavCounter();

    let btn = document.getElementById('submitDailyBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الجولة التفتيشية في قاعدة البيانات';
    btn.style.backgroundColor = "var(--primary)";
    btn.style.color = "#fff";
}

async function submitDailyInspection(e) {
    e.preventDefault();
    const btn = document.getElementById('submitDailyBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
    btn.disabled = true;

    let findings = [];
    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach((chk, idx) => {
        if (chk.checked) {
            let parts = chk.value.split('|');
            let noteText = document.getElementById(`note_${idx}`).value || "تم الرصد";
            let actionText = document.getElementById(`actionTaken_${idx}`).value || "لم يحدد";
            let targetD = document.getElementById(`targetDate_${idx}`).value || "";
            let st = document.getElementById(`status_${idx}`).value || "مفتوح";

            if (st === "مغلق") {
                let closeDate = targetD !== "" ? targetD : new Date().toISOString().split('T')[0];
                if (!actionText.includes("تم تلافي الملحوظة")) {
                    actionText = actionText + ` [تم تلافي الملحوظة بتاريخ ${closeDate}]`;
                }
            }

            let combinedNote = `الملاحظة: ${noteText} - الإجراء: ${actionText} - تاريخ التلافي: ${targetD !== "" ? targetD : "غير محدد"}`;

            findings.push({
                category: parts[0],
                item: parts[1],
                note: combinedNote,
                location: document.getElementById(`loc_${idx}`).value || "-",
                responsible: document.getElementById(`resp_${idx}`).value || "-",
                status: st
            });
        }
    });

    let reportId = isDailyEditMode ? currentDailyEditId : Date.now();
    const report = {
        id: reportId,
        date: document.getElementById('dailyDate').value,
        time: document.getElementById('dailyTime').value,
        shift: document.getElementById('dailyShift').value,
        inspector: document.getElementById('dailyInspector').value,
        findings: findings
    };

    let actionType = isDailyEditMode ? "updateDailyInspection" : "submitDailyInspection";

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: actionType, reportData: report }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });

        if (isDailyEditMode) {
            globalDailyInspections[currentDailyIndex] = report;
            document.getElementById('dailyMsg').style.color = "green";
            document.getElementById('dailyMsg').innerText = "✅ تم تحديث الملاحظات بنجاح!";
        } else {
            globalDailyInspections.unshift(report);
            document.getElementById('dailyMsg').style.color = "green";
            document.getElementById('dailyMsg').innerText = "✅ تم الحفظ بنجاح!";
        }

        setTimeout(() => {
            clearDailyFormForNew();
            renderSavedDaily();
            document.getElementById('dailyMsg').innerText = "";
        }, 2000);
    } catch (err) {
        btn.disabled = false;
        document.getElementById('dailyMsg').style.color = "red";
        document.getElementById('dailyMsg').innerText = "❌ خطأ في الإتصال.";
    }
}

function renderSavedDaily() {
    const tbody = document.getElementById('saved-daily-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    updateDailyNavCounter();

    if (globalDailyInspections.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='color:#777; font-weight:bold; text-align:center;'>لا توجد فحوصات محفوظة.</td></tr>";
        return;
    }

    globalDailyInspections.forEach((rep, idx) => {
        let badge = rep.findings.length > 0 ? `<span style="background:red;color:white;padding:2px 8px;border-radius:10px;">${rep.findings.length} مخالفة</span>` : `<span style="background:green;color:white;padding:2px 8px;border-radius:10px;">سليم 100%</span>`;
        tbody.innerHTML += `<tr><td dir="ltr">${rep.date}</td><td>${rep.time}</td><td>${rep.shift}</td><td>${rep.inspector}</td><td style="font-weight:bold;">${badge}</td><td><button type="button" onclick="navDailyTo(${idx})" style="background:var(--primary); color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-pen"></i> عرض وتعديل</button></td></tr>`;
    });
}

function generateDailyPrintReport() {
    let fromD = document.getElementById('dailyFromDate').value;
    let toD = document.getElementById('dailyToDate').value;

    if (!fromD || !toD) return alert("برجاء اختيار فترة التاريخ أولاً.");

    let fd = new Date(fromD);
    let td = new Date(toD);
    td.setHours(23, 59, 59, 999);

    if (fd > td) return alert("التاريخ 'إلى' يجب أن يكون أكبر من أو يساوي التاريخ 'من'");

    document.getElementById('printable-daily-report').style.display = 'block';

    let filteredDailys = globalDailyInspections.filter(r => {
        let sd = new Date(r.date);
        return sd >= fd && sd <= td;
    });

    if (filteredDailys.length === 0) {
        alert("لا توجد فحوصات في هذه الفترة.");
        document.getElementById('printable-daily-report').style.display = 'none';
        return;
    }

    let isMultiDay = fromD !== toD;

    if (isMultiDay) {
        document.getElementById('printable-checklist-report').style.display = 'none';
        document.getElementById('corrective-title').innerText = `أولاً: تقرير بالأخطار التي تم رصدها (الفترة من ${fromD} إلى ${toD}):`;
    } else {
        document.getElementById('printable-checklist-report').style.display = 'block';
        document.getElementById('corrective-title').innerText = "أولاً: تقرير بالأخطار التي تم رصدها:";
        let rep = filteredDailys[0];
        document.getElementById('print-date-view').innerText = rep.date;
        document.getElementById('print-time-view').innerText = rep.time;
        document.getElementById('print-shift-view').innerText = rep.shift;
        document.getElementById('print-inspector-view').innerText = rep.inspector;

        const table = document.getElementById('iso-checklist-table');
        table.innerHTML = "";
        let trHeader = "<tr>";
        Object.keys(dailyChecklistData).reverse().forEach(colKey => {
            trHeader += `<th>${dailyChecklistData[colKey].title}</th>`;
        });
        trHeader += "</tr>";
        table.innerHTML += trHeader;

        let trBody = "<tr>";
        Object.keys(dailyChecklistData).reverse().forEach(colKey => {
            let colData = dailyChecklistData[colKey];
            let cellHtml = "<td>";
            const renderItems = (itemsArr, catName) => {
                itemsArr.forEach(i => {
                    let isChecked = rep.findings.some(f => f.category === catName && f.item === i);
                    let checkClass = isChecked ? "checked" : "";
                    cellHtml += `<div class="checklist-row-print"><span>${i}</span><span class="checkbox-print ${checkClass}"></span></div>`;
                });
            };
            renderItems(colData.items, colData.title);
            if (colData.title2) {
                cellHtml += `<div style="text-align:center; font-weight:bold; background:#e6e6e6; margin: 4px -3px 2px; padding:2px;">${colData.title2}</div>`;
                renderItems(colData.items2, colData.title2);
            }
            if (colData.title3) {
                cellHtml += `<div style="text-align:center; font-weight:bold; background:#e6e6e6; margin: 4px -3px 2px; padding:2px;">${colData.title3}</div>`;
                renderItems(colData.items3, colData.title3);
            }
            cellHtml += "</td>";
            trBody += cellHtml;
        });
        trBody += "</tr>";
        table.innerHTML += trBody;
    }

    const ctbody = document.getElementById('corrective-tbody');
    ctbody.innerHTML = "";
    let counter = 1;
    let statusCounts = { "مغلق": 0, "مفتوح": 0 };
    let deptCounts = {};

    let allFindingsCount = 0;
    filteredDailys.forEach(dr => {
        dr.findings.forEach(f => {
            allFindingsCount++;
            let st = f.status || 'مفتوح';
            if (st === 'مغلق') statusCounts["مغلق"]++;
            else statusCounts["مفتوح"]++;
            deptCounts[f.responsible] = (deptCounts[f.responsible] || 0) + 1;

            let displayStatus = st === 'مغلق' ? 'انتهى' : 'معلق';
            let statusColor = st === 'مغلق' ? '#28a745' : '#dc3545';

            let violationText = f.item;
            let correctiveAction = "لم يحدد";

            try {
                let match = f.note.match(/الملاحظة: (.*?) - الإجراء: (.*?) - تاريخ التلافي: (.*)/);
                if (match) {
                    violationText = `<b>${f.item}</b><br><span style="color:#555;font-weight:normal;">${match[1]}</span>`;
                    correctiveAction = match[2];
                    let tDate = match[3];

                    if (correctiveAction.includes("[تم تلافي")) {
                        correctiveAction = correctiveAction.replace(/\[(تم تلافي.*?)\]/, "<strong style='color:#28a745;'><br>[$1]</strong>");
                    }
                    if (tDate !== "غير محدد" && tDate.trim() !== "") {
                        correctiveAction += `<br><span style="color:#777; font-size:8px;">التاريخ المستهدف: ${tDate}</span>`;
                    }
                }
            } catch (e) {}

            ctbody.innerHTML += `
            <tr>
                <td style="text-align:center;">${counter++}</td>
                <td style="text-align:center; direction:ltr;">${dr.date}</td>
                <td style="text-align:center; direction:ltr;">${dr.time}</td>
                <td style="text-align:center;">${f.location}</td>
                <td style="text-align:right; font-size:10px;">${violationText}</td>
                <td style="text-align:center;">${f.responsible}</td>
                <td style="text-align:right; font-size:10px;">${correctiveAction}</td>
                <td style="background:${statusColor}; color:white; text-align:center; font-weight:bold; font-size:11px;">${displayStatus}</td>
            </tr>`;

            ctbody.innerHTML += `
            <tr>
                <td colspan="8" style="text-align:center; background-color:#fafafa; padding: 12px; color: #aaa; border-bottom: 3px solid #000;">
                    صورة المخالفة حالة الرصد (مساحة مخصصة لإرفاق الصور مستقبلاً)
                </td>
            </tr>`;
        });
    });

    if (counter === 1) ctbody.innerHTML = "<tr><td colspan='8' style='text-align:center;font-weight:bold;padding:20px;'>سليم 100% ولا توجد ملاحظات في هذه الفترة</td></tr>";

    document.getElementById('stat-daily-total').innerText = filteredDailys.length;
    document.getElementById('stat-daily-findings').innerText = allFindingsCount;

    let closedPercent = allFindingsCount > 0 ? Math.round((statusCounts["مغلق"] / allFindingsCount) * 100) : 0;
    document.getElementById('stat-daily-closed').innerText = closedPercent + "%";

    if (chartInstancesDaily.dept) chartInstancesDaily.dept.destroy();
    if (chartInstancesDaily.status) chartInstancesDaily.status.destroy();
    Chart.defaults.font.family = "'Cairo', sans-serif";
    Chart.register(ChartDataLabels);

    chartInstancesDaily.dept = new Chart(document.getElementById('dailyDeptChart').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(deptCounts), datasets: [{ label: 'المخالفات', data: Object.values(deptCounts), backgroundColor: '#dc3545', borderRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }
    });

    chartInstancesDaily.status = new Chart(document.getElementById('dailyStatusChart').getContext('2d'), {
        type: 'pie',
        data: { labels: ['مغلق', 'مفتوح'], datasets: [{ data: [statusCounts["مغلق"], statusCounts["مفتوح"]], backgroundColor: ['#28a745', '#dc3545'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { color: '#fff', font: { weight: 'bold' } } } }
    });
}

function exportDailyPDF() {
    const el = document.getElementById('printable-daily-report');
    if (el.style.display === 'none') return alert("برجاء عرض التقرير أولاً قبل الطباعة.");
    window.scrollTo(0, 0);
    html2pdf().set({
        margin: 0.1,
        filename: 'Air_Side_Daily_Inspection.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 4, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: 'css', avoid: ['.avoid-page-break', 'tr'] }
    }).from(el).save();
}

function switchIncidentTab(tab) {
    document.querySelectorAll('#incident-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#incident-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-inc-' + tab).classList.add('active');
    document.getElementById('tab-inc-' + tab).classList.add('active');
}

function handleIncFile(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
        alert("حجم الملف يجب ألا يتعدى 3 ميجابايت!");
        input.value = "";
        return;
    }
    document.getElementById('incFileLabel').innerText = file.name;
    incFileName = file.name;
    incFileType = file.type;
    const reader = new FileReader();
    reader.onload = function(e) {
        incFileBase64 = e.target.result.split(',')[1];
    };
    reader.readAsDataURL(file);
}

function updateIncidentNavCounter() {
    const ctr = document.getElementById('nav-incident-counter');
    if (ctr) {
        ctr.innerText = globalIncidents.length > 0 ? `${currentIncidentIndex + 1} / ${globalIncidents.length}` : `0 / 0`;
    }
}

function clearIncidentForm() {
    currentIncidentIndex = -1;
    isIncidentEditMode = false;
    currentIncidentEditId = null;

    document.getElementById('incidentForm').reset();
    document.getElementById('incFileLabel').innerText = "اضغط لاختيار ملف المرفقات";
    document.getElementById('incAttachedLink').style.display = "none";
    incFileBase64 = null;
    incFileName = null;
    incFileType = null;

    let now = new Date();
    let offset = now.getTimezoneOffset() * 60000;
    let local = (new Date(now - offset)).toISOString().slice(0, -1);
    
    document.getElementById('incDate').value = local.split('T')[0];
    document.getElementById('incTime').value = local.split('T')[1].substring(0, 5);

    let btn = document.getElementById('submitIncBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الواقعة في قاعدة البيانات';
    btn.style.backgroundColor = "#dc3545";
    btn.style.color = "#fff";
    
    updateIncidentNavCounter();
}

function navIncidents(direction) {
    if (globalIncidents.length === 0) return alert("لا توجد وقائع مسجلة.");
    if (direction === 'first') currentIncidentIndex = 0;
    else if (direction === 'last') currentIncidentIndex = globalIncidents.length - 1;
    else if (direction === 'next' && currentIncidentIndex < globalIncidents.length - 1) currentIncidentIndex++;
    else if (direction === 'prev' && currentIncidentIndex > 0) currentIncidentIndex--;

    navIncidentTo(currentIncidentIndex);
}

function navIncidentTo(idx) {
    currentIncidentIndex = idx;
    let inc = globalIncidents[currentIncidentIndex];
    if (!inc) return;

    switchIncidentTab('entry');
    document.getElementById('incidentForm').reset();

    document.getElementById('incDate').value = inc.Date ? inc.Date.split('T')[0] : '';
    document.getElementById('incTime').value = inc.Time || '';
    document.getElementById('incLocation').value = inc.Location || '';
    document.getElementById('incPersonnel').value = inc.Personnel_Involved || 'NIL';
    document.getElementById('incEqNo').value = inc.Equipment_No || 'NIL';
    document.getElementById('incDriver').value = inc.Driver_Name || 'NIL';
    document.getElementById('incEqOwner').value = inc.Equipment_Owned || 'NIL';
    document.getElementById('incStatus').value = inc.Status || 'In service';
    
    document.getElementById('incPosition').value = inc.Position || 'NIL';
    document.getElementById('incInjuryType').value = inc.Injury_Type || 'NIL';
    document.getElementById('incCausesDetails').value = inc.Causes_Details || '';

    let chks = (inc.Checkboxes && typeof inc.Checkboxes === 'string') ? inc.Checkboxes.split(',') : [];
    document.getElementById('chkIncPersonnel').checked = chks.includes('Personnel');
    document.getElementById('chkIncEq').checked = chks.includes('Equipment');
    document.getElementById('chkIncAc').checked = chks.includes('Aircraft');
    document.getElementById('chkIncInFlight').checked = chks.includes('InFlight');
    document.getElementById('chkIncOnGround').checked = chks.includes('OnGround');

    document.getElementById('incCar').value = inc.CAR || '';
    document.getElementById('incFlightNo').value = inc.Flight_No || '';
    document.getElementById('incReg').value = inc.REG || '';
    document.getElementById('incOrgVia').value = (inc.ORG_VIA || '') + (inc.VIA_DST ? ' - ' + inc.VIA_DST : '');

    document.getElementById('incCauses').value = inc.Occurrence_Causes || '';
    document.getElementById('incChar').value = inc.Characterization || '';
    document.getElementById('incRiskSev').value = inc.Risk_Severity || '';
    document.getElementById('incRiskProb').value = inc.Risk_Probability || '';
    document.getElementById('incPreparedBy').value = inc.Prepared_By || '';

    document.getElementById('incHazardDesc').value = inc.Hazard_Description || '';
    document.getElementById('incDesc').value = inc.Description || '';
    document.getElementById('incAction').value = inc.Action_Taken || '';
    document.getElementById('incRec').value = inc.Recommendation || '';

    if (inc.Attachment_URL && inc.Attachment_URL.includes("http")) {
        let fileIdMatch = inc.Attachment_URL.match(/\/d\/(.+?)\//);
        if (fileIdMatch && fileIdMatch[1]) {
            let fileId = fileIdMatch[1];
            let directImgUrl = "https://drive.google.com/uc?id=" + fileId;
            
            document.getElementById('pIncAttach').innerHTML = `
                <a href="${inc.Attachment_URL}" target="_blank" style="color:var(--primary); text-decoration:none; display:block; margin-bottom:10px;">🔗 Click here to view original attachment</a>
                <img src="${directImgUrl}" style="max-width:100%; max-height:300px; object-fit:contain; border:1px solid #ccc; padding:5px; margin:auto; display:block;" onerror="this.style.display='none';">
            `;
        } else {
            document.getElementById('pIncAttach').innerHTML = `<a href="${inc.Attachment_URL}" target="_blank" style="color:var(--primary); text-decoration:none;">🔗 Attached Documentations - Available via Link</a>`;
        }
    } else {
        document.getElementById('pIncAttach').innerText = "NIL";
    }
    updateIncidentNavCounter();

    isIncidentEditMode = true;
    currentIncidentEditId = inc.ID;

    let btn = document.getElementById('submitIncBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تعديل بيانات الواقعة';
    btn.style.backgroundColor = "#ffc107";
    btn.style.color = "#000";
    window.scrollTo({ top: document.getElementById('incidentForm').offsetTop - 20, behavior: 'smooth' });
}

async function submitIncident(e) {
    e.preventDefault();
    const btn = document.getElementById('submitIncBtn');
    const originalBtnText = isIncidentEditMode ? '<i class="fa-solid fa-pen-to-square"></i> تعديل بيانات الواقعة' : '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ الواقعة في قاعدة البيانات';
    
    try {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ والتسجيل...';
        btn.disabled = true;
        document.getElementById('incMsg').innerText = "";

        let chks = [];
        if (document.getElementById('chkIncPersonnel').checked) chks.push('Personnel');
        if (document.getElementById('chkIncEq').checked) chks.push('Equipment');
        if (document.getElementById('chkIncAc').checked) chks.push('Aircraft');
        if (document.getElementById('chkIncInFlight').checked) chks.push('InFlight');
        if (document.getElementById('chkIncOnGround').checked) chks.push('OnGround');

        let incId = isIncidentEditMode ? currentIncidentEditId : "INC-" + Date.now();

        let payload = {
            id: incId,
            date: document.getElementById('incDate').value,
            time: document.getElementById('incTime').value,
            location: document.getElementById('incLocation').value,
            personnel: document.getElementById('incPersonnel').value,
            equipmentNo: document.getElementById('incEqNo').value,
            driver: document.getElementById('incDriver').value,
            eqOwner: document.getElementById('incEqOwner').value,
            status: document.getElementById('incStatus').value,
            causes: document.getElementById('incCauses').value,
            charaterization: document.getElementById('incChar').value,
            riskSeverity: document.getElementById('incRiskSev').value,
            riskProb: document.getElementById('incRiskProb').value,
            checkboxes: chks.join(','),
            car: document.getElementById('incCar').value,
            flightNo: document.getElementById('incFlightNo').value,
            reg: document.getElementById('incReg').value,
            orgVia: document.getElementById('incOrgVia').value,
            viaDst: "",
            preparedBy: document.getElementById('incPreparedBy').value,
            hazardDesc: document.getElementById('incHazardDesc').value,
            description: document.getElementById('incDesc').value,
            actionTaken: document.getElementById('incAction').value,
            recommendation: document.getElementById('incRec').value,
            Attachment_URL: isIncidentEditMode ? globalIncidents[currentIncidentIndex].Attachment_URL : "",
            position: document.getElementById('incPosition').value,
            injuryType: document.getElementById('incInjuryType').value,
            causesDetails: document.getElementById('incCausesDetails').value
        };

        let postData = {
            action: isIncidentEditMode ? "updateIncident" : "submitIncident",
            incidentData: payload
        };

        if (incFileBase64) {
            postData.fileData = incFileBase64;
            postData.fileName = incFileName;
            postData.fileMimeType = incFileType;
        }

        let res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        
        let result = await res.json();
        
        if (result.status === "error") {
            throw new Error(result.message);
        }
        
        if (result.fileUrl) payload.Attachment_URL = result.fileUrl;

        let updatedObj = {
            ID: payload.id, Date: payload.date, Time: payload.time, Location: payload.location, Personnel_Involved: payload.personnel, Equipment_No: payload.equipmentNo, Driver_Name: payload.driver, Equipment_Owned: payload.eqOwner, Status: payload.status, Occurrence_Causes: payload.causes, Characterization: payload.charaterization, Risk_Severity: payload.riskSeverity, Risk_Probability: payload.riskProb, Checkboxes: payload.checkboxes, CAR: payload.car, Flight_No: payload.flightNo, REG: payload.reg, ORG_VIA: payload.orgVia, VIA_DST: payload.viaDst, Prepared_By: payload.preparedBy, Hazard_Description: payload.hazardDesc, Description: payload.description, Action_Taken: payload.actionTaken, Recommendation: payload.recommendation, Attachment_URL: payload.Attachment_URL, Position: payload.position, Injury_Type: payload.injuryType, Causes_Details: payload.causesDetails
        };

        if (isIncidentEditMode) {
            globalIncidents[currentIncidentIndex] = updatedObj;
        } else {
            globalIncidents.unshift(updatedObj);
        }

        document.getElementById('incMsg').style.color = "green";
        document.getElementById('incMsg').innerText = "✅ تم حفظ الواقعة بنجاح!";
        
        setTimeout(() => {
            clearIncidentForm();
            renderSavedIncidents();
            document.getElementById('incMsg').innerText = "";
        }, 2000);

    } catch (err) {
        console.error(err);
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
        document.getElementById('incMsg').style.color = "red";
        document.getElementById('incMsg').innerText = "❌ حدث خطأ. تأكد من جودة الاتصال وتصاريح جوجل.";
    }
}

async function deleteIncidentRecord(idx) {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الواقعة تماماً؟")) return;
    
    let inc = globalIncidents[idx];
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "deleteIncident", id: inc.ID }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        globalIncidents.splice(idx, 1);
        renderSavedIncidents();
        alert("تم الحذف بنجاح!");
    } catch (err) {
        alert("خطأ أثناء الحذف!");
    }
}

function renderSavedIncidents() {
    const tbody = document.getElementById('saved-inc-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    updateIncidentNavCounter();

    if (globalIncidents.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>لا توجد وقائع مسجلة.</td></tr>";
        return;
    }

    globalIncidents.forEach((inc, idx) => {
        let d = inc.Date ? inc.Date.split('T')[0] : '';
        let charText = inc.Characterization ? inc.Characterization.split('/')[0] : '';
        let fileIcon = (inc.Attachment_URL && inc.Attachment_URL !== "") ? `<a href="${inc.Attachment_URL}" target="_blank" style="color:var(--primary);"><i class="fa-solid fa-file-pdf"></i></a>` : "-";
        
        tbody.innerHTML += `
        <tr>
            <td dir="ltr">${d}</td>
            <td>${inc.Flight_No || inc.Location || ''}</td>
            <td>${charText}</td>
            <td>${inc.Prepared_By || ''}</td>
            <td style="font-size:1.2rem;">${fileIcon}</td>
            <td>
                <button type="button" onclick="navIncidentTo(${idx})" style="background:#ffc107; border:none; padding:5px; border-radius:4px; cursor:pointer;" title="تعديل"><i class="fa-solid fa-pen"></i></button> 
                <button type="button" onclick="prepareIncidentPrint(${idx})" style="background:var(--primary); color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;" title="طباعة"><i class="fa-solid fa-print"></i></button>
                <button type="button" onclick="deleteIncidentRecord(${idx})" style="background:#dc3545; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;" title="حذف"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    });
}

function prepareIncidentPrint(idx) {
    let inc = globalIncidents[idx];
    document.getElementById('printable-incident-report').style.display = 'block';
    switchIncidentTab('report');

    let chks = (inc.Checkboxes && typeof inc.Checkboxes === 'string') ? inc.Checkboxes.split(',') : [];
    document.getElementById('pChkOG').className = chks.includes('OnGround') ? "checkbox-print checked" : "checkbox-print";
    document.getElementById('pChkIF').className = chks.includes('InFlight') ? "checkbox-print checked" : "checkbox-print";
    document.getElementById('pChkAc').className = chks.includes('Aircraft') ? "checkbox-print checked" : "checkbox-print";
    document.getElementById('pChkEq').className = chks.includes('Equipment') ? "checkbox-print checked" : "checkbox-print";
    document.getElementById('pChkPe').className = chks.includes('Personnel') ? "checkbox-print checked" : "checkbox-print";

    document.getElementById('pIncLoc').innerText = inc.Location || "NIL";
    document.getElementById('pIncInj').innerText = inc.Personnel_Involved === "NIL" ? "NIL" : inc.Personnel_Involved;
    document.getElementById('pIncInjType').innerText = inc.Injury_Type || "NIL";
    document.getElementById('pIncNames').innerText = inc.Personnel_Involved === "NIL" ? "NIL" : inc.Personnel_Involved; 
    document.getElementById('pIncOwner').innerText = inc.Equipment_Owned || "NIL";

    let formattedTime = "NIL";
    if (inc.Time && inc.Time !== "NIL") {
        if (inc.Time.includes('T')) {
            let dateObj = new Date(inc.Time);
            if (!isNaN(dateObj)) {
                let hrs = String(dateObj.getHours()).padStart(2, '0');
                let mins = String(dateObj.getMinutes()).padStart(2, '0');
                formattedTime = `${hrs}:${mins}`;
            }
        } else {
            formattedTime = inc.Time;
        }
    }
    document.getElementById('pIncTime').innerText = formattedTime;
    document.getElementById('pIncDate').innerText = inc.Date ? inc.Date.split('T')[0] : "NIL";
    document.getElementById('pIncDriver').innerText = inc.Driver_Name || "NIL";
    document.getElementById('pIncPosition').innerText = inc.Position || "NIL";
    document.getElementById('pIncAcType').innerText = inc.Equipment_No || "NIL"; 

    let route = ((inc.ORG_VIA || "NIL") + " - " + (inc.VIA_DST || "NIL")).toUpperCase();
    document.getElementById('pIncFlightDetails').innerHTML = `${inc.Flight_No || 'NIL'}<br>Reg: ${inc.REG || 'NIL'}<br>Route: ${route}`;
    document.getElementById('pIncAirlineDetails').innerHTML = `Airline: ${inc.CAR || 'NIL'}`;

    document.getElementById('pIncDesc').innerText = inc.Description || "NIL";
    document.getElementById('pIncHazard').innerText = inc.Hazard_Description || "NIL";
    document.getElementById('pIncCausesDetails').innerText = inc.Causes_Details || "NIL";
    
    let selectedCause = inc.Occurrence_Causes || "";
    let causesHTML = `
        <div class="iso-checklist-row" style="justify-content: flex-start;"><span class="iso-check-box ${selectedCause.includes('Human') ? 'checked' : 'empty'}"></span> أسباب بشرية / Human Causes</div>
        <div class="iso-checklist-row" style="justify-content: flex-start;"><span class="iso-check-box ${selectedCause.includes('Natural') ? 'checked' : 'empty'}"></span> أسباب طبيعية / Natural Causes</div>
        <div class="iso-checklist-row" style="justify-content: flex-start;"><span class="iso-check-box ${selectedCause.includes('Technical') ? 'checked' : 'empty'}"></span> أسباب فنية / Technical Causes</div>
        <div class="iso-checklist-row" style="justify-content: flex-start;"><span class="iso-check-box ${selectedCause.includes('Legal') ? 'checked' : 'empty'}"></span> أسباب قانونية / Legal Causes</div>
        <div class="iso-checklist-row" style="justify-content: flex-start;"><span class="iso-check-box ${selectedCause.includes('Organizational') ? 'checked' : 'empty'}"></span> أسباب تنظيمية / Organizational Causes</div>
    `;
    document.getElementById('pIncCauseList').innerHTML = causesHTML;

    let selectedChar = inc.Characterization || "";
    let charHTML = `
        <div class="iso-checklist-row" style="justify-content: space-between;"><span>حادث معدة / Equipment Accident</span><span class="iso-check-box ${selectedChar.includes('Equipment') ? 'checked' : 'empty'}"></span></div>
        <div class="iso-checklist-row" style="justify-content: space-between;"><span>تسريب إنسكاب / Leakage / Spill</span><span class="iso-check-box ${selectedChar.includes('Leakage') ? 'checked' : 'empty'}"></span></div>
        <div class="iso-checklist-row" style="justify-content: space-between;"><span>ركاب / Passengers</span><span class="iso-check-box ${selectedChar.includes('Passengers') ? 'checked' : 'empty'}"></span></div>
        <div class="iso-checklist-row" style="justify-content: space-between;"><span>إنذار حريق / Fire Alarm</span><span class="iso-check-box ${selectedChar.includes('Fire') ? 'checked' : 'empty'}"></span></div>
        <div class="iso-checklist-row" style="justify-content: space-between;"><span>أخرى / Others</span><span class="iso-check-box ${selectedChar.includes('Others') ? 'checked' : 'empty'}"></span></div>
        <div class="iso-checklist-row" style="justify-content: space-between;"><span>اصطدام / Bird/Animal Strike</span><span class="iso-check-box ${selectedChar.includes('Bird') ? 'checked' : 'empty'}"></span></div>
    `;
    document.getElementById('pIncCharList').innerHTML = charHTML;

    document.getElementById('pIncAction').innerText = inc.Action_Taken || "NIL";
    document.getElementById('pIncRec').innerText = inc.Recommendation || "NIL";
    document.getElementById('pIncPreparedBy').innerText = inc.Prepared_By || "";

    if (inc.Attachment_URL && inc.Attachment_URL.includes("http")) {
        document.getElementById('pIncAttach').innerHTML = `<a href="${inc.Attachment_URL}" target="_blank" style="color:var(--primary); text-decoration:none;">Attached Documentations - Available via Link</a>`;
    } else {
        document.getElementById('pIncAttach').innerText = "NIL";
    }

    window.scrollTo(0, document.getElementById('printable-incident-report').offsetTop);
}

function exportIncidentPDF() {
    const el = document.getElementById('printable-incident-report');
    if (el.style.display === 'none') return alert("برجاء اختيار واقعة للطباعة أولاً.");
    html2pdf().set({
        margin: 0.1,
        filename: 'Incident_Safety_Report.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 4, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
}

function setIncFilter(cat) {
    currentIncidentFilter = cat;
    document.querySelectorAll('#inc-filter-buttons .cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    if(document.getElementById('incFromDate').value && document.getElementById('incToDate').value) {
        generateMonthlyIncidents();
    }
}

function generateMonthlyIncidents() {
    let fromD = document.getElementById('incFromDate').value;
    let toD = document.getElementById('incToDate').value;
    
    if (!fromD || !toD) return alert("برجاء اختيار فترة التاريخ أولاً.");

    let fd = new Date(fromD);
    let td = new Date(toD);
    td.setHours(23, 59, 59, 999);

    if (fd > td) return alert("التاريخ 'إلى' يجب أن يكون أكبر من أو يساوي التاريخ 'من'");

    document.getElementById('printable-monthly-incidents').style.display = 'block';
    document.getElementById('inc-monthly-period').innerText = `الفترة: ${fromD} إلى ${toD} | فلتر: ${currentIncidentFilter}`;

    let filteredInc = globalIncidents.filter(r => {
        if (!r.Date) return false;
        let sd = new Date(r.Date);
        let inDate = (sd >= fd && sd <= td);
        
        if (!inDate) return false;
        
        if (currentIncidentFilter === 'All') return true;
        if (currentIncidentFilter === 'Technical') {
            return r.Occurrence_Causes && r.Occurrence_Causes.includes('Technical');
        }
        return r.Characterization && r.Characterization.includes(currentIncidentFilter);
    });

    const tbody = document.getElementById('inc-monthly-table');
    let tableHTML = `<thead><tr style="background:#e6e6e6; color:#003366;"><th style="padding:10px;">التسلسل</th><th>تصنيف الواقعة</th><th>التاريخ</th><th>البيانات / الجهة المسببة</th><th>الإجمالي</th></tr></thead><tbody>`;

    if (filteredInc.length === 0) {
        tbody.innerHTML = tableHTML + "<tr><td colspan='5' style='text-align:center; padding:20px;'>لا توجد وقائع مسجلة تطابق الفلتر في هذه الفترة</td></tr></tbody>";
        return;
    }

    let grouped = {};
    filteredInc.forEach(inc => {
        let c = inc.Characterization ? inc.Characterization.split('/')[0].trim() : 'Unknown';
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(inc);
    });

    let counter = 1;
    Object.keys(grouped).forEach(cat => {
        let items = grouped[cat];
        let firstRow = true;

        items.forEach((inc) => {
            let d = inc.Date ? inc.Date.split('T')[0] : '';
            let descSafe = inc.Description || '';
            let actSafe = inc.Action_Taken || '';
            
            let detailsHtml = `<strong>Description:</strong><br><span style="color:#555;">${descSafe}</span><br><br><strong>Action Taken:</strong><br><span style="color:#28a745;">${actSafe}</span>`;
            let airlineHtml = `<strong>Airline / Agent:</strong> <span style="color:#003366;">${inc.CAR || inc.Equipment_Owned || '-'}</span>`;

            let row = `<tr>`;
            if (firstRow) {
                row += `<td rowspan="${items.length}" style="text-align:center; font-weight:bold;">${counter < 10 ? '0' + counter : counter}</td>`;
                row += `<td rowspan="${items.length}" style="text-align:center; font-weight:bold;">${cat}</td>`;
            }

            row += `<td style="text-align:center; direction:ltr; vertical-align:top; padding:10px;">${d}</td>`;
            row += `<td style="text-align:justify; padding:10px; direction:ltr; vertical-align:top;">${airlineHtml}<hr style="border-top:1px dashed #ccc; margin:8px 0;">${detailsHtml}</td>`;

            if (firstRow) {
                row += `<td rowspan="${items.length}" style="text-align:center; font-weight:bold; font-size:1.2rem; color:#dc3545;">${items.length < 10 ? '0' + items.length : items.length}</td>`;
                firstRow = false;
            }
            row += `</tr>`;
            
            tableHTML += row;
        });
        counter++;
    });
    
    tableHTML += `</tbody>`;
    tbody.innerHTML = tableHTML;
}

function exportMonthlyIncidentsPDF() {
    const el = document.getElementById('printable-monthly-incidents');
    if (el.style.display === 'none') return alert("برجاء تجهيز التقرير أولاً.");
    html2pdf().set({
        margin: 0.2,
        filename: 'Monthly_Incidents_Summary.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'] }
    }).from(el).save();
}

function switchSpiTab(tab) {
    document.querySelectorAll('#spi-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#spi-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-spi-' + tab).classList.add('active');
    document.getElementById('tab-spi-' + tab).classList.add('active');
    if (tab === 'report') generateSpiReport();
}

function buildSpiEntryForm() {
    const container = document.getElementById('spi-dynamic-inputs');
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
    const msg = document.getElementById('spiMsg');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';

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

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "submitSPI", spiData: spiDataObj }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        msg.style.color = "green";
        msg.innerText = "✅ تم حفظ بيانات مؤشرات الشهر بنجاح!";
        globalSpiData.push({ Year: spiDataObj.year, Month: spiDataObj.month, Indicator_Name: spiDataObj.name, Actual_Value: spiDataObj.actual });
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ وتسجيل بيانات الشهر';
            btn.disabled = false;
            msg.innerText = "";
            document.getElementById('spiForm').reset();
        }, 2000);
    } catch (error) {
        msg.style.color = "red";
        msg.innerText = "❌ حدث خطأ أثناء الإرسال.";
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ وتسجيل بيانات الشهر';
        btn.disabled = false;
    }
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

    let tableHtml = `<table class="report-table spi-matrix-table"><thead><tr><th>Safety issue / SPI</th><th>JAN</th><th>FEB</th><th>MAR</th><th>APR</th><th>MAY</th><th>JUN</th><th>JUL</th><th>AUG</th><th>SEP</th><th>OCT</th><th>NOV</th><th>DEC</th><th style="background:#003366; color:#fff;">Total Events</th><th style="background:#dc3545; color:#fff;">Rate (per 1000)</th></tr></thead><tbody>`;
    let totalMov = 0;
    
    tableHtml += `<tr><td>Number of aircraft movements in the month</td>`;
    for (let i = 1; i <= 12; i++) {
        let m = monthlySpiParsed[i] ? monthlySpiParsed[i].Movements || 0 : 0;
        totalMov += m;
        tableHtml += `<td style="font-weight:bold; background:#e8f5e9;">${m || '-'}</td>`;
    }
    tableHtml += `<td style="font-weight:bold; background:#003366; color:#fff;">${totalMov}</td><td style="background:#dc3545; color:#fff;">-</td></tr>`;

    spiCategories.forEach(cat => {
        tableHtml += `<tr><td colspan="15" style="background:#f4fcf6; color:#28a745; font-weight:bold; text-align:right;">${cat.name}</td></tr>`;
        cat.items.forEach(spi => {
            let totalSpi = 0;
            let rowHtml = `<tr><td>${spi}</td>`;
            for (let i = 1; i <= 12; i++) {
                let val = monthlySpiParsed[i] ? monthlySpiParsed[i][spi] || 0 : 0;
                totalSpi += val;
                rowHtml += `<td>${val || '-'}</td>`;
            }
            let rate = totalMov > 0 ? ((totalSpi / totalMov) * 1000).toFixed(2) : 0;
            rowHtml += `<td style="font-weight:bold; color:#003366;">${totalSpi}</td><td style="font-weight:bold; color:#dc3545;">${rate}</td></tr>`;
            tableHtml += rowHtml;
        });
    });

    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
}

async function addUser(e) {
    e.preventDefault();
    const msg = document.getElementById('userMsg');
    const role = document.getElementById('newUserRole').value;
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newUserPass').value;

    msg.style.color = "blue";
    msg.innerText = "جاري الإضافة...";
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "addUser", role: role, username: username, password: password }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        msg.style.color = "green";
        msg.innerText = "تمت الإضافة بنجاح!";
        globalUsers.push({ Role: role, Username: username, Password: password });
        renderUsersTable();
        document.getElementById('username').innerHTML += `<option value="${username}">${username} (${role})</option>`;
        setTimeout(() => {
            msg.innerText = "";
            document.getElementById('newUsername').value = "";
            document.getElementById('newUserPass').value = "";
        }, 1500);
    } catch (error) {
        msg.style.color = "red";
        msg.innerText = "فشل الاتصال!";
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    globalUsers.forEach((u, i) => {
        tbody.innerHTML += `<tr><td>${i + 1}</td><td>${u.Role}</td><td>${u.Username}</td><td>***</td></tr>`;
    });
}

// ==========================================
// دوال إدارة الأجسام الغريبة FOD (AS-F-01-07)
// ==========================================
function switchFodTab(tab) {
    document.querySelectorAll('#fod-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#fod-section .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-fod-' + tab).classList.add('active');
    document.getElementById('tab-fod-' + tab).classList.add('active');
}

async function submitBulkFOD(e) {
    e.preventDefault();
    const btn = document.getElementById('submitFodBtn');
    const msg = document.getElementById('fodMsg');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';

    const dateVal = document.getElementById('fodBulkDate').value;
    const rows = document.querySelectorAll('#fodBulkForm tbody tr');
    let payloadArr = [];

    // تجميع بيانات كل المواقع
    rows.forEach((row, index) => {
        let loc = row.querySelector('.fod-loc').value;
        let area = row.querySelector('.fod-area').value;
        let plas = parseFloat(row.querySelector('.fod-plas').value || 0).toFixed(3);
        let met = parseFloat(row.querySelector('.fod-met').value || 0).toFixed(3);
        
        payloadArr.push({
            id: "FOD-" + Date.now() + "-" + index, // ID فريد لكل موقع
            date: dateVal,
            location: loc,
            area: area,
            plastic: plas,
            metal: met
        });
    });

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "submitBulkFOD", fodDataArray: payloadArr }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });

        // إضافة البيانات محلياً وعرضها
        payloadArr.forEach(item => {
            globalFodData.unshift({ ID: item.id, Date: item.date, Location: item.location, Area: item.area, Plastic: item.plastic, Metal: item.metal });
        });

        msg.style.color = "green"; msg.innerText = "✅ تم حفظ سجلات اليوم بنجاح!";
        document.getElementById('fodBulkForm').reset();
        renderSavedFOD();

        setTimeout(() => { msg.innerText = ""; btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ تقرير اليوم بالكامل'; }, 2000);
    } catch (err) {
        msg.style.color = "red"; msg.innerText = "❌ فشل الاتصال بالسيرفر.";
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ تقرير اليوم بالكامل';
    }
}

function renderSavedFOD() {
    const tbody = document.getElementById('saved-fod-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (globalFodData.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>لا توجد سجلات FOD محفوظة.</td></tr>";
        return;
    }

    globalFodData.forEach(item => {
        let p = parseFloat(item.Plastic) || 0;
        let m = parseFloat(item.Metal) || 0;
        tbody.innerHTML += `<tr>
            <td dir="ltr">${item.Date ? item.Date.split('T')[0] : ''}</td>
            <td style="font-weight:bold;">${item.Location}</td>
            <td dir="ltr">${item.Area}</td>
            <td dir="ltr">${p.toFixed(3)} kg</td>
            <td dir="ltr">${m.toFixed(3)} kg</td>
            <td dir="ltr" style="font-weight:bold; color:var(--primary);">${(p + m).toFixed(3)} kg</td>
            <td><button type="button" onclick="deleteFodRecord('${item.ID}')" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; border-radius:4px;"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    });
}

async function deleteFodRecord(id) {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    try {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "deleteFOD", id: id }), headers: { "Content-Type": "text/plain;charset=utf-8" } });
        globalFodData = globalFodData.filter(f => String(f.ID) !== String(id));
        renderSavedFOD();
    } catch (err) { alert("فشل الحذف من السيرفر!"); }
}

function generateFodReport() {
    let year = document.getElementById('fodReportYear').value;
    let month = parseInt(document.getElementById('fodReportMonth').value);
    let monthName = document.getElementById('fodReportMonth').options[document.getElementById('fodReportMonth').selectedIndex].text.split(' ')[0];

    document.getElementById('fod-report-title').innerText = `F.O.D Collected and Classifications for ${monthName} ${year}`;

    let filtered = globalFodData.filter(item => {
        if (!item.Date) return false;
        let d = new Date(item.Date);
        return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === month;
    }).sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const tbody = document.getElementById('fod-iso-tbody');
    tbody.innerHTML = "";

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; font-weight:bold;">No FOD records found for this period.</td></tr>`;
        document.getElementById('printable-fod-report').style.display = 'block';
        return;
    }

    let sumPlastic = 0, sumMetal = 0;

    filtered.forEach(row => {
        let p = parseFloat(row.Plastic) || 0;
        let m = parseFloat(row.Metal) || 0;
        sumPlastic += p; sumMetal += m;

        let dObj = new Date(row.Date);
        let dayStr = String(dObj.getDate()).padStart(2, '0') + "/" + String(dObj.getMonth() + 1).padStart(2, '0') + "/" + dObj.getFullYear();

        tbody.innerHTML += `<tr style="height:35px;">
            <td style="border:1px solid #000; padding:8px;">${dayStr}</td>
            <td style="border:1px solid #000; padding:8px; text-align:left;">${row.Location}</td>
            <td style="border:1px solid #000; padding:8px;">${row.Area}</td>
            <td style="border:1px solid #000; padding:8px;">${p.toFixed(3)} kg</td>
            <td style="border:1px solid #000; padding:8px;">${m.toFixed(3)} kg</td>
            <td style="border:1px solid #000; padding:8px;">---</td>
        </tr>`;
    });

    tbody.innerHTML += `<tr style="height:40px; font-weight:bold;">
        <td colspan="3" style="border:1px solid #000; padding:10px; font-size:14px;">Total</td>
        <td style="border:1px solid #000; padding:10px;">${sumPlastic.toFixed(3)} kg</td>
        <td style="border:1px solid #000; padding:10px;">${sumMetal.toFixed(3)} kg</td>
        <td style="border:1px solid #000; padding:10px;">${(sumPlastic + sumMetal).toFixed(3)} kg</td>
    </tr>`;

    document.getElementById('printable-fod-report').style.display = 'block';
}

function exportFodPDF() {
    const el = document.getElementById('printable-fod-report');
    if (el.style.display === 'none') return alert("برجاء تجهيز التقرير أولاً!");
    window.scrollTo(0, 0);
    html2pdf().set({
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: 'FOD_Report_AS-F-01-07.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    }).from(el).save();
}
// ==========================================
// نظام التقليب (Navigation) الخاص بالـ FOD
// ==========================================
let groupedFodDates = [];
let currentFodGroupIndex = -1;

function updateFodNav() {
    let datesSet = new Set(globalFodData.map(f => f.Date ? f.Date.split('T')[0] : ''));
    datesSet.delete('');
    groupedFodDates = Array.from(datesSet).sort((a,b) => new Date(b) - new Date(a)); // الأحدث أولاً

    const ctr = document.getElementById('nav-fod-counter');
    if (ctr) {
        ctr.innerText = groupedFodDates.length > 0 ? `${currentFodGroupIndex + 1} / ${groupedFodDates.length}` : `0 / 0`;
    }
}

function navFOD(direction) {
    if (groupedFodDates.length === 0) return alert("لا توجد سجلات FOD محفوظة بعد.");
    if (direction === 'first') currentFodGroupIndex = 0;
    else if (direction === 'last') currentFodGroupIndex = groupedFodDates.length - 1;
    else if (direction === 'next' && currentFodGroupIndex < groupedFodDates.length - 1) currentFodGroupIndex++;
    else if (direction === 'prev' && currentFodGroupIndex > 0) currentFodGroupIndex--;

    displayFodGroup(currentFodGroupIndex);
}

function displayFodGroup(idx) {
    currentFodGroupIndex = idx;
    let targetDate = groupedFodDates[idx];
    document.getElementById('fodBulkDate').value = targetDate;
    
    // تصفير الخانات
    document.querySelectorAll('#fodBulkForm .fod-area, #fodBulkForm .fod-plas, #fodBulkForm .fod-met').forEach(inp => inp.value = '');

    // تعبئة البيانات الخاصة بهذا اليوم
    let records = globalFodData.filter(f => f.Date && f.Date.startsWith(targetDate));
    const rows = document.querySelectorAll('#fodBulkForm tbody tr');
    rows.forEach(row => {
        let loc = row.querySelector('.fod-loc').value;
        let match = records.find(r => r.Location === loc);
        if (match) {
            row.querySelector('.fod-area').value = match.Area || '';
            row.querySelector('.fod-plas').value = match.Plastic || '';
            row.querySelector('.fod-met').value = match.Metal || '';
        }
    });
    
    updateFodNav();
    let btn = document.getElementById('submitFodBtn');
    btn.innerHTML = '<i class="fa-solid fa-eye"></i> وضع العرض (Read-Only)';
    btn.disabled = true;
}

function clearFODFormForNew() {
    currentFodGroupIndex = -1;
    document.getElementById('fodBulkForm').reset();
    let btn = document.getElementById('submitFodBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> حفظ تقرير اليوم بالكامل';
    updateFodNav();
}

// ابحث في كودك عن دالة renderSavedFOD وأضف في نهايتها استدعاء updateFodNav()
// وبذلك يتحدث العداد فور تحميل البيانات من السيرفر
