export const GET_CMS_PAGE = /* GraphQL */ `
  query GetCmsPage($slug: String!) {
    getCmsPage(slug: $slug) {
      id
      slug
      title
      excerpt
      body
      status
      updatedAt
      publishedAt
    }
  }
`

