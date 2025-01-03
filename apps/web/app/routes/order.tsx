import {
  Link,
  Form,
  useLoaderData,
  redirect,
  redirectDocument,
  useActionData,
  useSubmit,
} from "react-router";
import FileUpload from "../components/file-upload";
import { useState } from "react";

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  if (
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

  return redirectDocument("/order");
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
  const {
    username,
    order: { files, orderRefNumber, fileUploadErrMessage },
  } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const [totalPrice, setTotalPrice] = useState(0);

  return (
    <>
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

      <div className="px-2 border">
        <Form
          method="post"
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
        </Form>

        <FileUpload
          orderRefNumber={orderRefNumber}
          actionData={actionData}
          files={files}
          errMessage={fileUploadErrMessage}
        />

        <p
          className={`${
            files.length ? "" : "hidden"
          } text-xl font-semibold text-gray-800 mt-4 max-w-sm mx-auto`}
        >
          Total price:{" "}
          <span className="text-green-500">Php {totalPrice.toFixed(2)}</span>
        </p>

        <div className="flex justify-center items-center max-w-sm m-auto my-5">
          <button
            className={`${
              files.length ? "" : "hidden"
            } rounded bg-sky-500 px-4 py-2 text-xl font-medium text-white hover:bg-sky-600 w-full`}
          >
            complete order
          </button>
        </div>
      </div>
    </>
  );
}

function FileForm({ file }) {
  const [pageRanges, setPageRanges] = useState([
    {
      paperSize: file.paper_size,
      color: "bw",
      range: `1-${file.num_pages}`,
      copies: 1,
    },
  ]);
  const [pages, setPages] = useState(
    pageRanges.length === 1 && pageRanges[0].range === `1-${file.num_pages}`
      ? "all"
      : "custom"
  );

  return (
    <div className="rounded-lg my-10">
      <h3 className="text-2xl font-semibold text-gray-800">
        {file.file_name}{" "}
        <span className="text-gray-400 text-sm">
          ({`${file.num_pages} ${file.num_pages === 1 ? "page" : "pages"}`})
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
                  defaultValue={pageRange.color}
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
                  id="paper-size"
                  name="paperSize"
                  defaultValue={pageRange.paperSize}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              defaultValue={pageRanges[0].color}
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
              defaultValue={pageRanges[0].paperSize}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="s">short</option>
              <option value="l">long</option>
              <option value="a">A4</option>
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
