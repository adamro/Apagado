Template.repositoriesList.onCreated(function() {

	// cache repositories of searched users - run everytime git_username changes
	this.autorun(function() { 
		Session.set('repositoryError', '');
		var controller = Iron.controller();
		var git_username = controller.state.get('git_username');

		if(!Apagado.Cacher.isUserRepositoriesCached(git_username)) { 
			Apagado.GitHubApi.getRepositories(git_username, Apagado.Cacher.cacheRepositories);
		}

		if(!Apagado.Cacher.isUserCached(git_username)) { 
			Apagado.GitHubApi.getUser(git_username, Apagado.Cacher.cacheUser);
		}
	});
});

Template.repositoriesList.helpers({
	git_username: function() {
		return Iron.controller().state.get('git_username');
	},
	repositories: function() {
		var git_username = Iron.controller().state.get('git_username');
		return Apagado.Cacher.Repositories.find({ 'owner.login': git_username }, { sort: { repo_score: -1 }});
	},
	user: function() { 
		var git_username = Iron.controller().state.get('git_username');
		return Apagado.Cacher.Users.findOne({ 'login': git_username });
	},
	pageReady: function() { 
		var git_username = Iron.controller().state.get('git_username');
		var usersWithRepositoriesArray = Session.get('usersWithRepositoriesCached');
		var usersArray = Session.get('usersCached');
		return _.contains(usersArray, git_username) && _.contains(usersWithRepositoriesArray, git_username);
	},
	hasRepositories: function() { 
		var git_username = Iron.controller().state.get('git_username');
		return Apagado.Cacher.Repositories.find({ 'owner.login': git_username }, { sort: { repo_score: -1 }}).count() != 0;
	},
	repositoryError: function() {
		return Session.get('repositoryError');
	}
});