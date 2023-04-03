import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send({ message: "This is the Fireduino API!" });
});

app.listen(port, () => {
  console.log(`Fireduino API is listening on port ${port}`);
});