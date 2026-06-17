import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const titleParam = searchParams.get('title');
    const summaryParam = searchParams.get('summary');
    const imageParam = searchParams.get('image');

    if (!url) {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const isIframeFriendly = url.includes('ndtv.com') || url.includes('news18.com') || url.includes('abplive.com');
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Return the real news summary as fallback instead of crashing
      return NextResponse.json({
        title: titleParam || "Article Protected by Publisher",
        image: imageParam || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000",
        content: (summaryParam || "This news publisher has strict firewall security settings that prevent our AI from extracting the text automatically.") + "\n\nTo read the rest of the story, please click the button below to view it directly on their official website.",
        originalUrl: url,
        useIframe: isIframeFriendly
      });
    }

    const html = await response.text();
    
    // Check for Cloudflare / Anti-Bot challenge pages
    if (html.includes('Cloudflare') || html.includes('Just a moment...') || html.includes('Enable JavaScript and cookies to continue')) {
      return NextResponse.json({
        title: titleParam || "Article Protected by Publisher",
        image: imageParam || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000",
        content: (summaryParam || "This news publisher has strict firewall security settings that prevent our AI from extracting the text automatically.") + "\n\nTo read the rest of the story, please click the button below to view it directly on their official website.",
        originalUrl: url,
        useIframe: isIframeFriendly
      });
    }

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
