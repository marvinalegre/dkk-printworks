import { Form, redirect, useActionData } from "react-router-dom";
import { validUsername } from "../../utils/validation";

export async function action({ request }) {
  const formData = await request.formData();

  if (!validUsername(formData.get("username"))) {
    return {
      err: "Invalid username",
    };
  }

  const res = await fetch("/api/login", {
    method: "post",
    body: JSON.stringify({
      username: formData.get("username"),
      password: formData.get("password"),
    }),
  });
  const { success, err } = await res.json();

  if (success) {
    return redirect("/");
  }

  return { err };
}

export async function loader() {
  const res = await fetch("/api/user");
  const { loggedIn } = await res.json();

  if (loggedIn) return redirect("/");

  return null;
}

export default function Login() {
  const actionData = useActionData();

  return (
    <div className="p-1 md:p-8">
      <p className="p-4 text-red-500 text-center">
        {actionData ? actionData.err : ""}
      </p>

      <Form
        method="post"
        className="p-6 max-w-sm mx-auto bg-form-gray rounded-lg space-y-4"
      >
        <label htmlFor="username" className="block text-gray-700 font-semibold">
          username:
        </label>
        <input
          autoComplete="off"
          id="username"
          name="username"
          minLength={3}
          maxLength={20}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <label htmlFor="password" className="block text-gray-700 font-semibold">
          password:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={12}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="mt-8 space-x-6 text-right">
          <button
            type="submit"
            className="rounded bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 w-full"
          >
            login
          </button>
        </div>
      </Form>
    </div>
  );
}
