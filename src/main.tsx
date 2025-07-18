import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "primereact/resources/themes/mira/theme.css";
import { PrimeReactProvider } from "primereact/api";
import App from "./App.tsx";

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(
		<StrictMode>
			<PrimeReactProvider>
				<App />
			</PrimeReactProvider>
		</StrictMode>,
	);
}
