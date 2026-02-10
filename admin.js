// Admin Portal Logic
let adminUser = null;
let appSupabase = null;

// Initialization
async function initAdmin() {
    // 1. Wait for config
    if (typeof window.auth === 'undefined' || typeof window.supabase === 'undefined') {
        setTimeout(initAdmin, 100);
        return;
    }

    appSupabase = window.supabase;

    // 2. Check Auth
    window.auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // 3. Verify Admin Permission
        const { data: profile, error } = await appSupabase
            .from('profiles')
            .select('is_admin')
            .eq('firebase_uid', user.uid)
            .single();

        if (error || !profile || !profile.is_admin) {
            console.error('Unauthorized access denied.');
            alert('Access Denied: You do not have administrator permissions.');
            window.location.href = 'index.html';
            return;
        }

        adminUser = user;
        document.getElementById('loadingOverlay').classList.add('hidden');

        // 4. Initial Load
        loadAllStats();
        loadSystemLogs();
        subscribeAdminRealtime();
    });
}

// Section Management
function showSection(sectionId) {
    // Selection for minimal sidebar
    document.querySelectorAll('.nav-btn').forEach(l => l.classList.remove('active-nav'));

    // Show target
    document.querySelectorAll('.section-view').forEach(s => s.classList.add('hidden'));
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) targetSection.classList.remove('hidden');

    // Update active nav style - Use explicit mapping for reliability
    const navMap = {
        overview: 'Overview',
        messages: 'Moderation',
        reports: 'Reports',
        users: 'User Management'
    };

    const activeNav = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.innerText.includes(navMap[sectionId]));
    if (activeNav) {
        activeNav.classList.add('active-nav');
    }

    // Update header
    const titles = {
        overview: ['Dashboard Overview', 'Monitor your platform in real-time'],
        messages: ['Manage Messages', 'Verify content and moderate submissions'],
        reports: ['User Reports', 'Review flagged content from users'],
        users: ['User Directory', 'Manage account permissions and roles']
    };
    document.getElementById('sectionTitle').textContent = titles[sectionId][0];
    document.getElementById('sectionSub').textContent = titles[sectionId][1];

    // Load data
    if (sectionId === 'messages') loadAdminMessages();
    if (sectionId === 'reports') loadAdminReports();
    if (sectionId === 'users') loadAdminUsers();
}

// Dashboard Features
async function loadAllStats() {
    try {
        const { count: msgCount } = await appSupabase.from('confessions').select('*', { count: 'exact', head: true });
        const { count: rptCount } = await appSupabase.from('reports').select('*', { count: 'exact', head: true });
        const { count: usrCount } = await appSupabase.from('profiles').select('*', { count: 'exact', head: true });

        document.getElementById('totalMessages').textContent = msgCount || 0;
        document.getElementById('totalReports').textContent = rptCount || 0;
        document.getElementById('totalUsers').textContent = usrCount || 0;

        // Badge in sidebar
        const badge = document.getElementById('badgeReports');
        if (rptCount > 0) {
            badge.textContent = rptCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (e) { console.error('Stats error:', e); }
}

async function loadAdminMessages(sort = 'latest') {
    const feed = document.getElementById('adminMessageFeed');
    feed.innerHTML = `<div class="p-10 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF7F11] border-t-transparent"></div></div>`;

    let query = appSupabase.from('confessions').select('*');
    if (sort === 'latest') query = query.order('created_at', { ascending: false });
    else query = query.order('support_count', { ascending: false });

    const { data, error } = await query.limit(100);
    if (error) return;

    feed.innerHTML = data.map(msg => `
        <div class="px-10 py-8 flex items-start justify-between hover:bg-white/[0.01] transition-all">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-xs font-black text-[#E2E8CE]">@${msg.username}</span>
                    <span class="text-[9px] font-bold text-muted uppercase tracking-widest">${new Date(msg.created_at).toLocaleDateString()}</span>
                    <span class="px-2 py-0.5 glass-base border-white/[0.05] text-[8px] font-black uppercase text-[#FF7F11] tracking-tighter">${msg.category || 'General'}</span>
                </div>
                <p class="text-sm font-medium leading-relaxed text-[#E2E8CE]/80 max-w-2xl">${msg.content}</p>
                <div class="flex gap-4 mt-4">
                    <div class="flex items-center gap-1 text-[10px] font-bold text-muted">❤️ ${msg.support_count}</div>
                </div>
            </div>
            <button onclick="adminDeleteMessage('${msg.id}')" class="p-2 text-white/10 hover:text-red-400 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
        </div>
    `).join('');
}

async function loadAdminReports() {
    const list = document.getElementById('reportsListContainer');
    list.innerHTML = `<div class="col-span-2 text-center py-20 animate-pulse text-muted font-bold text-[10px] uppercase tracking-widest">Fetching reports...</div>`;

    const { data: reports, error } = await appSupabase.from('reports').select('*').order('created_at', { ascending: false });
    if (error || !reports || reports.length === 0) {
        list.innerHTML = `<div class="col-span-2 text-center py-20 glass-card border-white/[0.05]"><p class="text-[10px] font-black uppercase tracking-widest text-muted">Zero active flags</p></div>`;
        return;
    }

    // Get content
    const { data: messages } = await appSupabase.from('confessions').select('*').in('id', reports.map(r => r.target_id));
    const msgMap = messages?.reduce((a, m) => ({ ...a, [m.id]: m }), {}) || {};

    list.innerHTML = reports.map(r => {
        const m = msgMap[r.target_id];
        return `
            <div class="glass-card p-8 border ${m ? 'border-red-500/10 bg-red-500/[0.02]' : 'border-white/[0.05] opacity-50'}">
                <div class="flex items-start justify-between mb-6">
                    <div>
                        <span class="text-[9px] font-black uppercase text-red-400 tracking-widest">Flagged Content</span>
                        <h4 class="text-sm font-bold text-white mt-1">${r.reason}</h4>
                    </div>
                </div>
                ${m ? `
                    <div class="p-5 bg-black/20 rounded-xl border border-white/[0.05] mb-6">
                        <p class="text-[10px] text-muted font-bold mb-2">@${m.username} wrote:</p>
                        <p class="text-xs text-gray-400 italic font-medium leading-relaxed">"${m.content}"</p>
                    </div>
                    <div class="flex gap-3">
                         <button onclick="adminDeleteMessage('${m.id}', true)" class="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Remove</button>
                         <button onclick="dismissReport('${r.id}')" class="flex-1 py-3 glass-base border-white/[0.05] hover:bg-white/[0.05] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Dismiss</button>
                    </div>
                ` : `
                    <p class="text-[10px] text-muted font-bold italic">Source content removed.</p>
                    <button onclick="dismissReport('${r.id}')" class="mt-6 w-full py-3 glass-base rounded-xl text-[10px] font-black uppercase tracking-widest">Clear Index</button>
                `}
            </div>
        `;
    }).join('');
}

async function loadAdminUsers() {
    const table = document.getElementById('adminUsersTable');
    table.innerHTML = `<tr><td colspan="4" class="py-10 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF7F11] border-t-transparent"></div></td></tr>`;

    const { data, error } = await appSupabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return;

    table.innerHTML = data.map(u => `
        <tr class="hover:bg-white/[0.01] transition-all group">
            <td class="px-10 py-6">
                <div class="flex items-center gap-4">
                    <div class="h-8 w-8 glass-base flex items-center justify-center font-black text-[10px] text-[#ACBFA4] uppercase">
                        ${u.username[0]}
                    </div>
                    <div>
                        <p class="font-black text-xs text-[#E2E8CE]">@${u.username}</p>
                        <p class="text-[9px] text-[#ACBFA4]/50 font-mono tracking-tighter">${u.firebase_uid.substring(0, 12)}</p>
                    </div>
                </div>
            </td>
            <td class="px-10 py-6">
                <span class="text-[9px] font-black uppercase tracking-[0.1em] ${u.is_admin ? 'text-[#FF7F11]' : 'text-muted'}">
                    ${u.is_admin ? 'Authorized Admin' : 'Public User'}
                </span>
            </td>
            <td class="px-10 py-6 text-[10px] text-muted font-bold">
                ${new Date(u.created_at).toLocaleDateString()}
            </td>
            <td class="px-10 py-6 text-right">
                <button onclick="toggleAdminStatus('${u.id}', ${u.is_admin})" class="text-[10px] font-black uppercase tracking-widest ${u.is_admin ? 'text-gray-600' : 'text-[#FF7F11]'} opacity-0 group-hover:opacity-100 transition-all">
                    ${u.is_admin ? 'Demote' : 'Promote'}
                </button>
            </td>
        </tr>
    `).join('');
}

// Moderation Actions
async function adminDeleteMessage(id, isReport = false) {
    if (!confirm('Permanent Action: Delete this content?')) return;

    try {
        const { error } = await appSupabase.from('confessions').delete().eq('id', id);
        if (error) throw error;

        showAdminToast('Content removed successfully.', 'red');
        if (isReport) loadAdminReports();
        else loadAdminMessages();
        loadAllStats();
    } catch (e) { showAdminToast('Action Failed: ' + e.message, 'red'); }
}

async function dismissReport(id) {
    await appSupabase.from('reports').delete().eq('id', id);
    showAdminToast('Report dismissed.', 'blue');
    loadAdminReports();
    loadAllStats();
}

async function toggleAdminStatus(id, current) {
    if (!confirm(`Are you sure you want to ${current ? 'remove' : 'grant'} administrative permissions?`)) return;

    await appSupabase.from('profiles').update({ is_admin: !current }).eq('id', id);
    showAdminToast('User permissions updated.', '#FF7F11');
    loadAdminUsers();
}

// Helper Functions
function showAdminToast(msg, colorType) {
    const t = document.getElementById('adminToast');
    const m = document.getElementById('adminToastMsg');
    m.textContent = msg;

    // Brand mapping
    let color = '#ACBFA4';
    if (colorType === 'red') color = '#ef4444';
    else if (colorType === '#FF7F11') color = '#FF7F11';

    m.style.color = color;
    t.querySelector('.glass-card').style.borderColor = `${color}40`;

    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}

async function loadSystemLogs() {
    const logs = document.getElementById('systemLogs');
    const { data } = await appSupabase.from('reports').select('*, confessions!target_id(username)').order('created_at', { ascending: false }).limit(5);

    if (!data || data.length === 0) {
        logs.innerHTML = `<p class="text-gray-600 text-center py-10">No recent incidents detected.</p>`;
        return;
    }

    logs.innerHTML = data.map(l => `
        <div class="flex items-center gap-6 p-6 glass-base border-white/[0.03]">
            <div class="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
            <div class="flex-1">
                <p class="text-[10px] font-black uppercase tracking-widest text-[#E2E8CE]">Security Incident: ${l.reason}</p>
                <p class="text-[9px] font-bold text-muted mt-1 uppercase tracking-tighter">Subject: @${l.confessions?.username || 'Redacted'}</p>
            </div>
            <span class="text-[8px] font-black text-muted uppercase tracking-[0.2em]">${new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    `).join('');
}

function subscribeAdminRealtime() {
    appSupabase.channel('admin-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
            loadAllStats();
            loadAdminReports();
            loadSystemLogs();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'confessions' }, () => {
            loadAllStats();
            loadAdminMessages();
        })
        .subscribe();
}

function adminLogout() {
    window.auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// Start
document.addEventListener('DOMContentLoaded', initAdmin);
