import { makeAutoObservable, runInAction } from 'mobx'
import { GET_CMS_PAGES } from '@graphql/cms/GetCmsPages'
import { GET_CMS_PAGE } from '@graphql/cms/GetCmsPage'
import { getUserFriendlyMessage } from '@lib/getUserFriendlyMessage'
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
      const { getCmsPages } = await this.root.apiService.execute<{ getCmsPages: CmsPage[] }>(
        GET_CMS_PAGES,
      )
      runInAction(() => {
        this.pages = getCmsPages
        getCmsPages.forEach((page) => this.pageCache.set(page.slug, page))
      })
    } catch (err) {
      console.error('Failed to load CMS pages', err)
      const message = getUserFriendlyMessage(err, "We couldn't load the CMS pages.")
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
      const { getCmsPage } = await this.root.apiService.execute<{ getCmsPage: CmsPage | null }>(
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
      const message = getUserFriendlyMessage(err, "We couldn't load the CMS page.")
      this.root.uiStore.addToast(message, 'error')
      return null
    }
  }
}
