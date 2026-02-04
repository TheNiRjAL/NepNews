import { GoogleGenAI } from "@google/genai";
import { NewsItem, Party, HoroscopeItem, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use gemini-3-flash-preview for fast, grounded responses
const MODEL_NAME = "gemini-3-flash-preview";

export const fetchLatestNews = async (language: Language): Promise<{ news: NewsItem[], hotTopic?: string }> => {
  try {
    const langPrompt = language === 'np' 
      ? "IMPORTANT: Provide the output strictly in Nepali language (Devanagari script). Translate all headlines, summaries, and the hot topic."
      : "Provide the output in English.";

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Find the absolute latest news (last 24-48 hours) regarding the political situation and upcoming elections in Nepal. 
      Focus on major parties (NC, UML, Maoist, RSP, RPP). 
      Also, identify ONE major "Hot Topic" or controversy currently trending.
      
      ${langPrompt}
      
      Format the output strictly as follows:
      HOT_TOPIC: [The hot topic summary]
      ---
      HEADLINE: [News Title 1]
      SUMMARY: [Brief summary of news 1]
      SOURCE: [Source Name]
      ---
      HEADLINE: [News Title 2]
      SUMMARY: [Brief summary of news 2]
      SOURCE: [Source Name]
      
      (Provide 5 news items)`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || "";
    
    // Parse the text manually since we can't use JSON schema with Search Grounding reliably in all cases yet
    // and we want to preserve the "freshness" from the grounding.
    
    const lines = text.split('\n');
    let hotTopic = language === 'np' ? "निर्वाचन अपडेट" : "Election Updates";
    const news: NewsItem[] = [];
    
    let currentNews: Partial<NewsItem> = {};
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('HOT_TOPIC:')) {
        hotTopic = cleanLine.replace('HOT_TOPIC:', '').trim();
      } else if (cleanLine.startsWith('HEADLINE:')) {
        if (currentNews.title) {
          news.push(currentNews as NewsItem);
        }
        currentNews = {
          id: Math.random().toString(36).substr(2, 9),
          title: cleanLine.replace('HEADLINE:', '').trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (cleanLine.startsWith('SUMMARY:')) {
        if (currentNews) currentNews.summary = cleanLine.replace('SUMMARY:', '').trim();
      } else if (cleanLine.startsWith('SOURCE:')) {
        if (currentNews) currentNews.source = cleanLine.replace('SOURCE:', '').trim();
      } else if (cleanLine === '---' && currentNews.title) {
         // Delimiter handling if needed, but the headline check covers it
      }
    });
    
    if (currentNews.title) {
      news.push(currentNews as NewsItem);
    }
    
    // Attempt to extract URLs from grounding chunks to attach to news items
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    // This is a rough mapping strategy: assign available chunks to news items sequentially
    // A production app would need smarter entity matching.
    news.forEach((item, index) => {
        if (index < chunks.length && chunks[index].web?.uri) {
            item.url = chunks[index].web?.uri;
        }
    });

    return { news, hotTopic };

  } catch (error) {
    console.error("Failed to fetch news:", error);
    const isNp = language === 'np';
    return { 
      news: [
        {
            id: 'error-1',
            title: isNp ? 'सिस्टम अपडेट' : 'System Update',
            summary: isNp ? 'यस समयमा प्रत्यक्ष समाचार ल्याउन असमर्थ। कृपया आफ्नो इन्टरनेट जाँच गर्नुहोस्।' : 'Unable to fetch live news at this moment. Please check your connection.',
            source: 'System',
            timestamp: new Date().toLocaleTimeString()
        }
      ], 
      hotTopic: isNp ? 'जडान समस्या' : 'Connection Issue' 
    };
  }
};

export const fetchPartyInsights = async (language: Language): Promise<Party[]> => {
    const isNp = language === 'np';
    
    // We will hardcode the base structure for stability and use AI to fetch the "Latest Stance"
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
        const langPrompt = isNp 
            ? "Write the DESC and STANCE in Nepali language (Devanagari script)." 
            : "Write the DESC and STANCE in English.";

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `For each of these political parties in Nepal: ${baseParties.map(p => p.name).join(', ')}. 
            Provide a 1-sentence description of their core ideology and a 1-sentence summary of their very latest stance or activity regarding the upcoming election.
            
            ${langPrompt}
            
            Format:
            PARTY: [Name in English]
            DESC: [Ideology]
            STANCE: [Latest Stance]
            ---`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text || "";
        const lines = text.split('\n');
        
        const partyData: Record<string, { desc: string, stance: string }> = {};
        let currentParty = "";

        lines.forEach(line => {
            const clean = line.trim();
            if (clean.startsWith('PARTY:')) currentParty = clean.replace('PARTY:', '').trim();
            else if (clean.startsWith('DESC:') && currentParty) {
                if (!partyData[currentParty]) partyData[currentParty] = { desc: '', stance: '' };
                partyData[currentParty].desc = clean.replace('DESC:', '').trim();
            }
            else if (clean.startsWith('STANCE:') && currentParty) {
                if (!partyData[currentParty]) partyData[currentParty] = { desc: '', stance: '' };
                partyData[currentParty].stance = clean.replace('STANCE:', '').trim();
            }
        });

        return baseParties.map((p, i) => {
            // Fuzzy match name
            const key = Object.keys(partyData).find(k => k.includes(p.name) || p.name.includes(k));
            const data = key ? partyData[key] : { 
                desc: isNp ? "नेपालको प्रमुख राजनीतिक शक्ति।" : "Major political force in Nepal.", 
                stance: isNp ? "आगामी निर्वाचनको तयारी गर्दै।" : "Preparing for upcoming elections." 
            };
            
            return {
                id: `party-${i}`,
                ...p,
                name: isNp ? p.nameNp : p.name,
                fullName: isNp ? p.fullNameNp : p.fullName,
                leader: "Loading...", 
                description: data.desc,
                recentStance: data.stance,
            };
        });

    } catch (e) {
        console.error("Error fetching party details", e);
        return baseParties.map((p, i) => ({
             id: `party-${i}`,
             ...p,
             name: isNp ? p.nameNp : p.name,
             fullName: isNp ? p.fullNameNp : p.fullName,
             leader: "Unknown",
             description: isNp ? "विवरण उपलब्ध छैन।" : "Details unavailable offline.",
             recentStance: isNp ? "पछि पुन: जाँच गर्नुहोस्।" : "Check back later.",
        }));
    }
};

export const fetchDailyHoroscope = async (language: Language): Promise<HoroscopeItem[]> => {
    try {
        const langInstruction = language === 'np' 
            ? "Provide the names of the signs in Nepali (Mesh, Brish, Mithun, Karkat, Simha, Kanya, Tula, Brishchik, Dhanu, Makar, Kumbha, Meen) and the prediction in Nepali." 
            : "Provide the names in English (Aries, Taurus, etc.) and prediction in English.";
            
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Generate a brief daily horoscope for today (${new Date().toDateString()}) for all 12 zodiac signs. 
            ${langInstruction}
            
            Format strictly as:
            SIGN: [Sign Name]
            PREDICTION: [One sentence prediction]
            ICON: [Emoji]
            ---`,
            config: {
                temperature: 0.7,
            }
        });

        const text = response.text || "";
        const lines = text.split('\n');
        const horoscopes: HoroscopeItem[] = [];
        let current: Partial<HoroscopeItem> = {};

        lines.forEach(line => {
            const clean = line.trim();
            if (clean.startsWith('SIGN:')) {
                if (current.sign) horoscopes.push(current as HoroscopeItem);
                current = { sign: clean.replace('SIGN:', '').trim() };
            } else if (clean.startsWith('PREDICTION:')) {
                if (current) current.prediction = clean.replace('PREDICTION:', '').trim();
            } else if (clean.startsWith('ICON:')) {
                if (current) current.icon = clean.replace('ICON:', '').trim();
            }
        });
        if (current.sign) horoscopes.push(current as HoroscopeItem);

        return horoscopes;
    } catch (e) {
        console.error("Error fetching horoscope", e);
        return [];
    }
};