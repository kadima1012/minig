import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { QuizPage } from "./pages/quiz/QuizPage";
import { RpsPage } from "./pages/rps/RpsPage";
import { RpsMultiplayerPage } from "./pages/rps/RpsMultiplayerPage";
import { FindDifferencePage } from "./pages/find-difference/FindDifferencePage";
import { PriceComparePage } from "./pages/price-compare/PriceComparePage";
import { TriviaConquestPage } from "./pages/trivia-conquest/TriviaConquestPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AccountPage } from "./pages/auth/AccountPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/account", element: <AccountPage /> },
  { path: "/quiz", element: <QuizPage /> },
  { path: "/rps", element: <RpsPage /> },
  { path: "/rps/multiplayer", element: <RpsMultiplayerPage /> },
  { path: "/find-difference", element: <FindDifferencePage /> },
  { path: "/price-compare", element: <PriceComparePage /> },
  { path: "/trivia-conquest", element: <TriviaConquestPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
