var expect = require("expect.js");
var messageQueue = require("../modules/messageQueue.js");

describe("messageQueue", function() {
	var queue; 

	beforeEach(function() {
		queue = messageQueue();
	});
	
	describe("increaseIndex", function() {
		it("Calls callback", function(done) {
			result = queue.addMessage("000", "000", "test");
			var callback = function() {
				done();
			};
			queue.increaseIndex(callback);
		});
	});

	describe("restartLoop", function() {
		it("Calls idle callback when queue is empty", function(done) {
			var callback = function() {
				done();
			};
			queue.restartLoop(function() {}, callback, 999999);
		});

		it("Calls message callback when queue is not empty", function(done) {
			queue.addMessage("000", "000", "test");
			var callback = function() {
				done();
			};
			queue.restartLoop(callback, function() {},  999999);
		});
	});

	describe("addMessage", function() {
		it("Returns an id after adding message", function() {
			var result = queue.addMessage("000", "000", "test");
			expect(result).to.be.ok();
		});

		it("Adds the correct message to the queue", function() {
			queue.addMessage("000", "111", "spongebob");
			var messages = queue.getQueue();
			expect(messages.length).to.eql(1);
			expect(messages[0].message).to.eql("spongebob");
			expect(messages[0].messageColor).to.eql("000");
			expect(messages[0].borderColor).to.eql("111");
		});

		it("Returns null if message already exists", function() {
			var result0 = queue.addMessage("000", "111", "spongebob");
			expect(result0).to.be.ok();
			var result1 = queue.addMessage("222", "333", "spongebob");
			expect(result1).to.eql(null);
		});
	});

	describe("removeMessage", function() {
		it("Returns false if message does not exist", function() {
			var result = queue.removeMessage("123", function() {});
			expect(result).to.eql(false);
		});

		it("Returns true if message exists", function() {
			var id = queue.addMessage("000", "111", "fiddlesticks");
			var result = queue.removeMessage(id, function() {});
			expect(result).to.eql(true);
		});

		it("Calls idle callback if removing last message", function(done) {
			var id = queue.addMessage("000", "111", "fiddlesticks");
			var callback = function() {
				done();
			};
			var result = queue.removeMessage(id, callback);
		});
	});

	describe("clear", function() {
		it("Empties the queue", function() {
			queue.addMessage("000", "111", "garble");
			queue.addMessage("000", "111", "warbl");
			queue.addMessage("000", "111", "harbls");
			queue.clear();
			var messages = queue.getQueue();
			expect(messages.length).to.eql(0);
		});
	})
});