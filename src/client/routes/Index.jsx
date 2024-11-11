import { useLoaderData, useNavigate } from "react-router-dom";

export const loader = async () => {
  const res = await fetch("/api/user");
  const { loggedIn } = await res.json();

  return { loggedIn };
};

export default function Index() {
  const navigate = useNavigate();
  const { loggedIn } = useLoaderData();

  return (
    <div className="max-w-72 mx-auto">
      <img
        src="https://robohash.org/2E0.png?set=set1"
        className="my-5 mx-auto border"
      />
      <button
        onClick={() => {
          if (!loggedIn) {
            navigate("/login");
          } else {
            navigate("/order");
          }
        }}
        className="border p-3 rounded hover:text-gray-500"
      >
        Start order
      </button>
    </div>
  );
}
