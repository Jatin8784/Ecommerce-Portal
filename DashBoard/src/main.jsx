import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider>
      <App />
      <Toaster richColors closeButton position="top-center" />
    </ThemeProvider>
  </Provider>
);
