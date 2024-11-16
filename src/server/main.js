import "dotenv/config";
import reservedUsernames from "../utils/reserved-usernames.json" assert { type: "json" };
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";

import jwtAuthenticator from "./middlewares/jwtAuthenticator.js";
import {
  getHashAndJwtId,
  getNewOrder,
  getUserId,
  getUsername,
  insertUser,
  createNewOrder,
} from "./utils/db.js";
import { validUsername } from "../utils/validation.js";

const app = express();
const port = 8788;

app.use(express.static(`${process.cwd()}/dist`));
app.use(express.json());
app.use("/api", cookieParser());
app.use("/api", jwtAuthenticator());

app.get("/api/order", async (req, res) => {
  if (!req.jwtId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }

  const userId = await getUserId(req.jwtId);

  if (!userId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }

  let pageRanges = await getNewOrder(userId);

  if (!pageRanges.length) {
    await createNewOrder(userId, `o-${uuidv4()}`);
    pageRanges = await getNewOrder(userId);
  }

  function rangesToOrder(ranges) {
    const order = {};

    order.orderRefNumber = ranges[0].order_reference_number;
    order.files = [];

    if (ranges.length === 1 && ranges[0].file_name === null) return order;

    let fileNames = new Set();
    for (let range of ranges) {
      fileNames.add(range.file_name);
    }

    for (let fileName of fileNames) {
      let file = {};
      file.name = fileName;
      file.pageRanges = [];
      for (let range of ranges) {
        if (range.file_name === fileName) {
          file.numPages = range.num_pages;
          range.pageRange = range.page_range;
          range.pageSize = range.paper_size;
          delete range.paper_size;
          delete range.page_range;
          delete range.file_name;
          delete range.order_reference_number;
          delete range.num_pages;
          file.pageRanges.push(range);
        }
      }

      order.files.push(file);
    }

    return order;
  }

  res.json(rangesToOrder(pageRanges));
});
app.post("/api/upload", async (req, res) => {
  const form = formidable({});
  const getFileAndOrderRefNum = function (form) {
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          orderRefNumber: fields.orderRefNumber[0],
          file: files.upload[0],
        });
      });
    });
  };

  const { orderRefNumber, file } = await getFileAndOrderRefNum(form);

  res.send("hit");
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
    const { passwordHash, jwtId } = data;

    if (!bcrypt.compareSync(password, passwordHash)) {
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
  const passwordHash = bcrypt.hashSync(password, 8);
  const jwtId = `u-${uuidv4()}`;

  try {
    await insertUser(username, passwordHash, jwtId);
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
app.use((req, res) => {
  res.sendFile(`${process.cwd()}/dist/index.html`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
