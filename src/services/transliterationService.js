// Simple transliteration mapping for common Abhang app terms
const commonMappings = {
    // Sants
    'tukaram': 'तुकाराम',
    'dnyaneshwar': 'ज्ञानेश्वर',
    'namdev': 'नामदेव',
    'eknath': 'एकनाथ',
    'chokhamela': 'चोखामेळा',
    'janabai': 'जनाबाई',
    'tukoba': 'तुकोबा',
    'mauli': 'माऊली',
    'gyaneshwar': 'ज्ञानेश्वर',
    'nyaneshwar': 'ज्ञानेश्वर',
    'sopandev': 'सोपानदेव',
    'muktabai': 'मुक्ताबाई',
    'savata': 'सावता',
    'mali': 'माळी',
    'gora': 'गोरा',
    'kumbhar': 'कुंभार',
    'narhari': 'नरहरी',
    'sonara': 'सोनार',
    'sen': 'सेना',
    'nhavi': 'न्हावी',
    'kanhopatra': 'कान्होपात्रा',
    'bahinabai': 'बहिणाबाई',
    'nilobaraya': 'निलोबाराय',
    'samarth': 'समर्थ',
    'ramdas': 'रामदास',
    'gajanan': 'गजानन',
    'maharaj': 'महाराज',
    'sai': 'साई',
    'baba': 'बाबा',
    'swami': 'स्वामी',

    // Categories / Topics
    'abhang': 'अभंग',
    'gavlani': 'गवळणी',
    'gavlan': 'गवळणी',
    'bharud': 'भारूड',
    'aarti': 'आरती',
    'arti': 'आरती',
    'bhajan': 'भजन',
    'haripath': 'हरिपाठ',
    'shlok': 'श्लोक',
    'stotra': 'स्तोत्र',
    'pasaydan': 'पसायदान',
    'kakad': 'काकड',
    'shej': 'शेज',
    'bhupali': 'भूपाळी',
    'virani': 'विराणी',
    'palna': 'पाळणा',

    // Common words
    'vitthal': 'विठ्ठल',
    'pandurang': 'पांडुरंग',
    'hari': 'हरी',
    'dev': 'देव',
    'sant': 'संत',
    'majha': 'माझा',
    'tujha': 'तुझा',
    'krup': 'कृपा',
    'rup': 'रूप',
    'naam': 'नाम',
    'vithoba': 'विठोबा',
    'pandharpur': 'पंढरपूर',
    'chandrabhaga': 'चंद्रभागा',
    'indrayani': 'इंद्रायणी',
    'dehu': 'देहू',
    'alandi': 'आळंदी',
    'wari': 'वारी',
    'warkari': 'वारकरी',
    'ekadashi': 'एकादशी',
    'ashadhi': 'आषाढी',
    'kartiki': 'कार्तिकी'
};

export const transliterationService = {
    // Convert English input to Marathi based on mappings
    transliterate: (input) => {
        if (!input) return '';

        const lowerInput = input.toLowerCase().trim();

        // Direct mapping check
        if (commonMappings[lowerInput]) {
            return commonMappings[lowerInput];
        }

        // Check if input contains mapped words
        let transliterated = lowerInput;
        Object.keys(commonMappings).forEach(key => {
            if (transliterated.includes(key)) {
                transliterated = transliterated.replace(new RegExp(key, 'g'), commonMappings[key]);
            }
        });

        return transliterated;
    },

    // Get search keywords (original + transliterated)
    getSearchKeywords: (input) => {
        if (!input) return [];

        const original = input.toLowerCase().trim();
        const marathi = transliterationService.transliterate(input);

        // Return unique non-empty keywords
        return [...new Set([original, marathi])].filter(k => k);
    }
};
