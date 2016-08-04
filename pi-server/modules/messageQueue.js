var uuid = require("node-uuid");

var messageQueue = (function() { 

	var queue = [];
	var index = 0;
	var interval;

	var findMessage = function(message) {
		for (var i=0; i<queue.length; i++) {
			if (queue[i].message === message) {
				return i;
			}
		}
		return null;
	};

	var findMessageById = function(id) {
		for (var i=0; i<queue.length; i++) {
			if (queue[i].id === id) {
				return i;
			}
		}
		return null;
	};

	var addMessage = function(messageColor, borderColor, message) {
		console.log("Adding recurring message", message);
		if (findMessage(message) !== null) {
			console.log("Message already exists");
			return null;
		}
		var id = uuid.v4();
		queue.push({
			messageColor: messageColor,
			borderColor: borderColor,
			message: message,
			id: id
		});
		console.log("Created message with id", id);
		return id;
	};

	var removeMessage = function(id, idleCallback) {
		console.log("Removing message", id);
		var index = findMessageById(id);
		if (index === null) {
			console.log("Message does not exist");
			return false;
		}
		queue.splice(index, 1);
		console.log("Removed message");
		if (queue.length < 1) {
			console.log("Removed last message");
			idleCallback();
		}
		return true;
	};

	var restartLoop = function(showMessageCallback, idleCallback, loopInterval) {
		clearInterval(interval);
		index = 0;
		interval = setInterval(function() {
			increaseIndex(showMessageCallback);
		}, loopInterval);
		increaseIndex(showMessageCallback);
		if (queue.length < 1) {
			idleCallback();
		}
	};

	var stopLoop = function() {
		clearInterval(interval);
	};

	var increaseIndex = function(showMessageCallback) {
		console.log("increaseIndex");
		console.log("queue.length", queue.length);
		console.log("index", index);
		if (queue.length < 1) {
			return;
		}
		if (index > queue.length-1) {
			console.log("Oops, someting went wrong with the index");
			return;
		}
		showMessageCallback(queue[index].messageColor,
							queue[index].borderColor,
							queue[index].message);
		index = (index < queue.length-1) ? index + 1 : 0;
		console.log("new index", index);
	}

	var getQueue = function() {
		return queue;
	};

	var clear = function() {
		queue = [];
	};

	return {
		addMessage: addMessage,
		removeMessage: removeMessage,
		getQueue: getQueue,
		increaseIndex: increaseIndex,
		restartLoop: restartLoop,
		stopLoop: stopLoop,
		clear: clear
	};

});

module.exports = messageQueue;
