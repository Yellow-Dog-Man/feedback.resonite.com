//TODO: config
const BLOB_DOMAIN = "https://blob.feedback.resonite.com/";

function processKey(key) {
    return key.replaceAll(" ", "");
}

export async function uploadFileToR2(bucket, filePrefix, file) {
    if (!file || typeof file === 'string' || !(file instanceof File || file instanceof Blob))
        throw new Error("Invalid file: " + file);

    const uniqueId = filePrefix =="" ? crypto.randomUUID() : filePrefix;
    const originalName = file.name || 'attachment';
    const key = processKey(`${new Date().toISOString().split('T')[0]}/${uniqueId}/${originalName}`);

    await bucket.put(key, file.stream(), {
        httpMetadata: {
            contentType: file.type || 'application/octet-stream',
        },
    });

    return BLOB_DOMAIN + key;
}
