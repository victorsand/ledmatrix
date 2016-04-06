var express = require("express");
var app = express();
var exec = require("child_process").exec;
var bodyParser = require("body-parser");
var router = express.Router();
var port = 3452;

var RECURRING_INTERVAL = 60 * 1000;
var TEMPORARY_MESSAGE_DURATION = 60 * 1000;

var utils = require("./modules/utils.js");
var messageQueue = require("./modules/messageQueue.js")();

function buildMatrixAnimationParams() {
	return "python ../pi-master/scrolling_message.py -matrix";
}

function buildScrollingMessageParams(messageColor, borderColor, message) {
	return "python ../pi-master/scrolling_message.py -scroll " +
		messageColor + " " + borderColor + " '" + message + "'";
}

function execute(params) {
	try {
		exec(params, function(error, stdout, stderr) {
			if (stdout) {
				console.log("stdout:", stdout);
				return false;
			}
			if (stderr) {
				console.log("stderr:", stderr);
				return false;
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

function showScrollingMessage(messageColor, borderColor, message) {
	console.log("Showing scrolling message", message);
	var params = buildScrollingMessageParams(messageColor, borderColor, message);
	return execute(params);
}

function showMatrixAnimation() {
	console.log("Showing Matrix animation");
	var params = buildMatrixAnimationParams();
	return execute(params);
}

router.post("/addRecurringMessage", function(req, res) {
	console.log("POST /addRecurringMessage");
	console.log(utils.ipInfo(req));

	var messageColor = req.param("messageColor") || req.body.messageColor;
	var borderColor = req.param("borderColor") || req.body.borderColor;
	var message = req.param("message") || req.body.message;

	if (!messageColor || !borderColor || !message) {
		console.error("Param(s) missing");
		res.status(400).json({
			id: null,
			error: "Missing one or more paramers",
		});
		return;
	}

	message = utils.cleanMessage(message);

	var id = messageQueue.addMessage(messageColor, borderColor, message);

	if (messageQueue.getQueue().length == 1) {
		messageQueue.restartLoop(showScrollingMessage, showMatrixAnimation, RECURRING_INTERVAL);
	}

	if (!id) {
		res.status(400).json({
			id: null,
			error: "Message already exists",
		});
		return;
	}

	res.status(200).json({
		id: id,
		error: null,
		recurringMessages: messageQueue.getQueue()
	});
});

router.post("/removeRecurringMessage", function(req, res) {
	console.log("POST /removeRecurringMessage");
	console.log(ipInfo(req));

	var id = req.param("id") || req.body.id;

	if (!id) {
		console.error("Id missing");
		res.status(400).json({
			error: "Id missing"
		});
		return;
	}

	var removed = messageQueue.removeMessage(id);

	if (removed !== true) {
		res.status(400).json({
			error: "Failed to remove message"
		});
		return;
	}

	res.status(200).json({
		error: null,
		recurringMessages: messageQueue.getQueue()
	});
});

router.post("/showTemporaryMessage", function(req, res) {
	console.log("POST /showTemporaryMessage");
	console.log(utils.ipInfo(req));

	var messageColor = req.param("messageColor") || req.body.messageColor;
	var borderColor = req.param("borderColor") || req.body.borderColor;
	var message = req.param("message") || req.body.message;

	if (!messageColor || !borderColor || !message) {
		console.error("Param(s) missing");
		res.status(400).json({
			error: "Missing one or more parameters"
		});
		return;
	}

	message = utils.cleanMessage(message);

	messageQueue.stopLoop();

	var result = showScrollingMessage(messageColor, borderColor, message);

	if (result === true) {
		setTimeout(function() {
			restartLoop();
		}, TEMPORARY_MESSAGE_DURATION);
		res.status(200).send({
			error: null
		});
	} else {
		res.status(500).send({
			error: "Failed to show message :("
		});
	}
});

router.get("/recurringMessages", function(req, res) {
	console.log("GET /recurringMessages");
	console.log(utils.ipInfo(req));
	res.status(200).json({
		recurringMessages: messageQueue.getQueue(),
		error: null
	});
});

router.post("/clear", function(req, res) {
	console.log("POST /clear");
	console.log(utils.ipInfo(req));
	showMatrixAnimation();
	messageQueue.clear();
	messageQueue.restartLoop(showScrollingMessage, showMatrixAnimation, RECURRING_INTERVAL);
	res.status(200).json({
		error: null
	});
});

app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/", router);
app.use("/dashboard", express.static("static"));

app.listen(port);

showMatrixAnimation();

console.log("Server started on port", port);
