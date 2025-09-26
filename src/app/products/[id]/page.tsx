import { ProductDetailPage } from '@components/sections/products/ProductDetailPage'

type ProductPageProps = {
  params: { id: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetailPage productId={params.id} />
}
