# DEPLOYMENT GUIDE

Complete guide to deploy the AI Resume Analyzer to production.

---

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Database Setup](#database-setup-optional)
4. [Production Security](#production-security)
5. [Monitoring & Logging](#monitoring--logging)
6. [Troubleshooting](#troubleshooting)

---

## Backend Deployment

### Option 1: Heroku (Easiest)

#### Prerequisites

- Heroku Account (free tier available)
- Heroku CLI installed

#### Steps

1. **Login to Heroku:**

```bash
heroku login
```

2. **Create Heroku App:**

```bash
cd backend
heroku create your-resume-analyzer-api
```

3. **Set Environment Variables:**

```bash
heroku config:set OPENAI_API_KEY=sk-your-key-here
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
heroku config:set NODE_ENV=production
```

4. **Deploy:**

```bash
git push heroku main
```

5. **View Logs:**

```bash
heroku logs --tail
```

6. **Your API URL:** `https://your-resume-analyzer-api.herokuapp.com`

---

### Option 2: AWS EC2

#### Prerequisites

- AWS Account
- EC2 instance (t2.micro for free tier)
- Ubuntu 20.04 or similar

#### Steps

1. **SSH into EC2:**

```bash
ssh -i key.pem ubuntu@your-ec2-ip
```

2. **Update System:**

```bash
sudo apt update
sudo apt upgrade -y
```

3. **Install Node.js:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm
```

4. **Install PM2 (Process Manager):**

```bash
sudo npm install -g pm2
```

5. **Clone Repository:**

```bash
git clone your-repo-url
cd AI-Resume-Analyzer/backend
npm install
```

6. **Create `.env`:**

```bash
nano .env
# Add your configuration
```

7. **Start with PM2:**

```bash
pm2 start server.js --name "resume-analyzer"
pm2 startup
pm2 save
```

8. **Setup Nginx Reverse Proxy:**

```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/resume-analyzer`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/resume-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Install SSL (Let's Encrypt):**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 3: DigitalOcean App Platform

#### Steps

1. **Push to GitHub:**

```bash
git push origin main
```

2. **In DigitalOcean Console:**
   - Click "Apps" → "Create App"
   - Select your GitHub repository
   - Choose "backend" directory
   - Set environment variables
   - Deploy

---

### Option 4: Docker + Any Cloud Provider

#### Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Build & Push

```bash
docker build -t resume-analyzer-backend .
docker run -e OPENAI_API_KEY=sk-... -p 5000:5000 resume-analyzer-backend
```

Deploy to:

- **Docker Hub** + AWS ECS
- **Google Cloud Run**
- **Azure Container Instances**

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Steps

1. **Push to GitHub:**

```bash
git push origin main
```

2. **Import Project:**
   - Go to vercel.com
   - Click "Import Project"
   - Select your GitHub repo

3. **Configure:**
   - Framework: React
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `build`

4. **Environment Variables:**

```
REACT_APP_API_URL=https://your-resume-analyzer-api.herokuapp.com
```

5. **Deploy!**

Your app will be live at: `your-app.vercel.app`

---

### Option 2: Netlify

#### Steps

1. **Connect GitHub:**
   - Go to netlify.com
   - Click "New site from Git"
   - Connect GitHub

2. **Configure Build:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Add Environment Variables:**

```
REACT_APP_API_URL=https://your-api-url.com
```

4. **Deploy!**

---

### Option 3: GitHub Pages

#### Build and Deploy

```bash
cd frontend

# Build production version
npm run build

# Deploy to gh-pages
npm install gh-pages --save-dev
npm run deploy
```

Add to `package.json`:

```json
"homepage": "https://yourusername.github.io/repo-name",
"scripts": {
  "deploy": "npm run build && gh-pages -d build"
}
```

---

### Option 4: AWS S3 + CloudFront

```bash
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://your-resume-analyzer

# Upload
aws s3 sync build/ s3://your-resume-analyzer/

# CloudFront distribution
# (Setup in AWS Console)
```

---

## Database Setup (Optional)

For storing user data and analysis history:

### MongoDB Atlas (Cloud)

1. **Create Account:** mongodb.com/cloud
2. **Create Cluster**
3. **Get Connection String**
4. **Add to `.env`:**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resume-analyzer
```

### Mongoose Integration

In `backend/server.js`:

```javascript
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));
```

---

## Production Security

### 1. Environment Variables

- **Never commit `.env` files**
- Use platform's environment variable manager
- Rotate API keys regularly

### 2. HTTPS/SSL

```env
# Production
CORS_ORIGIN=https://yourdomain.com
# NOT http://
```

### 3. Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);
```

### 4. File Upload Security

```javascript
// Already implemented in server.js
// - Only PDF files
// - 5MB size limit
// - Virus scan (optional)
```

### 5. CORS Configuration

```bash
CORS_ORIGIN=https://yourdomain.com
```

### 6. Helmet for Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require("helmet");
app.use(helmet());
```

### 7. Add to Production .env

```env
NODE_ENV=production
PORT=5000
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://your-frontend.com
```

---

## Monitoring & Logging

### 1. Server Health Checks

```bash
# Heroku
curl https://your-api.herokuapp.com/api/health

# AWS CloudWatch
aws cloudwatch put-metric-alarm ...
```

### 2. Error Reporting (Sentry)

```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

### 3. Logging

```bash
npm install winston
```

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

### 4. Analytics

- Google Analytics (Frontend)
- Mixpanel (Optional)
- Custom logging dashboard

---

## Performance Optimization

### 1. Frontend

```bash
# Optimize build
npm run build

# Image optimization
npm install next-image-optimization
```

### 2. Backend

```javascript
// Add compression middleware
const compression = require("compression");
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  res.set("Cache-Control", "public, max-age=3600");
  next();
});
```

### 3. Database Indexing

```javascript
// If using MongoDB
resumeSchema.index({ userId: 1, createdAt: -1 });
```

---

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Deploy Backend
        run: |
          git push heroku main
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}

      - name: Deploy Frontend
        run: |
          cd frontend && npm run build
          # Deploy to Vercel
```

---

## Troubleshooting Deployment

### Issue: Backend won't start

```bash
# Check logs
heroku logs --tail
# or
pm2 log

# Check environment variables
heroku config
```

### Issue: CORS errors

```bash
# Verify CORS_ORIGIN in .env
# Must match frontend domain exactly
```

### Issue: PDF Upload Failing

```bash
# Check file upload permissions
# Ensure uploads/ directory exists
mkdir uploads
chmod 755 uploads
```

### Issue: API Timeouts

```bash
# Increase timeout in frontend
axios.defaults.timeout = 120000; // 2 minutes
```

---

## Rollback Procedure

### Heroku

```bash
heroku releases
heroku rollback v5
```

### GitHub

```bash
git revert <commit-hash>
git push origin main
```

---

## Cost Estimation

| Service         | Tier          | Cost                  |
| --------------- | ------------- | --------------------- |
| Heroku Backend  | Free/Hobby    | $0-7/month            |
| Vercel Frontend | Free/Pro      | $0-20/month           |
| OpenAI API      | Pay-as-you-go | $0.002/request        |
| MongoDB Atlas   | Free/Paid     | $0+                   |
| **Total**       | **Minimum**   | **~$2-5/month + API** |

---

## Maintenance Checklist

- [ ] Monitor API costs weekly
- [ ] Check error logs daily
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review CORS settings
- [ ] Back up database (if using MongoDB)
- [ ] Test disaster recovery
- [ ] Update README with prod URLs

---

**Last Updated**: April 2024
**Status**: Production Ready
