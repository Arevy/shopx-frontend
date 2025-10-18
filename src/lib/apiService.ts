import { ClientError, GraphQLClient } from 'graphql-request'
import type { Variables } from 'graphql-request'

import { emitSessionExpired, markSessionExpired } from '@lib/authEvents'
import { getGraphqlEndpoint, getUseServerServices } from '@/config/env'
import { apiEndpoints } from '@/config/apiEndpoints'

const SESSION_ERROR_MATCHERS = [
  /authentication required/i,
  /not authorized/i,
  /support authentication required/i,
]

type ExecuteOptions = {
  cacheKey?: string
  skipCache?: boolean
  ttlSeconds?: number
}

const detectOperationType = (query: string) => {
  const sanitized = query.replace(/^#.*$/gm, '').trimStart()

  if (sanitized.startsWith('query')) return 'query'
  if (sanitized.startsWith('mutation')) return 'mutation'
  if (sanitized.startsWith('subscription')) return 'subscription'

  return 'unknown'
}

export class ApiService {
  private readonly client: GraphQLClient
  private readonly endpoint: string
  private readonly isServer: boolean
  private readonly useServerServices: boolean
  private authToken?: string

  constructor(endpoint?: string) {
    this.isServer = typeof window === 'undefined'
    const useServerServices = getUseServerServices()
    this.useServerServices = !this.isServer && useServerServices

    let resolvedEndpoint =
      endpoint ??
      (this.isServer || !useServerServices
        ? getGraphqlEndpoint()
        : apiEndpoints.serverSideServices.graphql)

    if (!this.isServer && resolvedEndpoint.startsWith('/')) {
      const origin = window.location.origin ?? ''
      resolvedEndpoint = `${origin}${resolvedEndpoint}`
    }

    this.endpoint = resolvedEndpoint

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[ApiService] GraphQL endpoint', this.endpoint)
    }

    this.client = new GraphQLClient(this.endpoint, {
      credentials: 'include',
    })
  }

  setAuthToken(token?: string) {
    this.authToken = token
  }

  async execute<TData, TVariables extends object = Record<string, unknown>>(
    query: string,
    variables?: TVariables,
    options?: ExecuteOptions,
  ): Promise<TData> {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[ApiService] execute', {
        endpoint: this.endpoint,
        variables,
        options,
      })
    }

    const typedVariables = variables as Variables | undefined
    const operationType = detectOperationType(query)
    const shouldSkipCache = options?.skipCache ?? operationType !== 'query'
    const authHeaders = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined

    try {
      if (this.isServer || !this.useServerServices) {
        return typedVariables
          ? await this.client.request<TData>(query, typedVariables, authHeaders)
          : await this.client.request<TData>(query, undefined, authHeaders)
      }

      const cacheHeaders: Record<string, string> = {}

      if (options?.cacheKey) {
        cacheHeaders['x-cache-key'] = options.cacheKey
      }

      if (options?.ttlSeconds) {
        cacheHeaders['x-cache-ttl'] = `${options.ttlSeconds}`
      }

      if (shouldSkipCache) {
        cacheHeaders['x-cache-skip'] = '1'
      }

      const hasCacheHeaders = Object.keys(cacheHeaders).length > 0

      const requestHeaders =
        authHeaders || hasCacheHeaders
          ? { ...(authHeaders ?? {}), ...(hasCacheHeaders ? cacheHeaders : {}) }
          : undefined

      return typedVariables
        ? await this.client.request<TData>(query, typedVariables, requestHeaders)
        : await this.client.request<TData>(query, undefined, requestHeaders)
    } catch (error) {
      if (error instanceof ClientError) {
        const sessionError = error.response.errors?.some((graphQLError) => {
          const message = graphQLError.message ?? ''
          return SESSION_ERROR_MATCHERS.some((matcher) => matcher.test(message))
        })

        if (sessionError) {
          markSessionExpired(error)
          emitSessionExpired()
        }
      }

      throw error
    }
  }
}

export default ApiService
