// Checks uploaded files by their contents. The name and type the client sends
// can't be trusted (Forms.md sends every file as application/octet-stream), so
// the content type stored in R2 comes from here too.
// Binary formats are detected from their signature bytes by file-type:
// https://github.com/sindresorhus/file-type

import { fileTypeFromBlob } from "file-type";

type FileKind = "log" | "image";

// Which kind of file each form field accepts. Fields not listed are rejected.
const FILE_FIELDS: Record<string, FileKind> = {
	logs: "log",
	screenshots: "image",
};

export type FileCheck =
	| { ok: true; contentType: string }
	| { ok: false; message: string };

export async function checkFile(field: string, file: File): Promise<FileCheck> {
	switch (FILE_FIELDS[field]) {
		case "log":
			return (await isLogFile(file))
				? { ok: true, contentType: "text/plain; charset=utf-8" }
				: { ok: false, message: "Logs must be a Resonite .log file" };
		case "image": {
			const contentType = await detectImageType(file);
			return contentType
				? { ok: true, contentType }
				: {
						ok: false,
						message: "Screenshots must be a PNG, JPEG, GIF or WebP image",
					};
		}
		default:
			return { ok: false, message: `Unexpected file in ${field}` };
	}
}

// Resonite writes plain UTF-8 text logs with a .log extension.
async function isLogFile(file: File) {
	if (!file.name.toLowerCase().endsWith(".log")) return false;

	// file-type only recognises binary formats, so a text log should have no type
	// If it does, it is NOT a log file
	if (await fileTypeFromBlob(file)) return false;

	// At this point its a file that is not binary.
	try {
		const text = new TextDecoder("utf-8", {
			fatal: true,
			ignoreBOM: false,
		}).decode(await file.arrayBuffer());
		// Binary files can decode as UTF-8 by chance, but won't be free of NULs.
		return !text.includes("\0");
	} catch {
		return false;
	}
}

const IMAGE_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp",
]);

// Returns the image's MIME type, or null if it isn't one we accept.
async function detectImageType(file: File) {
	const type = await fileTypeFromBlob(file);
	return type && IMAGE_TYPES.has(type.mime) ? type.mime : null;
}
