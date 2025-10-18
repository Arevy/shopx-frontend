const sanitizeEnv = (value: string | undefined) => {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const commentMatch = /\s#[^]*$/.exec(trimmed)
  if (commentMatch) {
    return trimmed.slice(0, commentMatch.index).trim() || undefined
  }

  return trimmed
}

const DEFAULT_GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql'
const DEFAULT_REDIS_URL = 'redis://127.0.0.1:6379'
const DEFAULT_CACHE_PREFIX = 'shopx:frontend'
const DEFAULT_CACHE_TTL_SECONDS = 300
const DEFAULT_SERVER_SERVICES_TOKEN = 'development'
const DEFAULT_USE_SERVER_SERVICES = false

export const getPublicGraphqlEndpoint = () => sanitizeEnv(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT)

export const getGraphqlEndpoint = () => getPublicGraphqlEndpoint() ?? DEFAULT_GRAPHQL_ENDPOINT

export const getRedisUrl = () => sanitizeEnv(process.env.REDIS_URL) ?? DEFAULT_REDIS_URL

export const getRedisCachePrefix = () =>
  sanitizeEnv(process.env.REDIS_CACHE_PREFIX) ?? DEFAULT_CACHE_PREFIX

export const getRedisDefaultTtl = () => {
  const rawTtl = sanitizeEnv(process.env.REDIS_CACHE_TTL)
  if (!rawTtl) return DEFAULT_CACHE_TTL_SECONDS

  const parsed = Number(rawTtl)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_CACHE_TTL_SECONDS
  }

  return Math.floor(parsed)
}

export const getServerServicesToken = () =>
  sanitizeEnv(process.env.SERVER_SERVICES_TOKEN) ?? DEFAULT_SERVER_SERVICES_TOKEN

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return fallback
}

export const getUseServerServices = () =>
  parseBoolean(sanitizeEnv(process.env.NEXT_PUBLIC_USE_SERVER_SERVICES), DEFAULT_USE_SERVER_SERVICES)

export const envUtils = {
  sanitizeEnv,
  getPublicGraphqlEndpoint,
  getGraphqlEndpoint,
  getRedisUrl,
  getRedisCachePrefix,
  getRedisDefaultTtl,
  getServerServicesToken,
  getUseServerServices,
}
