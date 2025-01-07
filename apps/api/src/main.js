import "dotenv/config";
import { reservedUsernames } from "@dkk-printworks/reserved-usernames";
import { validateUsername, validatePassword } from "@dkk-printworks/validation";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import formidable from "formidable";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);
import { exec } from "child_process";

import jwtAuthenticator from "./middlewares/jwtAuthenticator.js";
import {
  createNewOrder,
  getOrders,
  getOrderFiles,
  getHashAndJwtId,
  getNewOrder,
  getOrderFilesFromRefNum,
  getUserId,
  getUserIdFromOrderRefNum,
  getUsername,
  insertUser,
  insertFile,
  getOrderId,
  insertPageRange,
  updateOrder,
  removeFile,
} from "./utils/db.js";
import {
  pdfToImage,
  getPdfPageCount,
  getPdfPageSize,
} from "./utils/doc-processing.js";
import { getBWPercentage } from "./utils/image-processing.js";

const app = express();
const port = 8788;

app.use(express.static(`${process.cwd()}/dist`));
app.use(express.json());
app.use("/api", cookieParser());
app.use("/api", jwtAuthenticator());

app.post("/api/remove", async (req, res) => {
  if (!req.jwtId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }

  const userId = await getUserId(req.jwtId);
  if (!userId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }

  const { orderRefNumber, remove } = req.body;

  try {
    await removeFile(remove, orderRefNumber);

    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});
app.get("/api/orders", async (req, res) => {
  if (!req.jwtId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }

  const userId = await getUserId(req.jwtId);
  if (!userId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }

  const orders = await getOrders(userId);
  res.json({
    orders: orders.map((o) => {
      const order = {};
      order.orderRefNumber = o.order_reference_number;
      order.status = o.status;
      order.timestamp =
        o.status === "pe"
          ? o.pending_at
          : o.status === "pr"
          ? o.in_progress_at
          : o.status === "co"
          ? o.completed_at
          : o.status === "ho"
          ? o.handed_over_at
          : o.cancelled_at;
      order.totalPrice = o.total_price;
      return order;
    }),
  });
});
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

  let newOrder = await getNewOrder(userId);
  if (!newOrder) {
    await createNewOrder(userId, nanoid());
    newOrder = await getNewOrder(userId);
  }

  const files = await getOrderFiles(newOrder.order_id);
  res.json({
    orderRefNumber: newOrder.order_reference_number,
    files,
  });
});
app.post("/api/order", async (req, res) => {
  const { orderRefNumber, totalPrice, fileRanges } = req.body;
  const files = await getOrderFilesFromRefNum(orderRefNumber);

  try {
    for (let i = 0; i < files.length; i++) {
      for (let r of fileRanges[`f${i}`]) {
        insertPageRange(
          files[i].file_id,
          r.range,
          Number(r.copies),
          r.paperSize,
          r.color === "bw" ? "b" : r.color,
          "s"
        );
      }
    }

    await updateOrder(Number(totalPrice), orderRefNumber);

    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});
app.post("/api/upload", async (req, res) => {
  const form = formidable({});
  form.uploadDir = `${process.cwd()}/files`;

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
      `${process.cwd()}/files/${newFilename}-${
        numPages < 10 ? i : i.toString().padStart(2, "0")
      }.jpg`
    );
    if (percentage < 0.33) {
      fullColorPages.push(i);
    } else if (percentage < 0.66) {
      midColorPages.push(i);
    } else if (percentage < 0.95) {
      spotColorPages.push(i);
    }
  }

  exec(`rm ${process.cwd()}/files/${newFilename}-*`);

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
  } else {
    paperSizeName = "s";
  }

  await insertFile(
    await getOrderId(orderRefNumber),
    originalFilename,
    newFilename,
    size,
    numPages,
    arrayToRangeString(fullColorPages),
    arrayToRangeString(midColorPages),
    arrayToRangeString(spotColorPages),
    paperSizeName
  );

  res.json({ success: true });

  function getFileAndOrderRefNum(form) {
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
  }
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

  try {
    validateUsername(username);
  } catch (e) {
    res.json({ success: false, err: e.message });
    return;
  }

  if (reservedUsernames.includes(username)) {
    res.json({
      success: false,
      err: "This username is unavailable.",
    });
    return;
  }

  try {
    validatePassword(password);
  } catch (e) {
    res.json({ success: false, err: e.message });
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

  try {
    validateUsername(username);
  } catch (e) {
    res.json({ success: false, err: e.message });
    return;
  }

  if (reservedUsernames.includes(username)) {
    res.json({
      success: false,
      err: "This username is unavailable.",
    });
    return;
  }

  try {
    validatePassword(password);
  } catch (e) {
    res.json({ success: false, err: e.message });
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
  const jwtId = nanoid();

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

// all pages have same price
function computePrice(pageRanges, pricePerPage) {
  let price = 0;
  for (let range of pageRanges) {
    const numCopies = range.copies;
    const pages = parseRangeString(range.page_range);
    price += pages.length * numCopies * pricePerPage;
  }

  return price;
}
