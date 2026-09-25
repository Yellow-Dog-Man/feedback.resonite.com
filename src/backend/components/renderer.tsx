import { jsxRenderer } from "hono/jsx-renderer";
import { Script, Link, ViteClient } from "vite-ssr-components/hono";
import { TURNSTILE_SITE_KEY } from "../helpers/TurnstileConfig";
import { MessageDialog } from "./MessageDialog";

export const renderer = jsxRenderer(({ children }) => {
	// <! DOCTYPE etc, is automatically added by jsxRenderer
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="turnstile-site-key" content={TURNSTILE_SITE_KEY} />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<title>Submit Feedback</title>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css"
				/>
				<Link href="/src/style.css" rel="stylesheet" />
				<script
					src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
					async
					defer
				></script>
				<ViteClient />
				<Script src="/src/frontend/main.js" />
			</head>
			<body>
				<header>
					<img src="/images/resonite.png" alt="Resonite logo"/>
					<h1>Submit Feedback</h1>
				</header>
				<main>{children}</main>
				<MessageDialog />
			</body>
		</html>
	);
});
