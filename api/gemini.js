import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function (Node.js)
// We use the Node.js runtime as it offers better compatibility with external SDKs compared to Edge.

export default async function handler(req, res) {
  // 1. CORS Headers - Allow requests from your frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, language } = req.body;
    
    // 4. API Key Check
    // IMPORTANT: Ensure API_KEY is set in Vercel Project Settings > Environment Variables
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("CRITICAL: API_KEY is missing in Vercel Environment Variables.");
      return res.status(500).json({ error: 'Server Configuration Error: API_KEY missing' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";
    
    let contents = "";
    let tools = [];

    // --- PROMPT GENERATION ---
    if (type === 'news') {
        const langPrompt = language === 'np' 
          ? "IMPORTANT: Provide the output strictly in Nepali language (Devanagari script)."
          : "Provide the output in English.";
        
        contents = `Find the absolute latest news (last 24-48 hours) regarding the political situation and upcoming elections in Nepal. 
          Focus on major parties. Identify ONE major "Hot Topic".
          ${langPrompt}
          Format output:
          HOT_TOPIC: [Topic]
          ---
          HEADLINE: [Title]
          SUMMARY: [Summary]
          SOURCE: [Source]
          (Provide 5 items)`;
        
        tools = [{ googleSearch: {} }];
    } 
    else if (type === 'parties') {
        const langPrompt = language === 'np' ? "Output in Nepali." : "Output in English.";
        contents = `For these parties: Nepali Congress, CPN (UML), Maoist Centre, RSP, RPP. 
        Provide 1-sentence ideology (DESC) and 1-sentence latest election stance (STANCE).
        ${langPrompt}
        Format:
        PARTY: [English Name]
        DESC: [Text]
        STANCE: [Text]`;
        
        tools = [{ googleSearch: {} }];
    } 
    else if (type === 'horoscope') {
        const langInstruction = language === 'np' ? "Names and prediction in Nepali." : "Names and prediction in English.";
        contents = `Daily horoscope for today (${new Date().toDateString()}). ${langInstruction}
        Format:
        SIGN: [Name]
        PREDICTION: [One sentence]
        ICON: [Emoji]`;
    }

    // 5. Call Gemini API
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { 
        tools, 
        temperature: 0.3 
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // 6. Return Success
    res.status(200).json({ text, groundingChunks });

  } catch (error) {
    console.error("Vercel Backend Error:", error);
    // Return explicit error message to frontend
    res.status(500).json({ 
      error: error.message || "Internal Server Error", 
      details: "Check Vercel Function Logs" 
    });
  }
}