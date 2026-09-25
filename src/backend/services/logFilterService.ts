export function anonymizeLogs(log: File): File {
    return log;
}

export function canFilter(fileName:string, formBody: any) {
    if (formBody.anonymizeLogs !== undefined && formBody.anonymizeLogs)
        return fileName.endsWith("log");

    return false;
}