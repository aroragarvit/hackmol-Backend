require("dotenv").config();

const express = require("express");
const { MongoClient } = require("mongodb");
const port = process.env.PORT;
const host = process.env.HOST;
const dbUrl = process.env.DB_URL;

const { Connect, run } = require("./utils/connect");
const app = express();
const client = new MongoClient(dbUrl);

const server = app.listen(port, async () => {
  console.log(server.address);
  const host = server.address().address;
  const port = server.address().port;
  console.log("Server is running on port " + port + "on host " + host);
  await Connect(client);
  await run(client);
});

app.use("/", (req, res) => {
  res.status(300).send("Hello JavaTpoint!");
});
//
