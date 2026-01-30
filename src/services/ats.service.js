import pdf from 'pdf-parse';
import { JobRole } from '../models/jobRole.model.js';

// Helper to clean text
const cleanText = (text) => {
    return text
        .toLowerCase()
        .replace(/\n/g, ' ')       // Replace newlines with spaces
        .replace(/[^\w\s]/g, '')   // Remove special chars (keep letters/numbers)
        .replace(/\s+/g, ' ')      // Collapse multiple spaces
        .trim();
};

// Simple Section Detector (Heuristic)
const detectSections = (text) => {
    const lower = text.toLowerCase();
    return {
        hasSkills: lower.includes('skills') || lower.includes('technologies') || lower.includes('technical stack'),
        hasExperience: lower.includes('experience') || lower.includes('employment') || lower.includes('work history'),
        hasEducation: lower.includes('education') || lower.includes('university') || lower.includes('college'),
        hasProjects: lower.includes('projects')
    };
};

export const analyzeResume = async (fileBuffer, roleSlug) => {
    // 1. Fetch Role Data
    const roleData = await JobRole.findOne({ slug: roleSlug });
    if (!roleData) {
        throw new Error("Invalid Job Role selected");
    }

    // 2. Extract Text from PDF
    let rawText = "";
    try {
        const data = await pdf(fileBuffer);
        rawText = data.text;
    } catch (error) {
        throw new Error("Failed to parse PDF file");
    }

    const cleanedText = cleanText(rawText);
    const sections = detectSections(rawText); // Use raw text for section headers to keep structure

    // 3. Keyword Matching
    const matchedKeywords = [];
    const missingKeywords = [];

    roleData.keywords.forEach(keyword => {
        // We check if the cleaned keyword exists in the cleaned text
        if (cleanedText.includes(keyword.toLowerCase())) {
            matchedKeywords.push(keyword);
        } else {
            missingKeywords.push(keyword);
        }
    });

    // 4. Calculate Score
    const totalKeywords = roleData.keywords.length;
    const matchCount = matchedKeywords.length;
    
    // Base score: pure keyword match percentage (up to 80 points)
    let score = (matchCount / totalKeywords) * 80;

    // Bonus points for formatting/sections (up to 20 points)
    if (sections.hasSkills) score += 5;
    if (sections.hasExperience) score += 5;
    if (sections.hasEducation) score += 5;
    if (sections.hasProjects) score += 5;

    // Cap at 100, Round up
    score = Math.min(100, Math.round(score));

    return {
        score,
        role: roleData.title,
        matchedKeywords,
        missingKeywords,
        sectionsDetected: sections
    };
};