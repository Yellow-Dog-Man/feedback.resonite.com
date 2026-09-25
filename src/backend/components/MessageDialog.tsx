import { FC } from "hono/jsx";
import "formsmd/dist/css/formsmd.min.css";

export const MessageDialog: FC = () => {
	return (
		<>
			<dialog id="message-dialog">
				<header>Message</header>
				<p id="message-dialog-text" style="white-space: pre-wrap;"></p>
				<form
					method="dialog"
					style="display: flex; justify-content: flex-end; margin-top: 1rem;"
				>
					<button>OK</button>
				</form>
			</dialog>
			<script
				type="module"
				src="/src/frontend/components/MessageDialog.js"
			></script>
		</>
	);
};
