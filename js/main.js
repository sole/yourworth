(function() {
	
	var reposCount = document.querySelector('#numberOfRepositories span');
	var forkedReposCount = document.querySelector('#numberOfForkedRepositories span');
	var favouritesCount = document.querySelector('#numberOfFavourites span');
	var worthCount = document.querySelector('#totalWorth span');
	var form = document.querySelector('form');
	var usernameInput = document.getElementById('username');

	form.addEventListener('submit', onFormSubmit, false);

	requestAnimationFrame(animate);

	function onFormSubmit(e) {
		e.preventDefault();

		var username = usernameInput.value;
		
		if(username !== '') {
			loadUserInfo(username, onInfoLoaded);
		}
	}

	function onInfoLoaded(error, data) {

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
		var easing = TWEEN.Easing.Exponential.InOut;
		var animLength = 3000;

		var startValues = {
			repos: 0,
			forks: 0,
			//favourites: 0,
			//totalWorth: 0
		};

		var endValues = {
			repos: repos,
			forks: forks,
			//favourites: favourites,
			//totalWorth: totalWorth
		};

		var tween = new TWEEN.Tween(startValues)
			.to(endValues, animLength)
			.easing(easing)
			.onUpdate(function() {
				reposCount.innerHTML = r(this.repos);
				forkedReposCount.innerHTML = r(this.forks);
				//favouritesCount.innerHTML = r(this.favourites);
				//worthCount.innerHTML = r(this.totalWorth);
			})
			.start()
			.chain(new TWEEN.Tween({ favourites: 0 })
				.to({ favourites: favourites }, animLength * 0.5)
				.easing(easing)
				.onUpdate(function() {
					favouritesCount.innerHTML = r(this.favourites);
				})
				.chain(new TWEEN.Tween({ totalWorth: 0 })
					.to({ totalWorth: totalWorth }, animLength * 0.5)
					.easing(easing)
					.onUpdate(function() {
						worthCount.innerHTML = r(this.totalWorth);
					})
				)
			);

	}


	// cryptic function names for the win
	function r(v) {
		return Math.round(v);
	}


	function loadUserInfo(userName, onInfoLoaded) {
		var apiURL = 'https://api.github.com/users/' + userName + '/repos';
		var repositories = [];

		makeRequest(apiURL, function onRequest(err, data) {
			if(err) {
				onInfoLoaded(err, repositories);
			} else {
				repositories = repositories.concat(data.repositories);
				if(data.nextURL != data.currentURL) {
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

			var links = parseLinks(headers.Link);
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
		});

		return links;
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


	function animate(time) {
		requestAnimationFrame(animate);
		TWEEN.update(time);
	}

}).call(this);
