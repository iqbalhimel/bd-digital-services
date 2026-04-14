import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const STORAGE_KEY = "bd-theme";
const stored = localStorage.getItem(STORAGE_KEY);
const isLight =
  stored === "light" ||
  (stored !== "dark" && !stored && window.matchMedia("(prefers-color-scheme: light)").matches);
if (isLight) {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
