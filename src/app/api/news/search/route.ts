import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Parser from 'rss-parser';
import connectToDatabase from '@/lib/mongodb';
import { Search } from '@/models/Search';
import { Report } from '@/models/Report';

export async function POST(req: Request) {
  try {
    // 1. Auth check (Pseudo-check for now, we will add authOptions later)
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    // For now we will allow it to proceed and just use a dummy user id if session is not hooked up
    // In production we enforce session!
    const { query, userId } = await req.json(); // userId from client for now, or session later

    if (!query) {
      return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    await connectToDatabase();

    // 2. Perform Web Search using Bing News RSS (bypasses blocks, provides real images & URLs)
    const parser = new Parser({
      customFields: {
        item: [
          ['News:Image', 'imageUrl']
        ]
      }
    });

    const encodedQuery = encodeURIComponent(`${query}`);
    const rssUrlEn = `https://www.bing.com/news/search?q=${encodedQuery}+India&format=rss&mkt=en-in`;
    const rssUrlHi = `https://www.bing.com/news/search?q=${encodedQuery}+Hindi+News&format=rss&mkt=en-in`;
    
    const [feedEn, feedHi] = await Promise.all([
      parser.parseURL(rssUrlEn).catch(() => ({ items: [] })),
      parser.parseURL(rssUrlHi).catch(() => ({ items: [] }))
    ]);
    
    const combinedItems = [];
    const maxLength = Math.max(feedEn.items.length, feedHi.items.length);
    for (let i = 0; i < maxLength; i++) {
      if (feedEn.items[i]) combinedItems.push(feedEn.items[i]);
      if (feedHi.items[i]) combinedItems.push(feedHi.items[i]);
    }
    
    // Normalize links and images
    combinedItems.forEach(item => {
      if (item.link && item.link.includes('url=')) {
        try {
          const urlParam = new URL(item.link).searchParams.get('url');
          if (urlParam) item.link = decodeURIComponent(urlParam);
        } catch(e) {}
      }
      if (item.imageUrl && item.imageUrl.startsWith('/th?')) {
        item.imageUrl = 'https://www.bing.com' + item.imageUrl;
      }
    });

    let searchContext = combinedItems.slice(0, 15).map((r: any) => `
      Title: ${r.title}
      URL: ${r.link}
      Description: ${r.contentSnippet || r.description || ''}
    `).join('\n\n');

    if (!searchContext || searchContext.trim() === '') {
      searchContext = "No results found from the search. Do not generate fake links.";
    }

    // 3. Formulate Prompt for Gemini
    const prompt = `
      You are "NewsGPT Pro", an expert AI News Research Agent.
      Your responsibility is to analyze the following web search results and generate a professional news report.
      
      Topic/Query: "${query}"
      
      Search Context:
      ${searchContext}
      
      Requirements:
      - Verify information using the provided search context. Mention uncertainty if facts conflict.
      - Prioritize information and citations from Indian news platforms: Aaj Tak, News24, BharatNews AI, IndiaPulse, NewsSutra, NewsDarpan, TruthLens AI, VeriNews AI, FactPulse AI, IndiaScope, Bharat Insight, PulseWire, NDTV, and News18.
      - Generate SEO-friendly content.
      - Keep a journalistic, professional, and neutral tone.
      - Never fabricate statistics.
      - You MUST extract exactly 3 to 5 distinct news articles from the Search Context.
      - EXTREMELY IMPORTANT: For each article, the 'sourceLink' MUST be the EXACT working URL provided in the Search Context. DO NOT guess, fabricate, or hallucinate URLs. If an article doesn't have a valid URL in the context, do not include it.
      - Keep all text fields VERY CONCISE (1-2 sentences maximum) EXCEPT for 'newsItems.summary'. The 'newsItems.summary' should be a proper, detailed description (3-5 sentences) of the news article. This ensures the output fits within strict token limits while still providing rich news context.
      
      Output strictly as a JSON object with the following structure (no markdown formatting outside the JSON, just pure JSON):
      {
        "headline": "SEO-friendly title",
        "breakingSummary": "50-100 word summary",
        "newsItems": [
          {
            "headline": "Article Headline",
            "summary": "Detailed summary of this specific article (3-5 sentences)",
            "sourceLink": "Exact URL from Search Context"
          }
        ],
        "category": "One of: Technology, AI, Politics, Finance, Business, Startup, Health, Science, Sports, Entertainment, Education, India, World, Crypto, Cybersecurity, Environment",
        "seo": {
          "metaTitle": "...", "metaDescription": "...", "slug": "...", "keywords": ["kw1", "kw2"]
        },
        "sources": [ {"name": "Source Name", "url": "Source URL", "type": "Official/Major Media/Industry/Other"} ],
        "reliability": { "score": 80, "status": "Verified / Partially Verified / Unverified" }
      }
    `;

    // 4. Call OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const aiResponseJson = await openRouterResponse.json();
    const aiResponseText = aiResponseJson.choices?.[0]?.message?.content;
    
    if (!aiResponseText) {
      console.error("OpenRouter Error Payload:", JSON.stringify(aiResponseJson, null, 2));
      throw new Error(`OpenRouter API failed or timed out. Detail: ${aiResponseJson?.error?.message || "Unknown error"}`);
    }

    let cleanedText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    // Strip unescaped control characters (literal newlines, tabs) that break JSON.parse
    cleanedText = cleanedText.replace(/[\n\r\t]/g, ' ');
    
    let reportData;
    try {
      reportData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parsing failed. Cleaned text snippet:", cleanedText.substring(0, 500));
      throw parseError;
    }

    // --- ATTACH REAL ARTICLE THUMBNAILS (FROM BING) ---
    if (reportData.newsItems && Array.isArray(reportData.newsItems)) {
      reportData.newsItems.forEach((item: any) => {
        // Find the matching article in our Bing search results to grab the high-quality image
        const match = combinedItems.find(r => r.link === item.sourceLink);
        if (match && match.imageUrl) {
          item.imageUrl = match.imageUrl;
        }
      });
    }

    // 5. Save to Database
    // Note: in full implementation, verify userId exists. Using a dummy or from body if no session.
    let savedReport = null;
    if (userId) {
      // Save search log
      await Search.create({ userId, query });
      
      // Save report
      savedReport = await Report.create({
        userId,
        title: reportData.headline,
        summary: reportData.breakingSummary,
        report: reportData,
        seo: reportData.seo,
        sources: reportData.sources,
        reliability: reportData.reliability
      });
    }

    return NextResponse.json({ report: reportData, reportId: savedReport?._id }, { status: 200 });

  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ message: 'Error generating report', error: error.message }, { status: 500 });
  }
}
