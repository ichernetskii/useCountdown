export default {
	testEnvironment: "node",
	moduleNameMapper: {
		"@/(.*)": "<rootDir>/src/$1",
	},
	transform: {
		"^.+.tsx?$": [
			"ts-jest",
			{ tsconfig: "./tsconfig.json" },
		],
	},
};
