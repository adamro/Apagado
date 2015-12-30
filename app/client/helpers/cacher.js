Apagado.Cacher = (function() {
	var api = {};

	const REPOSITORY_ATTRIBUTES = ['id', 'full_name', 'url', 'html_url', 'owner', 'name', 'description', 'created_at', 'updated_at', 'language', 'watchers', 'forks', 'stargazers_count', 'fork'];
	const BASIC_USER_ATTRIBUTES = ['login', 'id', 'html_url'];
	const USER_ATTRIBUTES = ['login', 'id', 'html_url', 'followers', 'following', 'email', 'created_at', 'name', 'company', 'location', 'avatar_url'];

	const REPOSITORY_DATA_TYPES = ['Watchers', 'Forks', 'Stargazers', 'Contributors'];

	/* Caching Collections initializations */
	api.Repositories = new Mongo.Collection(null);
	api.Users = new Mongo.Collection(null);

	/* Sessions cache mapping initialization */
	var createSessionsForRepositoryDataTypes = function() { 
		REPOSITORY_DATA_TYPES.forEach(function(dataType) { 
			Session.set('repositoryFullNameWith' + dataType + 'Cached');
		});
	}

	Session.set('usersWithRepositoriesCached', []);
	Session.set('usersCached', []);
	createSessionsForRepositoryDataTypes();

	var insertStringToSessionWithArray = function(sessionName, string) { 
		var currentArray = Session.get(sessionName);

		// Use union instead of push to avoid duplicates
		var updatedArray = _.union(currentArray, [ string ]);
		Session.set(sessionName, updatedArray);
	}

	/* Session cache mapping private methods */

	var setUserRepositoriesCached = function(git_username) { 
		insertStringToSessionWithArray('usersWithRepositoriesCached', git_username);
	}

	var setUserCached = function(git_username) { 
		insertStringToSessionWithArray('usersCached', git_username);
	}

	var setRepositoryFullNameCachedByType = function(repositoryFullName, dataType) { 
		insertStringToSessionWithArray('repositoryFullNameWith' + dataType + 'Cached', repositoryFullName);
	}

	var isStringInSessionArray = function(sessionName, string) { 
		var sessionArray = Session.get(sessionName);
		return _.contains(sessionArray, string);
	}

	/* Is cached getters */
	api.isUserRepositoriesCached = function(git_username) { 
		return isStringInSessionArray('usersWithRepositoriesCached', git_username);
	}

	api.isUserCached = function(git_username) { 
		return isStringInSessionArray('usersCached', git_username);
	}

	api.isFullNameRepositoryWatchersCached = function(repositoryFullName) { 
		return isStringInSessionArray('repositoryFullNameWithWatchersCached', repositoryFullName);
	}

	api.isFullNameRepositoryForksCached = function(repositoryFullName) { 
		return isStringInSessionArray('repositoryFullNameWithForksCached', repositoryFullName);
	}

	api.isFullNameRepositoryStargazersCached = function(repositoryFullName) { 
		return isStringInSessionArray('repositoryFullNameWithStargazersCached', repositoryFullName);
	}

	api.isFullNameRepositoryContributorsCached = function(repositoryFullName) { 
		return isStringInSessionArray('repositoryFullNameWithContributorsCached', repositoryFullName);
	}

	/* Caching in collections methods */

	api.cacheRepositories = function(repositories, git_username) {
		if(Array.isArray(repositories)) {
			var first = true;
			repositories.forEach(function(repository) {
				var relevantRepository = _.pick(repository, REPOSITORY_ATTRIBUTES);

				_.extend(relevantRepository, { repo_score:  relevantRepository.forks + 2 * relevantRepository.stargazers_count + relevantRepository.watchers });

				// Used upsert instead of insert to avoid duplicates from caching Forks
				api.Repositories.upsert({id: relevantRepository.id }, { $setOnInsert: relevantRepository });
			});
		}

		setUserRepositoriesCached(git_username);
		return;
	}

	api.cacheUser = function(user) { 
		var relevantUser = _.pick(user, USER_ATTRIBUTES);
		api.Users.upsert({id: relevantUser.id }, relevantUser);
		setUserCached(user.login);
	}

	api.cacheForks = function(forks, repositoryFullName) {
		if(Array.isArray(forks)) { 
			forks.forEach(function(fork) { 
				var relevantFork = _.pick(fork, REPOSITORY_ATTRIBUTES);
				_.extend(relevantFork, { repo_score:  relevantFork.forks + 2 * relevantFork.stargazers_count + relevantFork.watchers });

				// Used upsert instead of insert to avoid duplicates from caching user's Repositories
				api.Repositories.upsert({id: relevantFork.id }, { $setOnInsert: relevantFork, $addToSet: { fork_of: repositoryFullName }});
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Forks');
		return;
	}

	api.cacheWatchers = function(watchers, repositoryFullName) {
		if(Array.isArray(watchers)) { 
			watchers.forEach(function(watcher) { 
				var relevantWatcher = _.pick(watcher, BASIC_USER_ATTRIBUTES);

				// Used upsert instead of insert to avoid duplicates from caching Stargazers / Contributors
				api.Users.upsert({id: relevantWatcher.id}, { $setOnInsert: relevantWatcher, $addToSet: { watching: repositoryFullName } });
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Watchers');
		return;
	}

	api.cacheStargazers = function(stargazers, repositoryFullName) {
		if(Array.isArray(stargazers)) { 
			stargazers.forEach(function(stargazer) { 
				var relevantStargazer = _.pick(stargazer, BASIC_USER_ATTRIBUTES);

				// Used upsert instead of insert to avoid duplicates from caching Watchers / Contributors
				api.Users.upsert({id: relevantStargazer.id}, { $setOnInsert: relevantStargazer, $addToSet: { stargazering: repositoryFullName } });
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Stargazers');
		return;
	}	

	api.cacheContributors = function(contributors, repositoryFullName) {
		if(Array.isArray(contributors)) { 
			contributors.forEach(function(contributor) { 
				var relevantContributor = _.pick(contributor, BASIC_USER_ATTRIBUTES);

				// Using '?' to chain contributions to repository name based on GitHub naming conventions: 
				// "**username** : min 4 character, max 30 characters, must match the regular expression [a-z0-9_].""
				// "Repository names must match the regular expression [a-zA-Z0-9-_.]""
				var contributionToThisRepository = repositoryFullName + '?' + contributor.contributions;
			
				// Used upsert instead of insert to avoid duplicates from caching Stargazers / Watchers
				api.Users.upsert({id: relevantContributor.id}, { $setOnInsert: relevantContributor, $addToSet: { contributed_to: repositoryFullName, contributions: contributionToThisRepository } });
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Contributors');
		return;
	}	

	return api;
}());



