import {
  Link,
  useLoaderData,
  redirect,
  useActionData,
  useSubmit,
} from "react-router";
import classNames from "classnames";
import FileUpload from "../components/file-upload";
import calculateFilePrice from "../utils/calculate-file-price.ts";
import { useState, useEffect } from "react";

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  if (formData.get("f0-paperSize0") != null) {
    const order = {
      orderRefNumber: formData.get("orderRefNumber"),
      totalPrice: formData.get("totalPrice"),
      fileRanges: {},
    };
    for (let i = 0; formData.get(`f${i}-range0`) != null; i++) {
      order.fileRanges[`f${i}`] = [];
      for (let j = 0; formData.get(`f${i}-range${j}`) != null; j++) {
        const range = {};
        range.range = formData.get(`f${i}-range${j}`);
        range.color = formData.get(`f${i}-color${j}`);
        range.copies = formData.get(`f${i}-copies${j}`);
        range.paperSize = formData.get(`f${i}-paperSize${j}`);
        order.fileRanges[`f${i}`].push(range);
      }
    }

    const res = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    const { success } = await res.json();

    if (success) {
      return redirect(`/${formData.get("username")}`);
    } else {
      return {
        placeOrderErrMessage: "something went wrong while placing order",
      };
    }
  } else if (
    formData.get("filenames") &&
    formData.get("filenames").indexOf(formData.get("upload").name) !== -1
  ) {
    return { fileUploadErrMess: "the selected file has already been uploaded" };
  } else {
    try {
      // parsed as json to trigger an exception
      await (
        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
      ).json();
    } catch (e) {
      return { fileUploadErrMess: "something went wrong" };
    }
  }

  return null;
};

export const clientLoader = async () => {
  const [{ loggedIn, username }, order] = await Promise.all([
    (await fetch("/api/user")).json(),
    (await fetch("/api/order")).json(),
  ]);

  if (!loggedIn) {
    return redirect("/login");
  }

  return { username, order };
};

export default function Root() {
  const submit = useSubmit();
  const actionData = useActionData();
  const {
    username,
    order: { files, orderRefNumber },
  } = useLoaderData();

  const [filesWithRanges, setFilesWithRanges] = useState(
    createFilesWithRanges(files)
  );

  useEffect(() => setFilesWithRanges(createFilesWithRanges(files)), [files]);
  useEffect(
    () => sessionStorage.setItem("files", JSON.stringify(filesWithRanges)),
    [filesWithRanges]
  );

  let validTotalPrice = true;
  filesWithRanges.forEach((f) => {
    f.ranges.forEach((r) => {
      if (validTotalPrice) {
        validTotalPrice = validTotalPrice && r.validCopies;
        validTotalPrice = validTotalPrice && r.validRange;
      }
    });
  });

  let totalPrice = 0;
  filesWithRanges.forEach((f) => {
    totalPrice += calculateFilePrice(f);
  });

  function handleModeChange(filename, value) {
    const updatedFiles = JSON.parse(JSON.stringify(filesWithRanges));
    const fileIndex = updatedFiles.findIndex((f) => f.file_name === filename);
    updatedFiles[fileIndex].mode = value;
    setFilesWithRanges(updatedFiles);
  }

  function handleRangeChange(filename, rangeIndex, field, value, numPages) {
    const updatedFiles = JSON.parse(JSON.stringify(filesWithRanges));
    const fileIndex = updatedFiles.findIndex((f) => f.file_name === filename);

    updatedFiles[fileIndex].ranges[rangeIndex][field] = value;

    if (field === "copies") {
      if (!/^\d+$/.test(value) || value == 0) {
        updatedFiles[fileIndex].ranges[rangeIndex].validCopies = false;
      } else {
        updatedFiles[fileIndex].ranges[rangeIndex].validCopies = true;
      }
    }

    if (field === "range") {
      if (isValidRange(value, numPages)) {
        updatedFiles[fileIndex].ranges[rangeIndex].validRange = true;
      } else {
        updatedFiles[fileIndex].ranges[rangeIndex].validRange = false;
      }
    }

    setFilesWithRanges(updatedFiles);
  }

  function addRange(filename) {
    const updatedFiles = JSON.parse(JSON.stringify(filesWithRanges));
    const fileIndex = updatedFiles.findIndex((f) => f.file_name === filename);
    updatedFiles[fileIndex].ranges.push({
      paperSize: updatedFiles[fileIndex].paper_size,
      color: "bw",
      range: `1-${updatedFiles[fileIndex].num_pages}`,
      copies: 1,
      validRange: true,
      validCopies: true,
    });
    setFilesWithRanges(updatedFiles);
  }

  function handlePlaceOrder(filesWithRanges, username) {
    const order = { orderRefNumber, totalPrice, username };
    for (let i = 0; i < filesWithRanges.length; i++) {
      if (filesWithRanges[i].mode === "custom") {
        for (let j = 0; j < filesWithRanges[i].ranges.length; j++) {
          order[`f${i}-range${j}`] = filesWithRanges[i].ranges[j].range;
          order[`f${i}-color${j}`] = filesWithRanges[i].ranges[j].color;
          order[`f${i}-copies${j}`] = filesWithRanges[i].ranges[j].copies;
          order[`f${i}-paperSize${j}`] = filesWithRanges[i].ranges[j].paperSize;
        }
      } else {
        order[`f${i}-range0`] = `1-${filesWithRanges[i].num_pages}`;
        order[`f${i}-color0`] = filesWithRanges[i].ranges[0].color;
        order[`f${i}-copies0`] = filesWithRanges[i].ranges[0].copies;
        order[`f${i}-paperSize0`] = filesWithRanges[i].ranges[0].paperSize;
      }
    }

    submit(order, { method: "post" });
  }

  return (
    <>
      <NavBar username={username} />

      <div className="px-2 border">
        <div
          className={`${
            files.length ? "" : "hidden"
          } max-w-sm mx-auto md:mt-4 rounded-lg`}
        >
          {filesWithRanges.map((f) => (
            <div key={f.file_name} className="rounded-lg my-10">
              <h3 className="text-2xl font-semibold text-gray-800">
                {f.file_name}{" "}
                <span className="text-gray-400 text-sm">
                  ({`${f.num_pages} ${f.num_pages === 1 ? "page" : "pages"}`})
                </span>
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="pages"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Pages:
                </label>
                <select
                  defaultValue={f.mode}
                  onChange={(e) =>
                    handleModeChange(f.file_name, e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {f.mode === "custom" ? (
                <>
                  {f.ranges.map((pageRange, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="mb-4 border shadow px-3 pt-3 rounded bg-gray-100"
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Page range:
                        </label>
                        <input
                          autoComplete="off"
                          className={createRangeInputClass(pageRange)}
                          name="range"
                          onChange={(e) =>
                            handleRangeChange(
                              f.file_name,
                              rowIndex,
                              "range",
                              e.target.value,
                              f.num_pages
                            )
                          }
                          defaultValue={pageRange.range}
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="copies"
                          className="block text-sm font-medium text-gray-600 mb-2"
                        >
                          Copies:
                        </label>
                        <input
                          type="number"
                          autoComplete="off"
                          className={createCopiesInputClass(pageRange)}
                          name="copies"
                          defaultValue={pageRange.copies}
                          onChange={(e) =>
                            handleRangeChange(
                              f.file_name,
                              rowIndex,
                              "copies",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="color"
                          className="block text-sm font-medium text-gray-600 mb-2"
                        >
                          Color:
                        </label>

                        <select
                          name="color"
                          defaultValue={pageRange.color}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          onChange={(e) =>
                            handleRangeChange(
                              f.file_name,
                              rowIndex,
                              "color",
                              e.target.value
                            )
                          }
                        >
                          <option value="bw">black and white</option>
                          <option value="c">colored</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="page-size"
                          className="block text-sm font-medium text-gray-600 mb-2"
                        >
                          Page Size:
                        </label>

                        <select
                          name="paperSize"
                          defaultValue={pageRange.paperSize}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          onChange={(e) =>
                            handleRangeChange(
                              f.file_name,
                              rowIndex,
                              "paperSize",
                              e.target.value
                            )
                          }
                        >
                          <option value="s">short</option>
                          <option value="l">long</option>
                          <option value="a">A4</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="mb-10 border shadow px-3 pt-3 rounded bg-gray-100">
                  <div className="mb-4">
                    <label
                      htmlFor="copies"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Copies:
                    </label>
                    <input
                      type="number"
                      autoComplete="off"
                      className={createCopiesInputClass(f.ranges[0])}
                      name="copies"
                      defaultValue={f.ranges[0].copies}
                      onChange={(e) =>
                        handleRangeChange(
                          f.file_name,
                          0,
                          "copies",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="color"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Color:
                    </label>

                    <select
                      name="color"
                      defaultValue={f.ranges[0].color}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      onChange={(e) =>
                        handleRangeChange(
                          f.file_name,
                          0,
                          "color",
                          e.target.value
                        )
                      }
                    >
                      <option value="bw">black and white</option>
                      <option value="c">colored</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="page-size"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Page Size:
                    </label>

                    <select
                      name="paperSize"
                      defaultValue={f.ranges[0].paperSize}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      onChange={(e) =>
                        handleRangeChange(
                          f.file_name,
                          0,
                          "paperSize",
                          e.target.value
                        )
                      }
                    >
                      <option value="s">short</option>
                      <option value="l">long</option>
                      <option value="a">A4</option>
                    </select>
                  </div>
                </div>
              )}
              {f.mode === "custom" ? (
                <button
                  type="button"
                  className="rounded bg-sky-700 px-5 py-1 m-auto text-lg font-medium text-white hover:bg-sky-600 text-center"
                  onClick={(e) => addRange(f.file_name)}
                >
                  add page range
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <FileUpload
          orderRefNumber={orderRefNumber}
          actionData={actionData}
          files={files}
        />

        <p
          className={`${
            files.length ? "" : "hidden"
          } text-xl font-semibold text-gray-800 mt-4 max-w-sm mx-auto`}
        >
          Total price:{" "}
          {validTotalPrice ? (
            <span className="text-green-500">Php {totalPrice.toFixed(2)}</span>
          ) : null}
        </p>

        {actionData?.placeOrderErrMessage && (
          <div className="mb-5 text-center text-red-500 text-lg">
            {actionData.placeOrderErrMessage}
          </div>
        )}
        <div className="flex justify-center items-center max-w-sm m-auto my-5">
          <button
            className={`${
              files.length ? "" : "hidden"
            } rounded bg-sky-500 px-4 py-2 text-xl font-medium text-white hover:bg-sky-600 w-full`}
            onClick={() => handlePlaceOrder(filesWithRanges, username)}
          >
            place order
          </button>
        </div>
      </div>
    </>
  );
}

function NavBar({ username }) {
  return (
    <nav className="navbar bg-sky-500 h-9 text-white md:rounded-tl md:rounded-tr">
      <Link to="/">
        <div className="font-semibold text-3xl italic">DKK</div>
      </Link>
      <ul className="flex text-gray-300 space-x-8 ml-10 text-xl">
        <li>
          <Link to={`/${username}`} className="py-1 text-black">
            {username}
          </Link>
          {" | "}
          <Link to="/logout" className="py-1 text-black">
            log out
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function countPages(range) {
  // Split the input string by commas
  const parts = range.split(",");

  const pages = new Set(); // Use a Set to track unique pages

  // Loop through each part and process accordingly
  parts.forEach((part) => {
    if (part.includes("-")) {
      // If the part is a range (e.g., '6-11')
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        pages.add(i); // Add each page in the range to the Set
      }
    } else {
      // If it's a single page (e.g., '1')
      pages.add(Number(part)); // Add the page number to the Set
    }
  });

  // The size of the Set represents the number of unique pages
  return pages.size;
}

function isValidRange(range, numPages) {
  // Trim leading and trailing spaces and split by commas
  const parts = range.trim().split(",");

  // Check for leading or trailing commas (empty first or last part)
  if (parts[0] === "" || parts[parts.length - 1] === "") {
    return false; // Invalid if the first or last part is empty (indicating a leading or trailing comma)
  }

  // Validate each part (either a single page or a range)
  for (let part of parts) {
    part = part.trim(); // Remove any extra spaces around each part

    if (part.includes("-")) {
      // It's a range (start-end)
      const [start, end] = part.split("-");

      // Validate that both start and end are numbers and start <= end
      if (!isValidSingleRange(start, end, numPages)) {
        return false; // Invalid range
      }
    } else {
      // It's a single page, validate it's a positive integer
      if (!/^\d+$/.test(part)) {
        return false; // Invalid single page
      }

      if (Number(part) > numPages) return false;

      // Also check if page number is zero or negative, which is invalid
      const pageNum = Number(part);
      if (pageNum <= 0) {
        return false; // Invalid page number (must be positive)
      }
    }
  }

  return true; // All parts are valid
}

function isValidSingleRange(start, end, numPages) {
  const startNum = Number(start);
  const endNum = Number(end);

  if (endNum > numPages) return false;

  // Ensure both start and end are valid numbers, start <= end, and both are non-negative
  return (
    !isNaN(startNum) &&
    !isNaN(endNum) &&
    startNum <= endNum &&
    startNum > 0 &&
    endNum > 0
  );
}

function createFilesWithRanges(files) {
  const sessionFilesWithRanges = sessionStorage.getItem("files");
  if (sessionFilesWithRanges == null) {
    return files.map((f) => {
      f.mode = "all";
      f.ranges = [
        {
          paperSize: f.paper_size,
          color: "bw",
          range: `1-${f.num_pages}`,
          copies: 1,
          validRange: true,
          validCopies: true,
        },
      ];
      return f;
    });
  } else {
    const filesWithRanges = JSON.parse(sessionStorage.getItem("files"));
    const frFilenames = filesWithRanges.map((f) => f.file_name);
    const output = [];
    for (let f of files) {
      if (frFilenames.includes(f.file_name)) {
        for (let fr of filesWithRanges) {
          if (fr.file_name === f.file_name) {
            output.push(fr);
            break;
          }
        }
      } else {
        f.mode = "all";
        f.ranges = [
          {
            paperSize: f.paper_size,
            color: "bw",
            range: `1-${f.num_pages}`,
            copies: 1,
            validRange: true,
            validCopies: true,
          },
        ];
        output.push(f);
      }
    }
    return output;
  }
}

function createCopiesInputClass(range) {
  return classNames({
    "w-full p-2 border border-gray-300 rounded-md": true,
    "ring-2 ring-red-500 focus:outline-none focus:ring-2 focus:ring-red-500":
      !range.validCopies,
    "focus:outline-none focus:ring-2 focus:ring-blue-500": range.validCopies,
  });
}

function createRangeInputClass(range) {
  return classNames({
    "w-full p-2 border border-gray-300 rounded-md": true,
    "ring-2 ring-red-500 focus:outline-none focus:ring-2 focus:ring-red-500":
      !range.validRange,
    "focus:outline-none focus:ring-2 focus:ring-blue-500": range.validRange,
  });
}
