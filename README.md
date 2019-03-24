# Clean Draw
## Code
* HTML
```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
    <link rel="stylesheet" href="style/main.css">
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <header>
      <h1>CleanDraw</h1>
      <h2>Draw Cleaner.</h2>
      <h3>선 굵기</h3>
      <input type="range" min="0.1" max="10" value="1.1" id="slider">
      <h3>보정도</h3>
      <input type="range" min="1" max="10" value="1" id="tolerance">
      <form id="radio" method="post">
        <input type="radio" name="lineType" value="curve">곡선
        <input type="radio" name="lineType" value="straight">직선
      </form>
    </header>
    <script src="src/douglas-peucker.js" charset="utf-8"></script>
    <script src="src/draw.js" charset="utf-8"></script>
  </body>
</html>
```
* CSS
```css
body {
  margin: 0;
  overflow: hidden;
}

header {
  height: 10vh;
  background-color: #A3E7DD;
  display: flex;
}

input {
  margin: 0;
  margin-left: 20px;
}

h1, h2, h3 {
  font-size: 2rem;
  margin-block-start: 0;
  margin-block-end: 0;
}
h2 {
  font-size: 1rem;
  margin-left: 30px;
  transform: translateY(30%);
}
h3 {
  font-size: 0.7rem;
  margin-left: 50px;
}
```
* JS
```js
var simplifyPath = function( points, tolerance ) {

	// helper classes
	var Vector = function( x, y ) {
		this.x = x;
		this.y = y;

	};
	var Line = function( p1, p2 ) {
		this.p1 = p1;
		this.p2 = p2;

		this.distanceToPoint = function( point ) {
			// slope
			var m = ( this.p2.y - this.p1.y ) / ( this.p2.x - this.p1.x ),
				// y offset
				b = this.p1.y - ( m * this.p1.x ),
				d = [];
			// distance to the linear equation
			d.push( Math.abs( point.y - ( m * point.x ) - b ) / Math.sqrt( Math.pow( m, 2 ) + 1 ) );
			// distance to p1
			d.push( Math.sqrt( Math.pow( ( point.x - this.p1.x ), 2 ) + Math.pow( ( point.y - this.p1.y ), 2 ) ) );
			// distance to p2
			d.push( Math.sqrt( Math.pow( ( point.x - this.p2.x ), 2 ) + Math.pow( ( point.y - this.p2.y ), 2 ) ) );
			// return the smallest distance
			return d.sort( function( a, b ) {
				return ( a - b ); //causes an array to be sorted numerically and ascending
			} )[0];
		};
	};

	var douglasPeucker = function( points, tolerance ) {
		if ( points.length <= 2 ) {
			return [points[0]];
		}
		var returnPoints = [],
			// make line from start to end
			line = new Line( points[0], points[points.length - 1] ),
			// find the largest distance from intermediate poitns to this line
			maxDistance = 0,
			maxDistanceIndex = 0,
			p;
		for( var i = 1; i <= points.length - 2; i++ ) {
			var distance = line.distanceToPoint( points[ i ] );
			if( distance > maxDistance ) {
				maxDistance = distance;
				maxDistanceIndex = i;
			}
		}
		// check if the max distance is greater than our tollerance allows
		if ( maxDistance >= tolerance ) {
			p = points[maxDistanceIndex];
			line.distanceToPoint( p, true );
			// include this point in the output
			returnPoints = returnPoints.concat( douglasPeucker( points.slice( 0, maxDistanceIndex + 1 ), tolerance ) );
			// returnPoints.push( points[maxDistanceIndex] );
			returnPoints = returnPoints.concat( douglasPeucker( points.slice( maxDistanceIndex, points.length ), tolerance ) );
		} else {
			// ditching this point
			p = points[maxDistanceIndex];
			line.distanceToPoint( p, true );
			returnPoints = [points[0]];
		}
		return returnPoints;
	};
	var arr = douglasPeucker( points, tolerance );
	// always have to push the very last point on so it doesn't get left off
	arr.push( points[points.length - 1 ] );
	return arr;
};
var canvas = document.getElementById("canvas");
var slider = document.getElementById("slider");
var toleranceSlider = document.getElementById("tolerance");
var ctx = canvas.getContext("2d");
var drawing = false;
var pointList = [];
var cleanedLine = [];
var tolerance = 1;
var tool = "pen";

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight * 0.9;

var down = (e) => {
  drawing = true;
  pointList = [];
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
};

var move = (e) => {
  if (drawing) {
    ctx.lineTo(e.clientX, e.clientY);
    ctx.closePath();
    ctx.stroke();
    ctx.moveTo(e.clientX, e.clientY);
    pointList.push({x: e.clientX, y: e.clientY});
  }
};

var up = () => {
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
};

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

addEventListener("mousedown", down);
addEventListener("mousemove", move);
addEventListener("mouseup", up);
```

## How To Use
* Drag your mouse to draw pictures
* Control the pen's thickness with first slider
* Control the epsilon with second slider

### [Demo Here](https://tuple0110.github.io/cleandraw/)
