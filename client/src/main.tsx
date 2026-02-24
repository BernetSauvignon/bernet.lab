import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/base.css";

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

if (gaMeasurementId) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement("script");
  inlineScript.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${gaMeasurementId}', { send_page_view: false });
  `;
  document.head.appendChild(inlineScript);
}

createRoot(document.getElementById("root")!).render(<App />);
