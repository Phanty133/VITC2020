# VITC2020
After 3 weeks of procrastination, hopefully it will have been worth the 3 day code sprint.

## JUST THE SIMULATION - FOR THE VITC2020 JUDGES

Run /dist/index.html

## Installation

Download packages: `npm i`

## Usage

Compile and host live server on `localhost:8080` with `npm start`. This will run `webpack serve`. It enables page auto-reload and auto-recompiles code on change.

### VS Code
* To compile and host run the `npm: start` task
* To build run `npm: build`
* Launch chrome debugging with `F5`

## Structure

* dist
  * **index.html** - pretty self-explanatory lol

* src
  * css
    * **style.css** - still self-explanatory

  * js
    * **index.js** - Main code for initialization and including external files like stylesheets
    * **map.js** - Code for configuring and rendering the map
    * **sim.js** - Code for the simulation itself (Mainly point calculations)
    * **ui.js** - User interface code for the simulation
    * **timeline.js** - Simulation control code
    * **func.js** - Misc functions
  * wasm
    * **calc.c** - SO2 deposition simulation and map math

**Structure is subject to change**

## Styleguide

### Use tabs, or I will fucking murder you

### JS
* Follow your best judgement where to add an empty line (e.g. to separate a codeblock that is the beginning of something different than the last).
* If something is wrong, ESLint will scream at you. 
* Use `const` for constant variables (most of the variables you define).
* Use `let` for variables that aren't constant.
* Don't fucking ever use `var`.
* Use ES6.
* Use ES2015 module syntax `import` and `export` for js, css and fonts.

### CSS
* use your best judgement lol
