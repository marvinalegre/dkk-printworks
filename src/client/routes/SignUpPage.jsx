import { Form, Link, redirect, useActionData } from "react-router-dom";
import { validUsername } from "../../utils/validation";

export async function action({ request }) {
  const formData = await request.formData();

  if (!validUsername(formData.get("username"))) {
    return {
      err: "Invalid username",
    };
  }

  const res = await fetch("/api/signup", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
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

export default function SignUp() {
  const actionData = useActionData();

  return (
    <>
      <nav className="navbar bg-sky-500 h-9 text-white md:rounded-tl md:rounded-tr">
        <Link to="/">
          <div className="font-semibold text-3xl italic">DKK</div>
        </Link>
      </nav>

      <div className="p-1 md:p-8">
        <p className="p-4 text-red-500 text-center">
          {actionData ? actionData.err : ""}
        </p>
        <p>{actionData ? actionData.err : ""}</p>
        <Form
          method="post"
          className="p-6 max-w-sm mx-auto bg-form-gray rounded-lg space-y-4"
        >
          <label
            htmlFor="username"
            className="block text-gray-700 font-semibold"
          >
            username:
          </label>
          <input
            id="username"
            name="username"
            minLength={3}
            maxLength={20}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <br />
          <label
            htmlFor="password"
            className="block text-gray-700 font-semibold"
          >
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
          <br />
          <button
            type="submit"
            className="rounded bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 w-full"
          >
            sign up
          </button>
        </Form>
      </div>
    </>
  );
}
