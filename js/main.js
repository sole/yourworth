(function() {

	var reposCount = document.querySelector('#numberOfRepositories span');
	var forkedReposCount = document.querySelector('#numberOfForkedRepositories span');
	var favouritesCount = document.querySelector('#numberOfFavourites span');
	var worthCount = document.querySelector('#totalWorth span');
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
			var info = extractInfo(data);
			displayResults(info);
		}

	}

	function extractInfo(reposData) {
		var numberOfRepos = 0;
		var numberOfForkedRepos = 0;
		var numberOfFavourites = 0;

		reposData.forEach(function(repo) {
			console.log(repo.name, repo.fork, repo.stargazers_count);
			if(repo.fork) {
				numberOfForkedRepos++;
			} else {
				numberOfRepos++;
			}

			numberOfFavourites += repo.stargazers_count;

		});

		return ({
			numberOfRepos: numberOfRepos,
			numberOfForkedRepos: numberOfForkedRepos,
			numberOfFavourites: numberOfFavourites
		});
	}

	function displayResults(info) {
		var repos = info.numberOfRepos;
		var forks = info.numberOfForkedRepos;
		var favourites = info.numberOfFavourites;
		var totalWorth = magicFormula(repos, forks, favourites);

		reposCount.innerHTML = repos;
		forkedReposCount.innerHTML = forks;
		favouritesCount.innerHTML = favourites;
		worthCount.innerHTML = totalWorth;

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
