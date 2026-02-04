import { NewsItem, Party, HoroscopeItem, Language } from "../types";

// Helper to fetch from our Netlify function
const fetchFromProxy = async (type: 'news' | 'parties' | 'horoscope', language: Language) => {
  try {
    const response = await fetch('/.netlify/functions/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, language }),
    });

    if (!response.ok) {
        // Attempt to parse error message from server
        let serverError = "API Error";
        try {
            const errJson = await response.json();
            serverError = errJson.error || response.statusText;
        } catch (e) {
            serverError = response.statusText;
        }
        throw new Error(serverError);
    }

    return await response.json();

  } catch (error: any) {
    // Distinguish errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
};

export const fetchLatestNews = async (language: Language): Promise<{ news: NewsItem[], hotTopic?: string }> => {
  const isNp = language === 'np';
  try {
    const data = await fetchFromProxy('news', language);
    return data;
  } catch (error: any) {
    console.error("News Fetch Error:", error);
    
    let title = isNp ? 'सिस्टम अपडेट' : 'System Update';
    let summary = isNp ? 'समाचार लोड गर्न समस्या भयो।' : 'Unable to load news.';
    let hotTopic = isNp ? 'जडान समस्या' : 'Connection Issue';

    if (error.message === 'NETWORK_ERROR') {
        title = isNp ? 'इन्टरनेट छैन' : 'No Internet';
        summary = isNp ? 'कृपया जडान जाँच गर्नुहोस्।' : 'Please check your internet connection.';
    } else {
        // API or Server Error
        summary = isNp ? 'सर्भरमा समस्या आयो। केही समयपछि प्रयास गर्नुहोस्।' : 'Server error. Please try again later.';
    }

    return { 
      news: [{
        id: 'error-1',
        title,
        summary,
        source: 'System',
        timestamp: new Date().toLocaleTimeString()
      }], 
      hotTopic
    };
  }
};

export const fetchPartyInsights = async (language: Language): Promise<Party[]> => {
    const isNp = language === 'np';
    const baseParties = [
        { 
            name: "Nepali Congress", 
            nameNp: "नेपाली कांग्रेस",
            fullName: "Nepali Congress",
            fullNameNp: "नेपाली कांग्रेस",
            symbol: "🌳", 
            color: "bg-green-600", 
            imageUrl: "https://picsum.photos/id/1018/400/300" 
        },
        { 
            name: "CPN (UML)", 
            nameNp: "नेकपा (एमाले)",
            fullName: "Communist Party of Nepal (Unified Marxist–Leninist)",
            fullNameNp: "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी-लेनिनवादी)",
            symbol: "☀️", 
            color: "bg-red-600", 
            imageUrl: "https://picsum.photos/id/1015/400/300" 
        },
        { 
            name: "Maoist Centre", 
            nameNp: "माओवादी केन्द्र",
            fullName: "CPN (Maoist Centre)",
            fullNameNp: "नेकपा (माओवादी केन्द्र)",
            symbol: "☭", 
            color: "bg-red-800", 
            imageUrl: "https://picsum.photos/id/1033/400/300" 
        },
        { 
            name: "RSP", 
            nameNp: "रास्वपा",
            fullName: "Rastriya Swatantra Party",
            fullNameNp: "राष्ट्रिय स्वतन्त्र पार्टी",
            symbol: "🔔", 
            color: "bg-blue-500", 
            imageUrl: "https://picsum.photos/id/1025/400/300" 
        },
        { 
            name: "RPP", 
            nameNp: "राप्रपा",
            fullName: "Rastriya Prajatantra Party",
            fullNameNp: "राष्ट्रिय प्रजातन्त्र पार्टी",
            symbol: "🚜", 
            color: "bg-yellow-500", 
            imageUrl: "https://picsum.photos/id/1040/400/300" 
        },
    ];

    try {
        const partyData = await fetchFromProxy('parties', language);
        
        return baseParties.map((p, i) => {
            const key = Object.keys(partyData).find(k => k.includes(p.name) || p.name.includes(k));
            const data = key ? partyData[key] : { 
                desc: isNp ? "विवरण उपलब्ध छैन।" : "Details unavailable.", 
                stance: isNp ? "जानकारी छैन।" : "No info available." 
            };
            
            return {
                id: `party-${i}`,
                ...p,
                name: isNp ? p.nameNp : p.name,
                fullName: isNp ? p.fullNameNp : p.fullName,
                leader: "Loading...", 
                description: data.desc || "",
                recentStance: data.stance || "",
            };
        });
    } catch (e) {
        console.error("Party Fetch Error:", e);
        return baseParties.map((p, i) => ({
             id: `party-${i}`,
             ...p,
             name: isNp ? p.nameNp : p.name,
             fullName: isNp ? p.fullNameNp : p.fullName,
             leader: "Unknown",
             description: isNp ? "विवरण लोड गर्न सकिएन।" : "Failed to load details.",
             recentStance: isNp ? "पछि प्रयास गर्नुहोस्।" : "Check back later.",
        }));
    }
};

export const fetchDailyHoroscope = async (language: Language): Promise<HoroscopeItem[]> => {
    try {
        const data = await fetchFromProxy('horoscope', language);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Horoscope Fetch Error:", e);
        return [];
    }
};