import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/animations.css";
import "./styles/auth.css";
import "./styles/hero.css";
import "./styles/input.css";
import "./styles/button.css";
import "./styles/otp.css";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);