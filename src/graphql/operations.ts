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

export const GET_CATEGORIES = /* GraphQL */ `
  query GetCategories {
    getCategories {
      id
      name
      description
    }
  }
`

export const GET_CART = /* GraphQL */ `
  query GetCart($userId: ID!) {
    getCart(userId: $userId) {
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
  }
`

export const ADD_TO_CART = /* GraphQL */ `
  mutation AddToCart($userId: ID!, $productId: ID!, $quantity: Int!) {
    addToCart(userId: $userId, item: { productId: $productId, quantity: $quantity }) {
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
  }
`

export const REMOVE_FROM_CART = /* GraphQL */ `
  mutation RemoveFromCart($userId: ID!, $productId: ID!) {
    removeFromCart(userId: $userId, productId: $productId) {
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
  }
`

export const CLEAR_CART = /* GraphQL */ `
  mutation ClearCart($userId: ID!) {
    clearCart(userId: $userId)
  }
`

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

export const ADD_TO_WISHLIST = /* GraphQL */ `
  mutation AddToWishlist($userId: ID!, $productId: ID!) {
    addToWishlist(userId: $userId, productId: $productId) {
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

export const REMOVE_FROM_WISHLIST = /* GraphQL */ `
  mutation RemoveFromWishlist($userId: ID!, $productId: ID!) {
    removeFromWishlist(userId: $userId, productId: $productId) {
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

export const REGISTER = /* GraphQL */ `
  mutation Register($email: String!, $password: String!, $name: String) {
    register(email: $email, password: $password, name: $name) {
      id
      email
      name
      role
    }
  }
`

export const LOGIN = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`

export const LOGOUT = /* GraphQL */ `
  mutation Logout {
    logout
  }
`

export const REDEEM_IMPERSONATION = /* GraphQL */ `
  mutation RedeemImpersonation($token: String!) {
    redeemImpersonation(token: $token) {
      id
      email
      name
      role
    }
  }
`

export const CREATE_ORDER = /* GraphQL */ `
  mutation CreateOrder($userId: ID!, $products: [OrderProductInput!]!) {
    createOrder(userId: $userId, products: $products) {
      id
      userId
      total
      status
      products {
        quantity
        product {
          id
          name
          price
        }
      }
    }
  }
`

export const ADD_ADDRESS = /* GraphQL */ `
  mutation AddAddress(
    $userId: ID!
    $street: String!
    $city: String!
    $postalCode: String!
    $country: String!
  ) {
    addAddress(
      userId: $userId
      street: $street
      city: $city
      postalCode: $postalCode
      country: $country
    ) {
      id
      street
      city
      postalCode
      country
    }
  }
`

export const GET_ADDRESSES = /* GraphQL */ `
  query GetAddresses($userId: ID!) {
    getAddresses(userId: $userId) {
      id
      street
      city
      postalCode
      country
    }
  }
`
export const CREATE_PAYMENT = /* GraphQL */ `
  mutation CreatePayment($orderId: ID!, $amount: Float!, $method: String!) {
    createPayment(orderId: $orderId, amount: $amount, method: $method) {
      id
      orderId
      amount
      status
      method
    }
  }
`

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
