import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script, ViteClient } from "vite-ssr-components/hono";
import { MessageDialog } from "./MessageDialog";

export const renderer = jsxRenderer(({ children }) => {
	// <! DOCTYPE etc, is automatically added by jsxRenderer
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				{/* <link rel="icon" type="image/svg+xml" href="/favicon.svg" /> */}
				<title>Submit Feedback</title>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css"
					integrity="sha256-hTRSYUhpEmUIay0GrSZG58ztGFqdQ/dIVAXYHE16Xgo="
					crossorigin="anonymous"
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
					<img src="/images/resonite.png" alt="Resonite logo" />
					<h1>Submit Feedback</h1>
				</header>
				<main>{children}</main>
				<MessageDialog />
				<footer>
					<span>
						<a href="https://feedback.resonite.com">Feedback Home</a> |{" "}
						<a href="https://policies.resonite.com">Policies Page</a> |{" "}
						<a href="https://github.com/Yellow-Dog-Man/feedback.resonite.com">
							GitHub
						</a>
					</span>
					<span>
						Copyright ©{" "}
						<a href="https://yellowdogman.com">Yellow Dog Man Studios S.r.o.</a>
					</span>
				</footer>
			</body>
		</html>
	);
});
