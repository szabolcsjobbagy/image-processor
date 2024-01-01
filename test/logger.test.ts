import { Logger } from "../src/logger"

describe("Logger", () => {
	it.each`
		action                     | condition                           | errorMessage
		${"log the error message"} | ${"Image processing error happens"} | ${"Image processing error."}
	`("should $action if $condition", async (testCases) => {
		const { errorMessage } = testCases
		// Arrange
		const sut = new Logger()
		const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})

		// Act
		sut.logError(errorMessage)

		// Assert
		expect(consoleLogSpy).toHaveBeenCalledWith(errorMessage)
	})
})
