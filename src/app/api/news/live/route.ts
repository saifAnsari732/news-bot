import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

const CHANNELS = [
  { id: 'ndtv', name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories' },
  { id: 'news18', name: 'News18', url: 'https://www.news18.com/rss/india.xml' },
  { id: 'hindustantimes', name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml' },
  { id: 'timesofindia', name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms' },
  { id: 'abp', name: 'ABP News (Hindi)', url: 'https://www.abplive.com/home/feed' },
  { id: 'aajtak', name: 'Aaj Tak', url: 'https://www.bing.com/news/search?q=site:aajtak.in&format=rss' }
];

export async function GET() {
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'mediaContent', { keepArray: true }],
          ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
          ['News:Image', 'newsImage'],
          ['description', 'description']
        ]
      }
    });

    const fetchFeed = async (channel: typeof CHANNELS[0]) => {
      try {
        const feed = await parser.parseURL(channel.url);
        // Remove the slice limit so we fetch a massive amount of news
        return feed.items.map(item => {
          // Extract Image URL robustly
          let imageUrl = null;
          if (item.enclosure?.url) {
            imageUrl = item.enclosure.url;
          } else if (item.newsImage) {
            imageUrl = item.newsImage.startsWith('/th?') ? 'https://www.bing.com' + item.newsImage : item.newsImage;
          } else if (item.mediaThumbnail && item.mediaThumbnail.length > 0 && item.mediaThumbnail[0].$) {
            imageUrl = item.mediaThumbnail[0].$.url;
          } else if (item.mediaContent && item.mediaContent.length > 0 && item.mediaContent[0].$) {
            imageUrl = item.mediaContent[0].$.url;
          } else if (item.content || item.description) {
            // Regex to find first image tag
            const html = item.content || item.description || '';
            const match = html.match(/<img[^>]+src="([^">]+)"/);
            if (match) imageUrl = match[1];
          }

          // Clean title and description
          const cleanHtml = (str: string) => str ? str.replace(/<[^>]*>?/gm, '').trim() : '';

          let finalLink = item.link;
          if (finalLink && finalLink.includes('url=')) {
            try {
              const urlParam = new URL(finalLink).searchParams.get('url');
              if (urlParam) finalLink = decodeURIComponent(urlParam);
            } catch(e) {}
          }

          return {
            id: item.guid || (item as any).id || item.link,
            title: cleanHtml(item.title || ''),
            link: finalLink,
            summary: cleanHtml(item.contentSnippet || item.description || ''),
            pubDate: item.pubDate,
            imageUrl: imageUrl,
            channelId: channel.id,
            channelName: channel.name
          };
        });
      } catch (err) {
        console.error(`Failed to fetch RSS for ${channel.name}:`, err);
        return [];
      }
    };

    const results = await Promise.all(CHANNELS.map(fetchFeed));
    
    // Flatten and sort by pubDate descending
    const allNews = results.flat().sort((a, b) => {
      const dateA = new Date(a.pubDate || 0).getTime();
      const dateB = new Date(b.pubDate || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ news: allNews });
  } catch (error: any) {
    console.error('Live News API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch live news', error: error.message }, { status: 500 });
  }
}
