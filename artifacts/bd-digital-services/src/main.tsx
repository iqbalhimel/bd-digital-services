import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const STORAGE_KEY = "bd-theme";
const stored = localStorage.getItem(STORAGE_KEY);
const prefersDark = stored === "dark" || (!stored && !window.matchMedia("(prefers-color-scheme: light)").matches);
if (prefersDark) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
