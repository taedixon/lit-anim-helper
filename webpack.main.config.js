// webpack.config.js
module.exports = {
	mode: 'development',
	entry: './ts-src/electron.ts',
	target: 'electron-main',
	module: {
	rules: [{
		test: /\.ts$/,
		include: /src/,
		use: [{ loader: 'ts-loader' }]
	}]
	},
	output: {
	path: __dirname + '/dist',
	filename: 'index.js'
	}
};