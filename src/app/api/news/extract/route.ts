import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic metadata
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'No Title Found';
    const image = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    
    // Extract paragraphs (basic readable content extraction)
    // Remove unwanted elements first
    $('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share').remove();
    
    const paragraphs: string[] = [];
    $('p').each((i, el) => {
      const text = $(el).text().trim();
      // Filter out very short paragraphs that are likely UI text
      if (text.length > 40) {
        paragraphs.push(text);
      }
    });

    const content = paragraphs.join('\n\n');

    return NextResponse.json({
      title,
      image,
      content: content || 'Could not extract article content automatically. Please view the original source.',
      originalUrl: url
    });

  } catch (error: any) {
    console.error('Extraction API Error:', error);
    return NextResponse.json({ message: 'Failed to extract article', error: error.message }, { status: 500 });
  }
}
