import { STOP_WORDS } from '../utils/stopwords.js';

export const extractKeywords = (text) => {
    if (!text) return "";

    // 1. Clean Text: Lowercase -> Remove special chars -> Split by whitespace
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with space
        .split(/\s+/);            // Split by any whitespace

    // 2. Count Frequency
    const frequencyMap = {};
    
    words.forEach(word => {
        // Only count if it's not a number, longer than 2 chars, and not a stop word
        if (word.length > 2 && isNaN(word) && !STOP_WORDS.has(word)) {
            frequencyMap[word] = (frequencyMap[word] || 0) + 1;
        }
    });

    // 3. Sort by Frequency (Highest first)
    const sortedWords = Object.keys(frequencyMap)
        .sort((a, b) => frequencyMap[b] - frequencyMap[a]);

    // 4. Take Top 50 and Join
    const topKeywords = sortedWords.slice(0, 50).join(', ');

    return topKeywords; // Returns CSV string
};