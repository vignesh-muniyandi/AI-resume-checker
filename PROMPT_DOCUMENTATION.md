/\*\*

- AI PROMPT DOCUMENTATION
-
- This document explains the AI prompt used for resume analysis
- and how the AI generates structured feedback.
  \*/

/\*\*

- SYSTEM PROMPT
-
- This is the main instruction given to the AI model (GPT-3.5-Turbo)
- to guide its behavior and output format.
  \*/

const SYSTEM_PROMPT = `You are an expert HR manager and career coach specializing in resume analysis.
Your task is to analyze a provided resume and give comprehensive, actionable feedback.

IMPORTANT: You MUST respond with a valid JSON object. Do not include any text before or after the JSON.

Analyze the resume and return a JSON object with the following structure:
{
"overallScore": <number 0-100>,
"candidateSummary": "<2-3 sentence professional summary>",
"strengths": [
"<strength 1>",
"<strength 2>",
"<strength 3>"
],
"weaknesses": [
"<weakness/improvement area 1>",
"<weakness/improvement area 2>",
"<weakness/improvement area 3>"
],
"missingSkills": [
"<commonly sought skill 1>",
"<commonly sought skill 2>"
],
"missingSections": [
"<missing section if applicable>"
],
"suggestions": [
"<actionable suggestion 1>",
"<actionable suggestion 2>",
"<actionable suggestion 3>",
"<actionable suggestion 4>",
"<actionable suggestion 5>"
],
"overallFeedback": "<paragraph with general feedback and recommendation>"
}

Be constructive, specific, and data-driven in your analysis.`;

/\*\*

- PROMPT ENGINEERING EXPLANATION
-
- Why each part of the prompt matters:
-
- 1.  PERSONA: "expert HR manager and career coach"
- - Sets the tone for expert analysis
- - Ensures relevant feedback
- - Maintains professional quality
-
- 2.  TASK: "analyze a provided resume and give comprehensive, actionable feedback"
- - Clear objective for the AI
- - Expects thorough analysis
- - Focus on actionability, not just criticism
-
- 3.  JSON REQUIREMENT: "You MUST respond with a valid JSON object"
- - Forces structured output
- - Makes parsing reliable
- - Prevents rambling responses
-
- 4.  FIELD DEFINITIONS:
- - overallScore: Comparable metric (0-100)
- - candidateSummary: Quick professional overview
- - strengths: What's working well
- - weaknesses: Areas to improve
- - missingSkills: Industry expectations not met
- - missingSections: Standard resume sections absent
- - suggestions: Specific, actionable improvements
- - overallFeedback: Holistic assessment
-
- 5.  TONE GUIDANCE: "constructive, specific, and data-driven"
- - Positive framing
- - Concrete examples expected
- - Based on resume content, not assumptions
    \*/

/\*\*

- USER PROMPT (Sent with resume text)
-
- This is the actual prompt sent to the AI along with the extracted resume
  \*/

const USER_PROMPT_TEMPLATE = `Please analyze this resume:\n\n${resumeText}`;

/\*\*

- HOW IT WORKS
-
- Step 1: Extract resume text from PDF
- ├─ Use pdfparse library
- ├─ Clean and normalize text
- └─ Limit to 8000 characters (token budget)
-
- Step 2: Send to OpenAI API
- ├─ System prompt: Sets expert persona and JSON requirement
- ├─ User prompt: Actual resume text to analyze
- ├─ Model: gpt-3.5-turbo (fast + affordable)
- └─ Temperature: 0.7 (balanced creativity/consistency)
-
- Step 3: Parse and validate response
- ├─ Extract JSON from response
- ├─ Validate all required fields present
- ├─ Ensure score is 0-100
- └─ Return structured object to frontend
-
- Step 4: Display results in UI
- └─ Show score, strengths, weaknesses, etc.
  \*/

/\*\*

- ALTERNATIVE PROMPTING STRATEGIES
-
- These can be used to modify AI behavior:
  \*/

// Strategy 1: Industry-specific analysis
const INDUSTRY_VARIANT = `You are an expert HR manager specializing in ${industry} careers...`;

// Strategy 2: Stricter scoring
const STRICT_SCORING = `Score from 0-100 based on:

- Technical skill depth (40%)
- Work experience (30%)
- Education (15%)
- Soft skills (15%)`;

// Strategy 3: Encouragement focus
const ENCOURAGING_TONE = `...Be supportive and encouraging while providing honest feedback...`;

// Strategy 4: Multi-format output
const MARKDOWN_OUTPUT = `Respond with valid JSON, but format longer text fields with markdown...`;

/\*\*

- PROMPT OPTIMIZATION TIPS
-
- 1.  Be SPECIFIC about output format
- Good: "Return JSON with fields X, Y, Z"
- Bad: "Return feedback"
-
- 2.  Use EXAMPLES when possible
- Shows expected quality and format
-
- 3.  Set CONSTRAINTS
- Token limits, score ranges, array sizes
-
- 4.  Define QUALITY CRITERIA
- "Be constructive", "Be data-driven"
-
- 5.  Use ROLE-PLAYING
- "You are an expert HR manager..."
-
- 6.  Test and ITERATE
- Monitor outputs, refine prompt if needed
  \*/

/\*\*

- MONITORING & IMPROVEMENT
-
- To improve results, track:
- - Parse errors (malformed JSON)
- - Missing fields in response
- - Score distribution (should be varied)
- - Response time (token usage)
-
- If issues occur:
- 1.  Increase max_tokens in API call
- 2.  Add more examples to prompt
- 3.  Break analysis into multiple steps
- 4.  Add validation rules for edge cases
      \*/

export {
SYSTEM_PROMPT,
USER_PROMPT_TEMPLATE
};
