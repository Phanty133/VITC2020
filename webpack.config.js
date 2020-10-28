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
		extensions: [".js", ".c", ".cpp", ".css"],
		alias: {
			"./images/layers.png$": path.resolve(
				__dirname,
				"./node_modules/leaflet/dist/images/layers.png"
			),
			"./images/layers-2x.png$": path.resolve(
				__dirname,
				"./node_modules/leaflet/dist/images/layers-2x.png"
			),
			"./images/marker-icon.png$": path.resolve(
				__dirname,
				"./node_modules/leaflet/dist/images/marker-icon.png"
			),
			"./images/marker-icon-2x.png$": path.resolve(
				__dirname,
				"./node_modules/leaflet/dist/images/marker-icon-2x.png"
			),
			"./images/marker-shadow.png$": path.resolve(
				__dirname,
				"./node_modules/leaflet/dist/images/marker-shadow.png"
			)
		}
	},
	node: false,
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
				test: /\.(gif|svg|jpg|png)$/,
				loader: "file-loader"
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "fonts/"
					}
				}
			},
			{
				test: /\.(c|cpp)$/,
				use: {
					loader: "cpp-wasm-loader",
					options: {
						// For some godforsaken reason, when adding extra flags, you need to remove the space between "-s" and the flag name. 
						// Why? Because fuck you. Thats why.
						emccFlags: (existingFlags) => existingFlags.concat(["-sERROR_ON_UNDEFINED_SYMBOLS=0"]) 
					}
				}
			}
		]
	}
};