import * as React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/app/app";

const $root = document.getElementById("root");
if ($root != null) {
	const root = createRoot($root);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
