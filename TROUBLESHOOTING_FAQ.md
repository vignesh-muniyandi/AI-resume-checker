# TROUBLESHOOTING & FAQ

## Common Issues & Solutions

---

## Backend Issues

### 1. "Port already in use" Error

**Error:**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

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

Or change PORT in `.env`:

```env
PORT=5001
```

---

### 2. "npm install" Fails

**Error:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependency peer
```

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Install again
npm install

# Or force resolution
npm install --legacy-peer-deps
```

---

### 3. "Cannot find module" Error

**Error:**

```
Cannot find module 'express'
Error: Cannot find module '@google/generative-ai'
```

**Solutions:**

```bash
# Install missing dependencies
npm install express
npm install openai

# Or reinstall all
npm install

# Check what's installed
npm list
```

---

### 4. OpenAI API Key Invalid

**Error:**

```
401 Unauthorized
Invalid API Key provided
```

**Solutions:**

1. Verify key format:
   - Must start with `sk-`
   - Should be 48+ characters

2. Check `.env` file:

   ```env
   # Correct format
   OPENAI_API_KEY=sk-your-actual-key-here

   # Wrong - has spaces
   OPENAI_API_KEY = sk-your-key

   # Wrong - has quotes
   OPENAI_API_KEY="sk-your-key"
   ```

3. Verify key is active:
   - Visit https://platform.openai.com/api-keys
   - Check key exists
   - Verify payment method added to account

4. Rotate key:
   ```bash
   # Create new key
   # Update .env
   # Restart server
   npm run dev
   ```

---

### 5. PDF Parse Error

**Error:**

```
Failed to parse PDF: PDF parsing failed
```

**Solutions:**

- Test with different PDF:

  ```bash
  # Try with a simpler, smaller PDF
  ```

- Check file is valid:

  ```bash
  file resume.pdf
  # Should show: PDF document
  ```

- Try with text-based PDF:
  - Scanned images don't work well
  - Use OCR first if needed

---

### 6. "CORS Error" - Requests Blocked

**Error:**

```
Access to XMLHttpRequest at 'http://localhost:5000/...'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**

1. Check CORS_ORIGIN in `.env`:

   ```env
   CORS_ORIGIN=http://localhost:3000
   # Not: http://127.0.0.1:3000
   # Not: localhost:3000 (missing http://)
   ```

2. Restart backend after changing:

   ```bash
   npm run dev
   ```

3. Clear browser cache:
   - Ctrl+Shift+Delete (Chrome, Firefox)
   - Cmd+Shift+Delete (macOS)

---

### 7. Out of Memory Error

**Error:**

```
JavaScript heap out of memory
FATAL ERROR: CALL_AND_RETRY_LAST
```

**Solutions:**

```bash
# Increase Node memory limit
node --max-old-space-size=2048 server.js

# Or in package.json scripts
"scripts": {
  "start": "node --max-old-space-size=2048 server.js"
}

# Or set environment variable
export NODE_OPTIONS="--max-old-space-size=2048"
node server.js
```

---

### 8. Timeout Error

**Error:**

```
Error: ETIMEDOUT - Connection timeout
```

**Solutions:**

1. Check internet connection
2. Verify OpenAI API status:
   - Visit https://status.openai.com/

3. Increase timeout in frontend:

   ```javascript
   const response = await axios.post(
     url,
     formData,
     { timeout: 120000 }, // 2 minutes
   );
   ```

4. Check backend logs:
   ```bash
   npm run dev  # See all logs
   ```

---

## Frontend Issues

### 1. "Cannot GET /"

**Error:**

```
Cannot GET /
404 Not Found
```

**Solution:**

Frontend not started. Run in separate terminal:

```bash
cd frontend
npm start
```

---

### 2. "Blank White Page"

**Error:** Page loads but shows nothing

**Solutions:**

1. Check browser console for errors:
   - F12 → Console tab
   - Look for red error messages

2. Verify React is loading:

   ```javascript
   // In browser console
   typeof React; // Should be 'object', not 'undefined'
   ```

3. Check if node_modules installed:

   ```bash
   cd frontend
   npm install
   npm start
   ```

4. Clear cache:
   ```bash
   # Delete .cache folder
   # Delete node_modules
   npm install
   npm start
   ```

---

### 3. File Upload Not Working

**Error:** Upload button does nothing

**Solutions:**

1. Check file input element:

   ```javascript
   // Browser console
   document.getElementById("file-input");
   ```

2. Verify backend is running:
   - Check http://localhost:5000/api/health

3. Check network tab (F12 → Network):
   - Upload request should appear
   - Status should show response code

4. Increase timeout (if upload hangs):
   ```javascript
   axios.defaults.timeout = 120000;
   ```

---

### 4. "API is not responding"

**Error:** Upload seems stuck

**Solutions:**

1. Verify backend is running:

   ```bash
   curl http://localhost:5000/api/health
   ```

2. Check firewall isn't blocking port 5000

3. Check backend logs for errors

4. Restart both servers:
   ```bash
   # Kill both processes
   # Restart backend: npm run dev
   # Restart frontend: npm start
   ```

---

### 5. Styles Not Loading (CSS Issues)

**Error:** Page looks ugly, no styling

**Solutions:**

1. Check CSS files exist:
   - `src/index.css`
   - `src/App.css`
   - `src/components/*.css`

2. Check CSS imports in JS:

   ```javascript
   import "./App.css"; // Must match filename exactly
   ```

3. No circular imports:
   - CSS shouldn't import JS

4. Rebuild:
   ```bash
   npm run build
   npm start
   ```

---

### 6. State Not Updating

**Error:** Results don't show after upload

**Solutions:**

1. Check React DevTools:
   - F12 → Components tab
   - Verify state is updating

2. Check for console errors:
   - Look for unhandled promise rejections

3. Verify response from API:
   - Network tab → Analyze Resume → Response
   - Check JSON structure

4. Add debugging:
   ```javascript
   console.log("Analysis data:", analysisData);
   console.log("Analysis:", analysis);
   ```

---

## Full Stack Issues

### 1. Entire App Won't Start

**Steps to Fix:**

```bash
# 1. Kill all processes
# Windows: Ctrl+C in terminals, or taskkill

# 2. Clean everything
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/package-lock.json frontend/package-lock.json

# 3. Reinstall
cd backend && npm install
cd ../frontend && npm install

# 4. Check .env exists
cd backend
ls -la .env  # Should exist

# 5. Start fresh
cd backend && npm run dev
# In new terminal:
cd frontend && npm start
```

---

### 2. Results Show But Incomplete

**Solutions:**

1. Check AI response format:
   - Backend logs should show response
   - Verify JSON is being parsed correctly

2. Check each field:
   - Open DevTools
   - Inspect HTML
   - Verify data is there

3. Add validation:
   ```javascript
   if (!data.analysis || !data.analysis.strengths) {
     console.error("Invalid response:", data);
   }
   ```

---

### 3. Can't Create `.env` Files

**Windows:**

```bash
# Use PowerShell
New-Item backend\.env
# Or VS Code: Ctrl+N → Save as backend\.env

# Or use copy
copy backend\\.env.example backend\\.env
```

**macOS/Linux:**

```bash
# Simple command
touch backend/.env

# Or copy template
cp backend/.env.example backend/.env
```

---

## Performance Issues

### App is Slow

**Solutions:**

1. **Backend slow:**
   - Check if OpenAI API is slow
   - Monitor network requests
   - Check server logs for errors

2. **Frontend slow:**
   - Check React DevTools → Profiler
   - Look for unnecessary re-renders
   - Verify no console errors

3. **Network slow:**
   - Check DevTools → Network tab
   - Look for slow requests
   - Verify file sizes

### Analysis Takes Too Long (>10 seconds)

**Reasons:**

- OpenAI API latency
- Large resume text
- Network issues
- Server overload

**Solutions:**

- This is normal (3-6 sec average)
- Verify API key has quota
- Check API status: https://status.openai.com/

---

## Database Issues (If Using MongoDB)

### Can't Connect to Database

**Solutions:**

```bash
# 1. Check connection string
echo $MONGODB_URI  # Should show valid URI

# 2. Verify database is running
# For local MongoDB:
mongod --version  # Check if installed

# 3. For MongoDB Atlas:
# - Verify IP whitelist
# - Check username/password
# - Verify database exists

# 4. Test connection
# Node console:
const mongoose = require('mongoose');
await mongoose.connect(process.env.MONGODB_URI);
```

---

## Security Issues

### API Key Leaked

**If your OpenAI key was exposed:**

1. **Immediately:**

   ```bash
   # Go to https://platform.openai.com/api-keys
   # Delete the compromised key
   ```

2. **Create new key** and update `.env`

3. **Rotate immediately** - they may already bill you

### HTTPS not Working in Production

**Solutions:**

1. Install Let's Encrypt:

   ```bash
   certbot --nginx -d yourdomain.com
   ```

2. Update CORS_ORIGIN:
   ```env
   CORS_ORIGIN=https://yourdomain.com
   # NOT http://
   ```

---

## Getting Help

### 1. Check the Logs

```bash
# Backend
npm run dev  # See all output

# Frontend
npm start    # See console output in browser DevTools
```

### 2. Use Browser DevTools

- F12 → Console (errors)
- F12 → Network (API calls)
- F12 → Application (storage)

### 3. Read Error Messages Carefully

- Often tell you exactly what's wrong
- Google the error message
- Check Stack Overflow

### 4. Isolate the Problem

- Is it frontend or backend?
- Is it the upload or analysis?
- Is it a network issue?

### 5. Test Each Part Separately

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test frontend loads
# Just open http://localhost:3000

# Test upload manually
curl -F "resume=@test.pdf" http://localhost:5000/api/analyze-resume
```

---

## FAQ

### Q: How do I get a free OpenAI API key?

**A:** You can't. You need:

1. OpenAI account (free to create)
2. Payment method added (credit card)
3. At least $5 initial charge
4. BUT: Each analysis costs only ~$0.002

### Q: Will my resumes be saved?

**A:** No. Files are:

- Uploaded to server
- Analyzed
- Deleted immediately
- Never stored in database

### Q: Can I use other AI providers?

**A:** Yes! The code is structured to support:

- Google Gemini
- Claude (Anthropic)
- Other LLM APIs
- Just modify `aiAnalyzer.js`

### Q: What resume formats are supported?

**A:** Currently only **PDF**. Future versions could add:

- DOCX (Word)
- DOC
- TXT
- Image scans (with OCR)

### Q: Can I run this locally?

**A:** Yes! That's the main use case:

1. Clone repo
2. npm install
3. Add .env
4. npm run dev (backend)
5. npm start (frontend)

### Q: Can I deploy this?

**A:** Absolutely! See DEPLOYMENT_GUIDE.md for:

- Heroku
- AWS
- DigitalOcean
- Vercel
- Docker

### Q: How many resumes can I analyze?

**A:** Unlimited (depends on API quota and cost)

- Each analysis: ~$0.002
- 1000 analyses: ~$2
- Set limits in OpenAI account settings

### Q: Can multiple users use it?

**A:** Currently, no user accounts. You can add:

- Firebase Auth
- Auth0
- Custom authentication
- Database to store results

### Q: Is this secure?

**A:** For local use: Yes
For production: Add:

- HTTPS/SSL
- Rate limiting
- CORS restrictions
- API authentication
- Virus scanning

### Q: Can I customize the AI feedback?

**A:** Yes! Edit the system prompt in `aiAnalyzer.js`:

- Change tone
- Add industry focus
- Adjust scoring criteria
- Change output fields

### Q: Why is my score different each time?

**A:** AI uses randomness (temperature=0.7):

- Ensures varied output
- Scores might vary ±5 points
- Feedback stays consistent
- Lower temperature = more consistent

---

**Last Updated**: April 2024
**Version**: 1.0
**Status**: FAQ Complete
