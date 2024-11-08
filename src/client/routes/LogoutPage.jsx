import { redirect } from "react-router-dom";

export async function loader() {
  const res = await fetch("/api/logout");
  const { success } = await res.json();

  if (success) {
    return redirect("/");
  }

  return null;
}

export default function Logout() {
  return <p className="p-6">Logging out...</p>;
}
