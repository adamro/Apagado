Apagado.GitHubApi = (function() {
	var api = {};

	api.getRepositories = function(git_username, callback) {
		check(git_username, String);
		check(callback, Function);

		HTTP.get('https://api.github.com/users/'+ git_username +'/repos', {}, function(error, response) {
			if(error) {
				return;
			}

			callback(error, response.data, git_username);
		});
	};

	return api;
}());