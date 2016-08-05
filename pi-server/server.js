// Victor Sand
// victor.sand@gmail.com
// Project info: victorsand.com/ledmatrix
// Code: github.com/victorsand/ledmatrix

var express = require("express");
var app = express();
var exec = require("child_process").exec;
var bodyParser = require("body-parser");
var router = express.Router();
var port = 3452;

var RECURRING_INTERVAL = 60 * 1000;
var TEMPORARY_MESSAGE_DURATION = 120 * 1000;

var utils = require("./modules/utils.js");
var messageQueue = require("./modules/messageQueue.js")();
var serialComm = require("./modules/serialComm.js")();

function showScrollingMessage(messageColor, borderColor, message) {
	console.log("Showing scrolling message:", message);
	serialComm.showScrollingMessage(messageColor, borderColor, message);
}

function showMatrixAnimation() {
	console.log("Showing Matrix animation");
	serialComm.showMatrixAnimation();
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
			error: "Missing one or more parameters",
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
	console.log(utils.ipInfo(req));

	var id = req.param("id") || req.body.id;

	if (!id) {
		console.error("Id missing");
		res.status(400).json({
			error: "Id missing"
		});
		return;
	}

	var removed = messageQueue.removeMessage(id, showMatrixAnimation);

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
		messageQueue.restartLoop(showScrollingMessage, showMatrixAnimation, RECURRING_INTERVAL);
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
app.use("/dashboard", express.static("/home/matrix/code/ledmatrix/pi-server/static"));

app.listen(port);

console.log("Server started on port", port);

// Wait for port to be ready (TODO make a callback instead)
setTimeout(function() {
	showScrollingMessage("555", "555", "Greetings");
	setTimeout(function() {
		showMatrixAnimation();
	}, 10000);
}, 5000);

