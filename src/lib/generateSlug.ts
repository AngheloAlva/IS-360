export const generateSlug = (text: string) => {
	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/ñ/g, "n")
		.replace(/[áéíóú]/g, (match) => "aeiou"["áéíóú".indexOf(match)])
		.replace(/\s/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-{2,}/g, "-")
		.replace(/^-|-$/g, "")
}
