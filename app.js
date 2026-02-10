// Global State
let currentUser = null;
let currentUsername = null;
let isAdmin = false;
let messages = [];
let currentSort = 'latest';
let realtimeSubscription = null;
let isAdminView = false;

// Initialize App - Wait for Config to be ready
function initApp() {
    // Check if services are ready
    if (typeof window.auth === 'undefined' || typeof window.supabase === 'undefined') {
        console.log('⏳ Waiting for Firebase & Supabase...');
        setTimeout(initApp, 100);
        return;
    }

    console.log('🚀 Services ready, initializing app logic...');

    // Set global refs for easier use
    const auth = window.auth;
    const supabase = window.supabase;

    // Check auth state
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('👤 User logged in:', user.email);
            currentUser = user;
            await checkUsername();
        } else {
            console.log('🔑 No user session, showing login');
            showScreen('authScreen');
        }
    });

    // Character counter for post modal
    const postContent = document.getElementById('postContent');
    if (postContent) {
        postContent.addEventListener('input', (e) => {
            const count = document.getElementById('charCount');
            if (count) count.textContent = e.target.value.length;
        });
    }
}

// Start the check
document.addEventListener('DOMContentLoaded', initApp);

// Screen Management
function showScreen(screenId) {
    const screens = ['authScreen', 'usernameScreen', 'appScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

// Authentication Functions
function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
}

async function emailLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        await window.auth.signInWithEmailAndPassword(email, password);
        showToast('Login successful!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function emailSignup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        await window.auth.createUserWithEmailAndPassword(email, password);
        showToast('Account created successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}



async function logout() {
    try {
        // Unsubscribe from realtime updates
        if (realtimeSubscription) {
            realtimeSubscription.unsubscribe();
        }

        await window.auth.signOut();
        currentUser = null;
        currentUsername = null;
        isAdmin = false;
        messages = [];
        showScreen('authScreen');
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Username Management
async function checkUsername() {
    try {
        console.log('🔍 Checking profile for:', currentUser.uid);

        // Try to fetch both username and is_admin
        let { data, error } = await window.supabase
            .from('profiles')
            .select('username, is_admin')
            .eq('firebase_uid', currentUser.uid)
            .single();

        // If the above fails with status 400, it usually means 'is_admin' column is missing in DB
        if (error && error.status === 400) {
            console.warn('⚠️ "is_admin" column likely missing, falling back to basic profile fetch...');
            const fallback = await window.supabase
                .from('profiles')
                .select('username')
                .eq('firebase_uid', currentUser.uid)
                .single();
            data = fallback.data;
            error = fallback.error;
        }

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (data && data.username) {
            currentUsername = data.username;
            isAdmin = data.is_admin || false;

            console.log('✅ Profile Loaded:', currentUsername, isAdmin ? '(Admin)' : '(User)');

            // Show/Hide Admin Tools
            const adminBadge = document.getElementById('adminBadge');
            const adminBtn = document.getElementById('adminBtn');
            if (isAdmin) {
                if (adminBadge) adminBadge.classList.remove('hidden');
                if (adminBtn) adminBtn.classList.remove('hidden');
            }

            document.getElementById('currentUsername').textContent = `@${currentUsername}`;
            showScreen('appScreen');
            await loadConfessions();
            subscribeToRealtime();
        } else {
            console.log('🆕 No profile found, showing username screen');
            showScreen('usernameScreen');
        }
    } catch (error) {
        console.error('❌ Error checking username:', error);
        showToast('Error loading profile', 'error');
    }
}

async function setUsername() {
    const username = document.getElementById('usernameInput').value.trim();

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        showToast('Username must be 3-20 characters, alphanumeric and underscore only', 'error');
        return;
    }

    try {
        // Check if username is already taken
        const { data: existing } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        if (existing) {
            showToast('Username already taken. Please choose another.', 'error');
            return;
        }

        // Create profile
        const { error } = await supabase
            .from('profiles')
            .insert([
                {
                    firebase_uid: currentUser.uid,
                    username: username
                }
            ]);

        if (error) throw error;

        currentUsername = username;
        document.getElementById('currentUsername').textContent = `@${currentUsername}`;
        showToast('Username set successfully!', 'success');
        showScreen('appScreen');
        await loadConfessions();
        subscribeToRealtime();
    } catch (error) {
        console.error('Error setting username:', error);
        showToast('Error setting username. Please try again.', 'error');
    }
}

// Header Actions
function goToPortal() {
    window.open('admin.html', '_blank');
}

// Message Management
async function loadConfessions() {
    try {
        let query = supabase
            .from('confessions')
            .select(`
                *,
                profiles!inner(username)
            `)
            .eq('is_flagged', false);

        // Apply sorting
        if (currentSort === 'latest') {
            query = query.order('created_at', { ascending: false });
        } else if (currentSort === 'trending') {
            query = query.order('created_at', { ascending: false });
        } else if (currentSort === 'supported') {
            query = query.order('support_count', { ascending: false });
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        messages = data || [];
        renderMessages();
    } catch (error) {
        console.error('Error loading messages:', error);
        showToast('Error loading messages', 'error');
    }
}

function renderMessages() {
    const feed = document.getElementById('confessionsFeed');
    if (!feed) return;

    if (messages.length === 0) {
        feed.innerHTML = `
            <div class="text-center py-12 glass-card rounded-2xl border border-white/10">
                <svg class="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p class="text-gray-400 text-lg">No messages yet</p>
                <p class="text-gray-500 text-sm mt-2">Be the first to share!</p>
            </div>
        `;
        return;
    }

    feed.innerHTML = messages.map(message => createMessageCard(message)).join('');
}

function createMessageCard(message) {
    const timeAgo = getTimeAgo(message.created_at);

    return `
        <div class="confession-card glass-card animate-in" data-id="${message.id}">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[10px] font-black text-[#FF7F11]">
                        ${message.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-xs font-black tracking-tight text-[#E2E8CE]">@${message.username}</p>
                        <p class="text-[10px] font-bold text-muted">${timeAgo}</p>
                    </div>
                </div>
            </div>
            
            <p class="text-sm font-medium leading-relaxed text-[#E2E8CE]/90 mb-8">${escapeHtml(message.content)}</p>
            
            <div class="flex items-center gap-6 pt-6 border-t border-white/[0.03]">
                <button onclick="toggleReaction('${message.id}')" 
                    class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-[#FF7F11] transition-colors">
                    <span class="text-sm">❤️</span>
                    <span>${message.support_count || 0}</span>
                </button>
                <button onclick="toggleComments('${message.id}')" 
                    class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-[#ACBFA4] transition-colors">
                    <span>Comment</span>
                </button>
                <button onclick="reportMessage('${message.id}')" 
                    class="ml-auto text-[10px] font-bold text-muted/30 hover:text-red-400 uppercase tracking-tighter">Report</button>
            </div>
            <div id="comments-${message.id}" class="hidden mt-6 animate-in"></div>
        </div>
    `;
}

// Message Actions
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message? This action is permanent.')) return;

    try {
        const { error } = await supabase
            .from('confessions')
            .delete()
            .eq('id', messageId);

        if (error) throw error;
        showToast('Message deleted successfully', 'success');
        if (isAdminView) {
            loadAdminStats();
            loadReports();
        } else {
            loadConfessions();
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        showToast('Error deleting message', 'error');
    }
}

async function reportMessage(messageId) {
    const reason = prompt('Why are you reporting this message?\n\n1. Harassment\n2. Hate speech\n3. Spam\n4. Inappropriate content');
    if (!reason) return;

    try {
        const { error } = await supabase
            .from('reports')
            .insert([{
                target_id: messageId,
                target_type: 'confession',
                reason: reason
            }]);

        if (error) throw error;
        showToast('Message reported to admin', 'success');
    } catch (error) {
        console.error('Error reporting message:', error);
        showToast('Error submitting report', 'error');
    }
}

// Admin redirection for moderation
function openModeration() {
    showToast('Redirecting to Admin Portal...', 'info');
    setTimeout(() => window.open('admin.html', '_blank'), 1000);
}

// Realtime Subscriptions
function subscribeToRealtime() {
    realtimeSubscription = supabase
        .channel('public-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'confessions' }, (payload) => {
            console.log('📢 Realtime Update:', payload.eventType);
            loadConfessions();
        })
        .subscribe();
}

// Utility same as before...
function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    // Minimal brand-aligned toast
    let color = '#ACBFA4'; // Success (Sage)
    if (type === 'error') color = '#ef4444'; // Error
    else if (type === 'info') color = '#FF7F11'; // Info (Orange)

    toastMessage.style.color = color;
    toast.style.borderColor = `${color}30`;

    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Modal handling
function openPostModal() {
    document.getElementById('postModal').classList.remove('hidden');
    document.getElementById('postContent').value = '';
    document.getElementById('charCount').textContent = '0';
}

function closePostModal() {
    document.getElementById('postModal').classList.add('hidden');
}

async function postConfession() {
    const content = document.getElementById('postContent').value.trim();
    if (!content || content.length < 10) {
        showToast('Message must be at least 10 characters', 'error');
        return;
    }

    try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('firebase_uid', currentUser.uid).single();
        const { error } = await supabase.from('confessions').insert([{
            user_id: profile.id,
            username: currentUsername,
            content: content,
            category: 'general'
        }]);

        if (error) throw error;
        showToast('Message posted!', 'success');
        closePostModal();
    } catch (error) {
        console.error('Error posting:', error);
        showToast('Error posting message', 'error');
    }
}

async function toggleReaction(messageId) {
    try {
        const { data: msg } = await supabase.from('confessions').select('support_count').eq('id', messageId).single();
        await supabase.from('confessions').update({ support_count: (msg.support_count || 0) + 1 }).eq('id', messageId);
    } catch (error) { console.error('Reaction error:', error); }
}

async function toggleComments(messageId) {
    const commentsDiv = document.getElementById(`comments-${messageId}`);
    if (commentsDiv.classList.contains('hidden')) {
        commentsDiv.classList.remove('hidden');
        await loadComments(messageId);
    } else {
        commentsDiv.classList.add('hidden');
    }
}

async function loadComments(messageId) {
    const commentsDiv = document.getElementById(`comments-${messageId}`);
    commentsDiv.innerHTML = `
        <div class="pt-6 space-y-6 border-t border-white/[0.03]">
            <div class="flex gap-4">
                <input type="text" id="comment-input-${messageId}" 
                    class="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#FF7F11]/30 transition-all" 
                    placeholder="Write a comment...">
                <button onclick="postComment('${messageId}')" 
                    class="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-[10px] font-black uppercase text-[#FF7F11] tracking-widest transition-all">Post</button>
            </div>
            <div id="comments-list-${messageId}" class="space-y-4">
                <p class="text-center text-[10px] uppercase tracking-widest text-muted font-bold py-4">No comments yet</p>
            </div>
        </div>`;
}

async function postComment(messageId) {
    const input = document.getElementById(`comment-input-${messageId}`);
    const comment = input.value.trim();
    if (!comment) return;

    try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('firebase_uid', currentUser.uid).single();
        await supabase.from('comments').insert([{ confession_id: messageId, user_id: profile.id, username: currentUsername, comment: comment }]);
        input.value = '';
        showToast('Comment posted!', 'success');
    } catch (error) { console.error('Comment error:', error); }
}

function sortBy(sortType, element) {
    currentSort = sortType;
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.add('text-muted');
        btn.classList.remove('text-[#FF7F11]');
    });

    if (element) {
        element.classList.remove('text-muted');
        element.classList.add('text-[#FF7F11]');
    }

    loadConfessions();
}
