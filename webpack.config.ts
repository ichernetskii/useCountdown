import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import { Configuration } from "webpack";
import "webpack-dev-server";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.resolve();

const getPlugins = (isProd: boolean): any[] => {
	const loaders = [];

	if (!isProd) {
		loaders.push(new HtmlWebpackPlugin({
			template: "./__manual_tests__/index.html",
		}));
	}

	return loaders;
};

export default (env: { mode?: "development" | "production"; } = {}): Configuration => {
	const { mode = "development" } = env;
	const isProd = mode === "production";

	return {
		context: path.resolve(__dirname, "./src"),
		mode,
		devServer: {
			port: 4200,
			open: true,
			hot: true,
			static: path.resolve(__dirname, "src", "__manual_tests__"),
		},
		experiments: {
			outputModule: true,
		},
		entry: isProd
			? {
				index: "./useCountdown.tsx",
			}
			: "./__manual_tests__/index.tsx",
		resolve: {
			extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		optimization: {
			splitChunks: {
				chunks: isProd ? "all" : "async",
			},
		},
		output: {
			filename: `[name]${isProd ? "" : ".[fullhash:8]"}.js`,
			path: path.resolve(__dirname, "build"),
			chunkFilename: `[id]${isProd ? "" : ".[fullhash:8]"}.js`,
			clean: true,
			library: {
				type: "module",
			},
		},
		target: isProd ? "browserslist" : "web", // disable browserslist for development
		devtool: isProd ? undefined : "source-map",
		plugins: getPlugins(isProd),
		module: {
			rules: [
				{
					test: /\.[jt]sx?$/,
					exclude: /node_modules/,
					use: "ts-loader",
				},
			],
		},
	};
};
