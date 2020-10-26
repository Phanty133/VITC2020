const path = require("path");

module.exports = {
	mode: "development",
	context: path.resolve(__dirname, "."),
	devtool: "inline-source-map",
	entry: "./src/index.js",
	devServer: {
		contentBase: "./dist"
	},
	experiments: {
		asyncWebAssembly: true
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	resolve:{
		modules: [path.resolve(__dirname, "src"), "node_modules", ],
		extensions: [".js", ".c", ".cpp", ".css"]
	},
	//node: false,
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
			{
				test: /\.(c|cpp)$/,
				loader: "cpp-wasm-loader"
			}
		]
	}
};