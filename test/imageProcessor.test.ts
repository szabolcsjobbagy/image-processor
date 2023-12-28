import { mock, mockReset } from "jest-mock-extended"
import { ImageProcessingLibrary } from "../src/imageProcessingLibrary"
import { FileStorageLibrary } from "../src/fileStorageLibrary"
import { ImageProcessor } from "../src/imageProcessor"
import { InvalidImageException } from "../src/errors/invalidImageException"
import { ProcessingErrorException } from "../src/errors/processingErrorException"
import { SavingIntoFileErrorException } from "../src/errors/savingIntoFileErrorException"
import { UnknownError } from "../src/errors/unknownError"

const mockedImgProcLib = mock<ImageProcessingLibrary>()
const mockedFileStorLib = mock<FileStorageLibrary>()

describe("ImageProcessor class", () => {
	let imageProcessor: ImageProcessor

	beforeEach(() => {
		mockReset(mockedImgProcLib)
		mockReset(mockedFileStorLib)

		imageProcessor = new ImageProcessor(mockedImgProcLib, mockedFileStorLib)
	})

	describe("ProcessAndSaveImage method", () => {
		const mockedFn = mockedImgProcLib.processImage
		const mockedFn2 = mockedFileStorLib.saveContentIntoFile

		it.each`
			action                                  | condition                                          | mocksCalledTimes | expectedResult
			${"process and save image"}             | ${"image is valid"}                                | ${[1, 1]}        | ${"image content"}
			${"throw InvalidImageException"}        | ${"image is invalid"}                              | ${[0, 0]}        | ${new InvalidImageException("Invalid image (only JPG allowed).")}
			${"throw ProcessingErrorException"}     | ${"ImageProcessingLibrary has a problem"}          | ${[1, 0]}        | ${new ProcessingErrorException("Image processing error.")}
			${"throw UnknownError"}                 | ${"ImageProcessingLibrary has an unknown problem"} | ${[1, 0]}        | ${new UnknownError("Unknown error at image processing.")}
			${"throw SavingIntoFileErrorException"} | ${"FileStorageLibrary has a problem"}              | ${[1, 1]}        | ${new SavingIntoFileErrorException("Saving into file error.")}
			${"throw UnknownError"}                 | ${"FileStorageLibrary has an unknown problem"}     | ${[1, 1]}        | ${new UnknownError("Unknown error at saving into file.")}
		`("should $action if $condition", async (testCases) => {
			const { condition, mocksCalledTimes, expectedResult } = testCases

			// Arrange
			let inputPath = "D:\\input.jpg"
			const outputPath = "D:\\output.jpg"

			switch (condition) {
				case "image is valid":
					mockedFn.mockResolvedValue(expectedResult)
					mockedFn2.mockResolvedValue(undefined)
					break

				case "image is invalid":
					inputPath = "D:\\input.png"
					break

				case "ImageProcessingLibrary has a problem":
					mockedFn.mockImplementation(() => {
						throw expectedResult
					})
					break

				case "ImageProcessingLibrary has an unknown problem":
					mockedFn.mockImplementation(() => {
						throw new Error("Unknown error")
					})
					break

				case "FileStorageLibrary has a problem":
					mockedFn.mockResolvedValue(expectedResult)
					mockedFn2.mockImplementation(() => {
						throw expectedResult
					})
					break

				case "FileStorageLibrary has an unknown problem":
					mockedFn.mockResolvedValue(expectedResult)
					mockedFn2.mockImplementation(() => {
						throw new Error("Unknown error")
					})
					break
			}

			// Act & Assert
			if (condition == "image is valid") {
				const result = await imageProcessor.processAndSaveImage(inputPath, outputPath)
				expect(result).toBeUndefined()
			} else {
				await expect(() =>
					imageProcessor.processAndSaveImage(inputPath, outputPath)
				).rejects.toThrow(expectedResult)
			}

			expect(mockedFn).toHaveBeenCalledTimes(mocksCalledTimes[0])
			expect(mockedFn2).toHaveBeenCalledTimes(mocksCalledTimes[1])

			if (mocksCalledTimes[0] == 1) expect(mockedFn).toHaveBeenCalledWith(inputPath)
			if (mocksCalledTimes[1] == 1)
				expect(mockedFn2).toHaveBeenCalledWith(expectedResult, outputPath)
		})
	})
})
