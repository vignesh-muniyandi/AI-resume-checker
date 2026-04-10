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
 * @param {string} jobType - Type of job (hr, data_analyst, sales, etc.)
 * @returns {Promise<Object>} Structured analysis results
 * @throws {Error} If API call fails
 */
async function analyzeResumeWithAI(resumeText, jobType = "general") {
  try {
    // Check if using test/demo mode (no valid API key)
    const apiKey = process.env.OPENAI_API_KEY || "";
    const isTestMode =
      apiKey.includes("test") || apiKey.includes("placeholder") || !apiKey;

    if (isTestMode) {
      console.log(
        `Using DEMO mode for ${jobType} position (no OpenAI API key configured)`,
      );
      return generateDemoAnalysis(resumeText, jobType);
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
function generateDemoAnalysis(resumeText, jobType = "general") {
  console.log(
    `✨ DEMO MODE: Generating contextual analysis based on resume content for ${jobType} position`,
  );

  const lowerText = resumeText.toLowerCase();
  const wordCount = resumeText.split(/\s+/).length;
  const lineCount = resumeText.split("\n").length;

  // Advanced section detection with depth scoring
  const sections = {
    hasEducation:
      /bachelor|master|degree|university|college|phd|certification|school|institute|academy/i.test(
        resumeText,
      ),
    educationDepth: (
      resumeText.match(/bachelor|master|phd|degree|university|college/gi) || []
    ).length,

    hasProjects:
      /project|built|developed|created|implemented|deployed|released/i.test(
        resumeText,
      ),
    projectDepth: (
      resumeText.match(
        /project|built|developed|created|implemented|deployed/gi,
      ) || []
    ).length,

    hasExperience:
      /experience|worked|employed|role|position|company|organization|years|years of|led|managed/i.test(
        resumeText,
      ),
    experienceDepth: (
      resumeText.match(/experience|worked|employed|years|role|position/gi) || []
    ).length,

    hasAchievements:
      /achievement|award|recognition|promoted|led|managed|increased|improved|reduced|optimized|recognized|honored|excellence/i.test(
        resumeText,
      ),
    achievementDepth: (
      resumeText.match(
        /achieved|increased|improved|reduced|optimized|promoted|managed|led/gi,
      ) || []
    ).length,

    hasMetrics:
      /\d+%|\$\d+|increased|decreased|grew|expanded|growth|roi|revenue|profit|sales|users|customers/i.test(
        resumeText,
      ),
    metricCount: (
      resumeText.match(
        /\d+%|\$\d+|increase|decrease|growth|revenue|profit|sales|users|customers/gi,
      ) || []
    ).length,

    hasSkills:
      /python|java|javascript|react|angular|node|sql|aws|azure|gcp|devops|ci\/cd|api|rest|microservice|machine learning|ai|deep learning|data|analytics|management|leadership|kubernetes|docker|git|agile|scrum/i.test(
        resumeText,
      ),
    skillCount: (
      resumeText.match(
        /python|java|javascript|react|angular|node|sql|aws|azure|gcp|devops|kubernetes|docker/gi,
      ) || []
    ).length,

    hasGithub:
      /github|gitlab|bitbucket|portfolio|website|link|linkedin|url|linkedin\.com|github\.com/i.test(
        resumeText,
      ),
  };

  // JOB-SPECIFIC SKILL DETECTION
  const jobSkillsFound = {
    hr: {
      keywords:
        /hrm|recruitment|talent|employee relations|payroll|compliance|benefits|organizational|conflict resolution|performance management|lcm|compensation/gi,
      count: (
        resumeText.match(
          /hrm|recruitment|talent|employee relations|payroll|compensation/gi,
        ) || []
      ).length,
    },
    data_analyst: {
      keywords:
        /sql|tableau|power bi|excel|analytics|data|visualization|python|r programming|looker|analytics|big data|etl/gi,
      count: (
        resumeText.match(
          /sql|tableau|power bi|analytics|python|r programming|data warehouse/gi,
        ) || []
      ).length,
    },
    sales: {
      keywords:
        /sales|crm|salesforce|revenue|target|client|business development|pipeline|negotiation|deal|commission|revenue|outbound|inbound/gi,
      count: (
        resumeText.match(/sales|crm|salesforce|revenue|target|client|deal/gi) ||
        []
      ).length,
    },
    business_analyst: {
      keywords:
        /requirement|analysis|stakeholder|process improvement|documentation|business logic|testing|qa|jira|confluence|agile|scrum|requirements/gi,
      count: (
        resumeText.match(
          /requirement|analysis|stakeholder|process|jira|agile|scrum/gi,
        ) || []
      ).length,
    },
    tele_caller: {
      keywords:
        /call center|communication|customer service|outbound|inbound|dialing|bpo|customer interaction|sales call|lead generation/gi,
      count: (
        resumeText.match(
          /call center|customer service|communication|outbound|inbound/gi,
        ) || []
      ).length,
    },
    developer: {
      keywords:
        /javascript|python|java|react|angular|node|git|api|rest|microservice|database|mongodb|postgresql|docker|kubernetes/gi,
      count: (
        resumeText.match(
          /javascript|python|java|react|angular|node|api|database/gi,
        ) || []
      ).length,
    },
  };

  // Calculate HIGHLY DIFFERENTIATED score based on comprehensive analysis
  let score = 20; // Base score
  let strengthCount = 0;
  let weaknessAreas = [];

  // JOB-SPECIFIC SCORE BOOST
  if (jobType && jobType !== "general" && jobSkillsFound[jobType]) {
    score += Math.min(15, jobSkillsFound[jobType].count * 2); // Extra points for job-specific skills
  }

  // DETAILED SKILL ANALYSIS (0-25 points)
  let skillScore = 0;
  const advancedSkills = (
    resumeText.match(
      /kubernetes|terraform|lambda|microservice|architecture|system design|api gateway|events|serverless/gi,
    ) || []
  ).length;
  const cloudSkills = (
    resumeText.match(/aws|azure|gcp|cloud|s3|ec2|rds|dynamodb/gi) || []
  ).length;
  const modernWebSkills = (
    resumeText.match(
      /react|vue|angular|nextjs|typescript|tailwind|graphql/gi,
    ) || []
  ).length;
  const dataSkills = (
    resumeText.match(
      /python|sql|machine learning|data|analytics|tableau|power bi|kafka|spark/gi,
    ) || []
  ).length;
  const devopsSkills = (
    resumeText.match(
      /docker|kubernetes|ci\/cd|jenkins|gitlab|github actions|terraform|ansible/gi,
    ) || []
  ).length;

  skillScore += Math.min(5, sections.skillCount);
  skillScore += advancedSkills > 0 ? 5 : 0;
  skillScore += Math.min(5, cloudSkills);
  skillScore += Math.min(5, modernWebSkills);
  skillScore += Math.min(5, dataSkills);
  skillScore += Math.min(3, devopsSkills);
  score += Math.min(25, skillScore);
  if (skillScore > 5) strengthCount++;

  // DETAILED EXPERIENCE ANALYSIS (0-25 points)
  let experienceScore = 0;
  const yearsMatch = resumeText.match(
    /(\d+)\s*(?:years?|yrs?)\s+(?:of|experience)/gi,
  );
  const totalYears = yearsMatch
    ? yearsMatch.reduce((sum, match) => {
        const num = parseInt(match.match(/\d+/)[0]);
        return sum + num;
      }, 0)
    : 0;

  experienceScore += sections.experienceDepth > 2 ? 8 : 5;
  experienceScore += totalYears > 5 ? 8 : totalYears > 2 ? 5 : 3;
  experienceScore += sections.hasExperience ? 4 : 0;
  experienceScore +=
    (resumeText.match(/senior|lead|manager|director|cto|vp|principal/gi) || [])
      .length > 0
      ? 5
      : 0;
  score += Math.min(25, experienceScore);
  if (experienceScore > 8) strengthCount++;

  // ACHIEVEMENTS & IMPACT (0-20 points)
  let impactScore = 0;
  const impactKeywords = (
    resumeText.match(
      /led|managed|improved|increased|reduced|optimized|launched|scaled|grew|delivered|achieved|exceeded|transformed/gi,
    ) || []
  ).length;
  impactScore += Math.min(8, sections.achievementDepth);
  impactScore += Math.min(12, sections.metricCount * 2);
  score += Math.min(20, impactScore);
  if (impactScore > 5) strengthCount++;

  // EDUCATION QUALITY (0-15 points)
  let educationScore = 0;
  const hasAdvancedDegree = /master|phd|mba|ms|me|ma/i.test(resumeText);
  const topSchools =
    /harvard|yale|stanford|mit|cambridge|oxford|berkeley|cmu|cornell|princeton/gi.test(
      resumeText,
    );
  educationScore += sections.hasEducation ? 8 : 0;
  educationScore += hasAdvancedDegree ? 5 : 2;
  educationScore += topSchools ? 2 : 0;
  score += educationScore;
  if (educationScore > 5) strengthCount++;

  // PROJECTS & PORTFOLIO (0-15 points)
  let projectScore = 0;
  const openSourceContributions = (
    resumeText.match(
      /open source|github|contribute|repository|repo|npm package|library/gi,
    ) || []
  ).length;
  projectScore += sections.projectDepth * 3;
  projectScore += openSourceContributions * 2;
  projectScore += sections.hasGithub ? 5 : 0;
  score += Math.min(15, projectScore);
  if (projectScore > 5) strengthCount++;

  // CONTENT QUALITY (0-10 points)
  let contentScore = 0;
  contentScore += wordCount > 800 ? 4 : wordCount > 500 ? 2 : 0;
  contentScore += lineCount > 50 ? 3 : lineCount > 20 ? 2 : 0;
  contentScore += /summary|objective|profile/i.test(resumeText) ? 2 : 0;
  contentScore += /certif|award|recognition/i.test(resumeText) ? 1 : 0;
  score += Math.min(10, contentScore);

  // BONUS FACTORS (0-10 points)
  let bonusScore = 0;
  const hasCompanyNames =
    /company|corporation|inc|llc|ltd|corp|crm|saas|startup|enterprise/gi.test(
      resumeText,
    );
  const hasClientNames = /client|customer|partner|enterprise/gi.test(
    resumeText,
  );
  const hasInternship = /intern|fellowship|bootcamp|training/gi.test(
    resumeText,
  );

  bonusScore += hasCompanyNames ? 3 : 0;
  bonusScore += hasClientNames ? 2 : 0;
  bonusScore += hasInternship ? 1 : 0;
  bonusScore +=
    (resumeText.match(/\d+\+\s*(years?|projects?|clients?|users?)/gi) || [])
      .length > 0
      ? 2
      : 0;
  score += Math.min(10, bonusScore);

  // Ensure score is within 0-100
  score = Math.max(20, Math.min(100, Math.round(score)));

  // Generate context-specific strengths
  const strengths = [];
  const weaknesses = [];
  const missingSkills = [];
  const missingSections = [];

  // Strengths based on detected depth and content
  if (sections.hasEducation) {
    if (sections.educationDepth >= 2) {
      strengths.push("Multiple relevant qualifications and degrees documented");
    } else {
      strengths.push("Clear educational background documented");
    }
  }

  if (sections.hasExperience) {
    if (sections.experienceDepth >= 4) {
      strengths.push("Extensive work experience across multiple roles");
    } else if (sections.experienceDepth >= 2) {
      strengths.push("Solid relevant work experience presented");
    } else {
      strengths.push("Demonstrates professional work experience");
    }
  }

  if (sections.hasProjects) {
    if (sections.projectDepth >= 3) {
      strengths.push(
        "Excellent practical project portfolio with multiple accomplishments",
      );
    } else {
      strengths.push(
        "Demonstrates concrete project experience and hands-on skills",
      );
    }
  }

  if (sections.hasAchievements) {
    if (sections.achievementDepth >= 4) {
      strengths.push(
        "Outstanding career achievements and leadership recognition",
      );
    } else {
      strengths.push("Documents key achievements and professional growth");
    }
  }

  if (sections.hasMetrics) {
    if (sections.metricCount >= 5) {
      strengths.push(
        "Strong use of quantifiable metrics demonstrating measurable impact",
      );
    } else if (sections.metricCount >= 2) {
      strengths.push("Includes quantifiable achievements and business metrics");
    }
  }

  if (sections.hasSkills) {
    if (sections.skillCount >= 8) {
      strengths.push(
        "Comprehensive technical skill set with multiple modern technologies",
      );
    } else if (sections.skillCount >= 4) {
      strengths.push("Lists relevant and current technical skills");
    }
  }

  // Fill up to 3 strengths with general ones if needed
  if (strengths.length === 0) {
    strengths.push("Generally well-structured resume format");
    strengths.push("Professional tone and language");
    strengths.push("Clear presentation of information");
  } else if (strengths.length === 1) {
    strengths.push("Well-organized resume layout");
    strengths.push("Professional writing and presentation");
  } else if (strengths.length === 2) {
    strengths.push("Good formatting and readability");
  }

  // Weaknesses based on what's missing
  if (!sections.hasMetrics || sections.metricCount < 2) {
    weaknesses.push(
      "Missing quantifiable metrics and achievements (e.g., '25% productivity improvement', '$500K revenue generated')",
    );
  }

  if (!sections.hasProjects || sections.projectDepth < 2) {
    weaknesses.push(
      "Limited demonstration of project work and concrete technical accomplishments",
    );
  }

  if (!sections.hasAchievements || sections.achievementDepth < 2) {
    weaknesses.push(
      "Could highlight more significant accomplishments and career impact",
    );
  }

  if (!sections.hasGithub) {
    weaknesses.push(
      "No links to portfolio, GitHub, or professional online presence for verification",
    );
  }

  if (wordCount < 400) {
    weaknesses.push(
      "Resume appears too brief - consider expanding with more detail about responsibilities and achievements",
    );
  }

  if (!sections.hasSkills || sections.skillCount < 3) {
    weaknesses.push(
      "Technical skills section needs more detail or modern technologies",
    );
  }

  // Ensure we have 3 weaknesses
  while (weaknesses.length < 3) {
    const defaults = [
      "Could include more industry-specific keywords and terminology",
      "Consider adding relevant certifications or continuous learning",
      "Could better articulate technical depth and expertise level",
      "Action verbs could be more dynamic and impactful",
    ];
    const candidate = defaults[weaknesses.length % defaults.length];
    if (!weaknesses.includes(candidate)) {
      weaknesses.push(candidate);
    }
  }

  // JOB-SPECIFIC MISSING SKILLS
  const jobMissingSkills = {
    hr: [
      "Advanced HRIS systems and automation",
      "Data-driven HR analytics and metrics",
      "Employment law and compliance expertise",
      "Strategic workforce planning",
    ],
    data_analyst: [
      "Advanced SQL and database optimization",
      "Data visualization tools (Tableau, Power BI)",
      "Python or R for statistical analysis",
      "Big data technologies (Spark, Hadoop)",
      "Machine learning fundamentals",
    ],
    sales: [
      "Advanced CRM platform expertise (Salesforce)",
      "Sales analytics and forecasting",
      "Strategic account management",
      "Consultative selling techniques",
      "Market research and competitive analysis",
    ],
    business_analyst: [
      "Advanced requirements gathering techniques",
      "Data modeling and database design knowledge",
      "Business process optimization expertise",
      "Advanced analytics tools",
      "Stakeholder management and communication",
    ],
    tele_caller: [
      "Advanced sales techniques and objection handling",
      "CRM software proficiency",
      "Quality assurance and compliance knowledge",
      "Performance metrics tracking",
      "Multilingual communication skills",
    ],
    developer: [
      "Cloud platforms (AWS, Azure, GCP)",
      "CI/CD pipelines and DevOps practices",
      "Containerization (Docker, Kubernetes)",
      "Microservices architecture",
      "API design and REST best practices",
    ],
  };

  // Add job-specific missing skills
  if (jobType && jobType !== "general" && jobMissingSkills[jobType]) {
    const jobSkills = jobMissingSkills[jobType];
    jobSkills.forEach((skill) => {
      const skillLower = skill.toLowerCase();
      // Check if skill is already mentioned in resume
      if (!lowerText.includes(skillLower.split("(")[0].trim())) {
        missingSkills.push(skill);
        if (missingSkills.length >= 2) return; // Limit to 2
      }
    });
  }

  // Default missing skills if not enough detected
  if (missingSkills.length < 2) {
    missingSkills.push("Advanced problem-solving frameworks");
    missingSkills.push("Industry-specific emerging technologies");
  }

  // Limit to top 2
  missingSkills.splice(2);

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

  // CALCULATE JOB MATCH PERCENTAGE
  let jobMatchPercentage = 50; // Base match percentage
  let jobMatchStatus = "Neutral - Limited Alignment";
  let matchedSkills = [];
  let matchedExperience = [];

  if (jobType && jobType !== "general") {
    // Calculate match based on job-specific skills found
    jobMatchPercentage = Math.round((jobSkillsFound[jobType].count / 10) * 100);
    jobMatchPercentage = Math.min(95, Math.max(20, jobMatchPercentage)); // 20-95 range

    // Determine match status
    if (jobMatchPercentage >= 80) {
      jobMatchStatus =
        "✅ EXCELLENT MATCH - You are well-aligned with this role";
    } else if (jobMatchPercentage >= 60) {
      jobMatchStatus =
        "✅ GOOD MATCH - You have relevant experience for this role";
    } else if (jobMatchPercentage >= 40) {
      jobMatchStatus =
        "⚠️ MODERATE MATCH - You have some relevant skills but gaps exist";
    } else {
      jobMatchStatus =
        "❌ LIMITED MATCH - Your resume doesn't strongly align with this role. Consider building skills below.";
    }

    // List matched skills for this job
    const jobSkillKeywords = {
      hr: [
        "hrm",
        "recruitment",
        "talent",
        "employee relations",
        "payroll",
        "compensation",
      ],
      data_analyst: [
        "sql",
        "tableau",
        "power bi",
        "analytics",
        "python",
        "r programming",
      ],
      sales: ["sales", "crm", "salesforce", "revenue", "target", "client"],
      business_analyst: [
        "requirement",
        "analysis",
        "stakeholder",
        "process",
        "jira",
        "agile",
      ],
      tele_caller: [
        "call center",
        "customer service",
        "communication",
        "outbound",
        "inbound",
      ],
      developer: [
        "javascript",
        "python",
        "java",
        "react",
        "angular",
        "node",
        "api",
      ],
    };

    if (jobSkillKeywords[jobType]) {
      jobSkillKeywords[jobType].forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          matchedSkills.push(
            keyword.charAt(0).toUpperCase() + keyword.slice(1),
          );
        }
      });
    }

    // Check for relevant experience
    if (sections.hasExperience && experienceScore > 10) {
      matchedExperience.push("Clear relevant work experience documented");
    }
    if (totalYears > 0) {
      matchedExperience.push(`${totalYears}+ years of professional experience`);
    }
  }

  // RELATED SKILL ADVICE BASED ON JOB TYPE
  const relatedSkillAdvice = {
    hr: {
      top_priority: "HRIS Systems (SAP SuccessFactors, Workday, ADP)",
      secondary: "Employment Law & Labor Compliance",
      tools: "HR Analytics Tools, Workforce Planning Software",
      certification: "SHRM Certification (SHRM-CP, SHRM-SCP)",
    },
    data_analyst: {
      top_priority: "Advanced SQL & Database Management",
      secondary: "Data Visualization (Tableau, Power BI, Looker)",
      tools: "Python/R, Excel, Google Analytics, Tableau",
      certification:
        "Google Data Analytics Certificate, Microsoft Data Analyst",
    },
    sales: {
      top_priority: "CRM Platform Mastery (Salesforce, HubSpot)",
      secondary: "Sales Analytics & Forecasting",
      tools: "Sales Automation, LinkedIn Sales Navigator, CRM Software",
      certification:
        "Salesforce Administrator Certification, Sales Certification",
    },
    business_analyst: {
      top_priority: "Requirements Analysis & Documentation",
      secondary: "Data Modeling & Process Optimization",
      tools: "JIRA, Confluence, SQL, Data Modeling Tools",
      certification: "IIBA CBAP/CCBA, Business Analysis Certification",
    },
    tele_caller: {
      top_priority: "Advanced Sales Techniques & CRM Proficiency",
      secondary: "Quality Assurance & Performance Metrics",
      tools: "Dialer Software, CRM, Call Center Tools, Performance Tracking",
      certification: "Sales Certification, Customer Service Excellence",
    },
    developer: {
      top_priority: "Cloud Platforms (AWS, Azure, Google Cloud)",
      secondary: "DevOps & CI/CD Pipelines",
      tools: "Docker, Kubernetes, Git, Jenkins, GitHub Actions",
      certification: "AWS Solutions Architect, Azure Developer Associate",
    },
  };

  const skillAdvice = relatedSkillAdvice[jobType] || {
    top_priority: "Industry-specific technical skills",
    secondary: "Advanced problem-solving and domain expertise",
    tools: "Relevant software and tools for your industry",
    certification: "Professional certifications in your field",
  };

  return {
    overallScore: score,
    jobType: jobType,
    jobMatchPercentage: jobMatchPercentage,
    jobMatchStatus: jobMatchStatus,
    matchedSkills: matchedSkills,
    matchedExperience: matchedExperience,
    skillAdvice: skillAdvice,
    candidateSummary: generateCandidateSummary(score, strengthCount, sections),
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

/**
 * Generate varied candidate summary based on score and profile
 */
function generateCandidateSummary(score, strengthCount, sections) {
  if (score >= 85) {
    if (sections.hasMetrics && sections.achievementDepth > 2) {
      return "An exceptional candidate with outstanding qualifications, clear measurable achievements, and demonstrated career progression across multiple dimensions.";
    }
    return "A highly qualified professional with strong credentials, relevant experience, and excellent technical capabilities.";
  } else if (score >= 70) {
    if (sections.projectDepth > 2) {
      return "A strong candidate with solid credentials, practical project experience, and well-documented professional accomplishments.";
    }
    return "A competitive candidate with relevant background, professional experience, and documented technical capabilities.";
  } else if (score >= 55) {
    if (sections.skillCount > 5) {
      return "A capable candidate with foundational qualifications and relevant technical skills, with room to strengthen achievement documentation.";
    }
    return "A qualified professional with basic background and relevant experience, showing potential for career growth with stronger achievement documentation.";
  } else {
    return "An emerging professional with foundational qualifications. Focus on quantifying achievements and strengthening documented impact to advance competitiveness.";
  }
}

module.exports = {
  analyzeResumeWithAI,
};
