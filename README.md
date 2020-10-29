# VITC2020
## An SO2 deposition simulation from a theoretical accumulator recycling plant in Kalnciems

After 3 weeks of procrastination, hopefully it will have been worth the 3 day code sprint.

## Build from source
1. Download packages: `npm i`
2. Compile with `npm build`

## Technical details

### How the simulation works

1. JavaScript allocates or reuses previously allocated memory for interaction with WebAssembly.
2. R random points are generated in a set radius around the center (R = resolution).
3. The distance and initial bearing (angle) from each point to the center is calculated.
4. Since the SO2 deposition formulae calculate only the downwind distance of SO2, we approximate the relative wind speed to the center for every point using the wind angle θ.
5. Average SO2 deposition is calculated for every point using SO2 emission rate, distance from the center, relative wind speed, cloudiness factor, and smokestack height.
6. Then an averaged heatmap is drawn.

### Performance

15000 points * 1 frame -> ~4.5ms calculation time
15000 points * 366 frames (days) -> ~3.15s calculation time

### File structure

* dist
  * **index.html** - Site markup

* src
  * css
    * **style.css** - Site stylesheet

  * js
    * **index.js** - Main code for initialization and including external files like stylesheets
    * **map.js** - Code for configuring and rendering the map
    * **sim.js** - Code for the simulation itself (Mainly point calculations)
    * **ui.js** - User interface code for the simulation
    * **timeline.js** - Simulation control code
    * **func.js** - Misc functions
  * wasm
    * **calc.c** - SO2 deposition simulation and map math

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
