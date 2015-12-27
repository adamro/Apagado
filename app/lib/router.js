Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
	name: 'home'
});

Router.route('/:git_user_name', {
	name: 'repositoriesList'
});