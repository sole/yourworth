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
			//requestUserInfo(username, onInfoLoaded);
			loadUserInfo(username, onInfoLoaded);
		}
	}

	function onInfoLoaded(error, data) {

		console.log('onInfoLoaded');

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

	// First request
	// gets some repositories + link to next
	// add repos to list
	// how do we know we need to load more data?
	// if next page == this page
	// then resolve
	// else load next
	// nextURL
	

	function loadUserInfo(userName, onInfoLoaded) {
		var apiURL = 'https://api.github.com/users/' + userName + '/repos';
		var repositories = [];

		makeRequest(apiURL, function onRequest(err, data) {
			if(err) {
				onInfoLoaded(err, repositories);
			} else {
				// repos and headers
				// repositories.concat(repos);
				repositories = repositories.concat(data.repositories);
				console.log('have', repositories.length, 'repos');
				if(data.nextURL != data.currentURL) {
					// if next != current
					// makeRequest(nextURL, onRequest);
					console.log('should make another request', data.nextURL);
					makeRequest(data.nextURL, onRequest);
				} else {
					onInfoLoaded(false, repositories);
				}
			}
		});
	}


	function makeRequest(apiURL, doneCallback) {

		var request = new XMLHttpRequest();

		request.open('get', apiURL, true);
		request.responseType = 'json';

		request.onerror = function(e) {
			doneCallback('Sad times, cannot get the info');
		};

		request.onload = function() {
			var headers = parseHeaders(request.getAllResponseHeaders());
			var nextURL = apiURL;

			console.log(headers);

			var links = parseLinks(headers.Link);
			console.log(links);
			if(links.next) {
				nextURL = links.next;
			}

			doneCallback(false, {
				repositories: request.response,
				nextURL: nextURL,
				currentURL: apiURL
			});
		};

		request.send();

	}


	function parseLinks(data) {
		var links = {};

		var parts = data.split(', ');
		var re = /<(.+?)>; rel="(\w+?)"/;
		
		parts.forEach(function(p) {
			var matches = re.exec(p);
			if(matches.length) {
				links[matches[2]] = matches[1];
			}
			// console.log(matches);
		});

		return links;
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
			var headers = parseHeaders(request.getAllResponseHeaders());
			console.log(headers);
			doneCallback(false, request.response);
		};

		request.send();
	}

	function parseHeaders(data) {
		var lines = data.split('\n');
		var headers = {};
		lines.forEach(function(line) {
			line = line.trim();
			if(line.length > 0) {
				var pairs = line.split(': ');
				headers[pairs[0]] = pairs[1];
			}
		});
		return headers;
	}

}).call(this);
