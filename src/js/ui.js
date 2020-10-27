document.getElementById("windToggle").addEventListener("click", () => { //toggle wind overlay
    c = document.getElementById("windToggle").getAttribute("clicked") === "1";
    document.getElementById("windToggle").setAttribute("clicked", c ? "0" : "1");
    document.getElementById("windToggle").style.opacity = c ? "0.5" : "1";
});