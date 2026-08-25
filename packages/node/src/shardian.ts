export function shardian(
  fileName: string,
  segmentLength: number,
  depth: number,
  includeFileName: boolean,
): string {
  if (fileName === '') {
    throw new Error('fileName must not be empty')
  }
  if (fileName.includes('/') || fileName.includes('\\')) {
    throw new Error('fileName must not contain path separators')
  }
  if (segmentLength < 1) {
    throw new Error('segmentLength must be >= 1')
  }
  if (depth < 1) {
    throw new Error('depth must be >= 1')
  }

  const chars = Array.from(fileName)
  const segments: string[] = []
  let offset = 0

  for (let i = 0; i < depth; i++) {
    if (chars.length - offset < segmentLength) {
      break
    }
    segments.push(chars.slice(offset, offset + segmentLength).join(''))
    offset += segmentLength
  }

  if (segments.length < depth) {
    console.warn(
      `shardian: requested depth ${depth} but only ${segments.length} segment(s) for fileName=${fileName}`,
    )
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
