Apagado.GitHubApi = (function() {
	var api = {};

	const REPOSITORY_ERROR_MESSAGES = { 404: 'Repositories not found', 403: 'Service currently not availble' };
	const DEFAULT_ERROR = 'Unknown error occured';

	Session.set('repositoryError', '');
	Session.set('tabDataError', '');

	var setRepositoryCachingError = function(error) { 
		var errorMessage = REPOSITORY_ERROR_MESSAGES[error.response.statusCode];
		if(!errorMessage) {
			errorMessage = DEFAULT_ERROR;
		}

		Session.set('repositoryError', errorMessage);
	}

	var setTabDataError = function(error) { 
		var errorMessage = REPOSITORY_ERROR_MESSAGES[error.response.statusCode];
		if(!errorMessage) {
			errorMessage = DEFAULT_ERROR;
		}

		Session.set('tabDataError', errorMessage);
	}

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
					if(error) { 
						return;
					}

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
				setTabDataError(error);
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

	api.getUser = function(git_username, callback) { 
		check(git_username, String);
		check(callback, Function);

		var urlToGet = 'https://api.github.com/users/' + git_username;
			HTTP.get(urlToGet, {}, function(error, response) {
			if(error) {
				setRepositoryCachingError(error);
				return;
			}

			callback(response.data);
		});
	}

	api.getRepositories = function(git_username, callback) {
		check(git_username, String);
		check(callback, Function);

		var urlToGet = 'https://api.github.com/users/'+ git_username +'/repos';
		HTTP.get(urlToGet, {}, function(error, response) {
			if(error) {
				setRepositoryCachingError(error);
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
		check(repositoryFullName, String);
		check(callback, Function);

		getRepositoryDataByType(repositoryFullName, callback, 'watchers');
	}

	api.getForks = function(repositoryFullName, callback) {
		check(repositoryFullName, String);
		check(callback, Function);

		getRepositoryDataByType(repositoryFullName, callback, 'forks');
	}

	api.getStargazers = function(repositoryFullName, callback) {
		check(repositoryFullName, String);
		check(callback, Function);

		getRepositoryDataByType(repositoryFullName, callback, 'stargazers');
	}

	api.getContributors = function(repositoryFullName, callback) {
		check(repositoryFullName, String);
		check(callback, Function);

		getRepositoryDataByType(repositoryFullName, callback, 'contributors');
	}

	return api;
}());