// Files attached to a form submission (logs, screenshots). They're held back
// until the submission passes its other checks, then checked here and uploaded.

import { checkFile } from "./fileValidationService";
import { anonymizeLogs, shouldAnonymizeLog } from "./logFilterService";
import { uploadFileToR2 } from "./r2Service";

export type Attachments = [field: string, file: File][];
export type CheckedAttachment = {
	field: string;
	file: File;
	contentType: string;
};

// Returns the files with the content type to store them as, or the first
// file's error message.
export async function checkAttachments(
	files: Attachments,
): Promise<CheckedAttachment[] | string> {
	const checked: CheckedAttachment[] = [];
	for (const [field, file] of files) {
		const result = await checkFile(field, file);
		if (!result.ok) return result.message;
		checked.push({ field, file, contentType: result.contentType });
	}
	return checked;
}

// Uploads the files and puts their URLs in the body. Returns the R2 keys, so
// the uploads can be deleted if the issue isn't created.
export async function uploadAttachments(
	bucket: R2Bucket | undefined,
	body: Record<string, unknown>,
	files: CheckedAttachment[],
	filePrefix: string,
) {
	const keys: string[] = [];
	for (const { field, file, contentType } of files) {
		if (!bucket) {
			body[field] = null;
			continue;
		}
		try {
			const upload = shouldAnonymizeLog(file.name, body)
				? await anonymizeLogs(file)
				: file;
			const { key, url } = await uploadFileToR2(
				bucket,
				filePrefix,
				upload,
				contentType,
			);
			keys.push(key);
			body[field] = url;
			body[`${field}_name`] = upload.name;
		} catch (uploadErr) {
			console.error(`Failed to upload file for ${field}:`, uploadErr);
			body[field] = null;
		}
	}
	return keys;
}
