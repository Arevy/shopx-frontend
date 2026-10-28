const { test } = require("node:test"),
	assert = require("node:assert/strict"),
	fs = require("node:fs"),
	path = require("node:path"),
	Module = require("node:module"),
	ts = require("typescript");
test("homepage reads the runtime catalog on every request, including after an initially empty store", async () => {
	const file = path.join(__dirname, "../src/pages/index.page.tsx"),
		m = new Module(file, module);
	let current = [],
		instances = 0,
		calls = 0;
	m.require = (name) => {
		if (name === "@stores/rootStore")
			return {
				createRootStore: () => {
					instances++;
					return {
						productStore: {
							products: [],
							async fetchProducts() {
								calls++;
								this.products = current;
							},
						},
						cmsStore: { getPage: async () => null },
					};
				},
			};
		if (name === "./home/HomePage") return () => null;
		throw Error("Unexpected import " + name);
	};
	m._compile(
		ts.transpileModule(fs.readFileSync(file, "utf8"), {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				jsx: ts.JsxEmit.React,
			},
		}).outputText,
		file
	);
	assert.equal(m.exports.getStaticProps, undefined);
	const first = await m.exports.getServerSideProps({});
	assert.equal(first.props.heroProduct, null);
	current = [
		{ id: "1", name: "Real product", image: { url: "/api/products/1/image" } },
	];
	const next = await m.exports.getServerSideProps({});
	assert.equal(next.props.heroProduct.id, "1");
	assert.equal(next.props.featuredProducts.length, 1);
	assert.equal(calls, 2);
	assert.equal(instances, 2);
});
