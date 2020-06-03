const path = require("path");

module.exports = {
	mode: "development",
	entry: "./ts-src/index.ts",
	output: {
		filename: "app.js",
		chunkFilename: "[name].chunk.js",
		path: path.resolve(__dirname, "dist"),
		publicPath: "dist"
	},
	target: "electron-renderer",
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	module: {
		rules: [{
			test: /\.ts$/,
			include: /ts-src/,
			use: [{loader: 'ts-loader'}]
		}]
	},
	devtool: "source-map",
	stats: {
		modulesSort: "!size",
	},
	node: {
		fs: "empty",
	},
}
