import { BLOB_URL } from "../../config";

//TODO: config
function processKey(key: string) {
	return key.replaceAll(" ", "");
}

export async function uploadFileToR2(
	bucket: R2Bucket,
	filePrefix: string,
	file: File,
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
		httpMetadata: {
			contentType: file.type || "application/octet-stream",
		},
	});

	return BLOB_URL + key;
}
