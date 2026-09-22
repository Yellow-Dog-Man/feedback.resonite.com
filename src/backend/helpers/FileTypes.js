export function isLog(originalName, file) {
    const lowerName = originalName.toLowerCase();
    const mimeType = (file.type || '').toLowerCase();
    // Must be a .log extension and text file type
    const isLogExt = lowerName.endsWith('.log');
    const isTextMime = mimeType.startsWith('text/') || mimeType === '' || mimeType === 'application/x-log' || mimeType === 'inode/x-empty';
    if (!isLogExt || !isTextMime) {
        return false;
    }

    return true;
}

export function isImage(originalName, file) {
    const lowerName = originalName.toLowerCase();
    const mimeType = (file.type || '').toLowerCase();
    // Must be png or jpg/jpeg
    const isImageExt = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg');
    const isImageMime = mimeType.startsWith('image/png') || mimeType.startsWith('image/jpeg') || mimeType === '';
    if (!isImageExt || !isImageMime) {
        throw new Error("Invalid screenshot file: must be a png or jpg image.");
    }
}