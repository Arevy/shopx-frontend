import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { SectionHeader, Surface } from '@components/ui'
import { GET_CMS_PAGE } from '@graphql/operations'
import { requestGraphQL } from '@lib/graphqlClient'
import type { CmsPage } from '@/types/cms'

type CmsPageResponse = {
  getCmsPage: CmsPage | null
}

type CmsPageParams = {
  params: { slug: string }
}

export default async function CmsPageRoute({ params }: CmsPageParams) {
  noStore()
  const { slug } = params
  const { getCmsPage } = await requestGraphQL<CmsPageResponse>(GET_CMS_PAGE, { slug })

  if (!getCmsPage || getCmsPage.status !== 'PUBLISHED') {
    notFound()
  }

  return (
    <section className="section" style={{ display: 'grid', gap: '1.5rem' }}>
      <SectionHeader title={getCmsPage.title} description={getCmsPage.excerpt ?? undefined} />
      <Surface
        dangerouslySetInnerHTML={{ __html: getCmsPage.body }}
        style={{ display: 'grid', gap: '1rem', lineHeight: 1.7 }}
      />
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
        Ultima actualizare: {new Date(getCmsPage.updatedAt).toLocaleString('ro-RO')}
      </span>
    </section>
  )
}
