Apagado.Caching = (function() {
	var api = {};

	const REPOSITORY_ATTRIBUTES = ['full_name', 'owner', 'name', 'created_at', 'updated_at', 'language', 'watchers', 'forks', 'stargazers_count'];

	api.Repositories = new Mongo.Collection(null);

	Session.set('usersWithRepositoriesCached', []);

	var setUserRepositoriesCached = function(git_username) { 
		var currentUsersArray = Session.get('usersWithRepositoriesCached');

		// Use union instead of push to avoid duplicates
		var updatedUsersArray = _.union(currentUsersArray, [ git_username ]);
		Session.set('usersWithRepositoriesCached', updatedUsersArray);
	}

	api.isUserRepositoriesCached = function(git_username) { 
		var usersArray = Session.get('usersWithRepositoriesCached');
		return _.contains(usersArray, git_username);
	}

	api.cacheRepositories = function(error, repositories, git_username) {
		if(error) {
			return;
		}

		if(Array.isArray(repositories)) { 
			repositories.forEach(function(repository) { 
				var minimalistic_repository = _.pick(repository, REPOSITORY_ATTRIBUTES);

				_.extend(minimalistic_repository, { repo_score:  minimalistic_repository.forks + 2 * minimalistic_repository.stargazers_count + minimalistic_repository.watchers });

				api.Repositories.insert(minimalistic_repository);
			});
		}

		setUserRepositoriesCached(git_username);
		return;
	}

	return api;
}());



