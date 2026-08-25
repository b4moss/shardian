export type InsufficientChars = 'ignore' | 'warn' | 'throw'

export type ShardianOption = {
  fileName: string
  dirLetterCount: number
  dirNestDepth: number
  includeFileName?: boolean
  insufficientChars?: InsufficientChars
}

export function shardian(options: ShardianOption): string {
  const {
    fileName,
    dirLetterCount,
    dirNestDepth,
    includeFileName = true,
    insufficientChars = 'ignore',
  } = options

  if (fileName === '') {
    throw new Error('fileName must not be empty')
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

  if (includeFileName) {
    if (segments.length === 0) {
      return `/${fileName}`
    }
    return `/${segments.join('/')}/${fileName}`
  }

  if (segments.length === 0) {
    return '/'
  }
  return `/${segments.join('/')}`
}
