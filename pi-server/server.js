var express = require("express");
var app = express();
var exec = require("child_process").exec;
var bodyParser = require("body-parser");
var uuid = require("node-uuid");
var router = express.Router();
var port = 3452;

var RECURRING_INTERVAL = 60 * 1000;
var TEMPORARY_MESSAGE_DURATION = 60 * 1000;

function buildMatrixAnimationParams() {
	return "python ../pi-master/scrolling_message.py -matrix";
}

function buildScrollingMessageParams(messageColor, borderColor, message) {
	return "python ../pi-master/scrolling_message.py -scroll " +
		messageColor + " " + borderColor + " '" + message + "'";
}

function cleanMessage(message) {
	message = message.slice(0, Math.min(message.length, 512));
	// Get rid of Swedish characters in charcode format
	for (var i=0; i<message.length; i++) {
		if (message.charCodeAt(i) === 229 || message.charCodeAt(i) === 228) {
			message = message.substr(0, i) + "a" + message.substr(i + 1);
		} else if (message.charCodeAt(i) === 246) {
			message = message.substr(0, i) + "o" + message.substr(i + 1);
		}
	}
	// Get rid of Swedish characters in HTML format
	message = message.replace("&#229;", "a");
	message = message.replace("&#228;", "a");
	message = message.replace("&#246;", "o");
	return message;
}

function showScrollingMessage(messageColor, borderColor, message) {
	console.log("Showing scrolling message", message);
	var params = buildScrollingMessageParams(messageColor, borderColor, message);
	try {
		exec(params, function(error, stdout, stderr) {
			if (stdout) {
				console.log("stdout:", stdout);
			}
			if (stderr) {
				console.log("stderr:", stderr);
			}
			if (error) {
				console.error("exec error:", error);
				return false;
			}
		});
	} catch(e) {
		console.log("Failed to execute");
		console.log(e);
		return false;
	}
	return true;
}

function showMatrixAnimation() {
	console.log("Showing Matrix animation");
	var params = buildMatrixAnimationParams();
	try {
		exec(params, function(error, stdout, stderr) {
			if (stdout) {
				console.log("stdout:", stdout);
			}
			if (stderr) {
				console.log("stderr:", stderr);
			}
			if (error) {
				console.error("exec error:", error);
				return false;
			}
		});
	} catch(e) {
		console.log("Failed to execute");
		console.log(e);
		return false;
	}
	return true;
}

var recurringMessages = [];

var index = 0;

function loop() {
	if (recurringMessages.length < 1) return;
	if (index > recurringMessages.length-1) {
		console.log("ERROR - someting went wrong with the index");
		return;
	}
	showScrollingMessage(recurringMessages[index].messageColor,
						 recurringMessages[index].borderColor,
						 recurringMessages[index].message);
	index++;
	if (index > recurringMessages.length-1) {
		index = 0;
	}
}

var recurringLoop;
function restartLoop() {
	console.log("Restarting loop");
	clearInterval(recurringLoop);
	index = 0;
	recurringLoop = setInterval(loop, RECURRING_INTERVAL);
	loop();
	if (recurringMessages.length < 1) {
		showMatrixAnimation();
	}
}

function findRecurringMessageIndex(message) {
	for (var i=0; i<recurringMessages.length; i++) {
		if (recurringMessages[i].message === message) {
			return i;
		}
	}
	return null;
}

function findRecurringMessageIndexById(id) {
	for (var i=0; i<recurringMessages.length; i++) {
		if (recurringMessages[i].id === id) {
			return i;
		}
	}
	return null;
}

function addRecurringMessage(messageColor, borderColor, message) {
	console.log("Adding recurring message", message);
	if (findRecurringMessageIndex(message) !== null) {
		console.log("Message already exists");
		return null;
	}
	var id = uuid.v4();
	recurringMessages.push({
		messageColor: messageColor,
		borderColor: borderColor,
		message: message,
		id: id
	});
	console.log("Created message with id", id);
	return id;
}

function removeRecurringMessage(id) {
	console.log("Removing message", id);
	var index = findRecurringMessageIndexById(id);
	if (index === null) {
		console.log("Message does not exist");
		return;
	}
	recurringMessages.splice(index, 1);
	console.log("Removed message");
	if (recurringMessages.length < 1) {
		console.log("Removed last message");
		showMatrixAnimation();
	}
}

function ipInfo(req) {
	return req.headers['x-forwarded-for'] || 
		req.connection.remoteAddress || 
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
}

router.post("/addRecurringMessage", function(req, res) {
	console.log("POST /addRecurringMessage");
	console.log(ipInfo(req));

	var messageColor = req.param("messageColor") || req.body.messageColor;
	var borderColor = req.param("borderColor") || req.body.borderColor;
	var message = req.param("message") || req.body.message;

	if (!messageColor || !borderColor || !message) {
		console.error("Param(s) missing");
		res.status(400).send("Missing one or more paramers");
		return;
	}

	message = cleanMessage(message);

	var id = addRecurringMessage(messageColor, borderColor, message);

	if (recurringMessages.length == 1) {
		restartLoop();
	}

	if (!id) {
		res.status(200).json({ 
			id: null,
			error: "Message already exists", 
			recurringMessages: recurringMessages
		});
		return;
	}

	res.status(200).json({
		id: id,
		recurringMessages: recurringMessages,
		error: null
	});
});

router.post("/removeRecurringMessage", function(req, res) {
	console.log("POST /removeRecurringMessage");
	console.log(ipInfo(req));
	
	var id = req.param("id") || req.body.id;

	if (!id) {
		console.error("Id missing");
		res.status(400).send("Id missing");
		return;
	}

	removeRecurringMessage(id);

	res.status(200).json({
		recurringMessages: recurringMessages
	});
});

router.post("/showTemporaryMessage", function(req, res) {
	console.log("POST /showTemporaryMessage");
	console.log(ipInfo(req));

	var messageColor = req.param("messageColor") || req.body.messageColor;
	var borderColor = req.param("borderColor") || req.body.borderColor;
	var message = req.param("message") || req.body.message;

	if (!messageColor || !borderColor || !message) {
		console.error("Param(s) missing");
		res.status(400).send({ error: "Missing one or more parameters" });
		return;
	}

	message = cleanMessage(message);

	clearInterval(recurringLoop);

	var result = showScrollingMessage(messageColor, borderColor, message);

	if (result === true) {
		setTimeout(function() {
			restartLoop();
		}, TEMPORARY_MESSAGE_DURATION);

		res.status(200).send({ message: "Showing temporary message:" + message });
	} else {
		res.status(500).send({ error: "Failed to show message :("});
	}
});

router.get("/recurringMessages", function(req, res) {
	console.log("GET /recurringMessages");
	console.log(ipInfo(req));
	res.status(200).json({
		recurringMessages: recurringMessages
	});
});

router.post("/clear", function(req, res) {
	console.log("POST /clear");
	console.log(ipInfo(req));
	showMatrixAnimation();
	recurringMessages = [];
	restartLoop();
	res.status(205).send({ message: "Cleared recurring messages" });
});

app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/", router);

app.listen(port);

console.log("Server started on port", port);

showMatrixAnimation();

