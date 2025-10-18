export const GET_PRODUCT_DETAIL = /* GraphQL */ `
  query GetProductDetail($id: ID!) {
    product: getProductById(id: $id) {
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
    reviews: getReviews(productId: $id) {
      id
      userId
      rating
      reviewText
      createdAt
    }
  }
`

