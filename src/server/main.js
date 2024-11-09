import "dotenv/config";
import reservedUsernames from "../utils/reserved-usernames.json" assert { type: "json" };

import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import jwtAuthenticator from "./middlewares/jwtAuthenticator.js";
import { getUsername, getHashAndJwtId } from "./utils/db.js";
import { validUsername } from "../utils/validation.js";

const app = express();
const port = 8788;

app.use(express.json());
app.use("/api", cookieParser());
app.use("/api", jwtAuthenticator());

app.get("/api/user", async (req, res) => {
  if (req.jwtId) {
    res.json({ username: await getUsername(req.jwtId), loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!validUsername(username) || reservedUsernames.includes(username)) {
    res.json({
      success: false,
      err: "Invalid username",
    });
  }
  if (password.length < 12) {
    res.json({
      success: false,
      err: "Password must be at least 12 characters",
    });
  }

  const data = await getHashAndJwtId(username);

  if (data) {
    const { hashedPassword, jwtId } = data;

    if (!bcrypt.compareSync(password, hashedPassword)) {
      res.json({
        success: false,
        err: "Invalid username or password",
      });
    }

    // TODO: review algo confusion on jwts
    const token = jwt.sign({ id: jwtId }, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    res.cookie("token", token, {
      maxAge: 2592000000, // 1 month
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ success: true });
  } else {
    res.json({
      success: false,
      err: "Invalid username or password",
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
