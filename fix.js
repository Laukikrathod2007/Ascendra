const fs = require("fs");
let main = fs.readFileSync("src/main.js", "utf8");

main = main.replace("function navigate(pageId) {", "function navigate(pageId, extraArg) {");
main = main.replace('area.innerHTML = renderManagerReview(); break;', 'area.innerHTML = renderManagerReview(extraArg); break;');
main = main.replace("window.navigate = navigate;", "window.navigate = navigate;\nwindow.reviewSheet = function(empId) { navigate('team', empId); };");

fs.writeFileSync("src/main.js", main, "utf8");
console.log("main.js patched");
