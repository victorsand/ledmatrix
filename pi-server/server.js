var express = require("express");
var app = express();
var exec = require("child_process").exec;
var bodyParser = require("body-parser");

var port = 8080;

var router = express.Router();

router.post("/scrolling", function(req, res) {
	console.log("POST /scrolling");

	var ip = req.headers['x-forwarded-for'] || 
				req.connection.remoteAddress || 
				req.socket.remoteAddress ||
				req.connection.socket.remoteAddress;
	console.log("Request from ip:", ip);

	function buildScrollingMessageParams(messageColor, borderColor, message) {
		return "python ../pi-master/scrolling_message.py " + 
			messageColor + " " + borderColor + " '" + message + "'";
	}

	var messageColor = req.param("messageColor") || req.body.messageColor;
	var borderColor = req.param("borderColor") || req.body.borderColor;
	var message = req.param("message") || req.body.message;

	message = message.replace(/'|"/g, "");

	if (!messageColor || !borderColor || !message) {
		console.error("Param(s) missing");
		res.status(500).send("Missing one or more paramers");
		return;
	}

	var messageParams = buildScrollingMessageParams(messageColor, borderColor, message);
	console.log("Message params:", messageParams);

	exec(messageParams, function(error, stdout, stderr) {
		if (stdout) {
			console.log("stdout:", stdout);
		}
		if (stderr) {
			console.log("stderr:", stderr);
		}
		if (error) {
			console.error("exec error:", error);
			res.status(500).send(stdout + " " + stderr);
		}
		res.status(200).send("Thank you for your order");
	});

});

app.use(bodyParser.urlencoded({extended: false}));
app.use("/matrix", router);

app.listen(port);
console.log("Server started on port", port);
