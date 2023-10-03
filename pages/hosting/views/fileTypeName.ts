export function fileTypeName(fileType: string) {
    const mimeType = fileType.split(";").at(0);
    if (!mimeType) return fileType + " File";
    return mimeType.split("/").at(-1)?.toUpperCase() + " Document";
}