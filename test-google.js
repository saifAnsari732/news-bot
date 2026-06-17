const google = require('googlethis');

async function test() {
  const query = "Khan Sir";
  const options = {
    page: 0, 
    safe: false, 
    additional_params: { hl: 'en', gl: 'in' }
  };
  
  try {
    const res = await google.search(`${query}`, options);
    console.log("Results:", res.results.length);
    if(res.results.length > 0) {
      console.log(res.results[0].title);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
