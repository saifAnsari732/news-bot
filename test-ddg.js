const { search } = require('duck-duck-scrape');

async function test() {
  const query = "Khan Sir (site:ndtv.com OR site:aajtak.in OR site:news18.com OR site:news24online.com)";
  try {
    const searchResults = await search(query);
    console.log("Results length:", searchResults.results.length);
    if(searchResults.results.length > 0) {
      console.log(searchResults.results[0].title);
      console.log(searchResults.results[0].url);
      console.log(searchResults.results[0].description);
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
