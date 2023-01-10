async function Connect(client) {
  try {
    await client.connect();
    console.log("Connected correctly to server");
  } catch (err) {
    console.log(err.stack);
  }
}

async function run(client) {
  try {
    const database = client.db("sample_airbnb");
    const movies = database.collection("listingsAndReviews");
    // query for a movie that has the title 'Back to the Future'
    const query = { name: "Ribeira Charming Duplex" };
    const movie = await movies.findOne(query);
    console.log(movie);
  } catch (err) {
    console.log(err.stack);
  }
  // Query for a movie that has the title 'Back to the Future'
}

const functions = {
  Connect: Connect,
  run: run,
};
module.exports = functions;
// add package.json to git ignore
