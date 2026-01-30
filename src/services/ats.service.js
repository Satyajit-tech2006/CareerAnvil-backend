import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { JobRole } from "../models/jobRole.model.js";

// ---------- Helpers ----------

// Clean and normalize resume text
const cleanText = (text) =>
  text
    .toLowerCase()
    .replace(/\n/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Detect common resume sections (basic heuristic)
const detectSections = (rawText) => {
  const text = rawText.toLowerCase();

  const hasSkills = /(skills|technical skills)\s*[:\n]/i.test(text);
  const hasExperience = /(experience|work experience|employment)\s*[:\n]/i.test(text);
  const hasEducation = /(education|academics)\s*[:\n]/i.test(text);
  const hasProjects = /(projects|personal projects)\s*[:\n]/i.test(text);

  return { hasSkills, hasExperience, hasEducation, hasProjects };
};

// ---------- Core ATS Logic ----------

export const analyzeResume = async (fileBuffer, roleSlug) => {
  // 1. Fetch role + keywords
  const roleData = await JobRole.findOne({ slug: roleSlug });
  if (!roleData) {
    throw new Error("Invalid job role selected");
  }

  // 2. Extract PDF text
  let rawText;
  try {
    const parsed = await pdf(fileBuffer);
    rawText = parsed.text;
  } catch {
    throw new Error("Unable to read PDF file");
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new Error("Resume text is too short or unreadable");
  }

  const cleanedText = cleanText(rawText);
  const sections = detectSections(rawText);

  // 3. Keyword matching (word-boundary safe)
  const matchedKeywords = [];
  const missingKeywords = [];

  roleData.keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(cleanedText)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // 4. Score calculation
  const totalKeywords = roleData.keywords.length;
  const matchedCount = matchedKeywords.length;

  // Keyword score: max 80
  let score = (matchedCount / totalKeywords) * 80;

  // Formatting bonuses: max 20
  if (sections.hasSkills) score += 5;
  if (sections.hasExperience) score += 5;
  if (sections.hasEducation) score += 5;
  if (sections.hasProjects) score += 5;

  score = Math.min(100, Math.round(score));

  // 5. Feedback
  const suggestions = [];
  if (!sections.hasSkills) suggestions.push("Add a clear Skills section.");
  if (!sections.hasExperience) suggestions.push("Mention relevant work or internship experience.");
  if (!sections.hasProjects) suggestions.push("Include 1–2 technical projects.");
  if (missingKeywords.length > 5)
    suggestions.push("Add missing role-specific keywords naturally.");

  return {
    score,
    role: roleData.title,
    matchedKeywords,
    missingKeywords,
    sectionsDetected: sections,
    suggestions,
  };
};
