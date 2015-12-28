Apagado.GitHubApi = (function() {
	var api = {};

	var getRepositoryDataByType = function(repositoryFullName, callback, type) {
		check(repositoryFullName, String);
		check(callback, Function);

		HTTP.get('https://api.github.com/repos/'+ repositoryFullName +'/'+ type, {}, function(error, response) {
			if(error) {
				return;
			}

			callback(response.data, repositoryFullName);
		});
	};

	api.getRepositories = function(git_username, callback) {
		check(git_username, String);
		check(callback, Function);

		HTTP.get('https://api.github.com/users/'+ git_username +'/repos', {}, function(error, response) {
			if(error) {
				return;
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

	// api.getDataByUrl = function(url, callback) {
	// 	check(url);
	// 	check(callback, Function);

	// 	HTTP.get(url, {}, function(error, response) {
	// 		if(error) {
	// 			return;
	// 		}

	// 		callback(error, response.data, git_username, repositoryName);
	// 	});
	// };

	return api;
}());