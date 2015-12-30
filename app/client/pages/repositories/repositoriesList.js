Template.repositoriesList.onCreated(function() {

	// cache repositories of searched users - run everytime git_username changes
	this.autorun(function() { 
		Session.set('repositoryError', '');
		var controller = Iron.controller();
		var git_username = controller.state.get('git_username');

		if(!Apagado.Cacher.isUserRepositoriesCached(git_username)) { 
			Apagado.GitHubApi.getRepositories(git_username, Apagado.Cacher.cacheRepositories);
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
	repositoriesCached: function() {
		var usersArray = Session.get('usersWithRepositoriesCached');
		return _.contains(usersArray, Iron.controller().state.get('git_username'));
	},
	hasRepositories: function() { 
		var git_username = Iron.controller().state.get('git_username');
		return Apagado.Cacher.Repositories.find({ 'owner.login': git_username }, { sort: { repo_score: -1 }}).count() != 0;
	},
	repositoryError: function() {
		return Session.get('repositoryError');
	}
});