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
  createNewOrder,
  getHashAndJwtId,
  getNewOrder,
  getUserId,
  getUsername,
  insertUser,
  insertFile,
  getOrderId,
  insertPageRange,
} from "./utils/db.js";
import {
  pdfToImage,
  getPdfPageCount,
  getPdfPageSize,
} from "./utils/doc-processing.js";
import { validUsername } from "../utils/validation.js";
import { getBWPercentage } from "./utils/image-processing.js";

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
  form.uploadDir = `${process.cwd()}/files`;

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

  const {
    orderRefNumber,
    file: { newFilename, originalFilename, mimetype, size },
  } = await getFileAndOrderRefNum(form);

  const numPages = await getPdfPageCount(
    `${process.cwd()}/files/${newFilename}`
  );
  await pdfToImage(`${process.cwd()}/files/${newFilename}`, newFilename);

  const fullColorPages = [];
  const midColorPages = [];
  const spotColorPages = [];
  for (let i = 1; i <= numPages; i++) {
    const percentage = await getBWPercentage(
      `${process.cwd()}/files/${newFilename}-${i}.jpg`
    );
    if (percentage < 0.33) {
      fullColorPages.push(i);
    } else if (percentage < 0.66) {
      midColorPages.push(i);
    } else if (percentage < 0.95) {
      spotColorPages.push(i);
    }
  }

  const pageCount = await getPdfPageCount(
    `${process.cwd()}/files/${newFilename}`
  );

  const rowid = await insertFile(
    await getOrderId(orderRefNumber),
    originalFilename,
    newFilename,
    size,
    pageCount,
    arrayToRangeString(fullColorPages),
    arrayToRangeString(midColorPages),
    arrayToRangeString(spotColorPages)
  );

  const [width, length] = await getPdfPageSize(
    `${process.cwd()}/files/${newFilename}`
  );
  let paperSizeName;
  if (594 < width && width < 597 && 840 < length && length < 843) {
    paperSizeName = "a";
  } else if (611 < width && width < 614 && 934 < length && length < 937) {
    paperSizeName = "l";
  } else if (611 < width && width < 614 && 791 < length && length < 793) {
    paperSizeName = "s";
  }

  await insertPageRange(
    rowid,
    pageCount === 1 ? "1" : `1-${pageCount}`,
    1,
    paperSizeName ? paperSizeName : "s",
    "b",
    "s"
  );

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

function parseRangeString(rangeStr) {
  const result = [];
  const ranges = rangeStr.split(",");

  ranges.forEach((range) => {
    if (range.includes("-")) {
      // This is a range (e.g., '4-6')
      const [start, end] = range.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    } else {
      // This is a single number (e.g., '1')
      result.push(Number(range));
    }
  });

  return result;
}

function arrayToRangeString(arr) {
  if (arr.length === 0) return null;

  const result = [];
  let rangeStart = arr[0];
  let rangeEnd = arr[0];

  for (let i = 1; i <= arr.length; i++) {
    if (arr[i] === rangeEnd + 1) {
      rangeEnd = arr[i];
    } else {
      if (rangeStart === rangeEnd) {
        result.push(`${rangeStart}`);
      } else {
        result.push(`${rangeStart}-${rangeEnd}`);
      }
      rangeStart = arr[i];
      rangeEnd = arr[i];
    }
  }

  return result.join(",");
}
