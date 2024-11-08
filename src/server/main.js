import express from "express";
const app = express();
const port = 8788;

app.get("/api/user", (req, res) => {
  res.json({ loggedIn: false });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
