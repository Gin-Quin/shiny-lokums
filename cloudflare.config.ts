import { defineConfig } from "cf/config"

export default defineConfig({
	accountId: "98507ae09bdfa35f515e6ea6402221e2",
	worker: {
		name: "loukoum-digital",
		compatibilityDate: "2026-11-12",
		domains: ["loukoum.digital", "www.loukoum.digital"],
		workersDev: true,
		observability: {
			enabled: true,
			traces: { enabled: true },
		},
	},
})
