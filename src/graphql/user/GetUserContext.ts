export const GET_USER_CONTEXT = /* GraphQL */ `
  query GetUserContext($userId: ID!) {
    getUserContext(userId: $userId) {
      user {
        id
        email
        name
        role
      }
      cart {
        userId
        total
        items {
          quantity
          product {
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
      wishlist {
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
      addresses {
        id
        userId
        street
        city
        postalCode
        country
      }
    }
  }
`

