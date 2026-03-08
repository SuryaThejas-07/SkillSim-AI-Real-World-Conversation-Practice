import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/lib/apiTest"; // Initialize API tests in development

createRoot(document.getElementById("root")!).render(<App />);
