// Import css
import "./css/style.css";
import "leaflet/dist/leaflet.css";

// Import JS modules
import { Map } from "./js/map.js";
import { SOSimulation } from "./js/sim.js";

function init(){
	// Initialize map

	const kalnciemaCoord = [56.792, 23.577];
	const zoom = 8;

	const map = new Map("map", kalnciemaCoord, zoom);
	const sim = new SOSimulation();
	sim.init().then(() => {
		console.log("WASM initialized!");
		
		const elCnt = 15000;
		const elSize = 3;
		const memSize = elCnt * elSize;

		const memory = sim.module.memoryManager;
		const bufferPtr = memory.malloc(memSize);

		/* 
		const secondsPerRotation = 10;
		const steps = 128;
		const increment = Math.PI * 2 / steps;
		let windAngle = 0;
		
		setInterval(() => {
			windAngle+=increment;
			const t0 = performance.now();
			sim.module.exports.windTest(5, windAngle, elCnt, 0.5, bufferPtr[0]);
			console.log(`${performance.now() - t0}ms`);

			const dataset = [];

			for(let i = 0; i < elCnt; i++){
				let el = [];
				for(let j = 0; j < elSize; j++){
					el.push(memory.get(bufferPtr[i * elSize + j]));
				}
				
				dataset.push(el);
			}

			map.clearMap();
			map.drawData(dataset, {minValue: 0, maxValue: 5});
		}, secondsPerRotation * 1000 / steps);*/

		const t0 = performance.now();
		sim.module.exports.calcTest(3.76, 3.4, elCnt, 2, bufferPtr[0]);
		//sim.module.exports.windTest(5, 0, elCnt, 1, bufferPtr[0]);
		console.log(`${performance.now() - t0}ms`);

		const dataset = [];

		let max = 0;
		let min = 100;
		let lowerBound = 0.001;
		let upperBound = Infinity;

		for(let i = 0; i < elCnt; i++){
			let el = [];
			for(let j = 0; j < elSize; j++){
				el.push(memory.get(bufferPtr[i * elSize + j]));
			}

			if(el[2] !== Infinity && el[2] > lowerBound && el[2] < upperBound) {
				if(el[2] > max) max = el[2];
				if(el[2] < min) min = el[2];

				dataset.push(el);
			} 
		}

		console.log(`Min: ${min}`);
		console.log(`Max: ${max}`);
		console.log(dataset);

		map.clearMap();
		map.drawData(dataset, {minValue: 0, maxValue: 0.03});

		memory.free(bufferPtr);
	});
}

// Run init only when the page has fully loaded
if(document.readyState === "complete"){ 
	init();
}
else{
	window.onload = init;
}