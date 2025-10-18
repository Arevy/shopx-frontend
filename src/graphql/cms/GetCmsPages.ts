export const GET_CMS_PAGES = /* GraphQL */ `
  query GetCmsPages {
    getCmsPages {
      id
      slug
      title
      excerpt
      status
      updatedAt
    }
  }
`

