# VITC2020
After 8 years of procrastination, hopefully it will have been worth the weight.

Outline: [Google Docs](https://docs.google.com/document/d/1dEdyyxbawSNikHp6Vdax3v1C00PjcRTb6qxdRN5s1QM/edit?usp=sharing)

## Installation

Download packages: `npm i`

## Usage

Build and host server on `localhost:8080` with `npm start`. This will run `webpack serve`. It enables page auto-reload and auto-recompiles code on change.

### VS Code
* To build and host run the `npm: start` task with `Ctrl + Shift + B`
* Launch chrome debugging with `F5`

## Structure

* dist
  * **index.html** - pretty self-explanatory lol

* src
  * css
    * **style.css** - still self-explanatory

  * js
    * **index.js** - Main code for binding modules and including external files like stylesheets
    * **map.js** - Code for configuring and rendering the map
    * **sim.js** - Code for the simulation itself (Mainly point calculations)
    * **ui.js** - User interface code for the simulation
    * **page.js** - Misc code for the webpage (nothing related to the simulation)

**Structure is subject to change**

## Styleguide

### Use tabs, or I will fucking murder you

### JS
* Follow your best judgement where to add an empty line (e.g. to separate a codeblock that is the beginning of something different than the last).
* If something is wrong, ESLint will scream at you. 
* Use `const` for constant variables (most of the variables you define).
* Use `let` for variables that aren't constant.
* Don't fucking ever use `var`.
* Encapsulate all code in either functions or classes. 
* Use ES6.
* Use ES2015 module syntax `import` and `export` for js, css and fonts.

### HTML
* Use XHTML 
  * Tags that don't have a closing tag like `<br>` are closed with a slash e.g. `<br/>` or `<input ... />`
  * Attributes that don't need an explicit value like `disabled` should have its value set as the attribute name e.g. `<element disabled="disabled">``

### CSS
* use your best judgement lol
