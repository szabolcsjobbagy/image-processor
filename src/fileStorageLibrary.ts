import { delay } from "./utilities"

export class FileStorageLibrary {
	public async saveContentIntoFile(imageContent: string, outputPath: string): Promise<void> {
		await delay(2000)
	}
}
