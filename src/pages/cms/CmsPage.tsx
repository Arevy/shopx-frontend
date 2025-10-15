import classNames from 'classnames'
import { SectionHeader, Surface } from '@components/ui'
import type { CmsPage as CmsPageType } from '@/types/cms'
import styles from './CmsPage.module.scss'

export type CmsPageProps = {
  page: CmsPageType
}

const CmsPage = ({ page }: CmsPageProps) => {
  return (
    <section className={classNames('section', styles.container)}>
      <SectionHeader title={page.title} description={page.excerpt ?? undefined} />
      <Surface
        dangerouslySetInnerHTML={{ __html: page.body }}
        className={styles.content}
      />
      <span className={styles.meta}>
        Ultima actualizare: {new Date(page.updatedAt).toLocaleString('ro-RO')}
      </span>
    </section>
  )
}

export default CmsPage
