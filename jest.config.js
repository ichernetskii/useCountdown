export default {
	testEnvironment: "node",
	moduleNameMapper: {
		"@/(.*)": "<rootDir>/src/$1",
	},
	testRegex: "/__tests__/.+(spec|test).[jt]sx?$",
	transform: {
		"^.+.tsx?$": [
			"ts-jest",
			{ tsconfig: "./tsconfig.json" },
		],
	},
};
