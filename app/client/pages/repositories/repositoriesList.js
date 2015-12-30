Template.repositoriesList.onCreated(function() {

	// cache repositories of searched users - run everytime git_username changes
	this.autorun(function() { 
		Session.set('repositoryError', '');
		Session.set('currentExactUserName', '');
		var controller = Iron.controller();

		Apagado.GitHubApi.getExactUserName(controller.state.get('git_username'), function(userName) { 
			Session.set('currentExactUserName', userName);

		 	if(!Apagado.Cacher.isUserRepositoriesCached(userName)) { 
				Apagado.GitHubApi.getRepositories(userName, Apagado.Cacher.cacheRepositories);
			}

			if(!Apagado.Cacher.isUserCached(userName)) { 
				Apagado.GitHubApi.getUser(userName, Apagado.Cacher.cacheUser);
			}
			
		});		
	});
});

Template.repositoriesList.helpers({
	git_username: function() {
		var git_username = Session.get('currentExactUserName');
		if(!git_username) { 
			return;
		}

		return git_username;
	},
	repositories: function() {
		var git_username = Session.get('currentExactUserName');
		if(!git_username) { 
			return;
		}

		return Apagado.Cacher.Repositories.find({ 'owner.login': git_username }, { sort: { repo_score: -1 }});
	},
	user: function() { 
		var git_username = Session.get('currentExactUserName');
		if(!git_username) { 
			return;
		}

		return Apagado.Cacher.Users.findOne({ 'login': git_username });
	},
	pageReady: function() { 
		var git_username = Session.get('currentExactUserName');
		var usersWithRepositoriesArray = Session.get('usersWithRepositoriesCached');
		var usersArray = Session.get('usersCached');
		if(!git_username || !usersWithRepositoriesArray || !usersArray) { 
			return false;
		}

		return _.contains(usersArray, git_username) && _.contains(usersWithRepositoriesArray, git_username);
	},
	hasRepositories: function() { 
		var git_username = Session.get('currentExactUserName');
		if(!git_username) { 
			return;
		}

		return Apagado.Cacher.Repositories.find({ 'owner.login': git_username }, { sort: { repo_score: -1 }}).count() != 0;
	},
	repositoryError: function() {
		return Session.get('repositoryError');
	}
});