import type { GetServerSideProps } from 'next'
import ProductDetailPage from '../detail/ProductDetailPage'

type ProductDetailProps = {
  productId: string
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

const ProductDetail = ({ productId }: ProductDetailProps) => {
  return <ProductDetailPage productId={productId} />
}

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async ({ params }) => {
  const id = getStringFromParam(params?.id)

  if (!id) {
    return { notFound: true }
  }

  return {
    props: {
      productId: id,
    },
  }
}

export default ProductDetail
