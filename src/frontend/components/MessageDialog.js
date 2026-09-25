window.showModal = (content, cb) => {
	const dialog = document.getElementById("message-dialog");
	const textEl = document.getElementById("message-dialog-text");
	if (!dialog || !textEl) return;

	if (typeof content === "object") {
		textEl.textContent = JSON.stringify(content, null, 2);
	} else {
		textEl.textContent = String(content);
	}

	const handleClose = () => {
		dialog.removeEventListener("close", handleClose);
		if (typeof cb === "function") {
			cb();
		}
	};

	dialog.addEventListener("close", handleClose);

	if (typeof dialog.showModal === "function") {
		dialog.showModal();
	} else {
		dialog.setAttribute("open", "true");
	}
};
