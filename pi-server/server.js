var express = require("express");
var app = express();
var exec = require("child_process").exec;
var bodyParser = require("body-parser");
var uuid = require("node-uuid");
var router = express.Router();
var port = 3452;

var RECURRING_INTERVAL = 30000;
var TEMPORARY_MESSAGE_DURATION = 30000;

function buildMatrixAnimationParams() {
	return "python ../pi-master/scrolling_message.py -matrix";
}

function buildScrollingMessageParams(messageColor, borderColor, message) {
	return "python ../pi-master/scrolling_message.py -scroll " +
		messageColor + " " + borderColor + " '" + message + "'";
}

function showScrollingMessage(messageColor, borderColor, message) {
	message = message.slice(0, Math.min(message.length, 512));
	var params = buildScrollingMessageParams(messageColor, borderColor, message);
	exec(params, function(error, stdout, stderr) {
		if (stdout) {
			console.log("stdout:", stdout);
		}
		if (stderr) {
			console.log("stderr:", stderr);
		}
		if (error) {
			console.error("exec error:", error);
		}
	});
}

function showMatrixAnimation() {
	var params = buildMatrixAnimationParams();
	exec(params, function(error, stdout, stderr) {
		if (stdout) {
			console.log("stdout:", stdout);
		}
		if (stderr) {
			console.log("stderr:", stderr);
		}
		if (error) {
			console.error("exec error:", error);
		}
	});
}


var recurringMessages = [];

var index = 0;
function loop() {
	console.log("looping, index", index);
	if (recurringMessages.length < 1) return;
	showScrollingMessage(recurringMessages[index].messageColor,
						 recurringMessages[index].borderColor,
						 recurringMessages[index].message);
	if (++index > recurringMessages.length-1) {
		console.log("resetting index");
		index = 0;
	}
	console.log("no reset, index", index);
}

var recurringLoop;
function restartLoop() {
	clearInterval(recurringLoop);
	recurringLoop = setInterval(loop, RECURRING_INTERVAL);
	loop();
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

	var id = addRecurringMessage(messageColor, borderColor, message);

	if (recurringMessages.length == 1) {
		restartLoop();
	}

	if (!id) {
		res.status(400).json({ 
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
		res.status(400).send("Missing one or more paramers");
		return;
	}

	clearInterval(recurringLoop);

	showScrollingMessage(messageColor, borderColor, message);

	setTimeout(function() {
		restartLoop();
	}, TEMPORARY_MESSAGE_DURATION);

	res.status(200).send();
	return;
});

router.get("/recurringMessages", function(req, res) {
	console.log("GET /recurringMessages");
	console.log(ipInfo(req));

	res.status(200).json({
		recurringMessages: recurringMessages
	});
	return;
});


app.use(bodyParser.urlencoded({extended: false}));

app.use("/", router);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(port);

console.log("Server started on port", port);

showMatrixAnimation();




