import { BLOB_URL } from "../../config";

//TODO: config
function processKey(key: string) {
	return key.replaceAll(" ", "");
}

// contentType comes from fileValidationService, never from the client, since
// blob.feedback.resonite.com serves files with it.
export async function uploadFileToR2(
	bucket: R2Bucket,
	filePrefix: string,
	file: File,
	contentType: string,
) {
	if (!file || typeof file === "string" || !(file instanceof File))
		throw new Error(`Invalid file: ${file}`);

	const uniqueId = filePrefix === "" ? crypto.randomUUID() : filePrefix;
	const originalName = file.name || "attachment";

	const key = processKey(
		`${new Date().toISOString().split("T")[0]}/${uniqueId}/${originalName}`,
	);

	//TODO: errors
	await bucket.put(key, file.stream(), {
		httpMetadata: { contentType },
	});

	return { key, url: BLOB_URL + key };
}

// Removes uploads from a submission that didn't make it into an issue.
export async function deleteFromR2(bucket: R2Bucket, keys: string[]) {
	if (keys.length === 0) return;
	try {
		await bucket.delete(keys);
	} catch (err) {
		console.error("Failed to delete orphaned uploads:", keys, err);
	}
}
