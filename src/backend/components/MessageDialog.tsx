import type { FC } from "hono/jsx";
import { Script } from "vite-ssr-components/hono";

export const MessageDialog: FC = () => {
	return (
		<>
			<dialog id="message-dialog">
				<header>Message</header>
				<p id="message-dialog-text" style="white-space: pre-wrap;"></p>
				<form
					method="dialog"
					style="display: flex; justify-content: center; margin-top: 1rem;"
				>
					<button commandfor="message-dialog" command="close" type="button">
						OK
					</button>
				</form>
			</dialog>
			<Script type="module" src="/src/frontend/components/MessageDialog.js" />
		</>
	);
};
