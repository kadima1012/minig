import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { QuizPage } from "./pages/quiz/QuizPage";
import { RpsPage } from "./pages/rps/RpsPage";
import { FindDifferencePage } from "./pages/find-difference/FindDifferencePage";
import { PriceComparePage } from "./pages/price-compare/PriceComparePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/quiz", element: <QuizPage /> },
  { path: "/rps", element: <RpsPage /> },
  { path: "/find-difference", element: <FindDifferencePage /> },
  { path: "/price-compare", element: <PriceComparePage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
