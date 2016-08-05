var SerialPort = require('serialport');
var sleep = require("sleep");

var serialComm = (function() {

	var port = new SerialPort("/dev/ttyACM0", {
		baudRate: 9600
	});

	var portOpen = false;

	port.on("open", function() {
		console.log("Port is open:", port.path);
		sleep.sleep(3);
		console.log("Port ready");
		portOpen = true;
	});

	var listSerialPorts = function() {
		SerialPort.list(function(err, ports) {
			ports.forEach(function(port) {
				console.log(port.comName);
			});
		});
	};

	var showScrollingMessage = function(messageColor, borderColor, message) {
		writeToPort("1" + messageColor + borderColor + message);
	};

	var showMatrixAnimation = function() {
		writeToPort("0");
	};

	var writeToPort = function(message) {
		console.log("Writing message to port:", message);
		if (!portOpen) {
			console.error("Port is not open, message not written");
			return;
		}
		port.write(message, function(err) {
			if (err) {
				return console.error("Failed to write", err);
			}
			console.log("Message written");
		});
	};

	return {
		listSerialPorts: listSerialPorts,
		showScrollingMessage: showScrollingMessage,
		showMatrixAnimation: showMatrixAnimation
	};

});

module.exports = serialComm;
