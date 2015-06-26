# gridReport

dependencies: jQuery (any version)

## Options

var o = new gridReport({
	showSlider: true, // default: false
	sliderPosition: "above", // options: above, below | default: above
	threeDimensions: false, // default: false
	containerId: "#gridContainer", // required
	xLabel: "x", 
	yLabel: "y", 
	wLabel: "weight",
	strokeColor: "#000", // default: #000
	labelColor: "#000", // default: #000
	labelStyle: "30px sans-serif", // default: 30px sans-serif
	pointColor: "#aaa" // default: #aaa
});

## Functions

### o.setStartingValue(x, y, w, drawLine)

drawLine is bool for whether to draw a line between starting and new point when the user selects a point

### o.getValue()

returns
{
	x: 0.56 (decimal percentage)
	y: 0.32 (decimal percentage)
	w: 0.9 (decimal percentage)
}

### o.reset()

Resets the grid to its starting configuration

### o.chain(true)

Chains the last user defined point to be the starting point for a new grid.
Argument is whether or not to draw a line between points.

### o.isPointDefined()

returns whether the user has defined a point or not


#### Copyright 2015 David Furlong