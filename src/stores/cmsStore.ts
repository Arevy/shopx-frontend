import { makeAutoObservable, runInAction } from 'mobx'
import { GET_CMS_PAGE, GET_CMS_PAGES } from '@graphql/operations'
import { requestGraphQL } from '@lib/graphqlClient'
import type { CmsPage } from '@/types/cms'
import type { RootStore } from './rootStore'

export class CmsStore {
  private readonly root: RootStore

  pages: CmsPage[] = []
  pageCache = new Map<string, CmsPage>()
  loading = false
  error: string | null = null

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable<CmsStore, 'root'>(this, { root: false }, { autoBind: true })
  }

  async fetchPages() {
    this.loading = true
    this.error = null
    try {
      const { getCmsPages } = await requestGraphQL<{ getCmsPages: CmsPage[] }>(GET_CMS_PAGES)
      runInAction(() => {
        this.pages = getCmsPages
        getCmsPages.forEach((page) => this.pageCache.set(page.slug, page))
      })
    } catch (err) {
      console.error('Failed to load CMS pages', err)
      const message = err instanceof Error ? err.message : 'Failed to load CMS pages'
      this.error = message
      this.root.uiStore.addToast(message, 'error')
    } finally {
      this.loading = false
    }
  }

  async getPage(slug: string): Promise<CmsPage | null> {
    if (this.pageCache.has(slug)) {
      return this.pageCache.get(slug) ?? null
    }

    try {
      const { getCmsPage } = await requestGraphQL<{ getCmsPage: CmsPage | null }>(
        GET_CMS_PAGE,
        { slug },
      )
      if (getCmsPage) {
        runInAction(() => {
          this.pageCache.set(slug, getCmsPage)
        })
      }
      return getCmsPage
    } catch (err) {
      console.error('Failed to load CMS page', err)
      const message = err instanceof Error ? err.message : 'Failed to load CMS page'
      this.root.uiStore.addToast(message, 'error')
      return null
    }
  }
}
