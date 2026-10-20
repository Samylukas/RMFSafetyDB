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

function finishLoading() {
    try {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) loginScreen.style.display = 'flex';
            }, 500);
        }
    } catch (e) { console.error(e); }
}

setTimeout(finishLoading, 2000);

document.addEventListener('DOMContentLoaded', () => {
    try {
        buildEvaluationForm();
        buildDailyChecklist();
        autoFillDailyDateTime();
        setupCustomDropdown();
        loadAppDataInit();
    } catch (e) { console.error(e); }
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
                if(data.directory) globalDirectory = data.directory;
                
                renderDirectory(globalDirectory);

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
            }
        } catch (e) { console.error(e); }
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
            tableHTML += `<tr><td colspan="6" style="background: #e9ecef; color: #003366; font-weight: 900; text-align: center; padding: 10px; border-top: 2px solid #003366; font-size: 1rem;">${deptName}</td></tr>`;
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
    html2pdf().set({
        margin: 0.2, filename: 'Marsa_Alam_Directory.pdf', image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(el).save().then(() => {
        document.getElementById('dirSearch').style.display = 'block';
        document.querySelectorAll('.dir-actions').forEach(el => el.style.display = ''); 
    });
}
