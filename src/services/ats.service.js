import pdf from '../utils/pdfBridge.cjs'; 
import { JobRole } from '../models/jobRole.model.js';

// --- 1. REGEX HELPER (Prevents crashes) ---
// Escapes characters like +, ., # so they are treated as text, not code.
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const cleanText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\n/g, " ")
    .replace(/[^\w\s\+\.#]/g, " ") // Allow +, ., # in text for C++, C#, .NET
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
  console.log("--- ATS SCANNING ---");
  console.log("1. Role:", roleSlug);

  if (typeof pdf !== 'function') {
      throw new Error("Critical: PDF Library failed to load.");
  }

  // 1️⃣ Fetch job role
  const roleData = await JobRole.findOne({ slug: roleSlug });
  if (!roleData) {
    throw new Error(`Job Role '${roleSlug}' not found.`);
  }

  // 2️⃣ Extract text
  let rawText = "";
  try {
    if (!fileBuffer) throw new Error("File buffer is empty");
    const parsed = await pdf(fileBuffer);
    rawText = parsed.text;
  } catch (err) {
    console.error("❌ PDF PARSING ERROR:", err);
    throw new Error("Failed to parse PDF.");
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new Error("Resume text is too short or unreadable.");
  }

  const cleanedText = cleanText(rawText);
  const sections = detectSections(rawText);

  // 3️⃣ Keyword Matching (SMART REGEX)
  const matchedKeywords = [];
  const missingKeywords = [];

  roleData.keywords.forEach((keyword) => {
    // 1. Escape special chars (Fixes "c++" crash)
    const escaped = escapeRegExp(keyword);
    
    // 2. Smart Boundaries: Only add \b if the edge is a letter/number
    //    "java" -> \bjava\b
    //    "c++"  -> \bc\+\+ (No \b at end, because + is not a word char)
    //    ".net" -> \.net\b (No \b at start)
    const prefix = /^\w/.test(keyword) ? "\\b" : "";
    const suffix = /\w$/.test(keyword) ? "\\b" : "";
    
    const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
    
    if (regex.test(cleanedText)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // 4️⃣ Scoring
  let score = 0;

  if (roleData.keywords.length > 0) {
    score += (matchedKeywords.length / roleData.keywords.length) * 60;
  }

  if (sections.hasSkills) score += 5;
  if (sections.hasExperience) score += 5;
  if (sections.hasEducation) score += 5;
  if (sections.hasProjects) score += 5;

  if (!customKeywords || customKeywords.length === 0) {
      score = (score / 80) * 100;
  }

  score = Math.min(100, Math.round(score));

  // 5️⃣ Suggestions
  const suggestions = [];
  if (!sections.hasSkills) suggestions.push("Add a 'Skills' section.");
  if (!sections.hasExperience) suggestions.push("Mention work experience.");
  if (missingKeywords.length > 5) suggestions.push(`Add more keywords for ${roleData.title}.`);

  return {
    score,
    role: roleData.title,
    matchedKeywords,
    missingKeywords,
    sectionsDetected: sections,
    suggestions,
  };
};