# Vercel Deployment Guide: Environment Variables

To fix the deployment on Vercel, copy and paste these keys into your **Project Settings > Environment Variables** tab.

### **Firebase Keys**

| Key | Value |
| :--- | :--- |
| `FIREBASE_API_KEY` | `AIzaSyA8hzGKjPgfLW4mSDuk9ullyt8wMx_NX_c` |
| `FIREBASE_AUTH_DOMAIN` | `vitsnss-37b1d.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `vitsnss-37b1d` |
| `FIREBASE_STORAGE_BUCKET` | `vitsnss-37b1d.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `157730254317` |
| `FIREBASE_APP_ID` | `1:157730254317:web:b10d022d6967be2f934be4` |

### **Supabase Keys**

| Key | Value |
| :--- | :--- |
| `SUPABASE_URL` | `https://ovzemxtpxvhymzthbupt.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92emVteHRweHZoeW16dGhidXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjEyNDUsImV4cCI6MjA4NjE5NzI0NX0.4O9SxgI__UaAdyRxqE6MRmJjf0GDb5-K8HekgnYoAok` |

---

### **Final Step**
After adding these variables:
1. Go to the **Deployments** tab in Vercel.
2. Find your latest deployment.
3. Click the three dots (···) and select **Redeploy**.
4. Make sure "Use existing Build Cache" is **NOT** checked (optional, but safer).
