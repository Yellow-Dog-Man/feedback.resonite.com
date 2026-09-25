import { processLog } from "../helpers/LogRedactor.js";

export async function anonymizeLogs(log: File): Promise<File> {
	try {
		const text = await log.text();
		const result = processLog(text);
		return new File([result.text], log.name, {
			type: log.type || "text/plain",
			lastModified: log.lastModified || Date.now(),
		});
	} catch (err) {
		console.error("Failed to anonymize log file:", err);
		return log;
	}
}

export function shouldAnonymizeLog(
	fileName: string,
	formBody: Record<string, unknown>,
) {
	if (formBody.anonymizeLogs !== undefined && formBody.anonymizeLogs)
		return fileName.endsWith("log");

	return false;
}
