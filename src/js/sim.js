import wasm from "wasm/calc.c";

let calcDeposition = () => {console.warn("Function not loaded yet!");};

// Initialize WASM module
wasm.init().then((module) => {
	calcDeposition = module.exports.calcDeposition;
});
