(function () {

	function magicFormula(numberOfRepositories, numberOfForkedRepositories, numberOfFavourites) {
		return (numberOfRepositories + numberOfForkedRepositories) * numberOfFavourites;
	}

	if (typeof define === 'function' && define.amd) {
		define(function () {
			return magicFormula;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = magicFormula;
	} else {
		this.magicFormula = magicFormula;
	}

}.call(this));

