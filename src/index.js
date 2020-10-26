// Import css
import "./css/style.css";
import "leaflet/dist/leaflet.css";

// Import JS modules
import { Map } from "./js/map.js";
import "./js/sim.js";

function init(){
	// Initialize map

	const kalnciemaCoord = [56.792, 23.577];
	const zoom = 10;

	new Map("map", kalnciemaCoord, zoom);
}

// Run init only when the page has fully loaded
if(document.readyState === "complete"){ 
	init();
}
else{
	window.onload = init;
}