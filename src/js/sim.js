import wasm from "wasm/calc.c";

function defaultArgs(checkOpt, defaultOpt){
	if(!checkOpt) return defaultOpt;

	let output = checkOpt;
	const checkOptP = Object.keys(checkOpt);
	for(const p in defaultOpt){
		if(!checkOptP.includes(p)){
			output[p] = defaultOpt[p];
		}
	}

	return output;
}

function copy2DArray(arr){
	let output = [];
	
	for(let i = 0; i < arr.length; i++){
		output.push([...arr[i]]);
	}

	return output;
}

export class SOSimulation{
	constructor(center, options = null){
		this.c = center;
		this.options = defaultArgs(options, {
			Q: 0.00206,
			n: 0.5,
			h: 30,
			radius: 2,
			pointCount: 15000,
			windSpeed: [3.76],
			windAngle: [3.4],
			dataPointSize: 3,
			lowerBound: 0.01,
			upperBound: Infinity,
			reuseMemory: true,
			windSpeedLowerBound: 0.3,
			gridPrecision: 1,
			gridLatRange: [55, 59],
			gridLngRange: [21, 28],
			accumulate: true,
			scrubbing: 0
		});

		if(this.options.windSpeed.length !== this.options.windAngle.length){
			console.warn("Wind speed and wind angle arrays aren't the same length!");
		}

		this.calcDeposition = () => {console.warn("Function not loaded yet!");};
		this.geoPointDistance = () => {console.warn("Function not loaded yet!");};
		this.calcFrameWrapper = () => {console.warn("Function not loaded yet!");};
		this.calcDatasetWrapper = () => {console.warn("Function not loaded yet!");};

		this.bufferPtr = null;
		this.speedBufferPtr = null;
		this.angleBufferPtr = null;

		this.max = 0;

		this.accGridSize = [
			(this.options.gridLngRange[1] - this.options.gridLngRange[0]) * 10 ** this.options.gridPrecision, // lng
			(this.options.gridLatRange[1] - this.options.gridLatRange[0]) * 10 ** this.options.gridPrecision // lat
		];

		this.accGrid = []; // value = accGrid[lngIndex][latIndex]

		for(let lng = 0; lng < this.accGridSize[0]; lng++){
			const col = [];

			for(let lat = 0; lat < this.accGridSize[1]; lat++){
				col.push(0);
			}

			this.accGrid.push(col);
		}

		this.accGridHistory = [];
		this.frameOrder = {
			i0: null,
			i1: null,
			data: null
		};
	}

	init(){
		return new Promise((res, rej) => {
			// Initialize WASM module
			wasm.init(imports => {
				imports.randFloat = Math.random;
				return imports;
			}).then((module) => {
				this.calcDeposition = module.exports.calcDeposition1;
				this.geoPointDistance = module.exports.geoPointDistance;
				this.calcFrameWrapper = module.exports.calcFrameWrapper;
				this.calcDatasetWrapper = module.exports.calcDatasetWrapper;
				this.module = module;
				this.memory = module.memoryManager;
				res();
			}).catch((err) => rej(err));
		});
	}

	calcFrame(index){
		const u = this.options.windSpeed[index];
		const theta = this.options.windAngle[index];
	
		this.bufferPtr = this.checkBuffer(this.bufferPtr, this.options.pointCount * this.options.dataPointSize);
	
		this.calcFrameWrapper(
			u, // Windspeed
			this.options.windSpeedLowerBound,
			this.c[0], // Center latitude
			this.c[1], // Center longitude
			theta, // Wind angle
			this.options.pointCount, // Point count
			this.options.radius, // Radius
			this.options.Q * (1 - this.options.scrubbing), // SO2 emission rate
			this.options.h, // Stack height
			this.options.n, // Cloudiness
			this.bufferPtr[0]
		);
	
		const data = this.readDataPointBuffer({accumulate: this.options.accumulate, index: index})[0]; // Read buffer and return first (and only) frame
	
		if(!this.options.reuseMemory) this.freeMemory(this.bufferPtr);

		return data;
	}

	calcFrames(i0 = 0, i1 = null){
		let max;

		if(i1){
			max = i1;
		}
		else{
			max = this.options.windSpeed.length;
		}

		let data = [];

		for(let i = i0; i < max; i++){
			data.push(this.calcFrame(i));
		}

		return data;
	}

	calcDataset(i0 = 0, i1 = null, stepSize = null){
		let max;
		let step;

		if(i1){
			max = i1;
		}
		else{
			max = this.options.windSpeed.length;
		}

		if(stepSize){
			step = stepSize;
		}
		else{
			step = max;
		}

		const frameCount = max - i0;
		let data = null;

		if(frameCount <= step){
			// Allocate memory for data point buffer
			const pointBufferSize = this.options.pointCount * this.options.dataPointSize * frameCount;
			this.bufferPtr = this.checkBuffer(this.bufferPtr, pointBufferSize);

			// Allocate memory for wind speed buffer
			const speedBufferSize = frameCount;
			
			this.speedBufferPtr = this.checkBuffer(this.speedBufferPtr, speedBufferSize);

			// Allocate memory for wind angle buffer
			const angleBufferSize = frameCount;

			this.angleBufferPtr = this.checkBuffer(this.angleBufferPtr, angleBufferSize);

			// Write to speed and angle buffers
			for(let i = i0; i < max; i++){
				this.memory.set(this.speedBufferPtr[i - i0], this.options.windSpeed[i]);
				this.memory.set(this.angleBufferPtr[i - i0], this.options.windAngle[i]);
			}

			// Calculate dataset
			this.calcDatasetWrapper(
				this.options.windSpeedLowerBound,
				this.c[0],
				this.c[1],
				this.options.pointCount,
				this.options.radius,
				this.options.Q,
				this.options.h,
				this.options.n,
				frameCount,
				this.speedBufferPtr[0],
				this.angleBufferPtr[0],
				this.bufferPtr[0]
			);

			// Read data point buffer
			data = this.readDataPointBuffer(false, frameCount);

			if(!this.options.reuseMemory){
				this.memory.free(this.bufferPtr);
				this.memory.free(this.speedBufferPtr);
				this.memory.free(this.angleBufferPtr);
				console.log("Clearing memory");
			}
		}
		else{
			data = this.calcDataset(i0, i0 + step, step).concat(this.calcDataset(i0 + step, max, step));
		}

		return data;
	}

	readDataPointBuffer(optIn = null){
		let options = defaultArgs(optIn, {
			accumulate: false,
			frames: 1,
			index: null
		});

		const dataset = []; // [Frame: [point: [lat, lng, value]]]

		for(let f = 0; f < options.frames; f++){
			const frameData = [];
			const frameGrid = []; // value = accGrid[lngIndex][latIndex]

			for(let lng = 0; lng < this.accGridSize[0]; lng++){
				const col = [];

				for(let lat = 0; lat < this.accGridSize[1]; lat++){
					col.push([0,0]);
				}

				frameGrid.push(col);
			}

			for(let i = 0; i < this.options.pointCount; i++){
				let el = [];

				for(let j = 0; j < this.options.dataPointSize; j++){
					el.push(this.memory.get(this.bufferPtr[f * this.options.pointCount + i * this.options.dataPointSize + j]));
				}
	
				if(el[2] > this.options.lowerBound && el[2] < this.options.upperBound){
					frameData.push(el);

					if(el[2] > this.max) this.max = el[2];
					if(options.accumulate){
						const index = this.coordinatesToGridIndex(el);
						if(!index) continue;
						
						frameGrid[index[0]][index[1]][0] += el[2];
						frameGrid[index[0]][index[1]][1] += 1;
					}
				}
			}

			for(let lng = 0; lng < this.accGridSize[0]; lng++){
				for(let lat = 0; lat < this.accGridSize[1]; lat++){
					if(frameGrid[lng][lat] === 0) continue;

					this.accGrid[lng][lat]+=frameGrid[lng][lat][0]; /// frameGrid[lng][lat][1]; // Add the average point value
				}
			}

			dataset.push(frameData);
			this.accGridHistory.push(copy2DArray(this.accGrid));
		}
		
		return dataset;
	}

	freeMemory(targetBuffer){
		if(targetBuffer){
			this.memory.free(targetBuffer);
		}
	}

	bufferValid(targetBuffer, targetSize){
		if(!targetBuffer) return -1;
		if(targetBuffer.length !== targetSize || !this.options.reuseMemory) return 0;
		return 1;
	}

	checkBuffer(targetBuffer, targetBufferSize){
		switch(this.bufferValid(targetBuffer, targetBufferSize)){
			case -1:
				return this.memory.malloc(targetBufferSize);
			case 0:
				this.freeMemory(targetBuffer);
				return this.memory.malloc(targetBufferSize);
			default:
				return targetBuffer;
		}
	}

	accGridToCoordinates(index = -1){
		let grid;

		if(index === -1){
			grid = this.accGrid;
		}
		else{
			grid = this.accGridHistory[index];
		}

		let data = [];
		let max = 0;
		const p = 10 ** this.options.gridPrecision;

		for(let lng = 0; lng < this.accGridSize[1]; lng++){
			for(let lat = 0; lat < this.accGridSize[0]; lat++){
				if(grid[lng][lat] < this.options.lowerBound || !grid[lng][lat]) continue;

				data.push([lat / p + this.options.gridLatRange[0], lng / p + this.options.gridLngRange[0], grid[lng][lat]]);
				if(grid[lng][lat] > max) max = grid[lng][lat];
			}
		}

		return data;
	}

	coordinatesToGridIndex(coords){
		const p = 10 ** this.options.gridPrecision;
		const lng = Math.round((coords[1] - this.options.gridLngRange[0]) * p);

		if(lng < 0 || lng > this.accGridSize[0]) return;

		const lat = Math.round((coords[0] - this.options.gridLatRange[0]) * p);

		if(lat < 0 || lat > this.accGridSize[1]) return;

		return [lng, lat];
	}

	getValueAtCoords(coords, curFrame = -1){
		const index = this.coordinatesToGridIndex(coords);
		if(!index) return 0;
		if(curFrame === -1){
			return this.accGrid[index[0]][index[1]];
		}
		
		return this.accGridHistory[curFrame][index[0]][index[1]];
	}
}
