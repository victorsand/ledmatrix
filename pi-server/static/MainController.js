app.controller("MainController", function($scope, $http) {

	var addRecurringMessagePath = "/addRecurringMessage";
	var removeRecurringMessagePath = "/removeRecurringMessage";
	var showTemporaryMessagePath = "/showTemporaryMessage"
	var getMessagesPath = "/recurringMessages";
	var clearMessagesPath = "/clear";

	$scope.recurringMessages = [];

	$scope.colors = ['777', '710', '770', '070', '077', '007', '107', '707', '700'];
	$scope.messageColorIndex = 0;
	$scope.borderColorIndex = 5;

	function post(url, data, sucessCallback, errorCallback) {
		$http({
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			url: url,
			data: $.param(data)
		}).then(sucessCallback, errorCallback);
	};

	function get(url, successCallback, errorCallback) {
		$http({
			method: "GET",
			url: url
		}).then(successCallback, errorCallback);
	};

	$scope.selectBorderColor = function(index) {
		console.log("Selecting border color", $scope.colors[index]);
		$scope.borderColorIndex = index;
	};

	$scope.selectMessageColor = function(index) {
		console.log("Selecting message color", $scope.colors[index]);
		$scope.messageColorIndex = index;
	};

	$scope.refreshMessages = function() {
		get(getMessagesPath, function success(response) {
			console.log("Fetched messages", response);
			$scope.recurringMessages = response.data.recurringMessages;
			console.log("Refreshed messages");
		}, function error(response) {
			console.error("Failed to fetch messages", response);
		});
	};

	$scope.addRecurringMessage = function(message) {
		console.log("Adding recurring message:", message);
		post(addRecurringMessagePath, {
				message: message,
				messageColor: $scope.colors[$scope.messageColorIndex],
				borderColor: $scope.colors[$scope.borderColorIndex]
		}, function success(response) {
			console.log("Added recurring message", response);
			$scope.recurringMessages = response.data.recurringMessages;
			console.log("Refreshed messages");
		}, function error(response) {
			console.error("Failed to add recurring message", response);
		});
	};

	$scope.showTemporaryMessage = function(message) {
		console.log("Showing temporary message:", message);
		post(showTemporaryMessagePath, {
				message: message,
				messageColor: $scope.colors[$scope.messageColorIndex],
				borderColor: $scope.colors[$scope.borderColorIndex]
		}, function success(response) {
			console.log("Showing temporary message", response);
		}, function error(response) {
			console.error("Failed to add recurring message", response);
		});
	};

	$scope.removeMessage = function(index) {
		var message = $scope.recurringMessages[index];
		console.log("Removing message", message.message);
		post(removeRecurringMessagePath, { id: message.id }, function success(response) {
			console.log("Removed message successfully", response);
			$scope.recurringMessages = response.data.recurringMessages;
		}, function error(response) {
			console.error("Error removing message", response);
		});
	};

	$scope.clearMessages = function() {
		console.log("Clearing all messages");
		post(clearMessagesPath, {}, function success(response) {
			console.log("Cleared messages", response);
		}, function error(response) {
			console.error("Failed to clear messages", response);
		});
	};

	$scope.refreshMessages();
});
