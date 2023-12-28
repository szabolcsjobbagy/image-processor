module.exports = {
	preset: "ts-jest/presets/js-with-ts-esm",
	testEnvironment: "node",
	testMatch: ["<rootDir>/test/**/*.test.ts"],
	moduleFileExtensions: ["ts", "js", "json", "node"],
	collectCoverage: true,
	coverageDirectory: "coverage",
	coverageProvider: "v8",
	extensionsToTreatAsEsm: [".ts"],
	globals: {
		"ts-jest": {
			useESM: true,
		},
	},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
}
