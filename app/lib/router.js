Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
	name: 'home'
});

Router.route('/:git_username', {
	name: 'repositoriesList',
	action: function() { 
		this.state.set('git_username', this.params.git_username);
		this.render();
	}
});