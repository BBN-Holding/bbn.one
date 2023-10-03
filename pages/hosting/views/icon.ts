import { RemotePath } from "../loading.ts";

const fileNameIncludes: Record<string, string> = {
    "world": "globe2",
    "world_nether": "globe2",
    "world_the_end": "globe2",
    "logs": "body-text",
    "plugins": "plug",
    "mods": "box-seam",
    "config": "gear"
};

const supportedFiletypes = [
    'aac',
    'ai',
    'bmp',
    'cs',
    'css',
    'csv',
    'doc',
    'docx',
    'exe',
    'gif',
    'heic',
    'html',
    'java',
    'jpg',
    'js',
    'json',
    'jsx',
    'key',
    'm4p',
    'md',
    'mdx',
    'mov',
    'mp3',
    'mp4',
    'otf',
    'pdf',
    'php',
    'png',
    'ppt',
    'pptx',
    'psd',
    'py',
    'raw',
    'rb',
    'sass',
    'scss',
    'sh',
    'sql',
    'svg',
    'tiff',
    'tsx',
    'ttf',
    'txt',
    'wav',
    'woff',
    'xls',
    'xlsx',
    'xml',
    'yml',
];

const otherFiletypes: Record<string, string> = {
    'zip': 'archive',
    'tar': 'archive',
    'gz': 'archive',
    '7z': 'archive',
    'rar': 'archive',
    'yaml': 'filetype-yml',
    'jar': 'filetype-java',
};

export function mapFiletoIcon(file: RemotePath) {
    if (!file.fileMimeType) {
        return fileNameIncludes[ file.name ] ?? "folder";
    }
    //const filetype = file.fileMimeType.split(';')[0].split('/')[1].split('-').at(-1);
    const filetype = file.name.split('.').at(-1);
    if (!filetype) return "file-earmark";
    if (supportedFiletypes.includes(filetype))
        return "filetype-" + filetype;
    if (otherFiletypes[ filetype ])
        return otherFiletypes[ filetype ];
    return "file-earmark";
}