const sanitizeRelativePath = (value: string | undefined) => {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  const prefixed = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed
}

const DEFAULT_SERVER_SIDE_BASE = '/api/serverSideServices'

const resolvedBasePath =
  sanitizeRelativePath(process.env.NEXT_PUBLIC_SERVER_SERVICES_BASE_PATH) ??
  DEFAULT_SERVER_SIDE_BASE

const joinPath = (...segments: string[]) =>
  segments
    .filter(Boolean)
    .map((segment, index) => {
      if (!segment) return ''
      if (index === 0) return segment
      return segment.startsWith('/') ? segment : `/${segment}`
    })
    .join('')

const cacheRoot = joinPath(resolvedBasePath, 'cache')

export const apiEndpoints = {
  serverSideServices: {
    basePath: resolvedBasePath,
    graphql: joinPath(resolvedBasePath, 'graphql'),
    cache: {
      root: cacheRoot,
      entry: (key: string) => joinPath(cacheRoot, encodeURIComponent(key)),
    },
  },
}

export type ApiEndpoints = typeof apiEndpoints

export const apiEndpointUtils = {
  sanitizeRelativePath,
  joinPath,
}

