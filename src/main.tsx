import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/mitr/400.css";
import "@fontsource/mitr/500.css";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "./styles.css";
import App from "./App";
import { StoreProvider } from "./store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);
