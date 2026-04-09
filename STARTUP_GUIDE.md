# 🚀 AI Resume Analyzer - Startup Guide

## Quick Start (5 Minutes)

### Prerequisites

- **Node.js** 14+ installed
- **npm** 6+ installed
- **OpenAI API Key** from [OpenAI Platform](https://platform.openai.com/api-keys)

---

## Step 1: Setup Backend (Terminal 1)

```powershell
# Navigate to backend directory
cd d:\Identify\backend

# Install dependencies
npm install

# Create .env file with your OpenAI API key
notepad .env
```

**Add to `.env` file:**

```
OPENAI_API_KEY=sk-your-api-key-here
PORT=5000
NODE_ENV=development
```

**Start backend server:**

```powershell
npm run dev
```

✅ You should see: `Server is running on port 5000`

---

## Step 2: Setup Frontend (Terminal 2)

```powershell
# Navigate to frontend directory
cd d:\Identify\frontend

# Install dependencies
npm install

# Start React development server
npm start
```

✅ Browser will automatically open to `http://localhost:3000`

---

## Step 3: Test the Application

1. **Upload a Resume**
   - Click the upload area or drag-and-drop a PDF resume
   - File must be: PDF format, < 10MB, valid resume content

2. **View Analysis**
   - Wait for AI analysis (30-60 seconds)
   - See detailed resume breakdown with:
     - Overall score (0-100)
     - Key strengths identified
     - Areas for improvement
     - Missing important skills
     - Performance summary

---

## 🎨 Advanced Features Already Enabled

✅ **Modern UI with Advanced CSS**

- Smooth animations and transitions
- Glass-morphism design effects
- Gradient backgrounds and text
- Responsive design for all devices
- Interactive hover states
- Loading animations

✅ **Backend Features**

- PDF text extraction
- OpenAI GPT-3.5-Turbo analysis
- Structured JSON output
- Error handling & validation
- CORS support for cross-origin requests

---

## 📋 Environment Variables

### Required (Backend)

- `OPENAI_API_KEY` - Your OpenAI API key (REQUIRED)
- `PORT` - Server port (default: 5000)

### Optional

- `NODE_ENV` - Set to `development` or `production`
- `CORS_ORIGIN` - Frontend URL (default: `http://localhost:3000`)

---

## 🔧 Troubleshooting

### Issue: Cannot find module 'pdf-parse'

**Solution:** Run `npm install` in backend directory

```powershell
cd backend
npm install
```

### Issue: OpenAI API Key Error

**Solution:** Verify your API key in `.env` file

- Go to [OpenAI Dashboard](https://platform.openai.com/api-keys)
- Create a new API key
- Copy it exactly to `.env` file

### Issue: Port 5000 Already in Use

**Solution:** Kill existing process or change port

```powershell
# Change port in backend/.env
PORT=5001

# Or kill process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### Issue: Frontend Can't Connect to Backend

**Solution:** Ensure backend is running on port 5000

```powershell
# Check if backend is running
# Terminal 1 should show: "Server is running on port 5000"
# If not, check for errors in Terminal 1
```

---

## 📊 API Endpoints

### POST `/api/analyze-resume`

Analyzes uploaded resume

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Resume PDF file

**Response:**

```json
{
  "success": true,
  "analysis": {
    "overallScore": 75,
    "summary": "Strong candidate with...",
    "strengths": ["Skill 1", "Skill 2"],
    "weaknesses": ["Area 1", "Area 2"],
    "missingSkills": ["Skill A", "Skill B"]
  }
}
```

### GET `/api/health`

Health check endpoint

**Response:**

```json
{
  "status": "Server is running",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🎓 Project Structure

```
d:\Identify\
├── backend/
│   ├── server.js           # Express server
│   ├── src/
│   │   ├── pdfParser.js    # PDF extraction
│   │   ├── aiAnalyzer.js   # OpenAI integration
│   │   └── validators.js   # Input validation
│   ├── uploads/           # Temporary file storage
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js          # Main component
│   │   ├── components/
│   │   │   ├── ResumeUpload.js      # Upload interface
│   │   │   ├── AnalysisResults.js   # Results display
│   │   │   ├── ResumeUpload.css     # Upload styles
│   │   │   └── AnalysisResults.css  # Results styles
│   │   ├── index.css       # Global styles
│   │   └── index.js
│   └── package.json
│
└── Documentation files...
```

---

## 🚀 Production Deployment

### Backend Deployment (Heroku Example)

```powershell
# Create Heroku app
heroku create your-app-name
heroku config:set OPENAI_API_KEY=sk-your-key

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure OpenAI API key is valid
4. Check that both terminal windows show no errors

---

## ✨ Next Steps

1. ✅ Verify both servers are running
2. ✅ Upload a test resume
3. ✅ Review the analysis results
4. ✅ Customize styling in CSS files as needed
5. ✅ Deploy to production when ready

---

**Happy Resume Analyzing! 🎯**
