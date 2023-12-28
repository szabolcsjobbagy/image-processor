export function displayValueInElement(value: any, elementId: string): void {
	try {
		const displayElement = document.getElementById(elementId)

		if (displayElement) {
			displayElement.innerText = value
		} else {
			throw new Error("HTML element not found.")
		}
	} catch (error) {
		console.error(error)
	}
}
