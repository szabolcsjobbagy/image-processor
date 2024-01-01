import { mock, mockReset } from "jest-mock-extended"
import { ImageProcessingLibrary } from "../src/imageProcessingLibrary"
import { FileStorageLibrary } from "../src/fileStorageLibrary"
import { ImageProcessor } from "../src/imageProcessor"
import { InvalidImageException } from "../src/errors/invalidImageException"
import { ProcessingErrorException } from "../src/errors/processingErrorException"
import { SavingIntoFileErrorException } from "../src/errors/savingIntoFileErrorException"
import { UnknownError } from "../src/errors/unknownError"
import { Logger } from "../src/logger"

const mockedImgProcLib = mock<ImageProcessingLibrary>()
const mockedFileStorLib = mock<FileStorageLibrary>()
const mockedLogger = mock<Logger>()

describe("ImageProcessor class", () => {
	let imageProcessor: ImageProcessor
	const inputPath = "D:\\input.jpg"
	const outputPath = "D:\\output.jpg"

	beforeEach(() => {
		mockReset(mockedImgProcLib)
		mockReset(mockedFileStorLib)
		mockReset(mockedLogger)

		imageProcessor = new ImageProcessor(mockedImgProcLib, mockedFileStorLib, mockedLogger)
	})

	describe("ProcessAndSaveImage method", () => {
		describe("Happy path", () => {
			it.each`
				action                      | condition           | expectedResult
				${"process and save image"} | ${"image is valid"} | ${"image content"}
			`("should $action if $condition", async (testCases) => {
				const { expectedResult } = testCases

				// Arrange
				mockedImgProcLib.processImage.mockResolvedValue(expectedResult)
				mockedFileStorLib.saveContentIntoFile.mockResolvedValue(undefined)

				// Act & Assert
				const result = await imageProcessor.processAndSaveImage(inputPath, outputPath)
				expect(result).toBeUndefined()

				expect(mockedImgProcLib.processImage).toHaveBeenCalledTimes(1)
				expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledTimes(1)

				expect(mockedImgProcLib.processImage).toHaveBeenCalledWith(inputPath)
				expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledWith(
					expectedResult,
					outputPath
				)
			})
		})

		describe("Error paths", () => {
			describe("Invalid image", () => {
				it.each`
					action                           | condition             | errorMessage
					${"throw InvalidImageException"} | ${"image is invalid"} | ${"Invalid image (only JPG allowed)."}
				`("should $action if $condition", async (testCases) => {
					const { errorMessage } = testCases

					// Arrange
					// PNG image instead of JPG
					const inputPathNotJPG = "D:\\input.png"

					const expectedError = new InvalidImageException(errorMessage)

					// Act & Assert
					await expect(() =>
						imageProcessor.processAndSaveImage(inputPathNotJPG, outputPath)
					).rejects.toThrow(expectedError)

					expect(mockedImgProcLib.processImage).toHaveBeenCalledTimes(0)
					expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledTimes(0)
					expect(mockedLogger.logError).toHaveBeenCalledTimes(1)
					expect(mockedLogger.logError).toHaveBeenCalledWith(errorMessage)
				})
			})

			describe("ImageProcessingLibrary", () => {
				it.each`
					action                              | condition                                 | errorMessage
					${"throw ProcessingErrorException"} | ${"ImageProcessingLibrary has a problem"} | ${"Image processing error."}
				`("should $action if $condition", async (testCases) => {
					const { errorMessage } = testCases

					// Arrange
					const expectedError = new ProcessingErrorException(errorMessage)

					mockedImgProcLib.processImage.mockImplementation(() => {
						throw expectedError
					})

					// Act & Assert
					await expect(() =>
						imageProcessor.processAndSaveImage(inputPath, outputPath)
					).rejects.toThrow(expectedError)

					expect(mockedImgProcLib.processImage).toHaveBeenCalledTimes(1)
					expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledTimes(0)
					expect(mockedImgProcLib.processImage).toHaveBeenCalledWith(inputPath)
					expect(mockedLogger.logError).toHaveBeenCalledTimes(1)
					expect(mockedLogger.logError).toHaveBeenCalledWith(errorMessage)
				})

				it.each`
					action                  | condition                                          | errorMessage
					${"throw UnknownError"} | ${"ImageProcessingLibrary has an unknown problem"} | ${"Unknown error at image processing."}
				`("should $action if $condition", async (testCases) => {
					const { errorMessage } = testCases

					// Arrange
					const expectedError = new UnknownError(errorMessage)
					mockedImgProcLib.processImage.mockImplementation(() => {
						throw new Error("Unknown error")
					})

					// Act & Assert
					await expect(() =>
						imageProcessor.processAndSaveImage(inputPath, outputPath)
					).rejects.toThrow(expectedError)

					expect(mockedImgProcLib.processImage).toHaveBeenCalledTimes(1)
					expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledTimes(0)
					expect(mockedImgProcLib.processImage).toHaveBeenCalledWith(inputPath)
					expect(mockedLogger.logError).toHaveBeenCalledTimes(1)
					expect(mockedLogger.logError).toHaveBeenCalledWith(errorMessage)
				})
			})

			describe("FileStorageLibrary", () => {
				const resultImageProcessing = "image content"

				it.each`
					action                                  | condition                             | errorMessage
					${"throw SavingIntoFileErrorException"} | ${"FileStorageLibrary has a problem"} | ${"Saving into file error."}
				`("should $action if $condition", async (testCases) => {
					const { errorMessage } = testCases

					// Arrange
					const expectedError = new SavingIntoFileErrorException(errorMessage)

					mockedImgProcLib.processImage.mockResolvedValue(resultImageProcessing)
					mockedFileStorLib.saveContentIntoFile.mockImplementation(() => {
						throw expectedError
					})

					// Act & Assert
					await expect(() =>
						imageProcessor.processAndSaveImage(inputPath, outputPath)
					).rejects.toThrow(expectedError)

					expect(mockedImgProcLib.processImage).toHaveBeenCalledTimes(1)
					expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledTimes(1)

					expect(mockedImgProcLib.processImage).toHaveBeenCalledWith(inputPath)
					expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledWith(
						resultImageProcessing,
						outputPath
					)
					expect(mockedLogger.logError).toHaveBeenCalledTimes(1)
					expect(mockedLogger.logError).toHaveBeenCalledWith(errorMessage)
				})

				it.each`
					action                  | condition                                      | errorMessage
					${"throw UnknownError"} | ${"FileStorageLibrary has an unknown problem"} | ${"Unknown error at saving into file."}
				`("should $action if $condition", async (testCases) => {
					const { errorMessage } = testCases

					// Arrange
					const expectedError = new UnknownError(errorMessage)

					mockedImgProcLib.processImage.mockResolvedValue(resultImageProcessing)
					mockedFileStorLib.saveContentIntoFile.mockImplementation(() => {
						throw new Error("Unknown error")
					})

					// Act & Assert
					await expect(() =>
						imageProcessor.processAndSaveImage(inputPath, outputPath)
					).rejects.toThrow(expectedError)

					expect(mockedImgProcLib.processImage).toHaveBeenCalledTimes(1)
					expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledTimes(1)

					expect(mockedImgProcLib.processImage).toHaveBeenCalledWith(inputPath)
					expect(mockedFileStorLib.saveContentIntoFile).toHaveBeenCalledWith(
						resultImageProcessing,
						outputPath
					)
					expect(mockedLogger.logError).toHaveBeenCalledTimes(1)
					expect(mockedLogger.logError).toHaveBeenCalledWith(errorMessage)
				})
			})
		})
	})
})
