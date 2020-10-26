/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/wasm/src/add.c":
/*!****************************!*\
  !*** ./src/wasm/src/add.c ***!
  \****************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = {
		init: function(adjustEnv) {
			if (typeof Promise === "undefined") {
				throw new Error("No Promise support!");
			}
			if (typeof ArrayBuffer === "undefined") {
				throw new Error("No ArrayBuffer support!");
			}

			

			adjustEnv = typeof adjustEnv === "undefined" ? function(obj) { return obj} : adjustEnv;

			
				"use strict";
var ASM_Memory = (function () {
    function ASM_Memory(buffer) {
        this.allocList = [];
        this.sizeList = [];
        this.allocPointer = 0;
        this.mem = {
            1: new Int8Array(buffer),
            2: new Int16Array(buffer),
            4: new Int32Array(buffer),
            40: new Float32Array(buffer),
            80: new Float64Array(buffer),
            i8: new Int8Array(buffer),
            i16: new Int16Array(buffer),
            i32: new Int32Array(buffer),
            f32: new Float32Array(buffer),
            f64: new Float64Array(buffer),
            char: new Int8Array(buffer),
            uchar: new Uint8Array(buffer),
            short: new Int16Array(buffer),
            ushort: new Uint16Array(buffer),
            int: new Int32Array(buffer),
            uint: new Uint32Array(buffer),
            float: new Float32Array(buffer),
            double: new Float64Array(buffer)
        };
        this.max = buffer.byteLength - 1;
    }
    ASM_Memory.prototype.mark = function (stackTop) {
        for (var i = 0; i <= stackTop; i++) {
            this.allocPointer = i;
            this.allocList[i] = true;
        }
    };
    ASM_Memory.prototype.scan = function () {
        var _this = this;
        this.mem.char.forEach(function (val, i) {
            if (val > 0) {
                _this.allocPointer = i;
                _this.allocList[i] = true;
            }
        });
    };
    ASM_Memory.prototype.set = function (addr, value, type) {
        if (type === void 0) { type = 40; }
        if (typeof addr !== "number" || typeof value !== "number") {
            throw new Error("Address & value must be a number!");
        }
        type = (this.sizeList[addr] || type);
        this.mem[type][addr / this.mem[type].BYTES_PER_ELEMENT] = value;
        return this;
    };
    ASM_Memory.prototype.get = function (addr, type) {
        if (type === void 0) { type = 40; }
        if (typeof addr !== "number") {
            throw new Error("Address must be a number!");
        }
        type = (this.sizeList[addr] || type);
        return this.mem[type][addr / this.mem[type].BYTES_PER_ELEMENT];
    };
    ASM_Memory.prototype.avail = function (type) {
        if (type === void 0) { type = 40; }
        var totalBytes = (this.allocList.filter(function (l) { return l; }).length - this.mem.char.byteLength);
        return totalBytes / this.mem[type].BYTES_PER_ELEMENT;
    };
    ASM_Memory.prototype.struct = function (values, type, nested) {
        var _this = this;
        var e = function () {
            throw new Error("Struct can only use arrays of strings and numbers!");
        };
        if (!Array.isArray(values)) {
            e();
        }
        var refs = {};
        var offsets = [];
        var sizeof = values.filter(function (k, i) { return i % 2 === 0; }).reduce(function (p, c, i) {
            var thisSize = (c.split(":")[1] || type);
            if (Array.isArray(values[(i * 2) + 1])) {
                thisSize = "f32";
            }
            offsets.push(p);
            return p + _this.mem[thisSize].BYTES_PER_ELEMENT;
        }, 0);
        var slots = this.malloc(sizeof, "char");
        refs._addr = slots[0];
        refs._length = sizeof;
        refs._keys = values.filter(function (k, i) { return i % 2 === 0; });
        refs._totalLength = sizeof;
        var magicKeys = ["_addr", "_length", "_totalLength", "_keys", "_up"];
        values.forEach(function (i) {
            if (i % 2 === 0) {
                if (typeof values[i] !== "string") {
                    e();
                }
                var key = values[i].split(":").shift();
                var value = values[i + 1];
                var addr = slots[0] + offsets[i / 2];
                if (magicKeys.filter(function (k) { return nested ? (k !== "_up") : true; }).indexOf(key) !== -1) {
                    throw new Error("Can't use any of these keys in struct: " + magicKeys.join(", "));
                }
                if (Array.isArray(value)) {
                    refs[key] = _this.struct(["_up", addr].concat(value), type, true);
                    _this.sizeList[addr] = "f32";
                    _this.set(addr, refs[key]._addr);
                    refs._totalLength += refs[key]._length;
                }
                else if (typeof value === "number") {
                    refs[key] = addr;
                    _this.sizeList[addr] = values[i].split(":")[1] || type;
                    _this.set(refs[key], value || 0, values[i].split(":")[1] || type);
                }
                else {
                    e();
                }
            }
        });
        return refs;
    };
    ASM_Memory.prototype.malloc = function (size, type) {
        var _this = this;
        if (type === void 0) { type = 40; }
        if (typeof size !== "number" || size < 1) {
            throw new Error("Size must be greater than zero and a number!");
        }
        var addresses = [];
        var remainingAdd = size * this.mem[type].BYTES_PER_ELEMENT;
        var mod = this.allocPointer % this.mem[type].BYTES_PER_ELEMENT;
        if (mod) {
            this.allocPointer -= mod;
            this.allocPointer += this.mem[type].BYTES_PER_ELEMENT;
        }
        var _loop_1 = function () {
            var numTries = 0;
            var tryAlloc = function () {
                if (_this.allocPointer >= _this.max) {
                    _this.allocPointer = 0;
                }
                numTries++;
                if (numTries >= _this.max) {
                    throw new Error("Not enough memory left!");
                }
                if (!_this.allocList[_this.allocPointer]) {
                    addresses.push(_this.allocPointer);
                    _this.allocPointer++;
                    if (addresses.length > 1) {
                        if (addresses[addresses.length - 1] - addresses[addresses.length - 2] !== 1) {
                            remainingAdd = size * _this.mem[type].BYTES_PER_ELEMENT;
                            addresses = [];
                        }
                        else {
                            remainingAdd--;
                        }
                    }
                    else {
                        remainingAdd--;
                    }
                }
                else {
                    _this.allocPointer++;
                    numTries % 500 === 0 ? setTimeout(tryAlloc, 0) : tryAlloc();
                }
            };
            tryAlloc();
        };
        while (remainingAdd) {
            _loop_1();
        }
        addresses.forEach(function (a) { _this.allocList[a] = true; });
        var resultAddr = addresses.filter(function (a) { return a % _this.mem[type].BYTES_PER_ELEMENT === 0; });
        resultAddr.forEach(function (addr) {
            _this.sizeList[addr] = type;
        });
        return resultAddr;
    };
    ASM_Memory.prototype.free = function (addr, type) {
        var _this = this;
        if (type === void 0) { type = 40; }
        var freeAlloc = function (start, end) {
            while (start < end) {
                _this.allocList[start] = false;
                start++;
            }
        };
        if (Array.isArray(addr)) {
            addr.forEach(function (a) {
                _this.mem[type][a / _this.mem[type].BYTES_PER_ELEMENT] = 0;
            });
            freeAlloc(addr[0], addr[addr.length - 1] + this.mem[type].BYTES_PER_ELEMENT);
        }
        else {
            addr._keys.forEach(function (key) {
                if (typeof addr[key] === "number") {
                    _this.mem[type][addr[key] / _this.mem[type].BYTES_PER_ELEMENT] = 0;
                }
                else {
                    _this.free(addr[key], type);
                }
            });
            freeAlloc(addr._addr, addr._addr + (addr._length * this.mem[type].BYTES_PER_ELEMENT));
        }
        return this;
    };
    return ASM_Memory;
}());
		
				function bindMemory(env, memClass, type) {
					env._mallocjs = function(len, type) {
						return memClass.malloc(len, type || 40)[0]
					};
					env._freejs = function(start, len, type) {
						type = type || 40;
						var bytes = type > 4 ? Math.round(type / 10) : type;
						var arr = [];
						for (var i = 0; i < len; i++) {
							arr.push(start + (i * bytes));
						}
						memClass.free(arr, type);
					};
					return adjustEnv(env, type);
				}
			
			
			var Module = {};
			var globalEnv = {};
			
			return new Promise((resolve, reject) => {
				// embed minimal invironemnt as long as neither ASMJS or WASM environments exist
				
		var WASM_PAGE_SIZE = 65536;
		var TOTAL_MEMORY = 16777216;
		var noop = function(v) { return v};
		var staticAlloc = function(size) {
			var ret = STATICTOP;
			STATICTOP = (STATICTOP + size + 15) & -16;
			return ret;
		}

		var STATICTOP = 2752;
		var STACKTOP = STATICTOP;
		var tempDoublePtr = STATICTOP; STATICTOP += 16;
		var DYNAMICTOP_PTR = staticAlloc(4);

		var buffer;
		if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function") {
			Module["wasmMemory"] = new WebAssembly.Memory({
				"initial": TOTAL_MEMORY / WASM_PAGE_SIZE,
				"maximum": TOTAL_MEMORY / WASM_PAGE_SIZE
			});
			buffer = Module["wasmMemory"].buffer
		} else {
			buffer = new ArrayBuffer(TOTAL_MEMORY);
		}
		Module.buffer = buffer

						
			Module.asmClass = new ASM_Memory(Module.buffer);
		

		var globalEnv = {
			"global": (typeof window !== "undefined" ? window : self),
			"env": {
				'_time': function(ptr) {
					return Date.now();
				},
				'___setErrNo': noop,
				'_console': function(n) { console.log(n) },
				'_emscripten_memcpy_big': function(dest, src, num) {
					var heap8 = new Uint8Array(mem);
					heap8.set(heap8.subarray(src, src + num), dest);
					return dest
				},
				'enlargeMemory': noop,
				'getTotalMemory': function() { return TOTAL_MEMORY },
				'abortOnCannotGrowMemory': noop,
				'DYNAMICTOP_PTR': DYNAMICTOP_PTR,
				'tempDoublePtr': tempDoublePtr,
				'assert': function(condition, text) { 
					if (!condition) { baseEnv.abort(text) } 
				}, 
				'ABORT': function(err) {
					throw new Error(err);
				},
				'abort': function(err) {
					throw new Error(err)
				},
				'abortStackOverflow': function() {
					throw new Error('overflow');
				},
				'STACKTOP': 0,
				'STACK_MAX': 16777216
			},
			"asm2wasm": {
				"f64-rem": (function (x, y) {
					return x % y
				}),
				"debugger": (function () {
					debugger
				})
			},
			"parent": Module
		};
	

				// ASMJS support
				

				// WASM support
				
					if (typeof WebAssembly === "undefined") {
						throw new Error("No Webassembly support!");
					}
					
		var instanceCallback;

		
			if (!globalEnv.env["table"]) {
				var TABLE_SIZE = Module["wasmTableSize"] || 6;
				var MAX_TABLE_SIZE = Module["wasmMaxTableSize"] || 6;
				if (typeof WebAssembly === "object" && typeof WebAssembly.Table === "function") {
					if (MAX_TABLE_SIZE !== undefined) {
						globalEnv.env["table"] = new WebAssembly.Table({
							"initial": TABLE_SIZE,
							"maximum": MAX_TABLE_SIZE,
							"element": "anyfunc"
						})
					} else {
						globalEnv.env["table"] = new WebAssembly.Table({
							"initial": TABLE_SIZE,
							element: "anyfunc"
						})
					}
				} else {
					globalEnv.env["table"] = new Array(TABLE_SIZE)
				}
				Module["wasmTable"] = globalEnv.env["table"]
			}
			if (!globalEnv.env["memoryBase"]) {
				globalEnv.env["memoryBase"] = Module["STATIC_BASE"]
			}
			if (!globalEnv.env["tableBase"]) {
				globalEnv.env["tableBase"] = 0
			}
			if (!globalEnv.env["memory"]) {
				globalEnv.env["memory"] = Module["wasmMemory"];
			}
		

		var wasmBinary = new Uint8Array([0,97,115,109,1,0,0,0,1,151,128,128,128,0,5,96,0,1,127,96,0,0,96,1,127,0,96,1,127,1,127,96,2,127,127,1,127,2,146,128,128,128,0,1,3,101,110,118,6,109,101,109,111,114,121,2,1,128,2,128,2,3,135,128,128,128,0,6,1,4,0,2,3,0,4,133,128,128,128,0,1,112,1,1,1,6,143,128,128,128,0,2,127,1,65,144,136,192,2,11,127,0,65,132,8,11,7,255,128,128,128,0,8,25,95,95,105,110,100,105,114,101,99,116,95,102,117,110,99,116,105,111,110,95,116,97,98,108,101,1,0,17,95,95,119,97,115,109,95,99,97,108,108,95,99,116,111,114,115,0,0,3,97,100,100,0,1,16,95,95,101,114,114,110,111,95,108,111,99,97,116,105,111,110,0,5,9,115,116,97,99,107,83,97,118,101,0,2,12,115,116,97,99,107,82,101,115,116,111,114,101,0,3,10,115,116,97,99,107,65,108,108,111,99,0,4,10,95,95,100,97,116,97,95,101,110,100,3,1,10,177,128,128,128,0,6,2,0,11,7,0,32,1,32,0,106,11,4,0,35,0,11,6,0,32,0,36,0,11,18,1,2,127,35,0,32,0,107,65,112,113,34,1,36,0,32,1,11,5,0,65,128,8,11,11,139,128,128,128,0,1,0,65,128,8,11,4,0,0,0,0])

		var hasStreaming = typeof WebAssembly.instantiateStreaming === "function";
	
		globalEnv.env = bindMemory(globalEnv.env, Module.asmClass, "wasm");
			
		

	
		(function() {
			if (hasStreaming) {
				return WebAssembly.instantiateStreaming(new Response(wasmBinary, {
					headers: {
						"content-type": "application/wasm"
					}
				}), globalEnv)
			} else {
				return WebAssembly.instantiate(wasmBinary, globalEnv);
			}
		})().then(function(e) {	
			if (instanceCallback) {
				instanceCallback(e);
			}
			Module.asmClass.mark(STACKTOP);
			resolve({
				raw: e,
				emModule: Module,
				exports: Object.keys(e.instance.exports).reduce(function(prev, cur) {
					prev[cur.replace("_", "")] = e.instance.exports[cur];
					return prev;
				}, {}),
				memory: Module.buffer,
				memoryManager: Module.asmClass,
			});
		}).catch(reject);

	
				
			});
		}
	}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__ */
// Import css
//import "./css/style.css";
//import "leaflet/dist/leaflet.css";

// Import JS modules
//import { Map } from "./js/map.js";

// Import WASM
//import "./wasm/build/calc.wasm";
  
const wasm = __webpack_require__(/*! ./wasm/src/add.c */ "./src/wasm/src/add.c");

function init(){
	// Initialize map

	/*const kalnciemaCoord = [56.792, 23.577];
	const zoom = 10;

	new Map("map", kalnciemaCoord, zoom);*/
	wasm.init((imports) => {
		imports._sub = (a, b) => a - b;
		return imports;
	}).then((module) => {
		console.log(module);
	});
}

// Run init only when the page has fully loaded
if(document.readyState === "complete"){ 
	init();
}
else{
	window.onload = init;
}
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92aXRjMjAyMC8uL3NyYy93YXNtL3NyYy9hZGQuYyIsIndlYnBhY2s6Ly92aXRjMjAyMC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly92aXRjMjAyMC8uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUEsaUVBQWlFLFlBQVk7OztBQUc3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGVBQWU7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsOEJBQThCLFdBQVc7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixXQUFXO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLFdBQVc7QUFDekMsOERBQThELFVBQVUsRUFBRTtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0Qsb0JBQW9CLEVBQUU7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCxvQkFBb0IsRUFBRTtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxzQ0FBc0MsRUFBRTtBQUMzRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLFdBQVc7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsMkJBQTJCLEVBQUU7QUFDckUsd0RBQXdELG9EQUFvRCxFQUFFO0FBQzlHO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsV0FBVztBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOzs7QUFHQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDZCQUE2QixpQkFBaUI7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxrQ0FBa0Msc0JBQXNCO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBLHlDO0FBQ0Esc0JBQXNCLHNCO0FBQ3RCLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjtBQUNBOzs7QUFHQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7O0FBRUE7Ozs7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRyxzQjtBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJO0FBQ1Q7QUFDQTtBQUNBLElBQUk7QUFDSixHQUFHOzs7O0FBSUgsSUFBSTtBQUNKO0FBQ0EsRTs7Ozs7O1VDalpBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7QUNyQkE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBVSxNQUFNOztBQUVoQjtBQUNBOztBQUVBLGFBQWEsbUJBQU8sQ0FBQyw4Q0FBa0I7O0FBRXZDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsRUFBRTtBQUNGOztBQUVBO0FBQ0EsdUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cdFx0aW5pdDogZnVuY3Rpb24oYWRqdXN0RW52KSB7XG5cdFx0XHRpZiAodHlwZW9mIFByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gUHJvbWlzZSBzdXBwb3J0IVwiKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gQXJyYXlCdWZmZXIgc3VwcG9ydCFcIik7XG5cdFx0XHR9XG5cblx0XHRcdFxuXG5cdFx0XHRhZGp1c3RFbnYgPSB0eXBlb2YgYWRqdXN0RW52ID09PSBcInVuZGVmaW5lZFwiID8gZnVuY3Rpb24ob2JqKSB7IHJldHVybiBvYmp9IDogYWRqdXN0RW52O1xuXG5cdFx0XHRcblx0XHRcdFx0XCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBBU01fTWVtb3J5ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEFTTV9NZW1vcnkoYnVmZmVyKSB7XHJcbiAgICAgICAgdGhpcy5hbGxvY0xpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLnNpemVMaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5hbGxvY1BvaW50ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMubWVtID0ge1xyXG4gICAgICAgICAgICAxOiBuZXcgSW50OEFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIDI6IG5ldyBJbnQxNkFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIDQ6IG5ldyBJbnQzMkFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIDQwOiBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIDgwOiBuZXcgRmxvYXQ2NEFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIGk4OiBuZXcgSW50OEFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIGkxNjogbmV3IEludDE2QXJyYXkoYnVmZmVyKSxcclxuICAgICAgICAgICAgaTMyOiBuZXcgSW50MzJBcnJheShidWZmZXIpLFxyXG4gICAgICAgICAgICBmMzI6IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKSxcclxuICAgICAgICAgICAgZjY0OiBuZXcgRmxvYXQ2NEFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIGNoYXI6IG5ldyBJbnQ4QXJyYXkoYnVmZmVyKSxcclxuICAgICAgICAgICAgdWNoYXI6IG5ldyBVaW50OEFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIHNob3J0OiBuZXcgSW50MTZBcnJheShidWZmZXIpLFxyXG4gICAgICAgICAgICB1c2hvcnQ6IG5ldyBVaW50MTZBcnJheShidWZmZXIpLFxyXG4gICAgICAgICAgICBpbnQ6IG5ldyBJbnQzMkFycmF5KGJ1ZmZlciksXHJcbiAgICAgICAgICAgIHVpbnQ6IG5ldyBVaW50MzJBcnJheShidWZmZXIpLFxyXG4gICAgICAgICAgICBmbG9hdDogbmV3IEZsb2F0MzJBcnJheShidWZmZXIpLFxyXG4gICAgICAgICAgICBkb3VibGU6IG5ldyBGbG9hdDY0QXJyYXkoYnVmZmVyKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5tYXggPSBidWZmZXIuYnl0ZUxlbmd0aCAtIDE7XHJcbiAgICB9XHJcbiAgICBBU01fTWVtb3J5LnByb3RvdHlwZS5tYXJrID0gZnVuY3Rpb24gKHN0YWNrVG9wKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gc3RhY2tUb3A7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmFsbG9jUG9pbnRlciA9IGk7XHJcbiAgICAgICAgICAgIHRoaXMuYWxsb2NMaXN0W2ldID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgQVNNX01lbW9yeS5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMubWVtLmNoYXIuZm9yRWFjaChmdW5jdGlvbiAodmFsLCBpKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWwgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5hbGxvY1BvaW50ZXIgPSBpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuYWxsb2NMaXN0W2ldID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIEFTTV9NZW1vcnkucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChhZGRyLCB2YWx1ZSwgdHlwZSkge1xyXG4gICAgICAgIGlmICh0eXBlID09PSB2b2lkIDApIHsgdHlwZSA9IDQwOyB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhZGRyICE9PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZGRyZXNzICYgdmFsdWUgbXVzdCBiZSBhIG51bWJlciFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHR5cGUgPSAodGhpcy5zaXplTGlzdFthZGRyXSB8fCB0eXBlKTtcclxuICAgICAgICB0aGlzLm1lbVt0eXBlXVthZGRyIC8gdGhpcy5tZW1bdHlwZV0uQllURVNfUEVSX0VMRU1FTlRdID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgQVNNX01lbW9yeS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGFkZHIsIHR5cGUpIHtcclxuICAgICAgICBpZiAodHlwZSA9PT0gdm9pZCAwKSB7IHR5cGUgPSA0MDsgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgYWRkciAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZGRyZXNzIG11c3QgYmUgYSBudW1iZXIhXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0eXBlID0gKHRoaXMuc2l6ZUxpc3RbYWRkcl0gfHwgdHlwZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVtW3R5cGVdW2FkZHIgLyB0aGlzLm1lbVt0eXBlXS5CWVRFU19QRVJfRUxFTUVOVF07XHJcbiAgICB9O1xyXG4gICAgQVNNX01lbW9yeS5wcm90b3R5cGUuYXZhaWwgPSBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgIGlmICh0eXBlID09PSB2b2lkIDApIHsgdHlwZSA9IDQwOyB9XHJcbiAgICAgICAgdmFyIHRvdGFsQnl0ZXMgPSAodGhpcy5hbGxvY0xpc3QuZmlsdGVyKGZ1bmN0aW9uIChsKSB7IHJldHVybiBsOyB9KS5sZW5ndGggLSB0aGlzLm1lbS5jaGFyLmJ5dGVMZW5ndGgpO1xyXG4gICAgICAgIHJldHVybiB0b3RhbEJ5dGVzIC8gdGhpcy5tZW1bdHlwZV0uQllURVNfUEVSX0VMRU1FTlQ7XHJcbiAgICB9O1xyXG4gICAgQVNNX01lbW9yeS5wcm90b3R5cGUuc3RydWN0ID0gZnVuY3Rpb24gKHZhbHVlcywgdHlwZSwgbmVzdGVkKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RydWN0IGNhbiBvbmx5IHVzZSBhcnJheXMgb2Ygc3RyaW5ncyBhbmQgbnVtYmVycyFcIik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSkge1xyXG4gICAgICAgICAgICBlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZWZzID0ge307XHJcbiAgICAgICAgdmFyIG9mZnNldHMgPSBbXTtcclxuICAgICAgICB2YXIgc2l6ZW9mID0gdmFsdWVzLmZpbHRlcihmdW5jdGlvbiAoaywgaSkgeyByZXR1cm4gaSAlIDIgPT09IDA7IH0pLnJlZHVjZShmdW5jdGlvbiAocCwgYywgaSkge1xyXG4gICAgICAgICAgICB2YXIgdGhpc1NpemUgPSAoYy5zcGxpdChcIjpcIilbMV0gfHwgdHlwZSk7XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlc1soaSAqIDIpICsgMV0pKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzU2l6ZSA9IFwiZjMyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0cy5wdXNoKHApO1xyXG4gICAgICAgICAgICByZXR1cm4gcCArIF90aGlzLm1lbVt0aGlzU2l6ZV0uQllURVNfUEVSX0VMRU1FTlQ7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgdmFyIHNsb3RzID0gdGhpcy5tYWxsb2Moc2l6ZW9mLCBcImNoYXJcIik7XHJcbiAgICAgICAgcmVmcy5fYWRkciA9IHNsb3RzWzBdO1xyXG4gICAgICAgIHJlZnMuX2xlbmd0aCA9IHNpemVvZjtcclxuICAgICAgICByZWZzLl9rZXlzID0gdmFsdWVzLmZpbHRlcihmdW5jdGlvbiAoaywgaSkgeyByZXR1cm4gaSAlIDIgPT09IDA7IH0pO1xyXG4gICAgICAgIHJlZnMuX3RvdGFsTGVuZ3RoID0gc2l6ZW9mO1xyXG4gICAgICAgIHZhciBtYWdpY0tleXMgPSBbXCJfYWRkclwiLCBcIl9sZW5ndGhcIiwgXCJfdG90YWxMZW5ndGhcIiwgXCJfa2V5c1wiLCBcIl91cFwiXTtcclxuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICBpZiAoaSAlIDIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzW2ldICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IHZhbHVlc1tpXS5zcGxpdChcIjpcIikuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlc1tpICsgMV07XHJcbiAgICAgICAgICAgICAgICB2YXIgYWRkciA9IHNsb3RzWzBdICsgb2Zmc2V0c1tpIC8gMl07XHJcbiAgICAgICAgICAgICAgICBpZiAobWFnaWNLZXlzLmZpbHRlcihmdW5jdGlvbiAoaykgeyByZXR1cm4gbmVzdGVkID8gKGsgIT09IFwiX3VwXCIpIDogdHJ1ZTsgfSkuaW5kZXhPZihrZXkpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHVzZSBhbnkgb2YgdGhlc2Uga2V5cyBpbiBzdHJ1Y3Q6IFwiICsgbWFnaWNLZXlzLmpvaW4oXCIsIFwiKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZzW2tleV0gPSBfdGhpcy5zdHJ1Y3QoW1wiX3VwXCIsIGFkZHJdLmNvbmNhdCh2YWx1ZSksIHR5cGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNpemVMaXN0W2FkZHJdID0gXCJmMzJcIjtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXQoYWRkciwgcmVmc1trZXldLl9hZGRyKTtcclxuICAgICAgICAgICAgICAgICAgICByZWZzLl90b3RhbExlbmd0aCArPSByZWZzW2tleV0uX2xlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZnNba2V5XSA9IGFkZHI7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2l6ZUxpc3RbYWRkcl0gPSB2YWx1ZXNbaV0uc3BsaXQoXCI6XCIpWzFdIHx8IHR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0KHJlZnNba2V5XSwgdmFsdWUgfHwgMCwgdmFsdWVzW2ldLnNwbGl0KFwiOlwiKVsxXSB8fCB0eXBlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZWZzO1xyXG4gICAgfTtcclxuICAgIEFTTV9NZW1vcnkucHJvdG90eXBlLm1hbGxvYyA9IGZ1bmN0aW9uIChzaXplLCB0eXBlKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodHlwZSA9PT0gdm9pZCAwKSB7IHR5cGUgPSA0MDsgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygc2l6ZSAhPT0gXCJudW1iZXJcIiB8fCBzaXplIDwgMSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTaXplIG11c3QgYmUgZ3JlYXRlciB0aGFuIHplcm8gYW5kIGEgbnVtYmVyIVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGFkZHJlc3NlcyA9IFtdO1xyXG4gICAgICAgIHZhciByZW1haW5pbmdBZGQgPSBzaXplICogdGhpcy5tZW1bdHlwZV0uQllURVNfUEVSX0VMRU1FTlQ7XHJcbiAgICAgICAgdmFyIG1vZCA9IHRoaXMuYWxsb2NQb2ludGVyICUgdGhpcy5tZW1bdHlwZV0uQllURVNfUEVSX0VMRU1FTlQ7XHJcbiAgICAgICAgaWYgKG1vZCkge1xyXG4gICAgICAgICAgICB0aGlzLmFsbG9jUG9pbnRlciAtPSBtb2Q7XHJcbiAgICAgICAgICAgIHRoaXMuYWxsb2NQb2ludGVyICs9IHRoaXMubWVtW3R5cGVdLkJZVEVTX1BFUl9FTEVNRU5UO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG51bVRyaWVzID0gMDtcclxuICAgICAgICAgICAgdmFyIHRyeUFsbG9jID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmFsbG9jUG9pbnRlciA+PSBfdGhpcy5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5hbGxvY1BvaW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbnVtVHJpZXMrKztcclxuICAgICAgICAgICAgICAgIGlmIChudW1UcmllcyA+PSBfdGhpcy5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgZW5vdWdoIG1lbW9yeSBsZWZ0IVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuYWxsb2NMaXN0W190aGlzLmFsbG9jUG9pbnRlcl0pIHtcclxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzZXMucHVzaChfdGhpcy5hbGxvY1BvaW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmFsbG9jUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWRkcmVzc2VzW2FkZHJlc3Nlcy5sZW5ndGggLSAxXSAtIGFkZHJlc3Nlc1thZGRyZXNzZXMubGVuZ3RoIC0gMl0gIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0FkZCA9IHNpemUgKiBfdGhpcy5tZW1bdHlwZV0uQllURVNfUEVSX0VMRU1FTlQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0FkZC0tO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdBZGQtLTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5hbGxvY1BvaW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICBudW1UcmllcyAlIDUwMCA9PT0gMCA/IHNldFRpbWVvdXQodHJ5QWxsb2MsIDApIDogdHJ5QWxsb2MoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdHJ5QWxsb2MoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHdoaWxlIChyZW1haW5pbmdBZGQpIHtcclxuICAgICAgICAgICAgX2xvb3BfMSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhZGRyZXNzZXMuZm9yRWFjaChmdW5jdGlvbiAoYSkgeyBfdGhpcy5hbGxvY0xpc3RbYV0gPSB0cnVlOyB9KTtcclxuICAgICAgICB2YXIgcmVzdWx0QWRkciA9IGFkZHJlc3Nlcy5maWx0ZXIoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEgJSBfdGhpcy5tZW1bdHlwZV0uQllURVNfUEVSX0VMRU1FTlQgPT09IDA7IH0pO1xyXG4gICAgICAgIHJlc3VsdEFkZHIuZm9yRWFjaChmdW5jdGlvbiAoYWRkcikge1xyXG4gICAgICAgICAgICBfdGhpcy5zaXplTGlzdFthZGRyXSA9IHR5cGU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdEFkZHI7XHJcbiAgICB9O1xyXG4gICAgQVNNX01lbW9yeS5wcm90b3R5cGUuZnJlZSA9IGZ1bmN0aW9uIChhZGRyLCB0eXBlKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodHlwZSA9PT0gdm9pZCAwKSB7IHR5cGUgPSA0MDsgfVxyXG4gICAgICAgIHZhciBmcmVlQWxsb2MgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgICAgICB3aGlsZSAoc3RhcnQgPCBlbmQpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmFsbG9jTGlzdFtzdGFydF0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHN0YXJ0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFkZHIpKSB7XHJcbiAgICAgICAgICAgIGFkZHIuZm9yRWFjaChmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMubWVtW3R5cGVdW2EgLyBfdGhpcy5tZW1bdHlwZV0uQllURVNfUEVSX0VMRU1FTlRdID0gMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGZyZWVBbGxvYyhhZGRyWzBdLCBhZGRyW2FkZHIubGVuZ3RoIC0gMV0gKyB0aGlzLm1lbVt0eXBlXS5CWVRFU19QRVJfRUxFTUVOVCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhZGRyLl9rZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhZGRyW2tleV0gPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5tZW1bdHlwZV1bYWRkcltrZXldIC8gX3RoaXMubWVtW3R5cGVdLkJZVEVTX1BFUl9FTEVNRU5UXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5mcmVlKGFkZHJba2V5XSwgdHlwZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBmcmVlQWxsb2MoYWRkci5fYWRkciwgYWRkci5fYWRkciArIChhZGRyLl9sZW5ndGggKiB0aGlzLm1lbVt0eXBlXS5CWVRFU19QRVJfRUxFTUVOVCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICByZXR1cm4gQVNNX01lbW9yeTtcclxufSgpKTtcclxuXHRcdFxuXHRcdFx0XHRmdW5jdGlvbiBiaW5kTWVtb3J5KGVudiwgbWVtQ2xhc3MsIHR5cGUpIHtcblx0XHRcdFx0XHRlbnYuX21hbGxvY2pzID0gZnVuY3Rpb24obGVuLCB0eXBlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbWVtQ2xhc3MubWFsbG9jKGxlbiwgdHlwZSB8fCA0MClbMF1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGVudi5fZnJlZWpzID0gZnVuY3Rpb24oc3RhcnQsIGxlbiwgdHlwZSkge1xuXHRcdFx0XHRcdFx0dHlwZSA9IHR5cGUgfHwgNDA7XG5cdFx0XHRcdFx0XHR2YXIgYnl0ZXMgPSB0eXBlID4gNCA/IE1hdGgucm91bmQodHlwZSAvIDEwKSA6IHR5cGU7XG5cdFx0XHRcdFx0XHR2YXIgYXJyID0gW107XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGFyci5wdXNoKHN0YXJ0ICsgKGkgKiBieXRlcykpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bWVtQ2xhc3MuZnJlZShhcnIsIHR5cGUpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0cmV0dXJuIGFkanVzdEVudihlbnYsIHR5cGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0dmFyIE1vZHVsZSA9IHt9O1xuXHRcdFx0dmFyIGdsb2JhbEVudiA9IHt9O1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHQvLyBlbWJlZCBtaW5pbWFsIGludmlyb25lbW50IGFzIGxvbmcgYXMgbmVpdGhlciBBU01KUyBvciBXQVNNIGVudmlyb25tZW50cyBleGlzdFxuXHRcdFx0XHRcblx0XHR2YXIgV0FTTV9QQUdFX1NJWkUgPSA2NTUzNjtcblx0XHR2YXIgVE9UQUxfTUVNT1JZID0gMTY3NzcyMTY7XG5cdFx0dmFyIG5vb3AgPSBmdW5jdGlvbih2KSB7IHJldHVybiB2fTtcblx0XHR2YXIgc3RhdGljQWxsb2MgPSBmdW5jdGlvbihzaXplKSB7XG5cdFx0XHR2YXIgcmV0ID0gU1RBVElDVE9QO1xuXHRcdFx0U1RBVElDVE9QID0gKFNUQVRJQ1RPUCArIHNpemUgKyAxNSkgJiAtMTY7XG5cdFx0XHRyZXR1cm4gcmV0O1xuXHRcdH1cblxuXHRcdHZhciBTVEFUSUNUT1AgPSAyNzUyO1xuXHRcdHZhciBTVEFDS1RPUCA9IFNUQVRJQ1RPUDtcblx0XHR2YXIgdGVtcERvdWJsZVB0ciA9IFNUQVRJQ1RPUDsgU1RBVElDVE9QICs9IDE2O1xuXHRcdHZhciBEWU5BTUlDVE9QX1BUUiA9IHN0YXRpY0FsbG9jKDQpO1xuXG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHRpZiAodHlwZW9mIFdlYkFzc2VtYmx5ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBXZWJBc3NlbWJseS5NZW1vcnkgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0TW9kdWxlW1wid2FzbU1lbW9yeVwiXSA9IG5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe1xuXHRcdFx0XHRcImluaXRpYWxcIjogVE9UQUxfTUVNT1JZIC8gV0FTTV9QQUdFX1NJWkUsXG5cdFx0XHRcdFwibWF4aW11bVwiOiBUT1RBTF9NRU1PUlkgLyBXQVNNX1BBR0VfU0laRVxuXHRcdFx0fSk7XG5cdFx0XHRidWZmZXIgPSBNb2R1bGVbXCJ3YXNtTWVtb3J5XCJdLmJ1ZmZlclxuXHRcdH0gZWxzZSB7XG5cdFx0XHRidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoVE9UQUxfTUVNT1JZKTtcblx0XHR9XG5cdFx0TW9kdWxlLmJ1ZmZlciA9IGJ1ZmZlclxuXG5cdFx0XHRcdFx0XHRcblx0XHRcdE1vZHVsZS5hc21DbGFzcyA9IG5ldyBBU01fTWVtb3J5KE1vZHVsZS5idWZmZXIpO1xuXHRcdFxuXG5cdFx0dmFyIGdsb2JhbEVudiA9IHtcblx0XHRcdFwiZ2xvYmFsXCI6ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogc2VsZiksXG5cdFx0XHRcImVudlwiOiB7XG5cdFx0XHRcdCdfdGltZSc6IGZ1bmN0aW9uKHB0cikge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLm5vdygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQnX19fc2V0RXJyTm8nOiBub29wLFxuXHRcdFx0XHQnX2NvbnNvbGUnOiBmdW5jdGlvbihuKSB7IGNvbnNvbGUubG9nKG4pIH0sXG5cdFx0XHRcdCdfZW1zY3JpcHRlbl9tZW1jcHlfYmlnJzogZnVuY3Rpb24oZGVzdCwgc3JjLCBudW0pIHtcblx0XHRcdFx0XHR2YXIgaGVhcDggPSBuZXcgVWludDhBcnJheShtZW0pO1xuXHRcdFx0XHRcdGhlYXA4LnNldChoZWFwOC5zdWJhcnJheShzcmMsIHNyYyArIG51bSksIGRlc3QpO1xuXHRcdFx0XHRcdHJldHVybiBkZXN0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdlbmxhcmdlTWVtb3J5Jzogbm9vcCxcblx0XHRcdFx0J2dldFRvdGFsTWVtb3J5JzogZnVuY3Rpb24oKSB7IHJldHVybiBUT1RBTF9NRU1PUlkgfSxcblx0XHRcdFx0J2Fib3J0T25DYW5ub3RHcm93TWVtb3J5Jzogbm9vcCxcblx0XHRcdFx0J0RZTkFNSUNUT1BfUFRSJzogRFlOQU1JQ1RPUF9QVFIsXG5cdFx0XHRcdCd0ZW1wRG91YmxlUHRyJzogdGVtcERvdWJsZVB0cixcblx0XHRcdFx0J2Fzc2VydCc6IGZ1bmN0aW9uKGNvbmRpdGlvbiwgdGV4dCkgeyBcblx0XHRcdFx0XHRpZiAoIWNvbmRpdGlvbikgeyBiYXNlRW52LmFib3J0KHRleHQpIH0gXG5cdFx0XHRcdH0sIFxuXHRcdFx0XHQnQUJPUlQnOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoZXJyKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0J2Fib3J0JzogZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGVycilcblx0XHRcdFx0fSxcblx0XHRcdFx0J2Fib3J0U3RhY2tPdmVyZmxvdyc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0J1NUQUNLVE9QJzogMCxcblx0XHRcdFx0J1NUQUNLX01BWCc6IDE2Nzc3MjE2XG5cdFx0XHR9LFxuXHRcdFx0XCJhc20yd2FzbVwiOiB7XG5cdFx0XHRcdFwiZjY0LXJlbVwiOiAoZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRcdFx0XHRyZXR1cm4geCAlIHlcblx0XHRcdFx0fSksXG5cdFx0XHRcdFwiZGVidWdnZXJcIjogKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRkZWJ1Z2dlclxuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblx0XHRcdFwicGFyZW50XCI6IE1vZHVsZVxuXHRcdH07XG5cdFxuXG5cdFx0XHRcdC8vIEFTTUpTIHN1cHBvcnRcblx0XHRcdFx0XG5cblx0XHRcdFx0Ly8gV0FTTSBzdXBwb3J0XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmICh0eXBlb2YgV2ViQXNzZW1ibHkgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIFdlYmFzc2VtYmx5IHN1cHBvcnQhXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHR2YXIgaW5zdGFuY2VDYWxsYmFjaztcblxuXHRcdFxuXHRcdFx0aWYgKCFnbG9iYWxFbnYuZW52W1widGFibGVcIl0pIHtcblx0XHRcdFx0dmFyIFRBQkxFX1NJWkUgPSBNb2R1bGVbXCJ3YXNtVGFibGVTaXplXCJdIHx8IDY7XG5cdFx0XHRcdHZhciBNQVhfVEFCTEVfU0laRSA9IE1vZHVsZVtcIndhc21NYXhUYWJsZVNpemVcIl0gfHwgNjtcblx0XHRcdFx0aWYgKHR5cGVvZiBXZWJBc3NlbWJseSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgV2ViQXNzZW1ibHkuVGFibGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdGlmIChNQVhfVEFCTEVfU0laRSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRnbG9iYWxFbnYuZW52W1widGFibGVcIl0gPSBuZXcgV2ViQXNzZW1ibHkuVGFibGUoe1xuXHRcdFx0XHRcdFx0XHRcImluaXRpYWxcIjogVEFCTEVfU0laRSxcblx0XHRcdFx0XHRcdFx0XCJtYXhpbXVtXCI6IE1BWF9UQUJMRV9TSVpFLFxuXHRcdFx0XHRcdFx0XHRcImVsZW1lbnRcIjogXCJhbnlmdW5jXCJcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGdsb2JhbEVudi5lbnZbXCJ0YWJsZVwiXSA9IG5ldyBXZWJBc3NlbWJseS5UYWJsZSh7XG5cdFx0XHRcdFx0XHRcdFwiaW5pdGlhbFwiOiBUQUJMRV9TSVpFLFxuXHRcdFx0XHRcdFx0XHRlbGVtZW50OiBcImFueWZ1bmNcIlxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Z2xvYmFsRW52LmVudltcInRhYmxlXCJdID0gbmV3IEFycmF5KFRBQkxFX1NJWkUpXG5cdFx0XHRcdH1cblx0XHRcdFx0TW9kdWxlW1wid2FzbVRhYmxlXCJdID0gZ2xvYmFsRW52LmVudltcInRhYmxlXCJdXG5cdFx0XHR9XG5cdFx0XHRpZiAoIWdsb2JhbEVudi5lbnZbXCJtZW1vcnlCYXNlXCJdKSB7XG5cdFx0XHRcdGdsb2JhbEVudi5lbnZbXCJtZW1vcnlCYXNlXCJdID0gTW9kdWxlW1wiU1RBVElDX0JBU0VcIl1cblx0XHRcdH1cblx0XHRcdGlmICghZ2xvYmFsRW52LmVudltcInRhYmxlQmFzZVwiXSkge1xuXHRcdFx0XHRnbG9iYWxFbnYuZW52W1widGFibGVCYXNlXCJdID0gMFxuXHRcdFx0fVxuXHRcdFx0aWYgKCFnbG9iYWxFbnYuZW52W1wibWVtb3J5XCJdKSB7XG5cdFx0XHRcdGdsb2JhbEVudi5lbnZbXCJtZW1vcnlcIl0gPSBNb2R1bGVbXCJ3YXNtTWVtb3J5XCJdO1xuXHRcdFx0fVxuXHRcdFxuXG5cdFx0dmFyIHdhc21CaW5hcnkgPSBuZXcgVWludDhBcnJheShbMCw5NywxMTUsMTA5LDEsMCwwLDAsMSwxNTEsMTI4LDEyOCwxMjgsMCw1LDk2LDAsMSwxMjcsOTYsMCwwLDk2LDEsMTI3LDAsOTYsMSwxMjcsMSwxMjcsOTYsMiwxMjcsMTI3LDEsMTI3LDIsMTQ2LDEyOCwxMjgsMTI4LDAsMSwzLDEwMSwxMTAsMTE4LDYsMTA5LDEwMSwxMDksMTExLDExNCwxMjEsMiwxLDEyOCwyLDEyOCwyLDMsMTM1LDEyOCwxMjgsMTI4LDAsNiwxLDQsMCwyLDMsMCw0LDEzMywxMjgsMTI4LDEyOCwwLDEsMTEyLDEsMSwxLDYsMTQzLDEyOCwxMjgsMTI4LDAsMiwxMjcsMSw2NSwxNDQsMTM2LDE5MiwyLDExLDEyNywwLDY1LDEzMiw4LDExLDcsMjU1LDEyOCwxMjgsMTI4LDAsOCwyNSw5NSw5NSwxMDUsMTEwLDEwMCwxMDUsMTE0LDEwMSw5OSwxMTYsOTUsMTAyLDExNywxMTAsOTksMTE2LDEwNSwxMTEsMTEwLDk1LDExNiw5Nyw5OCwxMDgsMTAxLDEsMCwxNyw5NSw5NSwxMTksOTcsMTE1LDEwOSw5NSw5OSw5NywxMDgsMTA4LDk1LDk5LDExNiwxMTEsMTE0LDExNSwwLDAsMyw5NywxMDAsMTAwLDAsMSwxNiw5NSw5NSwxMDEsMTE0LDExNCwxMTAsMTExLDk1LDEwOCwxMTEsOTksOTcsMTE2LDEwNSwxMTEsMTEwLDAsNSw5LDExNSwxMTYsOTcsOTksMTA3LDgzLDk3LDExOCwxMDEsMCwyLDEyLDExNSwxMTYsOTcsOTksMTA3LDgyLDEwMSwxMTUsMTE2LDExMSwxMTQsMTAxLDAsMywxMCwxMTUsMTE2LDk3LDk5LDEwNyw2NSwxMDgsMTA4LDExMSw5OSwwLDQsMTAsOTUsOTUsMTAwLDk3LDExNiw5Nyw5NSwxMDEsMTEwLDEwMCwzLDEsMTAsMTc3LDEyOCwxMjgsMTI4LDAsNiwyLDAsMTEsNywwLDMyLDEsMzIsMCwxMDYsMTEsNCwwLDM1LDAsMTEsNiwwLDMyLDAsMzYsMCwxMSwxOCwxLDIsMTI3LDM1LDAsMzIsMCwxMDcsNjUsMTEyLDExMywzNCwxLDM2LDAsMzIsMSwxMSw1LDAsNjUsMTI4LDgsMTEsMTEsMTM5LDEyOCwxMjgsMTI4LDAsMSwwLDY1LDEyOCw4LDExLDQsMCwwLDAsMF0pXG5cblx0XHR2YXIgaGFzU3RyZWFtaW5nID0gdHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nID09PSBcImZ1bmN0aW9uXCI7XG5cdFxuXHRcdGdsb2JhbEVudi5lbnYgPSBiaW5kTWVtb3J5KGdsb2JhbEVudi5lbnYsIE1vZHVsZS5hc21DbGFzcywgXCJ3YXNtXCIpO1xuXHRcdFx0XG5cdFx0XG5cblx0XG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKGhhc1N0cmVhbWluZykge1xuXHRcdFx0XHRyZXR1cm4gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcobmV3IFJlc3BvbnNlKHdhc21CaW5hcnksIHtcblx0XHRcdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFx0XHRcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL3dhc21cIlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSksIGdsb2JhbEVudilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZSh3YXNtQmluYXJ5LCBnbG9iYWxFbnYpO1xuXHRcdFx0fVxuXHRcdH0pKCkudGhlbihmdW5jdGlvbihlKSB7XHRcblx0XHRcdGlmIChpbnN0YW5jZUNhbGxiYWNrKSB7XG5cdFx0XHRcdGluc3RhbmNlQ2FsbGJhY2soZSk7XG5cdFx0XHR9XG5cdFx0XHRNb2R1bGUuYXNtQ2xhc3MubWFyayhTVEFDS1RPUCk7XG5cdFx0XHRyZXNvbHZlKHtcblx0XHRcdFx0cmF3OiBlLFxuXHRcdFx0XHRlbU1vZHVsZTogTW9kdWxlLFxuXHRcdFx0XHRleHBvcnRzOiBPYmplY3Qua2V5cyhlLmluc3RhbmNlLmV4cG9ydHMpLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcblx0XHRcdFx0XHRwcmV2W2N1ci5yZXBsYWNlKFwiX1wiLCBcIlwiKV0gPSBlLmluc3RhbmNlLmV4cG9ydHNbY3VyXTtcblx0XHRcdFx0XHRyZXR1cm4gcHJldjtcblx0XHRcdFx0fSwge30pLFxuXHRcdFx0XHRtZW1vcnk6IE1vZHVsZS5idWZmZXIsXG5cdFx0XHRcdG1lbW9yeU1hbmFnZXI6IE1vZHVsZS5hc21DbGFzcyxcblx0XHRcdH0pO1xuXHRcdH0pLmNhdGNoKHJlamVjdCk7XG5cblx0XG5cdFx0XHRcdFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBJbXBvcnQgY3NzXG4vL2ltcG9ydCBcIi4vY3NzL3N0eWxlLmNzc1wiO1xuLy9pbXBvcnQgXCJsZWFmbGV0L2Rpc3QvbGVhZmxldC5jc3NcIjtcblxuLy8gSW1wb3J0IEpTIG1vZHVsZXNcbi8vaW1wb3J0IHsgTWFwIH0gZnJvbSBcIi4vanMvbWFwLmpzXCI7XG5cbi8vIEltcG9ydCBXQVNNXG4vL2ltcG9ydCBcIi4vd2FzbS9idWlsZC9jYWxjLndhc21cIjtcbiAgXG5jb25zdCB3YXNtID0gcmVxdWlyZShcIi4vd2FzbS9zcmMvYWRkLmNcIik7XG5cbmZ1bmN0aW9uIGluaXQoKXtcblx0Ly8gSW5pdGlhbGl6ZSBtYXBcblxuXHQvKmNvbnN0IGthbG5jaWVtYUNvb3JkID0gWzU2Ljc5MiwgMjMuNTc3XTtcblx0Y29uc3Qgem9vbSA9IDEwO1xuXG5cdG5ldyBNYXAoXCJtYXBcIiwga2FsbmNpZW1hQ29vcmQsIHpvb20pOyovXG5cdHdhc20uaW5pdCgoaW1wb3J0cykgPT4ge1xuXHRcdGltcG9ydHMuX3N1YiA9IChhLCBiKSA9PiBhIC0gYjtcblx0XHRyZXR1cm4gaW1wb3J0cztcblx0fSkudGhlbigobW9kdWxlKSA9PiB7XG5cdFx0Y29uc29sZS5sb2cobW9kdWxlKTtcblx0fSk7XG59XG5cbi8vIFJ1biBpbml0IG9ubHkgd2hlbiB0aGUgcGFnZSBoYXMgZnVsbHkgbG9hZGVkXG5pZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpeyBcblx0aW5pdCgpO1xufVxuZWxzZXtcblx0d2luZG93Lm9ubG9hZCA9IGluaXQ7XG59Il0sInNvdXJjZVJvb3QiOiIifQ==