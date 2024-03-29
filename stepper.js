/*
	@author: remy sharp
	@date: 2006-12-15
	@description: step increment object
	@version: $Id$
*/

var stepper = function(s, dp) {
	// sanity watchers
	if (s && typeof s == 'string') s = parseFloat(s)
	if (dp && typeof dp == 'string') dp = parseFloat(dp)
	
	if (arguments.length == 1) dp = -1

	this.s = s // step increment (aka pip)
	this.dp = dp // decimal places to keep

	this.running = true;

	this.validate()

	return this		
}

stepper.prototype = {	
	validate: function() {
		if (parseFloat(this.setDP(this.s)) == 0) {
			alert("The decimal places cannot be shorter than the PIP.\ndp = " + this.dp + ", pip = " + this.s)
		}
	},
	
	mul: function() { return Math.pow(10, this.dp == -1 ? 1 : this.dp) },
	
	upToInt: function(n) {
		return Math.round(n * this.mul()) // handle dp recursion
	},
	
	downToFloat: function(n) {
		return (n / this.mul())
	},
	
	setDP: function(n) {
		var r = n.toString()
		
		// -1 on dp means leave as is
		if (this.dp == -1) return r
		
		// handle whole numbers
		if (this.dpLen(r) == -1 && this.dp > 0) r += ".0"
		else if (this.dpLen(r) == -1 && this.dp == 0) return r
		
		// handle fractions
		if (this.dpLen(r) > this.dp) { // strip
			var i = r.indexOf('.')
			r = r.substring(0, i) + '.' + r.substring(i + 1, i + 1 + this.dp)
		} else { // add
			while (this.dpLen(r) < this.dp) r += "0"
		}
		return r
	},
	
	dpLen: function(n) {
		if (n.indexOf('.') == -1)
			return -1
		else
			return (n.length) - (n.indexOf('.') + 1)
	},

	step: function(n) {
		if (arguments.length) {
			if (arguments[0] && typeof arguments[0] == 'string') {
				this.n = parseFloat(arguments[0])
			} else if (arguments[0] == NaN) {
				this.n = 0
			} else {
				this.n = arguments[0]
			}
		} else {
			alert("stepper::step expects a float value")
			return
		}					
		
		var n = this.upToInt(this.n)
		var s = this.upToInt(this.s)
		var r = this.setDP(this.downToFloat(n - (n % s) + s))
				
		return r
	}
}