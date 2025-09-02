import { useRoutes } from "react-router-dom";
import Home from "./routes/home.jsx";
import Upload from "./routes/upload.jsx";
import Resume from "./routes/resume.jsx";
import Auth from "./routes/auth.jsx";

function App() {
  const routes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/auth", element: <Auth /> },
    { path: "/upload", element: <Upload /> },
    { path: "/resume/:id", element: <Resume /> },
  ]);

  return routes;
}

export default App;
