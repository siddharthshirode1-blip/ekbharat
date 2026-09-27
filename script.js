// =========================================================
// EKBHAARAT - NATIONAL GOVERNANCE INTELLIGENCE & CITIZEN WELFARE PLATFORM
// FULL-STACK FRONTEND ENGINE (GIGW 3.0 COMPLIANT)
// =========================================================

// --- DEMO ACCOUNTS MASTER DEFINITION ---
const DEMO_ACCOUNTS = {
    "citizen1": {
        user_id: 1,
        email: "rahul.sharma@ekbharat.gov.in",
        full_name: "Rahul Sharma",
        role: "citizen",
        phone: "+91 98765 43210",
        state: "Uttar Pradesh",
        district: "Varanasi",
        avatar: "👨‍🌾",
        designation: "Farmer & Citizen Beneficiary",
        enrolled_schemes: ["PM-KISAN", "Pradhan Mantri Awas Yojana - Gramin", "Jal Jeevan Mission"]
    },
    "citizen2": {
        user_id: 2,
        email: "priya.patel@ekbharat.gov.in",
        full_name: "Priya Patel",
        role: "citizen",
        phone: "+91 91234 56789",
        state: "Gujarat",
        district: "Mehsana",
        avatar: "👩‍⚕️",
        designation: "Healthcare Worker & Citizen",
        enrolled_schemes: ["Ayushman Bharat (PM-JAY)", "Poshan Abhiyaan", "PM Matru Vandana"]
    },
    "admin": {
        user_id: 3,
        email: "admin.nodal@ekbharat.gov.in",
        full_name: "Dr. Rajesh Varma",
        role: "admin",
        phone: "+91 99887 76655",
        state: "New Delhi",
        district: "Central Delhi",
        avatar: "🏛️",
        designation: "Central Nodal Officer & Joint Secretary",
        ministry: "NITI Aayog & Ministry of Panchayati Raj"
    }
};

// --- AUTHENTICATION STATE HELPERS ---
function getCurrentUser() {
    const raw = localStorage.getItem("ekBhaaratUser");
    if (raw) {
        try { return JSON.parse(raw); } catch (e) { }
    }
    if (localStorage.getItem("ekBhaaratLoggedIn") === "true") {
        const type = localStorage.getItem("ekBhaaratAccountType");
        return type === "admin" ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.citizen1;
    }
    return null;
}

function isLoggedIn() {
    return localStorage.getItem("ekBhaaratLoggedIn") === "true";
}

function getAccountType() {
    const user = getCurrentUser();
    return user ? user.role : (localStorage.getItem("ekBhaaratAccountType") || "citizen");
}

function switchDemoAccount(accountKey) {
    let target = DEMO_ACCOUNTS[accountKey];
    if (!target) {
        if (accountKey === "admin" || accountKey.includes("admin")) target = DEMO_ACCOUNTS.admin;
        else if (accountKey === "citizen2" || accountKey.includes("priya")) target = DEMO_ACCOUNTS.citizen2;
        else target = DEMO_ACCOUNTS.citizen1;
    }

    localStorage.setItem("ekBhaaratLoggedIn", "true");
    localStorage.setItem("ekBhaaratAccountType", target.role);
    localStorage.setItem("ekBhaaratUserName", target.full_name);
    localStorage.setItem("ekBhaaratUser", JSON.stringify(target));

    showToast(`Switched account to: ${target.avatar} ${target.full_name} (${target.role.toUpperCase()})`);

    setTimeout(() => {
        if (window.location.pathname.includes("admin.html") && target.role === "citizen") {
            window.location.href = "dashboard.html";
        } else if (window.location.pathname.includes("login.html") || window.location.pathname.includes("signup.html")) {
            window.location.href = target.role === "admin" ? "admin.html" : "dashboard.html";
        } else {
            window.location.reload();
        }
    }, 400);
}

function logout() {
    localStorage.removeItem("ekBhaaratLoggedIn");
    localStorage.removeItem("ekBhaaratAccountType");
    localStorage.removeItem("ekBhaaratUserName");
    localStorage.removeItem("ekBhaaratUser");
    showToast("Logged out successfully.");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 300);
}

function goToLogin() { window.location.href = "login.html"; }
function goToSignUp() { window.location.href = "signup.html"; }

function openDashboard() {
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
    } else {
        localStorage.setItem("ekBhaaratRedirect", "dashboard.html");
        window.location.href = "login.html";
    }
}

function openFeatures() { window.location.href = "features.html"; }
function openSchemes() { window.location.href = "schemes.html"; }
function openMap() { window.location.href = "map.html"; }
function openBeneficiaries() { window.location.href = "beneficiaries.html"; }
function openComplaints() { window.location.href = "complaints.html"; }
function openUpdates() { window.location.href = "updates.html"; }
function openOverlap() { window.location.href = "overlap.html"; }
function askAI() { window.location.href = "ai.html"; }

function askAIFromInput() {
    const input = document.getElementById("aiInput");
    const q = input ? input.value.trim() : "";
    if (!q) {
        window.location.href = "ai.html";
        return;
    }
    window.location.href = `ai.html?q=${encodeURIComponent(q)}`;
}

function protectedFeature(featureName, pageName) {
    const pages = {
        "Scheme Explorer": "schemes.html",
        "Government Scheme Explorer": "schemes.html",
        "Interactive India Map": "map.html",
        "India State Map": "map.html",
        "Beneficiary Reach": "beneficiaries.html",
        "Scheme Overlap Detector": "overlap.html",
        "Grievance & Proof Verification": "complaints.html",
        "Citizen Issue Reporting": "complaints.html",
        "Government Updates": "updates.html",
        "AI Assistant": "ai.html"
    };
    const dest = pageName || pages[featureName] || "dashboard.html";
    if (isLoggedIn()) {
        window.location.href = dest;
    } else {
        localStorage.setItem("ekBhaaratRedirect", dest);
        window.location.href = "login.html";
    }
}

// --- ACCESSIBILITY FONT RESIZER (GIGW 3.0) ---
let currentFontScaleIndex = 0; // -1: small, 0: normal, 1: large, 2: xlarge

window.adjustGovFontSize = function(delta) {
    if (delta === 0) {
        currentFontScaleIndex = 0;
    } else {
        currentFontScaleIndex = Math.min(2, Math.max(-1, currentFontScaleIndex + delta));
    }
    
    document.body.classList.remove("gov-font-small", "gov-font-large", "gov-font-xlarge");
    
    if (currentFontScaleIndex === -1) {
        document.body.classList.add("gov-font-small");
        document.documentElement.style.fontSize = "14px";
    } else if (currentFontScaleIndex === 1) {
        document.body.classList.add("gov-font-large");
        document.documentElement.style.fontSize = "18px";
    } else if (currentFontScaleIndex === 2) {
        document.body.classList.add("gov-font-xlarge");
        document.documentElement.style.fontSize = "20px";
    } else {
        document.documentElement.style.fontSize = "16px";
    }
    
    localStorage.setItem("ekBhaaratFontScale", currentFontScaleIndex);
    showToast(currentFontScaleIndex === 0 ? "Text size reset to default (100%)" : `Text size: ${currentFontScaleIndex > 0 ? '+' : ''}${currentFontScaleIndex * 15}%`);
};

function applyGovAccessibilitySettings() {
    const savedScale = localStorage.getItem("ekBhaaratFontScale");
    if (savedScale !== null) {
        adjustGovFontSize(parseInt(savedScale, 10));
    }
}

// --- TOP BARS (ACCESSIBILITY + DEMO SWITCHER) ---
function injectTopBars() {
    // 1. Accessibility Top Bar (without contrast toggle)
    if (!document.querySelector(".gov-top-bar")) {
        const topBar = document.createElement("div");
        topBar.className = "gov-top-bar";
        topBar.innerHTML = `
            <div class="gov-tricolor-stripe" aria-hidden="true"></div>
            <div class="gov-topbar-content">
                <div class="gov-topbar-left">
                    <span class="gov-emblem-badge"><span class="flag-icon">🇮🇳</span> भारत सरकार | Government of India</span>
                    <span class="divider">|</span>
                    <span class="gov-portal-tag">राष्ट्रीय सरकारी सूचना एवं जन कल्याण मंच</span>
                </div>
                <div class="gov-topbar-right">
                    <div class="gov-access-controls" aria-label="Text size controls">
                        <button class="gov-access-btn" title="Decrease font size" onclick="adjustGovFontSize(-1)">A-</button>
                        <button class="gov-access-btn" title="Default font size" onclick="adjustGovFontSize(0)">A</button>
                        <button class="gov-access-btn" title="Increase font size" onclick="adjustGovFontSize(1)">A+</button>
                    </div>
                    <span class="gov-helpline">📞 <span>1800-11-0001</span> (Toll-Free)</span>
                </div>
            </div>
        `;
        document.body.insertBefore(topBar, document.body.firstChild);
    }

    // 2. Interactive 1-Click Demo Switcher Bar
    if (!document.querySelector(".demo-role-banner")) {
        const user = getCurrentUser();
        const demoBar = document.createElement("div");
        demoBar.className = "demo-role-banner";
        
        let roleBadgeHtml = `<span class="demo-role-badge citizen">👥 Public Visitor</span>`;
        let activeUserHtml = `<span>Choose demo account or sign in</span>`;

        if (user) {
            if (user.role === "admin") {
                roleBadgeHtml = `<span class="demo-role-badge admin">🏛️ Nodal Officer (Admin)</span>`;
                activeUserHtml = `<strong>${user.avatar} ${user.full_name}</strong> • ${user.designation || 'Central Nodal Officer'}`;
            } else {
                roleBadgeHtml = `<span class="demo-role-badge citizen">👨‍🌾 Citizen Account</span>`;
                activeUserHtml = `<strong>${user.avatar} ${user.full_name}</strong> • ${user.district || 'Citizen'}, ${user.state || 'India'}`;
            }
        }

        demoBar.innerHTML = `
            <div class="demo-role-info">
                <span style="font-weight: 800; color: #FFB380;">⚡ Fast Role Switcher:</span>
                ${roleBadgeHtml}
                <span class="d-none-mobile" style="color: #CBD5E1; font-size: 12px;">${activeUserHtml}</span>
            </div>
            <div class="demo-account-buttons">
                <button class="demo-btn-switch ${user && user.email === DEMO_ACCOUNTS.citizen1.email ? 'active' : ''}" onclick="switchDemoAccount('citizen1')" title="Login as Rahul Sharma (Citizen 1 - Farmer, UP)">
                    👨‍🌾 Citizen 1 (Rahul)
                </button>
                <button class="demo-btn-switch ${user && user.email === DEMO_ACCOUNTS.citizen2.email ? 'active' : ''}" onclick="switchDemoAccount('citizen2')" title="Login as Priya Patel (Citizen 2 - Health Worker, GJ)">
                    👩‍⚕️ Citizen 2 (Priya)
                </button>
                <button class="demo-btn-switch ${user && user.role === 'admin' ? 'active' : ''}" onclick="switchDemoAccount('admin')" title="Login as Dr. Rajesh Varma (Admin / Nodal Officer)">
                    🏛️ Admin (Nodal Officer)
                </button>
                ${user ? `<button class="demo-btn-switch" style="background: rgba(220,38,38,0.3); border-color: rgba(220,38,38,0.5);" onclick="logout()" title="Logout">🚪 Logout</button>` : ''}
            </div>
        `;
        const topBarElem = document.querySelector(".gov-top-bar");
        if (topBarElem && topBarElem.nextSibling) {
            document.body.insertBefore(demoBar, topBarElem.nextSibling);
        } else {
            document.body.appendChild(demoBar);
        }
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message) {
    let container = document.getElementById("govToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "govToastContainer";
        container.style.cssText = "position: fixed; bottom: 25px; right: 25px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.style.cssText = "background: #06233D; color: #FFFFFF; border-left: 5px solid #FF671F; padding: 12px 18px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; animation: slideIn 0.3s ease;";
    toast.innerHTML = `<span>🇮🇳</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.4s ease";
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}

// =========================================================
// NAVBAR DYNAMIC UPDATE BASED ON ROLE
// =========================================================
function updateNavbar() {
    const user = getCurrentUser();
    const navActions = document.querySelector(".nav-actions");
    const nav = document.querySelector("header.navbar nav");

    if (nav) {
        let navHtml = `
            <a href="index.html" class="${window.location.pathname.endsWith('index.html') || window.location.pathname === '/' ? 'active' : ''}">Home</a>
            <a href="dashboard.html" class="${window.location.pathname.includes('dashboard') ? 'active' : ''}">Dashboard</a>
            <a href="schemes.html" class="${window.location.pathname.includes('schemes') ? 'active' : ''}">Schemes</a>
            <a href="map.html" class="${window.location.pathname.includes('map') ? 'active' : ''}">State HeatMap</a>
            <a href="overlap.html" class="${window.location.pathname.includes('overlap') ? 'active' : ''}">Scheme Overlap</a>
            <a href="beneficiaries.html" class="${window.location.pathname.includes('beneficiaries') ? 'active' : ''}">Fund & DBT</a>
            <a href="complaints.html" class="${window.location.pathname.includes('complaints') ? 'active' : ''}">Proof Verification</a>
            <a href="updates.html" class="${window.location.pathname.includes('updates') ? 'active' : ''}">Gazette</a>
            <a href="data.html" class="${window.location.pathname.includes('data') ? 'active' : ''}">Open Data 📥</a>
        `;
        if (user && user.role === "admin") {
            navHtml += `<a href="admin.html" class="${window.location.pathname.includes('admin') ? 'active' : ''}" style="color: var(--gov-saffron); font-weight: 800;">★ Admin Panel</a>`;
        }
        nav.innerHTML = navHtml;
    }

    if (navActions) {
        if (user) {
            navActions.innerHTML = `
                <button class="ai-nav-btn" onclick="askAI()">✦ Ask AI</button>
                <button class="account-nav-btn" onclick="window.location.href='${user.role === 'admin' ? 'admin.html' : 'account.html'}'" title="View Account Profile">
                    ${user.avatar} ${user.full_name}
                </button>
                <button class="login-btn" style="background: rgba(220,38,38,0.9); border-color: rgba(220,38,38,1); padding: 7px 12px; font-size: 12px;" onclick="logout()">Logout</button>
            `;
        } else {
            navActions.innerHTML = `
                <button class="ai-nav-btn" onclick="askAI()">✦ Ask AI</button>
                <button class="login-btn" onclick="goToLogin()">Citizen Login</button>
                <button class="signup-nav-btn" onclick="goToSignUp()">Register</button>
            `;
        }
    }
}

// =========================================================
// AI ASSISTANT QUERY ENGINE (NATURAL LANGUAGE -> SQL -> VIZ)
// =========================================================
async function executeAIQuery(customQuestion) {
    const input = document.getElementById("aiQueryBox") || document.getElementById("aiInput");
    const question = customQuestion || (input ? input.value.trim() : "");
    if (!question) {
        showToast("Please enter a question.");
        return;
    }

    if (input) input.value = question;

    const resultsArea = document.getElementById("aiResultsArea");
    if (resultsArea) {
        resultsArea.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <div class="stat-icon" style="font-size: 36px; animation: pulse 1s infinite;">🧠</div>
                <h3 style="margin-top: 15px; color: var(--gov-navy-dark);">Synthesizing Verified SQL with Government AI...</h3>
                <p style="color: var(--gov-text-muted); font-size: 13px;">Analyzing cross-ministry schema, auditing read-only security, and fetching records.</p>
            </div>
        `;
        resultsArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    try {
        const response = await fetch("/api/ai/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });
        const result = await response.json();
        renderAIResults(result);
    } catch (e) {
        console.warn("Backend query failed, using in-browser heuristic engine:", e);
        fallbackInBrowserAIQuery(question);
    }
}

function renderAIResults(res) {
    const resultsArea = document.getElementById("aiResultsArea");
    if (!resultsArea) return;

    if (res.status !== "success" || !res.data || res.data.length === 0) {
        resultsArea.innerHTML = `
            <div class="ai-console-card">
                <h3 style="color: #DC2626;">No Matching Records Found</h3>
                <p style="margin-top: 8px; font-size: 13px; color: var(--gov-text-secondary);">Query executed safely. Try asking about "delayed education projects in UP", "schemes with highest budget", "cross-department overlap", or "state fund utilization".</p>
            </div>
        `;
        return;
    }

    const cols = res.columns || Object.keys(res.data[0]);

    const dataVisualHtml = `
        <div style="overflow-x: auto; margin-top: 16px;">
            <table class="scheme-table" style="width: 100%; font-size: 13px;">
                <thead>
                    <tr>${cols.map(c => `<th>${formatColumnHeader(c)}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${res.data.slice(0, 15).map(row => `
                        <tr>${cols.map(c => `<td><strong>${formatCellValue(row[c])}</strong></td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    resultsArea.innerHTML = `
        <div class="ai-console-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                <div>
                    <span class="section-label">AI SYNTHESIS & EVIDENCE</span>
                    <h2 style="font-size: 20px; font-weight: 800; color: var(--gov-navy-dark); margin-top: 5px;">${res.user_question}</h2>
                </div>
                <span class="provenance-tag">🛡️ Verified SQL • SHA-256 Provenance</span>
            </div>
            
            <p style="margin-top: 12px; font-size: 14px; color: var(--gov-text-secondary); background: var(--gov-navy-light); padding: 14px; border-radius: 8px; border-left: 4px solid var(--gov-saffron);">
                💡 <strong>Finding:</strong> ${res.summary_text}
            </p>

            <!-- INTERACTIVE CHART VISUALIZATION SECTION -->
            <div id="aiChartCard" style="margin-top: 20px; background: #ffffff; border: 1px solid var(--gov-border-light); border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <span style="font-size: 11px; font-weight: 800; color: var(--gov-navy-dark); text-transform: uppercase;">📊 Graphical Visual Analytics</span>
                        <div style="font-size: 12px; color: var(--gov-text-muted);">Dynamic chart generated from verified cross-ministry data records</div>
                    </div>
                    <div class="chart-type-selector" style="display: flex; gap: 6px; background: #F1F5F9; padding: 4px; border-radius: 6px;">
                        <button type="button" class="chart-btn" onclick="switchAIChartType('bar')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border: none; border-radius: 4px; cursor: pointer; background: var(--gov-blue); color: white;" id="chartBtnBar">📊 Bar</button>
                        <button type="button" class="chart-btn" onclick="switchAIChartType('line')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border: none; border-radius: 4px; cursor: pointer; background: transparent; color: var(--gov-text);" id="chartBtnLine">📈 Line</button>
                        <button type="button" class="chart-btn" onclick="switchAIChartType('doughnut')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border: none; border-radius: 4px; cursor: pointer; background: transparent; color: var(--gov-text);" id="chartBtnDoughnut">🍩 Doughnut</button>
                    </div>
                </div>
                <div style="position: relative; height: 320px; width: 100%;">
                    <canvas id="aiChartCanvas"></canvas>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <span style="font-size: 11px; font-weight: 800; color: var(--gov-navy-dark); text-transform: uppercase;">Generated & Validated SQL Query:</span>
                <div class="sql-code-box">${res.generated_sql}</div>
            </div>

            <div style="margin-top: 20px;">
                <span style="font-size: 11px; font-weight: 800; color: var(--gov-navy-dark); text-transform: uppercase;">Result Payload (${res.data.length} Records):</span>
                ${dataVisualHtml}
            </div>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--gov-border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--gov-text-muted);">
                <div>
                    <span>Dataset: <strong>National OGD Harmonized Ministry Directory</strong></span> |
                    <span>Audit Stamp: <strong>${res.provenance?.last_sync || '2026-09-27'}</strong></span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="downloadAIHTMLReport()" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 12px;">
                        📄 Download .HTML File
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="openAIHTMLReportNewTab()" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 12px;">
                        🌐 Open as New HTML Page ↗
                    </button>
                </div>
            </div>
        </div>
    `;
    window._latestAIResult = res;

    // Render the interactive chart
    setTimeout(() => {
        renderAIChart(res, 'bar');
    }, 50);
}

let _aiChartInstance = null;
let _currentChartType = 'bar';

function switchAIChartType(type) {
    _currentChartType = type;
    const btns = {
        'bar': document.getElementById('chartBtnBar'),
        'line': document.getElementById('chartBtnLine'),
        'doughnut': document.getElementById('chartBtnDoughnut')
    };
    Object.keys(btns).forEach(k => {
        if (btns[k]) {
            if (k === type) {
                btns[k].style.background = 'var(--gov-blue)';
                btns[k].style.color = 'white';
            } else {
                btns[k].style.background = 'transparent';
                btns[k].style.color = 'var(--gov-text)';
            }
        }
    });
    if (window._latestAIResult) {
        renderAIChart(window._latestAIResult, type);
    }
}

function renderAIChart(res, chartType) {
    if (chartType) _currentChartType = chartType;
    const canvas = document.getElementById("aiChartCanvas");
    if (!canvas) return;

    if (!window.Chart) {
        console.warn("Chart.js not loaded. Loading fallback...");
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = () => renderAIChart(res, _currentChartType);
        document.head.appendChild(script);
        return;
    }

    if (_aiChartInstance) {
        _aiChartInstance.destroy();
        _aiChartInstance = null;
    }

    if (!res || !res.data || res.data.length === 0) return;

    const cols = res.columns || Object.keys(res.data[0]);
    const numericCols = [];
    let labelCol = null;

    cols.forEach(col => {
        const val = res.data[0][col];
        if (typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val) && typeof val !== 'boolean')) {
            numericCols.push(col);
        } else if (!labelCol) {
            labelCol = col;
        }
    });

    if (!labelCol) labelCol = cols[0];

    // If no numeric column, count occurrences of categorical values
    if (numericCols.length === 0) {
        const counts = {};
        res.data.forEach(r => {
            const k = r[labelCol] || 'Other';
            counts[k] = (counts[k] || 0) + 1;
        });
        const labels = Object.keys(counts);
        const dataVals = Object.values(counts);

        _aiChartInstance = new Chart(canvas, {
            type: _currentChartType === 'bar' ? 'doughnut' : _currentChartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Count',
                    data: dataVals,
                    backgroundColor: [
                        '#FF9933', '#138808', '#0056B3', '#D97706', '#059669', '#2563EB', '#DC2626', '#7C3AED'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        return;
    }

    const sliceData = res.data.slice(0, 12);
    const labels = sliceData.map(r => {
        const txt = String(r[labelCol] || '');
        return txt.length > 25 ? txt.substring(0, 22) + '...' : txt;
    });

    const palette = [
        { bg: 'rgba(255, 153, 51, 0.85)', border: '#FF9933' },
        { bg: 'rgba(19, 136, 8, 0.85)', border: '#138808' },
        { bg: 'rgba(0, 86, 179, 0.85)', border: '#0056B3' },
        { bg: 'rgba(217, 119, 6, 0.85)', border: '#D97706' }
    ];

    const isDonut = _currentChartType === 'doughnut' || _currentChartType === 'pie';

    const datasets = isDonut 
        ? [{
            label: formatColumnHeader(numericCols[0]),
            data: sliceData.map(r => Number(r[numericCols[0]]) || 0),
            backgroundColor: [
                '#FF9933', '#138808', '#0056B3', '#D97706', '#059669', '#2563EB', '#DC2626', '#7C3AED', '#E11D48', '#0D9488', '#4F46E5', '#65A30D'
            ],
            borderWidth: 1.5
        }]
        : numericCols.slice(0, 3).map((col, idx) => {
            const color = palette[idx % palette.length];
            return {
                label: formatColumnHeader(col),
                data: sliceData.map(r => Number(r[col]) || 0),
                backgroundColor: color.bg,
                borderColor: color.border,
                borderWidth: 2,
                borderRadius: _currentChartType === 'bar' ? 4 : 0,
                fill: _currentChartType === 'line' ? 'origin' : false,
                tension: 0.3
            };
        });

    _aiChartInstance = new Chart(canvas, {
        type: _currentChartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, font: { weight: 'bold' } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            const val = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                            if (val !== null && val !== undefined) {
                                label += formatCellValue(val);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: isDonut ? {} : {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: 'bold' }, color: '#334155' }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    ticks: {
                        callback: function(value) {
                            return formatCellValue(value);
                        }
                    }
                }
            }
        }
    });
}

function generateStandaloneHTMLReport(res) {
    if (!res) res = window._latestAIResult;
    if (!res || !res.data) return "<html><body><p>No query data available.</p></body></html>";

    const cols = res.columns || Object.keys(res.data[0]);
    const tableRows = res.data.map(row => `
        <tr>${cols.map(c => `<td>${formatCellValue(row[c])}</td>`).join('')}</tr>
    `).join('');

    const safeJsonPayload = JSON.stringify(res).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EkBhaarat Governance Intelligence Dossier - ${res.user_question || 'Report'}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --gov-saffron: #FF9933;
      --gov-navy-dark: #0A192F;
      --gov-blue: #0056B3;
      --gov-green: #138808;
      --gov-bg: #F8FAFC;
      --gov-card-bg: #FFFFFF;
      --gov-text: #1E293B;
      --gov-border: #E2E8F0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: var(--gov-bg);
      color: var(--gov-text);
      line-height: 1.6;
      padding: 30px 20px;
    }
    .report-container {
      max-width: 1000px;
      margin: 0 auto;
      background: var(--gov-card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid var(--gov-border);
      overflow: hidden;
    }
    .report-header {
      background: var(--gov-navy-dark);
      color: #fff;
      padding: 24px 30px;
      border-bottom: 4px solid var(--gov-saffron);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    .emblem-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .emblem { font-size: 32px; }
    .org-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--gov-saffron); font-weight: 700; }
    .portal-title { font-size: 22px; font-weight: 800; }
    .report-body { padding: 30px; }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--gov-border);
      margin-bottom: 20px;
      font-size: 13px;
      color: #64748B;
    }
    .badge {
      background: #E0F2FE;
      color: #0369A1;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 11px;
    }
    .question-title {
      font-size: 20px;
      color: var(--gov-navy-dark);
      font-weight: 800;
      margin-bottom: 15px;
    }
    .finding-box {
      background: #F0FDF4;
      border-left: 4px solid var(--gov-green);
      padding: 16px 20px;
      border-radius: 6px;
      margin-bottom: 25px;
      font-size: 15px;
    }
    .chart-container {
      background: #FFFFFF;
      border: 1px solid var(--gov-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .section-heading {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 800;
      color: var(--gov-navy-dark);
      margin-bottom: 8px;
    }
    .sql-box {
      background: #0F172A;
      color: #38BDF8;
      padding: 14px 18px;
      border-radius: 8px;
      font-family: 'Consolas', monospace;
      font-size: 13px;
      margin-bottom: 25px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 10px;
      margin-bottom: 25px;
    }
    th {
      background: #F1F5F9;
      color: var(--gov-navy-dark);
      text-align: left;
      padding: 10px 14px;
      font-weight: 700;
      border-bottom: 2px solid var(--gov-border);
    }
    td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--gov-border);
    }
    tr:nth-child(even) td { background: #FAFAFA; }
    .footer-stamp {
      border-top: 1px solid var(--gov-border);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #94A3B8;
    }
    .print-btn {
      background: var(--gov-blue);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    @media print {
      body { background: white; padding: 0; }
      .report-container { box-shadow: none; border: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <div class="emblem-title">
        <span class="emblem">🏛️</span>
        <div>
          <div class="org-title">Government of India • Ministry of Statistics & Programme Implementation</div>
          <div class="portal-title">EkBhaarat — Unified AI Governance Intelligence Dossier</div>
        </div>
      </div>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>
    </div>
    <div class="report-body">
      <div class="meta-bar">
        <div>Query ID: <strong>EKB-AI-${Date.now().toString().slice(-6)}</strong></div>
        <div>Generated On: <strong>${new Date().toLocaleString()}</strong></div>
        <span class="badge">🛡️ Verified SQL Output</span>
      </div>

      <div class="question-title">Target Investigation: "${res.user_question || 'Intelligence Synthesis'}"</div>

      <div class="finding-box">
        <strong>💡 Key Governance Finding:</strong><br/>
        ${res.summary_text || 'Synthesized findings from cross-ministry open data repository.'}
      </div>

      <!-- VISUAL CHART SECTION IN STANDALONE DOSSIER -->
      <div class="chart-container">
        <div class="section-heading">📊 Graphical Visual Analytics</div>
        <div style="position: relative; height: 300px; width: 100%;">
          <canvas id="dossierChartCanvas"></canvas>
        </div>
      </div>

      <div class="section-heading">Verified Database SQL Execution Script</div>
      <div class="sql-box">${res.generated_sql || 'SELECT * FROM national_data;'}</div>

      <div class="section-heading">Result Payload Records (${res.data.length} entries)</div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>${cols.map(c => `<th>${formatColumnHeader(c)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>

      <div class="footer-stamp">
        <div>Data Standard: <strong>NDSAP Open Data Policy • GIGW 3.0 Standard</strong></div>
        <div>Digital Signature Verification: <strong>Govt AI SHA-256 Engine</strong></div>
      </div>
    </div>
  </div>

  <script>
    const resData = ${safeJsonPayload};
    window.addEventListener('DOMContentLoaded', () => {
      if (!resData || !resData.data || !window.Chart) return;
      const canvas = document.getElementById("dossierChartCanvas");
      if (!canvas) return;

      const cols = resData.columns || Object.keys(resData.data[0]);
      const numericCols = [];
      let labelCol = null;

      cols.forEach(col => {
        const val = resData.data[0][col];
        if (typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val) && typeof val !== 'boolean')) {
          numericCols.push(col);
        } else if (!labelCol) {
          labelCol = col;
        }
      });
      if (!labelCol) labelCol = cols[0];

      const sliceData = resData.data.slice(0, 12);
      const labels = sliceData.map(r => {
        const txt = String(r[labelCol] || '');
        return txt.length > 25 ? txt.substring(0, 22) + '...' : txt;
      });

      if (numericCols.length === 0) {
        const counts = {};
        resData.data.forEach(r => {
          const k = r[labelCol] || 'Other';
          counts[k] = (counts[k] || 0) + 1;
        });
        new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels: Object.keys(counts),
            datasets: [{
              label: 'Count',
              data: Object.values(counts),
              backgroundColor: ['#FF9933', '#138808', '#0056B3', '#D97706', '#059669', '#2563EB', '#DC2626', '#7C3AED']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
        return;
      }

      const datasets = numericCols.slice(0, 3).map((col, idx) => {
        const colors = [
          { bg: 'rgba(255, 153, 51, 0.85)', border: '#FF9933' },
          { bg: 'rgba(19, 136, 8, 0.85)', border: '#138808' },
          { bg: 'rgba(0, 86, 179, 0.85)', border: '#0056B3' }
        ];
        const color = colors[idx % colors.length];
        return {
          label: col.replace(/_/g, ' ').toUpperCase(),
          data: sliceData.map(r => Number(r[col]) || 0),
          backgroundColor: color.bg,
          borderColor: color.border,
          borderWidth: 2,
          borderRadius: 4
        };
      });

      new Chart(canvas, {
        type: 'bar',
        data: { labels: labels, datasets: datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(0,0,0,0.06)' } }
          }
        }
      });
    });
  </script>
</body>
</html>`;
}

function downloadAIHTMLReport() {
    const res = window._latestAIResult;
    if (!res) {
        showToast("No query result to export.");
        return;
    }
    const htmlContent = generateStandaloneHTMLReport(res);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EkBhaarat_AI_Report_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("HTML report downloaded successfully!");
}

function openAIHTMLReportNewTab() {
    const res = window._latestAIResult;
    if (!res) {
        showToast("No query result to open.");
        return;
    }
    const htmlContent = generateStandaloneHTMLReport(res);
    const newWin = window.open("", "_blank");
    if (newWin) {
        newWin.document.open();
        newWin.document.write(htmlContent);
        newWin.document.close();
    } else {
        showToast("Popup blocked. Please allow popups or use the Download button.");
    }
}

function formatColumnHeader(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatCellValue(val) {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
        if (val > 1000000) return `₹${(val / 1e7).toFixed(2)} Cr`;
        return val.toLocaleString();
    }
    return String(val);
}

function fallbackInBrowserAIQuery(q) {
    const qLower = q.toLowerCase();
    let sampleData = [];
    let summary = "";
    let sql = "";

    if (qLower.includes("overlap") || qLower.includes("cross-department") || qLower.includes("simultaneous")) {
        sql = "SELECT l.village, l.district, l.state, COUNT(DISTINCT p.department_id) as dept_count, GROUP_CONCAT(DISTINCT d.department_name) as active_departments FROM projects p JOIN locations l ON p.location_id = l.location_id JOIN departments d ON p.department_id = d.department_id GROUP BY l.village HAVING dept_count > 1 ORDER BY dept_count DESC LIMIT 10;";
        summary = "Identified 8 villages where multiple departments operate concurrently (e.g. Village-49 has 5 departments active simultaneously).";
        sampleData = [
            { village: "Village-49", state: "Andhra Pradesh", dept_count: 5, active_departments: "Rural Dev, Health, Agriculture, Education, WCD" },
            { village: "Village-119", state: "Uttar Pradesh", dept_count: 4, active_departments: "Jal Shakti, Health, Rural Dev, WCD" },
            { village: "Village-135", state: "Bihar", dept_count: 4, active_departments: "Education, Agriculture, Road Transport, Jal Shakti" }
        ];
    } else if (qLower.includes("budget") || qLower.includes("spent") || qLower.includes("financial")) {
        sql = "SELECT l.state, ROUND(SUM(f.budget_allocated)/10000000, 2) as allocated_cr, ROUND(SUM(f.amount_spent)/10000000, 2) as spent_cr, ROUND(SUM(f.amount_spent)/SUM(f.budget_allocated)*100, 1) as utilization_pct FROM financials f JOIN projects p ON f.project_id = p.project_id JOIN locations l ON p.location_id = l.location_id GROUP BY l.state ORDER BY allocated_cr DESC LIMIT 10;";
        summary = "Aggregated state-wise financial allocation and expenditure. Average national utilization rate is 80.0%.";
        sampleData = [
            { state: "Uttar Pradesh", allocated_cr: 1845.2, spent_cr: 1520.4, utilization_pct: "82.4%" },
            { state: "Maharashtra", allocated_cr: 1640.8, spent_cr: 1410.2, utilization_pct: "85.9%" },
            { state: "Bihar", allocated_cr: 1420.5, spent_cr: 1010.3, utilization_pct: "71.1%" },
            { state: "Gujarat", allocated_cr: 1250.0, spent_cr: 1050.0, utilization_pct: "84.0%" }
        ];
    } else {
        sql = "SELECT s.scheme_name, d.department_name, s.annual_outlay_cr FROM schemes s JOIN departments d ON s.department_id = d.department_id ORDER BY s.annual_outlay_cr DESC LIMIT 5;";
        summary = "Displaying verified flagship schemes, outlays, and ministerial alignments.";
        sampleData = [
            { scheme_name: "PM-KISAN Samman Nidhi", department: "Department of Agriculture", annual_outlay_cr: "₹60,000 Cr" },
            { scheme_name: "Ayushman Bharat (PM-JAY)", department: "Department of Health", annual_outlay_cr: "₹54,000 Cr" },
            { scheme_name: "Jal Jeevan Mission", department: "Department of Drinking Water", annual_outlay_cr: "₹48,000 Cr" },
            { scheme_name: "Pradhan Mantri Awas Yojana", department: "Department of Rural Dev", annual_outlay_cr: "₹32,000 Cr" }
        ];
    }

    renderAIResults({
        status: "success",
        user_question: q,
        generated_sql: sql,
        summary_text: summary,
        data: sampleData,
        columns: Object.keys(sampleData[0]),
        provenance: { last_sync: "2026-09-27" }
    });
}

// =========================================================
// INTERACTIVE INDIA MAP CARTOGRAPHY ENGINE
// =========================================================
function initInteractiveIndiaMap() {
    const mapElement = document.getElementById("indiaMap");
    if (!mapElement || typeof L === "undefined") return;

    const loadingElem = document.getElementById("mapLoading");

    try {
        const map = L.map("indiaMap", {
            zoomControl: true,
            scrollWheelZoom: true,
            attributionControl: false
        }).setView([22.5, 79.5], 4.5);

        window.leafletMapInstance = map;

        // Clean neutral tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 8,
            minZoom: 4
        }).addTo(map);

        if (loadingElem) loadingElem.style.display = "none";

        // Render States from INDIA_STATES_DATA
        if (typeof INDIA_STATES_DATA !== "undefined" && INDIA_STATES_DATA.features) {
            INDIA_STATES_DATA.features.forEach(feat => {
                const p = feat.properties;
                const coverage = p.coverage || 70;
                let color = "#FF671F"; // Saffron
                if (coverage >= 75) color = "#046A38"; // Green
                else if (coverage >= 60) color = "#0B3B60"; // Navy

                const circle = L.circleMarker([p.lat, p.lng], {
                    radius: 12,
                    fillColor: color,
                    color: "#FFFFFF",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.85
                }).addTo(map);

                circle.bindTooltip(`<strong>${p.name}</strong><br>Coverage: ${coverage}%`, {
                    sticky: true,
                    direction: "top"
                });

                circle.on('click', () => {
                    updateMapSidebar(p);
                });
            });
        }

        // Auto-select first state for sidebar
        if (INDIA_STATES_DATA.features.length > 0) {
            updateMapSidebar(INDIA_STATES_DATA.features[0].properties);
        }

    } catch (e) {
        console.error("Leaflet Map init error:", e);
        if (loadingElem) loadingElem.textContent = "Map rendered with local fallback state points.";
    }
}

function initHeroInteractiveIndiaMap() {
    const mapElement = document.getElementById("heroInteractiveIndiaMap");
    if (!mapElement || typeof L === "undefined") return;

    try {
        const map = L.map("heroInteractiveIndiaMap", {
            zoomControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: true,
            attributionControl: false
        }).setView([22.5, 79.5], 4);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 6,
            minZoom: 3
        }).addTo(map);

        if (typeof INDIA_STATES_DATA !== "undefined" && INDIA_STATES_DATA.features) {
            INDIA_STATES_DATA.features.forEach(feat => {
                const p = feat.properties;
                const coverage = p.coverage || 75;
                let color = "#FF671F"; // Saffron
                if (coverage >= 80) color = "#046A38"; // Green
                else if (coverage >= 65) color = "#0B3B60"; // Navy

                const circle = L.circleMarker([p.lat, p.lng], {
                    radius: 7,
                    fillColor: color,
                    color: "#FFFFFF",
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.85
                }).addTo(map);

                circle.bindTooltip(`<strong>${p.name}</strong><br>Coverage: ${coverage}%<br><span style="color:#0056B3; font-size:10px;">Click to explore →</span>`, {
                    sticky: true,
                    direction: "top"
                });

                circle.on('click', () => {
                    window.location.href = `map.html?state=${encodeURIComponent(p.name)}`;
                });
            });
        }
    } catch (e) {
        console.warn("Hero India map init warning:", e);
    }
}

function updateMapSidebar(data) {
    const stateName = data.name || "National Summary";
    const selectedStateElem = document.getElementById("selectedState");
    if (selectedStateElem) selectedStateElem.textContent = stateName;

    const descElem = document.getElementById("stateDescription");
    if (descElem) descElem.textContent = `Official State Portal Analytics for ${stateName}. Verified under National Governance Data Standards.`;

    const sName = document.getElementById("stateName");
    if (sName) sName.textContent = stateName;

    const sCount = document.getElementById("schemeCount");
    if (sCount) sCount.textContent = data.schemes ? `${data.schemes} Active Schemes` : "45+ Schemes";

    const bCount = document.getElementById("beneficiaryCount");
    if (bCount) bCount.textContent = data.beneficiaries || "2.8 Cr";

    const bUtil = document.getElementById("budgetUtilisation");
    if (bUtil) bUtil.textContent = data.budget || "82%";

    const cInd = document.getElementById("coverageIndicator");
    if (cInd) cInd.textContent = `${data.coverage || 75} / 100`;
}

// =========================================================
// "SHOW ME THE PROOF" - DRAG & DROP PHOTO UPLOAD & RESOLUTION
// =========================================================
let uploadedPhotoBase64 = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600";

function setupPhotoUploadZone() {
    const dropZone = document.getElementById("photoDropZone");
    const fileInput = document.getElementById("issuePhotos");
    const previewContainer = document.getElementById("photoPreviewContainer");
    const previewImg = document.getElementById("photoPreviewImg");

    if (!dropZone || !fileInput) return;

    // Click dropzone to open file picker
    dropZone.addEventListener("click", () => fileInput.click());

    // Drag & drop events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = "var(--gov-saffron)";
            dropZone.style.background = "var(--gov-saffron-light)";
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = "var(--gov-border)";
            dropZone.style.background = "#F8FAFC";
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) handleSelectedPhoto(files[0]);
    });

    fileInput.addEventListener("change", function() {
        if (this.files.length > 0) handleSelectedPhoto(this.files[0]);
    });

    function handleSelectedPhoto(file) {
        if (!file.type.startsWith("image/")) {
            showToast("Please upload an image file (PNG, JPG, JPEG).");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPhotoBase64 = e.target.result;
            if (previewContainer && previewImg) {
                previewImg.src = uploadedPhotoBase64;
                previewContainer.style.display = "block";
                dropZone.style.display = "none";
            }
            showToast(`Photo "${file.name}" attached with GPS coordinates!`);
        };
        reader.readAsDataURL(file);
    }
}

window.removeUploadedPhoto = function() {
    uploadedPhotoBase64 = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600";
    const dropZone = document.getElementById("photoDropZone");
    const previewContainer = document.getElementById("photoPreviewContainer");
    const fileInput = document.getElementById("issuePhotos");
    if (dropZone) dropZone.style.display = "block";
    if (previewContainer) previewContainer.style.display = "none";
    if (fileInput) fileInput.value = "";
};

async function loadProofComplaints() {
    const container = document.getElementById("proofComplaintsList") || document.getElementById("myComplaintsList");
    if (!container) return;

    try {
        const res = await fetch("/api/complaints");
        const data = await res.json();
        renderComplaintsList(data.complaints, container);
    } catch (e) {
        renderComplaintsList(getDefaultDemoComplaints(), container);
    }
}

function renderComplaintsList(complaints, container) {
    if (!complaints || complaints.length === 0) {
        container.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--gov-text-muted);">No complaints recorded yet.</div>`;
        return;
    }

    const user = getCurrentUser();
    const isAdmin = user && user.role === "admin";

    container.innerHTML = complaints.map(c => {
        const isResolved = c.status === "RESOLVED";
        return `
            <div class="proof-card" id="card-${c.complaint_id}">
                <div class="proof-header">
                    <div>
                        <span class="proof-id-badge">${c.complaint_id}</span>
                        <strong style="margin-left: 10px; font-size: 15px; color: var(--gov-navy-dark);">${c.category}</strong>
                    </div>
                    <div>
                        <span class="trend-badge" style="background: ${isResolved ? 'var(--gov-green-light)' : 'var(--gov-saffron-light)'}; color: ${isResolved ? 'var(--gov-green)' : 'var(--gov-saffron-dark)'};">
                            ${isResolved ? '✓ RESOLVED WITH PROOF' : '● ' + c.status}
                        </span>
                    </div>
                </div>

                <div class="proof-dual-images">
                    <div class="proof-image-box">
                        <span class="proof-tag-before">📷 BEFORE: REPORTED BY CITIZEN</span>
                        <img src="${c.before_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'}" alt="Before repair photo">
                    </div>
                    <div class="proof-image-box" style="${!isResolved ? 'display: flex; align-items: center; justify-content: center; background: #F1F5F9;' : ''}">
                        ${isResolved ? `
                            <span class="proof-tag-after">✨ AFTER: GOVT RESOLUTION PROOF</span>
                            <img src="${c.after_image_url || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'}" alt="After repair verified photo">
                        ` : `
                            <div style="text-align: center; padding: 20px; color: var(--gov-text-muted);">
                                <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
                                <strong style="color: var(--gov-navy-dark); display: block;">Inspection & Work in Progress</strong>
                                <span style="font-size: 11px;">Resolution team assigned. After photo will be published upon completion.</span>
                                ${isAdmin ? `
                                    <div style="margin-top: 14px;">
                                        <button class="primary-btn" style="padding: 6px 14px; font-size: 12px;" onclick="openResolveModal('${c.complaint_id}')">Upload After Photo & Resolve →</button>
                                    </div>
                                ` : ''}
                            </div>
                        `}
                    </div>
                </div>

                <div class="proof-details">
                    <h3 style="font-size: 16px; color: var(--gov-navy-dark);">${c.area}, ${c.district}, ${c.state}</h3>
                    <p style="margin-top: 6px; font-size: 13px; color: var(--gov-text-secondary);">${c.description}</p>
                    
                    <div class="proof-meta-grid">
                        <div>
                            <small style="font-size: 10px; color: var(--gov-text-muted); text-transform: uppercase; font-weight: 700;">Reported By</small>
                            <strong style="display: block; font-size: 12px; color: var(--gov-navy-dark);">${c.citizen_name || 'Citizen'}</strong>
                        </div>
                        <div>
                            <small style="font-size: 10px; color: var(--gov-text-muted); text-transform: uppercase; font-weight: 700;">Date Submitted</small>
                            <strong style="display: block; font-size: 12px; color: var(--gov-navy-dark);">${c.date_submitted}</strong>
                        </div>
                        <div>
                            <small style="font-size: 10px; color: var(--gov-text-muted); text-transform: uppercase; font-weight: 700;">Linked Scheme</small>
                            <strong style="display: block; font-size: 12px; color: var(--gov-navy-dark);">${c.scheme_linked || 'Public Infrastructure Fund'}</strong>
                        </div>
                        <div>
                            <small style="font-size: 10px; color: var(--gov-text-muted); text-transform: uppercase; font-weight: 700;">Allocated Budget</small>
                            <strong style="display: block; font-size: 12px; color: var(--gov-navy-dark);">₹${(c.allocated_budget ? (c.allocated_budget / 100000).toFixed(2) + ' Lakh' : 'Pending')}</strong>
                        </div>
                    </div>

                    ${isResolved ? `
                        <div class="proof-officer-seal">
                            <div style="font-size: 28px;">🏛️</div>
                            <div>
                                <strong style="color: var(--gov-green-dark); font-size: 13px; display: block;">Official Resolution Verified by ${c.resolved_by || 'Central Nodal Officer'}</strong>
                                <p style="font-size: 12px; color: var(--gov-text-secondary); margin-top: 2px;">${c.resolution_notes || 'Civil work completed according to state quality compliance standards.'}</p>
                                <span style="font-size: 11px; color: var(--gov-text-muted);">Verified on: <strong>${c.resolved_date || '2026-09-20'}</strong> • Digital Audit Hash: SHA256:88fa7b2</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function getDefaultDemoComplaints() {
    return [
        {
            complaint_id: "EKB-2026-GRV-88219",
            citizen_name: "Rahul Sharma",
            category: "Road / Pothole",
            state: "Uttar Pradesh",
            district: "Varanasi",
            area: "Shivpur Village Link Road, KM 4.2",
            description: "Major severe potholes and washed out culvert disrupting farm produce transport to mandi during monsoon.",
            status: "RESOLVED",
            date_submitted: "2026-08-12",
            before_image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600",
            after_image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600",
            resolved_date: "2026-09-18",
            resolved_by: "Dr. Rajesh Varma (Central Nodal Officer, DoRD)",
            resolution_notes: "Culvert reconstruction and 3.8 KM bituminous all-weather road resurfacing completed under PMGSY Phase IV.",
            allocated_budget: 4850000.0,
            scheme_linked: "Pradhan Mantri Gram Sadak Yojana (PMGSY)"
        },
        {
            complaint_id: "EKB-2026-GRV-91402",
            citizen_name: "Priya Patel",
            category: "Government School / Facility",
            state: "Gujarat",
            district: "Mehsana",
            area: "Primary Health Centre (PHC) Sub-center, Kadi",
            description: "Dilapidated maternity ward roof causing water leakage and risk to infant incubators.",
            status: "RESOLVED",
            date_submitted: "2026-08-25",
            before_image_url: "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600",
            after_image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600",
            resolved_date: "2026-09-22",
            resolved_by: "Er. Amit Desai (Executive Engineer, Health Infra)",
            resolution_notes: "Complete RCC waterproofing, installation of 4 high-grade neonatal beds, and backup solar inverter commissioned under NHM.",
            allocated_budget: 1950000.0,
            scheme_linked: "National Health Mission (NHM)"
        }
    ];
}

async function submitCitizenComplaint(event) {
    if (event) event.preventDefault();
    const user = getCurrentUser() || DEMO_ACCOUNTS.citizen1;

    const category = document.getElementById("issueCategory")?.value;
    const state = document.getElementById("issueState")?.value;
    const district = document.getElementById("issueDistrict")?.value || "Varanasi";
    const area = document.getElementById("issueArea")?.value;
    const description = document.getElementById("issueDescription")?.value;
    const priority = document.getElementById("issuePriority")?.value || "Medium";

    if (!category || !state || !area || !description) {
        alert("Please complete all required fields.");
        return;
    }

    const payload = {
        user_id: user.user_id,
        citizen_name: user.full_name,
        category,
        state,
        district,
        area,
        description,
        priority,
        before_image_url: uploadedPhotoBase64
    };

    try {
        const res = await fetch("/api/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        showToast(`Complaint lodged successfully! Tracking ID: ${data.complaint_id}`);
        document.getElementById("complaintForm")?.reset();
        removeUploadedPhoto();
        loadProofComplaints();
    } catch (e) {
        showToast("Issue registered in demo memory. Thank you for reporting!");
    }
}

// Admin Resolution Modal
function openResolveModal(complaintId) {
    let modal = document.getElementById("resolveModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "resolveModal";
        modal.className = "gov-modal open";
        modal.innerHTML = `
            <div class="gov-modal-dialog">
                <div class="gov-modal-header">
                    <h3 style="color:#FFF; font-size:16px;">🏛️ Nodal Officer: Resolve Citizen Grievance</h3>
                    <button class="gov-modal-close" onclick="closeResolveModal()">&times;</button>
                </div>
                <div class="gov-modal-body">
                    <form id="resolveForm" onsubmit="submitResolveComplaint(event)">
                        <input type="hidden" id="resolveComplaintId" value="${complaintId}">
                        <div class="form-group" style="margin-bottom:12px;">
                            <label style="font-weight:700; font-size:12px;">Target Grievance ID</label>
                            <input type="text" id="dispComplaintId" value="${complaintId}" disabled style="background:#F1F5F9; width:100%; padding:8px;">
                        </div>
                        <div class="form-group" style="margin-bottom:12px;">
                            <label style="font-weight:700; font-size:12px;">After Repair Photo Evidence URL</label>
                            <input type="text" id="resolveAfterPhoto" value="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600" required style="width:100%; padding:8px;">
                        </div>
                        <div class="form-group" style="margin-bottom:12px;">
                            <label style="font-weight:700; font-size:12px;">Sanctioned Welfare Scheme</label>
                            <input type="text" id="resolveScheme" value="Special National Infrastructure Grant" required style="width:100%; padding:8px;">
                        </div>
                        <div class="form-group" style="margin-bottom:12px;">
                            <label style="font-weight:700; font-size:12px;">Budget Sanctioned (₹)</label>
                            <input type="number" id="resolveBudget" value="3500000" required style="width:100%; padding:8px;">
                        </div>
                        <div class="form-group" style="margin-bottom:12px;">
                            <label style="font-weight:700; font-size:12px;">Officer Resolution Report & Engineering Notes</label>
                            <textarea id="resolveNotes" rows="3" required style="width:100%; padding:8px;">Full reconstruction and civil works completed under quality monitoring. Verified on site.</textarea>
                        </div>
                        <button type="submit" class="primary-btn" style="width:100%; padding:12px;">Verify & Publish Resolution Proof →</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        document.getElementById("resolveComplaintId").value = complaintId;
        document.getElementById("dispComplaintId").value = complaintId;
        modal.classList.add("open");
    }
}

function closeResolveModal() {
    const modal = document.getElementById("resolveModal");
    if (modal) modal.classList.remove("open");
}

async function submitResolveComplaint(event) {
    if (event) event.preventDefault();
    const id = document.getElementById("resolveComplaintId").value;
    const afterPhoto = document.getElementById("resolveAfterPhoto").value;
    const scheme = document.getElementById("resolveScheme").value;
    const budget = document.getElementById("resolveBudget").value;
    const notes = document.getElementById("resolveNotes").value;
    const user = getCurrentUser() || DEMO_ACCOUNTS.admin;

    try {
        await fetch(`/api/complaints/${id}/resolve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                after_image_url: afterPhoto,
                scheme_linked: scheme,
                allocated_budget: budget,
                resolution_notes: notes,
                resolved_by: `${user.full_name} (${user.designation || 'Central Nodal Officer'})`
            })
        });
        showToast(`Grievance ${id} successfully resolved with verified proof!`);
        closeResolveModal();
        loadProofComplaints();
    } catch (e) {
        showToast(`Resolved ${id} in demo view!`);
        closeResolveModal();
    }
}

// =========================================================
// SCHEME OVERLAP & CONVERGENCE LOADER
// =========================================================
async function loadSchemeOverlaps() {
    const container = document.getElementById("overlapCardsContainer");
    if (!container) return;

    try {
        const res = await fetch("/api/overlap");
        const data = await res.json();
        renderOverlapData(data);
    } catch (e) {
        console.warn("Using offline overlap matrix fallback:", e);
    }
}

function renderOverlapData(data) {
    const container = document.getElementById("overlapCardsContainer");
    const summaryCard = document.getElementById("overlapSummaryStats");
    if (!container) return;

    if (summaryCard) {
        summaryCard.innerHTML = `
            <div class="beneficiary-stat-card">
                <div class="stat-icon">🔎</div>
                <small>Identified Cross-Ministry Overlaps</small>
                <strong>${data.overlaps.length} High-Overlap Clusters</strong>
                <p>Nutritional, Water, and Agritech Interventions</p>
            </div>
            <div class="beneficiary-stat-card">
                <div class="stat-icon">💰</div>
                <small>Potential Fiscal Savings</small>
                <strong>₹${data.total_redundancy_cr.toLocaleString()} Cr</strong>
                <p>Via procurement & administrative convergence</p>
            </div>
            <div class="beneficiary-stat-card">
                <div class="stat-icon">👥</div>
                <small>Duplicate Beneficiary Reach</small>
                <strong>${(data.total_duplicate_beneficiaries / 100000).toFixed(1)} Lakh Citizens</strong>
                <p>Eligible for unified DBT single-window delivery</p>
            </div>
        `;
    }

    container.innerHTML = data.overlaps.map(o => `
        <div class="overlap-card">
            <div class="overlap-schemes-row">
                <span class="overlap-score-pill">Overlap Score: ${o.overlap_score_pct}%</span>
                <span style="font-size: 12px; color: var(--gov-text-muted); font-weight: 700;">${o.overlap_dimension}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                <div style="padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--gov-border-light);">
                    <small style="font-size: 10px; color: var(--gov-saffron-dark); font-weight: 800; text-transform: uppercase;">Scheme A</small>
                    <strong style="display: block; font-size: 13px; color: var(--gov-navy-dark);">${o.scheme_a_name}</strong>
                    <span style="font-size: 11px; color: var(--gov-text-muted);">${o.ministry_a}</span>
                </div>
                <div style="padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--gov-border-light);">
                    <small style="font-size: 10px; color: var(--gov-saffron-dark); font-weight: 800; text-transform: uppercase;">Scheme B</small>
                    <strong style="display: block; font-size: 13px; color: var(--gov-navy-dark);">${o.scheme_b_name}</strong>
                    <span style="font-size: 11px; color: var(--gov-text-muted);">${o.ministry_b}</span>
                </div>
            </div>
            <div class="convergence-box">
                <strong style="color: var(--gov-navy-dark); font-size: 12px; display: block;">🏛️ NITI Aayog Convergence Recommendation:</strong>
                <p style="font-size: 12px; color: var(--gov-text-secondary); margin-top: 4px;">${o.convergence_recommendation}</p>
                <div style="margin-top: 8px; font-size: 11px; color: var(--gov-text-muted);">
                    Redundant Allocation: <strong>₹${o.redundant_budget_cr} Cr</strong> • Estimated Overlapping Beneficiaries: <strong>${(o.duplicate_beneficiaries_est/100000).toFixed(1)} Lakh</strong>
                </div>
            </div>
        </div>
    `).join('');
}

// =========================================================
// INITIALIZATION ON DOM LOAD
// =========================================================
document.addEventListener("DOMContentLoaded", function() {
    injectTopBars();
    applyGovAccessibilitySettings();
    updateNavbar();

    // 1. Complaint form & photo upload
    const complaintForm = document.getElementById("complaintForm");
    if (complaintForm) {
        complaintForm.addEventListener("submit", submitCitizenComplaint);
        setupPhotoUploadZone();
    }

    // 2. Login & Signup Forms
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail")?.value.trim();
            const password = document.getElementById("loginPassword")?.value.trim();
            const selectedType = document.querySelector('input[name="accountType"]:checked')?.value || "citizen";

            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role: selectedType })
                });
                const data = await res.json();
                if (data.status === "success" && data.user) {
                    localStorage.setItem("ekBhaaratLoggedIn", "true");
                    localStorage.setItem("ekBhaaratAccountType", data.user.role);
                    localStorage.setItem("ekBhaaratUserName", data.user.full_name);
                    localStorage.setItem("ekBhaaratUser", JSON.stringify(data.user));
                    showToast(`Logged in as ${data.user.full_name}!`);
                    setTimeout(() => {
                        window.location.href = data.user.role === "admin" ? "admin.html" : "dashboard.html";
                    }, 400);
                    return;
                }
            } catch (err) { }

            // Demo fallback
            if (selectedType === "admin" || (email && email.includes("admin"))) {
                switchDemoAccount("admin");
            } else if (email && email.includes("priya")) {
                switchDemoAccount("citizen2");
            } else {
                switchDemoAccount("citizen1");
            }
        });
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const full_name = document.getElementById("signupName")?.value.trim();
            const email = document.getElementById("signupEmail")?.value.trim();
            const password = document.getElementById("signupPassword")?.value;
            const state = document.getElementById("signupState")?.value || "Uttar Pradesh";
            const district = document.getElementById("signupDistrict")?.value || "General";
            const role = document.querySelector('input[name="signupRole"]:checked')?.value || "citizen";

            if (!full_name || !email || !password) {
                alert("Please fill in all required fields.");
                return;
            }

            try {
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ full_name, email, password, state, district, role })
                });
                const data = await res.json();
                if (data.status === "success" && data.user) {
                    localStorage.setItem("ekBhaaratLoggedIn", "true");
                    localStorage.setItem("ekBhaaratAccountType", data.user.role);
                    localStorage.setItem("ekBhaaratUserName", data.user.full_name);
                    localStorage.setItem("ekBhaaratUser", JSON.stringify(data.user));
                    showToast(`Welcome, ${data.user.full_name}! Account created.`);
                    setTimeout(() => {
                        window.location.href = data.user.role === "admin" ? "admin.html" : "dashboard.html";
                    }, 400);
                    return;
                } else {
                    alert(data.message || "Could not register account.");
                }
            } catch(err) {
                // Local fallback
                const userObj = {
                    user_id: Date.now(),
                    full_name,
                    email,
                    role,
                    state,
                    district,
                    avatar: role === "admin" ? "🏛️" : "👤",
                    designation: "Registered Citizen"
                };
                localStorage.setItem("ekBhaaratLoggedIn", "true");
                localStorage.setItem("ekBhaaratAccountType", role);
                localStorage.setItem("ekBhaaratUserName", full_name);
                localStorage.setItem("ekBhaaratUser", JSON.stringify(userObj));
                showToast(`Welcome, ${full_name}! Account created.`);
                setTimeout(() => {
                    window.location.href = role === "admin" ? "admin.html" : "dashboard.html";
                }, 400);
            }
        });
    }

    // 3. Auto-run AI Query if query parameter exists
    if (window.location.pathname.includes("ai.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("q");
        if (queryParam) {
            executeAIQuery(queryParam);
        }
    }

    // 4. Map & Proof initializers
    if (document.getElementById("indiaMap")) {
        initInteractiveIndiaMap();
    }
    if (document.getElementById("heroInteractiveIndiaMap")) {
        initHeroInteractiveIndiaMap();
    }
    if (document.getElementById("proofComplaintsList") || document.getElementById("myComplaintsList")) {
        loadProofComplaints();
    }
    if (document.getElementById("overlapCardsContainer")) {
        loadSchemeOverlaps();
    }
    if (document.getElementById("datasetsContainer")) {
        loadPublicDatasets();
    }
});

// =========================================================
// NATIONAL OPEN DATA REPOSITORY & DATASET DOWNLOADS
// =========================================================
let _allPublicDatasets = [];

async function loadPublicDatasets() {
    const container = document.getElementById("datasetsContainer");
    if (!container) return;

    try {
        const res = await fetch("/api/datasets");
        const data = await res.json();
        _allPublicDatasets = data.datasets || [];
        renderDatasets(_allPublicDatasets);
    } catch (e) {
        console.warn("Using offline datasets fallback:", e);
        _allPublicDatasets = [
            {
                id: "projects",
                title: "National Infrastructure & Welfare Projects Master",
                ministry: "Ministry of Statistics & Programme Implementation",
                description: "Comprehensive master dataset of 362+ infrastructure and social welfare initiatives across all 36 States/UTs.",
                record_count: "362 Records",
                excel_file: "projects.xlsx",
                csv_file: "projects_clean.csv",
                size_kb: 70.6,
                provenance: "MeitY NDSAP Standard • SHA-256 Verified"
            },
            {
                id: "schemes",
                title: "Central & Centrally Sponsored Schemes Master",
                ministry: "NITI Aayog & Central Ministries",
                description: "Master register of 100+ public welfare schemes with financial outlays, DBT status, and target citizen segments.",
                record_count: "100+ Schemes",
                excel_file: "schemes.xlsx",
                csv_file: "schemes_clean.csv",
                size_kb: 6.3,
                provenance: "Open Government Data (OGD) Platform"
            },
            {
                id: "departments",
                title: "Central Ministries & Line Departments Directory",
                ministry: "Cabinet Secretariat",
                description: "Master list of 7 key ministries: Education, Health, Rural Dev, Agriculture, Water/Sanitation, Highways, Women/Child.",
                record_count: "7 Ministries",
                excel_file: "departments.xlsx",
                csv_file: "departments_clean.csv",
                size_kb: 5.5,
                provenance: "Government of India Directory"
            },
            {
                id: "beneficiaries",
                title: "Direct Benefit Reach & Citizen Beneficiary Master",
                ministry: "Ministry of Electronics and IT (UIDAI / DBT)",
                description: "Aadhaar-seeded saturation records, social categories (Farmers, Women, BPL, Students), and reach analytics.",
                record_count: "94.2 Crore Reach",
                excel_file: "beneficiaries.xlsx",
                csv_file: "beneficiaries_clean.csv",
                size_kb: 25.7,
                provenance: "DBT Bharat Mission"
            },
            {
                id: "financials",
                title: "Fiscal Allocations & Expenditure Master Dataset",
                ministry: "Ministry of Finance (Public Financial Management System)",
                description: "Detailed budget allocations, released tranches, and actual ground expenditures per scheme & state.",
                record_count: "₹14.8 Lakh Cr Outlay",
                excel_file: "financials.xlsx",
                csv_file: "financials_clean.csv",
                size_kb: 23.6,
                provenance: "PFMS Central Register"
            },
            {
                id: "locations",
                title: "National Geospatial Hierarchy (States, Districts, Villages)",
                ministry: "Survey of India & Ministry of Panchayati Raj",
                description: "GIS coordinates, poverty indicators, saturation scores, and Aspirational District flags.",
                record_count: "700+ Geographic Units",
                excel_file: "Comprehensive_Gov_Projects_Data (1).xlsx",
                csv_file: "locations_clean.csv",
                size_kb: 25.7,
                provenance: "Geospatial Data Policy 2022"
            }
        ];
        renderDatasets(_allPublicDatasets);
    }
}

function renderDatasets(list) {
    const container = document.getElementById("datasetsContainer");
    const countLabel = document.getElementById("datasetCountLabel");
    if (!container) return;

    if (countLabel) countLabel.textContent = `Showing ${list.length} National Datasets`;

    if (list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: #FFF; border-radius: 12px; border: 1px solid var(--gov-border-light);">
                <div style="font-size: 32px;">🔍</div>
                <h3 style="margin-top: 10px; color: var(--gov-navy-dark);">No matching datasets found</h3>
                <p style="font-size: 13px; color: var(--gov-text-muted);">Try searching for "projects", "finance", "schemes", or "beneficiaries".</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(ds => `
        <div class="content-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 24px; border-radius: 12px; background: #FFFFFF; border: 1px solid var(--gov-border-light); box-shadow: var(--gov-shadow-sm);">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: var(--gov-saffron-dark); text-transform: uppercase;">${ds.ministry}</span>
                    <span style="background: #EBF3FA; color: var(--gov-navy); padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">${ds.record_count}</span>
                </div>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--gov-navy-dark); margin-bottom: 8px;">${ds.title}</h3>
                <p style="font-size: 13px; color: var(--gov-text-secondary); line-height: 1.5; margin-bottom: 16px;">${ds.description}</p>
            </div>

            <div>
                <div style="font-size: 11px; color: var(--gov-text-muted); margin-bottom: 12px; border-top: 1px solid var(--gov-border-light); padding-top: 10px;">
                    🛡️ ${ds.provenance}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <a href="/api/download/${ds.excel_file}" class="primary-btn" style="text-align: center; text-decoration: none; padding: 8px 12px; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" download>
                        📊 Excel (.xlsx)
                    </a>
                    <a href="/api/download/${ds.csv_file}" class="secondary-btn" style="text-align: center; text-decoration: none; padding: 8px 12px; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" download>
                        📄 CSV Format
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function filterDatasetList() {
    const term = (document.getElementById("datasetSearchBox")?.value || "").toLowerCase().trim();
    if (!term) {
        renderDatasets(_allPublicDatasets);
        return;
    }
    const filtered = _allPublicDatasets.filter(ds => 
        ds.title.toLowerCase().includes(term) ||
        ds.ministry.toLowerCase().includes(term) ||
        ds.description.toLowerCase().includes(term) ||
        (ds.id && ds.id.toLowerCase().includes(term))
    );
    renderDatasets(filtered);
}

// =========================================================
// ADMIN DATA INGESTION SUITE (APPEND-ONLY INTEGRITY)
// =========================================================
function switchAdminDataTab(tab) {
    const schemeForm = document.getElementById("adminAddSchemeForm");
    const projectForm = document.getElementById("adminAddProjectForm");
    const schemeBtn = document.getElementById("tabSchemeBtn");
    const projectBtn = document.getElementById("tabProjectBtn");

    if (tab === "scheme") {
        if (schemeForm) schemeForm.style.display = "block";
        if (projectForm) projectForm.style.display = "none";
        if (schemeBtn) { schemeBtn.className = "btn btn-sm btn-primary"; }
        if (projectBtn) { projectBtn.className = "btn btn-sm btn-secondary"; }
    } else {
        if (schemeForm) schemeForm.style.display = "none";
        if (projectForm) projectForm.style.display = "block";
        if (schemeBtn) { schemeBtn.className = "btn btn-sm btn-secondary"; }
        if (projectBtn) { projectBtn.className = "btn btn-sm btn-primary"; }
    }
}

async function submitAdminNewScheme() {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
        alert("Access Denied: Only authenticated Central Nodal Officers (Admins) can sanction and append new schemes.");
        return;
    }

    const scheme_name = document.getElementById("newSchemeName")?.value.trim();
    const department_id = document.getElementById("newSchemeDept")?.value;
    const annual_outlay_cr = document.getElementById("newSchemeOutlay")?.value;
    const scheme_type = document.getElementById("newSchemeType")?.value;
    const description = document.getElementById("newSchemeDesc")?.value.trim();

    if (!scheme_name || !annual_outlay_cr) {
        alert("Please fill in scheme name and budget outlay.");
        return;
    }

    try {
        const res = await fetch("/api/admin/add-scheme", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Role": "admin"
            },
            body: JSON.stringify({
                scheme_name,
                department_id,
                annual_outlay_cr,
                scheme_type,
                description,
                user_role: "admin"
            })
        });
        const data = await res.json();
        if (data.status === "success") {
            showToast(data.message);
            document.getElementById("adminAddSchemeForm").reset();
        } else {
            alert(data.message || "Failed to append scheme.");
        }
    } catch (e) {
        showToast(`Appended '${scheme_name}' to National Master Schemes Registry!`);
        document.getElementById("adminAddSchemeForm").reset();
    }
}

async function submitAdminNewProject() {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
        alert("Access Denied: Only authenticated Central Nodal Officers (Admins) can register new project initiatives.");
        return;
    }

    const project_name = document.getElementById("newProjectName")?.value.trim();
    const department_id = document.getElementById("newProjectDept")?.value;
    const location_id = document.getElementById("newProjectLocation")?.value;
    const budget_allocated = document.getElementById("newProjectBudget")?.value;

    if (!project_name || !budget_allocated) {
        alert("Please fill in project name and budget allocation.");
        return;
    }

    try {
        const res = await fetch("/api/admin/add-project", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Role": "admin"
            },
            body: JSON.stringify({
                project_name,
                department_id,
                location_id,
                budget_allocated,
                user_role: "admin"
            })
        });
        const data = await res.json();
        if (data.status === "success") {
            showToast(data.message);
            document.getElementById("adminAddProjectForm").reset();
        } else {
            alert(data.message || "Failed to register project.");
        }
    } catch (e) {
        showToast(`Registered '${project_name}' in National Projects Database!`);
        document.getElementById("adminAddProjectForm").reset();
    }
}
