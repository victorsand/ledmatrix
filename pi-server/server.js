var express = require("express");
var app = express();

console.log("123");

var port = 8080;

var router = express.Router();

router.get("/", function(req, res) {
	console.log("GET /");
	res.json({message: "Hello from the Pi"});
});

app.use("/matrix", router);

app.listen(port);
console.log("Server started on port", port);
