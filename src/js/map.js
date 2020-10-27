import L from "leaflet/dist/leaflet";
import "leaflet-webgl-heatmap";
import { Color } from "js/color.js";

export class Map{
	constructor(id, view, zoom){
		this.map = L.map(id).setView(view, zoom);
		this.rendererLayer = L.layerGroup().addTo(this.map);

		L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
			attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
			maxZoom: 18,
			id: "mapbox/streets-v11",
			tileSize: 512,
			zoomOffset: -1,
			accessToken: "pk.eyJ1IjoicGhhbnR5IiwiYSI6ImNrOHZ5MXFoNjA0OWkzb3FwbngwOWI1NWIifQ.zKnx4A9kbXPiRAysdc0asA"
		}).addTo(this.map);
	}

	drawData(dataset, options = null){ // dateset - [[lat, lng, value]]
		if(!options) options = {};

		if(!options.radius) options.radius = 300;
		if(!options.minOpacity) options.minOpacity = 0;
		if(!options.minValue) options.minValue = 0;
		if(!options.maxValue) options.maxValue = 5;
		if(!options.minColor) options.minColor = new Color(0, 0, 255);
		if(!options.maxColor) options.maxColor = new Color(255, 0, 0);

		const renderer = L.canvas();
		
		for(const point of dataset){
			const k = (point[2] - options.minValue) / (options.maxValue - options.minValue);
			const col = Color.lerp(options.minColor, options.maxColor, k);
			const opt = {
				radius: options.radius,
				color: col.toHex(),
				renderer: renderer
			};

			this.rendererLayer.addLayer(L.circle([point[0], point[1]], opt));
		}
	}

	clearMap(){
		this.rendererLayer.clearLayers();
	}
}