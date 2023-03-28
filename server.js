const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("Fireduino API");
});

app.listen(port, () => {
  console.log("Fireduino API listening at port " + port + ".");
});
