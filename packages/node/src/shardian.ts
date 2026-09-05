export type InsufficientChars = 'ignore' | 'warn' | 'throw'

export type ShardianOption = {
  dirLetterCount?: number
  dirNestDepth?: number
  stripHeadSlash?: boolean
  insufficientChars?: InsufficientChars
  splitPathFilename?: boolean
  extensionOnlyList?: string[]
}

export type ShardianSplitPath = {
  fullPath: string
  pathOnly: string
  fileNameOnly: string
}

export const COMMON_EXTENSIONS: string[] = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.bmp',
  '.ico',
  '.tif',
  '.tiff',
  '.heic',
  '.avif',
  '.mp3',
  '.wav',
  '.flac',
  '.aac',
  '.ogg',
  '.m4a',
  '.wma',
  '.mp4',
  '.webm',
  '.mov',
  '.avi',
  '.mkv',
  '.m4v',
  '.wmv',
  '.pdf',
  '.txt',
  '.md',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.csv',
  '.rtf',
  '.odt',
  '.ods',
  '.odp',
  '.zip',
  '.tar',
  '.gz',
  '.tgz',
  '.tar.gz',
  '.7z',
  '.rar',
  '.bz2',
  '.xz',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.json',
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.xml',
  '.yml',
  '.yaml',
  '.toml',
  '.php',
  '.py',
  '.rb',
  '.go',
  '.rs',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.cs',
  '.sh',
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.eot',
]

type ShardianSplitOptions = ShardianOption & { splitPathFilename: true }

export function shardian(
  fileName: string,
  option: ShardianSplitOptions,
): ShardianSplitPath
export function shardian(fileName: string, option?: ShardianOption): string
export function shardian(
  fileName: string,
  option?: ShardianOption,
): string | ShardianSplitPath {
  const {
    dirLetterCount = 1,
    dirNestDepth = 4,
    stripHeadSlash = false,
    insufficientChars = 'ignore',
    splitPathFilename = false,
    extensionOnlyList,
  } = option ?? {}

  if (fileName === '') {
    throw new Error('fileName must not be empty')
  }
  if (
    fileName === '.' ||
    fileName === '..' ||
    fileName === './' ||
    fileName === '../'
  ) {
    throw new Error('fileName must not be a relative path reference')
  }
  if (fileName.includes('/') || fileName.includes('\\')) {
    throw new Error('fileName must not contain path separators')
  }
  if (dirLetterCount < 1) {
    throw new Error('dirLetterCount must be >= 1')
  }
  if (dirNestDepth < 1) {
    throw new Error('dirNestDepth must be >= 1')
  }

  const resolvedExtensionList =
    extensionOnlyList === undefined || extensionOnlyList.length === 0
      ? COMMON_EXTENSIONS
      : extensionOnlyList

  for (const ext of resolvedExtensionList) {
    if (!ext.startsWith('.')) {
      throw new Error(
        `extensionOnlyList entries must start with '.': received ${ext}`,
      )
    }
  }

  const lowerName = fileName.toLowerCase()
  for (const ext of resolvedExtensionList) {
    if (lowerName === ext.toLowerCase()) {
      throw new Error(`fileName must not be extension-only: ${fileName}`)
    }
  }

  const chars = Array.from(fileName)
  const segments: string[] = []
  let offset = 0

  for (let i = 0; i < dirNestDepth; i++) {
    if (chars.length - offset < dirLetterCount) {
      break
    }
    segments.push(chars.slice(offset, offset + dirLetterCount).join(''))
    offset += dirLetterCount
  }

  if (segments.length < dirNestDepth) {
    if (insufficientChars === 'throw') {
      throw new Error(
        `shardian: requested depth ${dirNestDepth} but only ${segments.length} segment(s) for fileName=${fileName}`,
      )
    }
    if (insufficientChars === 'warn') {
      console.warn(
        `shardian: requested depth ${dirNestDepth} but only ${segments.length} segment(s) for fileName=${fileName}`,
      )
    }
  }

  const { fullPath, pathOnly } = assemblePaths(segments, fileName, stripHeadSlash)

  if (!splitPathFilename) {
    return fullPath
  }

  return {
    fullPath,
    pathOnly,
    fileNameOnly: fileName,
  }
}

function assemblePaths(
  segments: string[],
  fileName: string,
  stripHeadSlash: boolean,
): { fullPath: string; pathOnly: string } {
  let pathOnly: string
  if (segments.length === 0) {
    pathOnly = stripHeadSlash ? '' : '/'
  } else {
    const body = segments.join('/')
    pathOnly = stripHeadSlash ? `${body}/` : `/${body}/`
  }

  let fullPath: string
  if (segments.length === 0) {
    fullPath = stripHeadSlash ? fileName : `/${fileName}`
  } else {
    const body = segments.join('/')
    fullPath = stripHeadSlash ? `${body}/${fileName}` : `/${body}/${fileName}`
  }

  return { fullPath, pathOnly }
}
