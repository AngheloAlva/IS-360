import pluginQuery from "@tanstack/eslint-plugin-query"
import tsParser from "@typescript-eslint/parser"

import { createRequire } from "module"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)
const nextConfig = require("eslint-config-next/core-web-vitals")

const eslintConfig = [
	...nextConfig,
	...pluginQuery.configs["flat/recommended"],
	// Type-aware linting — enables no-floating-promises across all TS/TSX files.
	// @typescript-eslint plugin is already registered by eslint-config-next/core-web-vitals,
	// so we only override parserOptions and add the rule here.
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-floating-promises": "error",
		},
	},
]

export default eslintConfig
