# 🔧 Troubleshooting Guide

## Issue: "auth is not defined" Error

### ✅ **FIXED!**

I've updated `config.js` to properly wait for Firebase and Supabase SDKs to load before initializing them.

### What to do now:

1. **Refresh your browser** (press F5 or Ctrl+R)
2. **Open browser console** (press F12)
3. **Look for this message**: `✅ Firebase and Supabase initialized successfully`

If you see that message, you're good to go!

---

## Next Steps Checklist

### ✅ Step 1: Verify Firebase Setup
- [ ] Go to https://console.firebase.google.com/
- [ ] Open your project: `vitsnss-37b1d`
- [ ] Click "Authentication" → "Sign-in method"
- [ ] Verify **Email/Password** is enabled
- [ ] Verify **Google** is enabled

### ⚠️ Step 2: Set Up Supabase Database (IMPORTANT!)
You MUST run the database schema in Supabase:

1. **Go to Supabase Dashboard**: https://app.supabase.com/
2. **Open your project**: `ovzemxtpxvhymzthbupt`
3. **Click "SQL Editor"** in the left sidebar
4. **Click "New query"**
5. **Copy the ENTIRE contents** of `database_schema.sql` (already open in your editor!)
6. **Paste into SQL Editor**
7. **Click "Run"** or press Ctrl+Enter
8. **Wait for success message**

### ✅ Step 3: Enable Realtime
After running the schema:

1. In Supabase Dashboard, click **"Database" → "Replication"**
2. Enable these tables:
   - ✅ `confessions`
   - ✅ `comments`
   - ✅ `reactions`

### ✅ Step 4: Test the Application

1. **Refresh the page**: http://localhost:8000
2. **Open browser console** (F12) - check for errors
3. **Try to sign up**:
   - Click "Sign Up"
   - Enter email: `test@example.com`
   - Enter password: `test123456`
   - Click "Create Account"

---

## Common Errors & Solutions

### Error: "Failed to create user"
**Solution**: Check that Email/Password auth is enabled in Firebase Console

### Error: "relation 'profiles' does not exist"
**Solution**: You haven't run the database schema in Supabase yet. Follow Step 2 above.

### Error: "Invalid API key"
**Solution**: Double-check your Supabase anon key in `config.js`

### Error: Console shows "Firebase SDK not loaded"
**Solution**: Check your internet connection - Firebase loads from CDN

### Error: "Username already taken"
**Solution**: Choose a different username or check Supabase to see existing usernames

---

## Quick Test Commands

### Check if Firebase is loaded:
Open browser console (F12) and type:
```javascript
typeof firebase
```
Should return: `"object"`

### Check if Supabase is loaded:
```javascript
typeof window.supabase
```
Should return: `"object"`

### Check if auth is initialized:
```javascript
window.auth
```
Should return: Firebase Auth object

---

## Database Schema Status

**File**: `database_schema.sql` (already open in your editor)
**Size**: 9.6 KB
**Tables**: 5 (profiles, confessions, comments, reports, reactions)

### To verify schema is installed:
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. You should see these tables:
   - profiles
   - confessions
   - comments
   - reports
   - reactions

If you don't see these tables, **you need to run the schema!**

---

## Current Configuration Status

✅ **Firebase Project**: vitsnss-37b1d
✅ **Supabase Project**: ovzemxtpxvhymzthbupt
✅ **Config File**: Updated with proper initialization
✅ **Local Server**: Running on port 8000

---

## What Should Happen When It Works

1. **Page loads** - You see the beautiful purple/pink login screen
2. **Console shows** - `✅ Firebase and Supabase initialized successfully`
3. **Sign up works** - You can create an account
4. **Username selection** - You can choose a username
5. **Main feed loads** - You see the confession feed (empty at first)
6. **Post confession** - You can post your first confession
7. **Real-time works** - Opening in 2 tabs shows instant updates

---

## Need More Help?

1. **Check browser console** (F12) for error messages
2. **Check Supabase logs**: Dashboard → Logs
3. **Check Firebase logs**: Console → Authentication → Users
4. **Verify all steps** in SETUP_GUIDE.md

---

## Quick Fix Summary

**The "auth is not defined" error has been fixed!**

Now you just need to:
1. ✅ Refresh your browser
2. ⚠️ **Run the database schema in Supabase** (if you haven't already)
3. ✅ Enable Realtime for the 3 tables
4. ✅ Test signup and login

**Most important**: Make sure you run `database_schema.sql` in Supabase!
