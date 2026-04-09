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
    "✨ DEMO MODE: Generating contextual analysis based on resume content",
  );

  const lowerText = resumeText.toLowerCase();

  // Detect resume components and skills
  const sections = {
    hasEducation:
      /bachelor|master|degree|university|college|phd|certification/i.test(
        resumeText,
      ),
    hasProjects: /project|built|developed|created|implemented|deployed/i.test(
      resumeText,
    ),
    hasExperience:
      /experience|worked|employed|role|position|company|organization/i.test(
        resumeText,
      ),
    hasAchievements:
      /achievement|award|recognition|promoted|led|managed|increased|improved|reduced|optimized/i.test(
        resumeText,
      ),
    hasMetrics: /\d+%|\$\d+|increased|decreased|grew|expanded/i.test(
      resumeText,
    ),
    hasSkills:
      /python|java|javascript|react|angular|node|sql|aws|azure|gcp|devops|ci\/cd|api|rest|microservice|machine learning|ai|deep learning|data|analytics|management|leadership/i.test(
        resumeText,
      ),
    hasGithub: /github|gitlab|bitbucket|portfolio|website|linkedin|link/i.test(
      resumeText,
    ),
  };

  // Calculate score components
  let score = 40;
  let strengthCount = 0;
  let weaknessAreas = [];

  if (sections.hasEducation) {
    score += 15;
    strengthCount++;
  }
  if (sections.hasExperience) {
    score += 15;
    strengthCount++;
  }
  if (sections.hasProjects) {
    score += 10;
    strengthCount++;
  }
  if (sections.hasAchievements) {
    score += 10;
    strengthCount++;
  }
  if (sections.hasMetrics) {
    score += 10;
    strengthCount++;
  }
  if (sections.hasSkills) {
    score += 5;
    strengthCount++;
  }
  if (sections.hasGithub) {
    score += 5;
    strengthCount++;
  }

  // Ensure score is within 0-100
  score = Math.min(100, Math.max(0, score));

  // Generate context-specific strengths
  const strengths = [];
  const weaknesses = [];
  const missingSkills = [];
  const missingSections = [];

  // Strengths based on what's present
  if (sections.hasEducation) {
    strengths.push("Clear educational background documented");
  }
  if (sections.hasExperience) {
    strengths.push("Relevant work experience presented");
  }
  if (sections.hasProjects) {
    strengths.push("Demonstrates practical project experience");
  }
  if (sections.hasMetrics) {
    strengths.push("Includes quantifiable achievements and metrics");
  }
  if (sections.hasSkills) {
    strengths.push("Lists relevant technical skills");
  }

  // Default strengths if not enough detected
  if (strengths.length < 3) {
    strengths.push("Generally well-structured resume format");
  }
  if (strengths.length < 3) {
    strengths.push("Professional tone and language");
  }

  // Weaknesses based on what's missing
  if (!sections.hasMetrics) {
    weaknesses.push(
      "Missing quantifiable metrics and achievements (e.g., '25% productivity improvement')",
    );
  }
  if (!sections.hasProjects) {
    weaknesses.push(
      "Limited demonstration of project work and technical accomplishments",
    );
  }
  if (!sections.hasAchievements) {
    weaknesses.push(
      "Could highlight more significant accomplishments and impact",
    );
  }
  if (!sections.hasGithub) {
    weaknesses.push(
      "No links to portfolio, GitHub, or professional online presence",
    );
  }
  if (!sections.hasEducation && !sections.hasExperience) {
    weaknesses.push(
      "Educational or work experience section needs to be more prominent",
    );
  }

  // Ensure we have at least 3 weaknesses
  while (weaknesses.length < 3) {
    const defaults = [
      "Could include more industry-specific keywords",
      "Consider adding certifications or continuous learning",
      "Technical depth could be better articulated",
    ];
    if (!weaknesses.includes(defaults[weaknesses.length])) {
      weaknesses.push(defaults[weaknesses.length]);
    }
  }

  // Missing skills based on resume type
  if (lowerText.includes("data") || lowerText.includes("analyst")) {
    missingSkills.push("Advanced SQL and data optimization");
    missingSkills.push("Data visualization tools (Tableau, Power BI)");
  }
  if (
    lowerText.includes("develop") ||
    lowerText.includes("engineer") ||
    lowerText.includes("software")
  ) {
    missingSkills.push("Cloud platforms (AWS, Azure, GCP)");
    missingSkills.push("CI/CD pipelines and DevOps");
  }
  if (lowerText.includes("ai") || lowerText.includes("machine learning")) {
    missingSkills.push("TensorFlow or PyTorch experience");
    missingSkills.push("MLOps and model deployment");
  }
  if (lowerText.includes("manager") || lowerText.includes("lead")) {
    missingSkills.push("Strategic planning and OKR setting");
    missingSkills.push("Team development and coaching");
  }

  // Default missing skills if not enough detected
  if (missingSkills.length < 2) {
    missingSkills.push("Emerging technologies and frameworks");
    missingSkills.push("Cross-functional collaboration tools");
  }

  // Missing sections based on what's not found
  if (!sections.hasGithub) {
    missingSections.push("Link to GitHub/Portfolio/Online Profile");
  }
  if (!sections.hasAchievements) {
    missingSections.push("Impact and achievements summary");
  }
  const hasCerts = /certification|cert|license/i.test(resumeText);
  if (!hasCerts) {
    missingSections.push("Relevant certifications or credentials");
  }

  // Generate specific suggestions
  const suggestions = [
    `Focus on adding ${!sections.hasMetrics ? "quantifiable results and metrics" : "more specific impact metrics"} to each role`,
    `${!sections.hasGithub ? "Add links to your portfolio, GitHub, or professional online presence" : "Ensure your portfolio/GitHub links are current and professional"}`,
    `${
      !sections.hasProjects
        ? "Include 2-3 key projects you've built or contributed to with outcomes"
        : "Highlight the business impact of your projects"
    }`,
    `${
      score < 60
        ? "Reorganize your resume to emphasize your strongest qualifications upfront"
        : "Consider tailoring this resume for specific job descriptions"
    }`,
    `Include any relevant ${
      score < 75
        ? "certifications, awards, or speaking engagements to boost credibility"
        : "continuous learning or professional development activities"
    }`,
  ];

  // Generate context-specific feedback
  let feedbackContext = "";
  if (score < 50) {
    feedbackContext = `This resume needs significant improvements. Start by adding more quantifiable achievements and clearer job responsibilities. Include specific metrics and business impact for each role.`;
  } else if (score < 65) {
    feedbackContext = `Your resume has a solid foundation but needs refinement. Focus on adding more specific metrics and measurable achievements. Include links to your portfolio or GitHub to demonstrate hands-on experience.`;
  } else if (score < 80) {
    feedbackContext = `This is a well-structured resume with good content. To make it exceptional, add more specific metrics, quantifiable achievements, and ensure all sections highlight your business impact and unique value.`;
  } else {
    feedbackContext = `Excellent resume structure with strong content. To make it stand out further, ensure every bullet point quantifies impact, include portfolio links, and tailor it for specific positions to maximize relevance.`;
  }

  const overallFeedback = `${feedbackContext} Your resume score of ${score}/100 reflects a ${
    score < 50
      ? "developing"
      : score < 65
        ? "solid"
        : score < 80
          ? "strong"
          : "excellent"
  } profile. The key to improvement is demonstrating measurable impact and ensuring your most relevant skills and experiences are prominently featured. Consider having someone from your target industry review it for industry-specific feedback.`;

  return {
    overallScore: score,
    candidateSummary:
      strengthCount >= 5
        ? "A well-rounded professional with strong qualifications across education, experience, and technical skills. Demonstrates concrete achievements and measurable impact."
        : strengthCount >= 3
          ? "A qualified candidate with relevant background and experience. Shows promise with documented responsibilities and technical capabilities."
          : "An emerging professional with foundational qualifications. Has basic resume structure with room for more specific achievements and impact demonstration.",
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    missingSkills: missingSkills.slice(0, 2),
    missingSections:
      missingSections.length > 0
        ? missingSections
        : ["Professional endorsements or recommendations"],
    suggestions: suggestions.slice(0, 5),
    overallFeedback: overallFeedback,
  };
}

module.exports = {
  analyzeResumeWithAI,
};
