import { Form, redirect, useLoaderData, useSubmit } from "react-router-dom";
import FileUpload from "./FileUpload";
import { useState } from "react";

export const loader = async () => {
  const res = await fetch("/api/user");
  const { loggedIn } = await res.json();

  if (!loggedIn) {
    return redirect("/login");
  } else {
    return {
      orderRefNumber: "o-bd2aae2b-27fd-4ab0-98b7-6eac99b8d4bd",
      files: [
        {
          name: "resume.pdf",
          numPages: 2,
          pageRanges: [
            { pageRange: "1-2", copies: 1, color: "c", pageSize: "short" },
          ],
        },
        {
          name: "hackers-and-painters.pdf",
          numPages: 348,
          pageRanges: [
            { pageRange: "1-5", copies: 1, color: "bw", pageSize: "short" },
            { pageRange: "20-26", copies: 1, color: "bw", pages: "short" },
          ],
        },
      ],
    };
  }
};

export default function OrderComponent() {
  const { files, orderRefNumber } = useLoaderData();
  const submit = useSubmit();

  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer); // Clear the previous timeout
      timer = setTimeout(() => {
        func(...args); // Execute the callback after the delay
      }, delay);
    };
  }
  const debouncedSubmit = debounce((e) => {
    console.log(e.target.parentElement);
    submit(e.target.parentElement);
  }, 500);

  return (
    <div className="px-2 border">
      <Form
        method="post"
        onChange={debouncedSubmit}
        className={`${
          files.length ? "" : "hidden"
        } max-w-sm mx-auto md:mt-4 rounded-lg`}
      >
        <input
          name="orderRefNumber"
          className="hidden"
          defaultValue={orderRefNumber}
        ></input>

        {files.map((file, rowIndex) => (
          <FileForm key={rowIndex} file={file} />
        ))}

        <div className="flex justify-center items-center max-w-sm m-auto my-5">
          <button
            onClick={() => {
              submit(document.getElementById("foo"));
            }}
            className={`${
              files.length ? "" : "hidden"
            } rounded bg-sky-500 px-4 py-2 text-xl font-medium text-white hover:bg-sky-600 w-full`}
            value="asdf"
            name="bin"
          >
            complete order
          </button>
        </div>
      </Form>

      <FileUpload numFiles={files.length} />
    </div>
  );
}

function FileForm({ file }) {
  const [pageRanges, setPageRanges] = useState(file.pageRanges);
  const [pages, setPages] = useState(
    file.pageRanges.length === 1 &&
      file.pageRanges[0].pageRange === `1-${file.numPages}`
      ? "all"
      : "custom"
  );

  return (
    <div className="rounded-lg my-10">
      <h3 className="text-2xl font-semibold text-gray-800">{file.name}</h3>

      <div className="mb-4">
        <label
          htmlFor="pages"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          Pages:
        </label>
        <select
          id="pages"
          defaultValue={pages}
          onChange={() => {
            setPages((s) => (s === "all" ? "custom" : "all"));
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {pages === "custom" ? (
        <>
          {pageRanges.map((pageRange, rowIndex) => (
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="copies"
                  name="copies"
                  defaultValue={pageRange.pageRange}
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="copies"
                  name="copies"
                  defaultValue={pageRange.copies}
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
                  id="color"
                  name="color"
                  defaultValue={file.color}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  id="page-size"
                  name="pageSize"
                  defaultValue={file.pageSize}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="s">short</option>
                  <option value="l">long</option>
                  <option value="a4">A4</option>
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="copies"
              name="copies"
              defaultValue={pageRanges[0].copies}
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
              id="color"
              name="color"
              defaultValue={file.color}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              id="page-size"
              name="pageSize"
              defaultValue={file.pageSize}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="s">short</option>
              <option value="l">long</option>
              <option value="a4">A4</option>
            </select>
          </div>
        </div>
      )}

      {pages === "custom" ? (
        <button
          type="button"
          className="rounded bg-sky-700 px-5 py-1 m-auto text-lg font-medium text-white hover:bg-sky-600 text-center"
        >
          add page range
        </button>
      ) : null}
    </div>
  );
}
