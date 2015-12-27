Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
	name: 'home'
});

Router.route('/:git_username', {
	name: 'repositoriesList'
});