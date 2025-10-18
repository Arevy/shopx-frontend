import type { NextApiRequest, NextApiResponse } from 'next'

import { getGraphqlEndpoint, getRedisDefaultTtl } from '@/config/env'
import { redisCache } from '@/server/redis/cacheRepository'
import { getOperationMetadata } from '@/server/graphql/operationMetadata'
import { createGraphqlCacheKey } from '@/server/graphql/executeWithCache'

type GraphQLPayload = {
  query?: string
  variables?: Record<string, unknown>
  operationName?: string
}

type CachedGraphQLPayload = {
  data?: unknown
  errors?: unknown
}

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

const forwardHeaders = (response: Response, target: NextApiResponse) => {
  const setCookieHeaders: string[] = []

  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase()

    if (hopByHopHeaders.has(lower)) {
      return
    }

    if (lower === 'set-cookie') {
      setCookieHeaders.push(value)
      return
    }

    target.setHeader(key, value)
  })

  if (setCookieHeaders.length > 0) {
    target.setHeader('Set-Cookie', setCookieHeaders)
  }
}

const parseBody = (req: NextApiRequest): GraphQLPayload => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as GraphQLPayload
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[GraphQL API] failed to parse body', error)
      }
      return {}
    }
  }

  return (req.body ?? {}) as GraphQLPayload
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Only POST is supported.' })
    return
  }

  const payloadBody = parseBody(req)
  const { query, variables, operationName } = payloadBody

  if (!query) {
    res.status(400).json({ error: 'Missing GraphQL query.' })
    return
  }

  const cacheKeyHeader = req.headers['x-cache-key']
  const ttlHeader = req.headers['x-cache-ttl']
  const skipHeader = req.headers['x-cache-skip']

  const cacheKey = Array.isArray(cacheKeyHeader) ? cacheKeyHeader[0] : cacheKeyHeader
  const ttlSecondsRaw = Array.isArray(ttlHeader) ? ttlHeader[0] : ttlHeader
  const skipCacheFlag = Array.isArray(skipHeader) ? skipHeader[0] : skipHeader

  const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : undefined
  const skipCache =
    skipCacheFlag === '1' ||
    skipCacheFlag === 'true' ||
    skipCacheFlag === 'yes'

  const requestHeaders: Record<string, string | undefined> = {
    authorization: req.headers.authorization,
    cookie: req.headers.cookie,
  }

  const metadata = getOperationMetadata(query)
  const shouldCache = metadata.type === 'query' && !skipCache

  const derivedCacheKey =
    cacheKey ??
    (shouldCache
      ? createGraphqlCacheKey(metadata.name, metadata.type, query, variables)
      : undefined)

  if (derivedCacheKey && shouldCache) {
    const cached = await redisCache.get<CachedGraphQLPayload>(derivedCacheKey)
    if (cached !== undefined) {
      res.status(200).json(cached)
      return
    }
  }

  const backendHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (requestHeaders.authorization) {
    backendHeaders.Authorization = requestHeaders.authorization
  }

  if (requestHeaders.cookie) {
    backendHeaders.Cookie = requestHeaders.cookie
  }

  if (req.headers.origin) {
    backendHeaders.Origin = Array.isArray(req.headers.origin)
      ? req.headers.origin[0]
      : req.headers.origin
  }

  const payload = JSON.stringify({
    query,
    variables,
    operationName,
  })

  let backendResponse: Response
  try {
    backendResponse = await fetch(getGraphqlEndpoint(), {
      method: 'POST',
      headers: backendHeaders,
      body: payload,
      redirect: 'manual',
      cache: 'no-store',
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[GraphQL API] upstream request failed', error)
    }
    res.status(502).json({ error: 'Failed to reach GraphQL upstream.' })
    return
  }

  forwardHeaders(backendResponse, res)

  const responseText = await backendResponse.text()

  if (derivedCacheKey && shouldCache && backendResponse.ok) {
    try {
      const parsed = JSON.parse(responseText) as CachedGraphQLPayload
      if (!parsed.errors) {
        const ttl =
          Number.isFinite(ttlSeconds) && ttlSeconds && ttlSeconds > 0
            ? Number(ttlSeconds)
            : getRedisDefaultTtl()
        await redisCache.set(derivedCacheKey, parsed, ttl)
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[GraphQL API] failed to cache response', error)
      }
    }
  }

  res.status(backendResponse.status).send(responseText)
}

export default handler
