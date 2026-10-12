import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
	globalIgnores(["build", ".yarn"]),
	{
		files: ["**/*.{js,ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
			reactHooks.configs.flat.recommended,
			stylistic.configs.customize({
				indent: "tab",
				quotes: "double",
				semi: true,
				commaDangle: "always-multiline",
				braceStyle: "1tbs",
				jsx: true,
			}),
		],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.js"],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: "error",
		},
		rules: {
			"@stylistic/space-before-function-paren": ["error", "always"],
			"@stylistic/member-delimiter-style": ["error", {
				multiline: { delimiter: "semi", requireLast: true },
				singleline: { delimiter: "semi", requireLast: true },
			}],
			"@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
			"@typescript-eslint/strict-boolean-expressions": "error",
			"@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
		},
	},
	{
		files: ["**/*.js"],
		extends: [tseslint.configs.disableTypeChecked],
	},
);
