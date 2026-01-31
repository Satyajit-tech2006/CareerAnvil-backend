import pdf from '../utils/pdfBridge.cjs'; 
import { JobRole } from '../models/jobRole.model.js';
import { COMPANY_PACKS } from '../data/companyKeywords.js';

// --- HELPERS ---
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const cleanText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\n/g, " ")
    .replace(/[^\w\s\+\.#]/g, " ") 
    .replace(/\s+/g, " ")
    .trim();
};

const detectSections = (rawText) => {
  const text = rawText.toLowerCase();
  return {
    hasSkills: /(skills|technical skills|technologies)\s*[:\n]/i.test(text),
    hasExperience: /(experience|work experience|employment|history)\s*[:\n]/i.test(text),
    hasEducation: /(education|academics|qualification|university)\s*[:\n]/i.test(text),
    hasProjects: /(projects|personal projects)\s*[:\n]/i.test(text),
  };
};

// Helper: matches a list of keywords against text and returns match count
const getMatchCount = (text, keywords) => {
    let count = 0;
    keywords.forEach(keyword => {
        const escaped = escapeRegExp(keyword);
        const prefix = /^\w/.test(keyword) ? "\\b" : "";
        const suffix = /\w$/.test(keyword) ? "\\b" : "";
        const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
        if (regex.test(text)) count++;
    });
    return count;
};

// --- MAIN FUNCTION ---
export const analyzeResume = async (fileBuffer, roleSlug, customKeywords = [], isPremiumUser = false) => {
  
  // 1️⃣ Fetch job role
  const roleData = await JobRole.findOne({ slug: roleSlug });
  if (!roleData) throw new Error(`Job Role '${roleSlug}' not found.`);

  // 2️⃣ Extract text (Once)
  if (typeof pdf !== 'function') throw new Error("Critical: PDF Library failed.");
  let rawText = "";
  try {
    if (!fileBuffer) throw new Error("File buffer is empty");
    const parsed = await pdf(fileBuffer);
    rawText = parsed.text;
  } catch (err) {
    console.error("❌ PDF ERROR:", err);
    throw new Error("Failed to parse PDF.");
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new Error("Resume text is too short or unreadable.");
  }

  const cleanedText = cleanText(rawText);
  const sections = detectSections(rawText);

  // 3️⃣ DETERMINE TARGET LIST (Override Logic)
  let targetList = [];
  let isCustomMode = false;

  if (customKeywords && customKeywords.length > 0) {
      targetList = customKeywords;
      isCustomMode = true;
  } else {
      targetList = roleData.keywords;
  }

  // 4️⃣ Main Role Keyword Matching
  const matched = [];
  const missing = [];

  targetList.forEach((keyword) => {
    const escaped = escapeRegExp(keyword);
    const prefix = /^\w/.test(keyword) ? "\\b" : "";
    const suffix = /\w$/.test(keyword) ? "\\b" : "";
    const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
    
    if (regex.test(cleanedText)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  // 5️⃣ Main Scoring
  let score = 0;
  if (targetList.length > 0) {
      score += (matched.length / targetList.length) * 80;
  }
  if (sections.hasSkills) score += 5;
  if (sections.hasExperience) score += 5;
  if (sections.hasEducation) score += 5;
  if (sections.hasProjects) score += 5;

  score = Math.min(100, Math.round(score));

  // 6️⃣ COMPANY ATS SCAN (Premium Only)
  let companyMatch = [];
  if (isPremiumUser) {
      companyMatch = COMPANY_PACKS.map(company => {
          const matchCount = getMatchCount(cleanedText, company.keywords);
          const companyScore = Math.round((matchCount / company.keywords.length) * 100);
          
          return {
              name: company.name,
              score: companyScore,
              tier: company.tier
          };
      }).sort((a, b) => b.score - a.score); // Return best matches first
  }

  // 7️⃣ Return Response
  return {
    score,
    role: roleData.title,
    matchedKeywords: isCustomMode ? [] : matched,
    missingKeywords: isCustomMode ? [] : missing,
    matchedCustomKeywords: isCustomMode ? matched : [],
    missingCustomKeywords: isCustomMode ? missing : [],
    sectionsDetected: sections,
    suggestions: missing.length > 0 
        ? [`Add missing keywords: ${missing.slice(0, 3).join(', ')}`] 
        : ["Great keyword match!"],
    
    // New Field
    companyMatch 
  };
};