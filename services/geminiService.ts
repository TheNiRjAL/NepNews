import { NewsItem, Party, HoroscopeItem, Language } from "../types";

// --- MOCK DATA (Fallback for Localhost/Studio/Errors) ---
const MOCK_NEWS = {
  en: [
    { id: 'm1', title: "Election Date Announced", summary: "The Election Commission has finalized the schedule for the upcoming by-elections.", source: "Kathmandu Post", timestamp: "10:00 AM" },
    { id: 'm2', title: "Coalition Meeting Underway", summary: "Leaders of the ruling coalition are meeting at Baluwatar to discuss seat sharing.", source: "The Himalayan Times", timestamp: "11:30 AM" },
    { id: 'm3', title: "New Party Registration", summary: "RSP has opened registration for new candidates across 3 districts.", source: "OnlineKhabar", timestamp: "12:15 PM" }
  ],
  np: [
    { id: 'm1', title: "उपनिर्वाचनको मिति घोषणा", summary: "निर्वाचन आयोगले आगामी उपनिर्वाचनको कार्यतालिका सार्वजनिक गरेको छ।", source: "कान्तिपुर", timestamp: "१०:००" },
    { id: 'm2', title: "सत्ता गठबन्धनको बैठक सुरु", summary: "सिट बाँडफाँडको विषयमा छलफल गर्न शीर्ष नेताहरू बालुवाटारमा।", source: "अनलाइन खबर", timestamp: "११:३०" },
    { id: 'm3', title: "रास्वपाको उम्मेदवारी दर्ता", summary: "राष्ट्रिय स्वतन्त्र पार्टीले ३ जिल्लामा उम्मेदवारी दर्ता खोलेको छ।", source: "रातोपाटी", timestamp: "१२:१५" }
  ]
};

// --- API FETCH LOGIC ---

const fetchFromApi = async (type: 'news' | 'parties' | 'horoscope', language: Language) => {
  try {
    console.log(`[Network] Fetching ${type} from /api/gemini...`);
    
    // Use relative path - works automatically on Vercel
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, language }),
    });

    // Handle 404 (API not found) - Common in Localhost/Studio without Vercel CLI
    if (response.status === 404) {
      console.warn("[Network] /api/gemini not found (404). Assuming Local/Preview mode. Using Mock Data.");
      return null; // Return null to trigger mock
    }

    // Handle 500+ (Server Error)
    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Network] API Error ${response.status}:`, errText);
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) throw new Error("Received empty data from API");
    
    return data;

  } catch (error: any) {
    // Handle Offline / Network Failure
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error("[Network] Connection Failed. The device might be offline.");
        throw new Error("No Internet Connection");
    }
    
    console.error("[Network] Fetch Exception:", error);
    throw error;
  }
};

// --- EXPORTED FUNCTIONS ---

export const fetchLatestNews = async (language: Language): Promise<{ news: NewsItem[], hotTopic?: string }> => {
  const isNp = language === 'np';
  
  try {
    const data = await fetchFromApi('news', language);

    // If data is null, it means 404/Local mode -> Show Mock
    if (!data) {
        return { news: MOCK_NEWS[language], hotTopic: isNp ? "मोक डाटा (प्रिभ्यु मोड)" : "Mock Data (Preview Mode)" };
    }
    
    const lines = data.text.split('\n');
    let hotTopic = isNp ? "निर्वाचन अपडेट" : "Election Updates";
    const news: NewsItem[] = [];
    let current: Partial<NewsItem> = {};
    
    lines.forEach((line: string) => {
      const clean = line.trim();
      if (clean.startsWith('HOT_TOPIC:')) hotTopic = clean.replace('HOT_TOPIC:', '').trim();
      else if (clean.startsWith('HEADLINE:')) {
        if (current.title) news.push(current as NewsItem);
        current = { id: Math.random().toString(36).substr(2, 9), title: clean.replace('HEADLINE:', '').trim(), timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
      }
      else if (clean.startsWith('SUMMARY:')) if (current) current.summary = clean.replace('SUMMARY:', '').trim();
      else if (clean.startsWith('SOURCE:')) if (current) current.source = clean.replace('SOURCE:', '').trim();
    });
    if (current.title) news.push(current as NewsItem);
    
    const chunks = data.groundingChunks || [];
    news.forEach((item, index) => {
        if (index < chunks.length && chunks[index].web?.uri) item.url = chunks[index].web?.uri;
    });

    return { news, hotTopic };

  } catch (error: any) {
    // Fallback for real errors (No Internet, 500, etc)
    const isNetworkError = error.message === "No Internet Connection";
    
    return { 
      news: [{ 
          id: 'err', 
          title: isNp ? 'जडान त्रुटि' : 'Connection Error', 
          summary: isNetworkError 
            ? (isNp ? 'इन्टरनेट जडान छैन। कृपया जाँच गर्नुहोस्।' : 'No internet connection. Please check your network.')
            : (isNp ? 'सर्भरमा समस्या आयो।' : 'Service temporarily unavailable.'),
          source: 'System', 
          timestamp: new Date().toLocaleTimeString() 
      }], 
      hotTopic: 'Error' 
    };
  }
};

export const fetchPartyInsights = async (language: Language): Promise<Party[]> => {
    const isNp = language === 'np';
    const baseParties = [
        { name: "Nepali Congress", nameNp: "नेपाली कांग्रेस", fullName: "Nepali Congress", fullNameNp: "नेपाली कांग्रेस", symbol: "🌳", color: "bg-green-600", imageUrl: "" },
        { name: "CPN (UML)", nameNp: "नेकपा (एमाले)", fullName: "CPN (UML)", fullNameNp: "नेकपा (एमाले)", symbol: "☀️", color: "bg-red-600", imageUrl: "" },
        { name: "Maoist Centre", nameNp: "माओवादी केन्द्र", fullName: "CPN (Maoist)", fullNameNp: "नेकपा (माओवादी)", symbol: "☭", color: "bg-red-800", imageUrl: "" },
        { name: "RSP", nameNp: "रास्वपा", fullName: "Rastriya Swatantra Party", fullNameNp: "राष्ट्रिय स्वतन्त्र पार्टी", symbol: "🔔", color: "bg-blue-500", imageUrl: "" },
        { name: "RPP", nameNp: "राप्रपा", fullName: "Rastriya Prajatantra Party", fullNameNp: "राष्ट्रिय प्रजातन्त्र पार्टी", symbol: "🚜", color: "bg-yellow-500", imageUrl: "" },
    ];

    try {
        const data = await fetchFromApi('parties', language);
        
        if (!data) {
             // Mock Data Return
             return baseParties.map((p, i) => ({
                id: `party-${i}`, ...p,
                name: isNp ? p.nameNp : p.name, fullName: isNp ? p.fullNameNp : p.fullName,
                leader: "", description: isNp ? "नमूना विवरण (प्रिभ्यु)" : "Preview Data",
                recentStance: isNp ? "नमूना अडान" : "Preview Stance", imageUrl: `https://picsum.photos/seed/${p.name}/400/300`
            }));
        }

        const partyData: Record<string, any> = {};
        let currentParty = "";
        data.text.split('\n').forEach((line: string) => {
            const clean = line.trim();
            if (clean.startsWith('PARTY:')) currentParty = clean.replace('PARTY:', '').trim();
            else if (clean.startsWith('DESC:') && currentParty) {
                if (!partyData[currentParty]) partyData[currentParty] = {};
                partyData[currentParty].desc = clean.replace('DESC:', '').trim();
            }
            else if (clean.startsWith('STANCE:') && currentParty) {
                if (!partyData[currentParty]) partyData[currentParty] = {};
                partyData[currentParty].stance = clean.replace('STANCE:', '').trim();
            }
        });

        return baseParties.map((p, i) => {
            const key = Object.keys(partyData).find(k => k.includes(p.name) || p.name.includes(k));
            const info = key ? partyData[key] : { desc: "", stance: "" };
            return {
                id: `party-${i}`, ...p,
                name: isNp ? p.nameNp : p.name, fullName: isNp ? p.fullNameNp : p.fullName,
                leader: "", 
                description: info.desc || "...",
                recentStance: info.stance || "...",
                imageUrl: `https://picsum.photos/seed/${p.name}/400/300`
            };
        });
    } catch (e) {
        // Return base parties with error state
        return baseParties.map((p, i) => ({
             id: `party-${i}`, ...p, name: isNp ? p.nameNp : p.name, fullName: isNp ? p.fullNameNp : p.fullName, leader: "", description: "Failed to load", recentStance: "Retry later", imageUrl: ""
        }));
    }
};

export const fetchDailyHoroscope = async (language: Language): Promise<HoroscopeItem[]> => {
    try {
        const data = await fetchFromApi('horoscope', language);
        if (!data) return []; 

        const horoscopes: HoroscopeItem[] = [];
        let current: Partial<HoroscopeItem> = {};
        data.text.split('\n').forEach((line: string) => {
            const clean = line.trim();
            if (clean.startsWith('SIGN:')) {
                if (current.sign) horoscopes.push(current as HoroscopeItem);
                current = { sign: clean.replace('SIGN:', '').trim() };
            } else if (clean.startsWith('PREDICTION:')) if(current) current.prediction = clean.replace('PREDICTION:', '').trim();
            else if (clean.startsWith('ICON:')) if(current) current.icon = clean.replace('ICON:', '').trim();
        });
        if (current.sign) horoscopes.push(current as HoroscopeItem);
        return horoscopes;
    } catch (e) {
        return [];
    }
};