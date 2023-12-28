import { delay } from "./utilities"

export class ImageProcessingLibrary {
	public async processImage(inputPath: string): Promise<string> {
		await delay(2000)
		return "image content"
	}
}
