/**
 * @author Athanasios Kontis
 *
 * I use the `Namespace proxy` technique to properly encapsulate the entire application namespace, as illustrated at @url  http://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
 * In this fashion we assign `app` global object tp `this` keyword, everywhere within the top-level anonymous function expression that forms our context.
 */

(function (ShapesNS) {
	"use strict";
	// DOM Components
	var Components	= {
			canvas: null,
			registry: null,
			controls: {
				toggleColors: null,
				toggleAnnotations: null,
				clearCanvas: null,
				annotationModeCheckbox: null,
				colorModeCheckbox: null,
				shapeSelector: null,
				buttonStrip: null
			},
			init: function () {
				// retrieve necessary components on the document or build new ones from scratch
				Components.canvas = this.build('canvas', 'drawPanel');
				Components.controls.shapeSelector = this.build("select", "shapeSelector");
				Components.controls.colorModeCheckbox = this.build("input", "colorMode", "checkbox");
				Components.controls.annotationModeCheckbox = this.build('input', "annotationMode", "checkbox");
				Components.controls.toggleColors = this.build("button", "toggleColors");
				Components.controls.toggleAnnotations = this.build("button", "toggleAnnotations");
				Components.controls.clearCanvas = this.build("button", "resetCanvas");
				Components.controls.buttonStrip = this.build("ul", "buttonStrip");
				Components.registry = this.build("table", 'shapesRegistry');
				
				// add Event Listeners
				Components.canvas.addEventListener('click', handlers.click.canvas, false);
				Components.canvas.addEventListener('shapeCreated', handlers.shapeCreated, false);
				Components.controls.buttonStrip.addEventListener('click', handlers.click.buttonStrip, false);
				Components.controls.buttonStrip.addEventListener('shapesRemoved', handlers.shapesRemoved, false);
				Components.controls.buttonStrip.addEventListener('colorsToggled', handlers.colorsToggled, false);
				Components.controls.buttonStrip.addEventListener('annotationsToggled', handlers.annotationsToggled, false);

				// populate shape options in shapeSelector
				ShapesNS.getAvailableShapeTypes().forEach(function(shape) {
					var shapeOption = document.createElement('option');
					shapeOption.value = shape;
					shapeOption.textContent = shape;
					Components.controls.shapeSelector.appendChild(shapeOption);
				});
				
				// set default state on checkboxes
				Components.controls.colorModeCheckbox.checked = true;
				Components.controls.annotationModeCheckbox.checked = true;
			},
			build: function (tagName, id, type) {
				var el = document.getElementById(id),
					elType;
				if (el === null) {
					el = document.createElement(tagName);
					el.id = id;
					el.setAttribute('type', type);
				}
				else {
					if  (el.tagName.toLowerCase() !== tagName.toLowerCase()) {
						throw new Error('The element with id=' + id + ' already exists as a "' + el.tagName + '" instead of "' + tagName + '"');
					}
					if (type && typeof type === 'string') {
						elType = el.getAttribute('type');
						if (elType !== type) {
							throw new Error('The element with id=' + id + ' exists with an attribute of "' + elType + '" instead of "' + type + '"');
						}
					}
				}
				return el;
			}
		},

		// Event listeners
		handlers	= {
			click: {
				canvas: function (event) {
					var rect = Components.canvas.getBoundingClientRect(),	// retrieve a rectangle with the coordinates of canvas on the document		
				/* magic numbers 1 and 2 in the calculations below are offsets which calibrate the center of the crosshair cursor */
						canvasX = event.clientX - 2 - rect.left,
						canvasY = event.clientY - 1 - rect.top,
						newShape = ShapesNS.ShapeFactory.build ({
							type: Components.controls.shapeSelector.value,
							x: canvasX,
							y: canvasY,
							colorMode: Components.controls.colorModeCheckbox.checked,
							annotMode: Components.controls.annotationModeCheckbox.checked,
							ctx: Components.canvas.getContext('2d')
						}),
						newShapeEvent = new CustomEvent('shapeCreated', {detail: newShape});
					Components.canvas.dispatchEvent(newShapeEvent);
				},
				buttonStrip: function (event) {
					var target = event.srcElement || event.target,	// cross-browser hack to retrieve the target element
						customEvent;
					event.preventDefault();	// prevents the form from submitting itself

					switch (target.id) {
						case "resetCanvas":
							customEvent = new CustomEvent('shapesRemoved');
							break;
						case "toggleAnnotations":
							customEvent = new CustomEvent('annotationsToggled');
							break;
						case "toggleColors" :
							customEvent = new CustomEvent('colorsToggled');
							break;
					}
					Components.controls.buttonStrip.dispatchEvent(customEvent);
					return false;
				}
			},
			shapeCreated: function (event) {
				var newShape = event.detail;
				ShapesNS.pushShape(newShape);		// push the shape into the ShapeNS shapes array
				DrawPanel.drawSingleShape(newShape);// render the shape on the canvas
				Registry.insertRow(newShape);		// insert a new row with new Shape details into the Shape Registry table
			},
			shapesRemoved: function () {
				ShapesNS.clearShapes();				// clear private array of shapes on namespace ShapesNS
				DrawPanel.clear();					// redraw all shapes on canvas
				Registry.clear();					// remove all lines on registry table body
			},
			colorsToggled: function () {
				Components.controls.colorModeCheckbox.checked = !Components.controls.colorModeCheckbox.checked;
				DrawPanel.mode.color = !DrawPanel.mode.color;
				DrawPanel.clear();
				DrawPanel.refresh();
				Registry.refresh();					// update the registry table of shapes
			},
			annotationsToggled: function () {
				Components.controls.annotationModeCheckbox.checked = !Components.controls.annotationModeCheckbox.checked;
				DrawPanel.mode.annot = !DrawPanel.mode.annot;
				DrawPanel.clear();
				DrawPanel.refresh();
				Registry.refresh();					// update the registry table of shapes
			}
		},
		
		// Registry object encapsulates the shapes' registry HTML table and its functionality
		Registry = {
			columns: ["counter", "shapeType", "shapeX", "shapeY", "shapeColor", "shapeAnnotated", "shapeInfo"],
			insertRow: function (shape) {
				var newRow = Components.registry.tBodies[0].insertRow(),
					currentCell = null,
					counter		= ShapesNS.getTotalShapes(),
					type 		= shape.getType(),
					x			= shape.x,
					y			= shape.y,
					color		= shape.color,
					annotated	= shape.annotationMode,
					info		= shape.getMeasurementInfo();
				this.columns.forEach (function (column) {
					currentCell = document.createElement('td');
					switch(column) {
						case "counter":
							currentCell.textContent = counter;
							currentCell.setAttribute('data-counter', counter);
							break;
						case "shapeType":
							currentCell.textContent = type;
							currentCell.setAttribute('data-type', type);
							break;
						case "shapeX":
							currentCell.textContent = x;
							currentCell.setAttribute('data-x', x);
							break;
						case "shapeY":
							currentCell.textContent = y;
							currentCell.setAttribute('data-y', y);
							break;
						case "shapeColor":
							currentCell.textContent = color;
							currentCell.setAttribute('data-color', color);
							break;
						case "shapeAnnotated":
							currentCell.textContent = annotated;
							currentCell.setAttribute('data-annotated', annotated);
							break;
						case "shapeInfo":
							currentCell.textContent = info;
							currentCell.setAttribute('data-info', info);
							break;
					}
					this.appendChild(currentCell);
				}, newRow);
			},
			refresh: function () {
				var curRow = null,
					tbody 	 = Components.registry.tBodies[0],
					rowIndex  = 0,
					totalRows = tbody.children.length,
					shapeInfo = null;
				for ( ; rowIndex<totalRows; rowIndex++) {
					shapeInfo = ShapesNS.getShapeInfoAt(rowIndex);
					curRow = tbody.children[rowIndex];
					curRow.children[0].textContent = shapeInfo.counter;
					curRow.children[1].textContent = shapeInfo.type;
					curRow.children[2].textContent = shapeInfo.x;
					curRow.children[3].textContent = shapeInfo.y;
					curRow.children[4].textContent = shapeInfo.color;
					curRow.children[5].textContent = shapeInfo.annotMode;
					curRow.children[6].textContent = shapeInfo.annotInfo;
				}
			},
			clear: function () {
				var tbody = Components.registry.tBodies[0];
				while (tbody.hasChildNodes()) {
					tbody.removeChild(tbody.lastChild);
				}
			}
		},
	
	DrawPanel = {
		mode: {
			color: true,
			annot: true
		},
		drawSingleShape: function (shape) {
			shape.draw();
		},
		refresh: function () {
			ShapesNS.refreshShapes(this.mode);
		},
		clear: function () {
			// Clears the canvas with a call to clearRect() method, which is more preferable than a forceful change of the width property, performance-wise
			var canvas 	= Components.canvas,
				ctx 	= canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
		}
	};
	
	// Exposed API
	app.init = function () {
		Components.init();
	};
	
}(app.ShapesNS));