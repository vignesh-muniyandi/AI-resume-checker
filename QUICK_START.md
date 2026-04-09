# 🎯 QUICK START CHEATSHEET - RUN IN 2 MINUTES

## ⚡ Fast Setup

### Step 1: Backend (Terminal 1) - 30 seconds

```powershell
cd d:\Identify\backend
npm install
npm run dev
```

✅ **Wait for:** `Server is running on port 5000`

### Step 2: Frontend (Terminal 2) - 30 seconds

```powershell
cd d:\Identify\frontend
npm install
npm start
```

✅ **Browser opens automatically**

---

## 🔑 BEFORE FIRST RUN (1 minute)

**Create `backend\.env` file:**

1. Open PowerShell
2. Run: `notepad d:\Identify\backend\.env`
3. Paste this:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxx
PORT=5000
NODE_ENV=development
```

4. **Replace** `sk-xxxxxxxxxxxxxxxxx` with your real API key
5. Save (Ctrl+S) and close

**Get API Key:**

- Go to: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy entire key (starts with `sk-`)

---

## 🎨 What's Working ✨

✅ Modern animated UI  
✅ PDF resume upload  
✅ Smart AI analysis  
✅ Professional design  
✅ All error fixes applied

---

## 🧪 Test the App

1. Go to http://localhost:3000/
2. Drag & drop a resume PDF (< 10MB)
3. Click upload
4. **Wait 30-60 seconds**
5. See analysis results!

---

## 🔧 Quick Fixes

| Problem              | Solution                       |
| -------------------- | ------------------------------ |
| `npm install` fails  | Run: `npm cache clean --force` |
| Port 5000 in use     | Change PORT in `.env` to 5001  |
| "Cannot find module" | Run `npm install` again        |
| API error            | Check API key in `.env`        |

---

## 📁 Key Files

- Backend: `d:\Identify\backend\server.js`
- Frontend: `d:\Identify\frontend\src\App.js`
- Styles: `d:\Identify\frontend\src\index.css`

---

**🚀 Ready? Start Terminal 1 now!**
AI-Resume-Analyzer/
├── backend/ # Express server + AI integration
├── frontend/ # React UI application
└── README.md

```

## ✅ Testing

1. Go to http://localhost:3000
2. Drag & drop or select a PDF resume
3. Wait for AI analysis
4. View results

## 🆘 Troubleshooting

| Issue               | Solution                                         |
| ------------------- | ------------------------------------------------ |
| Backend won't start | Check port 5000 is free, `npm install` succeeded |
| Can't upload file   | Ensure file is PDF, under 5MB                    |
| No AI response      | Check OpenAI API key is valid                    |
| CORS error          | Verify `CORS_ORIGIN` in backend .env             |

## 📚 Documentation

See [README.md](./README.md) for complete documentation.
```
