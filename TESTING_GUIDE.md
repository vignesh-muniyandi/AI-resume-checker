# TESTING GUIDE

Complete testing guide for the AI Resume Analyzer application.

---

## Unit Testing

### Backend Unit Tests

Install testing framework:

```bash
npm install --save-dev jest supertest
```

Create `backend/src/validators.test.js`:

```javascript
const { validateUpload, isValidFile } = require("./validators");

describe("Validators", () => {
  describe("validateUpload", () => {
    test("should reject empty text", () => {
      const result = validateUpload("");
      expect(result).not.toBeNull();
    });

    test("should reject text without resume keywords", () => {
      const result = validateUpload(
        "This is just random text with no keywords",
      );
      expect(result).not.toBeNull();
    });

    test("should accept valid resume text", () => {
      const validResume =
        "EXPERIENCE: Senior Developer at Company. EDUCATION: BS Computer Science.";
      const result = validateUpload(validResume);
      expect(result).toBeNull();
    });
  });

  describe("isValidFile", () => {
    test("should accept valid PDF file", () => {
      const file = { mimetype: "application/pdf", size: 1000 };
      expect(isValidFile(file)).toBe(true);
    });

    test("should reject non-PDF file", () => {
      const file = { mimetype: "text/plain", size: 1000 };
      expect(isValidFile(file)).toBe(false);
    });

    test("should reject oversized file", () => {
      const file = { mimetype: "application/pdf", size: 6 * 1024 * 1024 };
      expect(isValidFile(file)).toBe(false);
    });
  });
});
```

Run tests:

```bash
npm test
```

---

## Integration Testing

### API Integration Tests

Create `backend/tests/api.test.js`:

```javascript
const request = require("supertest");
const app = require("../server");
const fs = require("fs");
const path = require("path");

describe("API Endpoints", () => {
  describe("GET /api/health", () => {
    test("should return server status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("Server is running");
    });
  });

  describe("POST /api/analyze-resume", () => {
    test("should return 400 when no file uploaded", async () => {
      const response = await request(app).post("/api/analyze-resume").send();

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should analyze valid PDF resume", async () => {
      const testFile = path.join(__dirname, "../sample-resume.pdf");

      // Create sample PDF for testing
      const response = await request(app)
        .post("/api/analyze-resume")
        .attach("resume", testFile);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("analysis");
      expect(response.body.analysis).toHaveProperty("overallScore");
      expect(response.body.analysis).toHaveProperty("strengths");
      expect(response.body.analysis).toHaveProperty("weaknesses");
    });
  });
});
```

Run integration tests:

```bash
npm test -- --testPathPattern=api.test
```

---

## Frontend Testing

### Component Tests

Install testing dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Create `frontend/src/components/ResumeUpload.test.js`:

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResumeUpload from "./ResumeUpload";

describe("ResumeUpload Component", () => {
  test("renders upload component", () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();

    render(
      <ResumeUpload
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        isLoading={false}
        setIsLoading={jest.fn()}
        error={null}
      />,
    );

    expect(screen.getByText(/Upload Your Resume/i)).toBeInTheDocument();
  });

  test("shows error message when file is invalid", () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();

    render(
      <ResumeUpload
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        isLoading={false}
        setIsLoading={jest.fn()}
        error="Please upload a PDF file"
      />,
    );

    expect(screen.getByText(/Please upload a PDF file/)).toBeInTheDocument();
  });

  test("disables upload button when loading", () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();

    render(
      <ResumeUpload
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        isLoading={true}
        setIsLoading={jest.fn()}
        error={null}
      />,
    );

    const button = screen.getByRole("button", { name: /Uploading.../i });
    expect(button).toBeDisabled();
  });
});
```

### Results Component Tests

Create `frontend/src/components/AnalysisResults.test.js`:

```javascript
import React from "react";
import { render, screen } from "@testing-library/react";
import AnalysisResults from "./AnalysisResults";

describe("AnalysisResults Component", () => {
  const mockAnalysis = {
    overallScore: 78,
    candidateSummary: "Test summary",
    strengths: ["Strength 1", "Strength 2"],
    weaknesses: ["Weakness 1", "Weakness 2"],
    missingSkills: ["Skill 1"],
    missingSections: [],
    suggestions: ["Suggestion 1"],
    overallFeedback: "Overall feedback",
  };

  test("renders analysis results", () => {
    render(<AnalysisResults data={mockAnalysis} onReset={jest.fn()} />);

    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText(/Test summary/)).toBeInTheDocument();
  });

  test("displays strengths", () => {
    render(<AnalysisResults data={mockAnalysis} onReset={jest.fn()} />);

    expect(screen.getByText(/Strength 1/)).toBeInTheDocument();
    expect(screen.getByText(/Strength 2/)).toBeInTheDocument();
  });

  test("displays score interpretation", () => {
    render(<AnalysisResults data={mockAnalysis} onReset={jest.fn()} />);

    expect(screen.getByText(/Very Good/)).toBeInTheDocument();
  });
});
```

Run frontend tests:

```bash
npm test
```

---

## End-to-End Testing

### Cypress Tests

Install Cypress:

```bash
npm install --save-dev cypress
npx cypress open
```

Create `cypress/e2e/resume-upload.cy.js`:

```javascript
describe("Resume Upload E2E Test", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("should upload and analyze resume", () => {
    // Find file input and upload
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/sample-resume.pdf",
    );

    // Wait for analysis
    cy.get(".loading-state", { timeout: 10000 }).should("be.visible");
    cy.get(".loading-state", { timeout: 30000 }).should("not.exist");

    // Check results
    cy.get(".score-value").should("contain", /\d+/);
    cy.get(".summary-text").should("be.visible");
    cy.get(".strengths-list li").should("have.length.greaterThan", 0);
  });

  it("should show error for invalid file", () => {
    cy.get('input[type="file"]').selectFile("cypress/fixtures/document.txt");

    cy.get(".error-message").should("contain", "Please upload a PDF file");
  });

  it("should reset and allow new upload", () => {
    // First upload
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/sample-resume.pdf",
    );
    cy.get(".score-value", { timeout: 30000 }).should("be.visible");

    // Click reset
    cy.get("button").contains("Analyze Another Resume").click();

    // Should be back at upload screen
    cy.get('input[type="file"]').should("be.visible");
  });
});
```

Run Cypress:

```bash
npx cypress run
```

---

## Manual Testing Checklist

### Upload Functionality

- [ ] Upload valid PDF resume
- [ ] Upload oversized file (>5MB) - should show error
- [ ] Upload non-PDF file - should show error
- [ ] Drag and drop PDF - should accept
- [ ] Cancel upload mid-process
- [ ] Network disconnected during upload

### Analysis Results

- [ ] Score displays correctly (0-100)
- [ ] All sections display (summary, strengths, weaknesses, etc.)
- [ ] Strengths have correct icons
- [ ] Weaknesses have correct icons
- [ ] Skills display as tags
- [ ] Suggestions list is numbered
- [ ] Overall feedback displays

### UI/UX Testing

- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Loading spinner shows during analysis
- [ ] Error messages are clear
- [ ] Success state displays properly
- [ ] Buttons are clickable and responsive

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### API Testing

- [ ] Health endpoint responds
- [ ] Resume upload endpoint works
- [ ] Error responses are formatted correctly
- [ ] CORS headers present
- [ ] Timeout handling works
- [ ] Large file handling

### Error Scenarios

- [ ] Backend server offline
- [ ] Invalid API key
- [ ] Network timeout
- [ ] Corrupted PDF file
- [ ] Empty PDF file
- [ ] PDF with no extractable text

---

## Performance Testing

### Load Testing with Apache JMeter

1. Create test plan for API endpoint
2. Set concurrent users to 100
3. Make 1000 requests
4. Verify response times

Target metrics:

- **Average response time**: < 10 seconds
- **95th percentile**: < 15 seconds
- **Error rate**: < 1%

### Frontend Performance

Use Lighthouse:

```bash
# Chrome DevTools → Lighthouse
# Or CLI
npm install -g lighthouse
lighthouse http://localhost:3000
```

Target scores:

- **Performance**: > 80
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

---

## Security Testing

### OWASP Top 10 Checks

- [ ] Injection attacks (SQL, Command)
- [ ] Authentication bypass
- [ ] Sensitive data exposure
- [ ] XML external entities (XXE)
- [ ] Broken access control
- [ ] Security misconfiguration
- [ ] XSS vulnerabilities
- [ ] Insecure deserialization
- [ ] Using components with known vulnerabilities
- [ ] Insufficient logging & monitoring

### Dependency Scanning

```bash
npm audit
npm audit fix
```

### Security Headers

- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security

---

## Test Coverage

Generate coverage report:

```bash
npm test -- --coverage
```

Target coverage:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## Continuous Integration

### GitHub Actions Testing

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: 18

      - name: Backend Tests
        run: |
          cd backend
          npm install
          npm test

      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm test -- --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

---

## Test Data

### Sample Resume for Testing

`sample-resume.pdf` should contain:

- Valid professional formatting
- Multiple sections (summary, experience, education)
- Clear text extraction
- 500-2000 words

### Test Cases

| Test Case      | Input                | Expected Output                |
| -------------- | -------------------- | ------------------------------ |
| Valid resume   | sample-resume.pdf    | Score 60-80, all fields filled |
| Weak resume    | minimal-resume.pdf   | Score 30-50                    |
| Strong resume  | strong-resume.pdf    | Score 80+                      |
| Invalid format | document.docx        | Error message                  |
| Oversized      | huge-file.pdf (>5MB) | File size error                |

---

## Debugging Tips

### Backend

```javascript
// Add console.log statements
console.log('Processing file:', req.file);

// Use debugger
node --inspect server.js
// Open chrome://inspect

// Check Node logs
node server.js 2>&1 | tee debug.log
```

### Frontend

```javascript
// React DevTools
// Check props and state

// Network tab
// Verify API calls

// Console
console.log("Analysis data:", analysisData);
```

---

## CI/CD Testing

- Run tests on every push
- Block merge if tests fail
- Generate coverage reports
- Deploy only if tests pass

---

**Last Updated**: April 2024
**Recommended Coverage**: 80%+
**Status**: Testing Suite Ready
