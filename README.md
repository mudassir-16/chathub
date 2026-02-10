# AnonConfess - Real-Time Anonymous Confessions Platform

![AnonConfess](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

A modern, real-time anonymous confession platform where users can safely share their thoughts using a chosen username, while authentication and identity are securely handled in the background.

## 🌟 Features

### Core Features
- ✅ **Real-time confession posting & updates** using Supabase Realtime
- ✅ **Secure authentication** via Firebase (Email/Password, Google Sign-In)
- ✅ **Custom usernames** without revealing identity
- ✅ **Anonymous confessions** with category filtering
- ✅ **Live reactions** (Support ❤️, Relate 😔, Agree 👍)
- ✅ **Real-time comments** on confessions
- ✅ **Category filtering** (Love, College, Career, Stress, Family, Secrets, Random)
- ✅ **Multiple sorting options** (Latest, Trending, Most Supported)
- ✅ **Report system** for moderation
- ✅ **Stunning glassmorphic UI** with smooth animations

### Security & Privacy
- 🔒 Firebase UID never exposed publicly
- 🔒 Username is the only public identifier
- 🔒 Row Level Security (RLS) on all database tables
- 🔒 Content filtering and moderation system

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Tailwind CSS, JavaScript |
| Authentication | Firebase Authentication |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (WebSockets) |
| Hosting | Vercel / Firebase Hosting |

## 📋 Prerequisites

Before you begin, ensure you have:
- A [Firebase](https://firebase.google.com/) account and project
- A [Supabase](https://supabase.com/) account and project
- A modern web browser
- Basic knowledge of JavaScript

## 🚀 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd acp
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
   - Enable **Google** sign-in
4. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click on the web app icon (</>) or create a new web app
   - Copy the Firebase configuration object

### Step 3: Supabase Setup

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Once the project is ready, go to **SQL Editor**
4. Copy the contents of `database_schema.sql` and run it in the SQL Editor
5. Enable **Realtime** for tables:
   - Go to Database → Replication
   - Enable realtime for: `confessions`, `comments`, `reactions`
6. Get your Supabase credentials:
   - Go to Project Settings → API
   - Copy the **Project URL** and **anon/public key**

### Step 4: Configure the Application

1. Open `config.js`
2. Replace the Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace the Supabase configuration:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### Step 5: Run the Application

#### Option 1: Using a Local Server (Recommended)

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

#### Option 2: Using Live Server (VS Code)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Step 6: Test the Application

1. **Sign Up**: Create a new account using email/password or Google
2. **Choose Username**: Pick a unique username (3-20 characters)
3. **Post Confession**: Click "New Confession" and share your thoughts
4. **Interact**: React to confessions, add comments, and explore categories
5. **Real-time**: Open the app in multiple tabs to see real-time updates

## 📁 Project Structure

```
acp/
├── index.html              # Main HTML file with UI structure
├── styles.css              # Custom CSS with glassmorphic effects
├── app.js                  # Main application logic
├── config.js               # Firebase & Supabase configuration
├── database_schema.sql     # Supabase database schema
├── IMPLEMENTATION_PLAN.md  # Development roadmap
└── README.md              # This file
```

## 🎨 Design Features

- **Glassmorphic UI**: Modern frosted glass effect with backdrop blur
- **Gradient Accents**: Beautiful purple-pink gradients throughout
- **Smooth Animations**: Fade-in, scale, and slide animations
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Eye-friendly dark color scheme
- **Custom Scrollbar**: Styled scrollbar matching the theme

## 🔐 Security Features

### Row Level Security (RLS)
All database tables have RLS policies:
- Users can only insert their own profiles
- Flagged confessions are hidden from public view
- Reports are only visible to admins

### Content Validation
- Username: 3-20 characters, alphanumeric + underscore
- Confession: 10-1000 characters
- Comment: 1-500 characters
- Category: Must be from predefined list

### Firebase Authentication
- Secure token-based authentication
- Support for multiple auth providers
- Automatic session management

## 📊 Database Schema

### Tables

1. **profiles**: User profiles with username mapping
2. **confessions**: All confessions with reactions
3. **comments**: Comments on confessions
4. **reports**: User-submitted reports
5. **reactions**: Individual user reactions (optional tracking)

See `database_schema.sql` for complete schema details.

## 🎯 Usage

### Posting a Confession

1. Click the "New Confession" button
2. Select a category
3. Write your confession (10-1000 characters)
4. Click "Post Anonymously"

### Reacting to Confessions

- ❤️ **Support**: Show support for the confession
- 😔 **Relate**: Indicate you relate to the feeling
- 👍 **Agree**: Show agreement with the statement

### Filtering & Sorting

- **Categories**: Filter by Love, College, Career, Stress, Family, Secrets, or Random
- **Sort by**:
  - Latest: Most recent confessions
  - Trending: Popular recent confessions
  - Most Supported: Highest support count

### Reporting

Click the flag icon on any confession to report inappropriate content.

## 🚧 Roadmap

- [x] Basic authentication system
- [x] Username selection
- [x] Confession posting
- [x] Real-time updates
- [x] Reactions system
- [x] Comments system
- [x] Category filtering
- [ ] Admin panel for moderation
- [ ] Content filtering (profanity detection)
- [ ] Rate limiting
- [ ] User profiles with confession history
- [ ] Trending algorithm
- [ ] Push notifications
- [ ] Mobile app (React Native)

## 🐛 Known Issues

- Reaction system currently increments without checking if user already reacted (implement reactions table tracking)
- Comments don't load existing comments on toggle (implement comment fetching)
- No pagination for confessions (implement infinite scroll)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Firebase for authentication services
- Supabase for real-time database
- Tailwind CSS for styling utilities
- Google Fonts for Inter and Outfit fonts

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

---

**Built with ❤️ for anonymous expression**
