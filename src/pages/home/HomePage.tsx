import { SectionHeader, Surface } from "@components/ui";
import type { CmsPage } from "@/types/cms";
import type { Product } from "@/types/product";
import { Hero } from "./components/Hero/Hero";
import { FeaturedProducts } from "./components/FeaturedProducts/FeaturedProducts";
import { NewArrivals } from "./components/NewArrivals/NewArrivals";
import styles from "./HomePage.module.scss";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores/StoreProvider";

export type HomePageProps = {
	heroProduct: Product | null;
	featuredProducts: Product[];
	newArrivals: Product[];
	cmsPage: CmsPage | null;
};

const HomePage = observer(
	({ heroProduct, featuredProducts, newArrivals, cmsPage }: HomePageProps) => {
		const experience = useStores().platformStore.configuration?.experience;
		return (
			<>
				<Hero product={heroProduct} />
				{experience?.announcement && (
					<p className={styles.announcement}>{experience.announcement}</p>
				)}
				{experience?.showFeatured !== false && (
					<FeaturedProducts products={featuredProducts} />
				)}
				{experience?.showNewArrivals !== false && (
					<NewArrivals products={newArrivals} />
				)}
				{cmsPage && experience?.showEditorial !== false && (
					<section className="section">
						<SectionHeader
							title={cmsPage.title}
							description={cmsPage.excerpt ?? undefined}
						/>
						<Surface
							dangerouslySetInnerHTML={{ __html: cmsPage.body }}
							className={styles.cmsContent}
						/>
					</section>
				)}
			</>
		);
	}
);

export default HomePage;
