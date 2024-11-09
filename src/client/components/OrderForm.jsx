export default function OrderComponent() {
  return (
    <div className="p-1 md:p-8">
      <h2 class="text-2xl font-semibold text-gray-700 hover:text-gray-500 transition-colors duration-300 text-center my-5">
        Order Form
      </h2>

      <form
        method="post"
        className="p-6 max-w-sm mx-auto bg-form-gray rounded-lg space-y-4"
      >
        <label htmlFor="link" className="block text-gray-700 font-semibold">
          Link:
        </label>
        <input
          id="link"
          name="link"
          type="url"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <div className="flex items-center">
          <input
            id="print-whole-doc"
            name="printWholeDoc"
            type="checkbox"
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-gray-500"
          />
          <label
            htmlFor="print-whole-doc"
            className="ml-2 text-gray-700 font-semibold"
          >
            Print the whole document
          </label>
        </div>
        <label
          htmlFor="num-copies"
          className="block text-gray-700 font-semibold"
        >
          Number of copies:
        </label>
        <input
          id="num-copies"
          name="numCopies"
          type="number"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <button type="submit" className="border p-3 rounded bg-green-400">
          place order
        </button>
      </form>
    </div>
  );
}
