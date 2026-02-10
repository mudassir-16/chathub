# 🚀 Quick Start Guide

Get AnonConfess running in 3 simple steps!

## ⚡ Super Quick Start (5 minutes)

### Step 1: Get Firebase Credentials (2 min)
1. Go to https://console.firebase.google.com/
2. Create project → Enable Email/Password + Google auth
3. Copy the config object from Project Settings

### Step 2: Get Supabase Credentials (2 min)
1. Go to https://app.supabase.com/
2. Create project → Run `database_schema.sql` in SQL Editor
3. Enable Realtime for: confessions, comments, reactions
4. Copy URL + anon key from Settings → API

### Step 3: Configure & Run (1 min)
1. Open `config.js`
2. Paste your Firebase config
3. Paste your Supabase URL and key
4. Server is already running at http://localhost:8000
5. Open in browser and test!

## 📋 What You Get

✅ **Beautiful UI** - Glassmorphic dark theme with purple-pink gradients
✅ **Real-time** - Live updates using Supabase Realtime
✅ **Secure** - Firebase auth + Supabase RLS
✅ **Anonymous** - Username-based, identity hidden
✅ **Complete** - All features implemented and ready

## 🎯 First Test

1. Open http://localhost:8000
2. Click "Sign Up"
3. Enter email + password
4. Choose username (e.g., "test_user_123")
5. Click "New Confession"
6. Write something and post
7. See it appear instantly!

## 📚 Need More Help?

- **Detailed Setup**: Read `SETUP_GUIDE.md`
- **Full Docs**: Read `README.md`
- **Features**: Read `PROJECT_SUMMARY.md`
- **Track Progress**: Use `CHECKLIST.md`

## 🎨 Key Features to Test

- ✅ Post confessions
- ✅ React (❤️ 😔 👍)
- ✅ Comment
- ✅ Filter by category
- ✅ Sort (Latest/Trending/Supported)
- ✅ Real-time updates (open 2 tabs!)

## 🔧 Troubleshooting

**Login not working?**
→ Check Firebase config in `config.js`

**Confessions not loading?**
→ Check Supabase config + verify schema was run

**Real-time not working?**
→ Enable Realtime in Supabase for all 3 tables

**Page not loading?**
→ Make sure you're using http://localhost:8000 (not file://)

## 🌐 Deploy When Ready

```bash
# Vercel (recommended)
npm install -g vercel
vercel

# Firebase
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

---

**Server Running**: ✅ http://localhost:8000

**Next**: Open the link above and start testing! 🎉
