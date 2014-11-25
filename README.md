DrawPanel
=========
DrawPanel is a demo of an interactive HTML5 canvas where the user can draw predefined shapes by clicking on it. 
There is also a polished HTML table functioning as a live registry of the drawn shapes on the lower part of the page which 
is updated constantly with every new shape that is rendered on the canvas. 
The binding is performed via JavaScript using custom events.

The app has been tested in Firefox 33, Chrome with no known issues. IE does not support custom events and the project must be 
updated to accommodate this requirement.

Also extended controls for the canvas are going to be implemented. For the time being the shapes' properties are randomized 
on each click, but with the aid of the new controls they will be customizable.
