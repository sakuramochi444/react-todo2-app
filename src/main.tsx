// import { StrictMode } from "react"; // ◀◀◀ 削除 (またはコメントアウト)
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode> ◀◀◀ 削除
  <App />,
  // </StrictMode> ◀◀◀ 削除
);