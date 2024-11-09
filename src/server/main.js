import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";

import jwtAuthenticator from "./middlewares/jwtAuthenticator.js";
import { getUsername } from "./utils/db.js";

const app = express();
const port = 8788;

app.use("/api", cookieParser());
app.use("/api", jwtAuthenticator());

app.get("/api/user", async (req, res) => {
  if (req.jwtId) {
    res.json({ username: await getUsername(req.jwtId), loggedIn: true });
  }

  res.json({ loggedIn: false });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
