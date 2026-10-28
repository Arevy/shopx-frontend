"use client";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores/StoreProvider";
import { ProductCard } from "@pages/products/components/ProductCard/ProductCard";
import { SectionHeader } from "@components/ui";
import { useTranslation } from "@/i18n";
import type { Product } from "@/types/product";
import styles from "./FeaturedProducts.module.scss";

type FeaturedProductsProps = {
	products: Product[];
};

export const FeaturedProducts = observer(
	({ products }: FeaturedProductsProps) => {
		const { platformStore } = useStores();
		const { t } = useTranslation("Page_Home");

		if (!products.length) {
			return null;
		}

		return (
			<section className="section">
				<SectionHeader
					eyebrow={
						platformStore.configuration?.displayName || t("featured.eyebrow")
					}
					title={t("featured.title")}
					description={t("featured.description")}
				/>
				<div className={classNames("grid", styles.productsGrid)}>
					{products.map((product, index) => (
						<ProductCard key={product.id} product={product} index={index} />
					))}
				</div>
			</section>
		);
	}
);
