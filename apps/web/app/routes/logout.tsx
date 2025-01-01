import { Link, Outlet, useLoaderData, redirect } from "react-router";

export async function clientLoader() {
  const res = await fetch("/api/logout");
  const { success } = await res.json();

  if (success) {
    return redirect("/login");
  }

  return null;
}

export default function Root() {
  const { loggedIn, username } = useLoaderData();

  return (
    <>
      <nav className="navbar bg-sky-500 h-9 text-white md:rounded-tl md:rounded-tr">
        <Link to="/">
          <div className="font-semibold text-3xl italic">DKK</div>
        </Link>
        <ul className="flex text-gray-300 space-x-8 ml-10 text-xl">
          {loggedIn ? null : (
            <li>
              <Link to="login" className="py-1 text-black">
                log in
              </Link>
            </li>
          )}
          {loggedIn ? (
            <li>
              <Link to={username} className="py-1 text-black">
                {username}
              </Link>
              {" | "}
              <Link to="logout" className="py-1 text-black">
                log out
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>

      <p className="p-6">Logging out...</p>
    </>
  );
}
