import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="max-w-72 mx-auto">
      <img
        src="https://robohash.org/2E0.png?set=set1"
        className="my-5 mx-auto border"
      />
      <Link to="/order">Start order</Link>
    </div>
  );
}
