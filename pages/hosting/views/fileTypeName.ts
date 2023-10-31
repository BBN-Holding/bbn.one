export function fileTypeName(fileType: string) {
    const mimeType = fileType.split(";").at(0);
    if (!mimeType) return fileType + " File";
    if (mimeType === "application/octet-stream")
        return "Binary File";

    return mimeType.split("/").at(-1)?.toLocaleUpperCase() + " Document";
}