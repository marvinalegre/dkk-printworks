import { useState } from "react";
import { Form } from "react-router";

function FileUpload({ orderRefNumber, actionData, files, errMessage }) {
  let filenames = "";
  for (let file of files) {
    filenames += `${file.name},`;
  }

  // State to hold the selected file name
  const [fileName, setFileName] = useState("");
  const [showLoaderErrMess, setShowLoaderErrMess] = useState(true);

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
    <div className="max-w-lg py-4 rounded m-auto mt-10 mb-10 md:mt-[6vh] bg-gray-100 shadow">
      {showLoaderErrMess ? (
        <div className="mb-5 text-center text-red-500 text-lg">
          {errMessage}
        </div>
      ) : actionData?.fileUploadErrMess ? (
        <div className="mb-5 text-center text-red-500 text-lg">
          {actionData.fileUploadErrMess}
        </div>
      ) : null}

      {/* Display selected file name */}
      <div id="file-name" className="mb-5 text-center text-gray-500 text-lg">
        {fileName ? (
          <span>
            <span className="italic">selected file</span>:{" "}
            <span className="font-bold text-gray-700">{fileName}</span>
          </span>
        ) : (
          <span className="italic">no file selected</span>
        )}
      </div>

      {/* File upload button */}
      <Form
        method="POST"
        encType="multipart/form-data"
        className="mt-2 flex md:gap-20 gap-2 justify-center items-center flex-wrap"
      >
        <input
          name="orderRefNumber"
          defaultValue={orderRefNumber}
          className="hidden"
        ></input>
        <input name="filenames" defaultValue={filenames} className="hidden" />

        <label className="rounded bg-sky-700 px-5 py-1 text-lg font-medium text-white hover:bg-sky-600 text-center">
          {fileName ? "select another file" : "select a file"}
          <input
            type="file"
            name="upload"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <button
          type="submit"
          className="rounded bg-sky-700 px-5 py-1 text-lg font-medium text-white hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={fileName ? false : true}
        >
          upload selected file
        </button>
      </Form>
    </div>
  );
}

export default FileUpload;
