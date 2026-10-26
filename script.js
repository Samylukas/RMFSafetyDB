// ==========================================
// تهيئة التطبيق وتسجيل الدخول
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // (باقي دوال التحميل الخاصة بك تبقى كما هي)
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const loginScreen = document.getElementById('login-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (loginScreen) loginScreen.style.display = 'flex';
            }, 500);
        }
    }, 3500);
});

function handleLogin(e) {
    e.preventDefault();
    const userField = document.getElementById('username').value;
    const passField = document.getElementById('password').value;
    
    // التحقق من اسم المستخدم والباسورد
    if (userField !== "" && passField === "1234") {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-header').style.display = 'flex';
        // فتح اللوحة الرئيسية للإدارات بدل لوحة السلامة الفرعية
        openSection('main-departments-dashboard'); 
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
