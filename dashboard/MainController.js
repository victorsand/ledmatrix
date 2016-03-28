app.controller("MainController", function($scope, $http) {

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

	$scope.refreshMessages = function() {
		$http({
			method: "GET",
			url: "http://httpbin.org/get"
		}).then(function success(response) {
			console.log("response", response);
		}, function error(response) {
			console.error("error", response);
		});
	};

	$scope.addRecurringMessage = function(message) {
		$http({
			method: "POST",
			url: "http://httpbin.org/post",
			data: {
				message: message,
				messageColor: "777",
				borderColor: "007"
			}
		}).then(function success() {
			console.log("Added recurring message")
		}, function error(response) {
			console.error(reponse);
		});
	};

	$scope.addTemporaryMessage = function(message) {
		$http({
			method: "POST",
			url: "http://httpbin.org/post",
			data: {
				message: message,
				messageColor: "777",
				borderColor: "007"
			}
		}).then(function success() {
			console.log("Added temporary message")
		}, function error(response) {
			console.error(reponse);
		});
	};

	$scope.removeMessage = function(index) {
		var message = $scope.recurringMessages[index];
		console.log("Removing message", message.message);
		$http({
			method: "POST",
			url: "http://httpbin.org/post",
			data: {
				id: message.id,
			}
		}).then(function success() {
			console.log("Removed message");
		}, function error(response) {
			console.error(reponse);
		});
	};

	$scope.clearMessages = function() {
		console.log("Clearing all messages");
		$http({
			method: "POST",
			url: "http://httpbin.org/post",
		}).then(function success() {
			console.log("Cleared messages");
		}, function error(response) {
			console.error(reponse);
		});
	};

	$scope.refreshMessages();
	$scope.addMessage();
	$scope.removeMessage(0);

});
