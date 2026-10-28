import { Experience, validateExperience } from "./platformCustomization";
import { makeAutoObservable, runInAction } from "mobx";
import i18n from "../i18n/i18n";
import { LANGUAGE_STORAGE_KEY, LANGUAGES } from "../i18n/config";
export interface PlatformConfig {
	platformId: string;
	revision: number;
	displayName: string;
	locale: string;
	currency: "EUR";
	priceDisplay: "gross";
	branding: { accent: string; background: string; surface: string };
	experience?: Experience;
}
export class PlatformStore {
	configuration: PlatformConfig | null = null;
	private readonly hadLanguagePreference =
		typeof window === "undefined" ||
		Boolean(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
	constructor() {
		makeAutoObservable(this);
	}
	async refresh() {
		try {
			const response = await fetch("/api/platform-config", {
				cache: "no-store",
				signal: AbortSignal.timeout(5000),
			});
			if (!response.ok) return;
			const { configuration: c } = await response.json();
			if (
				!c ||
				!/^sx_[a-f0-9]{12}$/.test(c.platformId) ||
				c.currency !== "EUR" ||
				!Number.isSafeInteger(c.revision) ||
				typeof c.displayName !== "string" ||
				!["accent", "background", "surface"].every((k) =>
					/^#[a-fA-F0-9]{6}$/.test(c.branding?.[k])
				)
			)
				return;
			if (
				this.configuration &&
				this.configuration.platformId !== c.platformId
			) {
				window.location.reload();
				return;
			}
			if (c.experience !== undefined)
				c.experience = validateExperience(c.experience);
			const firstConfiguration = !this.configuration;
			runInAction(() => {
				this.configuration = c;
			});
			if (
				firstConfiguration &&
				!this.hadLanguagePreference &&
				LANGUAGES.includes(c.locale)
			)
				void i18n.changeLanguage(c.locale);
			for (const key of ["accent", "background", "surface"] as const) {
				document.documentElement.style.setProperty(
					"--platform-" + key,
					c.branding[key]
				);
			}
			const css = document.documentElement.style;
			const light = contrastColor(c.branding.background) === "#151719";
			const radius =
				c.experience?.cornerStyle === "sharp"
					? 0
					: c.experience?.cornerStyle === "pill"
					? 24
					: 12;
			const fonts = {
				sans: '"Inter", system-ui, sans-serif',
				serif: 'Georgia, "Times New Roman", serif',
				mono: '"SFMono-Regular", Consolas, monospace',
			};
			css.setProperty("--platform-text", light ? "#151719" : "#f4f5f2");
			css.setProperty("--platform-muted", light ? "#4b5563" : "#adb5b9");
			css.setProperty("--platform-on-accent", contrastColor(c.branding.accent));
			css.setProperty("--platform-border", light ? "#c8cdd1" : "#343a3d");
			css.setProperty(
				"--platform-surface-muted",
				light ? "#e9edf0" : "#222629"
			);
			css.setProperty("--platform-radius", radius + "px");
			css.setProperty(
				"--platform-font",
				fonts[(c.experience?.fontFamily || "sans") as keyof typeof fonts]
			);
			css.setProperty(
				"--platform-product-min",
				c.experience?.catalogDensity === "compact" ? "180px" : "240px"
			);
			css.setProperty("color-scheme", light ? "light" : "dark");
			document.title = c.displayName;
		} catch {
			/* A running client retains its last validated branding during an outage. */
		}
	}
	watch() {
		void this.refresh();
		const refresh = () => {
			if (document.visibilityState === "visible") void this.refresh();
		};
		const timer = setInterval(refresh, 30000);
		window.addEventListener("focus", refresh);
		return () => {
			clearInterval(timer);
			window.removeEventListener("focus", refresh);
		};
	}
}

function contrastColor(hex: string) {
	const rgb = hex
		.slice(1)
		.match(/../g)!
		.map((v) => parseInt(v, 16) / 255)
		.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
	return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
		? "#151719"
		: "#f4f5f2";
}
