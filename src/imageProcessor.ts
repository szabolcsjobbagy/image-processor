import { ImageProcessingLibrary } from "../src/imageProcessingLibrary"
import { FileStorageLibrary } from "../src/fileStorageLibrary"
import { ProcessingErrorException } from "./errors/processingErrorException"
import { InvalidImageException } from "./errors/invalidImageException"
import { SavingIntoFileErrorException } from "./errors/savingIntoFileErrorException"
import { UnknownError } from "./errors/unknownError"

export class ImageProcessor {
	constructor(
		private imageProcessingLibrary: ImageProcessingLibrary,
		private fileStorageLibrary: FileStorageLibrary
	) {}
	public async processAndSaveImage(inputPath: string, outputPath: string): Promise<void> {
		this.validateImage(inputPath)
		const imageContent: string = await this.processImage(inputPath)
		await this.saveContentIntoFile(imageContent, outputPath)
	}

	private validateImage(inputPath: string): void {
		const isImageValid = inputPath.split(".").pop() === "jpg"
		if (!isImageValid) {
			throw new InvalidImageException("Invalid image (only JPG allowed).")
		}
	}

	private async processImage(inputPath: string): Promise<string> {
		try {
			return await this.imageProcessingLibrary.processImage(inputPath)
		} catch (error) {
			if (error instanceof ProcessingErrorException) {
				throw new ProcessingErrorException("Image processing error.")
			} else {
				throw new UnknownError("Unknown error at image processing.")
			}
		}
	}

	private async saveContentIntoFile(imageContent: string, outputPath: string): Promise<void> {
		try {
			await this.fileStorageLibrary.saveContentIntoFile(imageContent, outputPath)
		} catch (error) {
			if (error instanceof SavingIntoFileErrorException) {
				throw new SavingIntoFileErrorException("Saving into file error.")
			} else {
				throw new UnknownError("Unknown error at saving into file.")
			}
		}
	}
}
