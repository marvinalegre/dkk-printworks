import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";

import jwtAuthenticator from "./middlewares/jwtAuthenticator.js";

const app = express();
const port = 8788;

app.use("/api", cookieParser());
app.use("/api/auth", jwtAuthenticator());

app.get("/api/auth/user", (req, res) => {
  res.json({ loggedIn: false });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
