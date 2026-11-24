/**
 * General Department of Safety and Compliance - Marsa Alam Airport
 * Airport Phone Directory Module (directory.js)
 */

window.API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbxDScIUg6bc3SotrSqzXbVnYgsGMtGEo8_R_0x_sITYRsRjlqbvUiZI1y2fZxR8ifY/exec";
const CACHE_KEY = "rmf_phone_directory_cache";

let isDirAdmin = false;
let directoryData = [];
let currentActorName = "Admin";

function getSessionUserObj() {
  if (typeof currentLoggedInUser !== "undefined" && currentLoggedInUser && currentLoggedInUser.Username) {
    return currentLoggedInUser;
  }
  try {
    const s = sessionStorage.getItem("rmf_user");
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

window.receiveDirectoryFromAppData = function (dirList) {
  if (Array.isArray(dirList) && dirList.length > 0) {
    directoryData = dirList;
    window.globalDirectoryData = dirList;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(directoryData)); } catch (e) {}
    renderTable(directoryData);
    populateDeptDatalist(directoryData);
  }
};

window.openDirExternalLink = function (e, url) {
  if (e) e.preventDefault();
  if (!url) return;
  try {
    if (url.startsWith("tel:")) {
      window.location.href = url;
    } else {
      const w = window.open(url, "_system");
      if (!w) window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (err) {
    window.location.href = url;
  }
};

window.initDirectorySection = function () {
  const uObj = getSessionUserObj();
  const unlockBtn = document.getElementById("admin-unlock-btn");
  if (uObj && uObj.Username) {
    currentActorName = uObj.Username;
    const role = (uObj.Role || "").toLowerCase();
    if (unlockBtn) unlockBtn.style.display = role.includes("admin") ? "inline-flex" : "none";
  } else {
    if (unlockBtn) unlockBtn.style.display = "none";
  }
  if (Array.isArray(window.globalDirectoryData) && window.globalDirectoryData.length > 0) {
    window.receiveDirectoryFromAppData(window.globalDirectoryData);
  } else {
    window.loadData(false);
  }
};

function dirLogout() {
  if (typeof logout === "function") { logout(); return; }
  try { sessionStorage.removeItem("rmf_user"); } catch (e) {}
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const uObj = getSessionUserObj();
  if (uObj && uObj.Username) {
    currentActorName = uObj.Username;
    const role = (uObj.Role || "").toLowerCase();
    if (role.includes("admin")) {
      const unlockBtn = document.getElementById("admin-unlock-btn");
      if (unlockBtn) unlockBtn.style.display = "inline-flex";
    }
  }

  let clicks = 0;
  let clickTimer = null;
  const logo = document.getElementById("secret-logo");
  if (logo) {
    logo.addEventListener("click", () => {
      clicks++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clicks = 0; }, 1200);
      if (clicks === 3) {
        clicks = 0;
        if (isDirAdmin) return alert("أنت بالفعل في وضع التعديل!");
        const sessUser = getSessionUserObj();
        if (sessUser && (sessUser.Role || "").toLowerCase().includes("admin")) {
          window.enableAdminDirectoryMode();
        } else {
          alert("⚠️ وضع تعديل دليل الهاتف مخصص لمدير النظام (Admin) فقط!");
        }
      }
    });
  }

  window.loadData(false);
});

window.enableAdminDirectoryMode = function () {
  if (!navigator.onLine) return alert("لا يمكن تفعيل وضع التعديل بدون اتصال بالإنترنت!");
  const sessUser = getSessionUserObj();
  if (!sessUser || !(sessUser.Role || "").toLowerCase().includes("admin")) {
    return alert("⚠️ هذه الصلاحية مخصصة لمدير النظام (Admin) فقط!");
  }
  isDirAdmin = true;
  currentActorName = sessUser.Username || "Admin";
  const unlockBtn = document.getElementById("admin-unlock-btn");
  if (unlockBtn) unlockBtn.style.display = "none";
  document.getElementById("add-btn").style.display = "inline-flex";
  document.getElementById("exit-admin-btn").style.display = "inline-flex";
  document.querySelectorAll(".action-cell").forEach(cell => cell.style.display = "table-cell");
};

window.exitAdminMode = function () {
  isDirAdmin = false;
  document.getElementById("add-btn").style.display = "none";
  document.getElementById("exit-admin-btn").style.display = "none";
  document.querySelectorAll(".action-cell").forEach(cell => cell.style.display = "none");
  const sessUser = getSessionUserObj();
  if (sessUser && (sessUser.Role || "").toLowerCase().includes("admin")) {
    const unlockBtn = document.getElementById("admin-unlock-btn");
    if (unlockBtn) unlockBtn.style.display = "inline-flex";
  }
};

window.triggerPrint = async function () {
  if (typeof window.isMobileAppOrDevice === "function" && window.isMobileAppOrDevice()) {
    const tblBox = document.querySelector("#directory-section .table-container");
    if (!tblBox) return alert("لا توجد بيانات للطباعة!");
    try {
      const cvs = await window.rmfWithDesktopWidth(tblBox, () => html2canvas(tblBox, { scale: 1.8, useCORS: true, backgroundColor: "#ffffff" }), "820px");
      await window.rmfExportCanvas(cvs, "Marsa_Alam_Airport_Phone_Directory.png", "دليل هاتف مطار مرسى علم الدولي");
    } catch (err) {
      alert("حدث خطأ أثناء تجهيز صورة الدليل.");
    }
    return;
  }
  setTimeout(() => { window.print(); }, 100);
};

window.formatMobileInput = function (input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 11) value = value.substring(0, 11);
  let formatted = "";
  if (value.length > 0) {
    formatted = value.substring(0, 4);
    if (value.length > 4) formatted += " " + value.substring(4, 7);
    if (value.length > 7) formatted += " " + value.substring(7, 11);
  }
  input.value = formatted;
};

window.loadData = function (isRefresh = false) {
  let cachedData = null;
  if (Array.isArray(window.globalDirectoryData) && window.globalDirectoryData.length > 0) {
    cachedData = window.globalDirectoryData;
  } else {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) cachedData = parsed;
      }
    } catch (e) {}
  }

  if (cachedData && Array.isArray(cachedData) && cachedData.length > 0 && !isRefresh) {
    directoryData = cachedData;
    renderTable(directoryData);
    populateDeptDatalist(directoryData);
  }

  const tb = document.getElementById("table-body");
  if (!navigator.onLine) {
    if ((!directoryData || directoryData.length === 0) && tb) {
      tb.innerHTML = '<tr><td colspan="6" style="color:#dc3545;text-align:center;padding:15px;font-weight:bold;">غير متصل بالإنترنت ولا توجد بيانات محفوظة مسبقاً.</td></tr>';
    }
    return;
  }

  if (isRefresh || (!directoryData || directoryData.length === 0)) {
    if (tb) tb.innerHTML = '<tr><td colspan="6" class="loading"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل بيانات دليل الهاتف...</td></tr>';
  }

  // استخدام JSONP لأنه يعمل 100% داخل تطبيق الأندرويد (WebView) بدون حظر CORS
  const cb = "jsonpDir_" + Math.round(100000 * Math.random());
  const timer = setTimeout(() => {
    delete window[cb];
    if ((!directoryData || directoryData.length === 0) && tb) {
      tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:16px;color:#dc3545;font-weight:bold;">تعذر سحب البيانات حالياً. <button type="button" onclick="forceRefreshData()" style="background:#6f42c1;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;margin-right:8px;font-family:Cairo,sans-serif;">إعادة المحاولة</button></td></tr>';
    }
  }, 12000);

  window[cb] = function (d) {
    clearTimeout(timer);
    try {
      if (d && d.status === "success" && Array.isArray(d.directory) && d.directory.length > 0) {
        directoryData = d.directory;
        window.globalDirectoryData = directoryData;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(directoryData)); } catch (e) {}
        renderTable(directoryData);
        populateDeptDatalist(directoryData);
      } else if ((!directoryData || directoryData.length === 0) && tb) {
        tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:15px;color:#777;">لا توجد أرقام مسجلة في الشيت حالياً.</td></tr>';
      }
    } finally {
      delete window[cb];
    }
  };

  const s = document.createElement("script");
  s.src = window.API_URL + "?action=getAppData&_t=" + Date.now() + "&callback=" + cb;
  s.onerror = () => {
    clearTimeout(timer);
    delete window[cb];
    if ((!directoryData || directoryData.length === 0) && tb) {
      tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:16px;color:#dc3545;font-weight:bold;">تعذر الاتصال بقاعدة البيانات. <button type="button" onclick="forceRefreshData()" style="background:#6f42c1;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;margin-right:8px;font-family:Cairo,sans-serif;">إعادة المحاولة</button></td></tr>';
    }
  };
  document.body.appendChild(s);
};

window.forceRefreshData = function () {
  window.loadData(true);
};

function populateDeptDatalist(data) {
  const dl = document.getElementById("dirDeptsList");
  if (!dl) return;
  const set = new Set();
  data.forEach(r => {
    if (r.Department && String(r.Department).trim()) set.add(String(r.Department).trim());
  });
  dl.innerHTML = Array.from(set).map(d => `<option value="${d.replace(/"/g, "&quot;")}"></option>`).join("");
}

function renderTable(data) {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:15px;color:#777;font-weight:bold;">لا توجد بيانات مطابقة</td></tr>';
    return;
  }

  let groupedData = {};
  data.forEach(row => {
    let dept = (row.Department || "إدارات أخرى").toString().trim();
    if (!groupedData[dept]) groupedData[dept] = [];
    groupedData[dept].push(row);
  });

  let counter = 1;
  for (const [dept, employees] of Object.entries(groupedData)) {
    tbody.innerHTML += `<tr class="dept-row"><td colspan="6">${dept}</td></tr>`;
    employees.forEach(emp => {
      let empId = emp.ID || emp.id || ("ROW-" + counter);
      let extVal = emp.EXT !== undefined ? emp.EXT : (emp.Ext || "");
      let mobileStr = emp.Mobile ? String(emp.Mobile).trim() : "";
      let mobileRaw = mobileStr.replace(/\D/g, "");

      let waNumber = mobileRaw;
      if (waNumber.startsWith("0")) waNumber = "20" + waNumber.substring(1);

      let mobileContent = "-";
      if (mobileRaw) {
        mobileContent = `
          <div class="mobile-cell">
            <span class="mobile-number-text">${mobileStr}</span>
            <div class="quick-actions">
              <a href="tel:${mobileRaw}" onclick="openDirExternalLink(event, 'tel:${mobileRaw}')" class="action-btn-call" title="اتصال"><i class="fas fa-phone-alt"></i></a>
              <a href="https://wa.me/${waNumber}" onclick="openDirExternalLink(event, 'https://wa.me/${waNumber}')" class="action-btn-wa" title="واتساب"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
        `;
      }

      tbody.innerHTML += `
        <tr>
          <td>${counter}</td>
          <td style="font-weight:bold;">${emp.Name || ""}</td>
          <td>${emp.Role || ""}</td>
          <td style="color: var(--danger-red); font-weight: bold;" dir="ltr">${extVal}</td>
          <td>${mobileContent}</td>
          <td class="action-cell">
            <div class="action-btns">
              <button type="button" class="btn-icon btn-edit" onclick="editRecord('${String(empId).replace(/'/g, "\\'")}')" title="تعديل"><i class="fas fa-pen"></i></button>
              <button type="button" class="btn-icon btn-delete" onclick="deleteRecord('${String(empId).replace(/'/g, "\\'")}')" title="حذف"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
      counter++;
    });
  }

  if (isDirAdmin) {
    document.querySelectorAll(".action-cell").forEach(cell => cell.style.display = "table-cell");
  }
}

window.filterTable = function () {
  const input = (document.getElementById("search-input")?.value || "").toLowerCase();
  const clrBtn = document.getElementById("clear-search-btn");
  if (clrBtn) clrBtn.style.display = input.length > 0 ? "block" : "none";

  const filteredData = directoryData.filter(row => {
    const extVal = row.EXT !== undefined ? row.EXT : (row.Ext || "");
    return (row.Name && String(row.Name).toLowerCase().includes(input)) ||
           (row.Role && String(row.Role).toLowerCase().includes(input)) ||
           (row.Department && String(row.Department).toLowerCase().includes(input)) ||
           (extVal && String(extVal).toLowerCase().includes(input)) ||
           (row.Mobile && String(row.Mobile).toLowerCase().includes(input));
  });
  renderTable(filteredData);
};

window.clearSearch = function () {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  window.filterTable();
};

window.openModal = function (id = null) {
  if (!isDirAdmin) return alert("⚠️ هذه الصلاحية مخصصة لمدير النظام (Admin) فقط!");
  document.getElementById("admin-modal").style.display = "flex";
  if (id) {
    document.getElementById("modal-title").innerText = "تعديل بيانات الموظف / الجهة";
    const emp = directoryData.find(e => String(e.ID) === String(id));
    if (emp) {
      document.getElementById("emp-id").value = emp.ID;
      document.getElementById("emp-dept").value = emp.Department || "";
      document.getElementById("emp-name").value = emp.Name || "";
      document.getElementById("emp-role").value = emp.Role || "";
      document.getElementById("emp-ext").value = emp.EXT !== undefined ? emp.EXT : (emp.Ext || "");
      const mobileInput = document.getElementById("emp-mobile");
      mobileInput.value = emp.Mobile || "";
      window.formatMobileInput(mobileInput);
    }
  } else {
    document.getElementById("modal-title").innerText = "إضافة رقم جديد للدليل";
    document.querySelectorAll(".dir-modal-content input[type='text']").forEach(i => i.value = "");
    document.getElementById("emp-id").value = "DIR-" + Date.now();
  }
};

window.closeModal = function () {
  document.getElementById("admin-modal").style.display = "none";
};

window.editRecord = function (id) {
  window.openModal(id);
};

window.saveRecord = async function () {
  if (!navigator.onLine) return alert("لا يمكنك إضافة أو تعديل بيانات وأنت غير متصل بالإنترنت!");
  if (!isDirAdmin) return alert("⚠️ صلاحية مرفوضة: للمدير فقط.");

  const id = document.getElementById("emp-id").value;
  const dept = document.getElementById("emp-dept").value.trim() || "إدارات أخرى";
  const name = document.getElementById("emp-name").value.trim();
  const role = document.getElementById("emp-role").value.trim();
  const ext = document.getElementById("emp-ext").value.trim();
  const mobile = document.getElementById("emp-mobile").value.trim();

  if (!name) return alert("يرجى إدخال الاسم!");

  const isEdit = directoryData.some(e => String(e.ID) === String(id));
  const payload = {
    action: isEdit ? "editDirectory" : "addDirectory",
    performedBy: currentActorName,
    id: id,
    department: dept,
    name: name,
    role: role,
    ext: ext,
    mobile: mobile
  };

  window.closeModal();
  document.getElementById("table-body").innerHTML = '<tr><td colspan="6" class="loading"><i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ والمزامنة...</td></tr>';

  try {
    await fetch(window.API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    if (isEdit) {
      const idx = directoryData.findIndex(e => String(e.ID) === String(id));
      if (idx > -1) directoryData[idx] = { ID: id, Department: dept, Name: name, Role: role, EXT: ext, Mobile: mobile };
    } else {
      directoryData.push({ ID: id, Department: dept, Name: name, Role: role, EXT: ext, Mobile: mobile });
    }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(directoryData)); } catch (e) {}
    renderTable(directoryData);
    populateDeptDatalist(directoryData);
    setTimeout(() => window.forceRefreshData(), 1500);
  } catch (err) {
    alert("حدث خطأ أثناء الحفظ!");
    renderTable(directoryData);
  }
};

window.deleteRecord = async function (id) {
  if (!navigator.onLine) return alert("لا يمكنك حذف بيانات وأنت غير متصل بالإنترنت!");
  if (!isDirAdmin) return alert("⚠️ صلاحية مرفوضة: للمدير فقط.");

  const emp = directoryData.find(e => String(e.ID) === String(id));
  const label = emp ? `${emp.Name} (${emp.Department})` : id;
  if (!confirm(`⚠️ هل أنت متأكد من حذف (${label}) من دليل الهاتف؟`)) return;

  document.getElementById("table-body").innerHTML = '<tr><td colspan="6" class="loading"><i class="fa-solid fa-spinner fa-spin"></i> جاري الحذف...</td></tr>';

  try {
    await fetch(window.API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "deleteDirectory",
        performedBy: currentActorName,
        id: id,
        name: emp ? emp.Name : "",
        department: emp ? emp.Department : ""
      })
    });
    directoryData = directoryData.filter(e => String(e.ID) !== String(id));
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(directoryData)); } catch (e) {}
    renderTable(directoryData);
    setTimeout(() => window.forceRefreshData(), 1500);
  } catch (err) {
    alert("حدث خطأ أثناء الحذف!");
    renderTable(directoryData);
  }
};
