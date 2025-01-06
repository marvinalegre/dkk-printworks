import { Link, useLoaderData, redirect } from "react-router";

export const clientLoader = async ({ params }) => {
  const res = await fetch("/api/user");
  const { loggedIn, username } = await res.json();

  if (!loggedIn) return redirect("/login");
  if (loggedIn && params.username !== username) return redirect("/");

  const res2 = await fetch("/api/orders");
  const { orders } = await res2.json();

  return { loggedIn, username, orders };
};

export default function UserPage() {
  const { loggedIn, username, orders } = useLoaderData();

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
              <Link to={`/${username}`} className="py-1 text-black">
                {username}
              </Link>
              {" | "}
              <Link to="/logout" className="py-1 text-black">
                log out
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>

      <ul>
        {orders.map((o) => (
          <li key={o.orderRefNumber} className="px-4">
            <OrderComponent
              order={{
                status: o.status,
                timestamp: new Date(
                  new Date(o.timestamp).getTime() + 8 * 60 * 60 * 1000
                ).toLocaleString(),
                price: o.totalPrice,
                referenceNumber: o.orderRefNumber,
              }}
            />
          </li>
        ))}
      </ul>

      {orders.length === 0 && <NoOrdersComponent />}
    </>
  );
}

const OrderComponent = ({ order }) => {
  const { status, timestamp, price, referenceNumber } = order;

  return (
    <div className="max-w-sm mx-auto bg-white p-4 my-8 rounded-md shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-3">Order Details</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">
            Order Status:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-white text-xs ${
              status === "ho" || status === "co"
                ? "bg-green-500"
                : status === "pr"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {status === "n"
              ? "new"
              : status === "pe"
              ? "pending"
              : status === "pr"
              ? "in progress"
              : status === "co"
              ? "completed"
              : status === "ho"
              ? "handed over"
              : "cancelled"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">
            Timestamp:
          </span>
          <span className="text-gray-700 text-sm">
            {new Date(timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">Price:</span>
          <span className="text-base font-semibold text-gray-800">
            Php {price}.00
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">
            Reference Number:
          </span>
          <span className="text-gray-700 text-sm">{referenceNumber}</span>
        </div>
      </div>
    </div>
  );
};

const NoOrdersComponent = () => {
  return (
    <div className="my-8 max-w-sm mx-auto bg-white p-6 rounded-md shadow-md text-center">
      <h2 className="text-xl font-semibold text-gray-700">No Orders Found</h2>
      <p className="text-gray-500 mt-2">
        It looks like you have no orders yet. Check back later!
      </p>
    </div>
  );
};
