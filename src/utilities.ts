export function delay(millisec: number): Promise<void> {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve()
		}, millisec)
	})
}
