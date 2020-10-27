import wasm from "wasm/calc.c";
import windSpeed from "data/wind_speed.json";
import windDir from "data/wind_direction.json";

export class SOSimulation{
	constructor(){
		this.calcDeposition = () => {console.warn("Function not loaded yet!");};
		this.geoPointDistance = () => {console.warn("Function not loaded yet!");};
	}

	init(){
		return new Promise((res, rej) => {
			// Initialize WASM module
			wasm.init(imports => {
				imports.randFloat = Math.random;
				return imports;
			}).then((module) => {
				this.calcDeposition = module.exports.calcDeposition;
				this.geoPointDistance = module.exports.geoPointDistance;
				this.module = module;
				console.log(module);
				res();
			}).catch((err) => rej(err));
		});
	}
}
