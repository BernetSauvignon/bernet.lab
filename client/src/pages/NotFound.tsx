import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import "./NotFound.css";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="page not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon-wrap">
          <AlertCircle size={64} />
        </div>

        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <button type="button" className="btn-primary" onClick={() => setLocation("/")}>
          <Home size={16} />
          <span>Go Home</span>
        </button>
      </div>
    </div>
  );
}
