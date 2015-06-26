// Copyright 2015 David Furlong

var gr; // stores grid report in global scope

// jquery plugin to prevent selection
$.fn.extend({
    disableSelection: function() {
        this.each(function() {
            this.onselectstart = function() {
                return false;
            };
            this.unselectable = "on";
            $(this).css('-moz-user-select', 'none');
            $(this).css('-webkit-user-select', 'none');
            $(this).css('-webkit-touch-callout', 'none');
        });
    }
});


// stores intervals for clearing.
var interval = {
    //to keep a reference to all the intervals
    intervals : {},

    //create another interval
    make : function ( fun, delay ) {
        //see explanation after the code
        var newInterval = setInterval.apply(
            window,
            [ fun, delay ].concat( [].slice.call(arguments, 2) )
        );

        this.intervals[ newInterval ] = true;

        return newInterval;
    },

    //clear a single interval
    clear : function ( id ) {
        return clearInterval( this.intervals[id] );
    },

    //clear all intervals
    clearAll : function () {
        var all = Object.keys( this.intervals ), len = all.length;

        while ( len --> 0 ) {
            clearInterval( all.shift() );
        }
    }
};

function gridReport(options){
	if(options.containerId === undefined) console.error('gridReport object requires containerId field to be defined');
	

	// user set options
	this.showSlider = options.showSlider || false;
	this.sliderPosition = options.sliderPosition || "above";
	this.threeDimensions = options.threeDimensions || false;
	this.containerId = options.containerId;
	this.xLabel = options.xLabel || "";
	this.yLabel = options.yLabel || "";
	this.wLabel = options.wLabel || "";
	this.strokeColor = options.strokeColor || "#000";
	this.labelColor = options.labelColor || "#000";
	this.labelStyle = options.labelStyle || "30px sans-serif";
	this.drawLine = null;
	this.pointColor = options.pointColor || "#aaa";
	this.lineColor = options.lineColor || "#ccc";

	// ENV variables
	this.startingPoint = null;
	this.nextPoint = {};	
	this.sliderValue = 2; // slider/weight value
	this.pointDefined = false;
	this.canvasJQO = null;
	this.w; // width,height of 4-box
	gr = this;


	// initial setup of dom + canvas
	this.initialSetup = function(){
		var center = $('<center></center>');
		this.canvasJQO = $('<canvas id="gridReportCanvas"></canvas>');
		$('#'+this.containerId).append(center);
		center.append(this.canvasJQO);
		this.resizeCanvas();
		if(this.showSlider && this.threeDimensions){
			var sliderInner = $('<input type="range" id="gridReportWeight" min="1" value="2" max="10" step="1">');
			var slider = $('<div id="gridReportSlider"><label for="gridReportWeight">'+this.wLabel+'</label></div>');
			slider.append(sliderInner);
			sliderInner[0].oninput = function () {
				gr.updateWeight();
			};
			slider.width(this.canvasJQO.width());
			if(this.sliderPosition === "above"){
				this.canvasJQO.before(slider);
			}
			else if(this.sliderPosition === "below"){
				this.canvasJQO.after(slider);
			}
			else console.error('invalid sliderPosition for gridReport')
		}
		$('#'+this.containerId).disableSelection();

		this.drawCanvas();
	}

	this.resizeCanvas = function(){
		var x = Math.min($('#'+this.containerId).width(),$('#'+this.containerId).height() - (this.showSlider ? 50 : 0));
		this.canvasJQO.width(x);
		this.canvasJQO.height(x);
	}

	this.drawCanvas = function(){		
		this.w = Math.min(this.canvasJQO.width(), this.canvasJQO.height()); // w,h of one box
		var canvas = this.canvasJQO.get(0);
		var ctx = canvas.getContext("2d");
		ctx.canvas.width  = this.w;
		ctx.canvas.height = this.w;
		this.wShrink = this.w-60;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.strokeStyle = this.strokeColor;
		ctx.lineWidth = 1;
		ctx.strokeRect(30,30,this.wShrink/2,this.wShrink/2);
		ctx.strokeRect(this.wShrink/2+30,30,this.wShrink/2,this.wShrink/2);
		ctx.strokeRect(30,this.wShrink/2+30,this.wShrink/2,this.wShrink/2);
		ctx.strokeRect(this.wShrink/2+30,this.wShrink/2+30,this.wShrink/2,this.wShrink/2);
		
		// draw x-label
		ctx.fillStyle = this.labelColor;
		ctx.font = this.labelStyle;
		ctx.textAlign = "center"; 
		ctx.fillText(this.xLabel, this.w/2, this.w-5);

		// draw y-label
		ctx.save();
			ctx.translate( 0, this.w / 2 );
			ctx.rotate( 3*Math.PI / 2);
			ctx.fillText(this.yLabel, 0, 22);
		ctx.restore();

	    elemLeft = canvas.offsetLeft;
	    elemTop = canvas.offsetTop;


		if(this.pointDefined){ // (re)draw user defined point
	    	
	    	// draw line between starting and user defined point
	    	if(this.drawLine && this.startingPoint){ 
		    	// line
		    	ctx.beginPath();
		    	ctx.lineCap = "round";
		    	ctx.moveTo(this.startingPoint.x, this.startingPoint.y);
		    	ctx.lineWidth = 3;
		    	ctx.lineTo(this.nextPoint.x, this.nextPoint.y);
		    	ctx.strokeStyle = this.lineColor;
		    	ctx.stroke();
				
		    	// arrow

		    	// figuring out where to draw the arrow
		    	var theta = Math.atan2(this.nextPoint.y-this.startingPoint.y,this.nextPoint.x-this.startingPoint.x);

				ctx.save();
				ctx.translate(this.nextPoint.x, this.nextPoint.y);
				ctx.rotate(theta);
				ctx.fillStyle = this.lineColor;

				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(-10,-10/2);
				ctx.lineTo(-10, 10/2);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
		    }

		    // draw user defined point
    		ctx.beginPath();
			ctx.arc(this.nextPoint.x, this.nextPoint.y, this.sliderValue, 0, 2 * Math.PI, false);
			ctx.fillStyle = this.pointColor;
			ctx.fill();
			ctx.lineWidth = 5; // TODO is this wrong
			ctx.strokeStyle = this.pointColor;
			ctx.stroke();


		}

	    // if has a starting Dot
	    if(this.startingPoint){
			ctx.beginPath();
			ctx.arc(this.startingPoint.x, this.startingPoint.y, this.startingPoint.w || 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = this.pointColor;
			ctx.fill();
			ctx.lineWidth = 5;
			ctx.strokeStyle = this.pointColor;
			ctx.stroke();

		}

		this.canvasJQO.on('mousedown touchstart', function(event){
			elemLeft = canvas.offsetLeft;
			elemTop = canvas.offsetTop;
			var x,y;
			if(event.type == "mousedown"){ // web
			    x = event.pageX - elemLeft;
		       	y = event.pageY - elemTop; 
			}
			else { // mobile
				x = event.originalEvent.touches[0].pageX - elemLeft;
				y = event.originalEvent.touches[0].pageY - elemTop
			}
		    
	       	// alert(x+" "+y+" "+gr.w+" "+elemLeft+" "+elemTop);
			if (y < gr.w-30 && y > 30 && x < gr.w-30 && x > 30 && !gr.pointDefined){
				gr.startingWeight = parseInt($('#gridReportWeight').val());

				gr.loopcounter = 0;
				interval.clearAll();
				interval.make(
					function(){
						gr.loopcounter++;
						var t = Math.min(10, gr.startingWeight+gr.loopcounter);
						$('#gridReportWeight').val(t);
				
						gr.updateWeight(t);
						
				       	// true if in the 4 quadrants and not already placed
						gr.pointDefined = true;
				    	gr.nextPoint.x = x;
				    	gr.nextPoint.y = y;

				    	if(gr.threeDimensions)
				    		gr.nextPoint.w = gr.sliderValue;
				    	
				    	// move or create dot
				    	if(gr.drawLine && gr.startingPoint){
					    	ctx.beginPath();
					    	ctx.moveTo(gr.startingPoint.x, gr.startingPoint.y);
					    	ctx.lineWidth = 3;
					    	ctx.lineTo(gr.nextPoint.x, gr.nextPoint.y);
					    	ctx.strokeStyle = '#aaa';
					    	ctx.stroke();
				    	}
			    		ctx.beginPath(); // todo nextPoint.w
		    			ctx.arc(gr.nextPoint.x, gr.nextPoint.y, gr.nextPoint.w || 2, 0, 2 * Math.PI, false);
						ctx.fillStyle = gr.pointColor;
						ctx.fill();

						gr.drawCanvas();			
					}, 150
				);
			}
		});

		canvas.addEventListener('mouseup', function(event) {
			interval.clearAll();
		}, false);

		canvas.addEventListener('touchend', function(event) {
			interval.clearAll();
		}, false);

	}

	// update w value
	this.updateWeight = function(value){
		var temp = value;
		if(temp === undefined) temp = $('#gridReportWeight').val() || 2;
		this.sliderValue = temp;

		if(this.pointDefined){
			this.drawCanvas();		
		}			
	}

	this.initialSetup();

}

gridReport.prototype.setStartingValue = function(x, y, w, drawLine){
	// todo convert to system
	this.startingPoint = {
		x: (x * (this.w-60))+30,
		y: (-(y-1)*(this.w-60))+30,
		w: Math.round(w * 10)
	}
	this.drawLine = drawLine || false;
	this.drawCanvas();
}

gridReport.prototype.getValue = function(){
	if(this.nextPoint){
		if(this.threeDimensions){
			return {
				x: (this.nextPoint.x-30) / (this.w-60),
				y: 1-((this.nextPoint.y-30) / (this.w-60)),
				w: this.sliderValue / 10
			}
		}
		else {
			return {
				x: (this.nextPoint.x-30) / (this.w-60),
				y: 1-((this.nextPoint.y-30) / (this.w-60))
			}
		}
	}
}

gridReport.prototype.reset = function(){
	this.pointDefined = false;
	this.drawCanvas();
}

gridReport.prototype.chain = function(drawLine){
	if(this.pointDefined){
		this.pointDefined = false;
		this.startingPoint = {};
		this.startingPoint.x = this.nextPoint.x;
		this.startingPoint.y = this.nextPoint.y;
		this.startingPoint.w = this.nextPoint.w;
		this.drawLine = drawLine;
		this.drawCanvas();
	}
	else {
		console.error('cannot chain without pointDefined');
	}
}

gridReport.prototype.isPointDefined = function(){
	return this.pointDefined;
}