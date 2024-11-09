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
import SignUpPage, {
  action as signUpPageAction,
  loader as signUpPageLoader,
} from "./routes/SignUpPage";
import OrderForm from "./components/OrderForm";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      loader: rootLoader,
      children: [
        { index: true, element: <OrderForm /> },
        {
          path: "/marvinalegre",
          element: <p className="p-8">under construction</p>,
        },
        { path: "/logout", element: <LogoutPage />, loader: logoutPageLoader },
      ],
    },
    {
      path: "/login",
      element: <LoginForm />,
      action: loginAction,
      loader: loginLoader,
    },
    {
      path: "/signup",
      element: <SignUpPage />,
      action: signUpPageAction,
      loader: signUpPageLoader,
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
      v7_skipActionStatusRevalidation: true,
    },
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider
      future={{
        v7_startTransition: true,
      }}
      router={router}
    />
  </StrictMode>
);
