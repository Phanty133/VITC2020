export function initInputs(timeline){
	document.getElementById("resetButton").addEventListener("click", () => { //toggle wind overlay
		/*let co = document.getElementById("resetButton");
		let c = co.getAttribute("clicked") === "1";
		co.setAttribute("clicked", c ? "0" : "1");
		co.style.opacity = c ? "0.5" : "1";*/

		timeline.restart();
		clearInterval(timeline.clock);
	});
	
	document.getElementById("playToggle").addEventListener("click", () => { //toggle simulation playing
		let co = document.getElementById("playToggle");
		let c = co.getAttribute("clicked") === "1";
		co.setAttribute("clicked", c ? "0" : "1");
		co.src = !c ? "./images/pause_toggle.png" : "./images/play_toggle.png";

		if(!c){
			if(timeline.curFrame >= 0){
				timeline.pause(false);
			}
			else{
				timeline.start();
			}
			
		}
		else{
			timeline.pause();
		}
	});
	
	document.getElementById("sumToggle").addEventListener("click", () => { //toggle sum overlay
		let co = document.getElementById("sumToggle");
		let c = co.getAttribute("clicked") === "1";
		co.setAttribute("clicked", c ? "0" : "1");
		co.style.opacity = c ? "0.5" : "1";
		
		timeline.updateAccumulate(!c);
	});

	document.getElementById("maxValueInput").addEventListener("mousemove", () => {
		timeline.frameOptions.maxValue = document.getElementById("maxValueInput").value;
		timeline.redrawCurrentFrame();
	});

	document.getElementById("cloudinessInput").addEventListener("mouseup", () => {
		timeline.recalculateRemainingFrames();
	});

	document.getElementById("resolutionInput").addEventListener("mouseup", () => {
		timeline.recalculateRemainingFrames();
	});

	document.getElementById("scrubbingInput").addEventListener("mouseup", () => {
		timeline.recalculateRemainingFrames();
	});

	document.getElementById("about").addEventListener("focus", () => {
		document.getElementById("right").style.height = "100vh";
	});

	document.getElementById("about").addEventListener("blur", () => {
		document.getElementById("right").style.height = "90vh";
	});
}

export function loading(state){
	const el = document.getElementById("bgLoad");
	el.style.opacity = state ? 0.75 : 0;
	el.style.pointerEvents = state ? "initial" : "none";
}

export function mainSetResetIcon(){
	const btn = document.getElementById("playToggle");
	btn.setAttribute("clicked", "1");
	btn.src = "./images/reset_toggle.png";
}
