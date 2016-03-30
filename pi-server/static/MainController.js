app.controller("MainController", function($scope, $http) {

	var addRecurringMessagePath = "/addRecurringMessage";
	var removeRecurringMessagePath = "/removeRecurringMessage";
	var showTemporaryMessagePath = "/showTemporaryMessage"
	var getMessagesPath = "/recurringMessages";
	var clearMessagesPath = "/clear";

	$scope.recurringMessages = [
		{
			id: "abc123",
			message: "The servers are burning",
			messageColor: "777",
			borderColor: "700"
		},
		{
			id: "def456",
			message: "Who's up for lunch?",
			messageColor: "007",
			borderColor: "777"
		},
		{
			id: "ghi789",
			message: "Help, stuck in bathroom",
			messageColor: "707",
			borderColor: "070"
		}
	];

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
				messageColor: "777",
				borderColor: "007"
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
				messageColor: "777",
				borderColor: "007"
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
		}, function error(response) {
			console.error("Error removing message", response);
		});
	};

	$scope.clearMessages = function() {
		console.log("Clearing all messages");
		post(clearMessagesPath, null, function success(response) {
			console.log("Cleared messages", response);
		}, function error(response) {
			console.error("Failed to clear messages", clear);
		});
	};

	$scope.refreshMessages();

});
