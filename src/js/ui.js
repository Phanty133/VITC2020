export function initInputs(timeline){
	document.getElementById("windToggle").addEventListener("click", () => { //toggle wind overlay
		let co = document.getElementById("windToggle");
		let c = co.getAttribute("clicked") === "1";
		co.setAttribute("clicked", c ? "0" : "1");
		co.style.opacity = c ? "0.5" : "1";
	});
	
	document.getElementById("playToggle").addEventListener("click", () => { //toggle simulation playing
		let co = document.getElementById("playToggle");
		let c = co.getAttribute("clicked") === "1";
		co.setAttribute("clicked", c ? "0" : "1");
		co.style.opacity = c ? "0.5" : "1";

		if(!c){
			if(timeline.paused){
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
		console.log(!c);
	});

	document.getElementById("maxValueInput").addEventListener("mousemove", () => {
		timeline.frameOptions.maxValue = document.getElementById("maxValueInput").value;
	});

	document.getElementById("lowerBoundInput").addEventListener("mouseup", () => {
		timeline.recalculateRemainingFrames();
	});

	document.getElementById("resolutionInput").addEventListener("mouseup", () => {
		timeline.recalculateRemainingFrames();
	});

	document.getElementById("scrubbingInput").addEventListener("mouseup", () => {
		timeline.recalculateRemainingFrames();
	});
}