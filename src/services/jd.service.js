import { STOP_WORDS } from '../utils/stopwords.js';

const cleanWord = (word) => {
    // Keep letters, numbers, +, #, and dot (for node.js, .net)
    // Remove trailing dots or commas
    return word.toLowerCase().replace(/[^a-z0-9\+\.#]/g, "").replace(/\.$/, "");
};

const isValidKeyword = (word) => {
    // Must be >1 char, not a number, and not a stop word
    return word && word.length > 1 && isNaN(word) && !STOP_WORDS.has(word);
};

export const extractKeywords = (text) => {
    if (!text) return "";

    const freqMap = {};

    // 1. Split into "Sentences" first (avoid crossing periods)
    // We split by . ! ? ; : and newlines
    const sentences = text.split(/[\.\!\?\;\:\n]+/);

    sentences.forEach(sentence => {
        // Tokenize sentence into words
        const tokens = sentence
            .trim()
            .split(/\s+/) // Split by spaces
            .map(t => cleanWord(t))
            .filter(t => t.length > 0);

        for (let i = 0; i < tokens.length; i++) {
            const w1 = tokens[i];

            // --- UNIGRAMS ---
            if (isValidKeyword(w1)) {
                freqMap[w1] = (freqMap[w1] || 0) + 1;
            }

            // --- BIGRAMS ---
            if (i < tokens.length - 1) {
                const w2 = tokens[i + 1];
                if (isValidKeyword(w1) && isValidKeyword(w2)) {
                    const phrase = `${w1} ${w2}`;
                    freqMap[phrase] = (freqMap[phrase] || 0) + 3; // Boost score
                }
            }

            // --- TRIGRAMS ---
            if (i < tokens.length - 2) {
                const w2 = tokens[i + 1];
                const w3 = tokens[i + 2];
                if (isValidKeyword(w1) && isValidKeyword(w2) && isValidKeyword(w3)) {
                    const phrase = `${w1} ${w2} ${w3}`;
                    freqMap[phrase] = (freqMap[phrase] || 0) + 5; // Higher boost
                }
            }
        }
    });

    // 2. Aggressive Deduplication
    // If "large language models" exists, we don't want "language models" cluttering the list
    const phrases = Object.keys(freqMap);
    
    // Sort phrases by length (longest first) to process supersets first
    phrases.sort((a, b) => b.length - a.length);

    const finalMap = { ...freqMap };

    phrases.forEach(phrase => {
        if (!finalMap[phrase]) return; // Already deleted

        // If this phrase is a 2 or 3 word phrase
        if (phrase.includes(" ")) {
            const parts = phrase.split(" ");
            
            // Delete the individual words if the phrase is stronger
            parts.forEach(p => {
                if (finalMap[p] && finalMap[p] <= finalMap[phrase]) {
                    delete finalMap[p];
                }
            });

            // Also check for sub-phrases (e.g., remove "language models" if "large language models" exists)
            // This is O(N^2) but N is small (top 50-100 candidates)
            phrases.forEach(sub => {
                if (sub !== phrase && phrase.includes(sub) && finalMap[sub]) {
                    // Only remove if the sub-phrase count is roughly the same (meaning it only appears as part of the main phrase)
                    // If "Java" appears 10 times but "Java Developer" appears 1 time, keep "Java".
                    if (finalMap[sub] <= finalMap[phrase] + 2) { 
                        delete finalMap[sub];
                    }
                }
            });
        }
    });

    // 3. Sort by Score and return Top 40
    return Object.keys(finalMap)
        .sort((a, b) => finalMap[b] - finalMap[a])
        .slice(0, 40)
        .join(', ');
};