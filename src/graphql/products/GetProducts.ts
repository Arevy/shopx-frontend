export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts($limit: Int, $offset: Int, $name: String, $categoryId: ID) {
    getProducts(limit: $limit, offset: $offset, name: $name, categoryId: $categoryId) {
      id
      name
      price
      description
      categoryId
      image {
        url
        filename
        mimeType
        updatedAt
      }
    }
  }
`

