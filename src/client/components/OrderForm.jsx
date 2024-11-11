import { redirect } from "react-router-dom";

export const loader = async () => {
  const res = await fetch("/api/user");
  const { loggedIn } = await res.json();

  if (!loggedIn) {
    return redirect("/login");
  } else {
    return null;
  }
};

export default function OrderComponent() {
  return (
    <div className="p-1 md:p-8">
      <h2 className="text-xl">Order Pad</h2>
    </div>
  );
}
