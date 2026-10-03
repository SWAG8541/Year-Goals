import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Restore the existing preference for every route, before the first render.
try {
  document.documentElement.classList.toggle('dark', localStorage.getItem('darkMode') === 'true');
} catch {
  // Keep the default light theme when browser storage is unavailable.
}

createRoot(document.getElementById("root")!).render(<App />);
