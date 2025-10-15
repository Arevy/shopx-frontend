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

export const getPublicGraphqlEndpoint = () => sanitizeEnv(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT)

export const getGraphqlEndpoint = () => getPublicGraphqlEndpoint() ?? DEFAULT_GRAPHQL_ENDPOINT

export const envUtils = {
  sanitizeEnv,
  getPublicGraphqlEndpoint,
  getGraphqlEndpoint,
}

