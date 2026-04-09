# 📋 COPY-PASTE COMMANDS - NO THINKING REQUIRED

## ⚠️ FIRST: Create .env file

Open PowerShell and run:

```powershell
notepad d:\Identify\backend\.env
```

Paste this content:

```
OPENAI_API_KEY=sk-your-actual-api-key-here-not-this-text
PORT=5000
NODE_ENV=development
```

⚠️ **IMPORTANT:** Replace `sk-your-actual-api-key-here-not-this-text` with your real OpenAI API key from https://platform.openai.com/api-keys

Then: Ctrl+S (Save) → Close window

---

## 🚀 TERMINAL 1 - Backend Server

Copy this entire block and paste into PowerShell:

```powershell
cd d:\Identify\backend; npm install; npm run dev
```

OR run each line separately:

```powershell
cd d:\Identify\backend
npm install
npm run dev
```

✅ **You should see:** `Server is running on port 5000`

---

## 🎨 TERMINAL 2 - Frontend Server

Open a NEW PowerShell window and copy this:

```powershell
cd d:\Identify\frontend; npm install; npm start
```

OR run each line separately:

```powershell
cd d:\Identify\frontend
npm install
npm start
```

✅ **Browser should open automatically** to http://localhost:3000

---

## 💻 You Now Have:

Terminal 1 ← Backend running on port 5000
Terminal 2 ← Frontend running on port 3000
Browser → http://localhost:3000 open

---

## 🧪 Test It

1. In the browser at localhost:3000, you should see:
   - Upload area with drag-and-drop
   - Professional animated UI
   - Smooth hovering effects

2. Upload a resume PDF:
   - Click drag-drop area or select file
   - File must be PDF format
   - File must be < 10MB

3. Click "Upload Resume" button

4. Wait 30-60 seconds

5. See AI analysis results!

---

## 🔧 If Things Go Wrong

**Backend won't start:**

```powershell
cd d:\Identify\backend
del node_modules -Recurse -Force
npm install
npm run dev
```

**Port 5000 in use:**

```powershell
$proc = Get-NetTCPConnection -LocalPort 5000
Stop-Process -Id $proc.OwningProcess -Force
```

Then try starting backend again.

**Frontend can't connect:**

- Make sure terminal 1 shows "Server is running on port 5000"
- Wait 5 seconds and refresh browser (F5)

**API key error:**

- Double-check .env file has correct API key
- API key should start with "sk-"
- Paste exactly with no spaces

---

## 📱 Check Status

### Is Backend Running?

```powershell
Invoke-WebRequest http://localhost:5000/api/health
```

### Is Frontend Running?

Open browser: http://localhost:3000

---

## ✅ Checklist Before Starting

- [ ] Node.js installed (test: `node --version`)
- [ ] npm installed (test: `npm --version`)
- [ ] OpenAI API key obtained from https://platform.openai.com/api-keys
- [ ] backend\.env file created with API key
- [ ] Two PowerShell windows open

---

## 🎯 Expected Behavior

**Terminal 1 Output:**

```
Server is running on port 5000
Environment: development
✓ API ready for requests
```

**Terminal 2 Output:**

```
Compiled successfully!

You can now view frontend in the browser.
Local: http://localhost:3000
```

**Browser:**

- Page loads with upload interface
- Animations visible on hover
- No errors in console

---

## 🚀 YOU'RE READY!

**These are the only commands you need:**

Terminal 1:

```
cd d:\Identify\backend; npm install; npm run dev
```

Terminal 2 (NEW window):

```
cd d:\Identify\frontend; npm install; npm start
```

That's it! 🎉

---

**Questions? Check STARTUP_GUIDE.md for detailed info**
