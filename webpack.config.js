const path = require("path");

module.exports = {
	mode: "development",
	devtool: "inline-source-map",
	entry: "./src/index.js",
	devServer: {
		contentBase: "./dist"
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	resolve:{
		modules: [path.resolve(__dirname, "src"), "node_modules"]
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader",
				],
			},
			{
				test: /\.png$/,
				loader: "file-loader"
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					"file-loader",
				],
			},
		]
	}
};