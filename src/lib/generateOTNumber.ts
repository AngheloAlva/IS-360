export const generateOTNumber = () => {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let otNumber = "OT-"

	for (let i = 0; i < 8; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		otNumber += characters.charAt(randomIndex)
	}

	return otNumber
}
