/**
 * AI Analyzer Module
 * Handles communication with OpenAI API for resume analysis
 */

const { OpenAI } = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt for resume analysis
 * Guides the AI to provide structured feedback
 */
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

/**
 * Analyze resume using OpenAI GPT API
 * @param {string} resumeText - Extracted resume text
 * @returns {Promise<Object>} Structured analysis results
 * @throws {Error} If API call fails
 */
async function analyzeResumeWithAI(resumeText) {
  try {
    // Check if using test/demo mode (no valid API key)
    const apiKey = process.env.OPENAI_API_KEY || "";
    const isTestMode =
      apiKey.includes("test") || apiKey.includes("placeholder") || !apiKey;

    if (isTestMode) {
      console.log("Using DEMO mode (no OpenAI API key configured)");
      return generateDemoAnalysis(resumeText);
    }

    // Validate API key for production mode
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Truncate resume if too long (token limits)
    const maxCharacters = 8000;
    const truncatedResume =
      resumeText.length > maxCharacters
        ? resumeText.substring(0, maxCharacters) + "..."
        : resumeText;

    console.log("Sending resume to OpenAI for analysis...");

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Please analyze this resume:\n\n${truncatedResume}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Extract and parse the response
    const analysisText = response.choices[0].message.content;
    console.log("AI Response received");

    // Parse JSON response
    const analysis = parseAnalysisResponse(analysisText);

    return analysis;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Parse and validate the AI's JSON response
 * @param {string} responseText - Raw response from AI
 * @returns {Object} Parsed analysis object
 * @throws {Error} If JSON is invalid or missing required fields
 */
function parseAnalysisResponse(responseText) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const requiredFields = [
      "overallScore",
      "candidateSummary",
      "strengths",
      "weaknesses",
      "missingSkills",
      "missingSections",
      "suggestions",
      "overallFeedback",
    ];

    for (const field of requiredFields) {
      if (!(field in analysis)) {
        console.warn(`Missing field in AI response: ${field}`);
      }
    }

    // Ensure score is within valid range
    if (analysis.overallScore < 0 || analysis.overallScore > 100) {
      analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore));
    }

    // Ensure arrays are present
    analysis.strengths = Array.isArray(analysis.strengths)
      ? analysis.strengths
      : [];
    analysis.weaknesses = Array.isArray(analysis.weaknesses)
      ? analysis.weaknesses
      : [];
    analysis.missingSkills = Array.isArray(analysis.missingSkills)
      ? analysis.missingSkills
      : [];
    analysis.missingSections = Array.isArray(analysis.missingSections)
      ? analysis.missingSections
      : [];
    analysis.suggestions = Array.isArray(analysis.suggestions)
      ? analysis.suggestions
      : [];

    return analysis;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error(`Failed to parse AI analysis: ${error.message}`);
  }
}

/**
 * Generate demo analysis for testing without API key
 * @param {string} resumeText - Extracted resume text
 * @returns {Object} Demo analysis results
 */
function generateDemoAnalysis(resumeText) {
  console.log(
    "✨ DEMO MODE: Generating sample analysis (Connect real OpenAI API key for actual analysis)",
  );

  // Detect some keywords to make analysis contextual
  const hasSkills = /skill|experience|proficient/i.test(resumeText);
  const hasEducation = /bachelor|master|degree|university|college/i.test(
    resumeText,
  );
  const hasProjects = /project|built|developed|created|implemented/i.test(
    resumeText,
  );

  return {
    overallScore: 72,
    candidateSummary:
      "A competent professional with relevant experience demonstrated in the resume. The candidate shows promise with a solid foundation in their field.",
    strengths: [
      "Clear career objectives and goals",
      "Relevant professional experience presented clearly",
      "Good structure and formatting of resume",
    ],
    weaknesses: [
      "Could include more quantifiable achievements",
      "Technical skills section could be more comprehensive",
      "Limited information about specific methodologies used",
    ],
    missingSkills: [
      "Machine Learning / AI frameworks",
      "Cloud platforms (AWS, Azure, GCP)",
      "Data visualization tools",
      "Advanced SQL optimization",
    ],
    missingSections: [
      "Certifications section",
      "GitHub/Portfolio link",
      "Publications or speaking engagements",
    ],
    suggestions: [
      "Add percentages or metrics to show impact (e.g., 'Improved performance by 35%')",
      "Include prominent technical skills section at the top",
      "Add a link to your portfolio or GitHub profile",
      "Consider adding relevant certifications or training courses",
      "Highlight any leadership or mentoring experiences",
    ],
    overallFeedback:
      "Your resume demonstrates solid foundational knowledge and experience in your field. To strengthen it further, focus on quantifying your achievements and emphasizing the business impact of your work. Adding specific technologies and tools you've mastered would make you more competitive. Consider including a portfolio link or certifications to demonstrate continuous learning. Overall, this is a good starting point that can be enhanced with these targeted improvements.",
  };
}

module.exports = {
  analyzeResumeWithAI,
};
