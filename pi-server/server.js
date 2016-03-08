var express = require("express");
var app = express();
var exec = require("child_process").exec;

var port = 8080;

var router = express.Router();

router.get("/", function(req, res) {
	console.log("GET /");
	res.json({message: "Hello from the Pi"});
});

router.post("/scrolling", function(req, res) {
	console.log("POST /scrolling");
	exec("python ~/code/ledmatrix/pi-master/scrolling_message.py 510 005 Wazzaa", 
			function(error, stdout, stderr) {
				console.log("stdout:", stdout);
				console.log("stderr:", stderr);
				if (error !== null) {
					console.error("exec error:", error);
				}
	});
});

app.use("/matrix", router);

app.listen(port);
console.log("Server started on port", port);
