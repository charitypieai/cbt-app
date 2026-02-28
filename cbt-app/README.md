# Creative Brief Translator (CBT)

A guided brief intake tool for Creative Strategy → Design handoffs.

---

## Deploy to Vercel (5 minutes, free)

### Step 1 — Create a GitHub account
Go to https://github.com and sign up (free).

### Step 2 — Create a new repository
1. Click the **+** icon → **New repository**
2. Name it `creative-brief-translator`
3. Set it to **Private** (recommended for internal tools)
4. Click **Create repository**

### Step 3 — Upload the project files
1. On your new repo page, click **uploading an existing file**
2. Drag and drop the entire contents of this folder (all files and the `src/` and `public/` folders)
3. Click **Commit changes**

### Step 4 — Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New → Project**
3. Find and select your `creative-brief-translator` repo
4. Vercel auto-detects it as a React app — just click **Deploy**
5. In ~60 seconds you get a live link like: `creative-brief-translator.vercel.app`

### Step 5 — Share the link
That's it. Send the link to your team.

---

## Project Structure

```
cbt-app/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx        ← The entire app lives here
│   └── index.js
├── package.json
└── README.md
```

---

## Customization

All colors are defined at the top of `src/App.jsx` in the `C` object:

```js
const C = {
  blue: "#0078D4",   // Microsoft blue — change to your brand color
  bg: "#0F0F0F",     // Background
  ...
}
```

To update the app after deploying: edit `App.jsx`, commit to GitHub, Vercel auto-redeploys.
