import { Link, Outlet, useLoaderData } from "react-router-dom";

export const loader = async () => {
  const res = await fetch("/api/user");
  const { loggedIn, username } = await res.json();

  return { loggedIn, username };
};

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
                login
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
                logout
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>

      <Outlet />
    </>
  );
}
