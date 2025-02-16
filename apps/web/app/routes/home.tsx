import { Link, useLoaderData } from "react-router";
import PriceGrid from "../components/price-grid.tsx";

export const clientLoader = async () => {
  const res = await fetch("/api/user");
  const { loggedIn, username } = await res.json();

  return { loggedIn, username };
};

export default function Home() {
  const { loggedIn, username } = useLoaderData();

  sessionStorage.clear();

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
        <img src="/dkk-logo.svg" className="my-5 mx-auto border" />
      </div>

      <Link to="/order">
        <div className="mt-6 flex justify-center">
          <button className="mt-10 px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-md shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out">
            Start Order
          </button>
        </div>
      </Link>

      <PriceGrid />
    </>
  );
}
