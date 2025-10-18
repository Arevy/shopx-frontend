import { makeAutoObservable, runInAction } from 'mobx'
import { GET_PRODUCTS } from '@graphql/products/GetProducts'
import { GET_PRODUCT_DETAIL } from '@graphql/products/GetProductDetail'
import { GET_CATEGORIES } from '@graphql/products/GetCategories'
import type { Category, Product, Review } from '@/types/product'
import { createCacheKey } from '@lib/cacheKeys'
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
      const variables = { limit: 100 }
      const cacheKey = createCacheKey('products:list', variables)

      const { getProducts } = await this.root.apiService.execute<{ getProducts: Product[] }>(
        GET_PRODUCTS,
        variables,
        {
          cacheKey,
          ttlSeconds: 600,
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
      const cacheKey = createCacheKey('products:categories')
      const { getCategories } = await this.root.apiService.execute<{
        getCategories: Category[]
      }>(GET_CATEGORIES, undefined, { cacheKey, ttlSeconds: 600 })
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
      const variables = { id }
      const cacheKey = createCacheKey('products:detail', id)
      const { product, reviews } = await this.root.apiService.execute<ProductDetailResponse>(
        GET_PRODUCT_DETAIL,
        variables,
        {
          cacheKey,
          ttlSeconds: 900,
        },
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
