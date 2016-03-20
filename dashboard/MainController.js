app.controller("MainController", ["$scope", function($scope) {
	$scope.title = "LED Matrix Dashboard";
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
		},
	];
}]);
