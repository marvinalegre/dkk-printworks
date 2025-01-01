import { Link, useLoaderData } from "react-router";

export const clientLoader = async () => {
  const res = await fetch("/api/user");
  const { loggedIn, username } = await res.json();

  return { loggedIn, username };
};

export default function Home() {
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

      <div className="max-w-72 mx-auto">
        <img
          src="https://robohash.org/2E0.png?set=set1"
          className="my-5 mx-auto border"
        />
        <Link to="/order">Start order</Link>
      </div>
    </>
  );
}
