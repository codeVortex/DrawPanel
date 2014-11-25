/**
 * @author Athanasios Kontis
 * Basic Utilities and Helpers namespace
 */

(function (app) {
	"use strict";
	
	app.util = {};	// augment the drawPanelApp with util NS
	
	/** 
	 * Augment Object's prototype by adding a function that returns the type of any object is 
	 * called from (caveat: inherited types with shared constructors have issues)
	 * ( Snippet from a StackOverflow discussion on the subject
	 * @see: http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript )
	 */
	Object.prototype.getType = function() {
		var funcNameRegex = /function (.{1,})\(/;
		var results = (funcNameRegex).exec((this).constructor.toString());
		return (results && results.length > 1) ? results[1] : "";
	};

	/**
	 * Augment Function with a method function which facilitates the attachment of 
	 * instance methods to a JS class - aka function object serving as a constructor
	 * (from Douglas Crockford's website http://www.crockford.com/javascript/inheritance.html)
	 * @param methodName string Carries the method's name
	 * @param methodDeclaration Function the function object which will be attached to the manipulated constructor function
	 * @return function The manipulated function object (`class`) so it can be chained upon other function calls 
	 */
	Function.prototype.method = function (methodName, methodDeclaration) {
		this.prototype[methodName] = methodDeclaration;
		return this;
	};

	/** 
	* Implements the parasitic combination inheritance as presented by N.Zackas in "Professional JavaScript for Web Developers" (p.214)
	* Enable subtypes to inherit the prototype of a supertype, while preserving the reference to their own prototype.
	* Note: must be executed after the declaration of both subType and superType!
	*/
	app.util.inheritPrototype = function (subType, superType) {
		var inheritablePrototype = null;
		if (!(typeof subType === 'function' && typeof superType === 'function')) {
			throw new TypeError("both subType and superType must be constructor function instances");
		}
		// create a clone of superType's prototype function and assign it to inheritablePrototype
		inheritablePrototype = Object.create(superType.prototype);
		// adjust the newly created function object by reassigning its constructor reference to subType
		inheritablePrototype.constructor = subType;
		// assign inheritablePrototype to subType's prototype
		subType.prototype = inheritablePrototype;
	};

	/** retrieves a random integer number within the specified range (min AND max inclusive) */
	app.util.getRandomInt = function (min, max) {
		return Math.floor( Math.random() * (max-min+1) + min);
	};

	/** 
	 * Checks if given arg is a number. Explicitly check for NaN and exclude from results,
	 * since the following expression is (sadly) true: typeof NaN === 'number'	// true
	 */
	app.util.isNumber = function (n) {
		return (typeof n === "number" && !Number.isNaN(n));
	};

}(app));