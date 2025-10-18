export const GET_WISHLIST = /* GraphQL */ `
  query GetWishlist($userId: ID!) {
    getWishlist(userId: $userId) {
      userId
      products {
        id
        name
        price
        description
        categoryId
        image {
          url
        }
      }
    }
  }
`

