import { STOP_WORDS } from '../utils/stopwords.js';

// Helper to clean a single word
const clean = (word) => word.toLowerCase().replace(/[^a-z0-9\+\.#]/g, '');

const isValidWord = (word) => {
    return word && word.length > 1 && !STOP_WORDS.has(word) && isNaN(word);
};

export const extractKeywords = (text) => {
    if (!text) return "";

    // 1. Tokenize: Split by space but preserve sequence
    // We keep special chars like +, #, . for C++, C#, .NET, Node.js
    const tokens = text
        .toLowerCase()
        .replace(/[\n\r]/g, " ")       // Remove newlines
        .replace(/[^a-z0-9\+\.#\s-]/g, "") // Remove harsh punctuation (keep -, +, ., #)
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 0);

    const freqMap = {};

    // 2. N-Gram Generation (1, 2, and 3 words)
    for (let i = 0; i < tokens.length; i++) {
        const word1 = tokens[i];
        
        // --- UNIGRAMS (Single words) ---
        if (isValidWord(word1)) {
            freqMap[word1] = (freqMap[word1] || 0) + 1;
        }

        // --- BIGRAMS (2 words) ---
        if (i < tokens.length - 1) {
            const word2 = tokens[i + 1];
            // Rule: Don't start or end with a stop word
            if (isValidWord(word1) && isValidWord(word2)) {
                const phrase = `${word1} ${word2}`;
                // Boost count slightly for phrases to make them appear higher
                freqMap[phrase] = (freqMap[phrase] || 0) + 2; 
            }
        }

        // --- TRIGRAMS (3 words) ---
        // Useful for: "Amazon Web Services", "Google Cloud Platform"
        if (i < tokens.length - 2) {
            const word2 = tokens[i + 1];
            const word3 = tokens[i + 2];
            
            if (isValidWord(word1) && isValidWord(word2) && isValidWord(word3)) {
                const phrase = `${word1} ${word2} ${word3}`;
                freqMap[phrase] = (freqMap[phrase] || 0) + 3; // Higher boost
            }
        }
    }

    // 3. Deduplication Logic (Optional but recommended)
    // If "Machine Learning" exists, reduce count of "Machine" and "Learning"
    // so we don't spam the user with redundant words.
    Object.keys(freqMap).forEach(phrase => {
        const count = freqMap[phrase];
        if (phrase.includes(" ") && count > 1) {
            const parts = phrase.split(" ");
            parts.forEach(p => {
                if (freqMap[p]) {
                    freqMap[p] -= 1; // Decrease single word count
                    if (freqMap[p] <= 0) delete freqMap[p];
                }
            });
        }
    });

    // 4. Sort & Format
    const sortedKeywords = Object.keys(freqMap)
        .sort((a, b) => freqMap[b] - freqMap[a])
        .slice(0, 50); // Take top 50

    return sortedKeywords.join(', ');
};