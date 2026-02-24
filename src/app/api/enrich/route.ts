import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // 1. Scrape the public website
    const url = `https://${domain}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VC-Scout-Bot/1.0)" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Clean up scripts and styles to save AI tokens
    $('script, style, noscript, iframe, img, svg').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000); 

    // 2. AI Extraction
    const prompt = `
      You are a VC analyst AI. Analyze the following scraped website text from ${domain} and extract key information.
      Return ONLY a valid JSON object matching this exact structure:
      {
        "summary": "1-2 sentence summary of the company",
        "whatTheyDo": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
        "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
        "derivedSignals": ["signal 1", "signal 2", "signal 3"]
      }
      
      Website Text:
      ${textContent}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiData = JSON.parse(completion.choices[0].message.content || "{}");

    // 3. Return the payload matching the UI needs
    return NextResponse.json({
      summary: aiData.summary,
      whatTheyDo: aiData.whatTheyDo || [],
      keywords: aiData.keywords || [],
      derivedSignals: aiData.derivedSignals || [],
      sources: [
        { url, timestamp: new Date().toISOString() }
      ]
    });

  } catch (error: any) {
    console.error("Enrichment Error:", error);
    return NextResponse.json({ error: error.message || "Failed to enrich profile" }, { status: 500 });
  }
}