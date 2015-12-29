Apagado.GitHubApi = (function() {
	var api = {};

  	var gitHubLinkHeaderParser = function(linkString) {
	    return linkString.split(',').map(function(rel) {
	      return rel.split(';').map(function(curr, idx) {
	        if (idx === 0) return /page=(\d+)/.exec(curr)[1];
	        if (idx === 1) return /rel="(.+)"/.exec(curr)[1];
	      })
	    }).reduce(function(obj, curr, i) {
	      obj[curr[1]] = curr[0];
	      return obj;
	    }, {});
	};

	// TODO: use the link header's own url's with better parsing and looping methodology
	var getExtraPagesData = function(linkHeader, urlToGet, argumentToCallback, callback) {
			var parsedLink = gitHubLinkHeaderParser(linkHeader);

			for(var i = 2; i < parsedLink.last; i++) { 
				HTTP.get(urlToGet, { params: { page: i } }, function(error, response) { 
					callback(response.data, argumentToCallback);
				});
			}
	}

	var getRepositoryDataByType = function(repositoryFullName, callback, type) {
		check(repositoryFullName, String);
		check(callback, Function);

		var urlToGet = 'https://api.github.com/repos/'+ repositoryFullName +'/'+ type;
		HTTP.get(urlToGet, {}, function(error, response) {
			if(error) {
				return;
			}

			var linkHeader = response.headers.link;

			// There are more than one pages of data
			if (linkHeader) {
				getExtraPagesData(linkHeader, urlToGet, repositoryFullName, callback);
			}

			callback(response.data, repositoryFullName);
		});
	};

	api.getRepositories = function(git_username, callback) {
		check(git_username, String);
		check(callback, Function);

		var urlToGet = 'https://api.github.com/users/'+ git_username +'/repos';
		HTTP.get(urlToGet, { params: { per_page : 100 }}, function(error, response) {
			if(error) {
				return;
			}

			var linkHeader = response.headers.link;
			
			// There are more than one pages of data
			if (linkHeader) {
				getExtraPagesData(linkHeader, urlToGet, git_username, callback);
			}

			callback(response.data, git_username);
		});
	};

	api.getWatchers = function(repositoryFullName, callback) {
		getRepositoryDataByType(repositoryFullName, callback, 'watchers');
	}

	api.getForks = function(repositoryFullName, callback) {
		getRepositoryDataByType(repositoryFullName, callback, 'forks');
	}

	api.getStargazers = function(repositoryFullName, callback) {
		getRepositoryDataByType(repositoryFullName, callback, 'stargazers');
	}

	api.getContributors = function(repositoryFullName, callback) {
		getRepositoryDataByType(repositoryFullName, callback, 'contributors');
	}

	return api;
}());