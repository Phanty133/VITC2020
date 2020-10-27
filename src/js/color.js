export class Color{
	constructor(r, g, b){
		this.r = clamp(r, 0, 255);
		this.g = clamp(g, 0, 255);
		this.b = clamp(b, 0, 255);
	}

	static add(c1, c2){
		if(c1 instanceof Color && c2 instanceof Color){
			return new Color(
				c1.r + c2.r, 0, 255,
				c1.g + c2.g,
				c1.b + c2.b
			);
		}
		
		return null;
	}

	static sub(){
		if(c1 instanceof Color && c2 instanceof Color){
			return new Color(
				c1.r - c2.r,
				c1.g - c2.g,
				c1.b - c2.b
			);
		}
		
		return null;
	}

	static lerp(min, max, kRaw){
		if(min instanceof Color && max instanceof Color && typeof kRaw === "number"){
			const k = clamp(kRaw, 0, 1);

			return new Color(
				min.r + (max.r - min.r) * k,
				min.g + (max.g - min.g) * k,
				min.b + (max.b - min.b) * k
			);
		}

		return null;
	}

	toHex(){
		let rHex = Math.round(this.r).toString(16);
		if(rHex.length === 1) rHex = `0${rHex}`;

		let gHex = Math.round(this.g).toString(16);
		if(gHex.length === 1) gHex = `0${gHex}`;

		let bHex = Math.round(this.b).toString(16);
		if(bHex.length === 1) bHex = `0${bHex}`;

		return `#${rHex}${gHex}${bHex}`;
	}
}

function clamp(val, min, max){
	if(val > max) return max;
	if(val < min) return min;
	return val;
}