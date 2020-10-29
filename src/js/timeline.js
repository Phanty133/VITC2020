import { defaultArgs } from "js/func";
import { loading, mainSetResetIcon } from "js/ui";

function elVal(id){
	return document.getElementById(id).value;
}

Date.prototype.addDays = function(days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

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
			date0: new Date(2019, 0, 1),
			wind: false,
			showTooltips: true
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
			cloudiness: "cloudinessInput",
			maxValue: "maxValueInput"
		});

		this.defaultInputVal = defaultArgs(defaultInputVal, { // [Value when accumulate = false, Value when accumulate = true]
			resolution: [10000, 2500],
			scrubbing: [0, 0],
			cloudiness: [0.5, 0.5],
			maxValue: [0.5, 7]
		});

		this.frameOptions = {};
		this.updateInputs();

		this.curFrame = -1;
		this.frameData = null;
		this.clock = null;
		this.sim = this.options.sim;
		this.map = this.options.map;
		this.spf = this.options.simLength / this.options.frameCount;
		this.paused = false;
		this.dateEl = document.getElementById(this.options.dateElID);
		this.curDate = this.options.date0;
		this.done = false;
		this.windCounter = 5;

		this.map.map.on("click", (e) => {this.mapClickHandler(e);});
	}

	precalculateFrames(){
		if(this.frameOptions === null){
			console.error("Frame options have not been set!");
			return;
		}

		this.sim.options.pointCount = this.frameOptions.resolution;
		this.sim.options.n = this.frameOptions.cloudiness;
		this.sim.options.scrubbing = this.frameOptions.scrubbing;

		this.frameData = this.sim.calcFrames(0, this.options.frameCount);
	}

	start(options = null){		
		this.frameOptions = defaultArgs(options, {
			resolution: elVal(this.inputs.resolution),
			scrubbing: elVal(this.inputs.scrubbing),
			cloudiness: elVal(this.inputs.cloudiness),
			maxValue: elVal(this.inputs.maxValue),
			displayAccumulate: this.options.displayAccumulate
		});

		console.log(this.frameOptions);
		loading(true);

		setTimeout(() => {
			this.curFrame = -1;
			this.precalculateFrames();
			this.clock = setInterval(() => {this.update();}, this.spf * 1000);

			loading(false);
		}, 1000);
	}

	drawNextFrame(){
		this.map.clearMap();
		let options = {
			maxValue: this.frameOptions.maxValue,
			radius: this.options.radius,
			blur: this.options.blur
		};

		if(this.frameOptions.displayAccumulate){
			this.map.drawData(this.sim.accGridToCoordinates(++this.curFrame), options);
		}
		else{
			this.map.drawData(this.frameData[++this.curFrame], options);
		}

		if(this.options.wind && ++this.windCounter === 6){
			this.windCounter = 0;
			this.map.updateWindMap(this.sim.options.windSpeed[this.curFrame], this.sim.options.windAngle[this.curFrame]);
		}
	}

	update(){
		if(this.paused) return;
		if(this.curFrame === this.options.frameCount - 1) {
			this.endSimulation();
			return;
		}

		console.log("upd");
		this.drawNextFrame();

		const date = this.curDate.getDate().toString();
		const month = (this.curDate.getMonth() + 1).toString();

		this.curDate = this.curDate.addDays(this.curFrame % this.options.framesPerDay + 1);
		this.dateEl.innerText = `${date.length === 1 ? `0${date}` : date}.${month.length === 1 ? `0${month}` : month}.${this.curDate.getFullYear()}`;
	}

	endSimulation(){
		clearInterval(this.clock);
		this.pause();
		mainSetResetIcon();
		this.done = true;
	}

	pause(state = true){
		if(this.done){
			this.restart();
			return;
		}

		this.paused = state;
	}

	restart(){
		this.done = false;
		this.frameData = null;
		this.frameOptions = {};
		this.curFrame = -1;
		this.map.clearMap();
		this.pause(false);
		this.curDate = this.options.date0;

		const playBtn = document.getElementById("playToggle");
		playBtn.src = "./images/play_toggle.png";
		playBtn.setAttribute("clicked", "0");
	}

	recalculateRemainingFrames(){
		if(this.frameOptions === null){
			console.error("Frame options have not been set!");
			return;
		}

		if(this.done || this.curFrame === -1) return;

		this.getInputs();

		this.sim.options.pointCount = this.frameOptions.resolution;
		this.sim.options.n = this.frameOptions.cloudiness;
		this.sim.options.scrubbing = this.frameOptions.scrubbing / 100;

		loading(true);
		let prevPause = this.paused;
		this.pause();

		setTimeout(() => {
			this.frameData.splice(this.curFrame, this.options.frameCount - this.curFrame);
			this.frameData.push(...this.sim.calcFrames(this.curFrame, this.options.frameCount));
			if(!prevPause) this.pause(false);

			loading(false);
		}, 1000);
	}

	updateInputs(){
		let accIndex = this.frameOptions.displayAccumulate ? 1 : 0;

		for(let k in this.defaultInputVal){
			const el = document.getElementById(this.inputs[k]);

			if(k !== "maxValue" && el.value != this.defaultInputVal[k][(accIndex + 1) % 2]) continue;

			el.value = this.defaultInputVal[k][accIndex];
			this.frameOptions[k] = this.defaultInputVal[k][accIndex];
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
		this.frameOptions.displayAccumulate = state;

		this.updateInputs();

		if(this.paused){
			this.redrawCurrentFrame();
		}
	}

	redrawCurrentFrame(){
		this.curFrame = this.done ? this.options.frameCount - 2 : this.curFrame - 1;
		this.drawNextFrame();
	}

	showWind(state = true){
		this.options.wind = state;

		if(!state){
			this.map.windData[0].data = [];
			this.map.windData[1].data = [];
		}
	}

	mapClickHandler(e){
		if(!this.options.showTooltips || this.curFrame === -1) return;

		const val = Math.round(this.sim.getValueAtCoords([e.latlng.lat, e.latlng.lng], this.curFrame));
		this.map.showTooltipAtCoords(e.latlng, `Total: ${val} kg SO<sub>2</sub>/m<sup>2</sup>`);
	}
}