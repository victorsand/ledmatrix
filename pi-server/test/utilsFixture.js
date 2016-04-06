var expect = require("expect.js");
var utils = require("../modules/utils.js");

describe("cleanMessage", function() {

	it("Returns empty string on empty input", function() {
		var result = utils.cleanMessage("");
		expect(result).to.eql("");
	});

	it("Replaces single quotes with backticks", function() {
		var result = utils.cleanMessage("'abc'123'");
		expect(result).to.eql("`abc`123`");
	});

	it("Replaces Swedish characters with aao", function() {
		var result = utils.cleanMessage("abcåäö");
		expect(result).to.eql("abcaao");
	});

	it("Limits input length", function() {
		// TODO
	});

});