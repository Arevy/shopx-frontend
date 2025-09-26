import { makeAutoObservable, runInAction } from 'mobx'
import {
  GET_CATEGORIES,
  GET_PRODUCT_DETAIL,
  GET_PRODUCTS,
} from '@graphql/operations'
import { requestGraphQL } from '@lib/graphqlClient'
import type { Category, Product, Review } from '@/types/product'
import type { RootStore } from './rootStore'

interface ProductDetailResponse {
  product: Product | null
  reviews: Review[]
}

export class ProductStore {
  private readonly root: RootStore
  products: Product[] = []
  featured: Product[] = []
  newArrivals: Product[] = []
  categories: Category[] = []
  productDetail: Product | null = null
  productReviews: Review[] = []
  loading = false
  detailLoading = false
  listLoaded = false
  filters = {
    search: '',
    categoryId: 'all',
  }

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable<ProductStore, 'root'>(this, { root: false }, { autoBind: true })
  }

  get filteredProducts() {
    let list = [...this.products]

    if (this.filters.categoryId !== 'all') {
      list = list.filter((product) => product.categoryId === this.filters.categoryId)
    }

    if (this.filters.search.trim()) {
      const term = this.filters.search.toLowerCase()
      list = list.filter((product) =>
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term),
      )
    }

    return list
  }

  get heroProduct() {
    return this.featured[0] ?? this.products[0] ?? null
  }

  async fetchProducts() {
    if (this.loading) return
    if (this.products.length) return
    this.loading = true
    try {
      const { getProducts } = await requestGraphQL<{ getProducts: Product[] }>(
        GET_PRODUCTS,
        {
          limit: 100,
        },
      )

      runInAction(() => {
        this.products = getProducts
        this.featured = getProducts.slice(0, 4)
        this.newArrivals = getProducts
          .slice()
          .reverse()
          .slice(0, 6)
      })
    } catch (err) {
      console.error('Failed to fetch products', err)
      this.root.uiStore.addToast(
        'We couldn’t load the products. Please try again.',
        'error',
      )
    } finally {
      this.loading = false
      this.listLoaded = true
    }
  }

  async fetchCategories() {
    if (this.categories.length) return
    try {
      const { getCategories } = await requestGraphQL<{
        getCategories: Category[]
      }>(GET_CATEGORIES)
      runInAction(() => {
        this.categories = getCategories
      })
    } catch (err) {
      console.error('Failed to load categories', err)
      this.root.uiStore.addToast(
        'We couldn’t load the categories.',
        'error',
      )
    }
  }

  async fetchProductDetail(id: string) {
    this.detailLoading = true
    try {
      const { product, reviews } = await requestGraphQL<ProductDetailResponse>(
        GET_PRODUCT_DETAIL,
        { id },
      )

      runInAction(() => {
        this.productDetail = product
        this.productReviews = reviews
      })
    } catch (err) {
      console.error('Failed to fetch product detail', err)
      this.root.uiStore.addToast(
        'We couldn’t load the product details.',
        'error',
      )
    } finally {
      this.detailLoading = false
    }
  }

  setSearch(search: string) {
    this.filters.search = search
  }

  setCategory(categoryId: string) {
    this.filters.categoryId = categoryId
  }
}
