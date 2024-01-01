import { ImageProcessingLibrary } from "../src/imageProcessingLibrary"
import { FileStorageLibrary } from "../src/fileStorageLibrary"
import { ProcessingErrorException } from "./errors/processingErrorException"
import { InvalidImageException } from "./errors/invalidImageException"
import { SavingIntoFileErrorException } from "./errors/savingIntoFileErrorException"
import { UnknownError } from "./errors/unknownError"
import { Logger } from "./logger"

export class ImageProcessor {
	constructor(
		private imageProcessingLibrary: ImageProcessingLibrary,
		private fileStorageLibrary: FileStorageLibrary,
		private logger: Logger
	) {}
	public async processAndSaveImage(inputPath: string, outputPath: string): Promise<void> {
		this.validateImage(inputPath)
		const imageContent: string = await this.processImage(inputPath)
		await this.saveContentIntoFile(imageContent, outputPath)
	}

	private validateImage(inputPath: string): void {
		const isImageValid = inputPath.split(".").pop() === "jpg"
		if (!isImageValid) {
			const errorMessage = "Invalid image (only JPG allowed)."
			this.logger.logError(errorMessage)
			throw new InvalidImageException(errorMessage)
		}
	}

	private async processImage(inputPath: string): Promise<string> {
		try {
			return await this.imageProcessingLibrary.processImage(inputPath)
		} catch (error) {
			if (error instanceof ProcessingErrorException) {
				const errorMessage = "Image processing error."
				this.logger.logError(errorMessage)
				throw new ProcessingErrorException(errorMessage, error as Error)
			} else {
				const errorMessage = "Unknown error at image processing."
				this.logger.logError(errorMessage)
				throw new UnknownError(errorMessage, error as Error)
			}
		}
	}

	private async saveContentIntoFile(imageContent: string, outputPath: string): Promise<void> {
		try {
			await this.fileStorageLibrary.saveContentIntoFile(imageContent, outputPath)
		} catch (error) {
			if (error instanceof SavingIntoFileErrorException) {
				const errorMessage = "Saving into file error."
				this.logger.logError(errorMessage)
				throw new SavingIntoFileErrorException(errorMessage, error as Error)
			} else {
				const errorMessage = "Unknown error at saving into file."
				this.logger.logError(errorMessage)
				throw new UnknownError(errorMessage, error as Error)
			}
		}
	}
}
