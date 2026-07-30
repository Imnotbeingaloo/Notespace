import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Force the serif faces to download immediately instead of waiting for the
// first element that uses them to be laid out. Without this, the wordmark and
// headings (site + app) can stay on the Georgia fallback until a reload.
if (typeof document !== "undefined" && "fonts" in document) {
  Promise.all([
    document.fonts.load("400 1rem Merriweather"),
    document.fonts.load("700 1rem Merriweather"),
    document.fonts.load("italic 400 1rem Merriweather"),
  ]).catch(() => { /* non-fatal */ });
}



createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
