import pdf from '../utils/pdfBridge.cjs'; 
import { JobRole } from '../models/jobRole.model.js';

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

export const analyzeResume = async (fileBuffer, roleSlug, customKeywords = []) => {

  // 1️⃣ Fetch job role (We still need the title)
  const roleData = await JobRole.findOne({ slug: roleSlug });
  if (!roleData) throw new Error(`Job Role '${roleSlug}' not found.`);

  // 2️⃣ Extract text
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

  // 3️⃣ DETERMINE TARGET LIST (The "Override" Logic)
  let targetList = [];
  let isCustomMode = false;

  if (customKeywords && customKeywords.length > 0) {
      // PRIORITY: If custom keywords exist, use ONLY them.
      targetList = customKeywords;
      isCustomMode = true;
      console.log("Mode: CUSTOM OVERRIDE (Ignoring DB keywords)");
  } else {
      // FALLBACK: Use DB keywords
      targetList = roleData.keywords;
      console.log("Mode: STANDARD DB SCAN");
  }

  // 4️⃣ Keyword Matching
  const matched = [];
  const missing = [];

  targetList.forEach((keyword) => {
    const escaped = escapeRegExp(keyword);
    // Smart boundary check for C++, .NET, etc.
    const prefix = /^\w/.test(keyword) ? "\\b" : "";
    const suffix = /\w$/.test(keyword) ? "\\b" : "";
    const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
    
    if (regex.test(cleanedText)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  // 5️⃣ Scoring Strategy
  // Max Score = 100
  // Keywords = 80 points
  // Sections = 20 points
  
  let score = 0;

  // Keyword Score (Out of 80)
  if (targetList.length > 0) {
      score += (matched.length / targetList.length) * 80;
  } else {
      // If list is empty (rare edge case), give full points to be nice? 
      // Or 0? Let's give 0 to prompt them to add keywords.
  }

  // Formatting Score (Out of 20)
  if (sections.hasSkills) score += 5;
  if (sections.hasExperience) score += 5;
  if (sections.hasEducation) score += 5;
  if (sections.hasProjects) score += 5;

  score = Math.min(100, Math.round(score));

  // 6️⃣ Construct Response
  // If Custom Mode: We return the matches in the 'custom' fields
  // so the Frontend shows the correct cards.
  return {
    score,
    role: roleData.title,
    
    // Standard Card (Empty if custom mode)
    matchedKeywords: isCustomMode ? [] : matched,
    missingKeywords: isCustomMode ? [] : missing,
    
    // Custom Card (Populated if custom mode)
    matchedCustomKeywords: isCustomMode ? matched : [],
    missingCustomKeywords: isCustomMode ? missing : [],
    
    sectionsDetected: sections,
    suggestions: missing.length > 0 
        ? [`Add missing keywords: ${missing.slice(0, 3).join(', ')}`] 
        : ["Great keyword match!"]
  };
};