import L from "leaflet/dist/leaflet";
import "leaflet.heat";
import "leaflet-velocity";
import { Color } from "js/color.js";

export class Map{
	constructor(id, coord, zoom){
		this.map = L.map(id).setView(coord, zoom);
		this.overlay = L.layerGroup().addTo(this.map);

		const mbAttr = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
		const mbUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

		const satLayer = L.tileLayer(mbUrl, {
			attribution: mbAttr,
			minZoom: 6,
			id: "mapbox/streets-v11",
			tileSize: 512,
			zoomOffset: -1,
			accessToken: "pk.eyJ1IjoicGhhbnR5IiwiYSI6ImNrOHZ5MXFoNjA0OWkzb3FwbngwOWI1NWIifQ.zKnx4A9kbXPiRAysdc0asA"
		}).addTo(this.map);

		L.circle(coord, {color: "#FF0000", radius: 800, fillOpacity: 1}).addTo(this.map);

		const lat1 = 58.25;
		const lng1 = 20;
		const nx = 2; // must be > 2
		const ny = 2; // must be > 2
		const dx = 9;
		const dy = 3;
		
		this.windData = [
			{
				"header": {
					"la1": lat1, 
					"lo1": lng1,
					"parameterUnit": "m.s-1", 
					"parameterNumber": 2, 
					"dx": dx, 
					"dy": dy, 
					"parameterNumberName": "eastward_wind", 
					"parameterCategory": 2,  
					"nx": nx, 
					"ny": ny, 
					"refTime": "2017-02-01 23:00:00", 
				}, 
				"data": []
			}, 
			{
				"header": {
					"la1": lat1, 
					"lo1": lng1,
					"parameterUnit": "m.s-1", 
					"parameterNumber": 3, 
					"dx": dx, 
					"dy": dy, 
					"parameterNumberName": "northward_wind", 
					"parameterCategory": 2,  
					"nx": nx, 
					"ny": ny, 
					"refTime": "2017-02-01 23:00:00", 
				}, 
				"data": []
			}
		];

		this.windLayer = L.velocityLayer({
			displayValues: true,
			displayOptions: {
				angleConvention: "bearingCW"
			},
			data: this.windData
		}).addTo(this.map);
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

	calcWindAngle(a, b){
		const atan = Math.atan(a / b) * (180 / Math.PI);

		return atan + (b < 0 ? 180 : 0) + (b > 0 && a < 0 ? 360 : 0); //+ k;
	}

	calcABFromWindSpeedAndAngle(v, theta){
		let k, a, b;

		k = theta > Math.PI ? -1 : 1;
		a = k * v / Math.sqrt(1 + Math.pow(1 / Math.tan(theta), 2));
		b = a / Math.tan(theta);

		if(theta === 0) b = 1;

		return [a, b];
	}

	updateWindMap(v, theta){
		const ab = this.calcABFromWindSpeedAndAngle(v, theta);
		this.windData[0].data = [ab[0], ab[0], ab[0], ab[0]];
		this.windData[1].data = [ab[1], ab[1], ab[1], ab[1]];

		this.windLayer.setData(this.windData);
	}

	showTooltipAtCoords(coords, text){
		L.popup().setLatLng(coords).setContent(text).openOn(this.map);
	}
}