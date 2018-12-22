var canvas = document.getElementById("canvas");
var slider = document.getElementById("slider");
var toleranceSlider = document.getElementById("tolerance");
var ctx = canvas.getContext("2d");
var drawing = false;
var pointList = [];
var cleanedLine = [];
var tolerance = 1;

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight * 0.9;

slider.addEventListener("input", () => {
  ctx.lineWidth = slider.value;
});

toleranceSlider.addEventListener("input", () => {
  tolerance = toleranceSlider.value;
});

addEventListener("resize", () => {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight * 0.9;
});

addEventListener("mousedown", (e) => {
  drawing = true;
  pointList = [];
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
});

addEventListener("mousemove", (e) => {
  if (drawing) {
    ctx.lineTo(e.clientX, e.clientY);
    ctx.closePath();
    ctx.stroke();
    ctx.moveTo(e.clientX, e.clientY);
    pointList.push({x: e.clientX, y: e.clientY});
  }
});

addEventListener("mouseup", () => {
  drawing = false;
  cleanedLine.push([]);
  cleanedLine[cleanedLine.length - 1].push(simplifyPath(pointList, tolerance));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < cleanedLine.length; i++) {
    ctx.beginPath();
    ctx.moveTo(cleanedLine[i][0][0].x, cleanedLine[i][0][0].y);
    for (var j = 1; j < cleanedLine[i][0].length; j++) {
      ctx.lineTo(cleanedLine[i][0][j].x, cleanedLine[i][0][j].y);
      ctx.closePath();
      ctx.stroke();
      ctx.moveTo(cleanedLine[i][0][j].x, cleanedLine[i][0][j].y);
    }
  }
  console.log(pointList);
  console.log(cleanedLine);
});
