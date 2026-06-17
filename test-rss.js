const Parser = require('rss-parser');
const parser = new Parser();

async function test() {
  const query = "Khan Sir";
  // Encode query and sites
  const q = encodeURIComponent(`${query} (site:ndtv.com OR site:aajtak.in OR site:news18.com OR site:news24online.com)`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
  
  try {
    const feed = await parser.parseURL(url);
    console.log("Found:", feed.items.length);
    feed.items.slice(0, 3).forEach(item => {
      console.log(item.title);
      console.log(item.link);
    });
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
