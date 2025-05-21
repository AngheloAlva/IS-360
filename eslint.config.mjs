import pluginQuery from "@tanstack/eslint-plugin-query"
import { FlatCompat } from "@eslint/eslintrc"

import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
})

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	...pluginQuery.configs["flat/recommended"],
]

export default eslintConfig
