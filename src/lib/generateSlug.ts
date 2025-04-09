export const generateSlug = (text: string) => {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/\s+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/ñ/g, "n")
		.replace(/í/g, "i")
		.replace(/ó/g, "o")
		.replace(/é/g, "e")
		.replace(/ú/g, "u")
		.replace(/í/g, "i")
		.replace(/ó/g, "o")
		.replace(/é/g, "e")
		.replace(/ú/g, "u")
}
