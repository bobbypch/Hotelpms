# PCH BWP Hotel PMS — Deployment Guide

## ✅ What's included
- `index.html` — Complete Hotel PMS (single file, no build needed)
- `manifest.json` — Mobile app install support

---

## 🚀 STEP 1 — Deploy FREE on Netlify (5 minutes)

1. Go to **netlify.com** → Sign up free (use Google)
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the entire `pchbwp` folder
4. You get a URL like: `https://grand-meridian-abc123.netlify.app`
5. To rename: Site settings → Change site name → e.g. `pchbwp` → URL becomes `pchbwp.netlify.app`

---

## ☁️ STEP 2 — Set up FREE Firebase (permanent cloud data)

Without Firebase, data saves to phone storage only.  
With Firebase, all devices share the same live data.

### Create Firebase project:
1. Go to **console.firebase.google.com**
2. Click **"Add project"** → name it `pchbwp` → Continue
3. Disable Google Analytics → Create project
4. Left sidebar → **Realtime Database** → Create database
5. Choose region → Start in **test mode** → Enable
6. Left sidebar → **Project Settings** (gear icon)
7. Scroll to **"Your apps"** → Click **</>** (web) → Register app
8. Copy the `firebaseConfig` object shown

### Paste into index.html:
Open `index.html`, find this section near the top:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  ...
};
```

Replace with your actual config from Firebase Console.

### Redeploy to Netlify:
Drag the updated folder to Netlify again → new deploy in seconds.

---

## 📱 STEP 3 — Install on Mobile (Android)

1. Open your Netlify URL in **Chrome**
2. Tap ⋮ menu (top right)
3. Tap **"Add to Home Screen"**
4. Tap **Add**
5. App icon appears on home screen — works like a native app!

### iPhone:
1. Open URL in **Safari**
2. Tap **Share** button (square with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

---

## 👤 Login
- Username: `bobby`
- Password: `admin123`

---

## 📞 Support
Your PMS is fully self-contained. Share the Netlify URL with all staff.
All check-ins, checkouts, and data sync instantly across all devices when Firebase is configured.
