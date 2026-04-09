# Environment Setup Guide

## Quick Setup for Different Operating Systems

### Windows

#### 1. Install Node.js

- Download from https://nodejs.org/ (LTS version recommended)
- Run installer and follow prompts
- Verify installation:

```bash
node --version
npm --version
```

#### 2. Install Git (Optional)

- Download from https://git-scm.com/download/win

#### 3. Get OpenAI API Key

- Visit https://platform.openai.com/api-keys
- Sign up or login
- Create new API key
- Copy the key (you'll use it in .env)

#### 4. Clone Project

```bash
git clone <repository-url>
cd AI-Resume-Analyzer
```

Or download as ZIP and extract.

#### 5. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file in `backend/`:

```
PORT=5000
OPENAI_API_KEY=sk-your-key-here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

#### 6. Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

---

### macOS

#### 1. Install Node.js

Using Homebrew:

```bash
brew install node
```

Or download from https://nodejs.org/

Verify:

```bash
node --version
npm --version
```

#### 2. Get OpenAI API Key

- Visit https://platform.openai.com/api-keys
- Create new API key

#### 3. Clone Project

```bash
git clone <repository-url>
cd AI-Resume-Analyzer
```

#### 4. Setup Backend

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
OPENAI_API_KEY=sk-your-key-here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Start:

```bash
npm run dev
```

#### 5. Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

---

### Linux (Ubuntu/Debian)

#### 1. Install Node.js

```bash
sudo apt update
sudo apt install nodejs npm
```

Verify:

```bash
node --version
npm --version
```

#### 2. Get OpenAI API Key

- Visit https://platform.openai.com/api-keys

#### 3. Clone Project

```bash
git clone <repository-url>
cd AI-Resume-Analyzer
```

#### 4. Setup Backend

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
OPENAI_API_KEY=sk-your-key-here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Start:

```bash
npm run dev
```

#### 5. Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

---

## Environment Variables Explained

### Backend .env

```env
# Server configuration
PORT=5000                                    # Port where backend runs
NODE_ENV=development                         # development or production

# OpenAI configuration
OPENAI_API_KEY=sk-your-actual-key-here     # Your OpenAI API key

# CORS configuration
CORS_ORIGIN=http://localhost:3000           # Frontend URL for CORS
```

### Frontend .env.local (Optional)

```env
# Backend API URL (if different from default http://localhost:5000)
REACT_APP_API_URL=http://localhost:5000
```

---

## Getting an OpenAI API Key

### Step 1: Create Account

1. Go to https://platform.openai.com/signup
2. Sign up with email or use Google/Microsoft account
3. Verify your email

### Step 2: Add Payment Method

1. Go to https://platform.openai.com/account/billing/overview
2. Add a payment method
3. Set usage limits if desired (to avoid unexpected charges)

### Step 3: Create API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key immediately (you won't see it again)
4. Paste into `backend/.env`

### Step 4: Test Your Key

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-key-here"
```

You should get a list of models back.

---

## Verifying Your Setup

### Test Backend

```bash
cd backend
npm run dev
```

Should show:

```
🚀 Resume Analyzer Backend running on http://localhost:5000
Environment: development
```

Test in browser or curl:

```bash
curl http://localhost:5000/api/health
```

Should return:

```json
{ "status": "Server is running", "timestamp": "2024-04-09T..." }
```

### Test Frontend

```bash
cd frontend
npm start
```

Should open http://localhost:3000 in browser automatically with:

- Resume upload interface
- Drag-and-drop zone
- Requirements list

### Test Full Flow

1. Go to http://localhost:3000
2. Upload a sample resume PDF
3. Wait for analysis
4. Check backend logs for confirmation

---

## Common Setup Issues

### Issue: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:

- Change `PORT` in `.env` to different number (e.g., 5001)
- Or kill the process using port 5000:

Windows:

```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

macOS/Linux:

```bash
lsof -i :5000
kill -9 <PID>
```

### Issue: npm install Fails

**Solution**:

```bash
# Clear npm cache
npm cache clean --force
# Remove node_modules and package-lock
rm -rf node_modules package-lock.json
# Try install again
npm install
```

### Issue: OpenAI API Key Invalid

**Solution**:

- Verify key starts with `sk-`
- Check no extra spaces or quotes in `.env`
- Verify payment method is added to OpenAI account
- Create new key if uncertain

### Issue: CORS Error

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:

- Check `CORS_ORIGIN` in backend `.env` matches frontend URL
- Ensure backend is running when frontend loads

### Issue: PDF Upload Not Working

**Solution**:

- Ensure file is valid PDF
- File size under 5MB
- Verify backend is receiving the request (check backend logs)

---

## Updating Node Packages

If you encounter issues, try updating packages:

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

---

## Using Different API Providers

If you want to use Gemini or Claude instead:

### Google Gemini

Install:

```bash
npm install @google/generative-ai
```

In `.env`:

```env
GEMINI_API_KEY=your_gemini_key_here
```

### Claude (Anthropic)

Install:

```bash
npm install @anthropic-ai/sdk
```

In `.env`:

```env
CLAUDE_API_KEY=your_claude_key_here
```

Then modify `aiAnalyzer.js` to use the new provider.

---

## Production Deployment

### Using Heroku

Backend:

```bash
cd backend
heroku login
heroku create your-app-name
git push heroku main
heroku config:set OPENAI_API_KEY=sk-...
```

Frontend:

```bash
cd frontend
heroku create your-frontend-app-name
npm run build
git push heroku main
```

---

## System Requirements

- **Node.js**: v14.0 or higher
- **npm**: v6.0 or higher
- **RAM**: 512MB minimum
- **Disk**: 500MB for node_modules
- **Internet**: Required for OpenAI API calls

---

## Getting Help

1. **Check logs**: Look at backend console output for error details
2. **Verify setup**: Confirm all `.env` variables are set correctly
3. **Test separately**: Test backend API directly with curl
4. **Browser console**: Check browser DevTools for frontend errors
5. **Read documentation**: Review README.md and other docs

---

**Last Updated**: April 2024
**Node.js LTS Version**: 18.x or 20.x recommended
