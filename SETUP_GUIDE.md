# Quick Setup Guide for AnonConfess

This guide will help you get AnonConfess up and running in under 15 minutes.

## Prerequisites Checklist

- [ ] Firebase account (free tier is sufficient)
- [ ] Supabase account (free tier is sufficient)
- [ ] Modern web browser
- [ ] Local web server (Python, Node.js, or VS Code Live Server)

## Step-by-Step Setup

### 1. Firebase Setup (5 minutes)

#### Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: `anonconfess` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable"
   - Enter project support email
   - Click "Save"

#### Get Firebase Credentials
1. Click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app with nickname: "AnonConfess Web"
5. Copy the `firebaseConfig` object
6. Keep this tab open - you'll need these values

### 2. Supabase Setup (5 minutes)

#### Create Supabase Project
1. Go to https://app.supabase.com/
2. Click "New project"
3. Choose your organization (or create one)
4. Enter:
   - Name: `anonconfess`
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for project to be ready

#### Run Database Schema
1. In Supabase Dashboard, click "SQL Editor" in left sidebar
2. Click "New query"
3. Open `database_schema.sql` from the project
4. Copy ALL contents and paste into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Wait for success message

#### Enable Realtime
1. Click "Database" → "Replication" in left sidebar
2. Find and enable these tables:
   - ✅ `confessions`
   - ✅ `comments`
   - ✅ `reactions`
3. Click "Save" or toggle each one

#### Get Supabase Credentials
1. Click "Settings" (gear icon) → "API"
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` `public` key, NOT the service_role key)
3. Keep this tab open

### 3. Configure Application (2 minutes)

1. Open `config.js` in your code editor
2. Replace Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY_HERE",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
    projectId: "PASTE_YOUR_PROJECT_ID_HERE",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
    appId: "PASTE_YOUR_APP_ID_HERE"
};
```

3. Replace Supabase configuration:

```javascript
const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'PASTE_YOUR_ANON_KEY_HERE';
```

4. Save the file

### 4. Run the Application (1 minute)

Choose one method:

#### Method A: Python (if you have Python installed)
```bash
cd path/to/acp
python -m http.server 8000
```

#### Method B: Node.js
```bash
cd path/to/acp
npx http-server -p 8000
```

#### Method C: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Click "Open with Live Server"

### 5. Test the Application (2 minutes)

1. Open browser to `http://localhost:8000`
2. You should see the AnonConfess login page
3. Click "Sign Up"
4. Create account with email/password
5. Choose a username (e.g., `test_user_123`)
6. You should see the main feed
7. Click "New Confession" to post your first confession!

## Troubleshooting

### "Firebase: Error (auth/...)"
- Check that you enabled Email/Password and Google auth in Firebase Console
- Verify your Firebase config values are correct
- Make sure there are no extra spaces or quotes

### "Supabase: 401 Unauthorized"
- Verify you copied the `anon` key, not the `service_role` key
- Check that your Supabase URL is correct
- Ensure database schema was run successfully

### "Cannot read property 'createClient' of undefined"
- Make sure you're running the app through a web server (not opening HTML file directly)
- Check browser console for script loading errors
- Verify internet connection (CDN scripts need to load)

### Database schema errors
- Make sure you copied the ENTIRE `database_schema.sql` file
- Run it in a fresh SQL Editor tab
- Check for any error messages in the output

### Realtime not working
- Verify you enabled Realtime for confessions, comments, and reactions tables
- Check browser console for WebSocket errors
- Try refreshing the page

## Next Steps

Once everything is working:

1. **Customize the design**: Edit `styles.css` to match your brand
2. **Add moderation**: Implement the admin panel
3. **Deploy**: Use Vercel or Firebase Hosting (see README.md)
4. **Share**: Invite friends to test the platform!

## Need Help?

- Check the main `README.md` for detailed documentation
- Review `IMPLEMENTATION_PLAN.md` for feature roadmap
- Open an issue on GitHub
- Check Firebase and Supabase documentation

## Security Reminders

⚠️ **Important**: 
- Never commit `config.js` to public repositories
- Keep your Firebase and Supabase credentials secret
- Use environment variables for production deployments
- Regularly review your Firebase and Supabase usage

---

**Estimated Total Setup Time: 15 minutes**

Happy confessing! 🎉
