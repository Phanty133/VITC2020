document.getElementById("windToggle").addEventListener("click", () => { //toggle wind overlay
    let co = document.getElementById("windToggle")
    let c = co.getAttribute("clicked") === "1";
    co.setAttribute("clicked", c ? "0" : "1");
    co.style.opacity = c ? "0.5" : "1";
});
document.getElementById("playToggle").addEventListener("click", () => { //toggle simulation playing
    let co = document.getElementById("playToggle")
    let c = co.getAttribute("clicked") === "1";
    co.setAttribute("clicked", c ? "0" : "1");
    co.style.opacity = c ? "0.5" : "1";
});
document.getElementById("sumToggle").addEventListener("click", () => { //toggle sum overlay
    let co = document.getElementById("sumToggle")
    let c = co.getAttribute("clicked") === "1";
    co.setAttribute("clicked", c ? "0" : "1");
    co.style.opacity = c ? "0.5" : "1";
});