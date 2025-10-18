import type { GetServerSideProps } from 'next'
import { createRootStore } from '@stores/rootStore'
import type { CmsPage as CmsPageType } from '@/types/cms'
import CmsPage from '../CmsPage'

type CmsProps = {
  page: CmsPageType
}

const getStringFromParam = (value: string | string[] | undefined) => {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0]
  }

  return undefined
}

const CmsPageRoute = ({ page }: CmsProps) => {
  return <CmsPage page={page} />
}

export const getServerSideProps: GetServerSideProps<CmsProps> = async ({ params, query, preview }) => {
  const slugFromParams = getStringFromParam(params?.slug)
  const slugFromQuery = getStringFromParam(query.slug)

  const decodedParam = slugFromParams ? decodeURIComponent(slugFromParams) : undefined

  if (decodedParam === '[slug]' && slugFromQuery) {
    return {
      redirect: {
        destination: `/cms/${slugFromQuery}`,
        permanent: false,
      },
    }
  }

  const slugCandidate = decodedParam && decodedParam !== '[slug]' ? decodedParam : slugFromQuery
  const slug = slugCandidate?.trim()

  if (!slug) {
    return { notFound: true }
  }

  const store = createRootStore()
  const getCmsPage = await store.cmsStore.getPage(slug)

  const isPreview = Boolean(preview)

  if (!getCmsPage || (!isPreview && getCmsPage.status !== 'PUBLISHED')) {
    return { notFound: true }
  }

  return {
    props: {
      page: getCmsPage,
    },
  }
}

export default CmsPageRoute
