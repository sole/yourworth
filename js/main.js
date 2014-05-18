function requestUserInfo(userName, doneCallback) {
	var apiURL = 'https://api.github.com/users/' + userName + '/repos';
	var request = new XMLHttpRequest();

	request.open('get', url, true);
    request.responseType = 'json';

	request.onerror = function(e) {
		doneCallback('Sad times, cannot get the info');
	};

	request.onload = function() {
		doneCallback(false, request.response);
	};
}
