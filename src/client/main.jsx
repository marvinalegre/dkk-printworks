import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root, { loader as rootLoader } from "./routes/Root";
import LoginForm, {
  action as loginAction,
  loader as loginLoader,
} from "./routes/LoginForm";
import LogoutPage, { loader as logoutPageLoader } from "./routes/LogoutPage";
import OrderForm from "./components/OrderForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      { index: true, element: <OrderForm /> },
      {
        path: "/login",
        element: <LoginForm />,
        action: loginAction,
        loader: loginLoader,
      },
      {
        path: "/marvinalegre",
        element: <p className="p-8">under construction</p>,
      },
      { path: "/logout", element: <LogoutPage />, loader: logoutPageLoader },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
