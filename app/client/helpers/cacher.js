Apagado.Cacher = (function() {
	var api = {};

	const REPOSITORY_ATTRIBUTES = ['full_name', 'owner', 'name', 'description', 'created_at', 'updated_at', 'language', 'watchers', 'forks', 'stargazers_count'];
	const WATCHER_ATTRIBUTES = ['login', 'id', 'html_url'];
	const STARGAZER_ATTRIBUTES = ['login', 'id', 'html_url'];
	const CONTRIBUTOR_ATTRIBUTES = ['login', 'id', 'contributions', 'html_url'];
	const REPOSITORY_DATA_TYPES = ['Watchers', 'Forks', 'Stargazers', 'Contributors'];

	/* Collections caches initializations */

	api.Repositories = new Mongo.Collection(null);
	api.Watchers = new Mongo.Collection(null);
	api.Forks = new Mongo.Collection(null);
	api.Stargazers = new Mongo.Collection(null);
	api.Contributors = new Mongo.Collection(null);

	/* Sessions cache mapping initialization */

	var createSessionsForRepositoryDataTypes = function() { 
		REPOSITORY_DATA_TYPES.forEach(function(dataType) { 
			Session.set('repositoryFullNameWith' + dataType + 'Cached');
		});
	}

	Session.set('usersWithRepositoriesCached', []);
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
			repositories.forEach(function(repository) { 
				var relevantRepository = _.pick(repository, REPOSITORY_ATTRIBUTES);

				_.extend(relevantRepository, { repo_score:  relevantRepository.forks + 2 * relevantRepository.stargazers_count + relevantRepository.watchers });

				api.Repositories.insert(relevantRepository);
			});
		}

		setUserRepositoriesCached(git_username);
		return;
	}

	api.cacheWatchers = function(watchers, repositoryFullName) {
		if(Array.isArray(watchers)) { 
			watchers.forEach(function(watcher) { 
				var relevantWatcher = _.pick(watcher, WATCHER_ATTRIBUTES);

				api.Watchers.insert(relevantWatcher);
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Watchers');
		return;
	}

	api.cacheForks = function(forks, repositoryFullName) {
		if(Array.isArray(forks)) { 
			forks.forEach(function(fork) { 
				var relevantFork = _.pick(fork, REPOSITORY_ATTRIBUTES);

				api.Forks.insert(relevantFork);
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Forks');
		return;
	}

	api.cacheStargazers = function(stargazers, repositoryFullName) {
		if(Array.isArray(stargazers)) { 
			stargazers.forEach(function(stargazer) { 
				var relevantStargazer = _.pick(stargazer, STARGAZER_ATTRIBUTES);

				api.Stargazers.insert(relevantStargazer);
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Stargazers');
		return;
	}	

	api.cacheContributors = function(contributors, repositoryFullName) {
		if(Array.isArray(contributors)) { 
			contributors.forEach(function(contributor) { 
				var relevantContributor = _.pick(contributor, CONTRIBUTOR_ATTRIBUTES);

				api.Contributors.insert(relevantContributor);
			});
		}

		setRepositoryFullNameCachedByType(repositoryFullName, 'Contributors');
		return;
	}	

	return api;
}());



