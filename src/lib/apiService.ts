import { ClientError, GraphQLClient } from 'graphql-request'
import type { Variables } from 'graphql-request'

import { emitSessionExpired, markSessionExpired } from '@lib/authEvents'
import { getGraphqlEndpoint } from '@/config/env'

const SESSION_ERROR_MATCHERS = [
  /authentication required/i,
  /not authorized/i,
  /support authentication required/i,
]

export class ApiService {
  private readonly client: GraphQLClient
  private readonly endpoint: string
  private authToken?: string

  constructor(endpoint?: string) {
    this.endpoint = endpoint ?? getGraphqlEndpoint()

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
  ): Promise<TData> {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[ApiService] execute', {
        endpoint: this.endpoint,
        variables,
      })
    }

    const typedVariables = variables as Variables | undefined

    try {
      const requestHeaders = this.authToken
        ? { Authorization: `Bearer ${this.authToken}` }
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
