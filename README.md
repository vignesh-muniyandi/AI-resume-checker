# 🤖 AI Resume Analyzer - MERN Stack Application

A full-stack web application that uses AI to provide intelligent feedback and analysis on resumes. Users upload a PDF resume and receive structured, actionable insights for improvement.

## 🎯 Features

- **Resume Upload**: Simple drag-and-drop PDF upload interface
- **PDF Text Extraction**: Automatic parsing of resume content
- **AI Analysis**: GPT-powered intelligent resume analysis
- **Structured Feedback**: Organized results displaying:
  - Overall resume score (0-100)
  - Candidate summary
  - Key strengths
  - Areas for improvement
  - Missing skills and sections
  - Actionable suggestions
- **Responsive UI**: Clean, modern interface that works on all devices
- **Error Handling**: Comprehensive file validation and error messaging

## 📋 Project Structure

```
AI-Resume-Analyzer/
├── backend/                    # Node.js Express server
│   ├── src/
│   │   ├── pdfParser.js       # PDF text extraction logic
│   │   ├── aiAnalyzer.js      # AI integration with OpenAI
│   │   └── validators.js      # File and data validation
│   ├── uploads/               # Temporary file storage
│   ├── server.js              # Main Express server
│   ├── package.json
│   ├── .env.example           # Environment variables template
│   └── .gitignore
│
├── frontend/                   # React.js client application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeUpload.js      # File upload component
│   │   │   ├── ResumeUpload.css
│   │   │   ├── AnalysisResults.js   # Results display component
│   │   │   └── AnalysisResults.css
│   │   ├── App.js             # Main app component
│   │   ├── App.css
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── .gitignore
│   └── .env.local (optional)
│
└── README.md                   # This file
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v14+ and npm (or yarn)
- **OpenAI API Key** (or alternative AI provider)
- **Git** (optional)

### Step 1: Clone or Download the Project

```bash
git clone <repository-url>
cd AI-Resume-Analyzer
```

### Step 2: Setup Backend

#### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

#### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
PORT=5000
OPENAI_API_KEY=sk-your-api-key-here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Getting an OpenAI API Key:**

1. Visit https://platform.openai.com/api-keys
2. Sign up or log in to your account
3. Create a new API key
4. Copy and paste it into your `.env` file

#### 2.3 Start Backend Server

```bash
npm run dev
```

Or for production:

```bash
npm start
```

You should see: `🚀 Resume Analyzer Backend running on http://localhost:5000`

### Step 3: Setup Frontend

#### 3.1 Install Frontend Dependencies

In a new terminal window:

```bash
cd frontend
npm install
```

#### 3.2 (Optional) Configure Frontend Environment

Create `.env.local` if you need to use a different API URL:

```env
REACT_APP_API_URL=http://localhost:5000
```

#### 3.3 Start Frontend Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🏗️ Architecture

### Backend Architecture

```
Request Flow:
1. User uploads PDF → ResumeUpload.js (Frontend)
2. POST to /api/analyze-resume (Backend)
3. Multer middleware handles file storage
4. pdfParser.js extracts text from PDF
5. validators.js validates extracted text
6. aiAnalyzer.js sends text to OpenAI
7. aiAnalyzer.js parses JSON response
8. Response sent back to frontend
9. File cleaned up from server
```

### Frontend Architecture

```
App.js (Main State Management)
├── ResumeUpload.js (Upload View)
│   ├── File input handling
│   ├── Drag-and-drop support
│   ├── API communication
│   └── Loading/error states
└── AnalysisResults.js (Results View)
    ├── Score display
    ├── Strengths/weaknesses rendering
    ├── Skills tags
    └── Suggestions list
```

## 🤖 AI Integration Details

### AI Model Used

**Primary**: OpenAI GPT-3.5 Turbo

- Cost-effective and fast
- Good for structured output
- Supports JSON mode

### Prompt Engineering

The system prompt guides the AI to:

- Analyze resumes like an HR manager
- Return structured JSON output
- Provide constructive feedback
- Score out of 100
- Identify specific strengths and weaknesses

**System Prompt (Used in `aiAnalyzer.js`):**

```
You are an expert HR manager and career coach specializing in resume analysis.
Your task is to analyze a provided resume and give comprehensive, actionable feedback.

IMPORTANT: You MUST respond with a valid JSON object. Do not include any text before or after the JSON.

Analyze the resume and return a JSON object with...
[See src/aiAnalyzer.js for complete prompt]
```

### Alternative AI Providers

You can modify `aiAnalyzer.js` to use:

**Google Gemini:**

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

**Claude (Anthropic):**

```javascript
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic();
```

## 📊 Example API Response

### Request

```bash
POST /api/analyze-resume
Content-Type: multipart/form-data

{
  "resume": <PDF file>
}
```

### Response (Success)

```json
{
  "success": true,
  "analysis": {
    "overallScore": 78,
    "candidateSummary": "Experienced software engineer with 5+ years in full-stack development. Strong expertise in React and Node.js with proven track record of delivering scalable applications.",
    "strengths": [
      "Comprehensive technical skills with clear progression",
      "Well-organized with relevant certifications",
      "Good balance of hard and soft skills"
    ],
    "weaknesses": [
      "Limited mention of specific impact metrics or achievements",
      "Could emphasize leadership experience more",
      "Missing quantifiable results/ROI on projects"
    ],
    "missingSkills": [
      "Cloud platforms (AWS, Azure, GCP)",
      "DevOps/CI-CD experience",
      "Agile methodologies"
    ],
    "missingSections": [
      "Professional certifications",
      "Open-source contributions/projects"
    ],
    "suggestions": [
      "Add specific metrics and numbers to quantify your achievements",
      "Include relevant technical certifications",
      "Highlight leadership or mentoring experiences",
      "Mention cloud platform experience or DevOps skills",
      "Add links to portfolio or GitHub repositories"
    ],
    "overallFeedback": "Your resume demonstrates solid technical experience and is well-structured. To improve your competitiveness, focus on quantifying your achievements with metrics and numbers. Consider adding more information about leadership experience and certifications."
  },
  "timestamp": "2024-04-09T12:30:45.123Z"
}
```

### Response (Error)

```json
{
  "error": "Only PDF files are allowed",
  "details": "File type validation failed"
}
```

## 💾 JSON Output Structure

The AI analysis returns the following JSON structure:

```typescript
{
  overallScore: number (0-100),           // Resume quality score
  candidateSummary: string,               // 2-3 sentence professional summary
  strengths: string[],                    // Array of key strengths
  weaknesses: string[],                   // Areas needing improvement
  missingSkills: string[],                // Technologies/skills often sought
  missingSections: string[],              // Missing resume sections
  suggestions: string[],                  // 5+ actionable suggestions
  overallFeedback: string                 // Comprehensive feedback paragraph
}
```

## 🔧 API Endpoints

### Health Check

```
GET /api/health
Response: { status: "Server is running", timestamp: "2024-04-09T..." }
```

### Resume Analysis

```
POST /api/analyze-resume
- Content-Type: multipart/form-data
- Body: { resume: <PDF file> }
- Max file size: 5MB
- Returns: { success: true, analysis: {...}, timestamp: "..." }
```

## ⚙️ Configuration

### Backend Environment Variables

| Variable         | Required | Description                                            |
| ---------------- | -------- | ------------------------------------------------------ |
| `PORT`           | No       | Server port (default: 5000)                            |
| `OPENAI_API_KEY` | Yes      | OpenAI API key for AI analysis                         |
| `CORS_ORIGIN`    | No       | Frontend URL for CORS (default: http://localhost:3000) |
| `NODE_ENV`       | No       | Environment (development/production)                   |

### File Upload Limits

- **Max file size**: 5MB
- **Allowed formats**: PDF only
- **Min text length**: 100 characters
- **Max text processed**: 8000 characters

## 🐛 Troubleshooting

### Backend won't start

- Check Node.js version: `node --version`
- Verify dependencies: `npm install` in backend directory
- Check if port 5000 is available: `netstat -ano | findstr :5000` (Windows)

### Frontend won't connect to backend

- Ensure backend is running on port 5000
- Check CORS_ORIGIN in backend `.env`
- Verify frontend can access `http://localhost:5000`

### PDF parsing fails

- Ensure file is a valid PDF
- Try with a smaller resume file
- Check file permissions

### AI analysis errors

- Verify OpenAI API key is correct
- Check API key hasn't exceeded usage limits
- Verify internet connection

### "No JSON object found in response"

- Resume text might be too complex
- Try with a simpler resume
- Increase max_tokens in aiAnalyzer.js

## 📈 Performance Considerations

1. **File Upload**: Limited to 5MB for reasonable processing time
2. **PDF Parsing**: Average time: 200-500ms
3. **AI Analysis**: Average time: 2-5 seconds (depends on API response)
4. **Total Process**: ~3-6 seconds including network

## 🔒 Security & Data Privacy

- Uploaded files are **temporarily stored** and **deleted after analysis**
- No personal data is persisted in the database
- API keys are stored in `.env` (never committed to git)
- CORS is configured to only accept requests from authorized origins

## 🚫 Limitations

1. **Language**: Currently optimized for English resumes
2. **PDF Format**: Works best with standard PDF resumes; may struggle with complex layouts
3. **Token Limits**: Resumes over 8000 characters are truncated
4. **AI Consistency**: Analysis can vary slightly based on AI model randomness
5. **No Database**: Results are not persisted (can be added)
6. **Cost**: Each analysis costs ~$0.01-0.05 depending on resume length

## 🎯 Future Improvements

- [ ] **Database Integration**: Store analysis history for users
- [ ] **Multi-language Support**: Support resumes in multiple languages
- [ ] **Comparison Mode**: Compare multiple resume versions
- [ ] **Industry-specific Analysis**: Tailored feedback per industry
- [ ] **Batch Processing**: Analyze multiple resumes at once
- [ ] **User Accounts**: Save and access past analyses
- [ ] **Export Options**: Download analysis as PDF or Word
- [ ] **Real-time Feedback**: Get feedback as user types
- [ ] **Skill Recommendations**: Suggest courses for missing skills
- [ ] **ATS Optimization**: Check ATS compatibility and score
- [ ] **Template Library**: Suggest resume templates
- [ ] **Webhook Integration**: Send results to email/Slack

## 📦 Deployment

### Deploy Backend (Heroku example)

```bash
cd backend
heroku login
heroku create your-app-name
git push heroku main
heroku config:set OPENAI_API_KEY=sk-your-key
```

### Deploy Frontend (Vercel example)

```bash
cd frontend
vercel
```

## 📄 License

MIT License - Feel free to use and modify for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests or open issues.

## 📧 Support

For issues or questions:

1. Check the Troubleshooting section
2. Review error messages carefully
3. Check backend console for detailed errors
4. Open an issue on GitHub

## 🙏 Acknowledgments

- **OpenAI**: For GPT API and excellent LLM capabilities
- **Express.js**: Web framework
- **React**: UI library
- **Multer**: File upload handling
- **pdfparse**: PDF text extraction

---

**Created**: 2024
**Version**: 1.0.0
**Last Updated**: April 2024
