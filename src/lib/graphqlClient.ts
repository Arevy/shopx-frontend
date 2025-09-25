import { GraphQLClient } from 'graphql-request'
import type { Variables } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:4000/graphql'

export async function requestGraphQL<
  TData,
  TVariables extends object = Record<string, unknown>,
>(
  query: string,
  variables?: TVariables,
  token?: string,
): Promise<TData> {
  const client = new GraphQLClient(endpoint, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  })

  const typedVariables = variables as Variables | undefined

  return typedVariables
    ? client.request<TData>(query, typedVariables)
    : client.request<TData>(query)
}
