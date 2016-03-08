var express = require("express");
var app = express();
var exec = require("child_process").exec;

var port = 8080;

var router = express.Router();

router.post("/scrolling", function(req, res) {
	console.log("POST /scrolling");

	function buildScrollingMessageParams(messageColor, borderColor, message) {
		return "python ../pi-master/scrolling_message.py " + 
			messageColor + " " + borderColor + " " + message;
	}

	var messageColor = req.param("messageColor");
	var borderColor = req.param("borderColor");
	var message = req.param("message");

	exec(
		buildScrollingMessageParams(messageColor, borderColor, message),
		function(error, stdout, stderr) {
			if (stdout) {
				console.log("stdout:", stdout);
			}
			if (stderr) {
				console.log("stderr:", stderr);
			}
			if (error) {
				console.error("exec error:", error);
				res.sendStatus(500);
			}
			res.send(200);
		});

});

app.use("/matrix", router);

app.listen(port);
console.log("Server started on port", port);
