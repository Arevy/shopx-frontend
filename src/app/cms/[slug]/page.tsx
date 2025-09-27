import { draftMode } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import classNames from 'classnames'
import { SectionHeader, Surface } from '@components/ui'
import { GET_CMS_PAGE } from '@graphql/operations'
import { requestGraphQL } from '@lib/graphqlClient'
import type { CmsPage } from '@/types/cms'
import styles from './page.module.scss'

type CmsPageResponse = {
  getCmsPage: CmsPage | null
}

type CmsPageParams = {
  params: { slug?: string }
  searchParams?: { slug?: string }
}

export default async function CmsPageRoute({ params, searchParams }: CmsPageParams) {
  noStore()
  const slugFromParams = params.slug
  const slugFromQuery = searchParams?.slug

  const decodedParam = slugFromParams ? decodeURIComponent(slugFromParams) : undefined

  if (decodedParam === '[slug]' && slugFromQuery) {
    redirect(`/cms/${slugFromQuery}`)
  }

  const slugCandidate = decodedParam && decodedParam !== '[slug]' ? decodedParam : slugFromQuery
  const slug = slugCandidate?.trim()

  if (!slug) {
    notFound()
  }

  const { getCmsPage } = await requestGraphQL<CmsPageResponse>(GET_CMS_PAGE, { slug })

  const { isEnabled } = draftMode()

  if (!getCmsPage || (!isEnabled && getCmsPage.status !== 'PUBLISHED')) {
    notFound()
  }

  return (
    <section className={classNames('section', styles.container)}>
      <SectionHeader title={getCmsPage.title} description={getCmsPage.excerpt ?? undefined} />
      <Surface
        dangerouslySetInnerHTML={{ __html: getCmsPage.body }}
        className={styles.content}
      />
      <span className={styles.meta}>
        Ultima actualizare: {new Date(getCmsPage.updatedAt).toLocaleString('ro-RO')}
      </span>
    </section>
  )
}
