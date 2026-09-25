window.showModal = (content) => {
	const dialog = document.getElementById("message-dialog");
	const textEl = document.getElementById("message-dialog-text");
	if (!dialog || !textEl) return;

	if (typeof content === "object") {
		textEl.textContent = JSON.stringify(content, null, 2);
	} else {
		textEl.textContent = String(content);
	}

	if (typeof dialog.showModal === "function") {
		dialog.showModal();
	} else {
		dialog.setAttribute("open", "true");
	}
};
