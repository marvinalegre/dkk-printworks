import "dotenv/config";
import reservedUsernames from "../utils/reserved-usernames.json" assert { type: "json" };

import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";

import jwtAuthenticator from "./middlewares/jwtAuthenticator.js";
import { getUsername, getHashAndJwtId, insertUser } from "./utils/db.js";
import { validUsername } from "../utils/validation.js";

const app = express();
const port = 8788;

app.use(express.json());
app.use("/api", cookieParser());
app.use("/api", jwtAuthenticator());

app.post("/api/upload", async (req, res) => {
  const form = formidable({});

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ fields, files });
  });
});
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
    return;
  }
  if (password.length < 12) {
    res.json({
      success: false,
      err: "Password must be at least 12 characters",
    });
    return;
  }

  const data = await getHashAndJwtId(username);

  if (data) {
    const { hashedPassword, jwtId } = data;

    if (!bcrypt.compareSync(password, hashedPassword)) {
      res.json({
        success: false,
        err: "Invalid username or password",
      });
      return;
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
app.get("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!validUsername(username) || reservedUsernames.includes(username)) {
    res.json({
      success: false,
      err: "Invalid username",
    });
    return;
  }

  const data = await getHashAndJwtId(username);

  if (data) {
    res.json({
      success: false,
      err: "Username is not available",
    });
    return;
  }

  if (password.length < 12) {
    res.json({
      success: false,
      err: "Password must be at least 12 characters",
    });
    return;
  }

  // TODO: add weak password filter, entrophy detector

  // TODO: check in profiler if this is a hotspot
  const hashedPassword = bcrypt.hashSync(password, 8);
  const jwtId = `u-${uuidv4()}`;

  try {
    await insertUser(username, hashedPassword, jwtId);
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      err: "Something went wrong",
    });
    return;
  }

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
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
