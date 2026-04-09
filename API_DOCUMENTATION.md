# API DOCUMENTATION

## Base URL

```
http://localhost:5000
```

## Authentication

No authentication required (can be added in future versions)

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if the backend server is running

**Request:**

```bash
curl -X GET http://localhost:5000/api/health
```

**Response (200 OK):**

```json
{
  "status": "Server is running",
  "timestamp": "2024-04-09T12:35:45.123Z"
}
```

---

### 2. Analyze Resume (Main Endpoint)

**Endpoint:** `POST /api/analyze-resume`

**Description:** Upload a PDF resume and get AI-powered analysis

**Request Headers:**

```
Content-Type: multipart/form-data
```

**Request Body:**

```
Field name: resume
Type: File (PDF only)
Max size: 5MB
```

**Request Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/analyze-resume \
  -F "resume=@path/to/resume.pdf"
```

**Request Example (JavaScript/Fetch):**

```javascript
const formData = new FormData();
const fileInput = document.getElementById("file-input");
formData.append("resume", fileInput.files[0]);

const response = await fetch("http://localhost:5000/api/analyze-resume", {
  method: "POST",
  body: formData,
});

const data = await response.json();
```

**Request Example (Axios):**

```javascript
const formData = new FormData();
formData.append("resume", file);

const response = await axios.post(
  "http://localhost:5000/api/analyze-resume",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  },
);
```

**Response (200 OK):**

```json
{
  "success": true,
  "analysis": {
    "overallScore": 78,
    "candidateSummary": "Experienced full-stack developer with strong technical background...",
    "strengths": [
      "Strong technical skills with proven track record",
      "Good balance of frontend and backend expertise",
      "Clear career progression"
    ],
    "weaknesses": [
      "Limited mention of soft skills",
      "Could emphasize leadership experience more",
      "Missing quantifiable metrics on some projects"
    ],
    "missingSkills": [
      "Cloud platform experience (AWS)",
      "DevOps/CI-CD",
      "Containerization (Docker)"
    ],
    "missingSections": ["Certifications", "Portfolio link"],
    "suggestions": [
      "Add cloud platform experience to resume",
      "Include portfolio or GitHub link",
      "Quantify more achievements with metrics",
      "Highlight any leadership or mentoring experience",
      "Add relevant certifications"
    ],
    "overallFeedback": "Your resume demonstrates solid experience and is well-structured. To improve competitiveness, focus on quantifying achievements and adding external validation through certifications or portfolio."
  },
  "timestamp": "2024-04-09T12:35:45.123Z"
}
```

**Response (400 Bad Request) - No File:**

```json
{
  "error": "No file uploaded"
}
```

**Response (400 Bad Request) - Invalid File Type:**

```json
{
  "error": "Only PDF files are allowed"
}
```

**Response (400 Bad Request) - File Too Large:**

```json
{
  "error": "File size exceeds 5MB limit"
}
```

**Response (400 Bad Request) - Invalid Resume Text:**

```json
{
  "error": "Document does not appear to be a resume. Please upload a valid resume PDF."
}
```

**Response (500 Internal Server Error):**

```json
{
  "error": "Failed to analyze resume",
  "details": "Error message here"
}
```

---

## Response Fields Explained

### analysis Object

| Field              | Type   | Description                        |
| ------------------ | ------ | ---------------------------------- |
| `overallScore`     | number | Resume quality score (0-100)       |
| `candidateSummary` | string | Professional 2-3 sentence overview |
| `strengths`        | array  | Array of 3-4 key strengths         |
| `weaknesses`       | array  | Array of 3-4 areas for improvement |
| `missingSkills`    | array  | Array of missing technical skills  |
| `missingSections`  | array  | Array of missing resume sections   |
| `suggestions`      | array  | Array of 5+ actionable suggestions |
| `overallFeedback`  | string | Comprehensive paragraph feedback   |

---

## Error Codes & Handling

| Code | Error                                   | Meaning                              |
| ---- | --------------------------------------- | ------------------------------------ |
| 200  | None                                    | Success                              |
| 400  | No file uploaded                        | Missing resume file in request       |
| 400  | Only PDF files allowed                  | File is not in PDF format            |
| 400  | File size exceeds 5MB limit             | File is too large                    |
| 400  | Resume text is too short                | Resume has fewer than 100 characters |
| 400  | Document does not appear to be a resume | Missing resume keywords              |
| 400  | Failed to parse PDF                     | PDF extraction failed                |
| 500  | Failed to analyze resume                | AI analysis error                    |
| 500  | Internal server error                   | Unexpected server error              |

---

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended to add for production:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## File Upload Specifications

### Accepted File Types

- **Format**: PDF only
- **MIME Type**: `application/pdf`

### File Size Limits

- **Maximum**: 5 MB
- **Minimum**: Any (as long as contains 100+ characters)

### Resume Text Processing

- **Maximum processed**: 8000 characters (longer files are truncated)
- **Minimum content**: 100 characters
- **Encoding**: UTF-8

---

## API Response Time

Typical response times (from request to response):

| Operation                 | Time            |
| ------------------------- | --------------- |
| File receive & validation | 100-200ms       |
| PDF text extraction       | 200-500ms       |
| AI analysis (OpenAI API)  | 2-5 seconds     |
| **Total**                 | **3-6 seconds** |

---

## Cost per Request

Using OpenAI GPT-3.5-Turbo:

| Component                  | Cost        |
| -------------------------- | ----------- |
| Input tokens (resume text) | ~$0.0008    |
| Output tokens (analysis)   | ~$0.001     |
| **Total per analysis**     | **~$0.002** |

At 1000 analyses/month = ~$2/month

---

## CORS Configuration

**Default CORS Origin**: `http://localhost:3000`

To allow other origins, update `CORS_ORIGIN` in `.env`:

```env
# Single origin
CORS_ORIGIN=http://yourfrontend.com

# Multiple origins (requires middleware changes)
CORS_ORIGIN=http://localhost:3000,http://yourfrontend.com
```

---

## Implementation Examples

### Python

```python
import requests

url = "http://localhost:5000/api/analyze-resume"
files = {'resume': open('resume.pdf', 'rb')}

response = requests.post(url, files=files)
analysis = response.json()

print(f"Score: {analysis['analysis']['overallScore']}")
print(f"Summary: {analysis['analysis']['candidateSummary']}")
```

### cURL

```bash
curl -X POST http://localhost:5000/api/analyze-resume \
  -F "resume=@resume.pdf" \
  -H "Accept: application/json"
```

### C#

```csharp
using (var client = new HttpClient())
{
    using (var formData = new MultipartFormDataContent())
    {
        var fileStream = File.OpenRead("resume.pdf");
        formData.Add(new StreamContent(fileStream), "resume", "resume.pdf");

        var response = await client.PostAsync(
            "http://localhost:5000/api/analyze-resume",
            formData
        );

        var result = await response.Content.ReadAsAsync<dynamic>();
    }
}
```

### Go

```go
file, _ := os.Open("resume.pdf")
defer file.Close()

body := &bytes.Buffer{}
writer := multipart.NewWriter(body)
part, _ := writer.CreateFormFile("resume", "resume.pdf")
io.Copy(part, file)
writer.Close()

req, _ := http.NewRequest("POST", "http://localhost:5000/api/analyze-resume", body)
req.Header.Set("Content-Type", writer.FormDataContentType())

client := &http.Client{}
resp, _ := client.Do(req)
```

---

## Best Practices

1. **Always validate files on frontend** before uploading
2. **Set reasonable timeouts** (60+ seconds for AI processing)
3. **Handle errors gracefully** with appropriate user messages
4. **Log errors** for debugging
5. **Monitor API costs** if using OpenAI API
6. **Implement rate limiting** in production
7. **Use HTTPS** in production
8. **Add authentication** if exposing publicly
9. **Cache results** if analyzing same resumes multiple times
10. **Monitor uptime** and API health

---

## Webhooks (Future Enhancement)

Could add webhook support for async processing:

```json
POST /api/analyze-resume-async
{
  "resume": <file>,
  "webhook_url": "https://yourapp.com/webhook"
}
```

Response would then be sent to the webhook URL.

---

## API Versioning (Future)

Support multiple API versions:

- `/api/v1/analyze-resume`
- `/api/v2/analyze-resume`

---

## Testing the API

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/analyze-resume`
3. Body → form-data
4. Key: `resume`, Value: Select PDF file
5. Send

### Using curl

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test analysis endpoint
curl -F "resume=@resume.pdf" http://localhost:5000/api/analyze-resume
```

---

**Last Updated**: April 2024
**API Version**: 1.0
**Status**: Production Ready
