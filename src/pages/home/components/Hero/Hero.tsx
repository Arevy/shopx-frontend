"use client";

import Link from "next/link";
import { Button } from "@components/ui";
import { ModularImage } from "@components/ui/ModularImage";
import { useTranslation } from "@/i18n";
import type { Product } from "@/types/product";
import styles from "./Hero.module.scss";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores/StoreProvider";

type HeroProps = { product: Product | null };
export const Hero = observer(({ product }: HeroProps) => {
	const { t, language } = useTranslation("Page_Home");
	const configuration = useStores().platformStore.configuration;
	const experience = configuration?.experience;
	if (!product && !experience?.heroTitle) return null;
	return (
		<section className={`section ${styles.heroSection}`}>
			<div className={styles.content}>
				<span className={styles.eyebrow}>
					{experience?.tagline || t("hero.badge")}
				</span>
				<h1>{experience?.heroTitle || t("hero.title")}</h1>
				<p className={styles.description}>
					{experience?.heroDescription || t("hero.description")}
				</p>
				<div className={styles.actions}>
					<Button href="/products">
						{t("hero.actions.view_catalog")} <span aria-hidden="true">↗</span>
					</Button>
					{product && (
						<Button href={`/products/${product.id}`} variant="outline">
							{t("hero.featured_badge")}
						</Button>
					)}
				</div>
				<span className={styles.note}>{t("hero.price_note")}</span>
			</div>
			{product && (
				<Link href={`/products/${product.id}`} className={styles.showcase}>
					<div className={styles.imageWrapper}>
						<ModularImage
							src={product.image?.url ?? null}
							alt={product.name}
							fill
							priority
							sizes="(max-width: 800px) 90vw, 50vw"
							className={styles.productImage}
						/>
					</div>
					<div className={styles.details}>
						<div>
							<span className={styles.eyebrow}>
								{product.category?.name ?? t("hero.featured_badge")}
							</span>
							<h2>{product.name}</h2>
						</div>
						<span className={styles.productPrice}>
							{product.price.toLocaleString(language, {
								style: "currency",
								currency: "EUR",
							})}
						</span>
					</div>
				</Link>
			)}
		</section>
	);
});
