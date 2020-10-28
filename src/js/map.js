import L from "leaflet/dist/leaflet";
import "leaflet.heat";
import { Color } from "js/color.js";

export class Map{
	constructor(id, coord, zoom){
		this.map = L.map(id).setView(coord, zoom);
		this.overlay = L.layerGroup().addTo(this.map);

		const mbAttr = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
		const mbUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

		L.tileLayer(mbUrl, {
			attribution: mbAttr,
			minZoom: 6,
			id: "mapbox/streets-v11",
			tileSize: 512,
			zoomOffset: -1,
			accessToken: "pk.eyJ1IjoicGhhbnR5IiwiYSI6ImNrOHZ5MXFoNjA0OWkzb3FwbngwOWI1NWIifQ.zKnx4A9kbXPiRAysdc0asA"
		}).addTo(this.map);

		L.circle(coord, {color: "#FF0000", radius: 800, fillOpacity: 1}).addTo(this.map);
	}

	drawData(dataset, options = null){ // dateset - [[lat, lng, value]]
		if(!options) options = {};

		if(!options.radius) options.radius = 25;
		if(!options.minOpacity) options.minOpacity = 0;
		if(!options.minValue) options.minValue = 0;
		if(!options.maxValue) options.maxValue = 1;
		if(!options.blur) options.blur = 25;

		L.heatLayer(dataset, {max: options.maxValue, radius: options.radius, blur: options.blur}).addTo(this.overlay);

		/*const renderer = L.canvas();
		
		for(const point of dataset){
			const k = (point[2] - options.minValue) / (options.maxValue - options.minValue);
			const col = Color.lerp(options.minColor, options.maxColor, k);
			const opt = {
				radius: options.radius,
				color: col.toHex(),
				renderer: renderer
			};

			
			//this.rendererLayer.addLayer(L.circle([point[0], point[1]], opt));
		}*/
	}

	clearMap(){
		this.overlay.clearLayers();
	}
}