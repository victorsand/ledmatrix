var cleanMessage = function(message) {
	message = message.slice(0, Math.min(message.length, 512));
	// Swedish characters are not supported in the graphics libraries
	message = message.replace(/å/g, "a");
	message = message.replace(/ä/g, "a");
	message = message.replace(/ö/g, "o");
	message = message.replace(/&#229;/g, "a");
	message = message.replace(/&#228;/g, "a");
	message = message.replace(/&#246;/g, "o");
	// Single quotes are used as input delimiters, so replace them
	message = message.replace(/'/g, "`");
	return message;
};

var ipInfo = function(req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
};

module.exports.cleanMessage = cleanMessage;
module.exports.ipInfo = ipInfo;
