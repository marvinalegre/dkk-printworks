import { useState } from "react";
import { Form, redirect } from "react-router-dom";

export const action = async ({ request }) => {
  const formData = await request.formData();

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  return redirect("/");
};

function FileUpload({ numFiles }) {
  // State to hold the selected file name
  const [fileName, setFileName] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  return (
    <div
      className={`w-full max-w-xl py-2 rounded m-auto mt-10 mb-10 md:mt-[6vh]`}
    >
      {/* File upload button */}
      <Form
        method="POST"
        action="/upload"
        encType="multipart/form-data"
        className="mt-2 flex md:gap-20 gap-2 justify-center items-center flex-wrap"
      >
        <label className="rounded bg-sky-700 px-3 py-1 text-lg font-medium text-white hover:bg-sky-600 md:w-2/5 text-center">
          {fileName ? "select another file" : "select a file"}
          <input
            type="file"
            name="foobar"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <button
          type="submit"
          className="rounded bg-sky-700 px-3 py-1 text-lg font-medium text-white hover:bg-sky-600 md:w-2/5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={fileName ? false : true}
        >
          upload selected file
        </button>
      </Form>

      {/* Display selected file name */}
      <div id="file-name" className="mt-3 text-center text-gray-500 text-lg">
        {fileName ? (
          <span>
            <span className="italic">selected file</span>:{" "}
            <span className="font-bold text-gray-700">{fileName}</span>
          </span>
        ) : (
          <span className="italic">no file selected</span>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
