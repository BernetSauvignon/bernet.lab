import { useEffect } from "react";
import ContentDetail from "@/pages/ContentDetail";
import NotFound from "@/pages/NotFound";
import SocialPage from "@/pages/Social";
import { basePathForRouter } from "@/lib/path";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function AnalyticsPageTracker() {
  const [location] = useLocation();

  useEffect(() => {
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
    if (!gaMeasurementId || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

function Router() {
  return (
    <WouterRouter base={basePathForRouter()}>
      <AnalyticsPageTracker />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/content/:id"} component={ContentDetail} />
        <Route path={"/social"} component={SocialPage} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
