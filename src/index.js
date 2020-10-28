// Import fonts

import "./fonts/OpenSans-Light.ttf";
import "./fonts/RussoOne-Regular.ttf";

// Import css
import "./css/style.css";
import "leaflet/dist/leaflet.css";

// Import JS modules
import { Map } from "./js/map.js";
import { SOSimulation } from "./js/sim.js";
import { initInputs } from "./js/ui";
import { Timeline } from "./js/timeline";

// Import simulation data
import windSpeed from "data/wind_speed.json";
import windDir from "data/wind_direction.json";
import windSpeedExtended from "data/wind_speed_extended.json";
import windDirExtended from "data/wind_direction_extended.json";

function init(){
	// Initialize map

	const kalnciemaCoord = [56.792, 23.577];
	const zoom = 7;

	const map = new Map("map", kalnciemaCoord, zoom);
	const sim = new SOSimulation(kalnciemaCoord, {
		windSpeed: windSpeed, 
		windAngle: windDir, 
		pointCount: 15000, 
		Q: 1, 
		n: 1, 
		h: 30,
		radius: 2,
		lowerBound: 0.2,
		windSpeedLowerBound: 0.5,
		gridPrecision: 1
	});

	sim.init().then(() => {
		console.log("WASM initialized!");

		//map.drawData(sim.calcFrame(0), {minValue: 0, maxValue: 0.4});
		
		const timeline = new Timeline({sim: sim, map: map});

		initInputs(timeline);
	});
}

// Run init only when the page has fully loaded
if(document.readyState === "complete"){ 
	init();
}
else{
	window.onload = init;
}