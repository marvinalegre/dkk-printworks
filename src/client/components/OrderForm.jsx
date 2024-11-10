import { useState } from "react";
import { Form } from "react-router-dom";

export default function OrderComponent() {
  const [onStartScreen, setOnStartScreen] = useState(true);
  const [onUploadScreen, setOnUploadScreen] = useState(false);
  const [onPagesScreen, setOnPagesScreen] = useState(false);
  const [onSummaryScreen, setOnSummaryScreen] = useState(false);

  const [fileName, setFileName] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the first file
    if (file) {
      setFileName(file.name); // Set the file name to state

      if (file.name === "") {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    }
  };

  return (
    <div className="p-1 md:p-8">
      <Form method="POST">
        {onStartScreen ? (
          <div className="max-w-72 mx-auto">
            <img
              src="https://robohash.org/2E0.png?set=set1"
              className="my-5 mx-auto border"
            />
            <button
              onClick={() => {
                setOnStartScreen(false);
                setOnUploadScreen(true);
              }}
              className="border p-3 rounded hover:text-gray-500"
            >
              Start order
            </button>
          </div>
        ) : null}
        {onUploadScreen ? (
          <div className="max-w-72 mx-auto flex items-center justify-center h-96">
            <div className="flex flex-col items-center my-5">
              {/* Label to style the file input button */}
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 rounded-md px-4 py-2 mb-2 text-2xl"
              >
                Choose File
              </label>
              {/* Hidden file input */}
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
              />

              {fileName && (
                <p className="mt-2 text-md text-gray-700">
                  Selected File: <span className="text-black">{fileName}</span>
                </p>
              )}
              <div className="flex justify-between g-6 p-4">
                <button
                  onClick={() => {
                    setOnStartScreen(true);
                    setOnUploadScreen(false);
                  }}
                  className="border p-3 rounded hover:text-gray-500 mt-5 mx-5"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    setOnUploadScreen(false);
                    setOnPagesScreen(true);
                  }}
                  disabled={isDisabled}
                  className="border p-3 rounded hover:text-gray-500 mt-5 mx-5 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {onPagesScreen ? (
          <div className="max-w-72 mx-auto flex items-center justify-center h-96">
            <img
              src="https://robohash.org/2E0.png?set=set1"
              className="my-5 mx-auto border"
            />
          </div>
        ) : null}
        {onSummaryScreen ? (
          <button
            type="submit"
            className="border p-3 rounded hover:text-gray-500"
          >
            Complete order
          </button>
        ) : null}
      </Form>
    </div>
  );
}
