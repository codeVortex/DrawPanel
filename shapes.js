/**
 * @author Athanasios Kontis
 */

(function (Utilities) {
	"use strict";
	
	// private variables residing only in Shape NS closure
	var palette = ["blue", "gray", "orange", "red", "green", "magenta", "slateblue", "indigo", "plum", "royalblue", "firebrick", "darkblue", "crimson", "darkgreen", "darkorange", "teal", "maroon", "purple", "fuchsia", "navy"],
		availableShapeTypes = ["Square", "Triangle", "Point", "Circle"],
		shapes	= [];

	// Definition of Shape object (constructor and prototype)
	function Shape (canvasX, canvasY, colorMode, annotationMode, context2d) {

		// colour mode check
		if (typeof colorMode !== "boolean") {
			throw new TypeError("Required parameter 'colorMode' must be a boolean");
		}
		
		// annotation mode check
		if (typeof annotationMode !== "boolean") {
			throw new TypeError("Required parameter 'annotationMode' must be a boolean");
		}
		
		// initializing and setting properties
		this.setContext(context2d);
		this.setX(canvasX);
		this.setY(canvasY);
		this.setColorMode(colorMode);
		this.setColor();
		this.setAnnotationMode(annotationMode);
		this.setRotationAngle();
	}	// end of Shape constructor function
	
	Shape.
		method('constructor', Shape).
		method('setContext', function (context2d) {
			if (context2d && context2d instanceof CanvasRenderingContext2D) {
				this.ctx = context2d;
			}
			else {
				throw new TypeError("context2d should be a CanvasRenderingContext2D instance");
			}
		}).
		method('setX', function (x) {
			if (!Utilities.isFinite(x)) {
				throw new TypeError("Parameter to X coordinate must be a number");
			}
			this.x = Math.round(x);
		}).
		method('setY', function (y) {
			if (!Utilities.isFinite(y)) {
				throw new TypeError("Parameter to Y coordinate must be a number");
			}
			this.y = Math.round(y);
		}).
		method('getRandomColor', function () {
			var index = Math.floor(Math.random() * palette.length);
			return palette[index];
		}).
		method('setAnnotationMode', function (annotationMode) {
			this.annotationMode = annotationMode;
		}).
		method('setColorMode', function (colorMode) {
			this.colorMode = colorMode;
		}).
		method('setColor', function () {
			this.color = this.colorMode === true ? this.getRandomColor() : "black";
		}).
		method('setRotationAngle', function (rotationAngle) {
			// in radians (has no meaning for Circle and Point despite its being inherited)
			this.rotationAngle = (rotationAngle && Utilities.isFinite(rotationAngle)) || Math.PI * Utilities.getRandomInt(0, 360) / 180;
		}).
		method('annotate', function() {
			if (!this.annotationMode) return;
			var annotationLabel = this.getAnnotationInfo(),
				annotationLabelWidth = annotationLabel.length * 4,
				annotationLabelHeight = 10,
				canvas = this.ctx.canvas,
				textX = ( this.x >= canvas.width - annotationLabelWidth ) ? this.x - annotationLabelWidth : this.x,
				textY = ( this.y <= annotationLabelHeight + 6) ? this.y + (this.radius ? this.radius : this.side) + annotationLabelHeight : this.y - annotationLabelHeight;
			this.ctx.font = "10px Amble-LightCondensed";
			this.ctx.strokeStyle = this.colorMode ? this.color : "black";
			this.ctx.beginPath();
			this.ctx.strokeText( annotationLabel, textX, textY);
			this.ctx.closePath();
		}).
		method('getMeasurementInfo', function() {
			return (this.hasOwnProperty("radius") ? "radius: " + this.radius : "side: " + this.side) + "px";
		});		// end of Shape method definition

	// Definition of Point shape
	function Point (canvasX, canvasY, colorMode, annotationMode, context2d) {	
		Shape.call(this, canvasX, canvasY, colorMode, annotationMode, context2d);	// call parent constructor
		this.radius = 2;				// a default small radius for all points
	}	// end of Point constructor
	Utilities.inheritPrototype(Point, Shape);	// inherit Shape's prototype
	// augment Point's prototype with own methods (added to Shape's already available ones) 
	Point.
		method('draw', function () {
			this.ctx.fillStyle = this.color;
			this.ctx.beginPath();
			this.ctx.arc(this.x, this.y, this.radius, 0, (2 * Math.PI), true);
			this.ctx.fill();
			this.annotate();
		}).
		method('getAnnotationInfo', function() {
			return this.getType() + " {x:"+ this.x + ", y:"+ this.y +", color:" + this.color + "}";
		})
	;	// end of Point's method definition

	// Definition of Circle shape
	function Circle (canvasX, canvasY, colorMode, annotationMode, context2d) {
		Shape.call(this, canvasX, canvasY, colorMode, annotationMode, context2d);	// call parent constructor
		this.radius = Utilities.getRandomInt(4, 20); 	// a random radius within a reasonable range
	} 	// end of Circle constructor
	Utilities.inheritPrototype(Circle, Shape);	// inherit Shape's prototype
	// Similarly to Point, augment Circle prototype with own methods
	Circle.
		method('draw', function () {
			this.ctx.fillStyle = this.color;
			this.ctx.beginPath();
			this.ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
			this.ctx.fill();
			this.annotate();
		}).
		method('getAnnotationInfo', function() {
			return this.getType() + " {x:" + this.x + ", y:" + this.y + ", radius:" + this.radius + ", color:" + this.color + "}";
		});		// end of Circle's definition

	// Definition of Square
	function Square (canvasX, canvasY, colorMode, annotationMode, context2d) {
		Shape.call(this, canvasX, canvasY, colorMode, annotationMode, context2d);	// call parent constructor
		this.side = Utilities.getRandomInt(4, 20);		// a random length for the square's side within a reasonable range
	}	// end of Square constructor
	Utilities.inheritPrototype(Square, Shape);	// inherit Shape's prototype
	Square.
		method('draw', function () {
			this.ctx.save();
			this.ctx.fillStyle = this.color;
			this.ctx.translate(this.x,this.y);
			this.ctx.rotate(this.rotationAngle);		
			this.ctx.fillRect(-this.side / 2, -this.side / 2, this.side, this.side);
			this.ctx.restore();
			this.annotate();
		}).
		method('getAnnotationInfo', function () {
			return this.getType() + " {x:"+ this.x + ", y:"+ this.y + ", side:" + this.side + ", color:" + this.color + "}";
		});		// end of Square definition

	// Definition of an equilateral Triangle
	function Triangle (canvasX, canvasY, colorMode, annotationMode, context2d) {
		Shape.call(this, canvasX, canvasY, colorMode, annotationMode, context2d);
		this.side = Utilities.getRandomInt(4, 20);		// a random length for the triangle's side within a reasonable range
	}	// end of Triangle constructor
	Utilities.inheritPrototype(Triangle, Shape);	// inherit Shape's prototype
	Triangle.
		method('draw', function () {
			if (this.ctx === null) {
				return;
			}
			var u = Math.round(Math.sqrt(3) / 2 * this.side),	// height of the triangle calculated from Pythagorean theorem		
				halfSide = Math.round(this.side / 2);	// the half of the triangle's side	
			this.ctx.save();
			this.ctx.fillStyle = this.color;
			this.ctx.beginPath();
			this.ctx.translate(this.x, this.y);
			this.ctx.rotate(this.rotationAngle);
			this.ctx.lineTo( halfSide, u);
			this.ctx.lineTo(-halfSide, u);
			this.ctx.lineTo(0, 0);
			this.ctx.fill();
			this.ctx.restore();
			this.annotate();
		}).
		method('getAnnotationInfo', function () {
			return this.getType() + " {x:" + this.x + ", y:" + this.y + ", side:" + this.side + ", color:" + this.color + "}";
		});		// end of Triangle definition

	
	// Exposed Shapes Namespace
	app.ShapesNS = {
		ShapeFactory: {
			Square: Square,
			Triangle: Triangle,
			Point: Point,
			Circle: Circle,
			/** @param shapeData must be object of type {type: <shapeType>, x: <canvasX>, y: <canvasY>, colorMode: <true|false>, annotMode: <true|false>, ctx: <CanvasRenderingContext2D>} */
			build: function (shapeData) {
				if (!(shapeData && typeof(shapeData)==='object')) {
					throw new TypeError('Null or undefined or non-object shapeData argument.');
				}
				else if (!this.shapeDataKeys.every(function (val){
					return shapeData.hasOwnProperty(val);
				})) {
					console.warn("shapeData must be object of type {type: <shapeType>, x: <canvasX>, y: <canvasY>, colorMode: <true|false>, annotationMode: <true|false>, ctx: <CanvasRenderingContext2D>}");
					throw new TypeError("Malformed shapeData arg. Check its property names.");
				}
				var newShape = new this[shapeData.type](shapeData.x, shapeData.y, shapeData.colorMode, shapeData.annotMode, shapeData.ctx);
				return newShape;
			},
			shapeDataKeys: ['type', 'x', 'y', 'colorMode', 'annotMode']
		},
		/** @param modesData object of form {color: <true|false>, annot: <true|false>} */
		refreshShapes: function (modesData) {
			// if a universal mode (via custom events `colorsToggled` or `annotationsToggled`) is set then
			// set the new mode on every single shape within shapes and then draw
			if (modesData && typeof(modesData) !== 'object') {
				throw new TypeError('modesData must be a non-null object');
			}
			else if (!('annot' in modesData && 'color' in modesData)) {
				console.log(modesData);
				throw new TypeError('malformed modesData object. Expected {annot: <t|f>, color: <t|f>}');
			}
			if (modesData) {
				shapes.forEach( function (shape) {
					shape.setAnnotationMode(modesData.annot);
					shape.setColorMode(modesData.color);
					shape.setColor(shape.colorMode ? shape.color : 'black');
					shape.draw();
				});
			}
			// else only call draw on each shape
			else {	
				shapes.forEach( function (shape) {
					shape.draw();
				});
			}
		},
		getShapeInfoAt: function (index) {
			var shape = shapes[index];
			return {
				counter  : index + 1,
				type	 : shape.getType(),
				x		 : shape.x,
				y		 : shape.y,
				color	 : shape.color,
				annotMode: shape.annotationMode,
				annotInfo: shape.getMeasurementInfo()
			};
		},
		clearShapes: 	function () {shapes.length = 0;},
		pushShape: 		function (shape) {shapes.push(shape);},
		getTotalShapes: function () {return shapes.length;},
		getAvailableShapeTypes: function () {return availableShapeTypes;}	// returns the available shape types
	};

}(app.util));