import { Form, redirect, useLoaderData, useSubmit } from "react-router-dom";
import FileUpload from "./FileUpload";

export const loader = async () => {
  const res = await fetch("/api/user");
  const { loggedIn } = await res.json();

  if (!loggedIn) {
    return redirect("/login");
  } else {
    return [
      {
        name: "resume.pdf",
        pages: "all",
        copies: 10,
        color: "c",
        pageSize: "short",
      },
    ];
  }
};

export default function OrderComponent() {
  const files = useLoaderData();
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
    <div className="px-2 py-5 md:p-8 max-w-xl m-auto">
      <h2 className="text-3xl mb-3 font-bold max-w-sm m-auto">Order Pad</h2>

      <Form
        method="post"
        onChange={debouncedSubmit}
        id="foo"
        className="max-w-sm m-auto"
      >
        {files.map((file, rowIndex) => (
          <div key={rowIndex} className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              {file.name}
            </h3>

            <div className="mb-4">
              <label
                htmlFor="pages"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Pages:
              </label>
              <select
                id="pages"
                name="pages"
                defaultValue={file.pages}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="custom">Custom</option>
              </select>
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
                defaultValue={file.copies}
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="s">short</option>
                <option value="l">long</option>
                <option value="a4">A4</option>
              </select>
            </div>
          </div>
        ))}
      </Form>

      <div className="flex justify-center items-center max-w-sm m-auto my-5">
        <button
          onClick={() => {
            submit(document.getElementById("foo"));
          }}
          className={`${
            files.length ? "" : "hidden"
          } rounded bg-sky-500 px-4 py-2 text-xl font-medium text-white hover:bg-sky-600 w-full shadow`}
          value="asdf"
          name="bin"
        >
          complete order
        </button>
      </div>

      <FileUpload />
    </div>
  );
}
