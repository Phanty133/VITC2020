import { defaultArgs } from "js/func";

function elVal(id){
	return document.getElementById(id).value;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

export class Timeline{
	constructor(options = null, inputs = null, defaultInputVal = null){
		this.options = defaultArgs(options, {
			simLength: 60,
			frameCount: 366,
			blur: 25,
			radius: 25,
			displayAccumulate: false,
			framesPerDay: 1,
			dateElID: "dateDisplay",
			date0: new Date(2019, 0, 1)
		});

		if(!this.options.sim || !this.options.map){
			if(!this.options.sim){
				console.error("An SO2Simulation object hasn't been given!");
			}
			else{
				console.error("A map object hasn't been given!");
			}

			return;
		}

		this.inputs = defaultArgs(inputs, {
			resolution: "resolutionInput",
			scrubbing: "scrubbingInput",
			lowerBound: "lowerBoundInput",
			maxValue: "maxValueInput"
		});

		this.defaultInputVal = defaultArgs(defaultInputVal, { // [Value when accumulate = false, Value when accumulate = true]
			resolution: [10000, 5000],
			scrubbing: [0, 0],
			lowerBound: [0.2, 0.01],
			maxValue: [0.5, 60]
		});

		this.updateInputs();

		this.curFrame = -1;
		this.frameData = null;
		this.frameOptions = null;
		this.clock = null;
		this.sim = this.options.sim;
		this.map = this.options.map;
		this.spf = this.options.simLength / this.options.frameCount;
		this.paused = false;
		this.dateEl = document.getElementById(this.options.dateElID);
		this.curDate = this.options.date0;
	}

	precalculateFrames(){
		if(this.frameOptions === null){
			console.error("Frame options have not been set!");
			return;
		}

		this.sim.options.pointCount = this.frameOptions.resolution;
		this.sim.options.lowerBound = this.frameOptions.lowerBound;
		this.sim.options.scrubbing = this.frameOptions.scrubbing;

		this.frameData = this.sim.calcFrames(0, this.options.frameCount);
	}

	start(options = null){
		this.frameOptions = defaultArgs(options, {
			resolution: elVal(this.inputs.resolution),
			scrubbing: elVal(this.inputs.scrubbing),
			lowerBound: elVal(this.inputs.lowerBound),
			maxValue: elVal(this.inputs.maxValue),
			displayAccumulate: this.options.displayAccumulate
		});

		this.curFrame = -1;
		this.precalculateFrames();
		this.clock = setInterval(() => {this.update();}, this.spf * 1000);
	}

	drawNextFrame(){
		this.map.clearMap();
		let options = {
			maxValue: this.frameOptions.maxValue,
			radius: this.options.radius,
			blur: this.options.blur
		};

		console.log(this.frameOptions);

		if(this.frameOptions.displayAccumulate){
			this.map.drawData(this.sim.accGridToCoordinates(++this.curFrame), options);
		}
		else{
			this.map.drawData(this.frameData[++this.curFrame], options);
		}
	}

	update(){
		if(this.paused) return;

		this.drawNextFrame();

		const date = this.curDate.getDate().toString();
		const month = (this.curDate.getMonth() + 1).toString();

		this.curDate = this.curDate.addDays(this.curFrame % this.options.framesPerDay + 1);
		this.dateEl.innerText = `${date.length === 1 ? `0${date}` : date}.${month.length === 1 ? `0${month}` : month}.${this.curDate.getFullYear()}`;

		if(this.curFrame === this.options.frameCount) clearInterval(this.clock);
	}

	pause(state = true){
		this.paused = state;
	}

	restart(){
		this.curFrame = 0;
		this.frameData = null;
		this.start();
	}

	recalculateRemainingFrames(){
		if(this.frameOptions === null){
			console.error("Frame options have not been set!");
			return;
		}

		if(this.curFrame === this.options.frameCount) return;

		this.getInputs();

		this.sim.options.pointCount = this.frameOptions.resolution;
		this.sim.options.lowerBound = this.frameOptions.lowerBound;
		this.sim.options.scrubbing = this.frameOptions.scrubbing;

		this.frameData = this.sim.calcFrames(this.curFrame, this.options.frameCount);
	}

	updateInputs(){
		let accIndex = 0;

		if(this.frameOptions && this.frameOptions.displayAccumulate){
			accIndex = 1;
		}

		for(let k in this.defaultInputVal){
			document.getElementById(this.inputs[k]).value = this.defaultInputVal[k][accIndex];
			if(this.frameOptions) this.frameOptions[k] = this.defaultInputVal[k][accIndex];
		}
	}

	getInputs(){
		if(!this.frameOptions) return;

		for(let k in this.inputs){
			this.frameOptions[k] = document.getElementById(this.inputs[k]).value;
		}
	}

	updateAccumulate(state){
		this.options.displayAccumulate = state;

		if(this.curFrame !== -1){ // Check if the simulation has been started
			this.frameOptions.displayAccumulate = state;	
		}

		this.updateInputs();
	}
}