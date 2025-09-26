import { ClientError, GraphQLClient } from 'graphql-request'
import type { Variables } from 'graphql-request'

import { emitSessionExpired, markSessionExpired } from '@lib/authEvents'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:4000/graphql'

export async function requestGraphQL<
  TData,
  TVariables extends object = Record<string, unknown>,
>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[GraphQL request]', {
      endpoint,
      variables,
    })
  }
  const client = new GraphQLClient(endpoint, {
    credentials: 'include',
  })

  const typedVariables = variables as Variables | undefined

  try {
    return typedVariables
      ? await client.request<TData>(query, typedVariables)
      : await client.request<TData>(query)
  } catch (error) {
    if (error instanceof ClientError) {
      const sessionError = error.response.errors?.some((graphQLError) => {
        const message = graphQLError.message ?? ''
        return (
          message.includes('Authentication required') ||
          message.includes('You are not authorized') ||
          message.includes('Support authentication required')
        )
      })

      if (sessionError) {
        markSessionExpired(error)
        emitSessionExpired()
      }
    }

    throw error
  }
}
