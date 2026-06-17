const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNDTV(query) {
  try {
    const res = await axios.get(`https://www.ndtv.com/search?searchtext=${encodeURIComponent(query)}`);
    const $ = cheerio.load(res.data);
    const results = [];
    $('.src_itm').each((i, el) => {
      if (i >= 3) return; // limit
      const title = $(el).find('.src_itm-ttl a').text().trim();
      const url = $(el).find('.src_itm-ttl a').attr('href');
      const desc = $(el).find('.src_itm-txt').text().trim();
      if (title && url) results.push({ title, url, description: desc });
    });
    return results;
  } catch (e) {
    console.error("NDTV Error:", e.message);
    return [];
  }
}

async function scrapeNews18(query) {
  try {
    const res = await axios.get(`https://www.news18.com/search/${encodeURIComponent(query)}/`);
    const $ = cheerio.load(res.data);
    const results = [];
    $('.search-result-list li').each((i, el) => {
      if (i >= 3) return;
      const title = $(el).find('h2 a').text().trim();
      const url = $(el).find('h2 a').attr('href');
      const desc = $(el).find('p').text().trim();
      if (title && url) results.push({ title, url, description: desc });
    });
    return results;
  } catch (e) {
    console.error("News18 Error:", e.message);
    return [];
  }
}

async function test() {
  const q = "Khan Sir";
  console.log("NDTV:");
  console.log(await scrapeNDTV(q));
  console.log("News18:");
  console.log(await scrapeNews18(q));
}
test();
