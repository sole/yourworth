(function() {

	var form = document.querySelector('form');
	var usernameInput = document.getElementById('username');
	form.addEventListener('submit', onFormSubmit, false);

	function onFormSubmit(e) {
		e.preventDefault();

		var username = usernameInput.value;
		
		if(username !== '') {
			requestUserInfo(username, onInfoLoaded);
		}
	}

	function onInfoLoaded(error, data) {
		console.log('got the info, or not');

		if(error) {
			console.error('nope', error);
		} else {
			console.log(data);
		}

	}

	function requestUserInfo(userName, doneCallback) {

		var apiURL = 'https://api.github.com/users/' + userName + '/repos';
		var request = new XMLHttpRequest();

		request.open('get', apiURL, true);
		request.responseType = 'json';

		request.onerror = function(e) {
			doneCallback('Sad times, cannot get the info');
		};

		request.onload = function() {
			doneCallback(false, request.response);
		};

		request.send();
	}

}).call(this);
